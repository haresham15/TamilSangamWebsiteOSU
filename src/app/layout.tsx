import type { Metadata } from "next";
import { Mukta_Malar, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { LocaleProvider } from "@/context/LocaleContext";
import { TinaiProvider } from "@/context/TinaiContext";
import { AudioProvider } from "@/context/AudioContext";
import { LiteModeProvider } from "@/context/LiteModeContext";
import { CursorProvider } from "@/context/CursorContext";
import { AppShell } from "@/components/global/AppShell";

const muktaMalar = Mukta_Malar({
  variable: "--font-mukta-malar",
  subsets: ["latin", "tamil"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OSU Tamil Sangam · Project Aintinai (ஐந்திணை)",
  description:
    "The official web destination for The Ohio State University Tamil Sangam. Exploring the five classical landscapes through culture, dance, song, and celebration.",
  keywords: ["Ohio State", "OSU Tamil Sangam", "Buckeyes", "Pongal", "Diwali", "Tamil Culture", "Aintinai"],
  openGraph: {
    title: "OSU Tamil Sangam · Project Aintinai (ஐந்திணை)",
    description: "Start the Aatam, Paatam, and Kondatam at The Ohio State University!",
    url: "https://osutamilsangam.org",
    siteName: "OSU Tamil Sangam",
    images: [
      {
        url: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "OSU Tamil Sangam Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${muktaMalar.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg-base)] text-[var(--text-primary)]">
        <LocaleProvider>
          <TinaiProvider>
            <AudioProvider>
              <LiteModeProvider>
                <CursorProvider>
                  <AppShell>{children}</AppShell>
                </CursorProvider>
              </LiteModeProvider>
            </AudioProvider>
          </TinaiProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
