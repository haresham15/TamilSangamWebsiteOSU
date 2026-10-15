/**
 * Executive Board Discord / Slack / GroupMe Webhook Payloads & Dispatcher
 *
 * Provides formatted embed payloads for OSU Tamil Sangam's active submission flows:
 * 1. "Sign Our Guestbook" (/join)
 * 2. "The Ideas Hearth" (/suggestions)
 * 3. "STAY IN SANGAM" Newsletter (/stay-in-sangam & footer)
 *
 * Directed to President Meenakshi Varadarajan and the 2026 Executive Council.
 */

import { getLedgerStore } from "./ledgerStore";

export type MembershipTrack = "general" | "performer" | "committee";

export interface GuestbookSubmission {
  name: string;
  email: string;
  major: string;
  membershipType: MembershipTrack;
  notes?: string;
  submittedAt?: string;
}

export interface SuggestionSubmission {
  id?: string;
  category: string;
  message: string;
  name?: string;
  email?: string;
  submittedAt?: string;
}

export interface NewsletterSubmission {
  email: string;
  name?: string;
  isBuckeye: boolean;
  interests?: string[];
  submittedAt?: string;
}

const TRACK_LABELS: Record<MembershipTrack, { title: string; badge: string; desc: string }> = {
  general: {
    title: "General Member",
    badge: "🏛️ GENERAL MEMBER",
    desc: "Attend feasts, lawn picnics, and campus socials",
  },
  performer: {
    title: "Dance & Music",
    badge: "💃 DANCE & MUSIC",
    desc: "Kuthu & Gaana dance circles, acoustic music jams",
  },
  committee: {
    title: "Working Council",
    badge: "⚙️ WORKING COUNCIL",
    desc: "Festival organizing, media trailers, and catering",
  },
};

// =========================================================================
// 1. DISCORD EMBED PAYLOAD BUILDERS
// =========================================================================

export function buildGuestbookDiscordEmbed(data: GuestbookSubmission) {
  const trackInfo = TRACK_LABELS[data.membershipType] || TRACK_LABELS.general;
  const isBuckeye = data.email.toLowerCase().endsWith("@osu.edu") || data.email.toLowerCase().endsWith(".osu.edu");
  const timestamp = data.submittedAt || new Date().toISOString();

  return {
    username: "Sangam Hearth Dispatch",
    avatar_url: "https://osutamilsangam.org/logo.svg",
    embeds: [
      {
        title: "🏛️ NEW GUESTBOOK ENTRY — SANGAM HEARTH",
        description: `A new student has signed the digital guestbook and joined **OSU Tamil Sangam**!`,
        color: 0xc85a32, // Terracotta #C85A32
        author: {
          name: "OSU Tamil Sangam · Executive Desk",
          icon_url: "https://osutamilsangam.org/logo.svg",
        },
        fields: [
          {
            name: "👤 Student Name",
            value: `**${data.name}**`,
            inline: true,
          },
          {
            name: "✉️ Buckeye Email",
            value: `\`${data.email}\` ${isBuckeye ? "🔴 *(Verified Buckeye)*" : "⚪ *(Community)*"}`,
            inline: true,
          },
          {
            name: "🎓 Ohio State Major",
            value: `**${data.major || "Undeclared / Not specified"}**`,
            inline: false,
          },
          {
            name: "🎯 Participation Track",
            value: `**${trackInfo.badge}**\n*${trackInfo.desc}*`,
            inline: false,
          },
          {
            name: "📝 Personal Notes / Inquiry",
            value: data.notes?.trim() ? `>>> ${data.notes.trim()}` : "*(None provided)*",
            inline: false,
          },
          {
            name: "📋 Action Checklist",
            value:
              "• [ ] Welcome on GroupMe\n• [ ] Track tagged in Members Ledger\n• [ ] Rehearsal / Meeting invite queued",
            inline: false,
          },
        ],
        footer: {
          text: "OSU Tamil Sangam · Presiding: Meenakshi Varadarajan & Executive Board",
          icon_url: "https://osutamilsangam.org/logo.svg",
        },
        timestamp,
      },
    ],
  };
}

export function buildSuggestionDiscordEmbed(data: SuggestionSubmission) {
  const timestamp = data.submittedAt || new Date().toISOString();
  const authorName = data.name?.trim() || "Anonymous Student";
  const authorContact = data.email?.trim() ? `\`${data.email.trim()}\`` : "*(No email provided)*";

  return {
    username: "The Ideas Hearth",
    avatar_url: "https://osutamilsangam.org/logo.svg",
    embeds: [
      {
        title: `💡 NEW PROPOSAL PINNED — [${data.category.toUpperCase()}]`,
        description: `A new idea was pinned to the digital blueprint at **/suggestions**!`,
        color: 0xd99b26, // Turmeric Gold #D99B26
        author: {
          name: "OSU Tamil Sangam · Blueprint Engine",
          icon_url: "https://osutamilsangam.org/logo.svg",
        },
        fields: [
          {
            name: "🏷️ Category",
            value: `**${data.category}**`,
            inline: true,
          },
          {
            name: "👤 Submitter",
            value: `**${authorName}**\n${authorContact}`,
            inline: true,
          },
          {
            name: "📜 Proposal Text",
            value: `>>> ${data.message}`,
            inline: false,
          },
          {
            name: "🗳️ Executive Board Agenda",
            value: "• [ ] Add to Sunday Agenda\n• [ ] Assign lead officer\n• [ ] Follow up if email provided",
            inline: false,
          },
        ],
        footer: {
          text: "OSU Tamil Sangam · President: Meenakshi Varadarajan",
          icon_url: "https://osutamilsangam.org/logo.svg",
        },
        timestamp,
      },
    ],
  };
}

