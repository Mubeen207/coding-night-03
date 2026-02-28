import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Client-side par pehle se maujood data uthao
    const storedUser = localStorage.getItem("hospital_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed.user);
        setRole(parsed.role);
      } catch (e) {
        console.error("Storage error", e);
      }
    }

    // 2. Firebase Listener
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Firestore se role fetch karein
          const snap = await getDoc(doc(db, "users", currentUser.uid));
          
          if (snap.exists()) {
            const userRole = snap.data().role;
            const userDataToStore = {
              user: { uid: currentUser.uid, email: currentUser.email },
              role: userRole,
            };

            localStorage.setItem("hospital_user", JSON.stringify(userDataToStore));
            setUser(currentUser);
            setRole(userRole);
          } else {
            // Agar signup ke foran baad snap na mile (thori dair lagti hai)
            setUser(currentUser);
            // setRole(null) ya koi default role
          }
        } catch (err) {
          console.error("Firestore error:", err);
        }
      } else {
        localStorage.removeItem("hospital_user");
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {/* Pro-tip: Hackathon mein 'Loading...' ki jagah 
         aik acha sa spinner ya hospital logo dikha dein 
      */}
      {!loading ? (
        children
      ) : (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Setting up your dashboard...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);