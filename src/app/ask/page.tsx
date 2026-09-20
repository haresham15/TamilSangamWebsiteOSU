"use client";

import React, { useState } from "react";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { EVENTS } from "@/data/events";
import { CURRENT_BOARD } from "@/data/board";
import { Bot, Send, User } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  suggestedAction?: { label: string; href: string };
}

export default function AskSangamPage() {
  const { locale } = useLocale();
  const { playClick, playWoodClick, playBell } = useAudio();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "bot",
      text: locale === "ta"
        ? "வணக்கம்! நான் சங்கத்தின் AI உதவியாளர். நிகழ்வுகள், நடனத் தேர்வுகள், அல்லது உறுப்பினர் சேர்க்கை குறித்து ஏதேனும் கேட்க விரும்புகிறீர்களா?"
        : "Vanakkam! I'm your Sangam AI Concierge. Ask me anything about upcoming festivals, tickets, dance auditions, or living in Columbus as a Tamil student!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Grounded Question Answering Engine
  const answerQuery = (query: string): { text: string; action?: { label: string; href: string } } => {
    const q = query.toLowerCase().trim();

    // 1. Pongal / Next Event
    if (q.includes("pongal") || q.includes("next event") || q.includes("ticket") || q.includes("நிகழ்வு")) {
      const nextEvt = EVENTS[0];
      return {
        text: `Our next flagship celebration is **${nextEvt.titleEn}** on ${nextEvt.date} at the ${nextEvt.location}. Tickets are currently ${nextEvt.price}. We will have fresh earthen pot pongal, classical & kuthu dances, and a full banana leaf feast!`,
        action: { label: "View Pongal Tickets", href: `/events/${nextEvt.slug}` },
      };
    }

    // 2. Joining / GroupMe / Membership
    if (q.includes("join") || q.includes("member") || q.includes("groupme") || q.includes("இணைய")) {
      return {
        text: "Joining OSU Tamil Sangam is 100% free! We have no dues and we welcome students of all backgrounds and majors. Connect directly on our official GroupMe for event drops and dinner socials.",
        action: { label: "Join Official GroupMe", href: "/join" },
      };
    }

    // 3. Dance / Auditions / Music
    if (q.includes("dance") || q.includes("aatam") || q.includes("audition") || q.includes("sing") || q.includes("music") || q.includes("நடனம்")) {
      return {
        text: "Our Aatam (Dance) and Paatam (Music) collectives hold auditions at the beginning of each semester. We feature classical Bharatanatyam, energetic Kuthu, live fusion bands, and our campus Parai Attam ensemble.",
        action: { label: "Submit Performer Interest", href: "/join#performer" },
      };
    }

    // 4. Board / Officers / President
    if (q.includes("board") || q.includes("president") || q.includes("haresh") || q.includes("தலைவர்") || q.includes("officer")) {
      const pres = CURRENT_BOARD[0];
      return {
        text: `Our 2026-2027 Executive Board is led by ${pres.nameEn} (${pres.nameTa}), President, majoring in ${pres.major}, alongside Vice President Ananya Krishnan and Treasurer Siddharth Venkat.`,
        action: { label: "Meet the Full Board", href: "/board" },
      };
    }

    // 5. Food / Groceries / Restaurants in Columbus
    if (q.includes("food") || q.includes("dosa") || q.includes("grocery") || q.includes("saraga") || q.includes("restaurant") || q.includes("உணவு")) {
      return {
        text: "In Columbus, students love Dosa Corner on Henderson Rd for crispy ghee roast dosas, Bawarchi Biryanis on Sawmill, and Saraga International Market on Morse Rd for fresh curry leaves, idli rice, and Indian groceries.",
        action: { label: "View Columbus Tamil Guide", href: "/resources" },
      };
    }

    // 6. Non-Tamil Students
    if (q.includes("non-tamil") || q.includes("speak tamil") || q.includes("language")) {
      return {
        text: "You do not have to be Tamil or speak Tamil to join! 'யாதும் ஊரே யாவரும் கேளீர்' (To us all towns are our own, everyone our kin). We have members from all backgrounds who love cultural dance, South Asian food, and vibrant community.",
        action: { label: "Read Our Welcome Philosophy", href: "/about" },
      };
    }

    // Fallback Grounded Answer
    return {
      text: "I can help with event tickets, dance auditions, board officers, Columbus groceries, or our culture lab toys. If you need something specific, feel free to reach out to our officers on GroupMe or by email!",
      action: { label: "Connect with Board on GroupMe", href: "/join" },
    };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
    };

    playClick();
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const response = answerQuery(userText);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: response.text,
        suggestedAction: response.action,
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
      playBell(880);
    }, 600);
  };

  const promptSuggestions = [
    "When is Powerhouse Pongal?",
    "How can I audition for dance?",
    "Do I have to speak Tamil to join?",
    "Best South Indian food in Columbus?",
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Header */}
      <div className="max-w-2xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 mb-2">
          <Bot className="w-4 h-4" />
          <span>Grounded Campus Concierge</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white font-serif tracking-tight mb-2">
          {locale === "ta" ? "கேளுங்கள் · Ask Sangam" : "Ask Sangam AI Concierge"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Instant answers grounded in our published schedules, officer contacts, rehearsal guidelines, and Columbus spots.
        </p>
      </div>

      {/* Chat Conversation Card */}
      <div className="rounded-3xl glass-panel-elevated border border-[var(--border-strong)] shadow-2xl overflow-hidden flex flex-col h-[560px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${
                m.sender === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 shadow-md ${
                  m.sender === "user"
                    ? "bg-[var(--accent-tint)] text-black font-bold"
                    : "bg-gradient-to-tr from-[#f2b705] to-[#d6452f] text-white font-bold font-serif"
                }`}
              >
                {m.sender === "user" ? <User className="w-4 h-4" /> : "ஐ"}
              </div>

              <div
                className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[var(--accent-tint)] text-black font-medium rounded-tr-none"
                    : "glass-panel border border-white/10 text-white rounded-tl-none space-y-2"
                }`}
              >
                <p>{m.text}</p>
                {m.suggestedAction && (
                  <div className="pt-2 border-t border-white/10">
                    <a
                      href={m.suggestedAction.href}
                      onClick={playClick}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--accent-tint)] hover:underline"
                    >
                      <span>{m.suggestedAction.label}</span>
                      <span>→</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono italic">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-tint)] animate-ping" />
              <span>Ask Sangam is thinking...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="p-3 border-t border-white/10 bg-black/40 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 self-center mr-1">Suggestions:</span>
          {promptSuggestions.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setInputValue(prompt);
                playWoodClick();
              }}
              className="px-2.5 py-1 rounded-full text-[11px] font-mono glass-panel border border-white/10 text-slate-300 hover:text-white hover:border-[var(--accent-tint)] transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-black/60 flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about tickets, auditions, food, or joining..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs sm:text-sm outline-none focus:border-[var(--accent-tint)] font-sans"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-[var(--accent-tint)] text-black font-bold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
