import type { Metadata } from "next";
import { BreadcrumbJsonLd, BoardJsonLd } from "@/components/global/JsonLd";
import { CURRENT_BOARD } from "@/data/board";

export const metadata: Metadata = {
  title: "Executive Board & Student Leadership",
  description:
    "Meet the student leaders, executive officers, committee chairs, and faculty advisor of The Ohio State University Tamil Sangam.",
  keywords: [
    "OSU Tamil Sangam Board",
    "Tamil Sangam Executive Officers",
    "Ohio State Tamil student leadership",
    "Meenakshi Varadarajan",
    "Shrinidhi Nagappan",
    "Tamil student club leaders Columbus",
    "Student organization officers Ohio State",
  ],
  alternates: {
    canonical: "https://osutamilsangam.org/board",
  },
  openGraph: {
    title: "Executive Board & Leadership | OSU Tamil Sangam",
    description:
      "Meet the student leaders, executive officers, and committee chairs of The Ohio State University Tamil Sangam.",
    url: "https://osutamilsangam.org/board",
    siteName: "OSU Tamil Sangam",
    type: "profile",
    images: [
      {
        url: "/emblem.svg",
        width: 500,
        height: 500,
        alt: "OSU Tamil Sangam Leadership Emblem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Executive Board & Leadership | OSU Tamil Sangam",
    description:
      "Meet the executive leaders and committee chairs of OSU Tamil Sangam at Ohio State.",
    images: ["/emblem.svg"],
  },
};

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "https://osutamilsangam.org" },
    { name: "Executive Board", url: "https://osutamilsangam.org/board" },
  ];

  const boardMembers = CURRENT_BOARD.map((m) => ({
    name: m.nameEn,
    role: m.roleEn,
    bio: m.bioEn,
    image: m.photoUrl.startsWith("http") ? m.photoUrl : `https://osutamilsangam.org${m.photoUrl}`,
    email: m.email,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <BoardJsonLd members={boardMembers} />
      {children}
    </>
  );
}
