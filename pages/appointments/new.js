import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../lib/authContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useRouter } from "next/router";

export default function NewAppointment() {
  const { user, role } = useAuth();
  const router = useRouter();
  
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]); // Admin/Receptionist ke liye patients ki list
  const [form, setForm] = useState({
    patientName: "",
    doctorId: "",
    doctorName: "",
    date: "",
    time: "",
    reason: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      // 1. Doctors fetch karein
      const userSnap = await getDocs(collection(db, "users"));
      const docsList = userSnap.docs
        .filter(d => d.data().role === 'doctor')
        .map(d => ({ id: d.id, ...d.data() }));
      setDoctors(docsList);

      // 2. Agar Admin/Receptionist hai to Patients fetch karein select karne ke liye
      if (role !== "patient") {
        const patientSnap = await getDocs(collection(db, "patients"));
        setPatients(patientSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    };
    fetchData();
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "appointments"), {
        ...form,
        status: "pending",
        bookedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      alert("Appointment Scheduled!");
      router.push("/appointments"); // Wapas list par bhej dein
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center text-black">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl border-t-8 border-green-500">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-gray-800">📅 New Appointment</h1>
            <button onClick={() => router.back()} className="text-gray-400 hover:text-black">Cancel</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Patient Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Patient Name</label>
              {role === "patient" ? (
                <input className="w-full border-2 p-3 rounded-xl bg-gray-50" value={user?.email} readOnly />
              ) : (
                <select 
                  className="w-full border-2 p-3 rounded-xl bg-white focus:border-green-500 outline-none"
                  onChange={(e) => setForm({...form, patientName: e.target.value})}
                  required
                >
                  <option value="">Select Registered Patient</option>
                  {patients.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              )}
            </div>

            {/* 2. Doctor Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Doctor</label>
              <select 
                className="w-full border-2 p-3 rounded-xl bg-white focus:border-green-500 outline-none"
                onChange={(e) => {
                  const doc = doctors.find(d => d.id === e.target.value);
                  setForm({...form, doctorId: e.target.value, doctorName: doc?.name || "Doctor"});
                }}
                required
              >
                <option value="">Choose a Specialist</option>
                {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name || d.email}</option>)}
              </select>
            </div>

            {/* 3. Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                <input type="date" className="w-full border-2 p-3 rounded-xl focus:border-green-500" 
                  onChange={(e) => setForm({...form, date: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Time Slot</label>
                <input type="time" className="w-full border-2 p-3 rounded-xl focus:border-green-500" 
                  onChange={(e) => setForm({...form, time: e.target.value})} required />
              </div>
            </div>

            {/* 4. Reason */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Reason for Visit</label>
              <textarea 
                className="w-full border-2 p-3 rounded-xl h-24 focus:border-green-500" 
                placeholder="Briefly describe the issue..."
                onChange={(e) => setForm({...form, reason: e.target.value})}
              ></textarea>
            </div>

            <button type="submit" className="w-full bg-green-600 text-white font-black py-4 rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all uppercase tracking-widest">
              Confirm & Schedule
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}