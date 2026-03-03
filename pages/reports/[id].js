import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function PatientReport() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchReport = async () => {
      const docSnap = await getDoc(doc(db, "appointments", id));
      if (docSnap.exists()) setData(docSnap.data());
    };
    fetchReport();
  }, [id]);

  if (!data) return <p className="text-center p-10">Loading Report...</p>;

  return (
    <div className="max-w-4xl mx-auto my-10 p-10 bg-white border shadow-lg font-serif text-black" id="print-area">
      {/* Header */}
      <div className="flex justify-between border-b-2 border-blue-600 pb-5 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-blue-600">MUBEEN HOSPITAL</h1>
          <p className="text-sm text-gray-500">Official Medical Diagnosis Report</p>
        </div>
        <div className="text-right text-sm">
          <p>Date: {new Date().toLocaleDateString()}</p>
          <p>Report ID: {id.substring(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10 bg-gray-50 p-5 rounded">
        <div>
          <p className="text-xs uppercase font-bold text-gray-500">Patient Name</p>
          <p className="text-lg font-bold">{data.patientName}</p>
        </div>
        <div>
          <p className="text-xs uppercase font-bold text-gray-500">Doctor</p>
          <p className="text-lg font-bold">Dr. {data.doctorName || "Staff"}</p>
        </div>
      </div>

      <div className="mb-10 min-h-75">
        <h3 className="text-xl font-bold border-b mb-4">Clinical Findings & Notes</h3>
        <p className="leading-relaxed text-gray-800">
          {data.notes || "No clinical notes provided for this session."}
        </p>
      </div>

      <div className="mt-20 flex justify-between items-end">
        <div className="text-xs text-gray-400">
          * This is a computer-generated report and requires no physical signature.
        </div>
        <div className="text-center border-t border-black pt-2 w-48">
          <p className="font-bold">Authorized Signature</p>
        </div>
      </div>

      <button 
        onClick={() => window.print()} 
        className="mt-10 bg-blue-600 text-white px-6 py-2 rounded no-print"
      >
        Print / Download PDF
      </button>

      <style jsx global>{`
        @media print {
          .no-print { display: none; }
          body { background: white; }
          .shadow-lg { shadow: none; }
        }
      `}</style>
    </div>
  );
}