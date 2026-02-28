import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAuth } from "../lib/authContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Link from "next/link";

export default function AppointmentList() {
  const { role } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Appointments (Real-time)
  useEffect(() => {
    const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Status Change Function (For Doctor/Admin)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "appointments", id), { status: newStatus });
      alert(`Status updated to ${newStatus}`);
    } catch (err) {
      alert("Error updating status");
    }
  };

  // 3. Delete Appointment (For Admin/Receptionist)
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      await deleteDoc(doc(db, "appointments", id));
    }
  };

  if (loading) return <div className="p-10 text-center text-black font-bold">Loading Schedules...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 text-black">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-gray-800 uppercase italic">
              📅 Appointment <span className="text-blue-600">Schedules</span>
            </h1>
            {(role === "admin" || role === "receptionist") && (
              <Link href="/appointments/new">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg transition">
                  + Book New
                </button>
              </Link>
            )}
          </div>

          {/* APPOINTMENTS LIST */}
          <div className="space-y-4">
            {appointments.length > 0 ? (
              appointments.map((app) => (
                <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
                  
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        app.status === 'completed' ? 'bg-green-100 text-green-700' :
                        app.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        app.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {app.status}
                      </span>
                      <p className="text-xs text-gray-400 font-mono">ID: {app.id.slice(0,6)}</p>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 capitalize">{app.patientName}</h3>
                    <p className="text-sm text-gray-500 font-medium">
                      👨‍⚕️ Dr. {app.doctorName} | 📅 {app.date} at {app.time}
                    </p>
                    {app.reason && <p className="text-xs text-gray-400 mt-2 italic">Reason: {app.reason}</p>}
                  </div>

                  {/* Middle: Status Controls (Only for Doctor/Admin) */}
                  {(role === "doctor" || role === "admin") && (
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleStatusChange(app.id, "confirmed")}
                        className="text-[10px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-600 hover:text-white transition"
                      >Confirm</button>
                      <button 
                        onClick={() => handleStatusChange(app.id, "completed")}
                        className="text-[10px] font-bold bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-600 hover:text-white transition"
                      >Mark Completed</button>
                      <button 
                        onClick={() => handleStatusChange(app.id, "cancelled")}
                        className="text-[10px] font-bold bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white transition"
                      >Cancel</button>
                    </div>
                  )}

                  {/* Right: Management (Only for Admin/Receptionist) */}
                  {(role === "admin" || role === "receptionist") && (
                    <div className="flex items-center gap-4 border-l pl-4 border-gray-100">
                       {/* Delete Button */}
                      <button 
                        onClick={() => handleDelete(app.id)}
                        className="text-red-500 hover:text-red-700 transition transform hover:scale-110"
                        title="Delete Appointment"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold">No appointments scheduled yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}