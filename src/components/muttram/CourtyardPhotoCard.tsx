"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export interface CourtyardPhotoCardProps {
  href: string;
  imageSrc: string;
  alt: string;
  title: string;
  subtitle?: string;
  tag?: string;
  description?: string;
  aspectRatio?: string;
  className?: string;
  onClick?: () => void;
}

export const CourtyardPhotoCard: React.FC<CourtyardPhotoCardProps> = ({
  href,
  imageSrc,
  alt,
  title,
  subtitle,
  tag,
  description,
  aspectRatio = "aspect-[4/3]",
  className = "",
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`group block relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-md shadow-stone-900/5 hover:shadow-xl hover:shadow-stone-900/10 transition-shadow duration-300 ${className}`}
    >
      <Link href={href} onClick={onClick} className="block">
        <div className={`relative w-full ${aspectRatio} overflow-hidden bg-[#F4EFE6]`}>
          <Image
            src={imageSrc}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {tag && (
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-[#FAF9F6]/90 backdrop-blur-md text-[11px] font-sans font-medium text-[#B85C38] tracking-wider uppercase shadow-sm">
              {tag}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-7 space-y-2">
          {subtitle && (
            <span className="text-xs font-sans font-medium text-[#B85C38] tracking-wider uppercase block">
              {subtitle}
            </span>
          )}

          <h3 className="text-xl sm:text-2xl font-serif font-normal text-[#2A2825] group-hover:text-[#B85C38] transition-colors leading-snug">
            {title}
          </h3>

          {description && (
            <p className="font-sans text-sm text-[#57524C] leading-relaxed line-clamp-2 pt-1">
              {description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
};
