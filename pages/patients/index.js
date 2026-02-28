import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../lib/authContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Link from "next/link";

export default function Patients() {
  const { role } = useAuth();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: "", age: "", gender: "", disease: "", contact: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const canModify = role === "admin" || role === "receptionist";

  // 1. Real-time List Fetching
  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 2. Add or Update Patient
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return alert("Name is required!");

    setLoading(true);
    try {
      if (editId) {
        // Update Logic
        await updateDoc(doc(db, "patients", editId), { ...form });
        setEditId(null);
        alert("Patient Updated!");
      } else {
        // Add Logic
        await addDoc(collection(db, "patients"), {
          ...form,
          createdAt: serverTimestamp(),
        });
        alert("Patient Added!");
      }
      setForm({ name: "", age: "", gender: "", disease: "", contact: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete Patient
  const handleDelete = async (e, id) => {
    e.preventDefault(); // Link click hone se rokne ke liye
    if (window.confirm("Are you sure you want to delete this patient?")) {
      await deleteDoc(doc(db, "patients", id));
    }
  };

  // 4. Start Editing
  const startEdit = (e, p) => {
    e.preventDefault(); // Link click hone se rokne ke liye
    setEditId(p.id);
    setForm({ name: p.name, age: p.age, gender: p.gender, disease: p.disease, contact: p.contact });
    window.scrollTo(0, 0);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6 text-black">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-blue-700">Patient Management</h1>

          {/* --- ADD/EDIT FORM (Only for Admin/Receptionist) --- */}
          {canModify && (
            <div className="bg-white p-6 rounded-2xl shadow-md mb-10 border-t-4 border-blue-600">
              <h2 className="text-xl font-bold mb-4">{editId ? "📝 Edit Patient" : "➕ Register New Patient"}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input className="border p-2 rounded" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                <input className="border p-2 rounded" placeholder="Age" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
                <select className="border p-2 rounded bg-white" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                  <option value="">Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input className="border p-2 rounded" placeholder="Contact" value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} />
                <input className="border p-2 rounded md:col-span-2" placeholder="Disease" value={form.disease} onChange={e => setForm({...form, disease: e.target.value})} />
                <div className="md:col-span-3 flex gap-2">
                  <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold p-2 rounded hover:bg-blue-700 flex-1">
                    {loading ? "Processing..." : editId ? "Update Patient" : "Register Patient"}
                  </button>
                  {editId && (
                    <button onClick={() => {setEditId(null); setForm({name:"", age:"", gender:"", disease:"", contact:""})}} className="bg-gray-400 text-white p-2 rounded">Cancel</button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* --- PATIENT LIST --- */}
          <h2 className="text-2xl font-bold mb-6">📋 Patient Directory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((p) => (
              <div key={p.id} className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition group">
                {/* Link to Detail Page */}
                <Link href={`/patients/${p.id}`}>
                  <div className="cursor-pointer">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.gender} | Age: {p.age}</p>
                    <p className="mt-2 text-red-600 font-medium">Disease: {p.disease}</p>
                    <p className="text-xs text-blue-500 mt-4 font-bold uppercase tracking-wider">View Full History →</p>
                  </div>
                </Link>

                {/* Edit/Delete Buttons (Only for Admin/Receptionist) */}
                {canModify && (
                  <div className="mt-4 pt-4 border-t flex gap-4">
                    <button onClick={(e) => startEdit(e, p)} className="text-blue-600 text-sm font-bold hover:underline">Edit</button>
                    <button onClick={(e) => handleDelete(e, p.id)} className="text-red-500 text-sm font-bold hover:underline">Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}