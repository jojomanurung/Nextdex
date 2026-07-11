/** A single Schema.org (JSON-LD) node. */
export type JsonLdNode = Record<string, unknown>;

// Renders one or more Schema.org nodes as <script type="application/ld+json">.
// The App Router Metadata API doesn't cover structured data, so this drops it
// straight into the page's server-rendered markup (the documented approach).
// Each node is serialized with "<" escaped so a value containing "</script>"
// can't break out of the tag.
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const nodes = Array.isArray(data) ? data : [data];

  return (
    <>
      {nodes.map((node, i) => (
        <script
          key={`ld-json-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(node).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
