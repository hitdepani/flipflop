import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CursorEffect from "@/components/CursorEffect";

export const metadata: Metadata = {
  title: "FlipLogic — Digital Electronics Lab",
  description:
    "An immersive, interactive learning platform for Digital Electronics — Logic Gates, Flip-Flops, and Sequential Circuits. Build, simulate, and visualize circuits in real-time.",
  keywords: ["digital electronics", "flip flop", "logic gates", "circuit simulation", "interactive learning"],
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
      <body className="antialiased bg-[#0f1419] overflow-x-hidden min-h-screen relative">
        <CursorEffect />
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
