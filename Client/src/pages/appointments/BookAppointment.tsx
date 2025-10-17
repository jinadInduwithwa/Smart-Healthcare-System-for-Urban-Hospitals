import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getSpecialties,
  getDoctorsBySpecialty,
  getSlots,
  createAppointment,
} from "@/utils/api";
import { createPayment, createStripeCheckout } from "@/utils/paymentApi";
import { toast } from "react-toastify";

type Doctor = {
  _id: string;
  specialization: string;
  userId?: { firstName?: string; lastName?: string; email?: string };
  rating?: number;
};

type Slot = { _id: string; date: string; startTime: string; endTime: string };

const cx = (...xs: (string | false | undefined)[]) =>
  xs.filter(Boolean).join(" ");
const avatar = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=E6F0FF&color=0F3D87`;

// ➜ Feature flag: skip payment while your teammate finishes checkout
const DEV_SKIP_PAYMENT = import.meta.env.VITE_DEV_SKIP_PAYMENT === "true";

export default function BookAppointment() {
  // Specialties (tabs)
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [activeSpec, setActiveSpec] = useState<string>("");

  // Doctors (cards)
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");

  // Calendar + Slots
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  // UI state
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  // Format date for API (YYYY-MM-DD)
  const dateISO = useMemo(() => {
    if (!selectedDate) return undefined;
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  // Load specialties once
  useEffect(() => {
    let mounted = true;
    (async () => {
      const res = await getSpecialties();
      const list: string[] = res.data || [];
      if (!mounted) return;
      setSpecialties(list);
      setActiveSpec(list[0] || "");
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load doctors when tab changes
  useEffect(() => {
    if (!activeSpec) return;
    setLoadingDoctors(true);
    setSelectedDoctor("");
    setSelectedSlot("");
    setAppointmentId(null);
    getDoctorsBySpecialty(activeSpec)
      .then((r) => setDoctors(r.data || []))
      .finally(() => setLoadingDoctors(false));
  }, [activeSpec]);

  // Load slots when doctor/date changes
  useEffect(() => {
    if (!selectedDoctor) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }
    setLoadingSlots(true);
    setSelectedSlot("");
    getSlots(selectedDoctor, dateISO)
      .then((r) => setSlots(r.data || []))
      .finally(() => setLoadingSlots(false));
  }, [selectedDoctor, dateISO]);

  // CTA click
  const startBooking = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    try {
      setBusy(true);

      // 2) Create the appointment (status: PENDING)
      const res = await createAppointment(selectedDoctor, selectedSlot);
      const apptId = res.data._id as string;

      // 3) Dev-mode: auto-confirm without showing payment modal
      if (DEV_SKIP_PAYMENT) {
        // In dev mode, just show success without payment
        toast.success("Appointment booked! (Dev mode - no payment required)");
        // refresh slots to reflect the taken time
        const r = await getSlots(selectedDoctor, dateISO);
        setSlots(r.data || []);
        setSelectedSlot("");
        setAppointmentId(null);
        return;
      }

      // 4) Normal flow: open payment modal
      setAppointmentId(apptId);
      setPayOpen(true);
    } catch (e: unknown) {
      const error = e as Error;
      toast.error(
        error?.message || "Could not reserve slot. Please try another."
      );
      // refresh slots
      try {
        const r = await getSlots(selectedDoctor, dateISO);
        setSlots(r.data || []);
        setSelectedSlot("");
      } catch (refreshError) {
        console.error("Failed to refresh slots:", refreshError);
      }
    } finally {
      setBusy(false);
    }
  };

  // Create payment and redirect to Stripe checkout
  const handlePay = async () => {
    if (!appointmentId) return;
    try {
      setBusy(true);

      // Create payment record
      const payment = await createPayment({
        appointmentId,
        amount: 2500, // Fixed consultation fee
        paymentMethod: "CARD", // Changed from "card" to "CARD"
      });

      // Create Stripe checkout session
      const successUrl = `${window.location.origin}/patient/payments?payment_success=true&payment_id=${payment.id}`;
      const cancelUrl = `${window.location.origin}/patient/payments?payment_cancelled=true&payment_id=${payment.id}`;

      const checkoutSession = await createStripeCheckout(
        payment.id,
        successUrl,
        cancelUrl
      );

      setPayOpen(false);

      // Redirect to Stripe checkout
      window.location.href = checkoutSession.url;
    } catch (e: unknown) {
      const error = e as Error;
      toast.error(
        error?.message || "Failed to create payment. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  // helpers
  const doctorName = (d: Doctor) =>
    `${d.userId?.firstName ?? "Dr."} ${d.userId?.lastName ?? ""}`.trim();

  return (
    <div className="px-6 md:px-10 py-6 max-w-7xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 mb-6">
        Your Health Matters, Book With Us Today
      </h1>

      {/* Tabs: Browse Doctors by Category */}
      <div className="mb-4 text-slate-700 font-medium">
        Browse Doctors by Category
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {specialties.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSpec(s)}
            className={cx(
              "rounded-full px-4 py-2 text-sm border transition",
              activeSpec === s
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Available Doctors */}
      <div className="text-lg font-medium text-slate-700 mb-3">
        Available Doctors
      </div>
      {loadingDoctors ? (
        <div className="text-slate-500 mb-6">Loading doctors…</div>
      ) : doctors.length === 0 ? (
        <div className="text-slate-500 mb-6">No doctors in {activeSpec}.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {doctors.map((d) => {
            const name = doctorName(d);
            const active = selectedDoctor === d._id;
            const rating = d.rating ?? 4.8;
            return (
              <button
                key={d._id}
                onClick={() => setSelectedDoctor(d._id)}
                className={cx(
                  "w-full text-left p-4 border rounded-xl transition bg-white flex items-center gap-4",
                  active ? "border-blue-600 shadow-sm" : "hover:shadow-md"
                )}
              >
                <img
                  src={avatar(name)}
                  alt={name}
                  className="w-14 h-14 rounded-full border object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{name}</div>
                  <div className="text-sm text-slate-600">
                    {d.specialization}
                  </div>
                  <div className="mt-1 text-amber-500">
                    {"★".repeat(5)}{" "}
                    <span className="text-slate-500 text-xs ml-1">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Calendar + Slots row (same page) */}
      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Calendar */}
        <div className="md:col-span-7 lg:col-span-8 p-4 bg-white border rounded-xl">
          <div className="mb-3 text-slate-700 font-medium">
            Select Date and Time
          </div>
          <DatePicker
            selected={selectedDate}
            onChange={(d) => setSelectedDate(d)}
            inline
            minDate={new Date()}
            calendarClassName="!text-slate-800"
            dayClassName={() => "hover:!bg-blue-50"}
          />
        </div>

        {/* Time Slots */}
        <div className="md:col-span-5 lg:col-span-4 p-4 bg-white border rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-medium text-slate-700">
              Available Time Slots
            </div>
            {loadingSlots && (
              <span className="text-sm text-slate-500">Loading…</span>
            )}
          </div>

          {!selectedDoctor ? (
            <div className="text-slate-500 text-sm">
              Select a doctor to see time slots.
            </div>
          ) : slots.length === 0 ? (
            <div className="text-slate-500 text-sm">
              No slots for the selected date.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((s) => {
                const active = selectedSlot === s._id;
                return (
                  <button
                    key={s._id}
                    onClick={() => setSelectedSlot(s._id)}
                    className={cx(
                      "px-4 py-2 rounded-full border text-sm transition",
                      active
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {s.startTime}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="flex justify-end mt-6">
        <button
          disabled={!selectedDoctor || !selectedSlot || busy}
          onClick={startBooking}
          className={cx(
            "rounded-full px-5 py-3 font-medium",
            !selectedDoctor || !selectedSlot || busy
              ? "bg-slate-300 text-white cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          {busy
            ? "Please wait…"
            : DEV_SKIP_PAYMENT
            ? "Book Now"
            : "Make Payment and Book Now"}
        </button>
      </div>

      {/* Payment modal (used only when DEV_SKIP_PAYMENT is false) */}
      {!DEV_SKIP_PAYMENT && payOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
          <div className="w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-slate-800">Payment</h3>
              <button
                onClick={() => !busy && setPayOpen(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-slate-700">
                <div className="font-medium">Consultation Fee</div>
                <div className="text-lg font-semibold">LKR 2,500.00</div>
              </div>

              <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Secure Payment Processing</p>
                <p>
                  You will be redirected to our secure payment page where you
                  can pay with your credit/debit card using Stripe.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setPayOpen(false)}
                  disabled={busy}
                  className="px-4 py-2 rounded-full border text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={busy}
                  className={cx(
                    "px-4 py-2 rounded-full text-white",
                    busy ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {busy ? "Creating Payment…" : "Proceed to Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
