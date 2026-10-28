import { CalendarEvent } from "./types";

/**
 * Dev-friendly mock events when Google Calendar credentials are not configured.
 * Clearly flagged with isMock: true.
 * Used exclusively when process.env.NODE_ENV !== 'production'.
 */
export const MOCK_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "mock-yaar-andha-killer-2026",
    slug: "yaar-andha-killer",
    titleEn: "Yaar Andha Killer?",
    titleTa: "யார் அந்த கில்லர்?",
    description:
      "Tamil Sangam presents Yaar Andha Killer? Step into an evening of Halloween suspense, suspicion, and whodunnit clues at the Houston Grove Room in the Ohio Union! Free food will be provided for all attendees, and the best dressed costume wins a prize.\n\nFree admission & free food for all Buckeyes. Zero dues.\nslug: yaar-andha-killer",
    location: "Houston Grove Room, Ohio Union",
    allDay: false,
    start: "2026-10-23T17:30:00-04:00",
    end: "2026-10-23T20:30:00-04:00",
    googleLink: "https://calendar.google.com",
    isMock: true,
  },
  {
    id: "mock-streetside-sapad-2026",
    slug: "streetside-sapad",
    titleEn: "Streetside Sapad Night",
    titleTa: "தெருவோரச் சாப்பாடு திருவிழா",
    description:
      "Hot biryani, samosas, Indian snacks, cold drinks, Kahoot trivia, and casual dinner with friends on campus. Meet new Buckeyes and enjoy authentic food.",
    location: "Campus Kitchen / Ohio Union",
    allDay: false,
    start: "2026-11-14T18:30:00-05:00",
    end: "2026-11-14T21:00:00-05:00",
    googleLink: "https://calendar.google.com",
    isMock: true,
  },
  {
    id: "mock-diwali-sparklers-2026",
    slug: null,
    titleEn: "Diwali Sparkler Night & Festive Feast",
    titleTa: "தீபாவளி கொண்டாட்டம்",
    description:
      "Our signature autumn festival featuring authentic catered South Indian dinner, live student acoustic film jams, and sparklers on the plaza.",
    location: "South Oval & Ohio Union Plaza",
    allDay: false,
    start: "2026-11-20T18:00:00-05:00",
    end: "2026-11-20T22:00:00-05:00",
    googleLink: "https://calendar.google.com",
    isMock: true,
  },
  {
    id: "mock-pongal-harvest-2027",
    slug: null,
    titleEn: "Pongal Harvest Gathering",
    titleTa: "தைப்பொங்கல் திருவிழா",
    description:
      "Traditional sweet pongal pot cooking, festive kolam sidewalk chalk competitions, and celebration of the Tamil harvest season on the Oval lawn.",
    location: "South Oval Lawn",
    allDay: false,
    start: "2027-01-17T11:00:00-05:00",
    end: "2027-01-17T15:00:00-05:00",
    googleLink: "https://calendar.google.com",
    isMock: true,
  },
  {
    id: "mock-namma-jathara-2027",
    slug: "namma-jathara",
    titleEn: "Namma Jathara Carnival (with Telugu Tamasha)",
    titleTa: "நம்ம ஜாதரா வசந்த திருவிழா",
    description:
      "Joint collegiate spring carnival co-hosted with Telugu Tamasha, uniting 200+ students for Indian street food stalls, outdoor games, and dance.",
    location: "RPAC Plaza / South Grounds",
    allDay: false,
    start: "2027-03-27T13:00:00-04:00",
    end: "2027-03-27T18:00:00-04:00",
    googleLink: "https://calendar.google.com",
    isMock: true,
  },
  {
    id: "mock-tamil-new-year-2027",
    slug: null,
    titleEn: "Tamil New Year Feast & Film Jam",
    titleTa: "சித்திரைத் திருநாள் கொண்டாட்டம்",
    description:
      "Celebrating Chithirai Puthandu with traditional feast dishes, live student acoustic music, and student fellowship.",
    location: "Ohio Union — Great Hall",
    allDay: false,
    start: "2027-04-14T17:30:00-04:00",
    end: "2027-04-14T21:00:00-04:00",
    googleLink: "https://calendar.google.com",
    isMock: true,
  },
];
