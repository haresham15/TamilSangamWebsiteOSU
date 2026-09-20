"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GALLERY_ALBUMS, PhotoItem } from "@/data/gallery";
import { GlyphMosaicImage } from "@/components/ui/GlyphMosaicImage";
import { useLocale } from "@/context/LocaleContext";
import { useAudio } from "@/context/AudioContext";
import { Search, Sparkles, Filter, ShieldAlert, ArrowRight, Eye } from "lucide-react";

export default function GalleryPage() {
  const { locale } = useLocale();
  const { playClick, playWoodClick } = useAudio();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [isRemovalModalOpen, setIsRemovalModalOpen] = useState(false);
  const [removalReason, setRemovalReason] = useState("");
  const [removalSent, setRemovalSent] = useState(false);

  // Extract all photos across albums
  const allPhotos = GALLERY_ALBUMS.flatMap((a) => a.photos);

  // Tags
  const tags = ["all", "dance", "parai", "pongal", "diwali", "food", "fashion", "sparklers"];

  // Semantic search simulation
  const filteredPhotos = allPhotos.filter((photo) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesTag = activeTag === "all" || photo.tags.includes(activeTag);

    if (!q) return matchesTag;

    const matchesQuery =
      photo.titleEn.toLowerCase().includes(q) ||
      photo.captionEn.toLowerCase().includes(q) ||
      photo.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      (q.includes("dance") && photo.tags.includes("dance")) ||
      (q.includes("pongal") && photo.tags.includes("pongal")) ||
      (q.includes("drum") && photo.tags.includes("parai"));

    return matchesTag && matchesQuery;
  });

  const handleRemovalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRemovalSent(true);
    setTimeout(() => {
      setIsRemovalModalOpen(false);
      setRemovalSent(false);
      setSelectedPhoto(null);
    }, 2500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-32 pb-24 text-left">
      {/* Header */}
      <div className="max-w-3xl mb-16">
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] block mb-2">
          Neithal (நெய்தல்) · Seashore, Tides & Memories
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight font-serif mb-4">
          {locale === "ta" ? "நினைவுகள் · புகைப்படத் தொகுப்பு" : "Memories & Photo Vault"}
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          {locale === "ta"
            ? "தமிழ் எழுத்துக்களின் அடர்த்தியிலிருந்து மெல்ல மெல்ல மலரும் புகைப்படங்கள்; இயற்கை மொழி கொண்டு தேடக்கூடிய நினைவகப் பெட்டகம்."
            : "Every photograph resolves out of an intricate mosaic of classical Tamil typography. Search our archives in English, Tamil, or Tanglish."}
        </p>
      </div>

      {/* 1. Memory Vault Semantic Natural-Language Search */}
      <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-[var(--border-strong)] shadow-2xl mb-12">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--accent-tint)] mb-3">
          <Sparkles className="w-4 h-4" />
          <span>Memory Vault Natural-Language Search</span>
        </div>

        <div className="relative w-full mb-4">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g., 'classical dance performances', 'earthen pot boil-over', 'parai drums', 'saree'..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/5 border border-white/15 text-white text-sm outline-none focus:border-[var(--accent-tint)] font-sans"
          />
        </div>

        {/* Quick Tag Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter:</span>
          </span>
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                playWoodClick();
                setActiveTag(tag);
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono capitalize transition-all ${
                activeTag === tag
                  ? "bg-[var(--accent-tint)] text-black font-semibold shadow-sm"
                  : "glass-panel text-slate-300 border-white/10 hover:border-white/25"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Photo Grid with Glyph-Mosaic Resolving Loaders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="glass-glow-card rounded-3xl overflow-hidden border border-white/10 group text-left cursor-pointer flex flex-col justify-between"
            onClick={() => {
              playClick();
              setSelectedPhoto(photo);
            }}
          >
            {/* Signature Moment 4: Glyph-Mosaic Loader */}
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <GlyphMosaicImage
                src={photo.imageUrl}
                alt={photo.titleEn}
                aspectRatio="aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="px-4 py-2 rounded-full glass-panel text-xs text-white font-mono flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-[var(--accent-tint)]" />
                  <span>View Lightbox</span>
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  {locale === "ta" ? photo.titleTa : photo.titleEn}
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                  {locale === "ta" ? photo.captionTa : photo.captionEn}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-white/10">
                <span>📸 {photo.photographer}</span>
                <span>{photo.eventDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Featured Albums Row */}
      <div className="pt-12 border-t border-white/10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-serif mb-6">
          {locale === "ta" ? "சிறப்பு ஆல்பங்கள்" : "Featured Photo Albums"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {GALLERY_ALBUMS.map((album) => (
            <Link
              key={album.slug}
              href={`/gallery/${album.slug}`}
              onClick={playClick}
              className="glass-glow-card rounded-3xl overflow-hidden border border-white/10 p-6 flex flex-col sm:flex-row gap-6 items-center"
            >
              <div className="w-full sm:w-44 h-40 relative rounded-2xl overflow-hidden shrink-0 border border-white/10">
                <Image
                  src={album.coverImage}
                  alt={album.titleEn}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, 200px"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono text-[var(--accent-tint)] uppercase">
                  {album.academicYear} · {album.photoCount} Photos
                </span>
                <h3 className="text-lg font-bold text-white">
                  {locale === "ta" ? album.titleTa : album.titleEn}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {locale === "ta" ? album.descriptionTa : album.descriptionEn}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-tint)] pt-1">
                  <span>Open Album</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Photo Lightbox & Privacy Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="w-full max-w-4xl rounded-3xl glass-panel-elevated p-6 border border-white/15 shadow-2xl relative text-left">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-mono z-10"
            >
              ✕ Close
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 relative h-80 sm:h-[450px] rounded-2xl overflow-hidden border border-white/10">
                <Image
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.titleEn}
                  fill
                  className="object-contain bg-black/60"
                  sizes="(max-width: 1024px) 100vw, 800px"
                />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <h3 className="text-xl font-bold text-white font-serif">
                  {locale === "ta" ? selectedPhoto.titleTa : selectedPhoto.titleEn}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {locale === "ta" ? selectedPhoto.captionTa : selectedPhoto.captionEn}
                </p>
                <div className="text-xs font-mono text-slate-400 space-y-1 pt-2 border-t border-white/10">
                  <p>Photo: {selectedPhoto.photographer}</p>
                  <p>Date: {selectedPhoto.eventDate}</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={() => setIsRemovalModalOpen(true)}
                    className="text-[11px] font-mono text-red-400 hover:underline flex items-center gap-1"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Request Photo Removal (Privacy)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Removal Request Modal */}
      {isRemovalModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl glass-panel-elevated p-6 border border-red-500/40 shadow-2xl relative text-left">
            <button
              onClick={() => setIsRemovalModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-mono"
            >
              ✕ Close
            </button>

            {!removalSent ? (
              <form onSubmit={handleRemovalSubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-red-400 text-xs font-mono uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Student Photo Privacy Request</span>
                </div>
                <h3 className="text-lg font-bold text-white">Request Photo Removal</h3>
                <p className="text-xs text-slate-300">
                  We respect everyone&apos;s privacy. Submit this form to have this image unlisted or your face blurred within 48 hours.
                </p>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">
                    Reason or Note for Officers
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={removalReason}
                    onChange={(e) => setRemovalReason(e.target.value)}
                    placeholder="I am in this photo and prefer not to have it on the website..."
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-red-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition-all shadow-md"
                >
                  Submit Removal Request
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-emerald-400 font-bold text-sm">Request Received</p>
                <p className="text-xs text-slate-300">
                  Our executive board has received your removal request and will action it within 48 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
