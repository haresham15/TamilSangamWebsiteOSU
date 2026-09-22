"use client";

import React, { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useLocale } from "@/context/LocaleContext";
import { submitSuggestion, SuggestionActionState } from "@/app/actions/suggestion";

const CATEGORIES = [
  { id: "Event idea", labelEn: "Event Idea", labelTa: "நிகழ்வு யோசனை", icon: Sparkles },
  { id: "Website feedback", labelEn: "Website Feedback", labelTa: "வலைத்தளக் கருத்து", icon: MessageSquare },
  { id: "New initiative", labelEn: "New Initiative", labelTa: "புதிய முன்னெடுப்பு", icon: Lightbulb },
  { id: "Partnership", labelEn: "Partnership", labelTa: "கூட்டு முயற்சி", icon: MapPin },
  { id: "Something else", labelEn: "Something Else", labelTa: "மற்றவை", icon: HelpCircle },
];

interface SuggestionFormProps {
  initialCategory?: string;
  onSuccessPin?: (pin: { id: string; x: number; y: number }) => void;
  className?: string;
}

const initialState: SuggestionActionState = {
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { locale } = useLocale();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-7 py-3.5 bg-[#FFC526] hover:bg-[#FFD875] text-[#12183c] font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-[4px_4px_0px_#55CCA2] hover:shadow-[2px_2px_0px_#55CCA2] hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
    >
      {pending ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin text-[#12183c]" />
          <span>
            {locale === "ta"
              ? "வரைபடத்தில் பதிக்கப்படுகிறது..."
              : "Pinning Idea to Blueprint..."}
          </span>
        </>
      ) : (
        <>
          <Send className="w-4 h-4 text-[#12183c]" />
          <span>
            {locale === "ta"
              ? "யோசனையைப் பகிரவும் (Pin to Blueprint)"
              : "Submit Suggestion to Board →"}
          </span>
        </>
      )}
    </button>
  );
}

