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

export default function StaffList() {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const q = query(
          collection(db, "users"),
          where("role", "==", "receptionist"),
        );
        const querySnapshot = await getDocs(q);
        const staffData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStaffMembers(staffData);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const toggleBlacklist = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "blacklisted" ? "active" : "blacklisted";
    const confirmMsg =
      newStatus === "blacklisted"
        ? "🚫 Are you sure? This staff member will be logged out and blocked immediately."
        : "✅ Restore access for this staff member?";

    if (confirm(confirmMsg)) {
      try {
        const staffRef = doc(db, "users", id);
        await updateDoc(staffRef, { status: newStatus });

        setStaffMembers(
          staffMembers.map((s) =>
            s.id === id ? { ...s, status: newStatus } : s,
          ),
        );
      } catch (error) {
        console.error("Error updating status:", error);
        alert("Failed to update status.");
      }
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full animate-in fade-in duration-500">
        <div className="relative flex items-center gap-4 bg-white/80 backdrop-blur-md px-8 py-5 rounded-4xl shadow-lg border border-slate-100">
          <div className="flex gap-1">
            <span className="w-1.5 h-6 bg-blue-600 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-6 bg-blue-500 rounded-full animate-bounce delay-75"></span>
            <span className="w-1.5 h-6 bg-blue-400 rounded-full animate-bounce delay-150"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-800 font-black text-sm uppercase tracking-widest">
              Retrieving Staff
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse">
              Please Wait...
            </span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-black font-sans">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Staff Management
          </h1>
          <p className="text-gray-500 font-medium">
            Manage Receptionists and Support Personnel
          </p>
        </div>
        <Link href="/dashboard/AdminDashboard">
          <button className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm font-bold text-sm">
            ← Dashboard
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b">
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">
                Name
              </th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">
                Email
              </th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider">
                Status
              </th>
              <th className="p-5 font-bold text-gray-600 text-sm uppercase tracking-wider text-center">
                Security Action
              </th>
            </tr>
          </thead>
          <tbody>
            {staffMembers.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-20 text-center text-gray-400 font-medium italic"
                >
                  No staff members currently in the directory.
                </td>
              </tr>
            ) : (
              staffMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b hover:bg-blue-50/20 transition-colors"
                >
                  <td className="p-5 font-semibold text-gray-800">
                    {member.name}
                  </td>
                  <td className="p-5 text-gray-600 font-medium">
                    {member.email}
                  </td>
                  <td className="p-5">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-sm ${
                        member.status === "blacklisted"
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      {member.status === "blacklisted"
                        ? "● Blacklisted"
                        : "● Active"}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => toggleBlacklist(member.id, member.status)}
                      className={`text-xs font-black uppercase tracking-tighter px-6 py-2.5 rounded-xl transition-all duration-300 shadow-sm border ${
                        member.status === "blacklisted"
                          ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 hover:shadow-emerald-200"
                          : "bg-gray-900 text-white border-gray-800 hover:bg-black hover:shadow-gray-300"
                      }`}
                    >
                      {member.status === "blacklisted"
                        ? "✅ Whitelist Access"
                        : "🚫 Blacklist Access"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-100 p-4 rounded-xl">
        <p className="text-amber-700 text-xs font-bold leading-relaxed">
          <span className="mr-2">⚠️</span>
          ADMIN NOTE: Blacklisting a receptionist will terminate their active
          session and block all subsequent login attempts until they are
          whitelisted.
        </p>
      </div>
    </div>
  );
}