export function buildNewsletterDiscordEmbed(data: NewsletterSubmission) {
  const timestamp = data.submittedAt || new Date().toISOString();
  const interestsList = data.interests && data.interests.length > 0 ? data.interests.join(", ") : "Events, Feasts, Socials";

  return {
    username: "Stay in Sangam Dispatch",
    avatar_url: "https://osutamilsangam.org/logo.svg",
    embeds: [
      {
        title: "📬 NEW DISPATCH SUBSCRIBER — STAY IN SANGAM",
        description: `New member subscribed for date drops & festival dispatches.`,
        color: 0x8c4a2f, // Deep Terracotta
        author: {
          name: "OSU Tamil Sangam · Dispatch Loop",
          icon_url: "https://osutamilsangam.org/logo.svg",
        },
        fields: [
          {
            name: "✉️ Email",
            value: `\`${data.email}\``,
            inline: true,
          },
          {
            name: "🔴 Status",
            value: data.isBuckeye ? "**Verified Buckeye**" : "**Community / Alumni**",
            inline: true,
          },
          {
            name: "🏷️ Topics / Interests",
            value: interestsList,
            inline: false,
          },
          {
            name: "📢 Next Event Banner",
            value: "NEXT EVENT: TBA • Join GroupMe for Date Drops",
            inline: false,
          },
        ],
        footer: {
          text: "OSU Tamil Sangam · Newsletter Engine",
          icon_url: "https://osutamilsangam.org/logo.svg",
        },
        timestamp,
      },
    ],
  };
}

// =========================================================================
// 2. SLACK BLOCK KIT PAYLOAD BUILDERS
// =========================================================================

export function buildGuestbookSlackPayload(data: GuestbookSubmission) {
  const trackInfo = TRACK_LABELS[data.membershipType] || TRACK_LABELS.general;
  return {
    text: `🏛️ *New Guestbook Entry:* ${data.name} (${trackInfo.title})`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🏛️ NEW GUESTBOOK ENTRY — SANGAM HEARTH",
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Student Name:*\n${data.name}` },
          { type: "mrkdwn", text: `*Buckeye Email:*\n<mailto:${data.email}|${data.email}>` },
          { type: "mrkdwn", text: `*OSU Major:*\n${data.major || "Undeclared"}` },
          { type: "mrkdwn", text: `*Track:*\n${trackInfo.badge}` },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Personal Notes / Questions:*\n>${data.notes || "_(None provided)_"}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `📍 Presiding: *Meenakshi Varadarajan & Executive Board* · Submitted at ${data.submittedAt || new Date().toLocaleString()}`,
          },
        ],
      },
      { type: "divider" },
    ],
  };
}

export function buildSuggestionSlackPayload(data: SuggestionSubmission) {
  return {
    text: `💡 *New Proposal Pinned:* [${data.category}] by ${data.name || "Anonymous"}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `💡 NEW PROPOSAL PINNED — ${data.category.toUpperCase()}`,
          emoji: true,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Category:*\n${data.category}` },
          {
            type: "mrkdwn",
            text: `*From:*\n${data.name || "Anonymous"} ${data.email ? `(<mailto:${data.email}|${data.email}>)` : ""}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Proposal:*\n>${data.message}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `📌 OSU Tamil Sangam Blueprint Engine · For review by *President Meenakshi Varadarajan*`,
          },
        ],
      },
      { type: "divider" },
    ],
  };
}

// =========================================================================
// 3. GROUPME BOT MESSAGE BUILDERS
// =========================================================================

export function buildGuestbookGroupMeText(data: GuestbookSubmission): string {
  const trackInfo = TRACK_LABELS[data.membershipType] || TRACK_LABELS.general;
  return `[TAMIL SANGAM GUESTBOOK] 🏛️\nNew Member: ${data.name}\nEmail: ${data.email}\nMajor: ${data.major || "Undeclared"}\nTrack: ${trackInfo.title}\nNotes: ${data.notes || "None"}\nWelcome to the Hearth!`;
}

export function buildSuggestionGroupMeText(data: SuggestionSubmission): string {
  return `[THE IDEAS HEARTH] 💡\nCategory: ${data.category}\nFrom: ${data.name || "Anonymous"}\nProposal: ${data.message}`;
}

// =========================================================================
// 4. UNIFIED WEBHOOK DISPATCHER
// =========================================================================

