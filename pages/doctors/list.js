import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import Link from "next/link";

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "doctor"));
      const querySnapshot = await getDocs(q);
      const doctorsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDoctors(doctorsData);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const toggleBlacklist = async (uid, currentStatus) => {
    const newStatus = currentStatus === "blacklisted" ? "active" : "blacklisted";
    const confirmMsg = newStatus === "blacklisted"
      ? "Are you sure you want to BLACKLIST this doctor?"
      : "Restore access for this doctor?";

    if (confirm(confirmMsg)) {
      try {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, { status: newStatus });
        
        setDoctors(doctors.map(d => d.id === uid ? { ...d, status: newStatus } : d));
        alert(`Doctor is now ${newStatus}!`);
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  if (loading) return <p className="text-center p-10 font-bold">Loading Doctors...</p>;

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctors Directory</h1>
        <Link href="/dashboard/AdminDashboard">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Name</th>
              <th className="p-4 font-semibold text-gray-700">Email</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 font-medium">{doctor.name}</td>
                <td className="p-4 text-gray-600">{doctor.email}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    doctor.status === "blacklisted" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                  }`}>
                    {doctor.status === "blacklisted" ? "Blacklisted" : "Active"}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleBlacklist(doctor.id, doctor.status)}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition shadow-sm ${
                      doctor.status === "blacklisted"
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-900 text-white hover:bg-black"
                    }`}
                  >
                    {doctor.status === "blacklisted" ? "✅ Whitelist / Unblock" : "🚫 Blacklist Doctor"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}