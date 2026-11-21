import React from "react";
import { SITE_URL, SEO_ENTITY } from "@/lib/seo";
import { FAQS } from "@/data/faq";
import { EVENTS, SangamEvent } from "@/data/events";
import { CURRENT_BOARD, BoardMember } from "@/data/board";
import { GALLERY_ALBUMS, GalleryAlbum } from "@/data/gallery";
import { COLUMBUS_GUIDE } from "@/data/columbus-guide";
import { SITE_CONFIG } from "@/data/siteConfig";

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
        "@type": ["Organization", "EducationalOrganization", "NGO"],
        "@id": `${SITE_URL}/#organization`,
        name: SEO_ENTITY.name,
        legalName: SEO_ENTITY.legalName,
        alternateName: SEO_ENTITY.alternateNames,
        url: SITE_URL,
        logo: `${SITE_URL}/emblem.svg`,
        image: `${SITE_URL}/emblem.svg`,
        description:
          "Official Tamil student organization at The Ohio State University in Columbus, Ohio. 100% free membership, cultural events, Diwali & Pongal celebrations, dance, games, and fellowship.",
        email: SEO_ENTITY.email,
        foundingDate: "2021",
        contactPoint: {
          "@type": "ContactPoint",
          email: SEO_ENTITY.email,
          contactType: "student organization inquiry",
          availableLanguage: ["English", "Tamil"],
        },
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
        areaServed: [
          {
            "@type": "Place",
            name: "The Ohio State University",
          },
          {
            "@type": "AdministrativeArea",
            name: "Columbus, Ohio",
          },
        ],
        knowsLanguage: ["en", "ta"],
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
        inLanguage: ["en-US", "ta"],
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

function parseEventIsoTimes(dateStr: string, timeStr?: string): { startDate: string; endDate: string } {
  const isoDate = toIsoDate(dateStr);
  if (!timeStr) {
    return {
      startDate: `${isoDate}T18:00:00-04:00`,
      endDate: `${isoDate}T21:00:00-04:00`,
    };
  }

  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match) {
    let startH = parseInt(match[1], 10);
    const startM = match[2];
    const startPeriod = match[3].toUpperCase();
    if (startPeriod === "PM" && startH < 12) startH += 12;
    if (startPeriod === "AM" && startH === 12) startH = 0;

    let endH = parseInt(match[4], 10);
    const endM = match[5];
    const endPeriod = match[6].toUpperCase();
    if (endPeriod === "PM" && endH < 12) endH += 12;
    if (endPeriod === "AM" && endH === 12) endH = 0;

    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      startDate: `${isoDate}T${pad(startH)}:${startM}:00-04:00`,
      endDate: `${isoDate}T${pad(endH)}:${endM}:00-04:00`,
    };
  }

  return {
    startDate: `${isoDate}T18:00:00-04:00`,
    endDate: `${isoDate}T21:00:00-04:00`,
  };
}

/**
 * Single Event Schema for individual dossiers and flagship highlights.
 */
export function EventJsonLd({ event }: { event?: SangamEvent } = {}) {
  const targetEvent = event || EVENTS.find((e) => e.status === "upcoming") || EVENTS[0];
  if (!targetEvent) return null;
  const { startDate, endDate } = parseEventIsoTimes(targetEvent.date, targetEvent.time);
  const eventLd = {
    "@context": "https://schema.org",
    "@type": "Festival",
    "@id": `${SITE_URL}/events/${targetEvent.slug}#event`,
    name: `${targetEvent.titleEn} (${targetEvent.titleTa})`,
    alternateName: targetEvent.titleTa,
    description: targetEvent.descriptionEn || targetEvent.taglineEn,
    startDate,
    endDate,
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
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/events#webpage`,
    url: `${SITE_URL}/events`,
    name: "Campus Events & Cultural Festivals | OSU Tamil Sangam",
    description:
      "Explore upcoming and archived gatherings hosted by Tamil Sangam at The Ohio State University.",
    mainEntity: {
      "@type": "ItemList",
      name: "OSU Tamil Sangam Cultural Calendar & Gatherings",
      itemListElement: eventList.map((event, index) => {
        const { startDate, endDate } = parseEventIsoTimes(event.date, event.time);
        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Festival",
            "@id": `${SITE_URL}/events/${event.slug}#event`,
            name: `${event.titleEn} (${event.titleTa})`,
            alternateName: event.titleTa,
            description: event.descriptionEn || event.taglineEn,
            startDate,
            endDate,
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
    },
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
    "@type": "AboutPage",
    "@id": `${SITE_URL}/board#webpage`,
    name: "OSU Tamil Sangam Executive Board Officers 2026-2027",
    description:
      "Elected student executive officers and committee coordinators of The Ohio State University Tamil Sangam.",
    mainEntity: {
      "@type": "ItemList",
      name: "OSU Tamil Sangam Executive Board Officers",
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
            "@type": "CollegeOrUniversity",
            name: "The Ohio State University",
            url: "https://www.osu.edu",
            sameAs: "https://en.wikipedia.org/wiki/Ohio_State_University",
          },
          memberOf: {
            "@id": `${SITE_URL}/#organization`,
          },
        },
      })),
    },
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * AboutPage Schema for /about
 */
