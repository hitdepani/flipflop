"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FFType = "SR" | "JK" | "D" | "T";
type Bit = 0 | 1;
type State = 0 | 1 | "X";

interface FFState {
  Q: State;
  Qbar: State;
}

function computeFF(type: FFType, inputs: Record<string, Bit>, prevQ: Bit): FFState {
  switch (type) {
    case "SR": {
      const { S, R } = inputs;
      if (S === 1 && R === 1) return { Q: "X", Qbar: "X" };
      if (S === 1 && R === 0) return { Q: 1, Qbar: 0 };
      if (S === 0 && R === 1) return { Q: 0, Qbar: 1 };
      return { Q: prevQ, Qbar: (1 - prevQ) as Bit };
    }
    case "JK": {
      const { J, K } = inputs;
      if (J === 0 && K === 0) return { Q: prevQ, Qbar: (1 - prevQ) as Bit };
      if (J === 0 && K === 1) return { Q: 0, Qbar: 1 };
      if (J === 1 && K === 0) return { Q: 1, Qbar: 0 };
      // J=1, K=1: Toggle
      return { Q: (1 - prevQ) as Bit, Qbar: prevQ };
    }
    case "D": {
      const { D } = inputs;
      return { Q: D, Qbar: (1 - D) as Bit };
    }
    case "T": {
      const { T } = inputs;
      if (T === 0) return { Q: prevQ, Qbar: (1 - prevQ) as Bit };
      return { Q: (1 - prevQ) as Bit, Qbar: prevQ };
    }
  }
}

function getFFExplanation(type: FFType, inputs: Record<string, Bit>, Q: State, prevQ: Bit, clockTick: number): string {
  if (clockTick === 0) return `Set your inputs and press ▶ Clock Pulse to see the flip-flop respond on the rising edge.`;
  switch (type) {
    case "SR": {
      const { S, R } = inputs;
      if (S === 1 && R === 1) return "⚠️ INVALID STATE! When S=1 and R=1, the output is indeterminate. This is a forbidden state in SR flip-flops and should be avoided in real circuits!";
      if (S === 1 && R === 0) return `SET condition: S=1, R=0 on the rising clock edge → Q was ${prevQ}, now Q=1. The flip-flop has been SET HIGH.`;
      if (S === 0 && R === 1) return `RESET condition: S=0, R=1 on the rising clock edge → Q was ${prevQ}, now Q=0. The flip-flop has been RESET LOW.`;
      return `HOLD condition: S=0, R=0 → No change on clock edge. Q remains ${prevQ}. The flip-flop retains its memory.`;
    }
    case "JK": {
      const { J, K } = inputs;
      if (J === 0 && K === 0) return `HOLD: J=0, K=0 → Q retains its value of ${Q}. No change on rising edge.`;
      if (J === 0 && K === 1) return `RESET: J=0, K=1 → Q was ${prevQ}, now Q=0. JK flip-flop cleared.`;
      if (J === 1 && K === 0) return `SET: J=1, K=0 → Q was ${prevQ}, now Q=1. JK flip-flop set HIGH.`;
      return `TOGGLE: J=1, K=1 → Q was ${prevQ}, now Q=${Q}. The JK flip-flop toggles — this is the key advantage over SR!`;
    }
    case "D": {
      return `DATA latch: D=${inputs.D} → On rising clock edge, Q follows D exactly. Q was ${prevQ}, now Q=${Q}. D flip-flop samples and holds the data input.`;
    }
    case "T": {
      const { T } = inputs;
      if (T === 0) return `HOLD: T=0 → No toggle on clock edge. Q remains ${prevQ}.`;
      return `TOGGLE: T=1 → Q was ${prevQ}, now Q=${Q}. The T flip-flop flips its state on every enabled clock edge.`;
    }
  }
}

const FF_COLORS: Record<FFType, string> = {
  SR: "#e8a849",
  JK: "#60a5fa",
  D: "#34d399",
  T: "#f472b6",
};

