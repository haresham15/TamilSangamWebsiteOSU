import React from "react";
import {
  RootGraphJsonLd,
  FaqJsonLd as SeoFaqJsonLd,
  BreadcrumbJsonLd as SeoBreadcrumbJsonLd,
  EventJsonLd as SeoEventJsonLd,
  EventsCollectionJsonLd,
  BoardJsonLd as SeoBoardJsonLd,
  safeJsonLdString,
  JsonLd,
} from "@/components/seo/JsonLd";
import { EVENTS, SangamEvent } from "@/data/events";
import { CURRENT_BOARD, BoardMember } from "@/data/board";
import { GalleryAlbum } from "@/data/gallery";
import { SITE_URL } from "@/lib/seo";

export { safeJsonLdString, JsonLd, RootGraphJsonLd };

export const WebSiteJsonLd: React.FC = () => {
  // WebSite is bundled in RootGraphJsonLd
  return null;
};

export const OrganizationJsonLd: React.FC = () => {
  // EducationalOrganization is bundled in RootGraphJsonLd
  return <RootGraphJsonLd />;
};

export const FaqJsonLd: React.FC<{
  items?: Array<{
    question: string;
    answer: string;
    questionTa?: string;
    answerTa?: string;
  }>;
}> = ({ items }) => {
  return <SeoFaqJsonLd items={items} />;
};

export const BreadcrumbJsonLd: React.FC<{
  items: { name: string; url: string }[];
}> = ({ items }) => {
  return <SeoBreadcrumbJsonLd items={items} />;
};

export const EventJsonLd: React.FC = () => {
  const upcomingEvent = EVENTS.find((e) => e.status === "upcoming") || EVENTS[0];
  if (!upcomingEvent) return null;
  return <SeoEventJsonLd event={upcomingEvent} />;
};

export const SingleEventJsonLd: React.FC<{ event: SangamEvent }> = ({ event }) => {
  return <SeoEventJsonLd event={event} />;
};

export const BoardJsonLd: React.FC<{
  members?: Array<BoardMember | {
    name: string;
    role: string;
    bio?: string;
    image?: string;
    email?: string;
  }>;
}> = ({ members }) => {
  if (!members) {
    return <SeoBoardJsonLd members={CURRENT_BOARD} />;
  }
  // If passed custom mapped objects
  const items = members.map((m) => {
    if ("nameEn" in m) return m as BoardMember;
    return {
      id: m.name.toLowerCase().replace(/\s+/g, "-"),
      nameEn: m.name,
      nameTa: "",
      roleEn: m.role,
      roleTa: "",
      committeeEn: "",
      committeeTa: "",
      term: "2026-2027",
      bioEn: m.bio || "",
      bioTa: "",
      photoUrl: m.image || "/emblem.svg",
      responsibilitiesEn: [],
      responsibilitiesTa: [],
      quote: "",
      email: m.email || "",
      instagram: "",
    } as BoardMember;
  });
  return <SeoBoardJsonLd members={items} />;
};

export const PhotoAlbumJsonLd: React.FC<{ album: GalleryAlbum }> = ({ album }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: album.titleEn,
    alternateName: album.titleTa,
    description: album.descriptionEn,
    datePublished: album.eventDate,
    url: `${SITE_URL}/gallery/${album.slug}`,
    image: album.coverImage,
    author: {
      "@type": "EducationalOrganization",
      name: "OSU Tamil Sangam",
      url: SITE_URL,
    },
    hasPart: album.photos.map((photo) => ({
      "@type": "ImageObject",
      contentUrl: photo.imageUrl,
      caption: photo.captionEn,
      name: photo.titleEn,
    })),
  };

  return <JsonLd data={jsonLd} />;
};
