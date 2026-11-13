import { useEffect, useMemo, useState } from 'react';

export type DateTimeTab = 'diff' | 'addsub' | 'time';

interface DateTimeCalculatorProps {
  onDisplaySync: (expression: string, result: string) => void;
}

function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1);
}

function calculateCalendarBreakdown(start: Date, end: Date) {
  let d1 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  let d2 = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (d1 > d2) {
    [d1, d2] = [d2, d1];
  }

  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();

  if (days < 0) {
    const prevMonthLastDay = new Date(
      d2.getFullYear(),
      d2.getMonth(),
      0
    ).getDate();
    days += prevMonthLastDay;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalDays = Math.round(
    (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Count business days vs weekends
  let weekdays = 0;
  let weekends = 0;
  const cursor = new Date(d1);
  // Cap loop for absurd multi-millennium ranges while keeping exact math for normal ranges
  if (totalDays <= 40000) {
    for (let i = 0; i < totalDays; i++) {
      const dayOfWeek = cursor.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) weekends++;
      else weekdays++;
      cursor.setDate(cursor.getDate() + 1);
    }
  } else {
    weekdays = Math.round((totalDays * 5) / 7);
    weekends = totalDays - weekdays;
  }

  return { years, months, days, totalDays, weekdays, weekends };
}

export function DateTimeCalculator({ onDisplaySync }: DateTimeCalculatorProps) {
  const [tab, setTab] = useState<DateTimeTab>('diff');

  // 1. Date Difference state
  const [startDateStr, setStartDateStr] = useState(() => toInputDate(new Date()));
  const [endDateStr, setEndDateStr] = useState(() => {
    const next = new Date();
    next.setMonth(next.getMonth() + 3);
    return toInputDate(next);
  });
  const [includeEndDay, setIncludeEndDay] = useState(false);

  // 2. Add / Subtract Date state
  const [baseDateStr, setBaseDateStr] = useState(() => toInputDate(new Date()));
  const [operation, setOperation] = useState<'add' | 'sub'>('add');
  const [addYears, setAddYears] = useState('0');
  const [addMonths, setAddMonths] = useState('0');
  const [addWeeks, setAddWeeks] = useState('0');
  const [addDays, setAddDays] = useState('30');

  // 3. Time Duration Math state
  const [timeA, setTimeA] = useState('08:30:00');
  const [timeB, setTimeB] = useState('02:45:30');
  const [timeOp, setTimeOp] = useState<'add' | 'sub' | 'diff'>('add');

  const diffResult = useMemo(() => {
    const start = parseLocalDate(startDateStr);
    const end = parseLocalDate(endDateStr);
    if (includeEndDay) {
      end.setDate(end.getDate() + 1);
    }
    return calculateCalendarBreakdown(start, end);
  }, [startDateStr, endDateStr, includeEndDay]);

  const addSubResult = useMemo(() => {
    const d = parseLocalDate(baseDateStr);
    const sign = operation === 'add' ? 1 : -1;
    const y = (parseInt(addYears, 10) || 0) * sign;
    const m = (parseInt(addMonths, 10) || 0) * sign;
    const w = (parseInt(addWeeks, 10) || 0) * sign;
    const days = (parseInt(addDays, 10) || 0) * sign;

    d.setFullYear(d.getFullYear() + y);
    d.setMonth(d.getMonth() + m);
    d.setDate(d.getDate() + w * 7 + days);

    return {
      formatted: d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      iso: toInputDate(d),
    };
  }, [baseDateStr, operation, addYears, addMonths, addWeeks, addDays]);

  const timeResult = useMemo(() => {
    const parseSec = (t: string) => {
      const parts = t.split(':').map((n) => parseInt(n, 10) || 0);
      const h = parts[0] || 0;
      const m = parts[1] || 0;
      const s = parts[2] || 0;
      return h * 3600 + m * 60 + s;
    };

    const s1 = parseSec(timeA);
    const s2 = parseSec(timeB);
    let totalSec = 0;
    if (timeOp === 'add') totalSec = s1 + s2;
    else if (timeOp === 'sub') totalSec = s1 - s2;
    else totalSec = Math.abs(s2 - s1);

    const isNeg = totalSec < 0;
    const absSec = Math.abs(totalSec);
    const hrs = Math.floor(absSec / 3600);
    const mins = Math.floor((absSec % 3600) / 60);
    const secs = absSec % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    return {
      hms: `${isNeg ? '-' : ''}${pad(hrs)}:${pad(mins)}:${pad(secs)}`,
      totalHours: (totalSec / 3600).toFixed(2),
      totalMinutes: (totalSec / 60).toFixed(1),
    };
  }, [timeA, timeB, timeOp]);

  useEffect(() => {
    if (tab === 'diff') {
      onDisplaySync(
        `${startDateStr} → ${endDateStr}`,
        `${diffResult.totalDays.toLocaleString('en-US')} days`
      );
    } else if (tab === 'addsub') {
      onDisplaySync(
        `${operation === 'add' ? '+' : '-'} Duration`,
        addSubResult.iso
      );
    } else {
      onDisplaySync(
        `${timeA} ${timeOp === 'add' ? '+' : timeOp === 'sub' ? '-' : '↔'} ${timeB}`,
        timeResult.hms
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, diffResult, addSubResult, timeResult]);

  const inputClass =
    'w-full min-h-[42px] lux-input rounded-[10px] px-3 py-1.5 font-mono tabular-nums text-[13px]';
  const labelClass = 'block text-[11px] font-medium lux-text-soft mb-1';

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-3.5 space-y-3">
      {/* Sub-navigation */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#121316]/90 p-1 rounded-[12px] border lux-border-subtle">
        {[
          { id: 'diff' as const, label: 'Date Difference' },
          { id: 'addsub' as const, label: 'Add / Subtract' },
          { id: 'time' as const, label: 'Time Math' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`min-h-[38px] rounded-[9px] text-[11px] sm:text-[12px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              tab === t.id
                ? 'btn-gold-key'
                : 'lux-text-soft hover:lux-text-bright'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* DATE DIFFERENCE */}
      {tab === 'diff' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex items-center justify-between px-3 py-2 rounded-[10px] bg-[#16171a] border lux-border-subtle cursor-pointer">
            <span className="text-[12px] lux-text-soft font-medium">
              Include end date (+1 day)
            </span>
            <input
              type="checkbox"
              checked={includeEndDay}
              onChange={(e) => setIncludeEndDay(e.target.checked)}
              className="w-4 h-4"
            />
          </label>

          <div className="obsidian-display-screen rounded-[14px] p-3.5 border lux-border-subtle space-y-2.5">
            <div className="text-center">
              <div className="text-[11px] lux-text-muted">Exact Span</div>
              <div className="text-[15px] font-bold font-mono lux-text-bright">
                {diffResult.years} yr · {diffResult.months} mo ·{' '}
                {diffResult.days} days
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t lux-border-subtle text-center">
              <div>
                <div className="text-[11px] lux-text-muted">Total Days</div>
                <div className="text-[14px] font-bold font-mono tabular-nums lux-text-accent">
                  {diffResult.totalDays.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[11px] lux-text-muted">Workdays</div>
                <div className="text-[14px] font-semibold font-mono tabular-nums lux-text-accent">
                  {diffResult.weekdays.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[11px] lux-text-muted">Weeks</div>
                <div className="text-[14px] font-semibold font-mono tabular-nums lux-text-accent">
                  {(diffResult.totalDays / 7).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / SUBTRACT DATE */}
      {tab === 'addsub' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-[1.3fr_1fr] gap-2">
            <div>
              <label className={labelClass}>Starting Date</label>
              <input
                type="date"
                value={baseDateStr}
                onChange={(e) => setBaseDateStr(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Operation</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setOperation('add')}
                  className={`min-h-[42px] rounded-[10px] text-[12px] font-bold cursor-pointer ${
                    operation === 'add' ? 'btn-gold-key' : 'btn-obsidian-key'
                  }`}
                >
                  + Add
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('sub')}
                  className={`min-h-[42px] rounded-[10px] text-[12px] font-bold cursor-pointer ${
                    operation === 'sub' ? 'btn-gold-key' : 'btn-obsidian-key'
                  }`}
                >
                  - Sub
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className={labelClass}>Years</label>
              <input
                type="number"
                inputMode="numeric"
                value={addYears}
                onChange={(e) => setAddYears(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Months</label>
              <input
                type="number"
                inputMode="numeric"
                value={addMonths}
                onChange={(e) => setAddMonths(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Weeks</label>
              <input
                type="number"
                inputMode="numeric"
                value={addWeeks}
                onChange={(e) => setAddWeeks(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Days</label>
              <input
                type="number"
                inputMode="numeric"
                value={addDays}
                onChange={(e) => setAddDays(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="obsidian-display-screen rounded-[14px] p-3.5 border lux-border-subtle text-center">
            <div className="text-[11px] lux-text-muted">Resulting Date</div>
            <div className="text-[16px] font-bold font-mono lux-text-bright mt-0.5">
              {addSubResult.formatted}
            </div>
          </div>
        </div>
      )}

      {/* TIME MATH */}
      {tab === 'time' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className={labelClass}>Time A (HH:MM:SS)</label>
              <input
                type="text"
                value={timeA}
                onChange={(e) => setTimeA(e.target.value)}
                placeholder="08:30:00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Time B (HH:MM:SS)</label>
              <input
                type="text"
                value={timeB}
                onChange={(e) => setTimeB(e.target.value)}
                placeholder="02:45:30"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'add' as const, label: 'A + B' },
              { id: 'sub' as const, label: 'A − B' },
              { id: 'diff' as const, label: 'Elapsed |A−B|' },
            ].map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setTimeOp(op.id)}
                className={`min-h-[42px] rounded-[10px] text-[12px] font-bold cursor-pointer ${
                  timeOp === op.id ? 'btn-gold-key' : 'btn-obsidian-key'
                }`}
              >
                {op.label}
              </button>
            ))}
          </div>

          <div className="obsidian-display-screen rounded-[14px] p-3.5 border lux-border-subtle grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[11px] lux-text-muted">HH:MM:SS</div>
              <div className="text-[16px] font-bold font-mono tabular-nums lux-text-bright">
                {timeResult.hms}
              </div>
            </div>
            <div>
              <div className="text-[11px] lux-text-muted">Total Hours</div>
              <div className="text-[14px] font-semibold font-mono tabular-nums lux-text-accent">
                {timeResult.totalHours}h
              </div>
            </div>
            <div>
              <div className="text-[11px] lux-text-muted">Total Mins</div>
              <div className="text-[14px] font-semibold font-mono tabular-nums lux-text-accent">
                {timeResult.totalMinutes}m
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
