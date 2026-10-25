import "./globals.css";

export const metadata = {
  title: "Polytechnic Hub",
  description: "Your Complete Learning Platform for a Brighter Future - Study Smart, Build Your Future",
  openGraph: {
    title: "Polytechnic Hub",
    description: "Your Complete Learning Platform for a Brighter Future - Study Smart, Build Your Future",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
