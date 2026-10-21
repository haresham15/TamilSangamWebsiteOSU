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
 * Infer cultural pillar accent color based on title or description keywords.
 */
function getEventPillarColor(event: CalendarEvent): { bg: string; text: string; dot: string } {
  const combined = `${event.titleEn} ${event.titleTa ?? ""} ${event.description}`.toLowerCase();

  if (combined.includes("aatam") || combined.includes("dance") || combined.includes("kuthu") || combined.includes("garba")) {
    return { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500" };
  }
  if (combined.includes("paatam") || combined.includes("music") || combined.includes("jam") || combined.includes("acoustic") || combined.includes("sing")) {
    return { bg: "bg-amber-50", text: "text-amber-900", dot: "bg-[#E5A93C]" };
  }
  if (combined.includes("kondatam") || combined.includes("sapad") || combined.includes("food") || combined.includes("feast") || combined.includes("pongal") || combined.includes("diwali") || combined.includes("picnic") || combined.includes("carnival")) {
    return { bg: "bg-orange-50", text: "text-[#B85C38]", dot: "bg-[#B85C38]" };
  }

  return { bg: "bg-[#FAF9F6]", text: "text-[#2A2825]", dot: "bg-[#B85C38]" };
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

  return (
    <div className="w-full bg-[#FAF9F6] border border-[#2A2825]/15 rounded-3xl p-6 sm:p-8 shadow-sm text-left">
      {/* Month Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-[#2A2825]/10">
        <div className="flex items-center gap-3">
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2A2825]">
            {format(selectedMonth, "MMMM yyyy")}
          </h3>
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1 text-xs font-mono font-medium rounded-full border border-[#2A2825]/20 hover:border-[#B85C38] text-[#57524C] hover:text-[#2A2825] transition-colors cursor-pointer"
          >
            {locale === "ta" ? "இன்று" : "Today"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="w-9 h-9 rounded-full border border-[#2A2825]/20 hover:border-[#B85C38] text-[#2A2825] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="w-9 h-9 rounded-full border border-[#2A2825]/20 hover:border-[#B85C38] text-[#2A2825] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Column Weekday Headers */}
      <div className="grid grid-cols-7 gap-px mb-2 text-center text-xs font-mono uppercase tracking-wider text-[#57524C] font-semibold">
        {WEEKDAYS.map((day) => (
          <div key={day.en} className="py-2">
            <span>{locale === "ta" ? day.ta : day.en}</span>
          </div>
        ))}
      </div>

      {/* 7-Column Month Grid */}
      <div className="grid grid-cols-7 gap-px bg-[#2A2825]/10 rounded-2xl overflow-hidden border border-[#2A2825]/10">
        {daysInGrid.map((day, _idx) => {
          // Format in local string matching YYYY-MM-DD
          const year = day.getFullYear();
          const month = (day.getMonth() + 1).toString().padStart(2, "0");
          const dateNum = day.getDate().toString().padStart(2, "0");
          const dayKey = `${year}-${month}-${dateNum}`;

          const isCurrentMonth = isSameMonth(day, selectedMonth);
          const isToday = dayKey === todayKey;
          const dayEvents = eventsByDate.get(dayKey) || [];

          return (
            <div
              key={dayKey}
              tabIndex={isCurrentMonth ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (dayEvents.length > 0) {
                    e.preventDefault();
                    onSelectEvent(dayEvents[0]);
                  }
                }
              }}
              className={`min-h-[110px] sm:min-h-[125px] p-2 sm:p-2.5 flex flex-col justify-between transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#B85C38] focus-visible:z-10 ${
                isCurrentMonth ? "bg-[#FAF9F6]" : "bg-[#F4EFE6]/50 text-[#57524C]/40"
              } ${isToday ? "ring-2 ring-inset ring-[#B85C38] bg-orange-50/20" : ""}`}
            >
              {/* Day Header: Date number & Today dot */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-mono font-medium ${
                    isToday
                      ? "w-6 h-6 rounded-full bg-[#B85C38] text-white flex items-center justify-center font-bold"
                      : isCurrentMonth
                      ? "text-[#2A2825]"
                      : "text-[#57524C]/50"
                  }`}
                >
                  {day.getDate()}
                </span>
                {isToday && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#B85C38] font-bold hidden sm:inline">
                    TODAY
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
                        onSelectEvent(evt);
                      }}
                      className={`w-full text-left p-1.5 rounded-lg border border-[#2A2825]/10 ${colors.bg} hover:border-[#B85C38] transition-all group cursor-pointer shadow-xs`}
                      title={`${evt.titleEn} (${formatEventTimeET(evt.start, evt.end, evt.allDay)})`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colors.dot}`} />
                        <span className={`text-[11px] font-sans font-semibold truncate ${colors.text}`}>
                          {locale === "ta" && evt.titleTa ? evt.titleTa : evt.titleEn}
                        </span>
                      </div>
                      {!evt.allDay && (
                        <span className="text-[9px] font-mono text-[#57524C]/80 block truncate pl-3">
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
                      setDayPopover({ dayKey, events: dayEvents });
                    }}
                    aria-label={`View ${dayEvents.length - 2} more events for ${format(day, "MMMM do")}`}
                    className="text-[10px] font-mono text-[#B85C38] hover:text-[#2A2825] font-semibold text-left pl-1 cursor-pointer transition-colors"
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
      {dayPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FAF9F6] border border-[#2A2825]/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A2825]/10 pb-3">
              <h4 className="font-serif text-lg font-bold text-[#2A2825]">
                Events on {dayPopover.dayKey}
              </h4>
              <button
                type="button"
                onClick={() => setDayPopover(null)}
                aria-label="Close day events popover"
                className="text-xs font-mono text-[#57524C] hover:text-[#2A2825]"
              >
                Close ✕
              </button>
            </div>
            <div className="space-y-2">
              {dayPopover.events.map((evt) => (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => {
                    setDayPopover(null);
                    onSelectEvent(evt);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-[#F4EFE6] hover:bg-[#E5DDD0] transition-colors cursor-pointer"
                >
                  <p className="font-serif text-sm font-semibold text-[#2A2825]">
                    {locale === "ta" && evt.titleTa ? evt.titleTa : evt.titleEn}
                  </p>
                  <p className="text-xs font-mono text-[#57524C] mt-1">
                    {formatEventTimeET(evt.start, evt.end, evt.allDay)} · {evt.location}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
