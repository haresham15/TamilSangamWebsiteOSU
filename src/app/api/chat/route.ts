import { NextRequest, NextResponse } from "next/server";
import { answerQuestion, ChatMessage } from "@/lib/chatEngine";

export const dynamic = "force-dynamic";

// In-memory rate limiting: 30 requests per minute per IP
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_REQUESTS = 30;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hit = ipHits.get(ip);

  if (!hit || now > hit.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (hit.count >= MAX_REQUESTS) {
    return true;
  }

  hit.count += 1;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit reached. Please wait a moment before asking another question.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { messages, locale } = body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Sanitize user message
    const sanitizedMessages: ChatMessage[] = messages
      .slice(-10)
      .filter(
        (m: any) =>
          m &&
          typeof m.content === "string" &&
          m.content.trim() &&
          (m.role === "user" || m.role === "assistant" || m.role === "system")
      )
      .map((m: any) => ({
        role: m.role,
        content: m.content.slice(0, 1000).trim(),
      }));

    if (sanitizedMessages.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid user messages found" },
        { status: 400 }
      );
    }

    const answer = await answerQuestion(sanitizedMessages, locale === "ta" ? "ta" : "en");

    return NextResponse.json({
      success: true,
      ...answer,
    });
  } catch (error) {
    console.error("[API Chat POST] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while processing your question.",
      },
      { status: 500 }
    );
  }
}
