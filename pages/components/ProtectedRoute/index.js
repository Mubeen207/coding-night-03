import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../lib/authContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (allowedRole && role !== allowedRole) {
      router.push("/dashboard");
    }
  }, [user, role]);

  if (!user) return <p>Loading...</p>;

  return children;
}