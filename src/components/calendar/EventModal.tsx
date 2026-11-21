"use client";

import React from "react";
import Link from "next/link";
import { Calendar, Clock, MapPin, Download, ExternalLink, ArrowRight } from "lucide-react";
import { CalendarEvent } from "@/lib/calendar/types";
import { formatEventDateDisplay, formatEventTimeET } from "@/lib/calendar/parse";
import { buildGoogleCalendarUrl } from "@/lib/calendar/ics";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { DialogShell } from "@/components/ui/DialogShell";

interface EventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();

  const close = () => {
    playClick();
    onClose();
  };

  const dateDisplay = event ? formatEventDateDisplay(event.start) : "";
  const timeDisplay = event ? formatEventTimeET(event.start, event.end, event.allDay) : "";
  const googleCalendarUrl = event ? buildGoogleCalendarUrl(event) : "#";
  const icsDownloadUrl = event ? `/api/events/${encodeURIComponent(event.id)}/ics` : "#";

  const title = event ? (locale === "ta" && event.titleTa ? event.titleTa : event.titleEn) : "";
  const altTitle = event?.titleTa ? (locale === "ta" ? event.titleEn : event.titleTa) : undefined;

  const facts = event
    ? [
        { icon: Calendar, label: locale === "ta" ? "தேதி" : "Date", value: dateDisplay },
        { icon: Clock, label: locale === "ta" ? "நேரம்" : "Time", value: timeDisplay },
        { icon: MapPin, label: locale === "ta" ? "இடம்" : "Location", value: event.location },
      ]
    : [];

  return (
    <DialogShell
      open={Boolean(event)}
      onClose={close}
      tone="ivory"
      size="md"
      eyebrow="Gathering"
      title={title}
      tamilTitle={locale === "ta" ? undefined : altTitle}
      closeLabel={locale === "ta" ? "மூடு" : "Close event details"}
    >
      {event && (
        <>
          <div className="space-y-6 px-5 py-6 sm:px-7">
            {/* Facts ledger (unboxed) */}
            <dl className="divide-y divide-border-warm border-y border-border-warm">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 py-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" aria-hidden="true" />
                  <dt className="w-20 shrink-0 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-ink-umber">
                    {label}
                  </dt>
                  <dd className="font-sans text-sm font-medium text-ink-earth">{value}</dd>
                </div>
              ))}
            </dl>

            {event.description && (
              <div className="space-y-2">
                <h3 className="font-serif text-lg text-ink-earth">
                  {locale === "ta" ? "நிகழ்வு விளக்கம்" : "About this gathering"}
                </h3>
                <p className="whitespace-pre-line font-sans text-sm leading-relaxed text-ink-umber">{event.description}</p>
              </div>
            )}

            <p className="flex items-center gap-2 font-sans text-sm text-ink-umber">
              <span aria-hidden="true" className="h-2 w-2 rotate-45 bg-brand-teal" />
              {locale === "ta"
                ? "அனைத்து மாணவர்களுக்கும் அனுமதி இலவசம் · உறுப்பினர் கட்டணம் இல்லை"
                : "Free admission for all students · No RSVP or ticket required to attend"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-warm bg-bg-sandstone/50 px-5 py-4 sm:px-7">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={googleCalendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playWoodClick()}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-teal px-4 py-2 font-sans text-sm font-medium text-ink-alabaster transition-colors hover:bg-brand-teal-hover"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Google Calendar</span>
              </a>
              <a
                href={icsDownloadUrl}
                download
                onClick={() => playWoodClick()}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-brand-purple/45 px-4 py-2 font-sans text-sm font-medium text-brand-purple transition-colors hover:bg-brand-purple-soft"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Apple / Outlook (.ics)</span>
              </a>
            </div>

            {event.slug && (
              <Link
                href={`/events/${event.slug}`}
                onClick={close}
                className="inline-flex min-h-11 items-center gap-1.5 font-sans text-sm font-semibold text-brand-teal underline-offset-4 transition-colors hover:underline"
              >
                <span>{locale === "ta" ? "ஆவணம் பார்க்க" : "Open event page"}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </>
      )}
    </DialogShell>
  );
};
