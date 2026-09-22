import fs from "fs/promises";
import path from "path";

export interface SubscriberRecord {
  id: string;
  email: string;
  name?: string;
  isBuckeye: boolean;
  interests?: string[];
  source: string;
  subscribedAt: string;
  lastActiveAt: string;
  status: "active" | "unsubscribed";
}

export interface SubscriberLedger {
  subscribers: SubscriberRecord[];
  stats: {
    total: number;
    buckeyes: number;
    lastUpdated: string;
  };
}

export interface EmailDispatchResult {
  success: boolean;
  provider: "resend" | "webhook" | "smtp" | "local-receipt";
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Validates and normalizes an email address, checking for OSU BuckeyeMail
 */
export function validateEmail(input: string): {
  isValid: boolean;
  normalizedEmail: string;
  isBuckeye: boolean;
  error?: string;
} {
  if (!input || typeof input !== "string") {
    return { isValid: false, normalizedEmail: "", isBuckeye: false, error: "Email is required." };
  }

  const normalized = input.trim().toLowerCase();

  if (normalized.length < 5 || normalized.length > 254) {
    return { isValid: false, normalizedEmail: normalized, isBuckeye: false, error: "Email length is invalid." };
  }

  // Standard RFC-compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(normalized)) {
    return { isValid: false, normalizedEmail: normalized, isBuckeye: false, error: "Please enter a valid email address." };
  }

  const isBuckeye = normalized.endsWith("@osu.edu") || normalized.endsWith(".osu.edu");

  return { isValid: true, normalizedEmail: normalized, isBuckeye };
}

/**
 * Persists subscriber record to data/subscribers.json
 */
export async function saveSubscriber(data: {
  email: string;
  name?: string;
  isBuckeye: boolean;
  interests?: string[];
  source?: string;
}): Promise<{ total: number; isNew: boolean; record: SubscriberRecord }> {
  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "subscribers.json");

  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {
    // directory exists or cannot be created
  }

  let ledger: SubscriberLedger = {
    subscribers: [],
    stats: { total: 0, buckeyes: 0, lastUpdated: new Date().toISOString() },
  };

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    ledger = JSON.parse(raw);
  } catch {
    // file does not exist yet; default ledger initialized
  }

  const existingIdx = ledger.subscribers.findIndex((s) => s.email === data.email);
  const now = new Date().toISOString();

  let record: SubscriberRecord;
  let isNew = false;

  if (existingIdx >= 0) {
    // Update existing subscriber
    record = {
      ...ledger.subscribers[existingIdx],
      name: data.name || ledger.subscribers[existingIdx].name,
      interests: data.interests || ledger.subscribers[existingIdx].interests,
      lastActiveAt: now,
      status: "active",
    };
    ledger.subscribers[existingIdx] = record;
  } else {
    // Add new subscriber
    isNew = true;
    record = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: data.email,
      name: data.name,
      isBuckeye: data.isBuckeye,
      interests: data.interests || ["events", "food", "social"],
      source: data.source || "stay-in-sangam",
      subscribedAt: now,
      lastActiveAt: now,
      status: "active",
    };
    ledger.subscribers.unshift(record);
  }

  // Update statistics
  const activeSubscribers = ledger.subscribers.filter((s) => s.status === "active");
  ledger.stats = {
    total: activeSubscribers.length,
    buckeyes: activeSubscribers.filter((s) => s.isBuckeye).length,
    lastUpdated: now,
  };

  try {
    await fs.writeFile(filePath, JSON.stringify(ledger, null, 2), "utf-8");
  } catch (err) {
    console.error("[StayInSangam] Failed to persist subscriber file:", err);
  }

  return { total: ledger.stats.total, isNew, record };
}

/**
 * Retrieves subscriber statistics for monitoring
 */
