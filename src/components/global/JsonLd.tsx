import React from "react";
import { EVENTS, SangamEvent } from "@/data/events";
import { FAQS } from "@/data/faq";
import { CURRENT_BOARD } from "@/data/board";
import { GALLERY_ALBUMS, GalleryAlbum } from "@/data/gallery";

/**
 * WebSite Structured Data with Google Sitelinks SearchBox
 */
export const WebSiteJsonLd: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://osutamilsangam.org/#website",
    name: "The Ohio State University Tamil Sangam",
    alternateName: [
      "OSU Tamil Sangam",
      "Tamil Sangam OSU",
      "Tamil Student Association OSU",
      "ஓஹியோ தமிழ் சங்கம்",
    ],
    url: "https://osutamilsangam.org",
    description:
      "Official student organization at The Ohio State University celebrating Tamil culture, classical performing arts, campus banquets, live concerts, and fellowship in Columbus, Ohio.",
    inLanguage: ["en-US", "ta-IN"],
    publisher: {
      "@id": "https://osutamilsangam.org/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://osutamilsangam.org/guide?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

/**
 * Educational Student Organization Schema with Parent University Linkage
 */
export const OrganizationJsonLd: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": "https://osutamilsangam.org/#organization",
    name: "The Ohio State University Tamil Sangam",
    alternateName: [
      "OSU Tamil Sangam",
      "Tamil Sangam at Ohio State",
      "Tamil Student Association OSU",
      "ஓஹியோ தமிழ் சங்கம்",
      "OSU TS",
    ],
    url: "https://osutamilsangam.org",
    logo: "https://osutamilsangam.org/emblem.svg",
    image: "https://osutamilsangam.org/emblem.svg",
    description:
      "Official student-led cultural organization at The Ohio State University dedicated to promoting Tamil language, performing arts (Aatam), musical traditions (Paatam), and festive campus celebrations (Kondatam). Open to all students.",
    foundingLocation: {
      "@type": "Place",
      name: "Columbus, Ohio, USA",
    },
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "The Ohio State University",
      url: "https://www.osu.edu",
      address: {
        "@type": "PostalAddress",
        streetAddress: "1739 N High St",
        addressLocality: "Columbus",
        addressRegion: "OH",
        postalCode: "43210",
        addressCountry: "US",
      },
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Ohio Union, 1739 N High St",
      addressLocality: "Columbus",
      addressRegion: "OH",
      postalCode: "43210",
      addressCountry: "US",
    },
    sameAs: [
      "https://www.instagram.com/osutamilsangam",
      "https://groupme.com/join_group/97084534/placeholder",
      "https://activities.osu.edu/involvement/student_organizations/find_a_student_org/?i=Tamil+Sangam",
      "https://github.com/haresham15/TamilSangamWebsiteOSU",
    ],
    knowsAbout: [
      "Tamil Language and Classical Sangam Literature",
      "Bharatanatyam and Contemporary Indian Dance",
      "Carnatic and Contemporary Tamil Music",
      "Parai Attam Percussion",
      "Diwali Festival Celebrations",
      "Pongal Harvest Festival",
      "South Asian Student Community at Ohio State",
      "Columbus Tamil Community",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

/**
 * FAQPage Schema: Enables Google Accordion Rich Snippets in SERPs
 */
export const FaqJsonLd: React.FC<{
  items?: Array<{
    question: string;
    answer: string;
    questionTa?: string;
    answerTa?: string;
  }>;
}> = ({ items }) => {
  const faqList = items
    ? items.map((f) => ({
        "@type": "Question",
        name: f.question,
        alternateName: f.questionTa,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      }))
    : FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.questionEn,
        alternateName: faq.questionTa,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answerEn,
        },
      }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqList,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

/**
 * BreadcrumbList Schema: Renders structured hierarchy in Google search cards
 */
