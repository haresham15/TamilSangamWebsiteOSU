import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { validateEmail, dispatchEmail, generateGuestbookConfirmationHtml } from "@/lib/email";
import { getLedgerStore } from "@/lib/ledgerStore";
import { dispatchBoardNotification } from "@/lib/webhooks";
import { checkRateLimit } from "../../stay-in-sangam/rateLimit";

export const runtime = "nodejs";

interface MembershipRequest {
  id: string;
  name: string;
  email: string;
  major: string;
  membershipType: "general" | "performer" | "committee";
  buckeyeRole?: string;
  monthlyDispatchOptIn?: boolean;
  notes: string;
  submittedAt: string;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  if (!checkRateLimit(`membership:${ip}`)) {
    return NextResponse.json({ success: false, error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ success: false, error: "Invalid membership request." }, { status: 400 });
  }
  const {
    name,
    email,
    major = "",
    membershipType,
    buckeyeRole = "Undergraduate",
    monthlyDispatchOptIn = false,
    notes = "",
  } = body as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim() || name.length > 120 ||
      typeof email !== "string" || typeof major !== "string" || major.length > 160 ||
      typeof notes !== "string" || notes.length > 2500 ||
      (membershipType !== "general" && membershipType !== "performer" && membershipType !== "committee")) {
    return NextResponse.json({ success: false, error: "Please provide valid membership details." }, { status: 400 });
  }
  const validation = validateEmail(email);
  if (!validation.isValid) {
    return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
  }
  try {
    const record: MembershipRequest = {
      id: randomUUID(),
      name: name.trim(),
      email: validation.normalizedEmail,
      major: major.trim(),
      membershipType,
      buckeyeRole: typeof buckeyeRole === "string" ? buckeyeRole : "Undergraduate",
      monthlyDispatchOptIn: Boolean(monthlyDispatchOptIn),
      notes: notes.trim(),
      submittedAt: new Date().toISOString(),
    };

    // 1. Persist to ledger
    getLedgerStore().update("members.json", (): MembershipRequest[] => [], (members) => {
      const index = members.findIndex((member) => member.email === record.email);
      if (index >= 0) members[index] = { ...record, id: members[index].id };
      else members.unshift(record);
    });

    // 2. Dispatch executive board card to Discord / Slack / GroupMe
    await dispatchBoardNotification("guestbook", {
      name: record.name,
      email: record.email,
      major: record.major,
      membershipType: record.membershipType,
      notes: record.notes,
      submittedAt: record.submittedAt,
    }).catch((err) => console.warn("[Guestbook] Board webhook error:", err));

    // 3. Dispatch brutalist confirmation email to student
    const emailContent = generateGuestbookConfirmationHtml({
      name: record.name,
      email: record.email,
      major: record.major,
      membershipType: record.membershipType,
      notes: record.notes,
    });

    await dispatchEmail({
      to: record.email,
      subject: `Vanakkam ${record.name}! Your Place at the Sangam Hearth Is Confirmed ✦`,
      html: emailContent.html,
      text: emailContent.text,
    }).catch((err) => console.warn("[Guestbook] Student confirmation email error:", err));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Membership persistence failed", { error });
    return NextResponse.json({ success: false, error: "Unable to save your membership request. Please try again." }, { status: 503 });
  }
}
