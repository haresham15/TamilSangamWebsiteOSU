"use client";

import React, { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { CalendarEvent } from "@/lib/calendar/types";
import { MonthGrid } from "./MonthGrid";
import { AgendaList } from "./AgendaList";
import { EventModal } from "./EventModal";
import { SubscribePopover } from "./SubscribePopover";
import { useLocale } from "@/context/LocaleContext";
import { SITE_CONFIG } from "@/data/siteConfig";
import { AlertCircle, MessageSquare } from "lucide-react";

interface CalendarViewProps {
  initialEvents: CalendarEvent[];
  initialError?: string | null;
  isMock?: boolean;
  subscribeUrl?: string;
  webcalUrl?: string;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  initialEvents,
  initialError = null,
  isMock = false,
  subscribeUrl,
  webcalUrl,
}) => {
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [events] = useState<CalendarEvent[]>(initialEvents);
  const [selectedMonth, setSelectedMonth] = useState<Date>(() => new Date("2026-10-01T00:00:00"));

  // Pure declarative URL-synced active event
  const eventParam = searchParams.get("event");
  const activeEvent = React.useMemo(() => {
    if (!eventParam) return null;
    return events.find((e) => e.id === eventParam || e.slug === eventParam) ?? null;
  }, [eventParam, events]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("event", event.slug || event.id);
    params.set("view", "calendar");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleCloseModal = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("event");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  return (
    <div className="w-full space-y-6">
      {/* Top Controls: Subscribe Button + Mock Badge if in dev mock mode */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SubscribePopover subscribeUrl={subscribeUrl} webcalUrl={webcalUrl} />

        {isMock && (
          <span className="font-mono text-[10px] uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            Dev Mock Mode (No API Key Required)
          </span>
        )}
      </div>

      {/* Error Banner if Google API is down */}
      {initialError && !isMock && (
        <div className="p-6 bg-amber-50 border border-amber-200/80 rounded-2xl text-left space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-serif font-semibold text-base">
            <AlertCircle className="w-5 h-5 text-amber-700" />
            <span>Calendar is taking a nap. Try again soon.</span>
          </div>
          <p className="text-xs font-sans text-amber-900 leading-relaxed">
            {locale === "ta"
              ? "கூகிள் நாட்காட்டி தற்போது இணைப்பில் இல்லை. புதிய நிகழ்வுகளுக்கு எமது GroupMe அல்லது Instagram பக்கத்தைப் பார்க்கவும்."
              : "Google Calendar connection is temporarily unavailable. Check the student GroupMe or follow our Instagram for real-time announcements."}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={SITE_CONFIG.groupMeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B85C38] text-white text-xs font-sans font-medium hover:bg-[#A04A27] transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Join GroupMe</span>
            </a>
            <a
              href={SITE_CONFIG.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-200 text-[#2A2825] text-xs font-sans font-medium hover:bg-stone-300 transition-colors"
            >
              <span>Instagram</span>
            </a>
          </div>
        </div>
      )}

      {/* Responsive Viewport Split: MonthGrid (>= 640px) and AgendaList (< 640px) */}
      <div className="hidden sm:block">
        <MonthGrid
          events={events}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      <div className="block sm:hidden">
        <AgendaList
          events={events}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {/* Reusable Event Modal */}
      <EventModal event={activeEvent} onClose={handleCloseModal} />
    </div>
  );
};
