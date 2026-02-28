// import { useState, useEffect } from "react";
// import { db } from "../lib/firebase";
// import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
// import { useAuth } from "../lib/authContext";
// import ProtectedRoute from "../components/ProtectedRoute";
// import jsPDF from "jspdf";

// export default function AddPrescription() {
//   const { user } = useAuth();
//   const [patients, setPatients] = useState([]);
//   const [form, setForm] = useState({
//     patientId: "",
//     patientName: "",
//     diagnosis: "",
//     medicines: "",
//     dosage: "",
//     notes: ""
//   });

//   // 1. Fetch Patients for Dropdown
//   useEffect(() => {
//     const fetchPatients = async () => {
//       const snap = await getDocs(collection(db, "patients"));
//       setPatients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     };
//     fetchPatients();
//   }, []);

//   // 2. Professional PDF Generation Logic
//   const generatePDF = (data) => {
//     const doc = new jsPDF();
    
//     // Header Style
//     doc.setFontSize(22);
//     doc.setTextColor(40, 44, 52);
//     doc.text("MEDICAL PRESCRIPTION", 105, 20, { align: "center" });
    
//     doc.setLineWidth(0.5);
//     doc.line(20, 25, 190, 25); // Horizontal Line

//     // Patient & Doctor Info
//     doc.setFontSize(12);
//     doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
//     doc.text(`Doctor: Dr. ${user?.email?.split('@')[0].toUpperCase()}`, 20, 42);
//     doc.text(`Patient Name: ${data.patientName}`, 20, 49);
    
//     // Medical Content
//     doc.setFontSize(14);
//     doc.setTextColor(0, 102, 204);
//     doc.text("Diagnosis:", 20, 65);
//     doc.setFontSize(11);
//     doc.setTextColor(0, 0, 0);
//     doc.text(data.diagnosis || "General Checkup", 20, 72);

//     doc.setFontSize(14);
//     doc.setTextColor(0, 102, 204);
//     doc.text("Rx (Medicines & Dosage):", 20, 85);
//     doc.setFontSize(11);
//     doc.setTextColor(0, 0, 0);
//     doc.text(data.medicines, 20, 92);
//     doc.text(`Dosage: ${data.dosage}`, 20, 100);

//     doc.setFontSize(14);
//     doc.setTextColor(0, 102, 204);
//     doc.text("Special Instructions:", 20, 115);
//     doc.setFontSize(11);
//     doc.setTextColor(0, 0, 0);
//     doc.text(data.notes || "Take rest and drink plenty of water.", 20, 122);

//     // Footer
//     doc.setFontSize(10);
//     doc.setTextColor(150);
//     doc.text("This is a digitally generated prescription.", 105, 280, { align: "center" });

//     doc.save(`Prescription_${data.patientName}.pdf`);
//   };

//   // 3. Save to Database & Generate
//   const handleSave = async (e) => {
//     e.preventDefault();
//     if (!form.patientId || !form.medicines) return alert("Please select patient and add medicine");

//     try {
//       // Save to medical_history for Timeline
//       await addDoc(collection(db, "medical_history"), {
//         ...form,
//         type: "Prescription",
//         doctorEmail: user.email,
//         timestamp: serverTimestamp(),
//       });

//       generatePDF(form); // Download PDF
//       alert("Prescription Saved & Downloaded!");
//       setForm({ patientId: "", patientName: "", diagnosis: "", medicines: "", dosage: "", notes: "" });
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   return (
//     <ProtectedRoute>
//       <div className="min-h-screen bg-gray-50 p-6 md:p-12 text-black">
//         <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
//           <div className="bg-blue-600 p-8 text-white">
//             <h1 className="text-3xl font-black italic">🩺 CREATE PRESCRIPTION</h1>
//             <p className="opacity-80">Fill in the details to generate a professional PDF</p>
//           </div>

//           <form onSubmit={handleSave} className="p-8 space-y-6">
//             {/* Patient Selection */}
//             <div>
//               <label className="block text-sm font-bold mb-2">Select Patient</label>
//               <select 
//                 className="w-full border-2 p-3 rounded-xl bg-white"
//                 onChange={(e) => {
//                   const p = patients.find(x => x.id === e.target.value);
//                   setForm({...form, patientId: p.id, patientName: p.name});
//                 }}
//                 required
//               >
//                 <option value="">-- Choose Patient --</option>
//                 {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//               </select>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input 
//                 className="border-2 p-3 rounded-xl" 
//                 placeholder="Diagnosis (e.g. Viral Fever)" 
//                 value={form.diagnosis}
//                 onChange={e => setForm({...form, diagnosis: e.target.value})}
//               />
//               <input 
//                 className="border-2 p-3 rounded-xl" 
//                 placeholder="Dosage (e.g. 1-0-1 After Meal)" 
//                 value={form.dosage}
//                 onChange={e => setForm({...form, dosage: e.target.value})}
//               />
//             </div>

//             <textarea 
//               className="w-full border-2 p-3 rounded-xl h-24" 
//               placeholder="Medicines List (e.g. Panadol 500mg, Arinac...)" 
//               value={form.medicines}
//               onChange={e => setForm({...form, medicines: e.target.value})}
//               required
//             ></textarea>

//             <textarea 
//               className="w-full border-2 p-3 rounded-xl h-20" 
//               placeholder="Additional Notes or Instructions" 
//               value={form.notes}
//               onChange={e => setForm({...form, notes: e.target.value})}
//             ></textarea>

//             <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 uppercase tracking-widest">
//               Save & Download PDF 📥
//             </button>
//           </form>
//         </div>
//       </div>
//     </ProtectedRoute>
//   );
// }