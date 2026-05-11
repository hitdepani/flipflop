"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Cpu, Info, Layers3, Lightbulb, RadioTower, Sparkles, Waves } from "lucide-react";
import { useMemo, useState } from "react";

type GateType = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR" | "XNOR";
type Bit = 0 | 1;

const GATES: Record<GateType, { color: string; expression: string; description: string }> = {
  AND: { color: "#22d3ee", expression: "Y = A * B", description: "Output is high only when every input is high." },
  OR: { color: "#41f29a", expression: "Y = A + B", description: "Output is high when at least one input is high." },
  NOT: { color: "#fb7185", expression: "Y = NOT A", description: "Output is the inverted value of the input." },
  NAND: { color: "#75a7ff", expression: "Y = NOT(A * B)", description: "Universal gate. Output is low only when all inputs are high." },
  NOR: { color: "#f6b84b", expression: "Y = NOT(A + B)", description: "Universal gate. Output is high only when all inputs are low." },
  XOR: { color: "#a78bfa", expression: "Y = A XOR B", description: "Output is high when the inputs differ." },
  XNOR: { color: "#f0abfc", expression: "Y = NOT(A XOR B)", description: "Output is high when the inputs match." },
};

function computeGate(gate: GateType, a: Bit, b: Bit): Bit {
  switch (gate) {
    case "AND":
      return (a & b) as Bit;
    case "OR":
      return (a | b) as Bit;
    case "NOT":
      return (a === 0 ? 1 : 0) as Bit;
    case "NAND":
      return ((a & b) === 1 ? 0 : 1) as Bit;
    case "NOR":
      return ((a | b) === 0 ? 1 : 0) as Bit;
    case "XOR":
      return (a ^ b) as Bit;
    case "XNOR":
      return ((a ^ b) === 0 ? 1 : 0) as Bit;
  }
}

function truthTable(gate: GateType): Array<[Bit, Bit, Bit]> {
  if (gate === "NOT") return [[0, 0, computeGate(gate, 0, 0)], [1, 0, computeGate(gate, 1, 0)]];
  return [
    [0, 0, computeGate(gate, 0, 0)],
    [0, 1, computeGate(gate, 0, 1)],
    [1, 0, computeGate(gate, 1, 0)],
    [1, 1, computeGate(gate, 1, 1)],
  ];
}

function explanation(gate: GateType, a: Bit, b: Bit, output: Bit) {
  if (gate === "NOT") return `A is ${a}, so the inverter drives Y to ${output}.`;
  if (gate === "AND") return output ? "Both inputs are high, so the AND channel opens." : "At least one input is low, so AND blocks the output.";
  if (gate === "OR") return output ? "A high input is present, so OR raises the output." : "Both inputs are low, so OR remains low.";
  if (gate === "NAND") return output ? "The AND condition is not fully true, so NAND stays high." : "Both inputs are high, so NAND inverts the result to low.";
  if (gate === "NOR") return output ? "No high input is present, so NOR outputs high." : "At least one high input is present, so NOR drops low.";
  if (gate === "XOR") return output ? `Inputs differ (${a}, ${b}), so XOR fires.` : "Inputs match, so XOR stays low.";
  return output ? "Inputs match, so XNOR outputs high." : `Inputs differ (${a}, ${b}), so XNOR drops low.`;
}

