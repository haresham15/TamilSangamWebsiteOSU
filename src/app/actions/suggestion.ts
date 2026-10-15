"use server";

import { CONTACT_EMAIL } from "@/lib/constants";
import { dispatchEmail, validateEmail, generateIdeasHearthConfirmationHtml } from "@/lib/email";
import { getLedgerStore } from "@/lib/ledgerStore";
import { escapeHtml } from "@/lib/html";
import { dispatchBoardNotification } from "@/lib/webhooks";

export interface SuggestionRecord {
  id: string;
  category: string;
  message: string;
  name?: string;
  email?: string;
  submittedAt: string;
}

export interface SuggestionActionState {
  success: boolean;
  message?: string;
  error?: string;
  pin?: {
    id: string;
    x: number;
    y: number;
  };
}

export async function submitSuggestion(
  prevState: SuggestionActionState,
  formData: FormData
): Promise<SuggestionActionState> {
  try {
    const hp = (formData.get("hp") || formData.get("website")) as string | null;
    // Honeypot bot protection: silent success for bots
    if (hp) {
      return {
        success: true,
        message: "Thank you for your suggestion!",
        pin: {
          id: `pin-${Date.now()}`,
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 4,
        },
      };
    }

    // Minimum fill time check (prevents automated instant POST spam)
    const timestampStr = (formData.get("timestamp") || formData.get("form_timestamp")) as string | null;
    if (timestampStr) {
      const renderTime = parseInt(timestampStr, 10);
      const elapsedMs = Date.now() - renderTime;
      if (!isNaN(renderTime) && elapsedMs < 1200) {
        return {
          success: false,
          error: "Form was submitted too quickly. Please take a moment to review your message.",
        };
      }
    }

    const message = (formData.get("message") as string || "").trim();
    const category = (formData.get("category") as string || "").trim();
    const name = (formData.get("name") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();

    if (!message || message.length < 5) {
      return {
        success: false,
        error: "Please write a suggestion of at least 5 characters.",
      };
    }

    if (message.length > 2500) {
      return {
        success: false,
        error: "Suggestion is too long (maximum 2,500 characters).",
      };
    }

    const validCategories = [
      "Event idea",
      "Website feedback",
      "New initiative",
      "Partnership",
      "Something else",
    ];

    const sanitizedCategory = validCategories.includes(category)
      ? category
      : "Something else";

    // Validate email only if provided
    let verifiedEmail = "";
    if (email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        return {
          success: false,
          error: emailValidation.error || "Please enter a valid email address.",
        };
      }
      verifiedEmail = emailValidation.normalizedEmail;
    }

    const newRecord: SuggestionRecord = {
      id: `sugg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category: sanitizedCategory,
      message,
      name: name || "Anonymous Student",
      email: verifiedEmail || undefined,
      submittedAt: new Date().toISOString(),
    };

    // 1. Log to local data/suggestions.json ledger (Admin pattern)
    getLedgerStore().update("suggestions.json", (): SuggestionRecord[] => [], (existing) => {
      existing.unshift(newRecord);
      if (existing.length > 500) existing.length = 500;
    });

    // 2. Dispatch executive board notification card to Discord / Slack / GroupMe
    await dispatchBoardNotification("suggestion", {
      id: newRecord.id,
      category: sanitizedCategory,
      message,
      name: name || undefined,
      email: verifiedEmail || undefined,
      submittedAt: newRecord.submittedAt,
    }).catch((err) => console.warn("[Suggestions] Board webhook dispatch error:", err));

    // 3. Dispatch brutalist notification email to official executive board contact address
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 2px solid #1A1614; background-color: #FAF9F6; box-shadow: 4px 4px 0px #1A1614;">
        <div style="background-color: #1A1614; color: #FAF9F6; padding: 12px 16px; margin: -24px -24px 20px -24px;">
          <span style="font-family: monospace; font-size: 10px; letter-spacing: 2px; color: #D99B26; text-transform: uppercase;">THE IDEAS HEARTH · INTERNAL OFFICER ALERT</span>
          <h2 style="margin: 4px 0 0 0; font-size: 18px; color: #FAF9F6; font-family: Georgia, serif;">New Community Proposal Pinned</h2>
        </div>
        <p style="font-size: 14px; color: #57524C;">A visitor submitted a new proposal via the <strong>/suggestions</strong> blueprint matrix:</p>
        
        <div style="background-color: #F4EFEA; border: 2px solid #1A1614; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-family: monospace; text-transform: uppercase; color: #C85A32; font-weight: bold;">
            [CATEGORY]: <span>${sanitizedCategory}</span>
          </p>
          <p style="margin: 0 0 8px 0; font-size: 12px; font-family: monospace; text-transform: uppercase; color: #57524C;">
            [FROM]: <strong>${escapeHtml(name || "Anonymous")}</strong> ${verifiedEmail ? `&lt;${escapeHtml(verifiedEmail)}&gt;` : "(No email provided)"}
          </p>
          <p style="margin: 12px 0 0 0; font-size: 14px; color: #1A1614; line-height: 1.6; white-space: pre-wrap; font-family: Georgia, serif;">${escapeHtml(message)}</p>
        </div>

        <p style="font-family: monospace; font-size: 11px; color: #78716C; margin-top: 24px; border-top: 1px solid #E5DDD0; padding-top: 12px;">
          Submitted at: ${newRecord.submittedAt}<br/>
          OSU Tamil Sangam · Presiding: President Meenakshi Varadarajan
        </p>
      </div>
    `;

    const emailText = `New Community Suggestion Received
Category: ${sanitizedCategory}
From: ${name || "Anonymous"} (${verifiedEmail || "No email"})
Time: ${newRecord.submittedAt}

Message:
${message}
`;

    // Fire and await dispatch using existing provider
    const notification = await dispatchEmail({
      to: CONTACT_EMAIL,
      subject: `[Sangam Suggestion] ${sanitizedCategory}: ${message.substring(0, 50)}...`,
      html: emailHtml,
      text: emailText,
    });

    // 4. Dispatch brutalist confirmation receipt if user provided email
    if (verifiedEmail) {
      const confirmationEmail = generateIdeasHearthConfirmationHtml({
        name: name || undefined,
        email: verifiedEmail,
        category: sanitizedCategory,
        message,
        id: newRecord.id,
      });

      await dispatchEmail({
        to: verifiedEmail,
        subject: `Proposal Pinned to the Hearth: [${sanitizedCategory}] · OSU Tamil Sangam`,
        html: confirmationEmail.html,
        text: confirmationEmail.text,
      }).catch((err) => console.warn("[Suggestions] Submitter receipt email error:", err));
    }

    return {
      success: true,
      message: notification.success
        ? "Your suggestion has been pinned to the blueprint and sent to the board!"
        : "Your suggestion has been saved for the board to review. Email notification is currently unavailable.",
      pin: {
        id: newRecord.id,
        // Calculate a harmonious position in the blueprint quad area
        x: (Math.random() - 0.5) * 5.5,
        y: (Math.random() - 0.5) * 3.5,
      },
    };
  } catch (err) {
    console.error("[Suggestions Action Error]:", err);
    return {
      success: false,
      error: "Something went wrong saving your suggestion. Please try again or email osutamilsangam@gmail.com directly.",
    };
  }
}
