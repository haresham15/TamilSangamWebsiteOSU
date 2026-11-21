"use client";

import React, { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  format,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarEvent } from "@/lib/calendar/types";
import { getNewYorkDateKey, formatEventTimeET } from "@/lib/calendar/parse";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { DialogShell } from "@/components/ui/DialogShell";

interface MonthGridProps {
  events: CalendarEvent[];
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

const WEEKDAYS = [
  { en: "Sun", ta: "ஞாயிறு" },
  { en: "Mon", ta: "திங்கள்" },
  { en: "Tue", ta: "செவ்வாய்" },
  { en: "Wed", ta: "புதன்" },
  { en: "Thu", ta: "வியாழன்" },
  { en: "Fri", ta: "வெள்ளி" },
  { en: "Sat", ta: "சனி" },
];

/**
 * Infer cultural pillar accent from title or description keywords.
 * Chips stay teal (event = action); the dot carries the pillar hint.
 */
function getEventPillarColor(event: CalendarEvent): { bg: string; text: string; dot: string } {
  const combined = `${event.titleEn} ${event.titleTa ?? ""} ${event.description}`.toLowerCase();
  const chip = { bg: "bg-brand-teal-soft", text: "text-brand-teal-hover" };

  if (combined.includes("aatam") || combined.includes("dance") || combined.includes("kuthu") || combined.includes("garba")) {
    return { ...chip, dot: "bg-brand-purple" };
  }
  if (combined.includes("paatam") || combined.includes("music") || combined.includes("jam") || combined.includes("acoustic") || combined.includes("sing")) {
    return { ...chip, dot: "bg-accent-zari" };
  }

  return { ...chip, dot: "bg-brand-teal" };
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  events,
  selectedMonth,
  onMonthChange,
  onSelectEvent,
}) => {
  const { locale } = useLocale();
  const { playClick } = useAudio();

  // Compute today's date key in America/New_York
  const todayKey = useMemo(() => {
    return getNewYorkDateKey(new Date().toISOString());
  }, []);

  // Compute 7-column calendar matrix
  const daysInGrid = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [selectedMonth]);

  // Index events by date key(s)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const evt of events) {
      const startKey = getNewYorkDateKey(evt.start);
      const endKey = getNewYorkDateKey(evt.end);

      // Simple iteration across date keys
      // Since events usually span 1 to 3 days, parse year/month/day
      if (startKey && endKey) {
        let cur = new Date(`${startKey}T00:00:00Z`);
        const target = new Date(`${endKey}T00:00:00Z`);

        while (cur <= target) {
          const k = cur.toISOString().split("T")[0];
          const list = map.get(k) || [];
          if (!list.some((existing) => existing.id === evt.id)) {
            list.push(evt);
          }
          map.set(k, list);
          cur = new Date(cur.getTime() + 86400000);
        }
      } else if (startKey) {
        const list = map.get(startKey) || [];
        list.push(evt);
        map.set(startKey, list);
      }
    }

    return map;
  }, [events]);

  const handlePrevMonth = () => {
    playClick();
    onMonthChange(subMonths(selectedMonth, 1));
  };

  const handleNextMonth = () => {
    playClick();
    onMonthChange(addMonths(selectedMonth, 1));
  };

  const handleToday = () => {
    playClick();
    onMonthChange(new Date());
  };

  // State for day popover when > 2 events
  const [dayPopover, setDayPopover] = useState<{ dayKey: string; events: CalendarEvent[] } | null>(null);
  // Last day the visitor opened (chip, keyboard or "+N more"); shown with the purple-soft fill.
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const navButton =
    "w-12 h-12 rounded-full border border-border-warm bg-surface-card-light text-ink-earth hover:border-brand-teal hover:text-brand-teal flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory";

  return (
    <div className="w-full text-left">
      {/* Month Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-border-warm">
        <div className="flex items-center gap-3">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink-earth">
            {format(selectedMonth, "MMMM yyyy")}
          </h3>
          <button
            type="button"
            onClick={handleToday}
            className="min-h-12 px-4 text-xs font-sans font-semibold uppercase tracking-[0.14em] rounded-full border border-brand-purple/40 text-brand-purple hover:bg-brand-purple-soft hover:border-brand-purple transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory"
          >
            {locale === "ta" ? (
              <span lang="ta" className="font-tamil normal-case tracking-normal leading-[1.6]">இன்று</span>
            ) : (
              "Today"
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={handlePrevMonth} aria-label="Previous month" className={navButton}>
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={handleNextMonth} aria-label="Next month" className={navButton}>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* 7-Column Weekday Headers */}
      <div className="grid grid-cols-7 gap-px mb-2 text-center text-xs font-sans font-semibold uppercase tracking-[0.14em]">
        {WEEKDAYS.map((day, i) => (
          <div key={day.en} className={`py-2 ${i === 0 || i === 6 ? "text-ink-umber" : "text-ink-earth"}`}>
            {locale === "ta" ? (
              <span lang="ta" className="font-tamil normal-case tracking-normal leading-[1.6]">{day.ta}</span>
            ) : (
              <span>{day.en}</span>
            )}
          </div>
        ))}
      </div>

      {/* 7-Column Month Grid: white cells on warm hairlines */}
      <div className="grid grid-cols-7 gap-px bg-border-warm rounded-2xl overflow-hidden border border-border-warm shadow-[0_12px_32px_rgba(91,44,134,0.09)]">
        {daysInGrid.map((day) => {
          // Format in local string matching YYYY-MM-DD
          const year = day.getFullYear();
          const month = (day.getMonth() + 1).toString().padStart(2, "0");
          const dateNum = day.getDate().toString().padStart(2, "0");
          const dayKey = `${year}-${month}-${dateNum}`;

          const isCurrentMonth = isSameMonth(day, selectedMonth);
          const isToday = dayKey === todayKey;
          const isSelected = dayKey === selectedDayKey;
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const dayEvents = eventsByDate.get(dayKey) || [];

          const surface = isSelected
            ? "bg-brand-purple-soft"
            : isCurrentMonth
            ? "bg-surface-card-light"
            : "bg-bg-sandstone/50";

          return (
            <div
              key={dayKey}
              tabIndex={isCurrentMonth ? 0 : -1}
              aria-current={isToday ? "date" : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (dayEvents.length > 0) {
                    e.preventDefault();
                    setSelectedDayKey(dayKey);
                    onSelectEvent(dayEvents[0]);
                  }
                }
              }}
              className={`min-h-[110px] sm:min-h-[125px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal focus-visible:z-10 ${surface} ${
                isToday ? "ring-2 ring-inset ring-brand-purple" : ""
              }`}
            >
              {/* Day Header: Date number & Today label */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-sans font-semibold tabular-nums ${
                    isToday
                      ? "w-6 h-6 rounded-full bg-brand-purple text-ink-alabaster flex items-center justify-center"
                      : !isCurrentMonth
                      ? "text-ink-umber/60"
                      : isWeekend
                      ? "text-ink-umber"
                      : "text-ink-earth"
                  }`}
                >
                  {day.getDate()}
                </span>
                {isToday && (
                  <span className="text-[10px] font-sans uppercase tracking-[0.14em] text-brand-purple font-semibold hidden sm:inline">
                    Today
                  </span>
                )}
              </div>

              {/* Event Chips Container */}
              <div className="space-y-1.5 mt-2 flex-1 flex flex-col justify-start">
                {dayEvents.slice(0, 2).map((evt) => {
                  const colors = getEventPillarColor(evt);
                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => {
                        audioLayer.playTapeClack();
                        setSelectedDayKey(dayKey);
                        onSelectEvent(evt);
                      }}
                      className={`w-full text-left p-1.5 rounded-lg border border-brand-teal/20 ${colors.bg} hover:border-brand-teal transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal`}
                      title={`${evt.titleEn} (${formatEventTimeET(evt.start, evt.end, evt.allDay)})`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
                        <span
                          lang={locale === "ta" && evt.titleTa ? "ta" : undefined}
                          className={`text-[11px] font-sans font-semibold truncate ${colors.text}`}
                        >
                          {locale === "ta" && evt.titleTa ? evt.titleTa : evt.titleEn}
                        </span>
                      </div>
                      {!evt.allDay && (
                        <span className="text-[10px] font-sans tabular-nums text-ink-umber block truncate pl-3">
                          {formatEventTimeET(evt.start, undefined, false)}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* +N More button */}
                {dayEvents.length > 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setSelectedDayKey(dayKey);
                      setDayPopover({ dayKey, events: dayEvents });
                    }}
                    className="text-[11px] font-sans text-brand-teal hover:text-brand-teal-hover hover:underline font-semibold text-left pl-1 cursor-pointer transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
                  >
                    +{dayEvents.length - 2} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Popover when > 2 events */}
      <DialogShell
        open={dayPopover !== null}
        onClose={() => setDayPopover(null)}
        title={dayPopover ? `Events on ${dayPopover.dayKey}` : undefined}
        ariaLabel="Events on this day"
        tone="ivory"
        size="sm"
      >
        <ul className="divide-y divide-border-warm">
          {dayPopover?.events.map((evt) => (
            <li key={evt.id}>
              <button
                type="button"
                onClick={() => {
                  setDayPopover(null);
                  onSelectEvent(evt);
                }}
                className="w-full min-h-12 text-left px-5 py-3 sm:px-7 hover:bg-brand-purple-soft transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal"
              >
                <p
                  lang={locale === "ta" && evt.titleTa ? "ta" : undefined}
                  className="font-serif text-base font-semibold text-ink-earth"
                >
                  {locale === "ta" && evt.titleTa ? evt.titleTa : evt.titleEn}
                </p>
                <p className="text-xs font-sans text-ink-umber mt-1">
                  {formatEventTimeET(evt.start, evt.end, evt.allDay)} · {evt.location}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </DialogShell>
    </div>
  );
};
