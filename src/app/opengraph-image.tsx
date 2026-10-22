import { ImageResponse } from "next/og";

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
          backgroundColor: "#161210",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(212, 175, 55, 0.18), transparent 50%), radial-gradient(circle at 15% 85%, rgba(200, 90, 50, 0.14), transparent 45%)",
          padding: "64px 72px",
          position: "relative",
          border: "12px solid #241D1A",
          boxSizing: "border-box",
          fontFamily: "serif",
        }}
      >
        {/* Subtle Inner Antique Gold Inset Border */}
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "1px solid rgba(212, 175, 55, 0.3)",
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
                backgroundColor: "#D4AF37",
              }}
            />
            <span
              style={{
                color: "#D4AF37",
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
              border: "1px solid rgba(212, 175, 55, 0.4)",
              color: "#FAF7F2",
              fontSize: 14,
              fontFamily: "monospace",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Est. 2021 · RSO
          </div>
        </div>

        {/* Center Headline Block */}
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
              color: "#C85A32",
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
              color: "#FAF7F2",
              margin: 0,
              letterSpacing: "-0.02em",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            OSU TAMIL SANGAM
          </h1>
          <p
            style={{
              fontSize: 32,
              color: "#E5A93C",
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
            borderTop: "1px solid rgba(250, 247, 242, 0.15)",
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
                color: "#FAF7F2",
                fontSize: 22,
                fontStyle: "italic",
              }}
            >
              &ldquo;To Us All Towns Are Home, Everyone Our Kin&rdquo;
            </span>
            <span
              style={{
                color: "#C85A32",
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
              color: "rgba(250, 247, 242, 0.7)",
              fontSize: 16,
              fontFamily: "monospace",
            }}
          >
            <span>tamil-sangam-website-osu.vercel.app</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
