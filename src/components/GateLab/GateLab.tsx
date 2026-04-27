"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type GateType = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR" | "XNOR";
type Bit = 0 | 1;

const GATE_COLORS: Record<GateType, string> = {
  AND: "#e8a849", OR: "#34d399", NOT: "#f472b6",
  NAND: "#60a5fa", NOR: "#fb923c", XOR: "#2dd4bf", XNOR: "#a78bfa",
};

const GATE_DESCRIPTIONS: Record<GateType, string> = {
  AND: "Output is HIGH only when ALL inputs are HIGH.", OR: "Output is HIGH when AT LEAST ONE input is HIGH.",
  NOT: "Inverts the input signal.", NAND: "NOT-AND — Universal gate. Output LOW only when all inputs HIGH.",
  NOR: "NOT-OR — Universal gate. Output HIGH only when all inputs LOW.",
  XOR: "Exclusive OR — Output HIGH when inputs DIFFER.", XNOR: "Exclusive NOR — Output HIGH when inputs are SAME.",
};

function computeGate(gate: GateType, a: Bit, b: Bit): Bit {
  switch (gate) {
    case "AND": return (a & b) as Bit;
    case "OR": return (a | b) as Bit;
    case "NOT": return (a === 0 ? 1 : 0) as Bit;
    case "NAND": return ((a & b) === 1 ? 0 : 1) as Bit;
    case "NOR": return ((a | b) === 0 ? 1 : 0) as Bit;
    case "XOR": return (a ^ b) as Bit;
    case "XNOR": return ((a ^ b) === 0 ? 1 : 0) as Bit;
  }
}

function getTruthTable(gate: GateType): Array<[Bit, Bit, Bit]> {
  if (gate === "NOT") return [[0, 0, computeGate("NOT", 0, 0)], [1, 0, computeGate("NOT", 1, 0)]];
  return [[0, 0, computeGate(gate, 0, 0)], [0, 1, computeGate(gate, 0, 1)], [1, 0, computeGate(gate, 1, 0)], [1, 1, computeGate(gate, 1, 1)]];
}

function getExplanation(gate: GateType, a: Bit, b: Bit, out: Bit): string {
  const outStr = out === 1 ? "HIGH (1)" : "LOW (0)";
  switch (gate) {
    case "AND": return out === 1 ? `Both inputs HIGH → AND outputs ${outStr}` : `At least one input LOW → AND outputs ${outStr}`;
    case "OR": return out === 1 ? `At least one input HIGH → OR outputs ${outStr}` : `Both inputs LOW → OR outputs ${outStr}`;
    case "NOT": return `Input is ${a} → NOT inverts → outputs ${outStr}`;
    case "NAND": return out === 0 ? `Both inputs HIGH → NAND outputs ${outStr}` : `Not all inputs HIGH → NAND outputs ${outStr}`;
    case "NOR": return out === 1 ? `All inputs LOW → NOR outputs ${outStr}` : `At least one HIGH → NOR outputs ${outStr}`;
    case "XOR": return out === 1 ? `Inputs differ (${a}≠${b}) → XOR outputs ${outStr}` : `Inputs equal (${a}=${b}) → XOR outputs ${outStr}`;
    case "XNOR": return out === 1 ? `Inputs equal → XNOR outputs ${outStr}` : `Inputs differ → XNOR outputs ${outStr}`;
  }
}

