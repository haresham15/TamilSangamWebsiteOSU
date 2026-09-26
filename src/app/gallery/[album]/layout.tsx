import type { Metadata } from "next";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { PhotoAlbumJsonLd, BreadcrumbJsonLd } from "@/components/global/JsonLd";

interface AlbumLayoutProps {
  children: React.ReactNode;
  params: Promise<{ album: string }>;
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

  const title = `${album.titleEn} (${album.titleTa}) · Photo Album`;
  const description = `${album.descriptionEn} High-resolution photography archive from ${album.eventDate} at ${album.location}. Contains ${album.photoCount} event photos.`;
  const cover = album.coverImage || "/emblem.svg";

  return {
    title,
    description,
    keywords: [
      album.titleEn,
      album.titleTa,
      "OSU Tamil Sangam Photos",
      "Ohio State cultural photography",
      album.location,
      "Tamil festival gallery Columbus",
    ],
    alternates: {
      canonical: `https://osutamilsangam.org/gallery/${album.slug}`,
    },
    openGraph: {
      title: `${album.titleEn} · Photo Archive`,
      description,
      url: `https://osutamilsangam.org/gallery/${album.slug}`,
      siteName: "OSU Tamil Sangam",
      images: [
        {
          url: cover,
          width: 1200,
          height: 800,
          alt: `${album.titleEn} Cover Photo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${album.titleEn} · Photo Archive`,
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
