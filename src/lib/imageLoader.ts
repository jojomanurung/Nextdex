"use client";

// Using custom image loader cache and resize service using https://wsrv.nl/
// To save usage for image optimization on vercel
type ImageLoader = {
  src: string;
  width: string;
  quality: string;
};

export default function myImageLoader({ src, width, quality }: ImageLoader) {
  return `https://wsrv.nl/?url=${src}&w=${width}&q=${quality || 75}&maxage=31d`;
}
