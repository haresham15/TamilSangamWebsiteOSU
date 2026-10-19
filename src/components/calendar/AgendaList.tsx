"use client";

import React, { useState, useMemo } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight, ChevronDown, MapPin } from "lucide-react";
import { CalendarEvent } from "@/lib/calendar/types";
import { formatEventDateDisplay, formatEventTimeET, getNewYorkDateKey } from "@/lib/calendar/parse";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";

interface AgendaListProps {
  events: CalendarEvent[];
  selectedMonth: Date;
  onMonthChange: (month: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const AgendaList: React.FC<AgendaListProps> = ({
  events,
  selectedMonth,
  onMonthChange,
  onSelectEvent,
}) => {
  const { locale } = useLocale();
  const { playClick } = useAudio();
  const [showPastEvents, setShowPastEvents] = useState(false);

  const todayKey = useMemo(() => {
    return getNewYorkDateKey(new Date().toISOString());
  }, []);

  // Filter events by selected month
  const selectedYearMonth = useMemo(() => {
    const y = selectedMonth.getFullYear();
    const m = (selectedMonth.getMonth() + 1).toString().padStart(2, "0");
    return `${y}-${m}`;
  }, [selectedMonth]);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const upcoming: CalendarEvent[] = [];
    const past: CalendarEvent[] = [];

    for (const evt of events) {
      const evtKey = getNewYorkDateKey(evt.start);
      // Only include events in or around the selected month
      if (evtKey.startsWith(selectedYearMonth)) {
        if (evtKey >= todayKey) {
          upcoming.push(evt);
        } else {
          past.push(evt);
        }
      }
    }

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events, selectedYearMonth, todayKey]);

  return (
    <div className="w-full bg-[#FAF9F6] border border-[#2A2825]/15 rounded-3xl p-5 shadow-sm text-left space-y-6">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#2A2825]/10">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#B85C38] font-semibold block">
            MONTHLY AGENDA
          </span>
          <h3 className="font-serif text-xl font-bold text-[#2A2825]">
            {format(selectedMonth, "MMMM yyyy")}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              playClick();
              onMonthChange(subMonths(selectedMonth, 1));
            }}
            aria-label="Previous month"
            className="w-10 h-10 rounded-full border border-[#2A2825]/20 flex items-center justify-center text-[#2A2825] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick();
              onMonthChange(addMonths(selectedMonth, 1));
            }}
            aria-label="Next month"
            className="w-10 h-10 rounded-full border border-[#2A2825]/20 flex items-center justify-center text-[#2A2825] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Upcoming Events List */}
      <div className="space-y-4">
        {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
          <div className="p-8 text-center bg-[#F4EFE6]/60 rounded-2xl border border-[#2A2825]/10 space-y-2">
            <p className="font-serif text-lg text-[#2A2825]">
              {locale === "ta" ? "இந்த மாதத்தில் நிகழ்வுகள் இல்லை" : "No gatherings scheduled this month"}
            </p>
            <p className="text-xs font-sans text-[#57524C]">
              {locale === "ta"
                ? "புதிய நிகழ்வு அறிவிப்புகளுக்கு எமது GroupMe-ல் இணையுங்கள்."
                : "Check back soon or join the student GroupMe for surprise lawn date drops."}
            </p>
          </div>
        ) : (
          upcomingEvents.map((evt) => (
            <button
              key={evt.id}
              type="button"
              onClick={() => {
                audioLayer.playTapeClack();
                onSelectEvent(evt);
              }}
              className="w-full text-left p-4 rounded-2xl bg-[#F4EFE6] hover:bg-[#E5DDD0] border border-[#2A2825]/10 transition-all cursor-pointer min-h-[56px] space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-[#B85C38]">
                  {formatEventDateDisplay(evt.start)}
                </span>
                <span className="text-[#57524C]">
                  {formatEventTimeET(evt.start, evt.end, evt.allDay)}
                </span>
              </div>

              <h4 className="font-serif text-xl font-bold text-[#2A2825]">
                {locale === "ta" && evt.titleTa ? evt.titleTa : evt.titleEn}
              </h4>

              {evt.titleTa && (
                <p lang="ta" style={{ letterSpacing: 0 }} className="font-tamil text-xs text-[#B85C38]">
                  {locale === "ta" ? evt.titleEn : evt.titleTa}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-xs font-sans text-[#57524C] pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#B85C38] shrink-0" />
                <span className="truncate">{evt.location}</span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Collapsible Past Events Group */}
      {pastEvents.length > 0 && (
        <div className="pt-2 border-t border-[#2A2825]/10">
          <button
            type="button"
            onClick={() => {
              playClick();
              setShowPastEvents(!showPastEvents);
            }}
            className="w-full flex items-center justify-between py-2 text-xs font-mono uppercase tracking-wider text-[#57524C] hover:text-[#2A2825] font-semibold cursor-pointer"
          >
            <span>
              {locale === "ta" ? `கடந்த நிகழ்வுகள் (${pastEvents.length})` : `Past Gatherings (${pastEvents.length})`}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showPastEvents ? "rotate-180" : ""}`} />
          </button>

          {showPastEvents && (
            <div className="space-y-3 pt-3">
              {pastEvents.map((evt) => (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => {
                    audioLayer.playTapeClack();
                    onSelectEvent(evt);
                  }}
                  className="w-full text-left p-3.5 rounded-xl bg-[#FAF9F6] border border-[#2A2825]/10 text-xs opacity-75 hover:opacity-100 transition-opacity"
                >
                  <span className="font-mono text-[10px] text-[#57524C] block">
                    {formatEventDateDisplay(evt.start)}
                  </span>
                  <span className="font-serif text-base font-semibold text-[#2A2825] block">
                    {locale === "ta" && evt.titleTa ? evt.titleTa : evt.titleEn}
                  </span>
                  <span className="font-sans text-[11px] text-[#57524C] truncate block">
                    {evt.location}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
