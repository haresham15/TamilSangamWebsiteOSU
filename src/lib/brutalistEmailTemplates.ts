/**
 * Brutalist HTML Email Templates — OSU Tamil Sangam
 *
 * Implements the editorial Muttram aesthetic:
 * - Surfaces: Warm Ivory (#FAF9F6), Warm Sand (#F4EFEA), Espresso (#1A1614)
 * - Accents: Terracotta (#C85A32), Turmeric (#D99B26)
 * - Typography: Cormorant Garamond / Marcellus serif, Outfit sans, Fragment Mono monospace, Mukta Malar Tamil
 * - Structure: High-contrast 2px solid #1A1614 borders, brutalist offset shadows, zero generic corporate gradients
 *
 * Covers all 3 active community submission flows:
 * 1. "Sign Our Guestbook" (/join)
 * 2. "The Ideas Hearth" (/suggestions)
 * 3. "STAY IN SANGAM" Newsletter & Next Event Date Drops (/stay-in-sangam)
 */

import { escapeHtml } from "./html";
import { GROUPME_URL, INSTAGRAM_HANDLE, CONTACT_EMAIL, OFFICIAL_DISCLAIMER } from "./constants";
import type { MembershipTrack } from "./webhooks";

const TRACK_DETAILS: Record<MembershipTrack, { name: string; tag: string; desc: string; nextStep: string }> = {
  general: {
    name: "General Member",
    tag: "GENERAL COMMUNITY TRACK",
    desc: "Attend cultural showcases, South Oval feasts, festival gatherings, and lawn kickbacks.",
    nextStep: "Drop into our upcoming Oval Chai social and keep notifications on in the GroupMe.",
  },
  performer: {
    name: "Dance & Music",
    tag: "CULTURAL PERFORMANCE TRACK",
    desc: "Kuthu & Gaana dance circles, acoustic music jams, choreographies, and stage showcases.",
    nextStep: "Our cultural coordinators will reach out regarding upcoming open rehearsal auditions and music jams.",
  },
  committee: {
    name: "Working Council",
    tag: "EXECUTIVE & WORKING COUNCIL TRACK",
    desc: "Festival organizing, media trailers, stage production, catering logistics, and design.",
    nextStep: "You will receive an onboarding invite to our subcommittee sync with President Meenakshi Varadarajan.",
  },
};

// =========================================================================
// 1. SIGN OUR GUESTBOOK CONFIRMATION TEMPLATE
// =========================================================================

