/**
 * Script to generate iCalendar (.ics) files for Tamil Sangam OSU events
 * Usage: node scripts/generate-calendars.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outDir = resolve(__dirname, "../public/calendars");

mkdirSync(outDir, { recursive: true });

const kollywoodIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tamil Sangam at The Ohio State University//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Tamil Sangam OSU - Kollywood Kollai
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:kollywood-kollai-2026@tamilsangamosu.org
DTSTAMP:20261015T000000Z
DTSTART:20261031T200000
DTEND:20261031T233000
SUMMARY:Kollywood Kollai (கோலிவுட் கொள்ளை) — Tamil Sangam OSU
DESCRIPTION:An immersive autumn convergence weaving Tamil cinema folklore, costumed revelry, street-style night-market sapad, and live acoustic cyphers under midnight Ohio skies.\\n\\nFree admission for all Buckeyes. Zero dues.\\n\\nDossier: https://tamilsangamosu.org/#flagship-gathering
LOCATION:Ohio Union - Performance Hall, 1739 N High St, Columbus, OH 43210
GEO:40.0067;-83.0305
URL:https://tamilsangamosu.org/#flagship-gathering
STATUS:CONFIRMED
CATEGORIES:CULTURAL,CAMPUS,STUDENT_LIFE
END:VEVENT
END:VCALENDAR
`;

const gatheringsIcs = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tamil Sangam at The Ohio State University//Gatherings River//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Tamil Sangam OSU - The Gatherings River
X-WR-TIMEZONE:America/New_York
BEGIN:VEVENT
UID:berry-cute-picnic-2025@tamilsangamosu.org
DTSTAMP:20261015T000000Z
DTSTART:20250918T153000
DTEND:20250918T183000
SUMMARY:A Berry Cute Picnic (பெர்ரி க்யூட் பிக்னிக்) — Tamil Sangam OSU
DESCRIPTION:A casual fall semester welcome picnic on the South Oval with snacks, fresh berries, card games, and good conversation.\\n\\nTamil: புரட்டாசி 2, விசுவாவசு ஆண்டு.\\n\\nDossier: https://tamilsangamosu.org/events/berry-cute-picnic
LOCATION:South Oval, The Ohio State University, Columbus, OH 43210
GEO:39.9992;-83.0135
URL:https://tamilsangamosu.org/events/berry-cute-picnic
STATUS:CONFIRMED
CATEGORIES:SOCIAL,PICNIC,GAMES
END:VEVENT
BEGIN:VEVENT
UID:streetside-sapad-2026@tamilsangamosu.org
DTSTAMP:20261015T000000Z
DTSTART:20260224T183000
DTEND:20260224T210000
SUMMARY:Streetside Sapad Night (தெருவோரச் சாப்பாடு திருவிழா) — Tamil Sangam OSU
DESCRIPTION:A South Indian street food dinner with hot kothu parotta, fresh dosas, and filter coffee. A casual evening of food and conversation open to everyone.\\n\\nTamil: மாசி 12, விசுவாவசு ஆண்டு.\\n\\nDossier: https://tamilsangamosu.org/events/streetside-sapad
LOCATION:Campus Kitchen / Ohio Union, 1739 N High St, Columbus, OH 43210
GEO:40.0067;-83.0305
URL:https://tamilsangamosu.org/events/streetside-sapad
STATUS:CONFIRMED
CATEGORIES:FOOD,SOCIAL,SAPAD
END:VEVENT
BEGIN:VEVENT
UID:namma-jathara-2026@tamilsangamosu.org
DTSTAMP:20261015T000000Z
DTSTART:20260326T160000
DTEND:20260326T200000
SUMMARY:Namma Jathara Carnival (நம்ம ஜாதரா) — Tamil Sangam & Telugu Tamasha OSU
DESCRIPTION:A collaborative spring carnival hosted with Telugu Tamasha at OSU featuring games, food stalls, and an open dance circle on the plaza.\\n\\nTamil: பங்குனி 12, விசுவாவசு ஆண்டு.\\n\\nDossier: https://tamilsangamosu.org/events/namma-jathara
LOCATION:RPAC Plaza / South Oval, 337 Annie and John Glenn Ave, Columbus, OH 43210
GEO:40.0003;-83.0182
URL:https://tamilsangamosu.org/events/namma-jathara
STATUS:CONFIRMED
CATEGORIES:CARNIVAL,OUTDOOR,DANCE
END:VEVENT
END:VCALENDAR
`;

writeFileSync(resolve(outDir, "kollywood-kollai.ics"), kollywoodIcs);
writeFileSync(resolve(outDir, "gatherings-river.ics"), gatheringsIcs);
console.log("Generated .ics calendars in public/calendars/");