function GateShape({ gate, color, a, b, output }: { gate: GateType; color: string; a: Bit; b: Bit; output: Bit }) {
  const active = "#41f29a";
  const quiet = "rgba(226,232,240,0.2)";
  const single = gate === "NOT";
  const shape = {
    AND: "M120 76 L182 76 C232 76 232 164 182 164 L120 164 Z",
    OR: "M116 76 C152 98 152 142 116 164 C168 154 210 138 236 120 C210 102 168 86 116 76 Z",
    NOT: "M128 78 L128 162 L214 120 Z",
    NAND: "M120 76 L178 76 C224 76 224 164 178 164 L120 164 Z",
    NOR: "M116 76 C152 98 152 142 116 164 C166 154 206 138 230 120 C206 102 166 86 116 76 Z",
    XOR: "M116 76 C152 98 152 142 116 164 C168 154 210 138 236 120 C210 102 168 86 116 76 Z",
    XNOR: "M116 76 C152 98 152 142 116 164 C166 154 206 138 230 120 C206 102 166 86 116 76 Z",
  }[gate];
  const outStart = ["NOT", "NAND", "NOR", "XNOR"].includes(gate) ? 236 : 236;

  return (
    <svg viewBox="0 0 360 240" className="h-full w-full">
      <defs>
        <filter id="gateGlow">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={shape} fill="rgba(15,23,42,0.76)" stroke={color} strokeWidth="3" filter="url(#gateGlow)" />
      {(gate === "NAND" || gate === "NOR" || gate === "XNOR" || gate === "NOT") && <circle cx="232" cy="120" r="10" fill="rgba(2,4,10,0.9)" stroke={color} strokeWidth="3" />}
      {(gate === "XOR" || gate === "XNOR") && <path d="M98 76 C134 98 134 142 98 164" fill="none" stroke={color} strokeWidth="3" opacity="0.85" />}
      {!single && (
        <>
          <path d="M34 94 H120" stroke={a ? active : quiet} strokeWidth="4" strokeLinecap="round" className={a ? "wire-flow" : ""} />
          <path d="M34 146 H120" stroke={b ? active : quiet} strokeWidth="4" strokeLinecap="round" className={b ? "wire-flow" : ""} />
          <text x="24" y="90" fill="rgba(226,232,240,0.5)" fontFamily="JetBrains Mono" fontSize="13" fontWeight="700">A</text>
          <text x="24" y="142" fill="rgba(226,232,240,0.5)" fontFamily="JetBrains Mono" fontSize="13" fontWeight="700">B</text>
        </>
      )}
      {single && (
        <>
          <path d="M34 120 H128" stroke={a ? active : quiet} strokeWidth="4" strokeLinecap="round" className={a ? "wire-flow" : ""} />
          <text x="24" y="116" fill="rgba(226,232,240,0.5)" fontFamily="JetBrains Mono" fontSize="13" fontWeight="700">A</text>
        </>
      )}
      <path d={`M${outStart} 120 H326`} stroke={output ? active : quiet} strokeWidth="4" strokeLinecap="round" className={output ? "wire-flow" : ""} />
      <text x="331" y="116" fill="rgba(226,232,240,0.5)" fontFamily="JetBrains Mono" fontSize="13" fontWeight="700">Y</text>
      {[a, single ? null : b, output].map((value, index) =>
        value === 1 ? (
          <motion.circle
            key={`${index}-${value}`}
            cx={index === 2 ? 304 : 62}
            cy={index === 0 ? (single ? 120 : 94) : index === 1 ? 146 : 120}
            r="5"
            fill={active}
            initial={{ scale: 0.4, opacity: 0.2 }}
            animate={{ scale: [0.6, 1.3, 0.6], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        ) : null,
      )}
    </svg>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: Bit; onChange: (value: Bit) => void }) {
  return (
    <button className="glass-panel-soft flex items-center justify-between gap-5 p-3 text-left" onClick={() => onChange(value ? 0 : 1)}>
      <span>
        <span className="block font-mono text-xs font-bold uppercase tracking-widest text-white/38">{label}</span>
        <span className={`mt-1 block font-mono text-2xl font-black ${value ? "signal-high" : "signal-low"}`}>{value}</span>
      </span>
      <span className={`toggle-track ${value ? "on" : ""}`}>
        <motion.span layout className="toggle-thumb" />
      </span>
    </button>
  );
}

export default function GateLab() {
  const [gate, setGate] = useState<GateType>("XOR");
  const [a, setA] = useState<Bit>(1);
  const [b, setB] = useState<Bit>(0);
  const meta = GATES[gate];
  const output = computeGate(gate, a, b);
  const rows = useMemo(() => truthTable(gate), [gate]);
  const activeIndex = gate === "NOT" ? a : a * 2 + b;

  return (
    <section className="page-shell page-transition">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="eyebrow mb-4">
            <Cpu className="h-3.5 w-3.5 text-cyan-200" />
            Logic Gates Playground
          </div>
          <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl">Signal behavior you can see, not memorize.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">
            Toggle inputs, change gate families, and watch truth tables, wiring, expressions, and explanations update together.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="mono-chip"><RadioTower className="h-3.5 w-3.5" /> live signal</span>
          <span className="mono-chip"><Waves className="h-3.5 w-3.5" /> waveform</span>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {(Object.keys(GATES) as GateType[]).map((item) => (
          <button
            key={item}
            onClick={() => {
              setGate(item);
              setA(item === "XOR" ? 1 : 0);
              setB(0);
            }}
            className={`rounded-xl border px-3.5 py-2.5 font-mono text-xs font-black transition ${
              gate === item ? "border-cyan-300/34 bg-cyan-300/12 text-white" : "border-white/10 bg-white/[0.035] text-white/44 hover:text-white"
            }`}
            style={{ boxShadow: gate === item ? `0 0 28px ${GATES[item].color}22` : undefined }}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="lab-grid">
        <div className="premium-card min-h-[460px] p-4 md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-xs font-black uppercase tracking-widest text-white/36">active diagram</div>
              <h2 className="mt-1 text-xl font-black text-white">{gate} Gate</h2>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-center">
              <div className="font-mono text-xs font-bold text-white/36">OUTPUT Y</div>
              <AnimatePresence mode="wait">
                <motion.div key={output} initial={{ y: 10, opacity: 0, scale: 0.8 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -10, opacity: 0 }} className={`font-mono text-3xl font-black ${output ? "signal-high" : "signal-low"}`}>
                  {output}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <div className="canvas-grid relative h-[260px] overflow-hidden rounded-2xl border border-white/10 md:h-[300px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_32rem)]" />
            <GateShape gate={gate} color={meta.color} a={a} b={b} output={output} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Toggle label="Input A" value={a} onChange={setA} />
            {gate !== "NOT" && <Toggle label="Input B" value={b} onChange={setB} />}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="premium-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/8 p-4">
              <h3 className="font-black text-white">Truth Table</h3>
              <span className="mono-chip" style={{ color: meta.color }}>{meta.expression}</span>
            </div>
            <table className="truth-table">
              <thead>
                <tr>
                  <th>A</th>
                  {gate !== "NOT" && <th>B</th>}
                  <th>Y</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([ra, rb, ry], index) => (
                  <motion.tr key={`${ra}-${rb}-${ry}`} className={index === activeIndex ? "active" : ""} animate={index === activeIndex ? { scale: 1.015 } : { scale: 1 }}>
                    <td>{ra}</td>
                    {gate !== "NOT" && <td>{rb}</td>}
                    <td className={ry ? "signal-high" : "signal-low"}>{ry}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-panel p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
              <Sparkles className="h-4 w-4 text-amber-200" />
              Smart insight
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={`${gate}-${a}-${b}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-sm leading-7 text-white/58">
                {explanation(gate, a, b, output)}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-panel p-5">
              <Info className="mb-4 h-5 w-5" style={{ color: meta.color }} />
              <h3 className="font-black text-white">Definition</h3>
              <p className="mt-2 text-sm leading-6 text-white/52">{meta.description}</p>
            </div>
            <div className="glass-panel p-5">
              <Lightbulb className="mb-4 h-5 w-5 text-amber-200" />
              <h3 className="font-black text-white">Pattern</h3>
              <p className="mt-2 text-sm leading-6 text-white/52">
                Use the highlighted row to connect symbolic Boolean notation to physical signal propagation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {["Input switches use spring motion", "Output glow follows active high", "Truth row locks to current state"].map((item) => (
          <div key={item} className="glass-panel-soft p-4">
            <Layers3 className="mb-3 h-4 w-4 text-cyan-200" />
            <div className="text-sm font-bold text-white">{item}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
