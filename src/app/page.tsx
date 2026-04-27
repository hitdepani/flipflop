"use client";

import Hero from "@/components/Hero";
import { motion } from "framer-motion";
import Link from "next/link";

const features = [
  { title: "Logic Gates", desc: "Interactive truth tables and real-time boolean logic simulation.", link: "/logic-gates", color: "#e8a849", icon: "⊕" },
  { title: "Flip-Flops", desc: "Visualize state changes with clock pulses and edge-triggering.", link: "/flip-flops", color: "#34d399", icon: "⎋" },
  { title: "Circuit Builder", desc: "Drag-and-drop canvas to design and test custom digital circuits.", link: "/circuit-builder", color: "#60a5fa", icon: "◈" },
  { title: "Timing Diagrams", desc: "Analyze signal waveforms and verify sequential behavior.", link: "/timing-diagrams", color: "#f472b6", icon: "≋" },
];

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      
      <section className="py-24 px-6 max-w-6xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">Powerful Learning Tools</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Everything you need to master digital electronics, packed into an intuitive, visually stunning interface.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={f.link} className="block group">
                <div className="glass-card rounded-2xl p-6 h-full border border-white/5 transition-all duration-300 hover:border-white/20 hover:-translate-y-1" style={{ boxShadow: `0 4px 20px ${f.color}05` }}>
                  <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-2xl" style={{ background: `${f.color}15`, color: f.color }}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text transition-colors" style={{ backgroundImage: `linear-gradient(135deg, ${f.color}, #fff)` }}>{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 relative z-10 bg-[#0a0d13]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-black mb-8 text-white">Why use FlipLogic?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-[#e8a849] font-bold mb-2 text-lg">Interactive Learning</h4>
                <p className="text-gray-400 text-sm">Stop reading textbooks. Start clicking, dragging, and seeing the logic flow in real-time.</p>
              </div>
              <div>
                <h4 className="text-[#34d399] font-bold mb-2 text-lg">Premium Visuals</h4>
                <p className="text-gray-400 text-sm">A distraction-free, futuristic dark UI designed to keep you engaged and focused.</p>
              </div>
              <div>
                <h4 className="text-[#60a5fa] font-bold mb-2 text-lg">Instant Feedback</h4>
                <p className="text-gray-400 text-sm">Instantly see truth tables update and waveforms shift as you interact with the circuits.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