const FF_INPUTS: Record<FFType, string[]> = {
  SR: ["S", "R"],
  JK: ["J", "K"],
  D: ["D"],
  T: ["T"],
};

const FF_DESCRIPTIONS: Record<FFType, string> = {
  SR: "Set-Reset Latch. The fundamental memory element. S=1 sets output HIGH, R=1 resets it LOW. S=R=1 is forbidden!",
  JK: "Extended SR. J=Set, K=Reset, J=K=1 causes toggle. Resolves the SR forbidden state — the most versatile flip-flop.",
  D: "Data/Delay flip-flop. Output Q follows input D on each clock edge. Used in registers and data pipelines.",
  T: "Toggle flip-flop. T=1 toggles output on clock edge. T=0 holds. Used in binary counters.",
};

function ClockPulseViz({ tick, isRunning, speed }: { tick: number; isRunning: boolean; speed: number }) {
  const cycles = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-white/40 uppercase tracking-widest">Clock (CLK)</span>
        <div className="flex items-center gap-2">
          {isRunning && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: speed / 1000, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-[#e8a849]"
              style={{ boxShadow: "0 0 8px #e8a849" }}
            />
          )}
          <span className="text-xs font-mono" style={{ color: "#e8a849" }}>
            Tick #{tick}
          </span>
        </div>
      </div>
      <div className="relative h-10 flex items-center">
        <svg viewBox="0 0 320 40" className="w-full h-full" preserveAspectRatio="none">
          {cycles.map((i) => {
            const isActive = tick > i;
            const x = i * 40;
            return (
              <g key={i}>
                <line x1={x} y1="32" x2={x + 20} y2="32"
                  stroke={isActive ? "#e8a849" : "rgba(255,255,255,0.1)"}
                  strokeWidth="2"
                  style={isActive ? { filter: "drop-shadow(0 0 3px #e8a849)" } : {}} />
                <line x1={x + 20} y1="32" x2={x + 20} y2="8"
                  stroke={isActive ? "#e8a849" : "rgba(255,255,255,0.1)"}
                  strokeWidth="2"
                  style={isActive ? { filter: "drop-shadow(0 0 3px #e8a849)" } : {}} />
                <line x1={x + 20} y1="8" x2={x + 40} y2="8"
                  stroke={isActive ? "#e8a849" : "rgba(255,255,255,0.1)"}
                  strokeWidth="2"
                  style={isActive ? { filter: "drop-shadow(0 0 3px #e8a849)" } : {}} />
              </g>
            );
          })}
          {isRunning && (
            <motion.line
              x1={(tick % 8) * 40 + 20} y1="0"
              x2={(tick % 8) * 40 + 20} y2="40"
              stroke="rgba(232,168,73,0.4)"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

function StateHistory({ history, color }: { history: State[]; color: string }) {
  const visible = history.slice(-12);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((s, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-7 h-7 rounded flex items-center justify-center font-mono text-xs font-bold"
          style={{
            background: s === "X" ? "rgba(244,114,182,0.12)" : s === 1 ? `${color}18` : "rgba(255,255,255,0.05)",
            border: `1px solid ${s === "X" ? "rgba(244,114,182,0.4)" : s === 1 ? `${color}40` : "rgba(255,255,255,0.1)"}`,
            color: s === "X" ? "#f472b6" : s === 1 ? color : "rgba(255,255,255,0.3)",
          }}
        >
          {s === "X" ? "?" : String(s)}
        </motion.div>
      ))}
    </div>
  );
}

export default function FlipFlopLab() {
  const [ffType, setFFType] = useState<FFType>("SR");
  const [inputs, setInputs] = useState<Record<string, Bit>>({ S: 0, R: 0 });
  const [currentState, setCurrentState] = useState<FFState>({ Q: 0, Qbar: 1 });
  const [prevQ, setPrevQ] = useState<Bit>(0);
  const [clockTick, setClockTick] = useState(0);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [speed, setSpeed] = useState(1200);
  const [qHistory, setQHistory] = useState<State[]>([0]);
  const [isInvalid, setIsInvalid] = useState(false);

  const color = FF_COLORS[ffType];

  const handleClockPulse = useCallback(() => {
    const pQ = currentState.Q === "X" ? 0 : currentState.Q as Bit;
    const newState = computeFF(ffType, inputs, pQ);
    const invalid = newState.Q === "X";
    setIsInvalid(invalid);
    setPrevQ(pQ);
    setCurrentState(newState);
    setClockTick((t) => t + 1);
    setQHistory((h) => [...h.slice(-19), newState.Q]);
  }, [currentState, ffType, inputs]);

  useEffect(() => {
    if (!isAutoRunning) return;
    const id = setInterval(handleClockPulse, speed);
    return () => clearInterval(id);
  }, [isAutoRunning, handleClockPulse, speed]);

  const switchFFType = (type: FFType) => {
    setFFType(type);
    setIsAutoRunning(false);
    setClockTick(0);
    setCurrentState({ Q: 0, Qbar: 1 });
    setPrevQ(0);
    setQHistory([0]);
    setIsInvalid(false);
    const defaultInputs: Record<FFType, Record<string, Bit>> = {
      SR: { S: 0, R: 0 },
      JK: { J: 0, K: 0 },
      D: { D: 0 },
      T: { T: 0 },
    };
    setInputs(defaultInputs[type]);
  };

  const toggleInput = (key: string) => {
    setInputs((prev) => ({ ...prev, [key]: (1 - (prev[key] ?? 0)) as Bit }));
  };

  const explanation = getFFExplanation(ffType, inputs, currentState.Q, prevQ, clockTick);

  return (
    <section id="flipflop" className="relative py-16 md:py-24 px-3 md:px-6" style={{ background: "linear-gradient(180deg, #0f1419 0%, #111820 50%, #0f1419 100%)" }}>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3">
            <span className="text-white">Flip-Flop </span>
            <span style={{ color: "#34d399", textShadow: "0 0 30px rgba(52,211,153,0.3)" }}>Visualizer</span>
          </h2>
          <p className="text-white/40 text-sm md:text-lg max-w-2xl">
            Simulate SR, JK, D, and T flip-flops with real clock pulses and state history.
          </p>
        </motion.div>

        {/* Type selector */}
        <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-8">
          {(["SR", "JK", "D", "T"] as FFType[]).map((type) => (
            <motion.button
              key={type}
              onClick={() => switchFFType(type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-mono font-bold text-xs md:text-sm cursor-pointer"
              style={{
                background: ffType === type ? `${FF_COLORS[type]}18` : "rgba(255,255,255,0.04)",
                border: ffType === type ? `1px solid ${FF_COLORS[type]}60` : "1px solid rgba(255,255,255,0.08)",
                color: ffType === type ? FF_COLORS[type] : "rgba(255,255,255,0.4)",
                boxShadow: ffType === type ? `0 0 20px ${FF_COLORS[type]}18` : "none",
              }}
            >
              {type} Flip-Flop
            </motion.button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
          {/* Left: State display + inputs */}
          <div className="lg:col-span-5 flex flex-col gap-3 md:gap-4">
            {/* Q/Q' State */}
            <motion.div
              className="glass-card p-6"
              animate={isInvalid ? { borderColor: "rgba(244,114,182,0.4)" } : { borderColor: "rgba(255,255,255,0.06)" }}
            >
              <h3 className="font-bold text-white/70 text-sm mb-4">Current State</h3>
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="text-xs font-mono text-white/40 mb-3 uppercase tracking-widest">Q</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`Q-${String(currentState.Q)}`}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`state-box w-24 ${currentState.Q === "X" ? "undefined" : currentState.Q === 1 ? "high" : "low"}`}
                    >
                      {currentState.Q === "X" ? "?" : currentState.Q}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="text-white/20 text-3xl font-thin">|</div>

                <div className="text-center">
                  <div className="text-xs font-mono text-white/40 mb-3 uppercase tracking-widest">Q&apos;</div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`Qbar-${String(currentState.Qbar)}`}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`state-box w-24 ${currentState.Qbar === "X" ? "undefined" : currentState.Qbar === 1 ? "high" : "low"}`}
                    >
                      {currentState.Qbar === "X" ? "?" : currentState.Qbar}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Invalid state warning */}
              <AnimatePresence>
                {isInvalid && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ background: "rgba(244,114,182,0.08)", border: "1px solid rgba(244,114,182,0.3)", color: "#f472b6" }}
                  >
                    ⚠️ INVALID STATE — Output is indeterminate!
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Inputs */}
            <div className="glass-card p-5">
              <h3 className="font-bold text-white/70 text-sm mb-4">Inputs</h3>
              <div className="flex gap-6 justify-center">
                {FF_INPUTS[ffType].map((key) => (
                  <div key={key} className="flex flex-col items-center gap-3">
                    <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{key}</span>
                    <motion.button
                      onClick={() => toggleInput(key)}
                      whileTap={{ scale: 0.92 }}
                      className={`toggle-switch ${inputs[key] === 1 ? "on" : ""} cursor-pointer`}
                    >
                      <motion.div
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="toggle-thumb"
                      />
                    </motion.button>
                    <motion.span
                      key={inputs[key]}
                      initial={{ scale: 1.5 }}
                      animate={{ scale: 1 }}
                      className="font-mono text-lg font-bold"
                      style={{ color: inputs[key] === 1 ? "#34d399" : "rgba(255,255,255,0.3)" }}
                    >
                      {inputs[key]}
                    </motion.span>
                  </div>
                ))}
              </div>
            </div>

            {/* Characteristic table */}
            <div className="glass-card overflow-hidden">
              <div className="p-3 border-b border-white/5">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Characteristic Table</span>
              </div>
              <table className="truth-table w-full text-xs">
                <thead>
                  <tr>
                    {FF_INPUTS[ffType].map((k) => <th key={k}>{k}</th>)}
                    <th>Qn</th>
                    <th style={{ color }}>Q(n+1)</th>
                  </tr>
                </thead>
                <tbody>
                  {ffType === "SR" && (
                    <>
                      <tr><td>0</td><td>0</td><td>Q</td><td style={{color:"rgba(255,255,255,0.5)"}}>No change</td></tr>
                      <tr><td>0</td><td>1</td><td>×</td><td style={{color:"#34d399",textShadow:"0 0 6px rgba(52,211,153,0.4)"}}>0</td></tr>
                      <tr><td>1</td><td>0</td><td>×</td><td style={{color:"#34d399",textShadow:"0 0 6px rgba(52,211,153,0.4)"}}>1</td></tr>
                      <tr><td style={{color:"#f472b6"}}>1</td><td style={{color:"#f472b6"}}>1</td><td>×</td><td style={{color:"#f472b6"}}>?</td></tr>
                    </>
                  )}
                  {ffType === "JK" && (
                    <>
                      <tr><td>0</td><td>0</td><td>Q</td><td style={{color:"rgba(255,255,255,0.5)"}}>Q (hold)</td></tr>
                      <tr><td>0</td><td>1</td><td>×</td><td style={{color:"#34d399",textShadow:"0 0 6px rgba(52,211,153,0.4)"}}>0</td></tr>
                      <tr><td>1</td><td>0</td><td>×</td><td style={{color:"#34d399",textShadow:"0 0 6px rgba(52,211,153,0.4)"}}>1</td></tr>
                      <tr><td style={{color:"#60a5fa"}}>1</td><td style={{color:"#60a5fa"}}>1</td><td>×</td><td style={{color:"#60a5fa"}}>Q̄</td></tr>
                    </>
                  )}
                  {ffType === "D" && (
                    <>
                      <tr><td>0</td><td>×</td><td style={{color:"#34d399",textShadow:"0 0 6px rgba(52,211,153,0.4)"}}>0</td></tr>
                      <tr><td>1</td><td>×</td><td style={{color:"#34d399",textShadow:"0 0 6px rgba(52,211,153,0.4)"}}>1</td></tr>
                    </>
                  )}
                  {ffType === "T" && (
                    <>
                      <tr><td>0</td><td>Q</td><td style={{color:"rgba(255,255,255,0.5)"}}>Q (hold)</td></tr>
                      <tr><td>1</td><td>Q</td><td style={{color:"#f472b6",textShadow:"0 0 6px rgba(244,114,182,0.4)"}}>Q̄ (toggle)</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Clock + history + explanation */}
          <div className="lg:col-span-7 flex flex-col gap-3 md:gap-4">
            {/* Clock controls */}
            <div className="glass-card p-5">
              <ClockPulseViz tick={clockTick} isRunning={isAutoRunning} speed={speed} />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={handleClockPulse}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="neon-btn neon-btn-amber flex items-center gap-2 cursor-pointer"
                >
                  <span>▶</span> Clock Pulse
                </motion.button>

                <motion.button
                  onClick={() => setIsAutoRunning((r) => !r)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className={`neon-btn cursor-pointer ${isAutoRunning ? "neon-btn-emerald" : "neon-btn-sky"}`}
                >
                  {isAutoRunning ? "⏸ Pause" : "⏩ Auto Run"}
                </motion.button>

                <motion.button
                  onClick={() => {
                    setIsAutoRunning(false);
                    setClockTick(0);
                    setCurrentState({ Q: 0, Qbar: 1 });
                    setPrevQ(0);
                    setQHistory([0]);
                    setIsInvalid(false);
                  }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="neon-btn cursor-pointer text-white/40 border border-white/10 hover:border-white/20"
                >
                  ↺ Reset
                </motion.button>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-white/40">Speed:</span>
                  {[2000, 1200, 600].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className="text-xs px-2 py-1 rounded cursor-pointer"
                      style={{
                        background: speed === s ? `${color}18` : "rgba(255,255,255,0.05)",
                        border: speed === s ? `1px solid ${color}40` : "1px solid transparent",
                        color: speed === s ? color : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {s === 2000 ? "Slow" : s === 1200 ? "Normal" : "Fast"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Q history waveform */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white/70 text-sm">Q Output History</h3>
                <span className="text-xs font-mono text-white/30">{qHistory.length} ticks</span>
              </div>

              <div className="relative h-12 mb-3">
                <svg viewBox={`0 0 ${Math.max(qHistory.length - 1, 1) * 24} 48`} className="w-full h-full" preserveAspectRatio="none">
                  {qHistory.map((state, i) => {
                    if (i === qHistory.length - 1) return null;
                    const x = i * 24;
                    const y1 = state === 1 ? 8 : 36;
                    const y2 = qHistory[i + 1] === 1 ? 8 : 36;
                    const x2 = (i + 1) * 24;
                    const stateColor = state === "X" ? "#f472b6" : state === 1 ? "#34d399" : "rgba(255,255,255,0.25)";
                    return (
                      <g key={i}>
                        <line x1={x} y1={y1} x2={x2} y2={y1} stroke={stateColor} strokeWidth="2"
                          style={state === 1 ? { filter: "drop-shadow(0 0 3px #34d399)" } : {}} />
                        {y1 !== y2 && <line x1={x2} y1={y1} x2={x2} y2={y2} stroke={stateColor} strokeWidth="2" />}
                      </g>
                    );
                  })}
                </svg>
              </div>

              <StateHistory history={qHistory} color={color} />
            </div>

            {/* Smart explanation */}
            <div className="smart-panel flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#e8a849", boxShadow: "0 0 8px #e8a849" }} />
                <span className="text-xs font-mono text-[#e8a849] uppercase tracking-widest">Smart Insight</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${ffType}-${Object.values(inputs).join("")}-${clockTick}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm text-white/70 leading-relaxed"
                >
                  {explanation}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* FF description */}
            <div className="glass-card p-4" style={{ borderColor: `${color}18` }}>
              <h4 className="font-bold mb-1 text-sm" style={{ color }}>{ffType} Flip-Flop</h4>
              <p className="text-xs text-white/50 leading-relaxed">{FF_DESCRIPTIONS[ffType]}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
