import type { Metadata } from "next";
import { SITE_NAME, TWITTER_HANDLE, absoluteUrl } from "@dex/constant/site";

type BuildMetadataArgs = {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: "website" | "article";
  imageAlt?: string;
};

// Builds a Next Metadata object (title + Open Graph + Twitter card + canonical)
// for a page. Replaces the old <Meta> head component now that the App Router's
// Metadata API owns <head>. og:url and og:image are forced absolute because
// social crawlers ignore relative urls.
export function buildMetadata({
  title,
  description,
  image,
  url,
  type = "website",
  imageAlt,
}: BuildMetadataArgs): Metadata {
  const canonical = absoluteUrl(url);
  const ogImage = absoluteUrl(image);
  const alt = imageAlt ?? title;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      siteName: SITE_NAME,
      type,
      title,
      description,
      url: canonical,
      images: [{ url: ogImage, alt }],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_HANDLE || undefined,
      creator: TWITTER_HANDLE || undefined,
      title,
      description,
      images: [{ url: ogImage, alt }],
    },
  };
}