export function generateGuestbookConfirmationHtml(params: {
  name: string;
  email: string;
  major: string;
  membershipType: MembershipTrack;
  notes?: string;
}): { html: string; text: string } {
  const { name, email, major, membershipType, notes } = params;
  const track = TRACK_DETAILS[membershipType] || TRACK_DETAILS.general;
  const isBuckeye = email.toLowerCase().endsWith("@osu.edu") || email.toLowerCase().endsWith(".osu.edu");
  const year = new Date().getFullYear();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vanakkam! Your Place at the Sangam Hearth Is Confirmed</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F5F2EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1614; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    .main-wrap { width: 100%; max-width: 600px; margin: 32px auto; background-color: #FAF9F6; border: 2px solid #1A1614; box-shadow: 6px 6px 0px #1A1614; }
    .masthead { background-color: #1A1614; color: #FAF9F6; padding: 18px 24px; text-align: left; }
    .masthead-sub { font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: #D99B26; margin: 0 0 4px 0; font-weight: bold; }
    .masthead-title { font-family: 'Georgia', serif; font-size: 20px; font-weight: normal; margin: 0; letter-spacing: 0.5px; color: #FAF9F6; }
    .content { padding: 36px 32px; }
    .tamil-salutation { font-family: 'Mukta Malar', 'Georgia', serif; font-size: 32px; font-weight: bold; color: #C85A32; margin: 0 0 6px 0; line-height: 1.2; }
    .en-salutation { font-family: 'Georgia', serif; font-size: 24px; font-weight: normal; color: #1A1614; margin: 0 0 16px 0; }
    .deck { font-size: 15px; line-height: 1.6; color: #57524C; margin: 0 0 28px 0; }
    .dossier-card { background-color: #F4EFEA; border: 2px solid #1A1614; padding: 22px; margin: 0 0 28px 0; box-shadow: 3px 3px 0px #1A1614; }
    .dossier-header { font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #C85A32; font-weight: bold; margin-bottom: 14px; border-bottom: 1px dashed #1A1614; padding-bottom: 8px; }
    .dossier-row { margin-bottom: 10px; font-size: 14px; line-height: 1.4; }
    .dossier-label { font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #57524C; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 2px; }
    .dossier-val { font-size: 15px; font-weight: bold; color: #1A1614; }
    .tag-track { display: inline-block; background-color: #1A1614; color: #FAF9F6; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; padding: 4px 10px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    .cta-container { text-align: center; margin: 32px 0 24px 0; }
    .btn-brutalist { display: inline-block; background-color: #C85A32; color: #FAF9F6 !important; text-decoration: none; font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; padding: 14px 28px; border: 2px solid #1A1614; box-shadow: 4px 4px 0px #1A1614; transition: all 0.2s ease; }
    .signoff-box { border-top: 1px solid #E5DDD0; padding-top: 24px; margin-top: 28px; }
    .signoff-name { font-family: 'Georgia', serif; font-size: 16px; font-weight: bold; color: #1A1614; margin: 0 0 2px 0; }
    .signoff-title { font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #57524C; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
    .footer { background-color: #EFECE6; border-top: 2px solid #1A1614; padding: 22px 32px; font-family: 'Courier New', Courier, monospace; font-size: 10px; line-height: 1.5; color: #57524C; }
  </style>
</head>
<body>
  <div style="padding: 16px 8px;">
    <div class="main-wrap">
      <!-- Masthead -->
      <div class="masthead">
        <div class="masthead-sub">THE OHIO STATE UNIVERSITY · EST. 2024</div>
        <h1 class="masthead-title">OSU Tamil Sangam · Guestbook Ledger</h1>
      </div>

      <!-- Main Body -->
      <div class="content">
        <div class="tamil-salutation">வணக்கம், இல்லத்திற்கு நல்வரவு!</div>
        <h2 class="en-salutation">Vanakkam, ${escapeHtml(name)}!</h2>

        <p class="deck">
          Your digital guestbook entry has been inscribed into our community ledger. Whether you were raised on filter coffee and Bharatanatyam, or are stepping into Tamil culture for the very first time on the Columbus campus — you have an enduring place at our hearth.
        </p>

        <!-- Student Dossier Card -->
        <div class="dossier-card">
          <div class="dossier-header">OFFICIAL DOSSIER RECORD // OSU-TS-${year}</div>

          <div class="dossier-row">
            <span class="dossier-label">[STUDENT_NAME]</span>
            <span class="dossier-val">${escapeHtml(name)}</span>
          </div>

          <div class="dossier-row">
            <span class="dossier-label">[CAMPUS_EMAIL]</span>
            <span class="dossier-val">${escapeHtml(email)} ${isBuckeye ? "· (Verified BuckeyeMail)" : ""}</span>
          </div>

          <div class="dossier-row">
            <span class="dossier-label">[MAJOR_OR_FOCUS]</span>
            <span class="dossier-val">${escapeHtml(major || "Undeclared")}</span>
          </div>

          <div class="dossier-row" style="margin-top: 14px;">
            <span class="dossier-label">[PARTICIPATION_TRACK]</span>
            <div class="tag-track">${escapeHtml(track.name)}</div>
            <p style="font-size: 13px; color: #57524C; margin: 6px 0 0 0; line-height: 1.5;">${escapeHtml(track.desc)}</p>
          </div>

          ${notes?.trim() ? `
          <div class="dossier-row" style="margin-top: 14px;">
            <span class="dossier-label">[YOUR_NOTES_TO_THE_BOARD]</span>
            <span style="font-size: 13px; font-style: italic; color: #1A1614; display: block; margin-top: 4px; padding: 8px 12px; background: #FAF9F6; border-left: 3px solid #C85A32;">
              "${escapeHtml(notes.trim())}"
            </span>
          </div>
          ` : ""}
        </div>

        <!-- Next Steps Instruction -->
        <div style="margin: 24px 0; padding: 16px 20px; border-left: 4px solid #D99B26; background-color: #FDFBF7;">
          <strong style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #B37D1D; display: block; margin-bottom: 6px;">
            NEXT STEPS FOR YOUR TRACK:
          </strong>
          <span style="font-size: 14px; color: #1A1614; line-height: 1.5;">
            ${escapeHtml(track.nextStep)}
          </span>
        </div>

        <!-- CTA: Join GroupMe -->
        <div class="cta-container">
          <a href="${GROUPME_URL}" class="btn-brutalist" target="_blank">
            JOIN OFFICIAL STUDENT GROUPME →
          </a>
          <p style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #57524C; margin-top: 10px;">
            Daily date drops, rideshares, South Oval picnics & food alerts.
          </p>
        </div>

        <!-- Officer Signoff -->
        <div class="signoff-box">
          <div class="signoff-name">Meenakshi Varadarajan</div>
          <div class="signoff-title">President, The Ohio State University Tamil Sangam</div>
          <div style="font-size: 12px; color: #57524C; margin-top: 4px;">
            On behalf of the 2026 Executive Council & Subcommittee
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div>OSU TAMIL SANGAM · COLUMBUS, OH 43210</div>
        <div>${OFFICIAL_DISCLAIMER}</div>
        <div style="margin-top: 8px;">
          Instagram: ${INSTAGRAM_HANDLE} · Email: ${CONTACT_EMAIL}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `வணக்கம்! (Vanakkam), ${name}!

Your place at the OSU Tamil Sangam hearth has been confirmed.

OFFICIAL DOSSIER RECORD:
Name: ${name}
Email: ${email}
Major: ${major || "Undeclared"}
Track: ${track.name} (${track.tag})
Track Detail: ${track.desc}
${notes ? `Your Note: "${notes}"\n` : ""}
Next Steps:
${track.nextStep}

Join our active student GroupMe for immediate updates:
${GROUPME_URL}

With warmth,
Meenakshi Varadarajan
President, OSU Tamil Sangam

${OFFICIAL_DISCLAIMER}
Instagram: ${INSTAGRAM_HANDLE} | ${CONTACT_EMAIL}`;

  return { html, text };
}

// =========================================================================
// 2. THE IDEAS HEARTH PROPOSAL CONFIRMATION TEMPLATE
// =========================================================================

export function generateIdeasHearthConfirmationHtml(params: {
  name?: string;
  email?: string;
  category: string;
  message: string;
  id?: string;
}): { html: string; text: string } {
  const { name, email, category, message, id } = params;
  const author = name?.trim() || "Buckeye Community Member";
  const recordId = id || `PROP-${Date.now().toString(36).toUpperCase()}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposal Pinned to the Hearth · OSU Tamil Sangam</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F5F2EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1614; }
    .main-wrap { width: 100%; max-width: 600px; margin: 32px auto; background-color: #FAF9F6; border: 2px solid #1A1614; box-shadow: 6px 6px 0px #1A1614; }
    .masthead { background-color: #1A1614; color: #FAF9F6; padding: 18px 24px; }
    .masthead-sub { font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: #D99B26; margin: 0 0 4px 0; font-weight: bold; }
    .masthead-title { font-family: 'Georgia', serif; font-size: 20px; font-weight: normal; margin: 0; color: #FAF9F6; }
    .content { padding: 36px 32px; }
    .tamil-title { font-family: 'Mukta Malar', 'Georgia', serif; font-size: 28px; font-weight: bold; color: #D99B26; margin: 0 0 6px 0; line-height: 1.2; }
    .en-title { font-family: 'Georgia', serif; font-size: 22px; font-weight: normal; color: #1A1614; margin: 0 0 16px 0; }
    .deck { font-size: 15px; line-height: 1.6; color: #57524C; margin: 0 0 24px 0; }
    .receipt-box { background-color: #F4EFEA; border: 2px solid #1A1614; padding: 22px; margin: 0 0 28px 0; box-shadow: 3px 3px 0px #1A1614; }
    .receipt-id { font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #D99B26; font-weight: bold; border-bottom: 1px dashed #1A1614; padding-bottom: 8px; margin-bottom: 14px; }
    .receipt-category { display: inline-block; background-color: #D99B26; color: #1A1614; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; padding: 4px 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .receipt-body { font-family: 'Georgia', serif; font-size: 15px; color: #1A1614; line-height: 1.6; white-space: pre-wrap; background: #FAF9F6; padding: 14px 18px; border-left: 3px solid #1A1614; }
    .board-note { background-color: #FAF4EB; border-left: 4px solid #C85A32; padding: 14px 18px; margin: 24px 0; font-size: 13px; line-height: 1.5; color: #1A1614; }
    .footer { background-color: #EFECE6; border-top: 2px solid #1A1614; padding: 22px 32px; font-family: 'Courier New', Courier, monospace; font-size: 10px; line-height: 1.5; color: #57524C; }
  </style>
</head>
<body>
  <div style="padding: 16px 8px;">
    <div class="main-wrap">
      <div class="masthead">
        <div class="masthead-sub">THE IDEAS HEARTH · COMMUNITY BLUEPRINT</div>
        <h1 class="masthead-title">OSU Tamil Sangam · Proposal Receipt</h1>
      </div>

      <div class="content">
        <div class="tamil-title">கருத்துக்களம் · உங்கள் ஆலோசனை பெறப்பட்டது</div>
        <h2 class="en-title">Proposal Recorded, ${escapeHtml(author)}</h2>

        <p class="deck">
          Thank you for contributing your voice to the shaping of our community. Your proposal has been pinned to the digital blueprint matrix at <strong>/suggestions</strong>.
        </p>

        <div class="receipt-box">
          <div class="receipt-id">BLUEPRINT DISPATCH // ${escapeHtml(recordId)}</div>
          <div class="receipt-category">${escapeHtml(category)}</div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #57524C; margin-bottom: 10px;">
            PINNED BY: ${escapeHtml(author)} ${email ? `&lt;${escapeHtml(email)}&gt;` : ""}
          </div>
          <div class="receipt-body">"${escapeHtml(message)}"</div>
        </div>

        <div class="board-note">
          <strong style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #C85A32; display: block; margin-bottom: 4px;">
            EXECUTIVE REVIEW PROTOCOL:
          </strong>
          President Meenakshi Varadarajan and the executive board review all community submissions every Sunday during weekly agenda planning. Selected projects are assigned to our student working council for implementation.
        </div>

        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="${GROUPME_URL}" style="display: inline-block; background-color: #1A1614; color: #FAF9F6; text-decoration: none; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; padding: 12px 24px; border: 2px solid #1A1614; box-shadow: 4px 4px 0px #C85A32;" target="_blank">
            JOIN STUDENT GROUPME FOR AGENDA DROPS →
          </a>
        </div>

        <div style="border-top: 1px solid #E5DDD0; padding-top: 20px; margin-top: 28px;">
          <div style="font-family: 'Georgia', serif; font-size: 15px; font-weight: bold; color: #1A1614;">
            Meenakshi Varadarajan
          </div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #57524C; text-transform: uppercase;">
            President, The Ohio State University Tamil Sangam
          </div>
        </div>
      </div>

      <div class="footer">
        <div>OSU TAMIL SANGAM · THE OHIO STATE UNIVERSITY</div>
        <div>${OFFICIAL_DISCLAIMER}</div>
        <div style="margin-top: 8px;">Contact: ${CONTACT_EMAIL} · IG: ${INSTAGRAM_HANDLE}</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `வணக்கம்! (Vanakkam), ${author}!

Your suggestion has been pinned to the digital blueprint:

CATEGORY: ${category}
PROPOSAL:
"${message}"

RECORD ID: ${recordId}

President Meenakshi Varadarajan and the student executive board review all ideas during weekly Sunday planning meetings.

Official Student GroupMe:
${GROUPME_URL}

OSU Tamil Sangam · ${OFFICIAL_DISCLAIMER}
${CONTACT_EMAIL} | Instagram: ${INSTAGRAM_HANDLE}`;

  return { html, text };
}

// =========================================================================
// 3. STAY IN SANGAM DISPATCH CONFIRMATION TEMPLATE
// =========================================================================

export function generateStayInSangamConfirmationHtml(params: {
  email: string;
  name?: string;
  isBuckeye: boolean;
  interests?: string[];
}): { html: string; text: string } {
  const { email, name, isBuckeye, interests } = params;
  const greeting = name ? `Vanakkam, ${name}!` : isBuckeye ? "Vanakkam, Fellow Buckeye!" : "Vanakkam & Welcome!";
  const interestsList = interests && interests.length > 0
    ? interests.map((i) => `<li>▪ <strong>${escapeHtml(i)}</strong></li>`).join("")
    : "<li>▪ <strong>CAMPUS CULTURAL SHOWCASES</strong></li><li>▪ <strong>STREET FOOD & CHAI FEASTS</strong></li><li>▪ <strong>OVAL PICNICS & KICKBACKS</strong></li>";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vanakkam! You're in the Sangam Loop</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F5F2EB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1614; }
    .main-wrap { width: 100%; max-width: 600px; margin: 32px auto; background-color: #FAF9F6; border: 2px solid #1A1614; box-shadow: 6px 6px 0px #1A1614; }
    .masthead { background-color: #1A1614; color: #FAF9F6; padding: 18px 24px; }
    .masthead-sub { font-family: 'Courier New', Courier, monospace; font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: #D99B26; margin: 0 0 4px 0; font-weight: bold; }
    .masthead-title { font-family: 'Georgia', serif; font-size: 20px; font-weight: normal; margin: 0; color: #FAF9F6; }
    .content { padding: 36px 32px; }
    .tamil-title { font-family: 'Mukta Malar', 'Georgia', serif; font-size: 30px; font-weight: bold; color: #C85A32; margin: 0 0 6px 0; }
    .banner-event { background-color: #C85A32; color: #FAF9F6; padding: 12px 18px; font-family: 'Courier New', Courier, monospace; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; margin: 20px 0; border: 2px solid #1A1614; }
    .box-interests { background-color: #F4EFEA; border: 2px solid #1A1614; padding: 18px 22px; margin: 22px 0; }
    .footer { background-color: #EFECE6; border-top: 2px solid #1A1614; padding: 22px 32px; font-family: 'Courier New', Courier, monospace; font-size: 10px; line-height: 1.5; color: #57524C; }
  </style>
</head>
<body>
  <div style="padding: 16px 8px;">
    <div class="main-wrap">
      <div class="masthead">
        <div class="masthead-sub">THE OHIO STATE UNIVERSITY · STUDENT CULTURAL HUB</div>
        <h1 class="masthead-title">OSU Tamil Sangam · Stay in Sangam</h1>
      </div>

      <div class="content">
        <div class="tamil-title">வணக்கம்!</div>
        <h2 style="font-family: 'Georgia', serif; font-size: 24px; font-weight: normal; margin: 0 0 14px 0;">${escapeHtml(greeting)}</h2>

        <div style="display: inline-block; background: #FAF9F6; border: 1px solid #1A1614; padding: 4px 10px; font-family: 'Courier New', Courier, monospace; font-size: 11px; font-weight: bold; margin-bottom: 18px;">
          ${isBuckeye ? "🔴 VERIFIED BUCKEYE STATUS" : "⚪ COMMUNITY MEMBER"}
        </div>

        <p style="font-size: 15px; line-height: 1.6; color: #57524C;">
          You are now plugged directly into our dispatch network. You will receive priority notice on campus feasts, cultural showcases, ticket releases, and casual student kickbacks.
        </p>

        <!-- Date Drop Banner -->
        <div class="banner-event">
          NEXT EVENT: TBA • JOIN GROUPME FOR DATE DROPS
        </div>

        <div class="box-interests">
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #C85A32; font-weight: bold; margin-bottom: 10px;">
            SUBSCRIBED TOPICS:
          </div>
          <ul style="margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.8; color: #1A1614; list-style-type: none;">
            ${interestsList}
          </ul>
        </div>

        <div style="text-align: center; margin: 32px 0 20px 0;">
          <a href="${GROUPME_URL}" style="display: inline-block; background-color: #C85A32; color: #FAF9F6; text-decoration: none; font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; padding: 14px 28px; border: 2px solid #1A1614; box-shadow: 4px 4px 0px #1A1614;" target="_blank">
            JOIN OFFICIAL STUDENT GROUPME →
          </a>
        </div>

        <div style="border-top: 1px solid #E5DDD0; padding-top: 20px; margin-top: 28px;">
          <div style="font-family: 'Georgia', serif; font-size: 15px; font-weight: bold; color: #1A1614;">
            OSU Tamil Sangam Executive Board
          </div>
          <div style="font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #57524C;">
            Columbus, Ohio · The Ohio State University
          </div>
        </div>
      </div>

      <div class="footer">
        <div>OSU TAMIL SANGAM · STAY IN SANGAM ENGINE</div>
        <div>${OFFICIAL_DISCLAIMER}</div>
        <div style="margin-top: 8px;">
          Subscribed address: ${escapeHtml(email)} · To unsubscribe reply with "UNSUBSCRIBE"
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `${greeting}

You are connected to the Stay in Sangam loop!

NEXT EVENT: TBA • Join GroupMe for Date Drops:
${GROUPME_URL}

Expect updates on:
- Priority cultural showcase passes & ticket drops
- South Oval lawn picnics & festival feasts
- Casual campus hangouts

OSU Tamil Sangam · Columbus, OH
${OFFICIAL_DISCLAIMER}`;

  return { html, text };
}