export function AboutPageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/about#webpage`,
    url: `${SITE_URL}/about`,
    name: "About Us, Heritage & Five Pillars | OSU Tamil Sangam",
    description:
      "Mission, history, and Five Pillars of Tamil Sangam at The Ohio State University — an open cultural home for all students on the banks of the Olentangy River.",
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    about: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: ["en-US", "ta-IN"],
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * Join Page WebPage Schema for /join
 */
export function JoinPageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/join#webpage`,
    url: `${SITE_URL}/join`,
    name: "Join OSU Tamil Sangam | Free Membership Guestbook",
    description:
      "Join Tamil Sangam at The Ohio State University. 100% free, zero dues, open to every Buckeye student regardless of language.",
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    potentialAction: {
      "@type": "JoinAction",
      target: `${SITE_URL}/join`,
      name: "Sign Campus Guestbook",
      result: {
        "@type": "Role",
        roleName: "Member",
        price: "0",
        priceCurrency: "USD",
      },
    },
    inLanguage: ["en-US", "ta-IN"],
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * ImageGallery Schema for /gallery/[album] photo archives
 */
export function ImageGalleryJsonLd({ album }: { album: GalleryAlbum }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${SITE_URL}/events/${album.eventSlug || album.slug}#photo-vault`,
    name: `${album.titleEn} | Campus Photo Archive`,
    alternateName: album.titleTa,
    description: album.descriptionEn,
    url: `${SITE_URL}/events/${album.eventSlug || album.slug}`,
    datePublished: album.eventDate,
    organizer: {
      "@id": `${SITE_URL}/#organization`,
    },
    image: album.photos.map((photo) => ({
      "@type": "ImageObject",
      name: photo.titleEn,
      caption: photo.captionEn,
      contentUrl: photo.imageUrl.startsWith("http")
        ? photo.imageUrl
        : `${SITE_URL}${photo.imageUrl}`,
      datePublished: photo.eventDate,
    })),
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * WebApplication & VideoGame Schema for /games (Solla & Thodarpu)
 */
export function GamesJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "VideoGame"],
        "@id": `${SITE_URL}/games#solla`,
        name: "Solla (சொல்லு) — Tamil Wordle",
        alternateName: "Solla Tamil Word Puzzle",
        description:
          "Daily Tamil and Tanglish wordle puzzle game created by OSU Tamil Sangam. Guess the 5-letter Tamil/Tanglish word in 6 attempts.",
        genre: "Word Puzzle",
        applicationCategory: "GameApplication",
        operatingSystem: "Any",
        inLanguage: ["ta", "en"],
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
      {
        "@type": ["WebApplication", "VideoGame"],
        "@id": `${SITE_URL}/games#thodarbu`,
        name: "Thodarbu (தொடர்பு) — Tamil Connections",
        alternateName: "Thodarbu Tamil Connections Puzzle",
        description:
          "Daily Tamil connection game created by OSU Tamil Sangam. Group 16 cultural and linguistic tiles into 4 secret categories.",
        genre: "Word Puzzle",
        applicationCategory: "GameApplication",
        operatingSystem: "Any",
        inLanguage: ["ta", "en"],
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
    ],
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * Guide Directory Schema for /guide
 * Enriches the Columbus Tamil Survival Directory with LocalBusiness, Restaurant,
 * GroceryStore items, and embeds the complete FAQPage accordion for rich snippets.
 */
