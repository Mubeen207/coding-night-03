import { useState, useEffect } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../lib/authContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function ManagePatients() {
  const { role } = useAuth();
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: "", age: "", gender: "", disease: "", contact: "" });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Security: Sirf Admin ya Receptionist hi is page ko access karein
  if (role === "doctor" || role === "patient") {
    return <p className="text-center mt-20 text-red-500 font-bold">Access Denied: You don't have permission to manage records.</p>;
  }

  useEffect(() => {
    const q = query(collection(db, "patients"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPatients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateDoc(doc(db, "patients", editId), form);
        setEditId(null);
        alert("Updated Successfully!");
      } else {
        await addDoc(collection(db, "patients"), { ...form, createdAt: serverTimestamp() });
        alert("Added Successfully!");
      }
      setForm({ name: "", age: "", gender: "", disease: "", contact: "" });
    } catch (err) { alert(err.message); }
    setLoading(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6 text-black">
        <h1 className="text-3xl font-bold mb-6">⚙️ Manage Patients Records</h1>
        
        {/* ADD / EDIT FORM */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border-l-8 border-green-500">
          <h2 className="text-xl font-bold mb-4">{editId ? "Edit Patient" : "Register New Patient"}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="border p-2 rounded" placeholder="Age" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
            <select className="border p-2 rounded bg-white" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input className="border p-2 rounded md:col-span-2" placeholder="Disease" value={form.disease} onChange={e => setForm({...form, disease: e.target.value})} />
            <button className="bg-green-600 text-white p-2 rounded font-bold hover:bg-green-700">
              {loading ? "Processing..." : editId ? "Update" : "Save Patient"}
            </button>
          </form>
        </div>

        {/* TABLE VIEW FOR MANAGEMENT */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
              <tr>
                <th className="p-4 border-b">Name</th>
                <th className="p-4 border-b">Disease</th>
                <th className="p-4 border-b">Contact</th>
                <th className="p-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 border-b font-medium">{p.name}</td>
                  <td className="p-4 border-b">{p.disease}</td>
                  <td className="p-4 border-b">{p.contact || "N/A"}</td>
                  <td className="p-4 border-b text-center space-x-4">
                    <button onClick={() => {setEditId(p.id); setForm(p); window.scrollTo(0,0)}} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => deleteDoc(doc(db, "patients", p.id))} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}