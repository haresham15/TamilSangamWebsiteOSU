import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.gallery.title,
  description: ROUTE_METADATA.gallery.description,
  path: ROUTE_METADATA.gallery.path,
  keywords: [
    "Photo Gallery OSU Tamil Sangam",
    "Tamil Sangam at OSU photos",
    "Ohio State Tamil photo archive",
    "35mm campus photography OSU",
    "cultural dance performances Ohio State",
    "banana-leaf feasts Columbus",
    "South Oval memories",
  ],
});

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Photo Gallery & Archive", url: "/gallery" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      {children}
    </>
  );
}
