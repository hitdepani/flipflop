import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlipLogic - Digital Electronics Lab",
  description:
    "An immersive, interactive learning platform for digital electronics. Build, simulate, and visualize logic gates, flip-flops, circuits, and timing diagrams in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased min-h-screen overflow-x-hidden">
        <Nav />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
