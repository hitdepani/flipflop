"use client";

import Link from "next/link";
import { ArrowRight, Cpu, GitMerge, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] items-center justify-center p-6 md:p-12">
      {/* Hero Section */}
      <section className="w-full max-w-4xl mx-auto text-center flex flex-col items-center mt-12 md:mt-24 mb-24">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Visualize Digital Electronics
        </h1>
        <p className="text-xl text-[#cbd5e1] max-w-2xl mb-12">
          A clean, modern playground for logic gates, flip-flops, and sequential circuits.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/logic-gates"
            className="px-6 py-3 rounded-md bg-white text-[#0b0f14] font-medium hover:bg-[#e2e8f0] transition-colors flex items-center gap-2"
          >
            Explore
          </Link>
          <Link
            href="/circuit-builder"
            className="px-6 py-3 rounded-md bg-white/10 text-white font-medium hover:bg-white/15 transition-colors border border-white/10 flex items-center gap-2"
          >
            Try Circuit Builder <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 3 Small Cards */}
      <section className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 pb-24">
        <Link href="/logic-gates" className="group p-6 rounded-xl bg-[#131821] border border-white/5 hover:border-white/20 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Logic Gates</h3>
          <p className="text-sm text-[#cbd5e1]">Interactive sandbox for basic and derived gates.</p>
        </Link>
        
        <Link href="/flip-flops" className="group p-6 rounded-xl bg-[#131821] border border-white/5 hover:border-white/20 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
            <GitMerge className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Flip-Flops</h3>
          <p className="text-sm text-[#cbd5e1]">Visualize state changes in sequential circuits.</p>
        </Link>

        <Link href="/timing-diagrams" className="group p-6 rounded-xl bg-[#131821] border border-white/5 hover:border-white/20 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Timing Diagrams</h3>
          <p className="text-sm text-[#cbd5e1]">Analyze wave forms for clocks and signals.</p>
        </Link>
      </section>
    </div>
  );
}
