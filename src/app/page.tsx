"use client";

import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import GateLab from "@/components/GateLab/GateLab";
import FlipFlopLab from "@/components/FlipFlop/FlipFlopLab";
import CircuitBuilder from "@/components/CircuitBuilder/CircuitBuilder";
import TimingDiagram from "@/components/TimingDiagram/TimingDiagram";
import Footer from "@/components/Footer";
import CursorEffect from "@/components/CursorEffect";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0f1419] overflow-x-hidden">
      <CursorEffect />
      <Nav />
      <Hero />
      <div className="section-divider mx-4 md:mx-6" />
      <GateLab />
      <div className="section-divider mx-4 md:mx-6" />
      <FlipFlopLab />
      <div className="section-divider mx-4 md:mx-6" />
      <CircuitBuilder />
      <div className="section-divider mx-4 md:mx-6" />
      <TimingDiagram />
      <Footer />
    </main>
  );
}
