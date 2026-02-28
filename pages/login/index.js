import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { useAuth } from "../lib/authContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth(); // Context se user lo
  const router = useRouter();

  // Agar user pehle se login hai, to use seedha dashboard bhejo
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Note: AuthContext ka onAuthStateChanged khud hi Firestore se role utha kar localStorage mein dal dega
      alert("Login Successful!");
    } catch (error) {
      alert("Invalid credentials: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-black">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-lg shadow-md w-96 flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">Hospital Login</h1>
        <input className="border p-2 rounded" type="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 rounded" type="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm text-center">
          Naya account banayein? <span className="text-blue-500 cursor-pointer" onClick={() => router.push("/signup")}>Signup</span>
        </p>
      </form>
    </div>
  );
}