function GateSVG({ gate, a, b, out, color }: { gate: GateType; a: Bit; b: Bit; out: Bit; color: string }) {
  const single = gate === "NOT";
  const activeWire = "#34d399";

  const shape = () => {
    switch (gate) {
      case "AND": return <path d="M 40 30 L 70 30 Q 95 30 95 55 Q 95 80 70 80 L 40 80 Z" fill="none" stroke={color} strokeWidth="2" />;
      case "OR": return <path d="M 40 30 Q 55 55 40 80 Q 60 70 80 55 Q 60 40 40 30 Z" fill="none" stroke={color} strokeWidth="2" />;
      case "NOT": return <><path d="M 40 35 L 40 75 L 80 55 Z" fill="none" stroke={color} strokeWidth="2" /><circle cx="84" cy="55" r="4" fill="none" stroke={color} strokeWidth="2" /></>;
      case "NAND": return <><path d="M 40 30 L 70 30 Q 90 30 90 55 Q 90 80 70 80 L 40 80 Z" fill="none" stroke={color} strokeWidth="2" /><circle cx="94" cy="55" r="4" fill="none" stroke={color} strokeWidth="2" /></>;
      case "NOR": return <><path d="M 40 30 Q 55 55 40 80 Q 60 70 78 55 Q 60 40 40 30 Z" fill="none" stroke={color} strokeWidth="2" /><circle cx="82" cy="55" r="4" fill="none" stroke={color} strokeWidth="2" /></>;
      case "XOR": return <><path d="M 40 30 Q 55 55 40 80 Q 60 70 80 55 Q 60 40 40 30 Z" fill="none" stroke={color} strokeWidth="2" /><path d="M 35 30 Q 50 55 35 80" fill="none" stroke={color} strokeWidth="2" /></>;
      case "XNOR": return <><path d="M 40 30 Q 55 55 40 80 Q 60 70 76 55 Q 60 40 40 30 Z" fill="none" stroke={color} strokeWidth="2" /><path d="M 35 30 Q 50 55 35 80" fill="none" stroke={color} strokeWidth="2" /><circle cx="80" cy="55" r="4" fill="none" stroke={color} strokeWidth="2" /></>;
    }
  };

  const outX = ["NOT", "NAND", "NOR", "XNOR"].includes(gate) ? 88 : 95;

  return (
    <svg viewBox="0 0 140 110" className="w-full h-full">
      <g style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}>{shape()}</g>
      {!single && <>
        <line x1="10" y1="40" x2="40" y2="40" stroke={a === 1 ? activeWire : "rgba(255,255,255,0.15)"} strokeWidth="2.5" style={a === 1 ? { filter: `drop-shadow(0 0 4px ${activeWire})` } : {}} />
        <line x1="10" y1="70" x2="40" y2="70" stroke={b === 1 ? activeWire : "rgba(255,255,255,0.15)"} strokeWidth="2.5" style={b === 1 ? { filter: `drop-shadow(0 0 4px ${activeWire})` } : {}} />
      </>}
      {single && <line x1="10" y1="55" x2="40" y2="55" stroke={a === 1 ? activeWire : "rgba(255,255,255,0.15)"} strokeWidth="2.5" style={a === 1 ? { filter: `drop-shadow(0 0 4px ${activeWire})` } : {}} />}
      <line x1={outX} y1="55" x2="130" y2="55" stroke={out === 1 ? activeWire : "rgba(255,255,255,0.15)"} strokeWidth="2.5" style={out === 1 ? { filter: `drop-shadow(0 0 4px ${activeWire})` } : {}} />
      {a === 1 && !single && <circle r="3" fill={activeWire} style={{ filter: `drop-shadow(0 0 4px ${activeWire})` }}><animate attributeName="cx" from="10" to="38" dur="1s" repeatCount="indefinite" /><animate attributeName="cy" values="40" dur="1s" repeatCount="indefinite" /></circle>}
      {b === 1 && !single && <circle r="3" fill={activeWire} style={{ filter: `drop-shadow(0 0 4px ${activeWire})` }}><animate attributeName="cx" from="10" to="38" dur="1s" repeatCount="indefinite" /><animate attributeName="cy" values="70" dur="1s" repeatCount="indefinite" /></circle>}
      {a === 1 && single && <circle r="3" fill={activeWire} style={{ filter: `drop-shadow(0 0 4px ${activeWire})` }}><animate attributeName="cx" from="10" to="38" dur="1s" repeatCount="indefinite" /><animate attributeName="cy" values="55" dur="1s" repeatCount="indefinite" /></circle>}
      {out === 1 && <circle r="3" fill={activeWire} style={{ filter: `drop-shadow(0 0 4px ${activeWire})` }}><animate attributeName="cx" from="95" to="128" dur="1s" repeatCount="indefinite" /><animate attributeName="cy" values="55" dur="1s" repeatCount="indefinite" /></circle>}
      {!single && <>
        <text x="6" y="37" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="JetBrains Mono,monospace">A</text>
        <text x="6" y="67" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="JetBrains Mono,monospace">B</text>
      </>}
      {single && <text x="6" y="52" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="JetBrains Mono,monospace">A</text>}
      <text x="127" y="52" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="JetBrains Mono,monospace">Y</text>
    </svg>
  );
}

