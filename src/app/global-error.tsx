"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Sangam GlobalError Caught]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: "40px 20px", background: "#fffdfa", color: "#250d38", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: "600px", margin: "60px auto", padding: "32px", border: "2px solid #250d38", background: "#ffffff", boxShadow: "8px 8px 0px #250d38" }}>
          <span style={{ display: "inline-block", padding: "4px 8px", background: "#450a0a", color: "#fca5a5", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "16px", border: "1px solid #ef4444" }}>
            Critical System Alert
          </span>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 12px 0" }}>
            Application Encountered an Interruption
          </h1>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4c2472" }}>
            A critical interruption occurred while initializing the root layout. You can reload the application or return to the homepage.
          </p>
          <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => reset()}
              style={{ padding: "10px 18px", background: "#250d38", color: "#ffffff", border: "2px solid #55CCA2", cursor: "pointer", fontWeight: "bold", fontSize: "12px", textTransform: "uppercase" }}
            >
              Reload Application
            </button>
            <a
              href="/"
              style={{ padding: "10px 18px", background: "#faf8f5", color: "#250d38", border: "2px solid #250d38", textDecoration: "none", fontWeight: "bold", fontSize: "12px", textTransform: "uppercase", display: "inline-block" }}
            >
              Go to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
