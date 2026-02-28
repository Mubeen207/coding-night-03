import { useAuth } from "../lib/authContext";
import { auth, db } from "../lib/firebase";
import { signOut } from "firebase/auth";
import ProtectedRoute from "../components/ProtectedRoute";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

export default function Dashboard() {
  const { role, user } = useAuth();
  const [stats, setStats] = useState({ patients: 0, doctors: 0, appointments: 0 });

  // 1. Admin ke liye Stats fetch karein
  useEffect(() => {
    if (role === "admin") {
      const fetchStats = async () => {
        const pSnap = await getDocs(collection(db, "patients"));
        const dSnap = await getDocs(collection(db, "users")); // Assuming doctors are in users with role
        const aSnap = await getDocs(collection(db, "appointments"));
        
        setStats({
          patients: pSnap.size,
          doctors: dSnap.docs.filter(d => d.data().role === 'doctor').length,
          appointments: aSnap.size
        });
      };
      fetchStats();
    }
  }, [role]);

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("hospital_user");
    window.location.href = "/login";
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-black font-sans">
        
        {/* TOP NAVBAR */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm mb-8 border-b-4 border-blue-600">
          <div>
            <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tight">
              Hospital <span className="text-blue-600">Pro</span> System
            </h1>
            <p className="text-gray-500 text-sm font-medium">Welcome back, <span className="capitalize text-blue-500">{role}</span></p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="hidden md:block text-xs font-bold bg-gray-100 p-2 rounded text-gray-600">{user?.email}</span>
            <button onClick={logout} className="bg-red-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-red-600 transition shadow-lg shadow-red-100">Logout</button>
          </div>
        </div>

        {/* 👑 ADMIN VIEW: STATISTICS */}
        {role === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard title="Total Patients" count={stats.patients} icon="👥" color="text-blue-600" />
            <StatCard title="Total Doctors" count={stats.doctors} icon="👨‍⚕️" color="text-green-600" />
            <StatCard title="Total Appointments" count={stats.appointments} icon="📅" color="text-purple-600" />
          </div>
        )}

        {/* ACTION PANELS BASED ON ROLE */}
        <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
          🚀 Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* --- ADMIN ACTIONS --- */}
          {role === "admin" && (
            <>
              <ActionCard title="Manage Doctors" desc="Add or Remove Staff" link="/users/manage" icon="🏥" color="bg-red-500" />
              <ActionCard title="Patient Records" desc="Full Database Access" link="/patients/manage" icon="📁" color="bg-blue-500" />
              <ActionCard title="System Reports" desc="Check Activity Logs" link="/reports" icon="📊" color="bg-gray-800" />
              <ActionCard title="All Appointments" desc="Overview & Control" link="/appointments" icon="🗓️" color="bg-orange-500" />
            </>
          )}

          {/* --- DOCTOR ACTIONS --- */}
          {role === "doctor" && (
            <>
              <ActionCard title="My Patients" desc="Add/View Medical History" link="/patients/manage" icon="🧬" color="bg-purple-600" />
              <ActionCard title="New Prescription" desc="Write & Print PDF" link="/prescriptions/add" icon="💊" color="bg-pink-500" />
              <ActionCard title="Appointment List" desc="Check Your Schedule" link="/appointments" icon="🕒" color="bg-indigo-600" />
              <ActionCard title="Diagnosis History" desc="Past Records" link="/history" icon="📓" color="bg-teal-600" />
            </>
          )}

          {/* --- RECEPTIONIST ACTIONS --- */}
          {role === "receptionist" && (
            <>
              <ActionCard title="Book Appointment" desc="Manage Schedule" link="/appointments/new" icon="✍️" color="bg-green-600" />
              <ActionCard title="Register Patient" desc="Add New Admissions" link="/patients/manage" icon="📝" color="bg-emerald-500" />
              <ActionCard title="Queue Manager" desc="Patient Flow Control" link="/queue" icon="🚶" color="bg-cyan-600" />
            </>
          )}

          {/* --- PATIENT ACTIONS --- */}
          {role === "patient" && (
            <>
              <ActionCard title="My Profile" desc="Personal Health Record" link={`/patients/${user?.uid}`} icon="👤" color="bg-orange-500" />
              <ActionCard title="My Prescriptions" desc="View & Download" link="/prescriptions" icon="📜" color="bg-sky-500" />
              <ActionCard title="Book Doctor" desc="New Appointment" link="/appointments/book" icon="🏥" color="bg-rose-500" />
            </>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}

// 📊 COMPONENT: ADMIN STAT CARD
function StatCard({ title, count, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">{title}</p>
        <h3 className={`text-4xl font-black mt-1 ${color}`}>{count}</h3>
      </div>
      <div className="text-4xl opacity-40">{icon}</div>
    </div>
  );
}

// 🖱️ COMPONENT: ACTION CARD
function ActionCard({ title, desc, link, icon, color }) {
  return (
    <Link href={link}>
      <div className={`${color} p-6 rounded-2xl text-white shadow-xl cursor-pointer hover:scale-105 transition-all duration-300 relative overflow-hidden group`}>
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:rotate-12 transition-transform">
          {icon}
        </div>
        <div className="text-2xl mb-4">{icon}</div>
        <h3 className="text-xl font-black mb-1">{title}</h3>
        <p className="text-xs opacity-80 leading-relaxed">{desc}</p>
      </div>
    </Link>
  );
}