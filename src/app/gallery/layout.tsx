import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Gallery & Archives",
  description:
    "Browse high-resolution event photographs, festival memories, and performance albums from OSU Tamil Sangam celebrations at Ohio State.",
  openGraph: {
    title: "Photo Gallery & Archives | OSU Tamil Sangam",
    description:
      "Browse event photographs, festival memories, and performance albums from OSU Tamil Sangam celebrations at Ohio State.",
    url: "https://osutamilsangam.org/gallery",
  },
  alternates: {
    canonical: "https://osutamilsangam.org/gallery",
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
