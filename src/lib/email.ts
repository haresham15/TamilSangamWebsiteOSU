import { getLedgerStore } from "./ledgerStore";

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
 * Persists subscriber records transactionally, importing the legacy JSON ledger on first update.
 */
export async function saveSubscriber(data: {
  email: string;
  name?: string;
  isBuckeye: boolean;
  interests?: string[];
  source?: string;
}): Promise<{ total: number; isNew: boolean; record: SubscriberRecord }> {
  return getLedgerStore().update("subscribers.json", (): SubscriberLedger => ({
    subscribers: [],
    stats: { total: 0, buckeyes: 0, lastUpdated: new Date().toISOString() },
  }), (ledger) => {

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

  return { total: ledger.stats.total, isNew, record };
  });
}

/**
 * Retrieves subscriber statistics for monitoring
 */
export async function getSubscribersStats(): Promise<{
  total: number;
  buckeyes: number;
  lastUpdated: string;
}> {
  return getLedgerStore().read("subscribers.json", (): SubscriberLedger => ({
    subscribers: [],
    stats: { total: 0, buckeyes: 0, lastUpdated: new Date().toISOString() },
  })).stats;
}

import {
  generateStayInSangamConfirmationHtml,
  generateGuestbookConfirmationHtml,
  generateIdeasHearthConfirmationHtml,
} from "./brutalistEmailTemplates";

export {
  generateGuestbookConfirmationHtml,
  generateIdeasHearthConfirmationHtml,
  generateStayInSangamConfirmationHtml,
};

/**
 * Generates an accessible, branded brutalist HTML welcome email for Stay in Sangam
 */
export function generateWelcomeEmailHtml(params: {
  email: string;
  name?: string;
  isBuckeye: boolean;
  interests?: string[];
}): { html: string; text: string } {
  return generateStayInSangamConfirmationHtml(params);
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
        signal: AbortSignal.timeout(6000),
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
          html: payload.html,
          text: payload.text,
        }),
        signal: AbortSignal.timeout(6000),
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
  const providerConfigured = Boolean(process.env.RESEND_API_KEY || process.env.NEWSLETTER_WEBHOOK_URL);
  // A local receipt records the attempt, never claims an email was delivered.
  getLedgerStore().update("dispatches.json", (): Array<{ to: string; subject: string; sentAt: string }> => [], (dispatches) => {
    dispatches.unshift({
      to: payload.to,
      subject: payload.subject,
      sentAt: new Date().toISOString(),
    });

    if (dispatches.length > 100) dispatches.length = 100;
  });

  return {
    success: false,
    provider: "local-receipt",
    messageId: `receipt_${Date.now()}`,
    error: providerConfigured ? "Email provider failed" : "Email delivery is not configured",
  };
}
