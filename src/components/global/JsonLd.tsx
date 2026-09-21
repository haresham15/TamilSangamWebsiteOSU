import React from "react";

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
      "Pongal Festival",
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
  const eventLd = {
    "@context": "https://schema.org",
    "@type": "Festival",
    name: "Powerhouse Pongal 2027",
    alternateName: "பவர்ஹவுஸ் பொங்கல் 2027",
    description:
      "Join the Ohio State Tamil Sangam for our flagship harvest celebration! Featuring earthen pot cooking, live Parai percussion, classical and cinematic fusion dance, and traditional banana leaf harvest feasts.",
    startDate: "2027-01-23T17:30:00-05:00",
    endDate: "2027-01-23T22:00:00-05:00",
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: "Performance Hall, Ohio Union",
      address: {
        "@type": "PostalAddress",
        streetAddress: "1739 N High St",
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
    image: [
      "https://lh3.googleusercontent.com/pw/AP1GczMd_Ca-bIl-USqHn_B4pu__WA4nAeb9pWcK56veZ3ojvKcEapqq5RkUOoqgjJAh7DCDzeGIDIh2zDdOlvSEuhj528GD2hsZKIzuAwP4gO91U7LUuKb3=w1200-h800-no",
    ],
    offers: {
      "@type": "Offer",
      name: "Student General Admission",
      price: "10.00",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: "https://osutamilsangam.org/events/powerhouse-pongal-2027",
      validFrom: "2026-11-01T00:00:00-05:00",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
    />
  );
};
