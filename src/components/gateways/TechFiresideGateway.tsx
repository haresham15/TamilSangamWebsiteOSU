import React from "react";
import Link from "next/link";
import { GraduationCap, Briefcase, Network, ArrowRight, Building2 } from "lucide-react";

interface TechFiresideGatewayProps {
  className?: string;
  variant?: "dark" | "light";
}

export function TechFiresideGateway({
  className = "",
  variant = "light",
}: TechFiresideGatewayProps) {
  const isDark = variant === "dark";

  return (
    <section
      aria-labelledby="fireside-gateway-heading"
      className={`relative w-full overflow-hidden rounded-2xl p-6 sm:p-8 md:p-10 border bg-[#1C122B] border-[#C79347]/30 text-[#FAF5ED] shadow-xl transition-all ${className}`}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Editorial Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 border-[rgba(212,163,106,0.2)] text-xs font-mono tracking-wider uppercase">
          <div className="flex items-center gap-2 text-[#C79347]">
            <Network className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Academic &amp; Industry Bridges</span>
          </div>

          <div className="text-[#CBBBA8]">
            <span>OSU-Wide · Undergrads + Grads + Faculty</span>
          </div>
        </div>

        {/* Content Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h2
              id="fireside-gateway-heading"
              className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-[#FAF5ED]"
            >
              Tamil Nadu x Ohio State Tech &amp; Career Firesides
            </h2>

            <p lang="ta" className="text-sm sm:text-base font-tamil text-[#C79347] tracking-normal">
              தொழில்நுட்பம் மற்றும் ஆய்வு வழிகாட்டல் கலந்துரையாடல்
            </p>

            <p className="text-sm sm:text-base leading-relaxed font-sans text-[#CBBBA8]">
              Connecting undergraduate Buckeyes with Tamil graduate researchers, PhD candidates, medical fellows, OSU faculty, and Columbus tech professionals. We are incubating casual evening firesides and coffee chats exploring research paths, career navigations, and bridges between Ohio State and Tamil Nadu&apos;s thriving tech ecosystem.
            </p>

            {/* Quick Cohort Indicators */}
            <div className="flex flex-wrap gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-md bg-[#271A3C] text-[#CBBBA8] border border-[rgba(212,163,106,0.2)]">
                <GraduationCap className="w-3.5 h-3.5 text-[#C79347]" />
                <span>Graduate &amp; PhD Mentorship</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-md bg-[#271A3C] text-[#CBBBA8] border border-[rgba(212,163,106,0.2)]">
                <Building2 className="w-3.5 h-3.5 text-[#C79347]" />
                <span>Faculty Research Spotlight</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-md bg-[#271A3C] text-[#CBBBA8] border border-[rgba(212,163,106,0.2)]">
                <Briefcase className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Columbus &amp; Remote Tech Circles</span>
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            <div className="p-5 rounded-xl border border-[rgba(212,163,106,0.24)] bg-[#271A3C] space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[#C79347] font-bold block">
                Lead a Fireside / Propose a Topic
              </span>
              <p className="text-xs text-[#CBBBA8] leading-relaxed">
                Are you an OSU faculty member, grad student, or alumnus working in tech, healthcare, law, or research? Join us for an informal chat.
              </p>
              <Link
                href="/join?track=fireside#membership-form"
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-all bg-[#0F766E] text-[#FAF5ED] hover:bg-[#0B5C56] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              >
                <span>Join Fireside &amp; Coffee Chats</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
