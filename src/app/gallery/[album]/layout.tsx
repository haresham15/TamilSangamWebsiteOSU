import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GALLERY_ALBUMS } from "@/data/gallery";
import { BreadcrumbJsonLd, ImageGalleryJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, SITE_URL } from "@/lib/seo";

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
  if (!album) return {};

  return buildRouteMetadata({
    title: `${album.titleEn} | Campus Photo Archive`,
    description: album.descriptionEn,
    path: `/gallery/${album.slug}`,
    image: album.coverImage?.startsWith("http")
      ? album.coverImage
      : `${SITE_URL}${album.coverImage || "/emblem.svg"}`,
    imageAlt: `${album.titleEn} - OSU Tamil Sangam Campus Photos`,
  });
}

export default async function AlbumLayout({ children, params }: AlbumLayoutProps) {
  const { album: albumSlug } = await params;
  const album = GALLERY_ALBUMS.find((a) => a.slug === albumSlug);
  if (!album) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Events", url: "/events" },
          { name: album.titleEn, url: `/gallery/${album.slug}` },
        ]}
      />
      <ImageGalleryJsonLd album={album} />
      {children}
    </>
  );
}
