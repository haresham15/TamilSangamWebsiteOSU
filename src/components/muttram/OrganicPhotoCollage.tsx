"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export interface CollagePhoto {
  href: string;
  imageSrc: string;
  alt: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
}

export interface OrganicPhotoCollageProps {
  photos: CollagePhoto[];
  onPhotoClick?: () => void;
}

export const OrganicPhotoCollage: React.FC<OrganicPhotoCollageProps> = ({
  photos,
  onPhotoClick,
}) => {
  return (
    <div className="relative w-full max-w-6xl mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 items-start">
        {/* Photo 1: Left Anchor (Analog physical print, slight left tilt, no white card) */}
        {photos[0] && (
          <motion.div
            whileHover={{ scale: 1.02, rotate: 0, zIndex: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="md:col-span-5 relative z-10 md:-mr-4 -rotate-1 select-none"
          >
            <Link href={photos[0].href} onClick={onPhotoClick} className="block group">
              {/* Sharp physical corner photo (No rounded corners, no bounding card) */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4EFE6] shadow-xl shadow-stone-900/10 border border-stone-300/40">
                <Image
                  src={photos[0].imageSrc}
                  alt={photos[0].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 550px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Captions sitting naked directly on global background */}
              <div className="pt-5 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-semibold text-[#B85C38] tracking-widest uppercase block">
                    {photos[0].subtitle}
                  </span>
                  <span className="text-stone-400">·</span>
                  <span className="text-xs font-sans text-stone-500 uppercase tracking-wider">
                    {photos[0].tag}
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors leading-snug">
                  {photos[0].title}
                </h3>
                <p className="font-sans text-sm text-[#57524C] leading-relaxed">
                  {photos[0].description}
                </p>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Photo 2: Center Highlight (Analog physical print, slight right tilt, overlapping) */}
        {photos[1] && (
          <motion.div
            whileHover={{ scale: 1.02, rotate: 0, zIndex: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="md:col-span-7 relative z-20 md:-ml-2 rotate-2 select-none"
          >
            <Link href={photos[1].href} onClick={onPhotoClick} className="block group">
              {/* Sharp physical corner photo */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#F4EFE6] shadow-2xl shadow-stone-900/15 border border-stone-300/40">
                <Image
                  src={photos[1].imageSrc}
                  alt={photos[1].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 750px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Naked Captions on Global Background */}
              <div className="pt-5 space-y-1.5 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-semibold text-[#E5A93C] tracking-widest uppercase block">
                    {photos[1].subtitle}
                  </span>
                  <span className="text-stone-400">·</span>
                  <span className="text-xs font-sans text-stone-500 uppercase tracking-wider">
                    {photos[1].tag}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#2A2825] group-hover:text-[#E5A93C] transition-colors leading-snug">
                  {photos[1].title}
                </h3>
                <p className="font-sans text-sm sm:text-base text-[#57524C] leading-relaxed">
                  {photos[1].description}
                </p>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Photo 3: Third Photo Floating Asymmetrically (Sharp corners, negative offset) */}
        {photos[2] && (
          <motion.div
            whileHover={{ scale: 1.02, rotate: 0, zIndex: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="md:col-span-8 md:col-start-3 mt-6 md:-mt-10 relative z-25 -rotate-2 select-none"
          >
            <Link href={photos[2].href} onClick={onPhotoClick} className="block group sm:grid sm:grid-cols-12 gap-8 items-start">
              {/* Sharp physical print */}
              <div className="sm:col-span-6 relative aspect-[4/3] w-full overflow-hidden bg-[#F4EFE6] shadow-xl shadow-stone-900/10 border border-stone-300/40">
                <Image
                  src={photos[2].imageSrc}
                  alt={photos[2].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Naked Captions */}
              <div className="sm:col-span-6 pt-4 sm:pt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-semibold text-[#B85C38] tracking-widest uppercase block">
                    {photos[2].subtitle}
                  </span>
                  <span className="text-stone-400">·</span>
                  <span className="text-xs font-sans text-stone-500 uppercase tracking-wider">
                    {photos[2].tag}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors leading-snug">
                  {photos[2].title}
                </h3>
                <p className="font-sans text-sm sm:text-base text-[#57524C] leading-relaxed">
                  {photos[2].description}
                </p>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};
