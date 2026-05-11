"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, Gauge, GitBranch, History, Pause, Play, RotateCcw, Sparkles, TimerReset } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type FFType = "SR" | "JK" | "D" | "T";
type Bit = 0 | 1;
type State = Bit | "X";

const FF_META: Record<FFType, { color: string; inputs: string[]; description: string }> = {
  SR: { color: "#f6b84b", inputs: ["S", "R"], description: "Set-reset storage with a forbidden S=1, R=1 condition." },
  JK: { color: "#75a7ff", inputs: ["J", "K"], description: "Universal flip-flop. J=K=1 toggles the stored state." },
  D: { color: "#41f29a", inputs: ["D"], description: "Data flip-flop. Q samples D on each rising clock edge." },
  T: { color: "#fb7185", inputs: ["T"], description: "Toggle flip-flop. T=1 flips Q on every clock pulse." },
};

function nextState(type: FFType, inputs: Record<string, Bit>, prevQ: Bit): { q: State; qbar: State } {
  if (type === "SR") {
    if (inputs.S === 1 && inputs.R === 1) return { q: "X", qbar: "X" };
    if (inputs.S === 1) return { q: 1, qbar: 0 };
    if (inputs.R === 1) return { q: 0, qbar: 1 };
    return { q: prevQ, qbar: (1 - prevQ) as Bit };
  }
  if (type === "JK") {
    if (inputs.J === 1 && inputs.K === 1) return { q: (1 - prevQ) as Bit, qbar: prevQ };
    if (inputs.J === 1) return { q: 1, qbar: 0 };
    if (inputs.K === 1) return { q: 0, qbar: 1 };
    return { q: prevQ, qbar: (1 - prevQ) as Bit };
  }
  if (type === "D") return { q: inputs.D ?? 0, qbar: (1 - (inputs.D ?? 0)) as Bit };
  if (inputs.T === 1) return { q: (1 - prevQ) as Bit, qbar: prevQ };
  return { q: prevQ, qbar: (1 - prevQ) as Bit };
}

function defaultInputs(type: FFType): Record<string, Bit> {
  return type === "SR" ? { S: 0, R: 0 } : type === "JK" ? { J: 0, K: 0 } : type === "D" ? { D: 1 } : { T: 1 };
}

function explain(type: FFType, inputs: Record<string, Bit>, prevQ: Bit, q: State, ticks: number) {
  if (ticks === 0) return "Set inputs, then send a clock pulse. State changes are sampled on the rising edge.";
  if (type === "SR" && inputs.S === 1 && inputs.R === 1) return "Invalid SR condition. Both set and reset are asserted, so Q becomes indeterminate.";
  if (type === "JK" && inputs.J === 1 && inputs.K === 1) return `JK toggle mode. Q moved from ${prevQ} to ${q}.`;
  if (type === "D") return `D was ${inputs.D} on the rising edge, so Q sampled and held ${q}.`;
  if (type === "T") return inputs.T ? `T is enabled, so Q toggled from ${prevQ} to ${q}.` : `T is low, so Q held its previous value of ${q}.`;
  return `Clock edge captured inputs and moved Q from ${prevQ} to ${q}.`;
}

