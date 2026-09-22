import { searchKnowledge, getKnowledgeBase } from "@/lib/knowledge";
import { KnowledgeItem } from "@/data/knowledgeBase";

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: { title: string; route: string }[];
  timestamp?: string;
}

export interface ChatResponse {
  message: string;
  citations: { title: string; route: string }[];
  matchedItems: { id: string; title: string; score: number }[];
  tier: "gemini-free-tier" | "local-rag-engine";
}

const OFF_TOPIC_RE = /\b(crypto|bitcoin|stock market|write a python script|quantum mechanics|astrophysics|presidential election|federal reserve|calculus exam)\b/i;

/**
 * Checks if a query is clearly out-of-scope for the collegiate student club.
 */
function isOffTopicQuery(query: string): boolean {
  return OFF_TOPIC_RE.test(query);
}

/**
 * Built-In Local Grounded RAG Generator (100% Free, Zero API Key Requirement)
 */
function generateLocalAnswer(
  query: string,
  matches: { item: KnowledgeItem; score: number }[],
  locale: "en" | "ta" = "en"
): ChatResponse {
  if (isOffTopicQuery(query)) {
    return {
      message:
        locale === "ta"
          ? "வணக்கம்! நான் நண்பா (Nanba) — ஓஹியோ ஸ்டேட் தமிழ் சங்கத்தின் AI தோழன் / வழிகாட்டி. எங்கள் மாணவர் அமைப்பு, நிகழ்வுகள், மற்றும் வளாக சந்திப்புகள் பற்றிய கேள்விகளுக்கு மட்டுமே என்னால் பதிலளிக்க முடியும். சங்கத்தைப் பற்றி ஏதேனும் கேட்க விரும்புகிறீர்களா?"
          : "Vanakkam! I am Nanba, the official OSU Tamil Sangam AI bot. I am strictly bounded to answer questions about our student organization, campus events, membership, constitution, and website features at The Ohio State University. Please let me know how I can help you with our club!",
      citations: [{ title: "User Guide & FAQ", route: "/guide" }],
      matchedItems: [],
      tier: "local-rag-engine",
    };
  }

  // If no good match was found in the knowledge base
  if (matches.length === 0 || matches[0].score < 10) {
    const defaultResponse =
      locale === "ta"
        ? `மன்னிக்கவும், உங்கள் கேள்விக்கான நேரடித் தகவல் எங்கள் அறிவுத் தளத்தில் கிடைக்கவில்லை. எங்கள் வழிகாட்டிப் பக்கத்தைப் (/guide) பார்வையிடலாம் அல்லது osutamilsangam@gmail.com என்ற முகவரியில் நிர்வாகிகளைத் தொடர்புகொள்ளலாம்.`
        : `I couldn't find a direct match for that in our current website knowledge base. You can browse our complete User Guide & FAQ (/guide), check our upcoming events (/events), or email our executive board directly at osutamilsangam@gmail.com!`;

    return {
      message: defaultResponse,
      citations: [
        { title: "User Guide & FAQ", route: "/guide" },
        { title: "Executive Board", route: "/board" },
      ],
      matchedItems: [],
      tier: "local-rag-engine",
    };
  }

  // High confidence matches: synthesize directly from the top 1-3 knowledge chunks
  const primaryMatch = matches[0].item;
  const secondaryMatches = matches.slice(1, 3);

  let responseBody = locale === "ta" ? primaryMatch.contentTa : primaryMatch.contentEn;

  // If there's an additional related match with strong score
  if (secondaryMatches.length > 0 && secondaryMatches[0].score >= 20) {
    const extra = locale === "ta" ? secondaryMatches[0].item.contentTa : secondaryMatches[0].item.contentEn;
    if (extra) {
      responseBody += `\n\n${extra}`;
    }
  }

  // Deduplicate citations
  const citationMap = new Map<string, string>();
  matches.forEach((m) => {
    if (m.item.route) {
      citationMap.set(m.item.titleEn, m.item.route);
    }
  });

  const citations = Array.from(citationMap.entries()).map(([title, route]) => ({
    title,
    route,
  }));

  return {
    message: responseBody,
    citations,
    matchedItems: matches.map((m) => ({
      id: m.item.id,
      title: m.item.titleEn,
      score: m.score,
    })),
    tier: "local-rag-engine",
  };
}

/**
 * Primary Chatbot answering pipeline.
 * Tries Gemini Free-Tier if GEMINI_API_KEY is available; seamlessly falls back to Local RAG Engine.
 */
export async function answerQuestion(
  messages: ChatMessage[],
  locale: "en" | "ta" = "en"
): Promise<ChatResponse> {
  const userMessages = messages.filter((m) => m.role === "user");
  const latestMessage = userMessages[userMessages.length - 1]?.content || "";

  // 1. Search knowledge base for relevant context
  const matches = searchKnowledge(latestMessage, 4);

  // 2. Check for optional Gemini API Key (Free tier on Google AI Studio)
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && !isOffTopicQuery(latestMessage)) {
    try {
      const contextText = matches
        .map(
          (m, idx) =>
            `[Knowledge Chunk ${idx + 1}: ${m.item.titleEn} (Category: ${m.item.category})]\n${
              locale === "ta" ? m.item.contentTa : m.item.contentEn
            }\nWebsite Page: ${m.item.route || "/guide"}`
        )
        .join("\n\n");

      const systemPrompt = `You are Nanba (நண்பா), the friendly and official student AI guide for OSU Tamil Sangam at The Ohio State University in Columbus, OH.
Rules:
1. Ground your answer STRICTLY and SOLELY in the provided Knowledge Base below.
2. If the user asks something not in the knowledge base, politely state that you do not have that specific information and refer them to osutamilsangam@gmail.com or /guide.
3. Keep answers concise, factual, welcoming, and collegiate. Never invent fake attendee numbers, fake dates, or exaggerated claims.
4. Respond in ${locale === "ta" ? "Tamil" : "English"}.
5. Mention the relevant website page (e.g. /events, /join, /board, /guide) when appropriate.

CURRENT KNOWLEDGE BASE CONTEXT:
${contextText}`;

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
      
      const payload = {
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${latestMessage}` }] },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
        },
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const citations = matches
            .filter((m) => m.item.route)
            .map((m) => ({ title: m.item.titleEn, route: m.item.route! }));

          return {
            message: text.trim(),
            citations,
            matchedItems: matches.map((m) => ({
              id: m.item.id,
              title: m.item.titleEn,
              score: m.score,
            })),
            tier: "gemini-free-tier",
          };
        }
      }
    } catch (err) {
      console.warn("[ChatEngine] Gemini API call failed or timed out, falling back to Local RAG Engine:", err);
    }
  }

  // 3. Fallback or Default: Fast, Grounded, 100% Free Local RAG Engine
  return generateLocalAnswer(latestMessage, matches, locale);
}