export interface WebhookLogRecord {
  id: string;
  flow: "guestbook" | "suggestion" | "newsletter";
  dispatchedAt: string;
  targets: string[];
  payloadSummary: string;
  success: boolean;
}

export async function dispatchBoardNotification(
  flow: "guestbook" | "suggestion" | "newsletter",
  data: GuestbookSubmission | SuggestionSubmission | NewsletterSubmission
): Promise<{ success: boolean; dispatchedTo: string[] }> {
  const dispatchedTo: string[] = [];
  const urls: { type: "discord" | "slack" | "groupme" | "generic"; url: string }[] = [];

  // 1. Gather all configured destinations from environment
  const discordUrl = process.env.DISCORD_WEBHOOK_URL || process.env.BOARD_DISCORD_WEBHOOK;
  const slackUrl = process.env.SLACK_WEBHOOK_URL || process.env.BOARD_SLACK_WEBHOOK;
  const boardUrl = process.env.BOARD_WEBHOOK_URL;
  const groupMeUrl = process.env.GROUPME_WEBHOOK_URL;
  const groupMeBotId = process.env.GROUPME_BOT_ID;

  if (discordUrl) urls.push({ type: "discord", url: discordUrl });
  if (slackUrl) urls.push({ type: "slack", url: slackUrl });
  if (boardUrl && !urls.some((u) => u.url === boardUrl)) {
    // Detect Discord vs Slack URL structure
    if (boardUrl.includes("discord.com/api/webhooks")) {
      urls.push({ type: "discord", url: boardUrl });
    } else if (boardUrl.includes("hooks.slack.com")) {
      urls.push({ type: "slack", url: boardUrl });
    } else {
      urls.push({ type: "generic", url: boardUrl });
    }
  }

  // 2. Dispatch to Discord endpoints
  for (const item of urls.filter((u) => u.type === "discord")) {
    try {
      let body: unknown;
      if (flow === "guestbook") body = buildGuestbookDiscordEmbed(data as GuestbookSubmission);
      else if (flow === "suggestion") body = buildSuggestionDiscordEmbed(data as SuggestionSubmission);
      else body = buildNewsletterDiscordEmbed(data as NewsletterSubmission);

      const res = await fetch(item.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        dispatchedTo.push("discord");
      } else {
        console.warn(`[BoardWebhook] Discord dispatch returned status ${res.status}`);
      }
    } catch (err) {
      console.warn("[BoardWebhook] Discord dispatch error:", err);
    }
  }

  // 3. Dispatch to Slack endpoints
  for (const item of urls.filter((u) => u.type === "slack")) {
    try {
      let body: unknown;
      if (flow === "guestbook") body = buildGuestbookSlackPayload(data as GuestbookSubmission);
      else if (flow === "suggestion") body = buildSuggestionSlackPayload(data as SuggestionSubmission);
      else body = { text: `New newsletter subscription: ${(data as NewsletterSubmission).email}` };

      const res = await fetch(item.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        dispatchedTo.push("slack");
      }
    } catch (err) {
      console.warn("[BoardWebhook] Slack dispatch error:", err);
    }
  }

  // 4. Dispatch to GroupMe Bot if configured
  if (groupMeBotId || groupMeUrl) {
    try {
      let text = "";
      if (flow === "guestbook") text = buildGuestbookGroupMeText(data as GuestbookSubmission);
      else if (flow === "suggestion") text = buildSuggestionGroupMeText(data as SuggestionSubmission);
      else text = `[TAMIL SANGAM DISPATCH] 📬\nNew subscriber: ${(data as NewsletterSubmission).email}`;

      const targetUrl = groupMeUrl || "https://api.groupme.com/v3/bots/post";
      const body = groupMeBotId ? { bot_id: groupMeBotId, text } : { text };

      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) dispatchedTo.push("groupme");
    } catch (err) {
      console.warn("[BoardWebhook] GroupMe dispatch error:", err);
    }
  }

  // 5. Always record to local ledger data/webhook-log.json for developer/officer auditing
  const logRecord: WebhookLogRecord = {
    id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    flow,
    dispatchedAt: new Date().toISOString(),
    targets: dispatchedTo.length > 0 ? dispatchedTo : ["local-audit-ledger"],
    payloadSummary:
      flow === "guestbook"
        ? `Guestbook: ${(data as GuestbookSubmission).name} (${(data as GuestbookSubmission).membershipType})`
        : flow === "suggestion"
        ? `Suggestion: [${(data as SuggestionSubmission).category}] ${(data as SuggestionSubmission).message.substring(0, 40)}...`
        : `Newsletter: ${(data as NewsletterSubmission).email}`,
    success: dispatchedTo.length > 0 || urls.length === 0,
  };

  try {
    getLedgerStore().update("webhook-log.json", (): WebhookLogRecord[] => [], (logs) => {
      logs.unshift(logRecord);
      if (logs.length > 200) logs.length = 200;
    });
  } catch (err) {
    console.error("[BoardWebhook] Failed to write local log:", err);
  }

  return {
    success: true,
    dispatchedTo: dispatchedTo.length > 0 ? dispatchedTo : ["local-audit-ledger"],
  };
}
