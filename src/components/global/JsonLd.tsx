import React from "react";
import { EVENTS } from "@/data/events";

export const OrganizationJsonLd: React.FC = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "The Ohio State University Tamil Sangam",
    alternateName: [
      "OSU Tamil Sangam",
      "Tamil Sangam at Ohio State",
      "ஓஹியோ தமிழ் சங்கம்",
    ],
    url: "https://osutamilsangam.org",
    logo: "https://osutamilsangam.org/emblem.svg",
    image: "https://osutamilsangam.org/emblem.svg",
    description:
      "The official student organization celebrating Tamil culture, performing arts, language, harvest festivals, and community fellowship at The Ohio State University in Columbus, Ohio.",
    email: "osutamilsangam@gmail.com",
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "The Ohio State University",
      url: "https://www.osu.edu",
      sameAs: [
        "https://en.wikipedia.org/wiki/Ohio_State_University",
        "https://www.facebook.com/osu",
        "https://twitter.com/OhioState",
      ],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "1739 N High St, Ohio Union",
      addressLocality: "Columbus",
      addressRegion: "OH",
      postalCode: "43210",
      addressCountry: "US",
    },
    sameAs: [
      "https://www.instagram.com/osutamilsangam",
      "https://linktr.ee/osutamilsangam",
    ],
    knowsAbout: [
      "Tamil Culture",
      "Tamil Cultural Festivals",
      "Diwali Festival",
      "Bharatanatyam Dance",
      "Parai Attam Percussion",
      "Classical Sangam Literature",
      "South Asian Student Life",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export const EventJsonLd: React.FC = () => {
  const upcomingEvent = EVENTS.find((e) => e.status === "upcoming");
  if (!upcomingEvent) return null;

  const eventLd = {
    "@context": "https://schema.org",
    "@type": "Festival",
    name: upcomingEvent.titleEn,
    alternateName: upcomingEvent.titleTa,
    description: upcomingEvent.descriptionEn,
    startDate: upcomingEvent.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: upcomingEvent.location,
      address: {
        "@type": "PostalAddress",
        streetAddress: upcomingEvent.venueAddress,
        addressLocality: "Columbus",
        addressRegion: "OH",
        postalCode: "43210",
        addressCountry: "US",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "OSU Tamil Sangam",
      url: "https://osutamilsangam.org",
    },
    offers: {
      "@type": "Offer",
      name: "General Admission",
      price: upcomingEvent.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `https://osutamilsangam.org/events#${upcomingEvent.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
    />
  );
};
