import type { Metadata } from "next";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { PhotoAlbumJsonLd } from "@/components/global/JsonLd";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { constructAlternates, constructCanonical, DEFAULT_ROBOTS, SITE_URL } from "@/lib/seo";

interface AlbumLayoutProps {
  children: React.ReactNode;
  params: Promise<{ album: string }>;
}

export async function generateStaticParams() {
  return GALLERY_ALBUMS.map((album) => ({
    album: album.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ album: string }>;
}): Promise<Metadata> {
  const { album: albumSlug } = await params;
  const album = GALLERY_ALBUMS.find((a) => a.slug === albumSlug);

  if (!album) {
    return {
      title: "Photo Album | OSU Tamil Sangam",
      description: "Ohio State Tamil Sangam event photo archive.",
    };
  }

  const title = `${album.titleEn} (${album.titleTa}) | OSU Tamil Sangam Photos`;
  const description = `${album.descriptionEn} High-resolution photography archive from ${album.eventDate} at ${album.location}. Contains ${album.photoCount} event photos.`;
  const canonical = constructCanonical(`/gallery/${album.slug}`);
  const cover = album.coverImage?.startsWith("http")
    ? album.coverImage
    : `${SITE_URL}${album.coverImage || "/opengraph-image"}`;

  return {
    title: {
      absolute: title,
    },
    description,
    keywords: [
      album.titleEn,
      album.titleTa,
      "OSU Tamil Sangam Photos",
      "Ohio State cultural photography",
      album.location,
      "Tamil festival gallery Columbus",
    ],
    alternates: constructAlternates(`/gallery/${album.slug}`),
    robots: DEFAULT_ROBOTS,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "OSU Tamil Sangam",
      images: [
        {
          url: cover,
          width: 1200,
          height: 800,
          alt: `${album.titleEn} — OSU Tamil Sangam`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [cover],
    },
  };
}

export default async function AlbumDetailLayout({
  children,
  params,
}: AlbumLayoutProps) {
  const { album: albumSlug } = await params;
  const album = GALLERY_ALBUMS.find((a) => a.slug === albumSlug);

  return (
    <>
      {album && (
        <>
          <PhotoAlbumJsonLd album={album} />
          <BreadcrumbJsonLd
            items={[
              { name: "Home", url: "/" },
              { name: "Gallery", url: "/gallery" },
              { name: album.titleEn, url: `/gallery/${album.slug}` },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
