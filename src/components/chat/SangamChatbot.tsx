"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import {
  X,
  Send,
  ArrowUpRight,
  PlusCircle,
  Database,
} from "lucide-react";
import { NanbaAvatar } from "./NanbaAvatar";

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

export interface SangamChatbotProps {
  isOpen?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
}

export const SangamChatbot: React.FC<SangamChatbotProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  hideTrigger = false,
}) => {
  const { locale } = useLocale();
  const { playClick, playWoodClick, playBell, playWhoosh, playSilkSwish } = useAudio();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  useModalScrollLock(isOpen, handleClose);

  const handleToggle = () => {
    if (isControlled) {
      if (isOpen && externalOnClose) {
        externalOnClose();
      }
    } else {
      if (!internalIsOpen) {
        playWhoosh(0.45);
      } else {
        playSilkSwish(0.35);
      }
      setInternalIsOpen(!internalIsOpen);
    }
  };

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
      {/* 1. Floating Chat Trigger Button - Warm Hearth Architectural Pill (Hidden when docked) */}
      {!hideTrigger && (
        <div id="global-sangam-chatbot" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleToggle}
            aria-label="Ask Nanba - OSU Tamil Sangam AI Assistant"
            className="relative group bg-[#161210]/92 text-[#FAF7F2] border border-[#D4AF37]/35 backdrop-blur-md rounded-full px-4 py-2.5 text-xs font-medium tracking-[0.16em] uppercase shadow-lg hover:border-[#C85A32] hover:bg-[#1E1815] flex items-center gap-2.5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <NanbaAvatar size={18} className="w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FAF7F2]">
              Ask Nanba
            </span>
          </motion.button>
        </div>
      )}

      {/* 2. Chat Drawer Panel (Mounted in Portal to eliminate overflow-hidden clipping) */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
              className="fixed bottom-16 sm:bottom-20 right-3 sm:right-6 z-[100] w-[calc(100vw-24px)] sm:w-[420px] max-h-[min(85dvh,640px)] h-[min(75dvh,600px)] flex flex-col bg-[#FAF7F2] border border-[#D4AF37]/35 rounded-2xl shadow-[0_24px_64px_rgba(22,18,16,0.38)] overflow-hidden text-left"
            >
              {/* Header */}
              <div className="p-3.5 bg-[#161210] border-b border-[#D4AF37]/30 flex items-center justify-between text-[#FAF7F2] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#2A2420] border border-[#D4AF37]/40 flex items-center justify-center shrink-0 shadow-inner">
                    <NanbaAvatar size={22} className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold font-serif text-white tracking-tight flex items-center gap-1.5">
                      <span>Nanba</span>
                      <span className="text-xs font-tamil text-[#E5A93C] font-normal">(நண்பா)</span>
                    </h3>
                    <p className="text-[10px] font-mono text-[#D4AF37]/80">
                      Sangam Student Assistant
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsEditorOpen(!isEditorOpen)}
                    title="Edit Knowledge Base"
                    aria-label="Toggle Knowledge Base Editor"
                    className={`p-1.5 min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center border text-xs font-mono font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] transition-[background-color,border-color,color] duration-150 cursor-pointer ${
                      isEditorOpen
                        ? "bg-[#D4AF37] text-[#161210] border-[#D4AF37]"
                        : "bg-[#2A2420] text-[#FAF7F2] border-[#D4AF37]/30 hover:text-white hover:border-[#D4AF37]"
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleClose}
                    aria-label="Close Chat"
                    className="p-1.5 min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center bg-[#2A2420] border border-[#D4AF37]/30 text-[#FAF7F2]/80 hover:text-white hover:border-[#C85A32] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
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
                  className="bg-[#F4EFE6] border-b border-[#161210]/15 p-4 text-xs font-body overflow-y-auto max-h-[320px] shrink-0"
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[11px] font-bold text-[#161210] uppercase flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-[#C85A32]" />
                      Add Knowledge to AI Engine
                    </span>
                    <Link
                      href="/guide"
                      onClick={handleClose}
                      className="text-[10px] font-mono text-[#C85A32] font-bold hover:underline flex items-center gap-0.5"
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
                        className="w-full px-3 py-1.5 bg-white border border-[#161210]/20 rounded-lg text-xs text-[#161210] placeholder-[#8C827A] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-[#161210]/20 rounded-lg text-xs text-[#161210] focus:outline-none focus:border-[#C85A32]"
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
                        className="px-2.5 py-1.5 bg-white border border-[#161210]/20 rounded-lg text-xs text-[#161210] placeholder-[#8C827A] focus:outline-none focus:border-[#C85A32]"
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
                        className="w-full px-3 py-1.5 bg-white border border-[#161210]/20 rounded-lg text-xs text-[#161210] placeholder-[#8C827A] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={editorStatus === "saving"}
                      className="w-full py-2 bg-[#161210] hover:bg-[#2A2420] text-white border border-[#D4AF37]/40 text-[11px] font-mono uppercase font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {editorStatus === "saving" ? "Indexing Entry..." : editorStatus === "success" ? "Saved to Knowledge Base!" : "Save & Index Fact"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Scroll Area */}
            <div data-lenis-prevent className="flex-1 p-3.5 space-y-3.5 overflow-y-auto overscroll-contain bg-[#FAF7F2]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {m.role === "user" ? (
                    <div className="max-w-[85%] p-3.5 rounded-2xl rounded-br-xs bg-[#161210] text-[#FAF7F2] border border-[#C85A32]/35 shadow-sm">
                      <p className="text-xs leading-relaxed whitespace-pre-line font-body font-normal">
                        {m.content}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 max-w-[92%]">
                      <div className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/35 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <NanbaAvatar size={18} className="w-4.5 h-4.5" />
                      </div>
                      <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white text-[#161210] border border-[#161210]/10 shadow-sm">
                        <p className="text-xs leading-relaxed whitespace-pre-line font-body font-normal">
                          {m.content}
                        </p>

                        {/* Citations / Links */}
                        {m.citations && m.citations.length > 0 && (
                          <div className="mt-2.5 pt-2 border-t border-[#161210]/10 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono uppercase font-bold text-[#8C827A]">
                              Verified Sources:
                            </span>
                            {m.citations.map((cit, idx) => (
                              <Link
                                key={idx}
                                href={cit.route}
                                onClick={handleClose}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F4EFE6] hover:bg-[#FAF7F2] border border-[#D4AF37]/35 text-[10px] font-mono font-medium text-[#C85A32] hover:border-[#C85A32] transition-colors"
                              >
                                <span>{cit.title}</span>
                                <ArrowUpRight className="w-2.5 h-2.5 text-[#C85A32]" />
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#FAF7F2] border border-[#D4AF37]/35 flex items-center justify-center shrink-0 mt-0.5">
                    <NanbaAvatar size={18} className="w-4.5 h-4.5" animated />
                  </div>
                  <div className="p-3 bg-white border border-[#161210]/10 rounded-2xl rounded-tl-xs shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-mono text-[#7A6E65] font-medium ml-1">
                      Nanba is consulting the archives...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-3.5 py-2.5 bg-[#F4EFE6] border-t border-[#161210]/10 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#161210]/15 hover:border-[#C85A32]/60 text-[10px] font-mono font-medium text-[#161210] hover:text-[#C85A32] transition-colors shrink-0 shadow-2xs cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#FAF7F2] border-t border-[#161210]/12 shrink-0">
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
                  className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-[#161210]/20 rounded-xl text-[#161210] placeholder-[#8C827A] focus:outline-none focus:border-[#C85A32] focus:ring-1 focus:ring-[#C85A32] font-body transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputQuery.trim() || isLoading}
                  aria-label="Send message to Nanba"
                  className="p-2.5 min-w-[42px] min-h-[42px] rounded-xl flex items-center justify-center bg-[#C85A32] hover:bg-[#B85C38] text-[#FAF7F2] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C85A32] disabled:opacity-40 transition-all duration-150 cursor-pointer shadow-sm"
                >
                  <Send className="w-4 h-4 text-[#FAF7F2]" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
  </>
);
};
