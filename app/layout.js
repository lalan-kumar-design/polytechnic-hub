import "./globals.css";
import PWARegister from "../components/PWARegister";
import OfflineIndicator from "../components/OfflineIndicator";

export const viewport = {
  themeColor: "#020d1c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "Polytechnic Hub",
  description: "Your Complete Learning Platform for a Brighter Future - Study Smart, Build Your Future",
  manifest: "/manifest.webmanifest",
  applicationName: "Polytechnic Hub",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PolyHub",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Polytechnic Hub",
    description: "Your Complete Learning Platform for a Brighter Future - Study Smart, Build Your Future",
    images: ["/logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <PWARegister />
        <OfflineIndicator />
        {children}
      </body>
    </html>
  );
}
