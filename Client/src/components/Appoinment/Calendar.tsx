// Client/src/components/Calendar.tsx
import { useMemo, useState } from "react";

type Props = {
  value: Date;
  onChange: (d: Date) => void;
  minDate?: Date;          // usually "today"
  className?: string;
};

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}
function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

export default function Calendar({ value, onChange, minDate, className }: Props) {
  const today = startOfDay(new Date());
  const min = startOfDay(minDate ?? today);
  const [viewYear, setViewYear] = useState(value.getFullYear());
  const [viewMonth, setViewMonth] = useState(value.getMonth()); // 0..11

  // Build days grid (6 rows x 7 cols)
  const weeks = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const weekday = firstOfMonth.getDay(); // 0 Sun ... 6 Sat
    const gridStart = addDays(firstOfMonth, -weekday); // start from Sunday before/at day 1

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) days.push(addDays(gridStart, i));

    const rows: Date[][] = [];
    for (let r = 0; r < 6; r++) rows.push(days.slice(r * 7, r * 7 + 7));
    return rows;
  }, [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const goPrev = () => {
    const m = viewMonth - 1;
    if (m < 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else setViewMonth(m);
  };
  const goNext = () => {
    const m = viewMonth + 1;
    if (m > 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else setViewMonth(m);
  };

  const weekLabels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={goPrev}
          className="px-2 py-1 rounded hover:bg-slate-100 border border-slate-200"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="font-semibold text-slate-800">{monthLabel}</div>
        <button
          type="button"
          onClick={goNext}
          className="px-2 py-1 rounded hover:bg-slate-100 border border-slate-200"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 text-xs text-slate-500 mb-1">
        {weekLabels.map((w) => (
          <div key={w} className="text-center py-1">{w}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((day, idx) => {
          const inThisMonth = day.getMonth() === viewMonth;
          const disabled = startOfDay(day) < min;
          const selected = isSameDate(day, value);

          return (
            <button
              type="button"
              key={idx}
              onClick={() => !disabled && onChange(startOfDay(day))}
              className={[
                "h-9 rounded border text-sm",
                selected
                  ? "bg-blue-600 text-white border-blue-600"
                  : inThisMonth
                  ? "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
                  : "bg-slate-50 text-slate-400 border-slate-200",
                disabled && !selected ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
