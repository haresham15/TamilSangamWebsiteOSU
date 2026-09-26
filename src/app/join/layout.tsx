import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/global/JsonLd";

export const metadata: Metadata = {
  title: "Join Sangam, GroupMe & Auditions",
  description:
    "Become a member of OSU Tamil Sangam! Zero membership dues. Join our student GroupMe, follow on Instagram, and sign up for collegiate dance, music, and board committees at Ohio State.",
  keywords: [
    "Join OSU Tamil Sangam",
    "Tamil Sangam GroupMe Ohio State",
    "Tamil dance auditions OSU",
    "South Asian student club signup OSU",
    "Indian student club involvement fair Ohio State",
    "Tamil student community Columbus",
    "Free student clubs OSU",
  ],
  alternates: {
    canonical: "https://osutamilsangam.org/join",
  },
  openGraph: {
    title: "Join Sangam & Auditions | OSU Tamil Sangam",
    description:
      "Become a member of OSU Tamil Sangam! Zero dues. Join our GroupMe, follow on Instagram, and sign up for dance, music, and committees.",
    url: "https://osutamilsangam.org/join",
    siteName: "OSU Tamil Sangam",
    type: "website",
    images: [
      {
        url: "/emblem.svg",
        width: 500,
        height: 500,
        alt: "Join OSU Tamil Sangam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Sangam & Auditions | OSU Tamil Sangam",
    description:
      "Join OSU Tamil Sangam with zero dues. Connect with Buckeyes, dance, and celebrate Tamil culture.",
    images: ["/emblem.svg"],
  },
};

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "https://osutamilsangam.org" },
    { name: "Join Sangam", url: "https://osutamilsangam.org/join" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