function Toggle({ value, onChange, label }: { value: Bit; onChange: (v: Bit) => void; label: string }) {
  return (
    <motion.div className="flex flex-col items-center gap-2 md:gap-3">
      <span className="text-[10px] md:text-xs font-mono text-white/40 uppercase tracking-widest">{label}</span>
      <motion.button onClick={() => onChange(value === 0 ? 1 : 0)} whileTap={{ scale: 0.92 }} className={`toggle-switch ${value === 1 ? "on" : ""} cursor-pointer`}>
        <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className="toggle-thumb" />
      </motion.button>
      <motion.span key={value} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-mono text-lg md:text-xl font-bold" style={{ color: value === 1 ? "#34d399" : "rgba(255,255,255,0.3)" }}>{value}</motion.span>
    </motion.div>
  );
}

export default function GateLab() {
  const [selectedGate, setSelectedGate] = useState<GateType>("AND");
  const [inputA, setInputA] = useState<Bit>(0);
  const [inputB, setInputB] = useState<Bit>(0);
  const isSingle = selectedGate === "NOT";
  const output = computeGate(selectedGate, inputA, inputB);
  const truthTable = useMemo(() => getTruthTable(selectedGate), [selectedGate]);
  const explanation = getExplanation(selectedGate, inputA, inputB, output);
  const color = GATE_COLORS[selectedGate];
  const activeRow = isSingle ? inputA : inputA * 2 + inputB;

  return (
    <section id="gate-lab" className="relative py-16 md:py-24 px-3 md:px-6 grid-bg">
      <div className="max-w-[1400px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-8 md:mb-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3">
            <span className="text-white">Logic Gate </span>
            <span style={{ color: "#e8a849", textShadow: "0 0 30px rgba(232,168,73,0.3)" }}>Playground</span>
          </h2>
          <p className="text-white/40 text-sm md:text-lg max-w-2xl">Select a gate, toggle inputs, and watch signal flow animate in real-time.</p>
        </motion.div>

        {/* Gate selector */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-8">
          {(Object.keys(GATE_COLORS) as GateType[]).map((gate) => (
            <motion.button key={gate} onClick={() => { setSelectedGate(gate); setInputA(0); setInputB(0); }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-3 md:px-5 py-1.5 md:py-2 rounded-lg font-mono font-bold text-xs md:text-sm cursor-pointer"
              style={{ background: selectedGate === gate ? `${GATE_COLORS[gate]}18` : "rgba(255,255,255,0.04)", border: selectedGate === gate ? `1px solid ${GATE_COLORS[gate]}60` : "1px solid rgba(255,255,255,0.08)", color: selectedGate === gate ? GATE_COLORS[gate] : "rgba(255,255,255,0.4)", boxShadow: selectedGate === gate ? `0 0 20px ${GATE_COLORS[gate]}20` : "none" }}
            >{gate}</motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Gate viz */}
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="md:col-span-1 lg:col-span-5 glass-card p-4 md:p-6 flex flex-col gap-4 md:gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white/80 text-sm md:text-base">{selectedGate} Gate</h3>
              <motion.span key={selectedGate} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-mono text-sm px-3 py-1 rounded-full" style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}>Y = {output}</motion.span>
            </div>
            <div className="relative h-28 md:h-36 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div key={selectedGate} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} className="w-full h-full">
                  <GateSVG gate={selectedGate} a={inputA} b={inputB} out={output} color={color} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-center gap-8 md:gap-10">
              <Toggle value={inputA} onChange={setInputA} label="Input A" />
              {!isSingle && <Toggle value={inputB} onChange={setInputB} label="Input B" />}
            </div>
            <div className="flex justify-center">
              <div className="text-center">
                <span className="text-[10px] md:text-xs font-mono text-white/40 uppercase tracking-widest block mb-2">Output Y</span>
                <motion.div key={output} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 400 }} className={`state-box w-20 md:w-24 ${output === 1 ? "high" : "low"}`}>{output}</motion.div>
              </div>
            </div>
          </motion.div>

          {/* Truth table */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="md:col-span-1 lg:col-span-3 glass-card overflow-hidden">
            <div className="p-3 md:p-4 border-b border-white/5"><h3 className="font-bold text-white/80 text-sm">Truth Table</h3></div>
            <table className="truth-table w-full">
              <thead><tr><th>A</th>{!isSingle && <th>B</th>}<th style={{ color }}>Y</th></tr></thead>
              <tbody>
                {truthTable.map(([a, b, y], i) => (
                  <motion.tr key={i} className={activeRow === i ? "active" : ""} animate={activeRow === i ? { backgroundColor: `${color}0a` } : { backgroundColor: "rgba(0,0,0,0)" }}>
                    <td style={{ color: activeRow === i ? color : "rgba(255,255,255,0.5)" }}>{a}</td>
                    {!isSingle && <td style={{ color: activeRow === i ? color : "rgba(255,255,255,0.5)" }}>{b}</td>}
                    <td><span className="font-bold" style={{ color: y === 1 ? "#34d399" : "rgba(255,255,255,0.3)", textShadow: y === 1 ? "0 0 10px rgba(52,211,153,0.4)" : "none" }}>{y}</span></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Info panels */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="md:col-span-2 lg:col-span-4 flex flex-col gap-3 md:gap-4">
            <div className="smart-panel flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#e8a849", boxShadow: "0 0 8px #e8a849" }} />
                <span className="text-[10px] md:text-xs font-mono text-[#e8a849] uppercase tracking-widest">Smart Insight</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p key={`${selectedGate}-${inputA}-${inputB}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-xs md:text-sm text-white/70 leading-relaxed">{explanation}</motion.p>
              </AnimatePresence>
            </div>
            <div className="glass-card p-3 md:p-4" style={{ borderColor: `${color}18` }}>
              <h4 className="font-bold mb-1 text-xs md:text-sm" style={{ color }}>About {selectedGate}</h4>
              <p className="text-[11px] md:text-xs text-white/50 leading-relaxed">{GATE_DESCRIPTIONS[selectedGate]}</p>
            </div>
            <div className="glass-card p-3 md:p-4 text-center" style={{ borderColor: `${color}18` }}>
              <div className="text-[10px] md:text-xs text-white/40 mb-2 font-mono uppercase tracking-widest">Boolean Expression</div>
              <div className="font-mono text-base md:text-lg font-bold" style={{ color }}>
                {selectedGate === "AND" && "Y = A · B"}{selectedGate === "OR" && "Y = A + B"}{selectedGate === "NOT" && "Y = Ā"}
                {selectedGate === "NAND" && "Y = ¬(A · B)"}{selectedGate === "NOR" && "Y = ¬(A + B)"}
                {selectedGate === "XOR" && "Y = A ⊕ B"}{selectedGate === "XNOR" && "Y = ¬(A ⊕ B)"}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
