import ParticleNetwork from "@/components/ParticleNetwork";
import Link from "next/link";
import Footer from "@/components/Footer";
import { Cpu, Zap, Activity, Grid } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden flex flex-col">
      <ParticleNetwork />

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 mt-10">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
          <span className="text-sm font-medium tracking-wide gradient-text-amber">Interactive Digital Electronics Lab</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 text-white drop-shadow-2xl">
          Master Digital Logic <br className="hidden md:block" />
          <span className="gradient-text-amber">Visually & Interactively</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 font-light">
          A premium toolkit to build, simulate, and understand logic gates, flip-flops, and sequential circuits in real-time. No installation required.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/logic-gates" className="neon-btn neon-btn-amber text-center">
            Explore Logic Gates
          </Link>
          <Link href="/circuit-builder" className="px-6 py-3 rounded-lg font-semibold text-white/80 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all text-center">
            Try Circuit Builder
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Learning Tools</h2>
          <p className="text-white/50 max-w-xl mx-auto">Everything you need to understand digital electronics from the ground up, all in one platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Link href="/logic-gates" className="glass-card glass-card-hover p-6 flex flex-col items-start group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="text-amber-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Logic Gates</h3>
            <p className="text-sm text-white/50 leading-relaxed">Interactive playground for fundamental AND, OR, NOT, NAND, NOR, and XOR gates.</p>
          </Link>

          {/* Card 2 */}
          <Link href="/flip-flops" className="glass-card glass-card-hover p-6 flex flex-col items-start group">
            <div className="w-12 h-12 rounded-xl bg-[#39ff14]/10 border border-[#39ff14]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="text-[#39ff14]" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Flip-Flops</h3>
            <p className="text-sm text-white/50 leading-relaxed">Visualize state changes in SR, D, JK, and T flip-flops with clock waveforms.</p>
          </Link>

          {/* Card 3 */}
          <Link href="/circuit-builder" className="glass-card glass-card-hover p-6 flex flex-col items-start group">
            <div className="w-12 h-12 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Grid className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Circuit Builder</h3>
            <p className="text-sm text-white/50 leading-relaxed">Drag-and-drop canvas to design, connect, and simulate complex digital circuits.</p>
          </Link>

          {/* Card 4 */}
          <Link href="/timing-diagrams" className="glass-card glass-card-hover p-6 flex flex-col items-start group">
            <div className="w-12 h-12 rounded-xl bg-pink-400/10 border border-pink-400/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="text-pink-400" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Timing Diagrams</h3>
            <p className="text-sm text-white/50 leading-relaxed">Generate and analyze waveforms dynamically to understand timing and propagation delays.</p>
          </Link>
        </div>
      </section>

      {/* Why Use Section */}
      <section className="px-6 py-20 bg-white/[0.02] border-t border-white/5 mt-auto">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Why FlipLogic?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white/90 mb-2">Visual Learning</h4>
              <p className="text-sm text-white/50">Abstract concepts become clear when you can see the signals flow through the wires in real-time.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white/90 mb-2">No Setup Required</h4>
              <p className="text-sm text-white/50">Forget heavy desktop applications. Build and simulate directly in your browser with zero latency.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white/90 mb-2">Professional UI</h4>
              <p className="text-sm text-white/50">Designed with a premium dark aesthetic that makes learning digital logic feel like the future.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
