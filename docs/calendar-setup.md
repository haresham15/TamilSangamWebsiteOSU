# Google Calendar Integration & Officer Guide

This document outlines the setup, authoring conventions, and troubleshooting for the live Google Calendar integration on the [OSU Tamil Sangam](https://tamil-sangam-website-osu.vercel.app) website.

The integration syncs events from a shared Google Calendar to the website automatically within ~5 minutes via Next.js Incremental Static Regeneration (ISR), requiring no code edits or manual redeploys.

---

## 1. Google Calendar Setup (One-time Club Account Setup)

1. **Sign in to Google Calendar** using the official club account (`osutamilsangam@gmail.com`).
2. On the left sidebar under "Other calendars", click **+** $\rightarrow$ **Create new calendar**.
3. Name it: `OSU Tamil Sangam Events` (Time zone: `(GMT-05:00) Eastern Time - New York`). Click **Create calendar**.
4. In the calendar settings under **Access permissions for events**:
   - Check **Make available to public**.
   - Ensure the dropdown is set to **See all event details** (not just "See only free/busy").
5. Under **Share with specific people or groups**:
   - Click **Add people and groups**.
   - Add the executive board officers' university or personal Google emails.
   - Set their permission level to: **Make changes to events**.
6. Scroll down to **Integrate calendar**:
   - Find and copy the **Calendar ID** (looks like `c_xxxxxxxxxxxxxxxxxxxxxxxxxx@group.calendar.google.com` or `osutamilsangam@gmail.com`).

---

## 2. Google Cloud API Key (One-time Setup)

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Select or create a new project named `OSU-Tamil-Sangam-Web`.
3. Go to **APIs & Services** $\rightarrow$ **Library**.
4. Search for **Google Calendar API** and click **Enable**.
5. Go to **APIs & Services** $\rightarrow$ **Credentials**:
   - Click **+ CREATE CREDENTIALS** $\rightarrow$ **API key**.
   - Copy the generated API key.
6. Click **Edit API key** to configure security restrictions:
   - Under **API restrictions**: Select **Restrict key** $\rightarrow$ check **Google Calendar API** only.
   - Under **Application restrictions**: Since requests are made exclusively server-side from Next.js server components and route handlers, leave Application restrictions as "None" or restrict to server IP addresses if desired. The API key is **never bundled or transmitted to the client browser**.
   - Click **Save**.

---

## 3. Vercel Environment Variables Configuration

1. Log into your [Vercel Dashboard](https://vercel.com/) and navigate to the `TamilSangamWebsiteOSU` project.
2. Go to **Settings** $\rightarrow$ **Environment Variables**.
3. Add the following two environment variables for **Production**, **Preview**, and **Development**:

| Variable Name | Value | Purpose |
| :--- | :--- | :--- |
| `GOOGLE_CALENDAR_ID` | `c_xxxxxxxxxxxx@group.calendar.google.com` | Club Google Calendar ID |
| `GOOGLE_CALENDAR_API_KEY` | `AIzaSy...` | Restricted Google Cloud API key |

1. After saving the variables, trigger a **Redeploy** on Vercel (or push a new commit) for the variables to take effect.

---

## 4. Officer Cheat Sheet: How to Add & Format Events

Any officer with edit permissions can create or update events directly in Google Calendar on their phone or laptop. Events appear on the website within ~5 minutes.

### A. Title Convention (Bilingual)

Format: `English Title | தமிழ் தலைப்பு`

- Use a single vertical bar (`|`) to separate the English title from the Tamil title.
- *Example:* `Kollywood Kollai | கோலிவுட் கொள்ளை`
- *Example:* `Pongal Thiruvizha | பொங்கல் திருவிழா`
- If no Tamil title is available, simply write the English title (`Chai & Chill`).

### B. Date & Time

- Always create events in **Eastern Time (ET / America/New_York)**.
- Both timed events (e.g., 6:30 PM – 9:00 PM) and all-day events are supported.
- For all-day cultural holidays or multi-day conventions, select "All day". The website automatically normalizes Google's end-date conventions.

### C. Location Field

- Enter the campus venue or room.
- *Examples:* `Performance Hall, Ohio Union`, `The Oval`, `Hitchcock Hall 131`.

### D. Description Field (Blurb & Dossier Link)

- Write the event summary, what to bring, and itinerary details.
- Standard URLs (e.g., `https://...`) are automatically converted into clickable, safe links on the website.
- **Optional Dossier Slug:** If the event has a dedicated dossier page on the website (e.g., `/events/kollywood-kollai`), add this as the **very last line** of the description:

  ```text
  slug: kollywood-kollai
  ```

  When present, the website modal will render an **"Open event dossier →"** link directly to that page.

---

## 5. Public Subscription Links

The website provides student subscription buttons:

- **Google Calendar Subscription:** `https://calendar.google.com/calendar/r?cid={CALENDAR_ID}`
- **Apple Calendar / Outlook (Webcal):** `webcal://calendar.google.com/calendar/ical/{CALENDAR_ID}/public/basic.ics`
- **Dynamic Site Feed:** `https://tamil-sangam-website-osu.vercel.app/calendars/almanac.ics`

---

## 6. Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Event not showing on website** | Calendar is not set to public | In Calendar Settings, verify "Make available to public" is checked with "See all event details". |
| **Event not showing** | Event was cancelled or outside time window | Check if the event is marked cancelled. Events further than 18 months in the future or in past academic years are filtered out. |
| **Edits not updating immediately** | ISR Cache interval | Next.js caches calendar responses for 300 seconds (5 minutes). Wait 5 minutes and refresh `/events`. |
| **Wrong time displayed** | Time zone mismatch | Verify the event in Google Calendar is set to `America/New_York` (Eastern Time). |
| **"Calendar is taking a nap" message** | API key or Calendar ID missing or invalid | Check Vercel logs. Verify `GOOGLE_CALENDAR_ID` and `GOOGLE_CALENDAR_API_KEY` are properly defined without leading/trailing whitespace. |
