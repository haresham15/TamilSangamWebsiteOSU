import type { Metadata } from "next";
import { buildRouteMetadata, ROUTE_METADATA } from "@/lib/seo";

export const metadata: Metadata = buildRouteMetadata({
  title: ROUTE_METADATA.suggestions.title,
  description: ROUTE_METADATA.suggestions.description,
  path: "/suggestions",
});

export default function IdeasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
