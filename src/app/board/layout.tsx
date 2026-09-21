import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Executive Board & Leadership",
  description:
    "Meet the student leaders, executive officers, committee chairs, and faculty advisor of The Ohio State University Tamil Sangam.",
  openGraph: {
    title: "Executive Board & Leadership | OSU Tamil Sangam",
    description:
      "Meet the student leaders, executive officers, and committee chairs of The Ohio State University Tamil Sangam.",
    url: "https://osutamilsangam.org/board",
  },
  alternates: {
    canonical: "https://osutamilsangam.org/board",
  },
};

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
