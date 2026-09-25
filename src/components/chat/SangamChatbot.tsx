"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import {
  X,
  Send,
  Bot,
  ArrowUpRight,
  PlusCircle,
  Database,
} from "lucide-react";

interface ChatMessageUI {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: { title: string; route: string }[];
  tier?: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "How do I join the club?",
  "What campus events do you host?",
  "Do I have to speak Tamil?",
  "Are there membership fees or dues?",
  "How do voting rights work?",
  "Where are events held on campus?",
];

export const SangamChatbot: React.FC = () => {
  const { locale } = useLocale();
  const { playClick, playWoodClick, playBell } = useAudio();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessageUI[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content:
        locale === "ta"
          ? "வணக்கம்! நான் நண்பா (Nanba) — ஓஹியோ ஸ்டேட் தமிழ் சங்கத்தின் AI தோழன் / வழிகாட்டி. நிகழ்வுகள், உறுப்பினர் சேர்க்கை, மற்றும் சங்கத்தின் செயல்பாடுகள் குறித்து எதையும் என்னிடம் கேளுங்கள்!"
          : "Vanakkam! I'm Nanba, your friendly OSU Tamil Sangam AI guide. I'm strictly bounded to answer questions using our verified website knowledge base. Ask me anything about our events, membership, leadership, or how to get involved!",
      citations: [{ title: "User Guide & FAQ", route: "/guide" }],
      timestamp: "Just now",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Quick addition form state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Custom");
  const [newContent, setNewContent] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [editorStatus, setEditorStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const msgCounterRef = useRef(1);

  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    playClick();
    setInputQuery("");

    const userMessage: ChatMessageUI = {
      id: `user-${msgCounterRef.current++}`,
      role: "user",
      content: query,
      timestamp: "Just now",
    };

    const newThread = [...messages, userMessage];
    setMessages(newThread);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newThread.map((m) => ({ role: m.role, content: m.content })),
          locale,
        }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${msgCounterRef.current++}`,
            role: "assistant",
            content: data.message,
            citations: data.citations || [],
            tier: data.tier,
            timestamp: "Just now",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-err-${msgCounterRef.current++}`,
            role: "assistant",
            content:
              locale === "ta"
                ? "மன்னிக்கவும், தகவலைப் பெறுவதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்."
                : "I ran into a temporary issue retrieving that information. Please try asking again or check our User Guide (/guide).",
            citations: [{ title: "User Guide & FAQ", route: "/guide" }],
            timestamp: "Just now",
          },
        ]);
      }
    } catch (err) {
      console.error("[SangamChatbot] Error sending message:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${msgCounterRef.current++}`,
          role: "assistant",
          content:
            "Network error connecting to the knowledge engine. Please ensure your connection is active.",
          timestamp: "Just now",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputQuery, isLoading, locale, messages, playClick]);

  const handleAddKnowledgeItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setEditorStatus("saving");
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleEn: newTitle.trim(),
          category: newCategory,
          contentEn: newContent.trim(),
          keywords: newKeywords.split(",").map((k) => k.trim()).filter(Boolean),
          route: "/guide",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEditorStatus("success");
        playBell(880);
        setTimeout(() => {
          setNewTitle("");
          setNewContent("");
          setNewKeywords("");
          setEditorStatus("idle");
          setIsEditorOpen(false);
          // Insert system notification into chat
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              role: "assistant",
              content: `Knowledge Base updated with new entry: "${data.item.titleEn}". I can now answer questions regarding this topic!`,
              citations: [{ title: data.item.titleEn, route: "/guide" }],
              timestamp: "Just now",
            },
          ]);
        }, 1200);
      } else {
        setEditorStatus("error");
      }
    } catch (err) {
      console.error("[SangamChatbot] Failed to save knowledge item:", err);
      setEditorStatus("error");
    }
  };

  return (
    <>
      {/* 1. Floating Chat Trigger Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playWoodClick();
            setIsOpen(!isOpen);
          }}
          aria-label="Ask Nanba - OSU Tamil Sangam AI Bot"
          className="relative group p-3.5 sm:px-4 sm:py-3 min-h-[44px] bg-[#250d38] text-white border-2 border-[#55CCA2] shadow-[4px_4px_0px_#55CCA2] hover:shadow-[6px_6px_0px_#55CCA2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 flex items-center gap-2.5 transition-[box-shadow,background-color,border-color] duration-150 cursor-pointer"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-[#55CCA2]" />
          </div>
          <span className="hidden sm:inline text-xs font-mono font-bold uppercase tracking-wider text-white">
            Ask Nanba
          </span>
        </motion.button>
      </div>

      {/* 2. Chat Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
            className="fixed bottom-16 sm:bottom-20 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[420px] max-h-[calc(100dvh-80px)] sm:max-h-[620px] h-[75dvh] sm:h-[80vh] flex flex-col bg-[#fffdfa] border-2 border-[#250d38] shadow-[6px_6px_0px_#250d38] sm:shadow-[8px_8px_0px_#250d38] overflow-hidden text-left"
          >
            {/* Header */}
            <div className="p-3.5 bg-[#250d38] border-b-2 border-[#55CCA2] flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#4c2472] border border-[#55CCA2] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#55CCA2]" />
                </div>
                  <div>
                    <h3 className="text-sm font-bold font-display text-white tracking-tight">
                      Nanba (நண்பா)
                    </h3>
                    <p className="text-[10px] font-mono text-purple-200/80">
                      Sangam Student Assistant
                    </p>
                  </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsEditorOpen(!isEditorOpen)}
                  title="Edit Knowledge Base"
                  aria-label="Toggle Knowledge Base Editor"
                  className={`p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center border text-xs font-mono font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] transition-[background-color,border-color,color] duration-150 cursor-pointer ${
                    isEditorOpen
                      ? "bg-[#55CCA2] text-[#250d38] border-[#55CCA2]"
                      : "bg-[#361352] text-purple-200 border-purple-400/40 hover:text-white hover:border-[#55CCA2]"
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Chat"
                  className="p-1.5 bg-[#361352] border border-purple-400/40 text-purple-200 hover:text-white hover:border-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Knowledge Base Editor Modal / Drawer Slide-in */}
            <AnimatePresence>
              {isEditorOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-purple-50 border-b-2 border-[#250d38] p-4 text-xs font-body overflow-y-auto max-h-[320px] shrink-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[11px] font-bold text-[#250d38] uppercase flex items-center gap-1">
                      <PlusCircle className="w-3.5 h-3.5 text-[#11694c]" />
                      Add Knowledge to AI Engine
                    </span>
                    <Link
                      href="/guide"
                      onClick={() => setIsOpen(false)}
                      className="text-[10px] font-mono text-[#4c2472] font-bold hover:underline flex items-center gap-0.5"
                    >
                      Open Full Guide & Manager →
                    </Link>
                  </div>

                  <form onSubmit={handleAddKnowledgeItem} className="space-y-2.5">
                    <div>
                      <input
                        type="text"
                        placeholder="Title (e.g. Chai & Samosa Study Hours)"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-[#250d38] text-xs text-[#250d38] placeholder-purple-900/40 focus:outline-none focus:ring-1 focus:ring-[#55CCA2]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="px-2 py-1.5 bg-white border border-[#250d38] text-xs text-[#250d38]"
                      >
                        <option value="Events">Events</option>
                        <option value="Membership">Membership</option>
                        <option value="Board">Board</option>
                        <option value="FAQ">FAQ</option>
                        <option value="Guide">Guide</option>
                        <option value="Custom">Custom Fact</option>
                      </select>
                      <input
                        id="editor-keywords-input"
                        name="keywords"
                        type="text"
                        placeholder="Keywords (comma-separated)"
                        aria-label="Fact Keywords"
                        value={newKeywords}
                        onChange={(e) => setNewKeywords(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-[#250d38] text-xs text-[#250d38] placeholder-purple-900/40"
                      />
                    </div>
                    <div>
                      <textarea
                        id="editor-content-input"
                        name="content"
                        rows={2}
                        placeholder="Exact fact or description (e.g. We meet every Wednesday at 6 PM at the Union)..."
                        aria-label="Fact Description"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-[#250d38] text-xs text-[#250d38] placeholder-purple-900/40 focus:outline-none focus:ring-1 focus:ring-[#55CCA2]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={editorStatus === "saving"}
                      className="w-full py-1.5 bg-[#250d38] text-white border border-[#55CCA2] text-[11px] font-mono uppercase font-bold hover:bg-[#3d165c] transition-colors"
                    >
                      {editorStatus === "saving" ? "Indexing Entry..." : editorStatus === "success" ? "Saved to Knowledge Base!" : "Save & Index Fact"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto bg-[#faf8f5]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] p-3 border-2 ${
                      m.role === "user"
                        ? "bg-[#250d38] text-white border-[#4c2472] shadow-[2px_2px_0px_#4c2472]"
                        : "bg-white text-[#250d38] border-[#250d38] shadow-[3px_3px_0px_#55CCA2]"
                    }`}
                  >
                    <p className="text-xs leading-relaxed whitespace-pre-line font-body font-normal">
                      {m.content}
                    </p>

                    {/* Citations / Links */}
                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-purple-200/60 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono uppercase font-bold text-purple-900/60">
                          Verified Sources:
                        </span>
                        {m.citations.map((cit, idx) => (
                          <Link
                            key={idx}
                            href={cit.route}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 hover:bg-[#55CCA2]/20 border border-purple-300 text-[10px] font-mono font-bold text-[#4c2472] transition-colors"
                          >
                            <span>{cit.title}</span>
                            <ArrowUpRight className="w-2.5 h-2.5 text-[#11694c]" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start">
                  <div className="p-3 bg-white border-2 border-[#250d38] shadow-[2px_2px_0px_#55CCA2] flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#55CCA2] animate-bounce" />
                    <span className="w-2 h-2 bg-[#55CCA2] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-[#55CCA2] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-mono text-purple-950 font-bold ml-1">
                      Searching knowledge base...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-3 py-2 bg-purple-50/80 border-t border-purple-200 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="whitespace-nowrap px-2 py-1 bg-white border border-[#250d38] text-[10px] font-mono font-bold text-[#250d38] hover:bg-[#55CCA2]/20 hover:border-[#11694c] transition-colors shrink-0 shadow-[1px_1px_0px_#4c2472]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t-2 border-[#250d38] shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  id="sangam-chat-input"
                  name="chat_message"
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    locale === "ta"
                      ? "நண்பாவிடம் கேளுங்கள் (நிகழ்வுகள், சேர்க்கை)..."
                      : "Ask Nanba about events, joining, tickets, board..."
                  }
                  aria-label="Ask Nanba AI Assistant"
                  className="flex-1 px-3 py-2 text-xs bg-[#faf8f5] border-2 border-[#250d38] text-[#250d38] placeholder-purple-900/40 focus:outline-none focus:border-[#55CCA2] font-body"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isLoading}
                  aria-label="Send message to Nanba"
                  className="p-2 min-w-[42px] min-h-[42px] flex items-center justify-center bg-[#250d38] text-white border-2 border-[#55CCA2] shadow-[2px_2px_0px_#55CCA2] hover:shadow-[3px_3px_0px_#55CCA2] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#55CCA2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CCA2] focus-visible:ring-offset-2 disabled:opacity-40 transition-[box-shadow,transform,opacity] duration-150 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#55CCA2]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
