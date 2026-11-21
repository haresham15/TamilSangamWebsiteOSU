"use client";

import React, { useState, useMemo } from "react";
import { format, subMonths, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight, ChevronDown, MapPin } from "lucide-react";
import { CalendarEvent } from "@/lib/calendar/types";
import { formatEventDateDisplay, formatEventTimeET, getNewYorkDateKey } from "@/lib/calendar/parse";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { audioLayer } from "@/utils/audioLayer";
import { Eyebrow } from "@/components/muttram/Eyebrow";

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

  const navButton =
    "w-12 h-12 rounded-full border border-border-warm bg-surface-card-light flex items-center justify-center text-ink-earth hover:border-brand-teal hover:text-brand-teal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg-ivory";

  return (
    <div className="w-full text-left space-y-6">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-warm">
        <div>
          <Eyebrow>Monthly agenda</Eyebrow>
          <h3 className="font-serif text-xl font-bold text-ink-earth">
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
            className={navButton}
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              playClick();
              onMonthChange(addMonths(selectedMonth, 1));
            }}
            aria-label="Next month"
            className={navButton}
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Upcoming Events Ledger */}
      {upcomingEvents.length === 0 && pastEvents.length === 0 ? (
        <div className="py-6 border-l-2 border-accent-zari pl-5 space-y-2">
          <p lang={locale === "ta" ? "ta" : undefined} className="font-serif text-lg text-ink-earth leading-[1.6]">
            {locale === "ta" ? "இந்த மாதத்தில் நிகழ்வுகள் இல்லை" : "No gatherings scheduled this month"}
          </p>
          <p lang={locale === "ta" ? "ta" : undefined} className="text-sm font-sans text-ink-umber leading-[1.6]">
            {locale === "ta"
              ? "புதிய நிகழ்வு அறிவிப்புகளுக்கு எமது GroupMe-ல் இணையுங்கள்."
              : "Check back soon or join the student GroupMe for surprise lawn date drops."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border-warm border-y border-border-warm">
          {upcomingEvents.map((evt) => (
            <li key={evt.id}>
              <button
                type="button"
                onClick={() => {
                  audioLayer.playTapeClack();
                  onSelectEvent(evt);
                }}
                className="w-full text-left py-4 px-1 hover:bg-brand-purple-soft transition-colors cursor-pointer min-h-[56px] space-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal"
              >
                <div className="flex items-center justify-between gap-3 text-xs font-sans">
                  <span className="font-semibold uppercase tracking-[0.14em] text-brand-purple">
                    {formatEventDateDisplay(evt.start)}
                  </span>
                  <span className="text-ink-umber tabular-nums">
                    {formatEventTimeET(evt.start, evt.end, evt.allDay)}
                  </span>
                </div>

                <h4
                  lang={locale === "ta" && evt.titleTa ? "ta" : undefined}
                  className="font-serif text-xl font-bold text-ink-earth"
                >
                  {locale === "ta" && evt.titleTa ? evt.titleTa : evt.titleEn}
                </h4>

                {evt.titleTa && (
                  <p
                    lang={locale === "ta" ? undefined : "ta"}
                    style={{ letterSpacing: 0 }}
                    className="font-tamil text-sm leading-[1.6] text-brand-purple"
                  >
                    {locale === "ta" ? evt.titleEn : evt.titleTa}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-xs font-sans text-ink-umber pt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-teal shrink-0" aria-hidden="true" />
                  <span className="truncate">{evt.location}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Collapsible Past Events Group */}
      {pastEvents.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            aria-expanded={showPastEvents}
            onClick={() => {
              playClick();
              setShowPastEvents(!showPastEvents);
            }}
            className="w-full min-h-12 flex items-center justify-between py-2 text-xs font-sans uppercase tracking-[0.14em] text-ink-umber hover:text-brand-purple font-semibold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal rounded"
          >
            <span lang={locale === "ta" ? "ta" : undefined} className={locale === "ta" ? "normal-case tracking-normal" : undefined}>
              {locale === "ta" ? `கடந்த நிகழ்வுகள் (${pastEvents.length})` : `Past Gatherings (${pastEvents.length})`}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showPastEvents ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {showPastEvents && (
            <ul className="divide-y divide-border-warm border-t border-border-warm">
              {pastEvents.map((evt) => (
                <li key={evt.id}>
                  <button
                    type="button"
                    onClick={() => {
                      audioLayer.playTapeClack();
                      onSelectEvent(evt);
                    }}
                    className="w-full min-h-12 text-left py-3 px-1 text-xs hover:bg-brand-purple-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-teal"
                  >
                    <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-ink-umber block">
                      {formatEventDateDisplay(evt.start)}
                    </span>
                    <span
                      lang={locale === "ta" && evt.titleTa ? "ta" : undefined}
                      className="font-serif text-base font-semibold text-ink-earth block"
                    >
                      {locale === "ta" && evt.titleTa ? evt.titleTa : evt.titleEn}
                    </span>
                    <span className="font-sans text-xs text-ink-umber truncate block">
                      {evt.location}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
