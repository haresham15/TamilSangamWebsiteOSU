import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Games beach lab",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GamesBeachLabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
