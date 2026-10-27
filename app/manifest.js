export default function manifest() {
  return {
    id: "/",
    name: "Polytechnic Hub",
    short_name: "PolyHub",
    description: "Your Complete Learning Platform for a Brighter Future - Study Smart, Build Your Future",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#020d1c",
    theme_color: "#020d1c",
    orientation: "portrait",
    categories: ["education", "books"],
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
