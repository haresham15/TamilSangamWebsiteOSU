import { NextRequest, NextResponse } from "next/server";
import {
  validateEmail,
  saveSubscriber,
  generateWelcomeEmailHtml,
  dispatchEmail,
  getSubscribersStats,
} from "@/lib/email";

// Simple in-memory rate-limiter to prevent abuse (IP-based, resets every minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 10) {
    return false; // Exceeded 10 requests per minute
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many subscription attempts. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, name, interests, source, hp } = body;

    // Honeypot bot protection
    if (hp) {
      return NextResponse.json({
        success: true,
        message: "Successfully subscribed to the Stay in Sangam dispatch.",
      });
    }

    // Email validation
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error || "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Persist subscriber to local ledger
    const saveResult = await saveSubscriber({
      email: validation.normalizedEmail,
      name: typeof name === "string" ? name.trim() : undefined,
      isBuckeye: validation.isBuckeye,
      interests: Array.isArray(interests) ? interests : ["events", "food", "social"],
      source: typeof source === "string" ? source : "stay-in-sangam",
    });

    // Render HTML & text confirmation email
    const emailContent = generateWelcomeEmailHtml({
      email: validation.normalizedEmail,
      name: typeof name === "string" ? name.trim() : undefined,
      isBuckeye: validation.isBuckeye,
      interests: Array.isArray(interests) ? interests : undefined,
    });

    // Dispatch email via Resend, Webhook, or local receipt
    const dispatchResult = await dispatchEmail({
      to: validation.normalizedEmail,
      subject: validation.isBuckeye
        ? "Vanakkam Buckeye! You're in the Sangam Loop 🪔"
        : "Vanakkam from OSU Tamil Sangam! You're in the Loop 🪔",
      html: emailContent.html,
      text: emailContent.text,
    });

    return NextResponse.json({
      success: true,
      message: validation.isBuckeye
        ? "Vanakkam Buckeye! Welcome to the Stay in Sangam Loop. Check your inbox for your confirmation dispatch."
        : "Vanakkam! Welcome to the Stay in Sangam Loop. Check your inbox for your confirmation dispatch.",
      isBuckeye: validation.isBuckeye,
      email: validation.normalizedEmail,
      isNew: saveResult.isNew,
      totalSubscribers: saveResult.total,
      deliveryProvider: dispatchResult.provider,
    });
  } catch (error) {
    console.error("[StayInSangam API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process subscription dispatch. Please try again shortly." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = await getSubscribersStats();
    return NextResponse.json({
      status: "operational",
      feature: "Stay in Sangam Email Dispatch Engine",
      organization: "The Ohio State University Tamil Sangam",
      stats,
      provider: process.env.RESEND_API_KEY
        ? "resend"
        : process.env.NEWSLETTER_WEBHOOK_URL
        ? "webhook"
        : "local-receipt",
    });
  } catch {
    return NextResponse.json({ status: "error", message: "Failed to retrieve stats." }, { status: 500 });
  }
}
