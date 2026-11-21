import React from "react";
import { GraduationCap, Briefcase, ArrowRight, Building2 } from "lucide-react";
import { Eyebrow } from "@/components/muttram/Eyebrow";
import { MuttramButton } from "@/components/muttram/MuttramButton";

interface TechFiresideGatewayProps {
  className?: string;
  /** Kept for API compatibility; the gateway always renders on its own dark card. */
  variant?: "dark" | "light";
}

const COHORTS = [
  { label: "Graduate & PhD Mentorship", Icon: GraduationCap },
  { label: "Faculty Research Spotlight", Icon: Building2 },
  { label: "Columbus & Remote Tech Circles", Icon: Briefcase },
];

export function TechFiresideGateway({ className = "" }: TechFiresideGatewayProps) {
  return (
    <section
      aria-labelledby="fireside-gateway-heading"
      className={`relative w-full overflow-hidden rounded-2xl border border-border-zari-muted bg-surface-card-dark text-ink-alabaster p-6 sm:p-8 md:p-10 shadow-[0_12px_32px_rgba(10,6,18,0.35)] ${className}`.trim()}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-4">
          <Eyebrow tone="dark">Academic &amp; Industry Bridges · OSU-wide</Eyebrow>

          <h2
            id="fireside-gateway-heading"
            className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-ink-alabaster"
          >
            Tamil Nadu x Ohio State Tech &amp; Career Firesides
          </h2>

          <p lang="ta" className="font-tamil text-base sm:text-lg leading-[1.6] tracking-normal text-brand-lavender">
            தொழில்நுட்பம் மற்றும் ஆய்வு வழிகாட்டல் கலந்துரையாடல்
          </p>

          <p className="font-sans text-sm sm:text-base leading-relaxed text-ink-sand">
            Connecting undergraduate Buckeyes with Tamil graduate researchers, PhD candidates, medical fellows, OSU faculty, and Columbus tech professionals. We are incubating casual evening firesides and coffee chats exploring research paths, career navigations, and bridges between Ohio State and Tamil Nadu&apos;s thriving tech ecosystem.
          </p>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1" aria-label="Who the firesides bring together">
            {COHORTS.map(({ label, Icon }) => (
              <li key={label} className="inline-flex items-center gap-2 font-sans text-sm text-ink-sand">
                <Icon className="w-4 h-4 text-accent-zari shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Call to lead: hairline column, not a nested box */}
        <div className="lg:col-span-4 space-y-4 border-t border-border-zari-muted pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 self-center">
          <Eyebrow tone="dark" as="p">
            Lead a fireside / propose a topic
          </Eyebrow>
          <p className="font-sans text-sm leading-relaxed text-ink-sand">
            Are you an OSU faculty member, grad student, or alumnus working in tech, healthcare, law, or research? Join us for an informal chat.
          </p>
          <MuttramButton
            href="/join?track=fireside#membership-form"
            variant="primary"
            onDark
            icon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
          >
            Join Fireside &amp; Coffee Chats
          </MuttramButton>
        </div>
      </div>
    </section>
  );
}
