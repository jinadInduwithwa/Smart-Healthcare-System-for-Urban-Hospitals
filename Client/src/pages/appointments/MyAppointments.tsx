import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { getMyAppointments } from "@/utils/api"; // must return { data: [...] }

type ApiAppt = {
  _id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  room?: string;
  doctor: {
    specialization: string; // e.g. "Psychiatrist"
    userId?: { firstName?: string; lastName?: string };
  };
  availability: { date: string; startTime: string; endTime: string }; // date = ISO (midnight), times "HH:mm"
};

type Event = {
  id: string;
  title: string;
  subtitle?: string;
  resource?: ApiAppt;
  start: Date;
  end: Date;
  color: string; // Tailwind-safe
};

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function combineDateTime(dateISO: string, hhmm: string) {
  // dateISO at 00:00, hhmm = "15:30"
  const d = new Date(dateISO);
  const [h, m] = hhmm.split(":").map(Number);
  d.setHours(h, m, 0, 0);
  return d;
}

function nameOf(doctor?: { userId?: { firstName?: string; lastName?: string } }) {
  const f = doctor?.userId?.firstName ?? "Dr.";
  const l = doctor?.userId?.lastName ?? "";
  return `${f} ${l}`.trim();
}

const colorBySpecialty: Record<string, string> = {
  Psychiatrist: "#1d4ed8", // blue
  Dermatologist: "#10b981", // green
  "General OPD": "#10b981",
  Cardiologist: "#ef4444",  // red
  Neurology: "#8b5cf6",     // violet
};

export default function MyAppointments() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyAppointments(); // -> { data: ApiAppt[] }
        const items: ApiAppt[] = res?.data ?? [];

        const evs: Event[] = items
          .filter(a => a.status !== "CANCELLED")
          .map((a) => {
            const start = combineDateTime(a.availability.date, a.availability.startTime);
            const end = combineDateTime(a.availability.date, a.availability.endTime);
            const title = `Appointment with ${nameOf(a.doctor)}${a.room ? ` at ${a.room}` : ""}`;
            const subtitle = a.doctor?.specialization || "";
            const color = colorBySpecialty[subtitle] || "#0ea5e9";
            return { id: a._id, title, subtitle, start, end, resource: a, color };
          });

        setEvents(evs);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Banner if there is an appointment today
  const todayBannerText = useMemo(() => {
    const today = new Date();
    const todayAppt = events.find((e) => isSameDay(e.start, today));
    if (!todayAppt) return "";
    return `You have an appointment scheduled today, ${format(todayAppt.start, "do MMMM yyyy")}.`;
  }, [events]);

  // Style for events (rounded pills & brand colors)
  const eventPropGetter = (event: Event) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: "10px",
        border: "none",
        color: "white",
        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        paddingInline: 6,
      },
    };
  };

  // Custom event rendering (title + subtitle)
  const EventComp = ({ event }: { event: Event }) => (
    <div className="leading-tight">
      <div className="text-xs md:text-[13px] font-semibold">{event.title}</div>
      {event.subtitle && <div className="text-[11px] opacity-90">{event.subtitle}</div>}
    </div>
  );

  return (
    <div className="px-6 md:px-8 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">My Appointments</h1>
        <button
          type="button"
          className="px-4 py-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition"
          onClick={() => {
            // TODO: open reschedule modal
            alert("Open reschedule flow");
          }}
        >
          Reschedule an appointment
        </button>
      </div>

      {todayBannerText && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 px-4 py-3">
          {todayBannerText}
        </div>
      )}

      {/* View switcher like Day / Week / Month */}
      <div className="mb-3 flex gap-2">
        {(["day", "week", "month"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1.5 rounded-md text-sm border ${
              view === v
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {v[0].toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-xl border bg-white p-3 shadow-sm">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={date}
          onNavigate={setDate}
          view={view}
          onView={setView}
          components={{ event: EventComp }}
          eventPropGetter={eventPropGetter}
          step={30}
          timeslots={2}
          min={new Date(1970, 1, 1, 8, 0, 0)}   // 08:00
          max={new Date(1970, 1, 1, 20, 0, 0)}  // 20:00
          toolbar={false} // we built our own Day/Week/Month + arrows next line
        />

        {/* Simple arrows + range label below the grid */}
        <div className="flex items-center justify-between mt-3">
          <button
            className="px-2 py-1 text-slate-600 hover:text-slate-900"
            onClick={() => setDate((d) => (view === "month"
              ? new Date(d.getFullYear(), d.getMonth() - 1, 1)
              : new Date(d.getFullYear(), d.getMonth(), d.getDate() - (view === "week" ? 7 : 1))
            ))}
            aria-label="Previous"
          >
            ←
          </button>
          <div className="text-sm text-slate-600">
            {view === "month"
              ? format(date, "MMMM yyyy")
              : view === "week"
              ? `${format(startOfWeek(date, { weekStartsOn: 0 }), "EEEE, do MMMM yyyy")} - ${format(
                  new Date(startOfWeek(date, { weekStartsOn: 0 }).getTime() + 6 * 86400000),
                  "EEEE, do MMMM yyyy"
                )}`
              : format(date, "EEEE, do MMMM yyyy")}
          </div>
          <button
            className="px-2 py-1 text-slate-600 hover:text-slate-900"
            onClick={() => setDate((d) => (view === "month"
              ? new Date(d.getFullYear(), d.getMonth() + 1, 1)
              : new Date(d.getFullYear(), d.getMonth(), d.getDate() + (view === "week" ? 7 : 1))
            ))}
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>

      {loading && <div className="text-slate-500 mt-3">Loading appointments…</div>}
    </div>
  );
}
