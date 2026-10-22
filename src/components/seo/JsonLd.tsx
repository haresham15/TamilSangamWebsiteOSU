import React from "react";
import { SITE_URL, SEO_ENTITY } from "@/lib/seo";
import { FAQS } from "@/data/faq";
import { EVENTS, SangamEvent } from "@/data/events";
import { CURRENT_BOARD, BoardMember } from "@/data/board";

/**
 * XSS-Safe JSON-LD Serializer.
 * Escapes '<', '>', and '&' to Unicode escapes to prevent HTML injection
 * or script breakout inside <script type="application/ld+json">.
 */
export function safeJsonLdString(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}

export function JsonLd({ data }: { data: Record<string, unknown> | Array<unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdString(data) }}
    />
  );
}

/**
 * Root Layout Linked Schema.org Knowledge Graph (@graph)
 * Explicitly binds the student organization entity to The Ohio State University
 * via Wikidata and Wikipedia sameAs URIs, Columbus coordinates, and postal address.
 */
export function RootGraphJsonLd() {
  const rootGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": `${SITE_URL}/#organization`,
        name: SEO_ENTITY.name,
        legalName: SEO_ENTITY.legalName,
        alternateName: SEO_ENTITY.alternateNames,
        url: SITE_URL,
        logo: `${SITE_URL}/emblem.svg`,
        image: `${SITE_URL}/emblem.svg`,
        description:
          "Official Tamil cultural student organization at The Ohio State University in Columbus, Ohio. 100% free membership, Kollywood galas, Pongal banquets, and collegiate community.",
        parentOrganization: {
          "@type": "CollegeOrUniversity",
          name: SEO_ENTITY.parentOrganization.name,
          url: SEO_ENTITY.parentOrganization.url,
          sameAs: SEO_ENTITY.parentOrganization.sameAs,
        },
        address: {
          "@type": "PostalAddress",
          streetAddress: SEO_ENTITY.address.streetAddress,
          addressLocality: SEO_ENTITY.address.addressLocality,
          addressRegion: SEO_ENTITY.address.addressRegion,
          postalCode: SEO_ENTITY.address.postalCode,
          addressCountry: SEO_ENTITY.address.addressCountry,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: SEO_ENTITY.geo.latitude,
          longitude: SEO_ENTITY.geo.longitude,
        },
        areaServed: SEO_ENTITY.areaServed,
        knowsLanguage: SEO_ENTITY.languages,
        memberOf: {
          "@type": "Organization",
          name: SEO_ENTITY.memberOf,
        },
        sameAs: SEO_ENTITY.socials,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SEO_ENTITY.name,
        alternateName: SEO_ENTITY.alternateNames,
        description:
          "Official website of Tamil Sangam at The Ohio State University. A welcoming campus hub for Tamil culture, good food, casual hangouts, collegiate dance, and fellowship in Columbus — open to all students and languages.",
        inLanguage: ["en-US", "ta-IN"],
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/guide?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return <JsonLd data={rootGraph} />;
}

/**
 * FAQPage Schema: Enables Google Accordion Rich Snippets in SERPs.
 */
export function FaqJsonLd({
  items,
}: {
  items?: Array<{ question: string; answer: string; questionTa?: string }>;
}) {
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

  return <JsonLd data={jsonLd} />;
}

/**
 * BreadcrumbList Schema: Renders structured hierarchy in Google search cards.
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http")
        ? item.url
        : `${SITE_URL}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };

  return <JsonLd data={jsonLd} />;
}

function toIsoDate(dateStr: string): string {
  const ts = Date.parse(dateStr);
  if (!isNaN(ts)) {
    return new Date(ts).toISOString().split("T")[0];
  }
  return "2026-10-23";
}

/**
 * Single Event Schema for individual dossiers and flagship highlights.
 */
