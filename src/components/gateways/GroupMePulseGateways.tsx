import React from "react";
import { Film, Coffee, Gamepad2, Users, ArrowUpRight, MessageCircle } from "lucide-react";

interface GroupMePulseGatewaysProps {
  className?: string;
  variant?: "dark" | "light";
}

export function GroupMePulseGateways({
  className = "",
  variant = "light",
}: GroupMePulseGatewaysProps) {
  const isDark = variant === "dark";

  const PULSE_CARDS = [
    {
      id: "fdfs-movies",
      icon: Film,
      badge: "FDFS SCREENINGS",
      titleEn: "FDFS Kollywood Theater Meetups",
      titleTa: "முதல் நாள் முதல் காட்சி சினிமா சந்திப்புகள்",
      desc: "Whenever a major Tamil film drops, we pick a Columbus theater & showtime, coordinate carpools from the Ohio Union, and watch together as a meeting.",
      accent: "#B85C38",
    },
    {
      id: "study-cricket",
      icon: Coffee,
      badge: "CHILL KICKBACKS",
      titleEn: "Study Tables & Cricket Watch-Alongs",
      titleTa: "படிப்பு சந்திப்பு & கிரிக்கெட் நேரலை",
      desc: "Low-maintenance bonding—Thompson Library study tables, IPL/India cricket watch-alongs, and late-night food runs with fellow Buckeyes.",
      accent: "#E5A93C",
    },
    {
      id: "game-lab",
      icon: Gamepad2,
      badge: "SMALL-SQUAD LAB",
      titleEn: "Small-Squad Game Lab (No Repeat Games)",
      titleTa: "புதிய குழு விளையாட்டு பட்டறை",
      desc: "Moving beyond standard Kahoot & musical chairs—designing small-group team games, Kollywood auctions, and social deduction rounds where everyone plays.",
      accent: "#55CCA2",
    },
  ];

  return (
    <section
      aria-labelledby="groupme-pulse-heading"
      className={`w-full py-12 px-4 sm:px-6 md:px-8 rounded-2xl border transition-all ${
        isDark
          ? "bg-[#181615] border-white/10 text-white"
          : "bg-[#F9F6F0] border-[#E8DFC8] text-[#2A2825]"
      } ${className}`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 border-current/10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide uppercase bg-[#B85C38]/10 text-[#B85C38] dark:bg-[#B85C38]/20 dark:text-[#E07A5F]">
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>OPEN GATEWAY · POP-UP HANGOUTS</span>
            </div>
            <h2
              id="groupme-pulse-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight"
            >
              Between the Big Meetings: Live GroupMe Pulse
            </h2>
            <p className={`text-sm sm:text-base max-w-2xl font-sans ${isDark ? "text-stone-300" : "text-[#57524C]"}`}>
              OSU Tamil Sangam isn&apos;t just 4 formal meetings a year. We are turning our GroupMe into an active, low-maintenance hub for spontaneous student hangouts across campus.
            </p>
          </div>

          <a
            href="https://web.groupme.com/join_group/83424812/BeBIRg7f"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all bg-[#B85C38] text-white hover:bg-[#A04E2F] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#B85C38]"
          >
            <span>Join Campus Chat</span>
            <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PULSE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`relative flex flex-col justify-between p-6 rounded-xl border transition-all duration-300 hover:-translate-y-1 ${
                  isDark
                    ? "bg-[#211E1C] border-white/10 hover:border-white/20"
                    : "bg-white border-[#E6DDCE] hover:border-[#B85C38]/40 shadow-sm"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className="p-2.5 rounded-lg"
                      style={{ backgroundColor: `${card.accent}15`, color: card.accent }}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span
                      className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded uppercase"
                      style={{ backgroundColor: `${card.accent}15`, color: card.accent }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-serif text-xl font-medium tracking-tight">
                      {card.titleEn}
                    </h3>
                    <p lang="ta" className="text-xs font-tamil text-[#B85C38] tracking-normal">
                      {card.titleTa}
                    </p>
                  </div>

                  <p className={`text-xs sm:text-sm leading-relaxed font-sans ${isDark ? "text-stone-300" : "text-[#57524C]"}`}>
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-current/10">
                  <a
                    href="https://web.groupme.com/join_group/83424812/BeBIRg7f"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-xs font-mono font-medium text-[#B85C38] hover:underline"
                  >
                    <span>Vote on poll in GroupMe ↗</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
