"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) 
      return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    interface Node {
      x: number; y: number; vx: number; vy: number; pulsePhase: number;
    }

    const count = window.innerWidth < 600 ? 25 : 55;
    const nodes: Node[] = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    let animId: number;
    let t = 0;

    const draw = () => {
      ctx.fillStyle = "rgba(6,9,14,0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      t += 0.012;

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      const maxDist = window.innerWidth < 600 ? 120 : 160;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.3;
            const pulse = Math.sin(t + nodes[i].pulsePhase) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${200 + pulse * 32},${140 + pulse * 28},${50 + pulse * 23},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((node) => {
        const pulse = Math.sin(t + node.pulsePhase) * 0.5 + 0.5;
        const size = 1.5 + pulse * 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,168,73,${0.4 + pulse * 0.6})`;
        ctx.fill();

        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, size * 4);
        gradient.addColorStop(0, `rgba(232,168,73,${0.15 * pulse})`);
        gradient.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const sections = [
    { id: "gate-lab", icon: "⊕", label: "Gate Lab", color: "#e8a849" },
    { id: "flipflop", icon: "⎋", label: "Flip-Flop", color: "#34d399" },
    { id: "circuit-builder", icon: "◈", label: "Builder", color: "#60a5fa" },
    { id: "timing", icon: "≋", label: "Timing", color: "#f472b6" },
  ];

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[100svh] flex flex-col items-center justify-center overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(232,168,73,0.08) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0f1419] pointer-events-none" />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-4 md:px-6 max-w-5xl mx-auto w-full pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="section-badge mx-auto mb-6 md:mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#34d399] animate-pulse" />
          Interactive Electronics Lab · v2.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none mb-4"
        >
          <span className="block text-white">FLIP</span>
          <span className="block gradient-text-amber">LOGIC</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-8 md:mb-12 leading-relaxed px-2 font-medium"
        >
          An immersive, interactive learning platform for{" "}
          <span className="text-[#e8a849]">logic gates</span>,{" "}
          <span className="text-[#34d399]">flip-flops</span>, and{" "}
          <span className="text-[#60a5fa]">sequential circuits</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10 md:mb-12"
        >
          <motion.a
            href="/logic-gates"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all"
            style={{ background: "linear-gradient(135deg, #e8a849, #fb923c)" }}
          >
            Explore Logic Gates
          </motion.a>
          
          <motion.a
            href="/circuit-builder"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white glass-card shadow-lg transition-all border border-white/10 hover:border-white/30"
          >
            Try Circuit Builder
          </motion.a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="hidden md:flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-sm font-mono tracking-widest uppercase">Scroll to explore</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
        </motion.div>
      </motion.div>

      {/* Floating labels — desktop only */}
      {[
        { text: "SR Latch", x: "8%", y: "20%", delay: 0.8, color: "#34d399" },
        { text: "XOR Gate", x: "85%", y: "15%", delay: 1.0, color: "#e8a849" },
        { text: "D Flip-Flop", x: "88%", y: "70%", delay: 1.1, color: "#60a5fa" },
        { text: "JK Counter", x: "5%", y: "75%", delay: 0.9, color: "#f472b6" },
      ].map((item) => (
        <motion.div
          key={item.text}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: item.delay, duration: 0.6 }}
          style={{ position: "absolute", left: item.x, top: item.y }}
          className="hidden lg:block"
        >
          <div
            className="font-mono text-xs px-3 py-1.5 rounded-full"
            style={{
              background: `${item.color}12`,
              border: `1px solid ${item.color}30`,
              color: item.color,
              animation: "float 5s ease-in-out infinite",
              animationDelay: "1s",
            }}
          >
            {item.text}
          </div>
        </motion.div>
      ))}
    </section>
  );
}
