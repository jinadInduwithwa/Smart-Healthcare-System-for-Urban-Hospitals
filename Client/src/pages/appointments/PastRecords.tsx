// Client/src/pages/appointments/PastRecords.tsx
import { useEffect, useMemo, useState } from "react";
import { format, isBefore } from "date-fns";

type ApiAppt = {
  _id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  room?: string;                 // e.g., "A-09" or "S-09"
  location?: string;             // optional if you store room separately
  doctor: {
    specialization?: string;     // e.g., "General OPD"
    userId?: { firstName?: string; lastName?: string };
  };
  availability: { date: string; startTime: string; endTime: string };
  paymentStatus?: "Successful" | "Failed" | "Pending";
  medicalRecords?: Array<{ _id: string; name: string }>;
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function combineDateTime(dateISO: string, hhmm: string) {
  const d = new Date(dateISO);
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

function doctorName(a: ApiAppt) {
  const f = a.doctor?.userId?.firstName ?? "Dr.";
  const l = a.doctor?.userId?.lastName ?? "";
  return `${f} ${l}`.trim();
}

export default function PastRecords() {
  const [items, setItems] = useState<ApiAppt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPast() {
      try {
        const res = await fetch(`${API_BASE}/appointments/mine`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          credentials: "include",
        });
        const json = await res.json();
        const all: ApiAppt[] = json?.data ?? [];

        // keep only appointments strictly before today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const past = all
          .filter((a) => {
            const start = combineDateTime(a.availability.date, a.availability.startTime);
            return isBefore(start, today);
          })
          .sort((a, b) => {
            const da = combineDateTime(a.availability.date, a.availability.startTime).getTime();
            const db = combineDateTime(b.availability.date, b.availability.startTime).getTime();
            return db - da; // newest past first
          });

        setItems(past);
      } finally {
        setLoading(false);
      }
    }

    fetchPast();
  }, []);

  const rows = useMemo(() => {
    // split into pairs for 2-column layout
    const pairs: ApiAppt[][] = [];
    for (let i = 0; i < items.length; i += 2) {
      pairs.push(items.slice(i, i + 2));
    }
    return pairs;
  }, [items]);

  const handleUpload = (apptId: string) => {
    // TODO: open real file picker and POST to /appointments/:id/records
    alert(`Upload additional file for appointment ${apptId}`);
  };

  return (
    <div className="px-6 md:px-8 py-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-6">My Past Appointments</h1>

      {loading && <div className="text-slate-500">Loading…</div>}

      {!loading && items.length === 0 && (
        <div className="text-slate-500">No past appointments found.</div>
      )}

      {/* Grid rows: each row holds 2 cards like your wireframe */}
      <div className="space-y-6">
        {rows.map((pair, idx) => (
          <div key={idx} className="grid md:grid-cols-2 gap-6">
            {pair.map((a) => {
              const start = combineDateTime(a.availability.date, a.availability.startTime);
              const dateStr = format(start, "dd/MM/yyyy");
              const timeStr = format(start, "h:mma").toLowerCase();

              const cat = a.doctor?.specialization || "—";
              const loc = a.location || a.room || "—";
              const paid = (a.paymentStatus || "Successful") === "Successful";
              const records = a.medicalRecords || [];

              return (
                <div
                  key={a._id}
                  className="rounded-xl border bg-white shadow-sm p-4 md:p-5"
                >
                  {/* Date header */}
                  <div className="text-blue-900 font-semibold text-lg mb-2">{dateStr}</div>

                  {/* Title + details */}
                  <div className="mb-3">
                    <div className="font-semibold text-slate-800">
                      Appointment with {doctorName(a)}
                    </div>
                    <div className="text-sm text-slate-600">Category: {cat}</div>
                    <div className="text-sm text-slate-600">Time: {timeStr}</div>
                    <div className="text-sm text-slate-600">Location: {loc}</div>
                  </div>

                  {/* Payment badge */}
                  <div className="mb-3">
                    <span
                      className={`inline-block text-xs px-2.5 py-1 rounded-full ${
                        paid
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      Payment status: {paid ? "Successful" : (a.paymentStatus || "Pending")}
                    </span>
                  </div>

                  {/* Medical records box */}
                  <div className="mb-3">
                    <div className="font-semibold text-slate-700 mb-2">Medical Records</div>
                    <div className="rounded-lg border-2 border-dashed border-slate-200 p-3 text-sm">
                      {records.length === 0 ? (
                        <div className="text-slate-500">No medical records found</div>
                      ) : (
                        <ul className="list-disc list-inside text-slate-700 space-y-1">
                          {records.map((r) => (
                            <li key={r._id}>{r.name}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Upload button */}
                  <button
                    onClick={() => handleUpload(a._id)}
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border bg-white hover:bg-slate-50"
                  >
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
                    Upload Additional file
                  </button>
                </div>
              );
            })}

            {/* If odd number of cards, keep grid consistent by rendering an empty placeholder on md+ */}
            {pair.length === 1 && <div className="hidden md:block" />}
          </div>
        ))}
      </div>

      {/* Scroll-to-top FAB */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-blue-700 text-white shadow-lg hover:bg-blue-800"
        aria-label="Back to top"
        title="Back to top"
      >
        ↑
      </button>
    </div>
  );
}
