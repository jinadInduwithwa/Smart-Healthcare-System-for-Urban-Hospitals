import { useEffect, useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { toast } from "react-toastify";
import { getMyAppointments } from "@/utils/api";

type ApiAppt = {
  _id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  room?: string;
  doctor: { specialization?: string; userId?: { firstName?: string; lastName?: string } };
  availability: { date?: string; startTime?: string; endTime?: string } | string; // populated or ObjectId
};

type Event = {
  id: string;
  title: string;
  subtitle?: string;
  start: Date;
  end: Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
};

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

// Build a local Date from UTC-midnight ISO + "HH:mm" safely
function combineUTCDateAndLocalTime(dateISO: string, hhmm: string) {
  const base = new Date(dateISO);
  const y = base.getUTCFullYear();
  const m = base.getUTCMonth();
  const d = base.getUTCDate();
  const [h, mi] = hhmm.split(":").map(Number);
  return new Date(y, m, d, h, mi, 0, 0);
}

const nameOf = (a: ApiAppt) =>
  `${a.doctor?.userId?.firstName ?? "Dr."} ${a.doctor?.userId?.lastName ?? ""}`.trim();

export default function MyAppointments() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getMyAppointments(); // -> { data: ApiAppt[] }
        const items: ApiAppt[] = res?.data ?? [];

        const mapped: Event[] = items
          .filter((a) => a.status !== "CANCELLED")
          .map((a) => {
            const av = typeof a.availability === "string" ? null : a.availability;
            if (!av?.date || !av?.startTime || !av?.endTime) return null; // backend not populated yet
            return {
              id: a._id,
              title: `Appointment with ${nameOf(a)}${a.room ? ` at ${a.room}` : ""}`,
              subtitle: a.doctor?.specialization || "",
              start: combineUTCDateAndLocalTime(av.date, av.startTime),
              end: combineUTCDateAndLocalTime(av.date, av.endTime),
              status: a.status,
            };
          })
          .filter(Boolean) as Event[];

        setEvents(mapped);

        // Jump calendar to the week that contains the first event (if any)
        if (mapped.length > 0) setDate(mapped[0].start);
      } catch (e: any) {
        const msg = e?.message || "Failed to load appointments";
        toast.error(msg);
        if (msg.toLowerCase().includes("unauthorized")) {
          // optional: redirect to sign-in
          // window.location.href = "/signin";
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayBanner = useMemo(() => {
    const today = new Date();
    const e = events.find((ev) => isSameDay(ev.start, today));
    return e ? `You have an appointment scheduled today, ${format(e.start, "do MMMM yyyy")}.` : "";
  }, [events]);

  const eventPropGetter = (ev: Event) => {
    const bg = ev.status === "CONFIRMED" ? "#22c55e" : "#2563eb"; // green confirmed, blue pending
    return {
      style: {
        backgroundColor: bg,
        color: "white",
        borderRadius: "10px",
        border: "none",
        padding: "2px 6px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
      },
    };
  };

  const EventComp = ({ event }: { event: Event }) => (
    <div className="leading-tight">
      <div className="text-xs md:text-[13px] font-semibold">{event.title}</div>
      {/* @ts-ignore */}
      {event.subtitle && <div className="text-[11px] opacity-90">{event.subtitle}</div>}
    </div>
  );

  const goPrev = () =>
    setDate((d) =>
      view === "month"
        ? new Date(d.getFullYear(), d.getMonth() - 1, 1)
        : new Date(d.getFullYear(), d.getMonth(), d.getDate() - (view === "week" ? 7 : 1))
    );
  const goNext = () =>
    setDate((d) =>
      view === "month"
        ? new Date(d.getFullYear(), d.getMonth() + 1, 1)
        : new Date(d.getFullYear(), d.getMonth(), d.getDate() + (view === "week" ? 7 : 1))
    );

  return (
    <div className="px-6 md:px-8 py-6 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-800">My Appointments</h1>
        <button
          type="button"
          className="px-4 py-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 transition"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>

      {todayBanner && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 px-4 py-3">
          {todayBanner}
        </div>
      )}

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
          min={new Date(1970, 0, 1, 8, 0, 0)}          // 08:00
          max={new Date(1970, 0, 1, 22, 0, 0)}         // 22:00 (shows 8:30 PM)
          scrollToTime={new Date(1970, 0, 1, 18, 0)}   // optional: auto-scroll toward evening
          toolbar={false}
          style={{ height: 650 }}
        />

        <div className="flex items-center justify-between mt-3">
          <button className="px-2 py-1 text-slate-600 hover:text-slate-900" onClick={goPrev}>
            ←
          </button>
          <div className="text-sm text-slate-600">
            {view === "month"
              ? format(date, "MMMM yyyy")
              : view === "week"
              ? `${format(startOfWeek(date, { weekStartsOn: 0 }), "EEE, do MMM yyyy")} - ${format(
                  new Date(startOfWeek(date, { weekStartsOn: 0 }).getTime() + 6 * 86400000),
                  "EEE, do MMM yyyy"
                )}`
              : format(date, "EEEE, do MMM yyyy")}
          </div>
          <button className="px-2 py-1 text-slate-600 hover:text-slate-900" onClick={goNext}>
            →
          </button>
        </div>
      </div>

      {loading && <div className="text-slate-500 mt-3">Loading appointments…</div>}
      {!loading && events.length === 0 && (
        <div className="text-slate-500 mt-3">
          No appointments found. Book one from <b>Book Appointment</b>.
        </div>
      )}
    </div>
  );
}
