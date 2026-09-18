export const metadata = {
  title: "POLYTECHNIC HUB",
  description: "Educational platform for Polytechnic students",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