export function SuggestionForm({
  initialCategory = "Event idea",
  onSuccessPin,
  className = "",
}: SuggestionFormProps) {
  const { locale } = useLocale();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [prevCategoryProp, setPrevCategoryProp] = useState(initialCategory);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timestamp, setTimestamp] = useState<number>(() => (typeof window !== "undefined" ? Date.now() : 0));

  // Sync category if prop changes from blueprint pin click (React recommended render-phase adjustment)
  if (initialCategory !== prevCategoryProp) {
    setPrevCategoryProp(initialCategory);
    setSelectedCategory(initialCategory);
  }

  const [state, formAction] = useActionState(submitSuggestion, initialState);

  // Dispatch ephemeral pin to 3D scene when submission succeeds
  useEffect(() => {
    if (state.success && state.pin && onSuccessPin) {
      onSuccessPin(state.pin);
    }
  }, [state.success, state.pin, onSuccessPin]);

  const handleReset = () => {
    setMessage("");
    setName("");
    setEmail("");
    setSelectedCategory("Event idea");
    setTimestamp(Date.now());
  };

  return (
    <div
      className={`relative bg-[#0d1330]/95 backdrop-blur-md border-2 border-[#415682] p-6 sm:p-10 shadow-[8px_8px_0px_#12183c] text-white ${className}`}
    >
      {/* Title block with Technical Stamp Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#2d3b66] mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a2550] border border-[#55CCA2]/40 text-[#55CCA2] text-[11px] font-mono uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sangam Blueprint Suggestion Ledger</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-[#f8f6f0] tracking-tight">
            {locale === "ta" ? "உங்கள் யோசனையைப் பகிருங்கள்" : "Drop an Idea onto the Blueprint"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-body">
            {locale === "ta"
              ? "நமது சங்கத்தின் அடுத்த கட்ட நிகழ்வுகள் மற்றும் முன்னெடுப்புகளுக்கு உங்கள் பரிந்துரைகள் வரவேற்கப்படுகின்றன."
              : "Share ideas for events, cultural initiatives, campus partnerships, or website feedback."}
          </p>
        </div>

        <div className="text-right hidden sm:block font-mono text-[11px] text-slate-400">
          <p className="text-[#FFC526]">DISPATCH: osutamilsangam@gmail.com</p>
          <p>REVIEW: Weekly Board Meetings</p>
        </div>
      </div>

      {state.success ? (
        /* Success State */
        <div className="py-10 text-center space-y-6">
          <div className="w-16 h-16 bg-[#55CCA2]/20 border-2 border-[#55CCA2] text-[#55CCA2] flex items-center justify-center mx-auto shadow-[4px_4px_0px_#55CCA2]">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h4 className="text-2xl font-bold font-display text-[#f8f6f0]">
              {locale === "ta"
                ? "நன்றி! உங்கள் யோசனை வரைபடத்தில் பதிக்கப்பட்டது!"
                : "Vanakkam! Your Idea Has Been Pinned!"}
            </h4>
            <p className="text-sm text-slate-300 font-body leading-relaxed">
              {state.message ||
                "Your idea has been dispatched directly to the executive board and recorded in our blueprint ledger."}
            </p>
            {state.pin && (
              <p className="text-xs font-mono text-[#FFC526] pt-2">
                [EPHEMERAL PIN COORD: X={state.pin.x.toFixed(2)}, Y={state.pin.y.toFixed(2)}]
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 bg-[#1a2550] hover:bg-[#253570] text-[#f8f6f0] border border-[#55CCA2]/50 text-xs font-mono uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#55CCA2]" />
            <span>Submit Another Suggestion</span>
          </button>
        </div>
      ) : (
        /* Form State */
        <form action={formAction} className="space-y-6">
          {/* Honeypot hidden input for bot trapping */}
          <input
            type="text"
            name="hp"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* Timestamp input for minimum-fill-time validation */}
          <input type="hidden" name="timestamp" value={timestamp || 0} />

          {/* 1. Category Selection Pills */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#FFC526] mb-2.5 font-bold">
              1. Select a Category · வகை
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#1a2b60] border-[#FFC526] shadow-[3px_3px_0px_#FFC526] text-white"
                        : "bg-[#0a0e24] border-[#2d3b66] text-slate-400 hover:border-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mb-2 ${
                        isSelected ? "text-[#FFC526]" : "text-slate-400"
                      }`}
                    />
                    <div>
                      <span className="block text-xs font-mono font-bold leading-tight">
                        {locale === "ta" ? cat.labelTa : cat.labelEn}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-sans mt-0.5">
                        {cat.labelEn}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Native hidden input ensuring form submit carries category */}
            <input type="hidden" name="category" value={selectedCategory} />
          </div>

          {/* 2. Message Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="suggestion-message"
                className="text-xs font-mono uppercase tracking-wider text-[#FFC526] font-bold"
              >
                2. Your Suggestion or Vision · யோசனை{" "}
                <span className="text-[#55CCA2]">*</span>
              </label>
              <span
                className={`text-[11px] font-mono ${
                  message.length > 2500 ? "text-rose-400 font-bold" : "text-slate-400"
                }`}
              >
                {message.length} / 2500 chars
              </span>
            </div>
            <textarea
              id="suggestion-message"
              name="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. A Tamil movie screening at Gateway Film Center, classical instrumental fusion jam on the Oval, career shadow nights with alumni in tech/healthcare, Pongal kolam contest..."
              className="w-full px-4 py-3 bg-[#0a0e24] border-2 border-[#2d3b66] focus:border-[#55CCA2] text-[#f8f6f0] placeholder:text-slate-500 text-sm outline-none transition-colors font-body leading-relaxed resize-y"
            />
          </div>

          {/* 3. Optional Submitter Info: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="suggestion-name"
                className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Your Name <span className="text-slate-500 font-normal">(Optional · Anonymous is fine)</span>
              </label>
              <input
                id="suggestion-name"
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Sundaram (or leave blank)"
                className="w-full px-4 py-2.5 bg-[#0a0e24] border-2 border-[#2d3b66] focus:border-[#55CCA2] text-[#f8f6f0] placeholder:text-slate-500 text-sm outline-none transition-colors font-body"
              />
            </div>

            <div>
              <label
                htmlFor="suggestion-email"
                className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Your Email <span className="text-slate-500 font-normal">(Optional · For board follow-up)</span>
              </label>
              <input
                id="suggestion-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sundaram.123@osu.edu"
                className="w-full px-4 py-2.5 bg-[#0a0e24] border-2 border-[#2d3b66] focus:border-[#55CCA2] text-[#f8f6f0] placeholder:text-slate-500 text-sm outline-none transition-colors font-body"
              />
            </div>
          </div>

          {/* Error Message Alert */}
          {state.error && (
            <div className="p-4 bg-rose-950/90 border-2 border-rose-500 text-rose-200 text-xs flex items-start gap-3 shadow-[4px_4px_0px_#881337]">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Submission Could Not Be Completed</p>
                <p>{state.error}</p>
                <p className="mt-1 text-rose-300 text-[11px]">
                  You can also reach out directly to{" "}
                  <a
                    href="mailto:osutamilsangam@gmail.com"
                    className="underline text-white font-bold"
                  >
                    osutamilsangam@gmail.com
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {/* Submit Action Block */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <SubmitButton />

            <p className="text-[11px] font-mono text-slate-400 text-center sm:text-right">
              Protected by anti-spam verification · Anonymous submissions welcomed
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