export async function getSubscribersStats(): Promise<{
  total: number;
  buckeyes: number;
  lastUpdated: string;
}> {
  const filePath = path.join(process.cwd(), "data", "subscribers.json");
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const ledger: SubscriberLedger = JSON.parse(raw);
    return ledger.stats;
  } catch {
    return { total: 0, buckeyes: 0, lastUpdated: new Date().toISOString() };
  }
}

/**
 * Generates an accessible, branded HTML welcome email
 */
export function generateWelcomeEmailHtml(params: {
  email: string;
  name?: string;
  isBuckeye: boolean;
  interests?: string[];
}): { html: string; text: string } {
  const { email, name, isBuckeye, interests } = params;
  const greeting = name ? `Vanakkam, ${name}!` : isBuckeye ? "Vanakkam, Fellow Buckeye!" : "Vanakkam & Welcome!";

  const interestsList = interests && interests.length > 0
    ? interests.map((i) => `<li>• ${i.charAt(0).toUpperCase() + i.slice(1)}</li>`).join("")
    : "<li>• Flagship cultural festivals & ticket drops</li><li>• Authentic street food feasts & chai socials</li><li>• Casual Oval lawn kickbacks & games</li>";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the OSU Tamil Sangam Family</title>
  <style>
    body { margin: 0; padding: 0; background-color: #1c082b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; background-color: #250d38; border: 2px solid #55CCA2; box-shadow: 6px 6px 0px #55CCA2; }
    .header { padding: 32px 24px 20px; text-align: center; border-bottom: 2px solid rgba(85, 204, 162, 0.4); }
    .subhead { font-family: monospace; font-size: 11px; text-transform: uppercase; color: #55CCA2; letter-spacing: 2px; font-weight: bold; margin-bottom: 8px; }
    .title { font-size: 26px; font-weight: 800; color: #ffffff; margin: 0; line-height: 1.2; }
    .content { padding: 28px 24px; font-size: 14px; line-height: 1.6; color: #e2d9eb; }
    .greeting { font-size: 18px; font-weight: bold; color: #55CCA2; margin-bottom: 12px; }
    .badge { display: inline-block; padding: 4px 10px; background-color: #160724; border: 1px solid #55CCA2; color: #55CCA2; font-family: monospace; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; }
    .box { background-color: #190927; border: 1px solid rgba(255, 255, 255, 0.15); padding: 16px; margin: 18px 0; border-left: 4px solid #55CCA2; }
    .box-title { font-weight: bold; color: #ffffff; font-size: 13px; text-transform: uppercase; margin-bottom: 6px; font-family: monospace; }
    .btn { display: inline-block; background-color: #55CCA2; color: #1b0d28; text-decoration: none; padding: 12px 24px; font-weight: bold; font-size: 13px; text-transform: uppercase; font-family: monospace; letter-spacing: 1px; border: 2px solid #1b0d28; box-shadow: 3px 3px 0px #ffffff; margin-top: 10px; }
    .footer { padding: 24px; text-align: center; font-size: 11px; color: #9c8aab; border-top: 1px solid rgba(255, 255, 255, 0.1); font-family: monospace; }
    ul { margin: 8px 0 12px; padding-left: 20px; list-style-type: none; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="container">
      <div class="header">
        <div class="subhead">The Ohio State University · Student Cultural Hub</div>
        <h1 class="title">OSU Tamil Sangam · Stay in Sangam</h1>
      </div>

      <div class="content">
        <div class="greeting">${greeting}</div>
        <div class="badge">${isBuckeye ? "✓ Verified Buckeye Mail" : "✓ Sangam Member"}</div>

        <p>
          You are now officially plugged into the <strong>Stay in Sangam</strong> loop! Whether you speak Tamil or just love great food, energetic music, casual hangouts, and friendly people — our club is an open home for all Buckeyes.
        </p>

        <div class="box">
          <div class="box-title">What You Will Receive:</div>
          <ul>
            ${interestsList}
          </ul>
        </div>

        <p>
          Our day-to-day announcements, rideshares, lunch kickbacks, and ticket drop links are shared on our active student GroupMe:
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://groupme.com/join_group/osutamilsangam" class="btn" target="_blank">
            Join Official Student GroupMe →
          </a>
        </div>

        <p style="font-size: 12px; color: #bcaec9;">
          Have questions or ideas for events? Reply directly to this email or DM us on Instagram at <strong>@osutamilsangam</strong>.
        </p>
      </div>

      <div class="footer">
        <p>© ${new Date().getFullYear()} The Ohio State University Tamil Sangam.</p>
        <p>Columbus, OH · A registered student organization at Ohio State.</p>
        <p style="font-size: 10px; color: #7a6a8a; margin-top: 8px;">
          You received this because ${email} was subscribed via the Stay in Sangam portal.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text = `${greeting}

You are officially connected to the OSU Tamil Sangam family!

What to expect:
- Early bird tickets for flagship events like Pattas Tappas Diwali
- Free food & chai alerts (Streetside Sapad, Oval picnics)
- Casual student meetups, Uno games, and cultural celebrations
- Open and welcoming to students of all languages and backgrounds

Join our official student GroupMe:
https://groupme.com/join_group/osutamilsangam

Instagram: @osutamilsangam
Website: https://osutamilsangam.org

(c) ${new Date().getFullYear()} OSU Tamil Sangam · Columbus, OH
Subscribed email: ${email}`;

  return { html, text };
}

/**
 * Dispatches an email using the best available configured provider:
 * 1. Resend API (if RESEND_API_KEY is present)
 * 2. Webhook Dispatcher (if NEWSLETTER_WEBHOOK_URL is present)
 * 3. Local Dispatch Receipt (development and fallback mode)
 */
export async function dispatchEmail(payload: EmailPayload): Promise<EmailDispatchResult> {
  const fromEmail = process.env.EMAIL_FROM || "OSU Tamil Sangam <updates@osutamilsangam.org>";

  // Provider 1: Resend HTTP API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          provider: "resend",
          messageId: data?.id,
        };
      } else {
        const errorText = await res.text();
        console.warn("[StayInSangam] Resend API responded with error:", errorText);
      }
    } catch (err) {
      console.warn("[StayInSangam] Resend API call failed, attempting fallback:", err);
    }
  }

  // Provider 2: Webhook / Automation Endpoint (Zapier / Make / Slack / Mailchimp)
  if (process.env.NEWSLETTER_WEBHOOK_URL) {
    try {
      const webhookRes = await fetch(process.env.NEWSLETTER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "newsletter.subscribed",
          to: payload.to,
          subject: payload.subject,
          timestamp: new Date().toISOString(),
          snippet: payload.text.substring(0, 200),
        }),
      });

      if (webhookRes.ok) {
        return {
          success: true,
          provider: "webhook",
          messageId: `wh_${Date.now()}`,
        };
      }
    } catch (err) {
      console.warn("[StayInSangam] Webhook dispatch failed:", err);
    }
  }

  // Provider 3: Local Dispatch Receipt
  // Saves dispatch payload to data/dispatches.json and logs receipt
  const dispatchesPath = path.join(process.cwd(), "data", "dispatches.json");
  try {
    let dispatches: Array<{ to: string; subject: string; sentAt: string }> = [];
    try {
      const raw = await fs.readFile(dispatchesPath, "utf-8");
      dispatches = JSON.parse(raw);
    } catch {
      // file does not exist yet
    }

    dispatches.unshift({
      to: payload.to,
      subject: payload.subject,
      sentAt: new Date().toISOString(),
    });

    if (dispatches.length > 100) dispatches = dispatches.slice(0, 100);
    await fs.writeFile(dispatchesPath, JSON.stringify(dispatches, null, 2), "utf-8");
  } catch (err) {
    console.error("[StayInSangam] Failed to record local dispatch:", err);
  }

  console.log(`[StayInSangam Dispatch] Dispatched email to: ${payload.to} | Subject: "${payload.subject}"`);

  return {
    success: true,
    provider: "local-receipt",
    messageId: `receipt_${Date.now()}`,
  };
}
