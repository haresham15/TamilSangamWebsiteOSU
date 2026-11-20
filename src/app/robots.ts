import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/guide/lab", "/home/lab", "/games/lab", "/spike"],
      },
      {
        userAgent: [
          "Googlebot",
          "Google-Extended",
          "GoogleOther",
          "Google-InspectionTool",
          "Bingbot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "GPTBot",
          "PerplexityBot",
          "Claude-SearchBot",
          "ClaudeBot",
          "Claude-Web",
          "anthropic-ai",
          "Applebot",
          "Applebot-Extended",
          "cohere-ai",
          "Meta-ExternalAgent",
        ],
        allow: "/",
        disallow: ["/api/", "/guide/lab", "/home/lab", "/games/lab", "/spike"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
