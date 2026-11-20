import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Games blast lab",
  robots: {
    index: false,
    follow: false,
  },
};

export default function GamesBlastLabLayout({ children }: { children: React.ReactNode }) {
  return children;
}
