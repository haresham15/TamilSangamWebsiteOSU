import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/seo";

export const alt = "Sangam Arcade: Solla & Thodarpu Tamil Word Games · OSU Tamil Sangam";
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
            "radial-gradient(circle at 85% 15%, rgba(166, 240, 207, 0.2), transparent 50%), radial-gradient(circle at 15% 85%, rgba(212, 175, 55, 0.16), transparent 45%), radial-gradient(circle at 50% 50%, rgba(56, 26, 94, 0.5), transparent 75%)",
          padding: "54px 64px",
          position: "relative",
          border: "12px solid #25173B",
          boxSizing: "border-box",
          fontFamily: "serif",
        }}
      >
        {/* Precision Double Inner Bezel */}
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

        {/* Top Header Bar */}
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
                fontSize: 16,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              The Ohio State University · Sangam Arcade
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: "rgba(166, 240, 207, 0.16)",
              border: "1px solid rgba(166, 240, 207, 0.4)",
              color: "#FFFDF9",
              fontSize: 13,
              fontFamily: "monospace",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            <span>Daily Word Puzzles · Free</span>
          </div>
        </div>

        {/* Center Main Stage: Arcade Showcase */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 48,
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          {/* Left Text Block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxWidth: 680,
            }}
          >
            <span
              style={{
                color: "#F5D061",
                fontSize: 26,
                fontWeight: 600,
                letterSpacing: 0,
              }}
            >
              சொல்லு & தொடர்பு · தமிழ் புதிர் விளையாட்டுகள்
            </span>

            <h1
              style={{
                fontSize: 56,
                lineHeight: 1.05,
                fontWeight: 700,
                color: "#FFFDF9",
                margin: 0,
                letterSpacing: "-0.01em",
                textShadow: "0 4px 20px rgba(0,0,0,0.8)",
              }}
            >
              Solla & Thodarpu
            </h1>

            <p
              style={{
                fontSize: 20,
                color: "#A6F0CF",
                margin: 0,
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              Tamil Wordle & Tamil Connections
            </p>

            <p
              style={{
                fontSize: 17,
                color: "#C4B7D7",
                margin: 0,
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              Play daily biweekly word puzzles created by OSU Tamil Sangam. Guess the 5-letter Tamil/Tanglish word, group cultural clue tiles, and share your streaks.
            </p>
          </div>

          {/* Right Puzzle Tiles Visual Block */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              flexShrink: 0,
            }}
          >
            {/* Wordle-style tiles row */}
            <div style={{ display: "flex", gap: 8 }}>
              {["த", "மி", "ழ்", "ச்", "சொ"].map((char, i) => (
                <div
                  key={i}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 10,
                    backgroundColor: i < 3 ? "#0F766E" : i === 3 ? "#B45309" : "#25173B",
                    border: "2px solid rgba(166, 240, 207, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    color: "#FFFDF9",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                  }}
                >
                  {char}
                </div>
              ))}
            </div>

            {/* Connections-style categories mini-stack */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                width: 332,
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  backgroundColor: "rgba(166, 240, 207, 0.2)",
                  border: "1px solid rgba(166, 240, 207, 0.5)",
                  color: "#A6F0CF",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                ★ CULTURAL TRADITIONS: Kolam, Pongal, Deepam, Jallikattu
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  backgroundColor: "rgba(245, 208, 97, 0.2)",
                  border: "1px solid rgba(245, 208, 97, 0.5)",
                  color: "#F5D061",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: "monospace",
                }}
              >
                ★ BUCKEYE HUBS: Ohio Union, South Oval, RPAC, Thompson
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Epigraph & URL */}
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
                fontSize: 17,
                fontStyle: "italic",
              }}
            >
              Daily puzzles refreshed every midnight · Zero ads · Zero fees
            </span>
            <span
              style={{
                color: "#F5D061",
                fontSize: 13,
                fontFamily: "monospace",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              OSU Tamil Sangam · Collegiate Puzzle Arcade
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
            <span>{SITE_URL.replace(/^https?:\/\//, "")}/games</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
