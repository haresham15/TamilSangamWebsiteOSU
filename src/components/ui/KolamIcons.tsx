import React from "react";

interface GlyphProps {
  className?: string;
  size?: number;
}

/**
 * AatamDanceGlyph: Bespoke kolam line-art dancing figure / salangai motif
 * Replaces generic dance emoji with authentic dot-and-loop rice-flour geometry.
 */
export const AatamDanceGlyph: React.FC<GlyphProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Kolam central dot matrix */}
    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="8" cy="12" r="1.2" fill="currentColor" />
    <circle cx="16" cy="12" r="1.2" fill="currentColor" />
    <circle cx="10" cy="19" r="1.2" fill="currentColor" />
    <circle cx="14" cy="19" r="1.2" fill="currentColor" />
    {/* Continuous looping kolam stroke */}
    <path
      d="M12 7.5C12 9.5 9 10 7 11.5C5 13 6 15 8.5 15C11 15 12 13 12 12C12 13 13 15 15.5 15C18 15 19 13 17 11.5C15 10 12 9.5 12 7.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.5 15C7 17 6 18.5 7.5 20C9 21.5 11 20 11.5 18C12 16.5 12 15 12 13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M15.5 15C17 17 18 18.5 16.5 20C15 21.5 13 20 12.5 18"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * PaatamMusicGlyph: Classical yaazh / veena inspired kolam geometry
 * Replaces generic music note emoji.
 */
export const PaatamMusicGlyph: React.FC<GlyphProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Resonance dots */}
    <circle cx="7" cy="17" r="2" fill="currentColor" />
    <circle cx="17" cy="8" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    {/* Yaazh soundboard curves */}
    <path
      d="M7 15C7 11 9 6 17 6M17 6C18.5 6 19 7 19 8.5C19 10 18 11 16 11C13 11 11 13 10 16.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M5 17C5 19 6.5 20.5 8.5 20.5C10.5 20.5 12 19 12 17C12 14 10 14 8.5 14C6.5 14 5 15.5 5 17Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M9 10.5L16 7.5M8 13.5L15 10.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeDasharray="1 2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * KondatamFestGlyph: Auspicious harvest pot & floral mandala kolam
 * Replaces generic party popper emoji.
 */
export const KondatamFestGlyph: React.FC<GlyphProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Sun / milk boil-over dots */}
    <circle cx="12" cy="4" r="1.5" fill="currentColor" />
    <circle cx="8" cy="6" r="1" fill="currentColor" />
    <circle cx="16" cy="6" r="1" fill="currentColor" />
    {/* Earthen pot loops */}
    <path
      d="M8 9H16C17 9 18 9.8 17.5 10.8L16.2 13.5C18 14.5 19 16.2 19 18C19 20 16 21.5 12 21.5C8 21.5 5 20 5 18C5 16.2 6 14.5 7.8 13.5L6.5 10.8C6 9.8 7 9 8 9Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Kolam band on the pot */}
    <path
      d="M7 16C9 17 15 17 17 16"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M10 6C10 7.5 12 8 12 9M14 6C14 7.5 12 8 12 9"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * FilterKaapiGlyph: Authentic Madras davarah and tumbler drawn in clean geometric lines
 */
export const FilterKaapiGlyph: React.FC<GlyphProps> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Steam coils with fluid rising animation */}
    <path
      d="M10 3C9.5 4 10.5 5 10 6M13 2.5C12.5 3.8 13.5 4.8 13 6M16 3C15.5 4 16.5 5 16 6"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      className="animate-steam origin-bottom"
    />
    {/* Tumbler (Glass) */}
    <path
      d="M8.5 7H15.5L14.5 15H9.5L8.5 7Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Davarah (Wide rimmed bowl) */}
    <path
      d="M5 14H19C19.5 14 20 14.5 19.5 15.2L17.5 19C16.8 20.2 14.5 21 12 21C9.5 21 7.2 20.2 6.5 19L4.5 15.2C4 14.5 4.5 14 5 14Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * TempleRekuMotif: Kanchipuram silk temple triangle border (*thazhampoo reku*)
 */
export const TempleRekuMotif: React.FC<{ count?: number; className?: string }> = ({
  count = 12,
  className = "text-[#55CCA2]",
}) => (
  <div className={`flex items-center overflow-hidden select-none pointer-events-none ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <svg
        key={i}
        width="20"
        height="12"
        viewBox="0 0 20 12"
        fill="currentColor"
        className="shrink-0"
        aria-hidden="true"
      >
        <polygon points="10,0 20,12 0,12" opacity={i % 2 === 0 ? "0.9" : "0.6"} />
      </svg>
    ))}
  </div>
);
