/** A single Schema.org (JSON-LD) node. */
export type JsonLdNode = Record<string, unknown>;

// Renders one or more Schema.org nodes as <script type="application/ld+json">.
// The App Router Metadata API doesn't cover structured data, so this drops it
// into the page's server-rendered markup (the documented approach).
export function JsonLd({ data }: { data: JsonLdNode | JsonLdNode[] }) {
  const nodes = Array.isArray(data) ? data : [data];

  // Emit the <script> via server innerHTML rather than as a React element:
  // React 19 reconciles a client-side <script> and errors ("Encountered a
  // script tag…"), though a JSON-LD data script never executes. The
  // display:contents wrapper adds no layout box, and "<" stays escaped so a
  // value can't close the tag early.
  const html = nodes
    .map(
      (node) =>
        `<script type="application/ld+json">${JSON.stringify(node).replace(/</g, "\\u003c")}</script>`,
    )
    .join("");

  return (
    <div
      style={{ display: "contents" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