export function EventJsonLd({ event }: { event?: SangamEvent } = {}) {
  const targetEvent = event || EVENTS.find((e) => e.status === "upcoming") || EVENTS[0];
  if (!targetEvent) return null;
  const isoDate = toIsoDate(targetEvent.date);
  const eventLd = {
    "@context": "https://schema.org",
    "@type": "Festival",
    "@id": `${SITE_URL}/events/${targetEvent.slug}#event`,
    name: `${targetEvent.titleEn} (${targetEvent.titleTa})`,
    alternateName: targetEvent.titleTa,
    description: targetEvent.descriptionEn || targetEvent.taglineEn,
    startDate: `${isoDate}T18:00:00-04:00`,
    endDate: `${isoDate}T21:00:00-04:00`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    image: [
      targetEvent.posterImage?.startsWith("http")
        ? targetEvent.posterImage
        : `${SITE_URL}${targetEvent.posterImage || "/emblem.svg"}`,
    ],
    location: {
      "@type": "Place",
      name: `${targetEvent.location}, The Ohio State University`,
      address: {
        "@type": "PostalAddress",
        streetAddress: targetEvent.venueAddress || "1739 N High St, Ohio Union",
        addressLocality: "Columbus",
        addressRegion: "OH",
        postalCode: "43210",
        addressCountry: "US",
      },
    },
    organizer: {
      "@id": `${SITE_URL}/#organization`,
    },
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      name: "Student & Community Admission",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/events/${targetEvent.slug}`,
      validFrom: "2025-08-01T00:00:00-04:00",
    },
    performer: {
      "@type": "Organization",
      name: "OSU Tamil Sangam Student Performers",
    },
  };

  return <JsonLd data={eventLd} />;
}

/**
 * Event List Schema for /events index page.
 */
export function EventsCollectionJsonLd({ events }: { events?: SangamEvent[] }) {
  const eventList = events || EVENTS;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Campus Events & Festivals | OSU Tamil Sangam at Ohio State",
    description:
      "Explore upcoming and archived gatherings hosted by Tamil Sangam at The Ohio State University.",
    itemListElement: eventList.map((event, index) => {
      const isoDate = toIsoDate(event.date);
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Festival",
          "@id": `${SITE_URL}/events/${event.slug}#event`,
          name: `${event.titleEn} (${event.titleTa})`,
          alternateName: event.titleTa,
          description: event.descriptionEn || event.taglineEn,
          startDate: `${isoDate}T18:00:00-04:00`,
          endDate: `${isoDate}T21:00:00-04:00`,
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          location: {
            "@type": "Place",
            name: `${event.location}, The Ohio State University`,
            address: {
              "@type": "PostalAddress",
              streetAddress: event.venueAddress || "1739 N High St, Ohio Union",
              addressLocality: "Columbus",
              addressRegion: "OH",
              postalCode: "43210",
              addressCountry: "US",
            },
          },
          organizer: {
            "@id": `${SITE_URL}/#organization`,
          },
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/events/${event.slug}`,
          },
        },
      };
    }),
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * ProfilePage / ItemList Schema for Executive Board Members.
 */
export function BoardJsonLd({
  members,
}: {
  members?: BoardMember[];
}) {
  const memberList = members || CURRENT_BOARD;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "OSU Tamil Sangam Executive Board Officers 2026-2027",
    description:
      "Elected student executive officers and committee coordinators of The Ohio State University Tamil Sangam.",
    itemListElement: memberList.map((member, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Person",
        name: member.nameEn,
        alternateName: member.nameTa,
        jobTitle: member.roleEn,
        description: member.bioEn,
        image: member.photoUrl?.startsWith("http")
          ? member.photoUrl
          : `${SITE_URL}${member.photoUrl || "/emblem.svg"}`,
        email: member.email ? `mailto:${member.email}` : undefined,
        affiliation: {
          "@id": `${SITE_URL}/#organization`,
        },
        memberOf: {
          "@type": "CollegeOrUniversity",
          name: "The Ohio State University",
          url: "https://www.osu.edu",
          sameAs: "https://en.wikipedia.org/wiki/Ohio_State_University",
        },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "The Ohio State University",
          url: "https://www.osu.edu",
        },
      },
    })),
  };

  return <JsonLd data={jsonLd} />;
}
