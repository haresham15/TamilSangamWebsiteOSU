import React from "react";
import Link from "next/link";
import { ExternalLink, Camera } from "lucide-react";

interface VaultAlbum {
  num: string;
  titleEn: string;
  titleTa: string;
  season: string;
  location: string;
  url: string;
  accent: string;
}

const VAULT_ALBUMS: VaultAlbum[] = [
  {
    num: "01",
    titleEn: 'TS "Yaar Andha Killer?" Mystery',
    titleTa: "யார் அந்த கில்லர்? மர்ம இரவு",
    season: "Fall 2026 · Murder Mystery",
    location: "Houston Grove Room, Ohio Union",
    url: "https://photos.app.goo.gl/k2Kg17MX4nriMbnw7",
    accent: "#E07A5F",
  },
  {
    num: "02",
    titleEn: 'TS "A Berry Cute Picnic"',
    titleTa: "பெர்ரி க்யூட் பிக்னிக்",
    season: "Fall 2025 · Welcome Social",
    location: "South Oval Lawn",
    url: "https://photos.app.goo.gl/XUS5MJz4vFRSefJa7",
    accent: "#B85C38",
  },
  {
    num: "03",
    titleEn: "TS Streetside Sapad & Game Night",
    titleTa: "தெருவோரச் சாப்பாடு & விளையாட்டு",
    season: "Spring 2026 · General Body",
    location: "Campus Hall / Ohio Union",
    url: "https://photos.app.goo.gl/PnkceBh19PqytYQ89",
    accent: "#E5A93C",
  },
  {
    num: "04",
    titleEn: "TS x TT: Namma Jathara Carnival",
    titleTa: "நம்ம ஜாதரா வசந்தத் திருவிழா",
    season: "Spring 2026 · Joint Carnival",
    location: "RPAC Plaza / South Oval",
    url: "https://photos.app.goo.gl/NBTxg98ppmd9uhWX9",
    accent: "#55CCA2",
  },
  {
    num: "05",
    titleEn: "TS x TT Autumn Gathering",
    titleTa: "இலையுதிர் சங்கமம்",
    season: "Autumn 2025 · Joint Social",
    location: "Ohio State Campus Spaces",
    url: "https://photos.app.goo.gl/QrUrPkvPQqQvz7H29",
    accent: "#9B7BB8",
  },
];

interface GooglePhotosVaultsStripProps {
  className?: string;
  variant?: "dark" | "light";
}

export function GooglePhotosVaultsStrip({ className = "", variant = "light" }: GooglePhotosVaultsStripProps) {
  const isDark = variant === "dark";

  return (
    <section
      aria-labelledby="google-photos-vaults-heading"
      className={`w-full py-12 px-4 sm:px-6 md:px-8 rounded-2xl transition-all ${
        isDark
          ? "bg-[#181615] border border-white/10 text-white"
          : "bg-[#F7F3EE] border border-[#E6DDCE] text-[#2A2825]"
      } ${className}`}
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6 border-current/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B85C38]">
              <Camera className="w-3.5 h-3.5" aria-hidden="true" />
              <span lang="ta">புகைப்படப் பெட்டகம் · Google Photos Vaults</span>
            </div>
            <h2
              id="google-photos-vaults-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight"
            >
              All 5 Official Event Photo Vaults
            </h2>
            <p className={`text-sm sm:text-base max-w-2xl font-sans ${isDark ? "text-stone-300" : "text-[#57524C]"}`}>
              Uncompressed, high-resolution original albums direct from our camera rolls. View full-resolution candid shots, download memory reels, or browse every photo taken at our gatherings.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-stone-500">
            <span>5 Archives Live</span>
          </div>
        </div>

        {/* 5-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {VAULT_ALBUMS.map((album) => (
            <a
              key={album.num}
              href={album.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open Google Photos Vault for ${album.titleEn}`}
              className={`group relative flex flex-col justify-between p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#B85C38] ${
                isDark
                  ? "bg-[#211E1C] border-white/10 hover:border-white/25 hover:bg-[#2A2624]"
                  : "bg-white border-[#E6DDCE] hover:border-[#B85C38]/40 hover:bg-[#FFFCF8]"
              }`}
            >
              {/* Top Accent Strip */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold tracking-wider text-stone-400 group-hover:text-[#B85C38] transition-colors">
                    0{album.num}
                  </span>
                  <ExternalLink
                    className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h3 className="font-serif text-lg font-medium leading-snug group-hover:text-[#B85C38] transition-colors">
                    {album.titleEn}
                  </h3>
                  <p lang="ta" className="text-xs font-tamil text-stone-500 mt-1 tracking-normal">
                    {album.titleTa}
                  </p>
                </div>
              </div>

              {/* Bottom Meta */}
              <div className="mt-6 pt-4 border-t border-current/10 space-y-1">
                <p className={`text-xs font-sans ${isDark ? "text-stone-400" : "text-[#706B64]"}`}>
                  {album.season}
                </p>
                <div className="flex items-center justify-between text-xs font-mono font-medium text-[#B85C38]">
                  <span>{album.location}</span>
                  <span className="underline decoration-dotted underline-offset-2">Open Album ↗</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
