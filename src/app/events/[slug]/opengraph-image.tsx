import { ImageResponse } from "next/og";
import { EVENTS } from "@/data/events";
import { SITE_URL } from "@/lib/seo";

export const alt = "OSU Tamil Sangam Event Dossier";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = EVENTS.find((e) => e.slug === slug) || {
    titleEn: "Campus Gathering",
    titleTa: "வளாக நிகழ்வு",
    taglineEn: "The Ohio State University Tamil Sangam Gathering",
    date: "Columbus, OH",
    time: "The Ohio State University",
    location: "Ohio Union",
    status: "upcoming" as const,
  };

  const isUpcoming = event.status === "upcoming";

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
            "radial-gradient(circle at 80% 20%, rgba(166, 240, 207, 0.18), transparent 50%), radial-gradient(circle at 20% 80%, rgba(212, 175, 55, 0.14), transparent 45%), radial-gradient(circle at 50% 50%, rgba(56, 26, 94, 0.5), transparent 75%)",
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
                backgroundColor: isUpcoming ? "#A6F0CF" : "#F5D061",
                boxShadow: isUpcoming ? "0 0 12px #A6F0CF" : "0 0 12px #F5D061",
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
              The Ohio State University · Event Dossier
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 16px",
              borderRadius: "9999px",
              backgroundColor: isUpcoming
                ? "rgba(166, 240, 207, 0.16)"
                : "rgba(245, 208, 97, 0.16)",
              border: `1px solid ${isUpcoming ? "rgba(166, 240, 207, 0.5)" : "rgba(245, 208, 97, 0.5)"}`,
              color: "#FFFDF9",
              fontSize: 13,
              fontFamily: "monospace",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            <span>{isUpcoming ? "Upcoming Gathering" : "Campus Archive"}</span>
          </div>
        </div>

        {/* Center Main Stage: Event Title & Details */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginTop: "auto",
            marginBottom: "auto",
            maxWidth: 1000,
          }}
        >
          <span
            style={{
              color: "#F5D061",
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 0,
            }}
          >
            {event.titleTa}
          </span>

          <h1
            style={{
              fontSize: event.titleEn.length > 28 ? 52 : 64,
              lineHeight: 1.08,
              fontWeight: 700,
              color: "#FFFDF9",
              margin: 0,
              letterSpacing: "-0.01em",
              textShadow: "0 4px 20px rgba(0,0,0,0.8)",
            }}
          >
            {event.titleEn}
          </h1>

          <p
            style={{
              fontSize: 20,
              color: "#C4B7D7",
              margin: 0,
              lineHeight: 1.4,
              maxWidth: 880,
            }}
          >
            {event.taglineEn}
          </p>
        </div>

        {/* Bottom Telemetry Bar */}
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
              gap: 4,
            }}
          >
            <span
              style={{
                color: "#FFFDF9",
                fontSize: 18,
                fontWeight: 600,
                fontFamily: "monospace",
              }}
            >
              📅 {event.date} {event.time ? `· ${event.time}` : ""}
            </span>
            <span
              style={{
                color: "#A6F0CF",
                fontSize: 15,
                fontFamily: "monospace",
                letterSpacing: "0.08em",
              }}
            >
              📍 {event.location}, The Ohio State University
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
            <span>{SITE_URL.replace(/^https?:\/\//, "")}/events/{slug}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
