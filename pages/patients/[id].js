import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import ProtectedRoute from "../components/ProtectedRoute";

export default function PatientDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // 1. Fetch Patient Info
    const fetchPatient = async () => {
      const docRef = doc(db, "patients", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) setPatient(snap.data());
      setLoading(false);
    };

    // 2. Fetch Timeline (Real-time)
    const q = query(
      collection(db, "medical_history"),
      where("patientId", "==", id),
      orderBy("timestamp", "desc")
    );

    const unsubHistory = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    fetchPatient();
    return () => unsubHistory();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center text-black">Loading Profile...</div>;
  if (!patient) return <div className="h-screen flex items-center justify-center text-red-500 font-bold text-2xl">Patient Not Found!</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 text-black p-6 md:p-12">
        {/* Back Button */}
        <button onClick={() => router.push("/patients")} className="mb-8 flex items-center gap-2 text-blue-600 font-semibold hover:underline">
          ← Back to Patient Directory
        </button>

        <div className="max-w-5xl mx-auto">
          {/* Patient Info Header */}
          <div className="bg-white p-8 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-center border-b-8 border-blue-600 gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900">{patient.name}</h1>
              <div className="flex gap-4 mt-2 text-gray-500 font-medium">
                <span>{patient.gender}</span> • <span>{patient.age} Years</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Diagnosis:</p>
              <p className="text-xl font-bold text-red-600">{patient.disease}</p>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              📅 Medical History Timeline
            </h2>

            {history.length > 0 ? (
              <div className="relative border-l-4 border-blue-100 ml-4 md:ml-8">
                {history.map((event, index) => (
                  <div key={event.id} className="mb-10 ml-8 relative">
                    {/* Circle on Timeline */}
                    <div className="absolute -left-12 mt-1 h-8 w-8 rounded-full bg-blue-600 border-4 border-white shadow-md flex items-center justify-center text-white text-xs">
                       {event.type === "Prescription" ? "💊" : "📋"}
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                      <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
                        {event.timestamp?.toDate().toDateString()}
                      </p>
                      <h3 className="text-xl font-bold text-gray-800">{event.type}</h3>
                      <p className="text-gray-600 mt-2">{event.notes || event.medicine}</p>
                      {event.dosage && (
                        <div className="mt-3 bg-blue-50 p-2 px-4 rounded-lg inline-block text-blue-800 text-sm font-bold">
                          Dosage: {event.dosage}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 text-lg italic">No clinical history found for this patient yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}