import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/seo";

export const alt = "OSU Tamil Sangam · The Ohio State University";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          backgroundColor: "#140C20",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(166, 240, 207, 0.18), transparent 50%), radial-gradient(circle at 15% 85%, rgba(242, 107, 181, 0.14), transparent 45%)",
          padding: "64px 72px",
          position: "relative",
          border: "12px solid #25173B",
          boxSizing: "border-box",
          fontFamily: "serif",
        }}
      >
        {/* Subtle Inner Mint Inset Border */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(166, 240, 207, 0.3)",
            pointerEvents: "none",
          }}
        />

        {/* Top Colophon */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#A6F0CF",
              }}
            />
            <span
              style={{
                color: "#A6F0CF",
                fontSize: 18,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              The Ohio State University · Columbus, Ohio
            </span>
          </div>

          <div
            style={{
              padding: "6px 14px",
              border: "1px solid rgba(166, 240, 207, 0.4)",
              color: "#F4F0FA",
              fontSize: 14,
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Est. 2021 · RSO
          </div>
        </div>

        {/* Center Headline Block with Official Emblem Extrusion & Chromatic Ghost Shadows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <span
            style={{
              color: "#F26BB5",
              fontSize: 20,
              fontFamily: "monospace",
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Official Tamil Cultural Student Organization
          </span>
          <h1
            style={{
              fontSize: 78,
              lineHeight: 1.05,
              fontWeight: 700,
              color: "#F4F0FA",
              margin: 0,
              letterSpacing: "-0.02em",
              textShadow:
                "-2px -2px 0px rgba(242, 107, 181, 0.65), 2px 2px 0px rgba(79, 214, 224, 0.65), 0 8px 24px rgba(0,0,0,0.6)",
            }}
          >
            OSU TAMIL SANGAM
          </h1>
          <p
            style={{
              fontSize: 32,
              color: "#A6F0CF",
              margin: 0,
              fontWeight: 500,
            }}
          >
            ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்
          </p>
        </div>

        {/* Bottom Epigraph */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            borderTop: "1px solid rgba(125, 96, 166, 0.35)",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                color: "#F4F0FA",
                fontSize: 22,
                fontStyle: "italic",
              }}
            >
              &ldquo;To Us All Towns Are Home, Everyone Our Kin&rdquo;
            </span>
            <span
              style={{
                color: "#4FD6E0",
                fontSize: 15,
                fontFamily: "monospace",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Purananuru 192 · யாதும் ஊரே யாவரும் கேளிர்
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#C4B7D7",
              fontSize: 16,
              fontFamily: "monospace",
            }}
          >
            <span>{SITE_URL.replace(/^https?:\/\//, "")}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