export const BreadcrumbJsonLd: React.FC<{
  items: { name: string; url: string }[];
}> = ({ items }) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `https://osutamilsangam.org${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

/**
 * Event Carousel Schema for the upcoming flagship event
 */
export const EventJsonLd: React.FC = () => {
  const upcomingEvent = EVENTS.find((e) => e.status === "upcoming") || EVENTS[0];
  if (!upcomingEvent) return null;

  return <SingleEventJsonLd event={upcomingEvent} />;
};

function toIsoDate(dateStr: string): string {
  const ts = Date.parse(dateStr);
  if (!isNaN(ts)) {
    return new Date(ts).toISOString().split("T")[0];
  }
  return "2025-09-18";
}

/**
 * Detailed Event Schema for dynamic event pages
 */
export const SingleEventJsonLd: React.FC<{ event: SangamEvent }> = ({ event }) => {
  const isoDate = toIsoDate(event.date);
  const eventLd = {
    "@context": "https://schema.org",
    "@type": "Festival",
    "@id": `https://osutamilsangam.org/events/${event.slug}#event`,
    name: event.titleEn,
    alternateName: event.titleTa,
    description: event.descriptionEn,
    startDate: `${isoDate}T18:00:00-04:00`,
    endDate: `${isoDate}T21:00:00-04:00`,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: event.posterImage
      ? [event.posterImage]
      : ["https://osutamilsangam.org/emblem.svg"],
    location: {
      "@type": "Place",
      name: `${event.location}, The Ohio State University`,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venueAddress || "1739 N High St",
        addressLocality: "Columbus",
        addressRegion: "OH",
        postalCode: "43210",
        addressCountry: "US",
      },
    },
    organizer: {
      "@type": "EducationalOrganization",
      name: "The Ohio State University Tamil Sangam",
      url: "https://osutamilsangam.org",
      logo: "https://osutamilsangam.org/emblem.svg",
    },
    offers: {
      "@type": "Offer",
      name: "Student & Community Admission",
      price: event.price.toLowerCase().includes("free") ? "0" : "5",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://osutamilsangam.org/events/${event.slug}`,
      validFrom: "2025-08-01T00:00:00-04:00",
    },
    performer: {
      "@type": "Organization",
      name: "OSU Tamil Sangam Student Performers",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
    />
  );
};

/**
 * ProfilePage / ItemList Schema for Executive Board Members
 */
export const BoardJsonLd: React.FC<{
  members?: Array<{
    name: string;
    role: string;
    bio?: string;
    image?: string;
    email?: string;
  }>;
}> = ({ members }) => {
  const memberList = members || CURRENT_BOARD.map((m) => ({
    name: m.nameEn,
    role: m.roleEn,
    bio: m.bioEn,
    image: m.photoUrl.startsWith("http") ? m.photoUrl : `https://osutamilsangam.org${m.photoUrl}`,
    email: m.email,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "OSU Tamil Sangam Executive Board Officers 2026-2027",
    description:
      "Elected student executive officers and committee leaders of The Ohio State University Tamil Sangam.",
    itemListElement: memberList.map((member, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: member.name,
        jobTitle: member.role,
        description: member.bio,
        image: member.image,
        email: member.email ? `mailto:${member.email}` : undefined,
        affiliation: {
          "@type": "CollegeOrUniversity",
          name: "The Ohio State University",
          url: "https://www.osu.edu",
        },
        worksFor: {
          "@type": "EducationalOrganization",
          name: "The Ohio State University Tamil Sangam",
          url: "https://osutamilsangam.org",
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

/**
 * ImageGallery Schema for Photo Albums
 */
export const PhotoAlbumJsonLd: React.FC<{ album: GalleryAlbum }> = ({
  album,
}) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: album.titleEn,
    alternateName: album.titleTa,
    description: album.descriptionEn,
    datePublished: album.eventDate,
    url: `https://osutamilsangam.org/gallery/${album.slug}`,
    image: album.coverImage,
    author: {
      "@type": "EducationalOrganization",
      name: "The Ohio State University Tamil Sangam",
      url: "https://osutamilsangam.org",
    },
    hasPart: album.photos.map((photo) => ({
      "@type": "ImageObject",
      contentUrl: photo.imageUrl,
      caption: photo.captionEn,
      name: photo.titleEn,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
