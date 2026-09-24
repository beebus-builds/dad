import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shram Jagaran CMS",
    short_name: "Shram Jagaran",
    description: "Content management system for the Shram Jagaran trade union.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9fc",
    theme_color: "#1d4ed8",
    icons: [],
  };
}