export function GuideDirectoryJsonLd() {
  const guideItemList = COLUMBUS_GUIDE.map((spot, index) => {
    let placeType = "LocalBusiness";
    if (spot.category === "Food & Groceries") {
      if (spot.name.toLowerCase().includes("market") || spot.name.toLowerCase().includes("carry") || spot.name.toLowerCase().includes("patel")) {
        placeType = "GroceryStore";
      } else {
        placeType = "Restaurant";
      }
    } else if (spot.category === "Theaters & Kollywood") {
      placeType = "MovieTheater";
    }

    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": placeType,
        name: spot.name,
        alternateName: spot.tamilName,
        description: `${spot.descriptionEn} (${spot.distanceFromCampus})`,
        address: {
          "@type": "PostalAddress",
          streetAddress: spot.address,
          addressLocality: "Columbus",
          addressRegion: "OH",
          addressCountry: "US",
        },
        hasMap: spot.mapsUrl,
      },
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/guide#directory`,
        url: `${SITE_URL}/guide`,
        name: "Columbus Tamil Student Directory & Survival Guide",
        description:
          "Curated local guide for Indian & South Asian students at Ohio State: Indian grocery stores, Kollywood theaters, and Tamil restaurants in Columbus.",
        mainEntity: {
          "@type": "ItemList",
          name: "Columbus Tamil Student Directory Spots",
          itemListElement: guideItemList,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/guide#faq`,
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.questionEn,
          alternateName: faq.questionTa,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answerEn,
          },
        })),
      },
    ],
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * Dance Troupe Sign-Up & Performance Schema for /dance
 */
export function DanceJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/dance#webpage`,
        url: `${SITE_URL}/dance`,
        name: "Dance Performance Sign-Ups & Auditions | OSU Tamil Sangam",
        description:
          "Register for OSU Tamil Sangam collegiate dance troupes. Kuthu, Gaana, classical Bharatanatyam, and Kollywood choreography for Ohio State cultural galas. 100% free.",
        potentialAction: {
          "@type": "JoinAction",
          target: `${SITE_URL}/dance`,
          name: "Sign Up for Dance Troupes",
          result: {
            "@type": "Role",
            roleName: "Performer",
            price: "0",
            priceCurrency: "USD",
          },
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/dance#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "Are dance troupe auditions free at OSU Tamil Sangam?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, 100% free with zero audition fees, membership dues, or costume rental fees.",
            },
          },
          {
            "@type": "Question",
            name: "Do I need prior dance experience to join the OSU Tamil Sangam dance troupes?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No prior dance experience is required! We hold student-led beginner rehearsal workshops for Kuthu, Gaana, and cinematic fusion.",
            },
          },
          {
            "@type": "Question",
            name: "Where are dance rehearsals held on the Ohio State campus?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Rehearsals are held in the RPAC multi-purpose studios and Ohio Union student practice spaces.",
            },
          },
        ],
      },
    ],
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * MusicPlaylist & Campus Collaboration Schema for /ideas and /suggestions
 */
export function PlaylistJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/suggestions#webpage`,
        url: `${SITE_URL}/suggestions`,
        name: "The Ideas Hearth & Collaborative Tamil Playlist | OSU Tamil Sangam",
        description:
          "Submit campus event proposals and collaborate on the All-OSU Collaborative Tamil Spotify Playlist.",
      },
      {
        "@type": "MusicPlaylist",
        "@id": `${SITE_URL}/suggestions#playlist`,
        name: "All-OSU Collaborative Tamil Playlist",
        description:
          "Crowdsourced Spotify and Apple Music playlist featuring favorite Kollywood, indie Tamil, Carnatic fusion, and acoustic tracks submitted by Ohio State students.",
        genre: "Kollywood / Tamil Independent",
        inLanguage: "ta",
        numTracks: 150,
        author: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
    ],
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * ProfilePage / CollectionPage Schema for /links
 */
export function LinksPageJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/links#webpage`,
    url: `${SITE_URL}/links`,
    name: "Official Quick Links & Social Hub | OSU Tamil Sangam",
    description:
      "All official channels, GroupMe chats, Instagram handles, photo vaults, and membership portals for OSU Tamil Sangam at The Ohio State University.",
    mainEntity: {
      "@type": "ItemList",
      name: "OSU Tamil Sangam Quick Links",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Official Student GroupMe",
          url: SITE_CONFIG.groupMeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Official Instagram @tamilsangam.osu",
          url: SITE_CONFIG.instagramUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "TikTok @osutamilsangam",
          url: "https://www.tiktok.com/@osutamilsangam",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "Ohio State Student Activities Official Directory",
          url: "https://activities.osu.edu/involvement/student_organizations/find_a_student_org/?i=Tamil+Sangam",
        },
      ],
    },
  };

  return <JsonLd data={jsonLd} />;
}
