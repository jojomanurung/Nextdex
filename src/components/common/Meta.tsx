import Head from "next/head";
import { SITE_NAME, TWITTER_HANDLE, absoluteUrl } from "@dex/constant/site";

/** A single Schema.org (JSON-LD) node. */
export type JsonLd = Record<string, unknown>;

export type MetaProps = {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: "website" | "article";
  imageAlt?: string;
  /** Schema.org structured data rendered as <script type="application/ld+json">. */
  jsonLd?: JsonLd | JsonLd[];
};

// Renders the document <title> plus the Open Graph (Facebook) and Twitter card
// meta tags for a page. og:url and og:image are forced absolute because social
// crawlers ignore relative urls.
export function Meta({
  title,
  description,
  image,
  url,
  type = "website",
  imageAlt,
  jsonLd,
}: MetaProps) {
  const canonical = absoluteUrl(url);
  const ogImage = absoluteUrl(image);
  const alt = imageAlt ?? title;
  const ogLogo = absoluteUrl("/favicon.ico");
  // Serialize each JSON-LD node, escaping "<" so a value containing "</script>"
  // can't break out of the tag.
  const ldNodes = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  const ldScripts = ldNodes.map((node) =>
    JSON.stringify(node).replace(/</g, "\\u003c"),
  );

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.ico" />
      <meta property="og:logo" content={ogLogo} />

      {/* Facebook Card (Open Graph) */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={alt} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      {TWITTER_HANDLE && <meta name="twitter:site" content={TWITTER_HANDLE} />}
      {TWITTER_HANDLE && (
        <meta name="twitter:creator" content={TWITTER_HANDLE} />
      )}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={alt} />

      {/* Structured data (JSON-LD) */}
      {ldScripts.map((html, i) => (
        <script
          key={`ld-json-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
    </Head>
  );
}
