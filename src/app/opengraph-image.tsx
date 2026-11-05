import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/seo";

export const alt = "OSU Tamil Sangam · The Ohio State University Official Seal";
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
          alignItems: "stretch",
          backgroundColor: "#140C20",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(166, 240, 207, 0.16), transparent 50%), radial-gradient(circle at 15% 85%, rgba(212, 175, 55, 0.12), transparent 45%), radial-gradient(circle at 50% 50%, rgba(56, 26, 94, 0.5), transparent 75%)",
          padding: "54px 64px",
          position: "relative",
          border: "12px solid #25173B",
          boxSizing: "border-box",
          fontFamily: "serif",
        }}
      >
        {/* Subtle Precision Double Inner Bezel */}
        <div
          style={{
            position: "absolute",
            inset: 16,
            border: "1px solid rgba(166, 240, 207, 0.35)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(212, 175, 55, 0.2)",
            pointerEvents: "none",
          }}
        />

        {/* Top Collegiate Header Bar */}
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
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#A6F0CF",
                boxShadow: "0 0 12px #A6F0CF",
              }}
            />
            <span
              style={{
                color: "#A6F0CF",
                fontSize: 17,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              The Ohio State University · Columbus, Ohio
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(166, 240, 207, 0.12)",
              border: "1px solid rgba(166, 240, 207, 0.4)",
              color: "#FFFDF9",
              fontSize: 13,
              fontFamily: "monospace",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            <span>Recognized Student Organization · Est. 2021</span>
          </div>
        </div>

        {/* Center Main Stage: Official Seal Medallion + Typography */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 48,
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          {/* Official Crest Medallion Shield (Left) */}
          <div
            style={{
              width: 250,
              height: 250,
              borderRadius: "50%",
              backgroundColor: "#1E1030",
              border: "5px solid #A6F0CF",
              boxShadow:
                "0 0 0 3px rgba(212, 175, 55, 0.7), 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 40px rgba(166, 240, 207, 0.25)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            {/* Inner Ring */}
            <div
              style={{
                position: "absolute",
                inset: 10,
                borderRadius: "50%",
                border: "2px dashed rgba(166, 240, 207, 0.5)",
              }}
            />

            {/* Wisdom Flame (தீபம்) */}
            <div
              style={{
                width: 22,
                height: 28,
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                background: "linear-gradient(to top, #F5D061, #A6F0CF)",
                marginBottom: 6,
                boxShadow: "0 0 16px rgba(166, 240, 207, 0.8)",
              }}
            />

            {/* Central Classical Tamil Letter "த" */}
            <span
              style={{
                fontSize: 110,
                lineHeight: 1,
                fontWeight: 900,
                color: "#FFFDF9",
                fontFamily: "serif",
                textShadow: "0 4px 18px rgba(0,0,0,0.8), 0 0 20px rgba(166,240,207,0.4)",
              }}
            >
              த
            </span>

            {/* Lotus Base Inscription */}
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#A6F0CF",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontFamily: "monospace",
                marginTop: 2,
              }}
            >
              தமிழ்ச்சங்கம்
            </span>
          </div>

          {/* Right Typography Lockup */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  color: "#F5D061",
                  fontSize: 16,
                  fontFamily: "monospace",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                The Ohio State University
              </span>
              <span style={{ color: "rgba(166, 240, 207, 0.5)" }}>·</span>
              <span
                style={{
                  color: "#A6F0CF",
                  fontSize: 14,
                  fontFamily: "monospace",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Office of Student Life
              </span>
            </div>

            <h1
              style={{
                fontSize: 66,
                lineHeight: 1.05,
                fontWeight: 700,
                color: "#FFFDF9",
                margin: 0,
                letterSpacing: "-0.01em",
                textShadow: "0 4px 20px rgba(0,0,0,0.7), 0 0 32px rgba(166, 240, 207, 0.15)",
              }}
            >
              OSU TAMIL SANGAM
            </h1>

            <p
              style={{
                fontSize: 27,
                color: "#A6F0CF",
                margin: 0,
                fontWeight: 600,
                letterSpacing: 0,
              }}
            >
              ஒஹையோ மாநிலப் பல்கலைக்கழகத் தமிழ்ச் சங்கம்
            </p>

            <p
              style={{
                fontSize: 17,
                color: "#C4B7D7",
                margin: 0,
                marginTop: 4,
                lineHeight: 1.4,
                maxWidth: 620,
              }}
            >
              Official student organization connecting Buckeyes through Tamil heritage, banquets, galas, arts, and community. 100% free membership.
            </p>
          </div>
        </div>

        {/* Bottom Epigraph & Canonical Verification */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            borderTop: "1px solid rgba(166, 240, 207, 0.25)",
            paddingTop: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <span
              style={{
                color: "#FFFDF9",
                fontSize: 20,
                fontStyle: "italic",
              }}
            >
              &ldquo;To Us All Towns Are Home, Everyone Our Kin&rdquo;
            </span>
            <span
              style={{
                color: "#F5D061",
                fontSize: 14,
                fontFamily: "monospace",
                letterSpacing: "0.16em",
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
              gap: 10,
              color: "#A6F0CF",
              fontSize: 15,
              fontFamily: "monospace",
              fontWeight: 600,
              letterSpacing: "0.08em",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#A6F0CF",
              }}
            />
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