function Waveform({ history, color }: { history: State[]; color: string }) {
  const width = Math.max(360, history.length * 34);
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 p-2">
      <svg viewBox={`0 0 ${width} 118`} className="h-24 w-full" preserveAspectRatio="none">
        {Array.from({ length: Math.ceil(width / 34) }).map((_, i) => (
          <line key={i} x1={i * 34} x2={i * 34} y1="0" y2="118" stroke="rgba(148,163,184,0.08)" />
        ))}
        <text x="10" y="23" fill="rgba(226,232,240,0.35)" fontFamily="JetBrains Mono" fontSize="11">Q</text>
        {history.slice(0, -1).map((state, index) => {
          const next = history[index + 1];
          const x = 42 + index * 34;
          const y = state === 1 ? 26 : state === "X" ? 58 : 88;
          const nextY = next === 1 ? 26 : next === "X" ? 58 : 88;
          const stroke = state === "X" ? "#fb7185" : state === 1 ? color : "rgba(226,232,240,0.28)";
          return (
            <g key={index}>
              <path d={`M${x} ${y} H${x + 34}`} stroke={stroke} strokeWidth="3" strokeLinecap="round" filter={state === 1 ? `drop-shadow(0 0 6px ${color})` : undefined} />
              {y !== nextY && <path d={`M${x + 34} ${y} V${nextY}`} stroke={stroke} strokeWidth="3" strokeLinecap="round" />}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function FlipFlopLab() {
  const [type, setType] = useState<FFType>("JK");
  const [inputs, setInputs] = useState<Record<string, Bit>>(defaultInputs("JK"));
  const [state, setState] = useState<{ q: State; qbar: State }>({ q: 0, qbar: 1 });
  const [prevQ, setPrevQ] = useState<Bit>(0);
  const [ticks, setTicks] = useState(0);
  const [history, setHistory] = useState<State[]>([0]);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(900);
  const meta = FF_META[type];

  const pulse = useCallback(() => {
    const previous = state.q === "X" ? 0 : state.q;
    const next = nextState(type, inputs, previous);
    setPrevQ(previous);
    setState(next);
    setTicks((value) => value + 1);
    setHistory((value) => [...value.slice(-22), next.q]);
  }, [inputs, state.q, type]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(pulse, speed);
    return () => window.clearInterval(timer);
  }, [pulse, running, speed]);

  const reset = () => {
    setRunning(false);
    setState({ q: 0, qbar: 1 });
    setPrevQ(0);
    setTicks(0);
    setHistory([0]);
  };

  const tableRows = useMemo(() => {
    if (type === "SR") return [["0", "0", "Hold"], ["0", "1", "Reset"], ["1", "0", "Set"], ["1", "1", "Invalid"]];
    if (type === "JK") return [["0", "0", "Hold"], ["0", "1", "Reset"], ["1", "0", "Set"], ["1", "1", "Toggle"]];
    if (type === "D") return [["0", "Q=0"], ["1", "Q=1"]];
    return [["0", "Hold"], ["1", "Toggle"]];
  }, [type]);

  return (
    <section className="page-shell page-transition">
      <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="eyebrow mb-4">
            <GitBranch className="h-3.5 w-3.5 text-purple-200" />
            Flip-Flop Simulator
          </div>
          <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl">Clocked memory with visible edge behavior.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">
            Drive SR, JK, D, and T flip-flops with manual pulses or auto-run mode. Watch Q, Qbar, and the tick timeline respond.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="mono-chip"><TimerReset className="h-3.5 w-3.5" /> tick #{ticks}</span>
          <span className="mono-chip"><Gauge className="h-3.5 w-3.5" /> {speed}ms</span>
        </div>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {(Object.keys(FF_META) as FFType[]).map((item) => (
          <button
            key={item}
            onClick={() => {
              setType(item);
              setInputs(defaultInputs(item));
              reset();
            }}
            className={`rounded-xl border px-3.5 py-2.5 font-mono text-xs font-black transition ${
              type === item ? "border-purple-300/34 bg-purple-300/12 text-white" : "border-white/10 bg-white/[0.035] text-white/44 hover:text-white"
            }`}
          >
            {item} FF
          </button>
        ))}
      </div>

      <div className="lab-grid">
        <div className="premium-card p-4 md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-mono text-xs font-black uppercase tracking-widest text-white/36">hardware display</div>
              <h2 className="mt-1 text-xl font-black text-white">{type} Flip-Flop</h2>
            </div>
            <div className="flex gap-2">
              <button className="premium-button primary" onClick={pulse}>
                <Play className="h-4 w-4" />
                Pulse
              </button>
              <button className="premium-button" onClick={() => setRunning((value) => !value)}>
                {running ? <Pause className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                {running ? "Pause" : "Auto"}
              </button>
              <button className="icon-button" onClick={reset} aria-label="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="canvas-grid rounded-2xl border border-white/10 p-4">
            <div className="grid gap-4 md:grid-cols-[0.78fr_1.22fr]">
              <div className="grid gap-3">
                <div className="glass-panel-soft p-3">
                  <div className="mb-3 font-mono text-xs font-black uppercase tracking-widest text-white/36">inputs</div>
                  <div className="grid gap-3">
                    {meta.inputs.map((key) => (
                      <button
                        key={key}
                        onClick={() => setInputs((value) => ({ ...value, [key]: value[key] ? 0 : 1 }))}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-2.5"
                      >
                        <span className="font-mono text-lg font-black" style={{ color: meta.color }}>{key}</span>
                        <span className={`toggle-track ${inputs[key] ? "on" : ""}`}>
                          <motion.span layout className="toggle-thumb" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="glass-panel-soft p-3">
                  <div className="mb-2 font-mono text-xs font-black uppercase tracking-widest text-white/36">speed</div>
                  <input type="range" min="300" max="1800" step="100" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="w-full accent-cyan-300" />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#050812]/72 p-4">
                <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-200/10" />
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Q", state.q],
                    ["Qbar", state.qbar],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-center">
                      <div className="mb-3 font-mono text-xs font-black uppercase tracking-widest text-white/36">{label}</div>
                      <AnimatePresence mode="wait">
                        <motion.div key={`${label}-${value}`} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className={`font-mono text-5xl font-black md:text-6xl ${value === "X" ? "text-[#fb7185]" : value === 1 ? "signal-high" : "signal-low"}`}>
                          {value === "X" ? "?" : value}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="mb-3 flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-white/36">
                    <Activity className="h-3.5 w-3.5" />
                    clock bus
                  </div>
                  <svg viewBox="0 0 500 74" className="h-14 w-full" preserveAspectRatio="none">
                    {Array.from({ length: 10 }).map((_, index) => {
                      const x = index * 50;
                      const active = ticks > index || running;
                      return (
                        <path key={index} d={`M${x} 56 H${x + 25} V18 H${x + 50}`} fill="none" stroke={active ? meta.color : "rgba(226,232,240,0.16)"} strokeWidth="3" strokeLinejoin="round" filter={active ? `drop-shadow(0 0 5px ${meta.color})` : undefined} />
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="premium-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black text-white">Q Timeline</h3>
              <span className="mono-chip">{history.length} samples</span>
            </div>
            <Waveform history={history} color={meta.color} />
          </div>

          <div className="glass-panel p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
              <Sparkles className="h-4 w-4 text-amber-200" />
              Smart insight
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={`${type}-${Object.values(inputs).join("")}-${ticks}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="text-sm leading-7 text-white/58">
                {explain(type, inputs, prevQ, state.q, ticks)}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="premium-card overflow-hidden">
            <div className="border-b border-white/8 p-4">
              <h3 className="font-black text-white">Characteristic Table</h3>
              <p className="mt-1 text-sm text-white/42">{meta.description}</p>
            </div>
            <table className="truth-table">
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.join("-")}>
                    {row.map((cell) => <td key={cell}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-panel-soft p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <History className="h-4 w-4 text-cyan-200" />
              The timeline keeps the last 23 Q samples so transitions stay readable.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
