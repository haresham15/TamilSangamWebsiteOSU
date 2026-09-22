"use server";

import fs from "fs/promises";
import path from "path";
import { CONTACT_EMAIL } from "@/lib/constants";
import { dispatchEmail, validateEmail } from "@/lib/email";

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
    const hp = formData.get("hp") as string | null;
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
    const timestampStr = formData.get("timestamp") as string | null;
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
    const dataDir = path.join(process.cwd(), "data");
    const suggestionsFile = path.join(dataDir, "suggestions.json");

    try {
      let existing: SuggestionRecord[] = [];
      try {
        const raw = await fs.readFile(suggestionsFile, "utf-8");
        existing = JSON.parse(raw);
      } catch {
        // file doesn't exist yet
      }

      existing.unshift(newRecord);
      if (existing.length > 500) existing = existing.slice(0, 500);

      await fs.writeFile(suggestionsFile, JSON.stringify(existing, null, 2), "utf-8");
    } catch (err) {
      console.error("[Suggestions] Failed to save to data/suggestions.json:", err);
    }

    // 2. Dispatch notification email to official executive board contact address
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #250d38; margin-top: 0;">New Community Suggestion Received</h2>
        <p style="font-size: 14px; color: #64748b;">A visitor submitted a new idea via the <strong>/suggestions</strong> blueprint portal:</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #475569;">
            CATEGORY: <span style="color: #b45309;">${sanitizedCategory}</span>
          </p>
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #475569;">
            FROM: <strong>${name || "Anonymous"}</strong> ${verifiedEmail ? `&lt;${verifiedEmail}&gt;` : "(No email provided)"}
          </p>
          <p style="margin: 12px 0 0 0; font-size: 15px; color: #1e293b; line-height: 1.5; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">
          Submitted at: ${newRecord.submittedAt}<br/>
          OSU Tamil Sangam · Blueprint Suggestion Engine
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
    await dispatchEmail({
      to: CONTACT_EMAIL,
      subject: `[Sangam Suggestion] ${sanitizedCategory}: ${message.substring(0, 50)}...`,
      html: emailHtml,
      text: emailText,
    });

    // Optional confirmation receipt if user provided email
    if (verifiedEmail) {
      await dispatchEmail({
        to: verifiedEmail,
        subject: "We received your suggestion! · OSU Tamil Sangam",
        html: `
          <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #250d38; margin-top: 0;">Vanakkam${name ? ` ${name}` : ""}!</h3>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Thank you for sharing your thoughts with the OSU Tamil Sangam executive board. Your idea has been pinned to our digital blueprint ledger under <strong>${sanitizedCategory}</strong>.
            </p>
            <p style="font-size: 14px; color: #334155; line-height: 1.6;">
              Our student board reviews all community ideas during our weekly planning meetings.
            </p>
            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              OSU Tamil Sangam · The Ohio State University<br/>
              Registered student organization at Ohio State. Not an official university entity.
            </p>
          </div>
        `,
        text: `Vanakkam!\n\nThank you for sharing your idea (${sanitizedCategory}) with OSU Tamil Sangam. Our student board reviews all suggestions during weekly planning.\n\nOSU Tamil Sangam · Registered student organization at Ohio State.`,
      });
    }

    return {
      success: true,
      message: "Your suggestion has been pinned to the blueprint and sent to the board!",
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
