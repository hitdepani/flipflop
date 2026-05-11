"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  CircuitBoard,
  Copy,
  Cpu,
  Grid3X3,
  MousePointer2,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  Workflow,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Bit = 0 | 1;
type ComponentType = "INPUT" | "OUTPUT" | "CLOCK" | "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR" | "D-FF" | "JK-FF";

type Node = {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  value: Bit;
  label: string;
};

type Wire = {
  id: string;
  from: string;
  to: string;
};

const PALETTE: Array<{ type: ComponentType; label: string; group: string; color: string }> = [
  { type: "INPUT", label: "Input", group: "IO", color: "#41f29a" },
  { type: "OUTPUT", label: "Output", group: "IO", color: "#fb7185" },
  { type: "CLOCK", label: "Clock", group: "IO", color: "#f6b84b" },
  { type: "AND", label: "AND", group: "Gates", color: "#22d3ee" },
  { type: "OR", label: "OR", group: "Gates", color: "#41f29a" },
  { type: "NOT", label: "NOT", group: "Gates", color: "#fb7185" },
  { type: "NAND", label: "NAND", group: "Gates", color: "#75a7ff" },
  { type: "NOR", label: "NOR", group: "Gates", color: "#f6b84b" },
  { type: "XOR", label: "XOR", group: "Gates", color: "#a78bfa" },
  { type: "D-FF", label: "D Flip-Flop", group: "Memory", color: "#41f29a" },
  { type: "JK-FF", label: "JK Flip-Flop", group: "Memory", color: "#75a7ff" },
];

const NODE_W = 138;
const NODE_H = 76;
const snap = (value: number) => Math.round(value / 24) * 24;

function colorFor(type: ComponentType) {
  return PALETTE.find((item) => item.type === type)?.color ?? "#22d3ee";
}

function compute(type: ComponentType, inputs: Bit[], current: Bit): Bit {
  const a = inputs[0] ?? 0;
  const b = inputs[1] ?? 0;
  if (type === "INPUT" || type === "CLOCK") return current;
  if (type === "OUTPUT") return a;
  if (type === "AND") return (a & b) as Bit;
  if (type === "OR") return (a | b) as Bit;
  if (type === "NOT") return (1 - a) as Bit;
  if (type === "NAND") return ((a & b) ? 0 : 1) as Bit;
  if (type === "NOR") return ((a | b) ? 0 : 1) as Bit;
  if (type === "XOR") return (a ^ b) as Bit;
  if (type === "D-FF") return a;
  return a && b ? ((1 - current) as Bit) : a ? 1 : b ? 0 : current;
}

function seedNodes(): Node[] {
  return [
    { id: "n1", type: "INPUT", x: 72, y: 120, value: 1, label: "A" },
    { id: "n2", type: "INPUT", x: 72, y: 252, value: 0, label: "B" },
    { id: "n3", type: "XOR", x: 342, y: 186, value: 1, label: "XOR" },
    { id: "n4", type: "OUTPUT", x: 632, y: 186, value: 1, label: "Y" },
  ];
}

function seedWires(): Wire[] {
  return [
    { id: "w1", from: "n1", to: "n3" },
    { id: "w2", from: "n2", to: "n3" },
    { id: "w3", from: "n3", to: "n4" },
  ];
}

export default function CircuitBuilder() {
  const [nodes, setNodes] = useState<Node[]>(seedNodes);
  const [wires, setWires] = useState<Wire[]>(seedWires);
  const [selected, setSelected] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ id: string; dx: number; dy: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState("");
  const [running, setRunning] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [context, setContext] = useState<{ x: number; y: number; id: string } | null>(null);
  const [history, setHistory] = useState<Array<{ nodes: Node[]; wires: Wire[] }>>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const counter = useRef(10);

  const filteredPalette = PALETTE.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()) || item.type.toLowerCase().includes(search.toLowerCase()));

  const evaluate = useCallback((nextNodes: Node[], nextWires: Wire[]) => {
    let evaluated = nextNodes.map((node) => ({ ...node }));
    for (let pass = 0; pass < 5; pass += 1) {
      evaluated = evaluated.map((node) => {
        const incoming = nextWires.filter((wire) => wire.to === node.id).map((wire) => evaluated.find((candidate) => candidate.id === wire.from)?.value ?? 0);
        return { ...node, value: compute(node.type, incoming, node.value) };
      });
    }
    return evaluated;
  }, []);

  const commit = (nextNodes: Node[], nextWires: Wire[]) => {
    setHistory((value) => [...value.slice(-24), { nodes, wires }]);
    setNodes(evaluate(nextNodes, nextWires));
    setWires(nextWires);
  };

  const addNode = (type: ComponentType, x = 220 + Math.random() * 320, y = 120 + Math.random() * 220) => {
    const id = `n${counter.current++}`;
    const next: Node = { id, type, x: snap(x), y: snap(y), value: type === "INPUT" || type === "CLOCK" ? 1 : 0, label: type.replace("-FF", "") };
    commit([...nodes, next], wires);
    setSelected([id]);
  };

  const toggleNode = (id: string) => {
    const next: Node[] = nodes.map((node) =>
      node.id === id && (node.type === "INPUT" || node.type === "CLOCK")
        ? { ...node, value: (node.value ? 0 : 1) as Bit }
        : node,
    );
    commit(next, wires);
  };

  const deleteSelected = () => {
    if (!selected.length) return;
    const nextWires = wires.filter((wire) => !selected.includes(wire.from) && !selected.includes(wire.to));
    commit(nodes.filter((node) => !selected.includes(node.id)), nextWires);
    setSelected([]);
  };

  const duplicateSelected = () => {
    const copies = nodes
      .filter((node) => selected.includes(node.id))
      .map((node) => ({ ...node, id: `n${counter.current++}`, x: node.x + 48, y: node.y + 48, label: `${node.label} copy` }));
    if (!copies.length) return;
    commit([...nodes, ...copies], wires);
    setSelected(copies.map((copy) => copy.id));
  };

  const undo = () => {
    const last = history[history.length - 1];
    if (!last) return;
    setNodes(last.nodes);
    setWires(last.wires);
    setHistory((value) => value.slice(0, -1));
  };

  const clear = () => {
    commit([], []);
    setSelected([]);
  };

  const canvasPoint = (event: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (event.clientX - rect.left - pan.x) / zoom,
      y: (event.clientY - rect.top - pan.y) / zoom,
    };
  };

  const wirePaths = useMemo(() => {
    return wires
      .map((wire) => {
        const from = nodes.find((node) => node.id === wire.from);
        const to = nodes.find((node) => node.id === wire.to);
        if (!from || !to) return null;
        const x1 = from.x + NODE_W;
        const y1 = from.y + NODE_H / 2;
        const x2 = to.x;
        const y2 = to.y + NODE_H / 2;
        const mx = (x1 + x2) / 2;
        const active = from.value === 1;
        return { wire, d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`, active };
      })
      .filter(Boolean) as Array<{ wire: Wire; d: string; active: boolean }>;
  }, [nodes, wires]);

  return (
    <section className="page-shell page-transition">
      <div className="mb-4 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <div className="eyebrow mb-4">
            <CircuitBoard className="h-3.5 w-3.5 text-cyan-200" />
            Circuit Builder
          </div>
          <h1 className="max-w-4xl text-3xl font-black tracking-tight text-white md:text-5xl">A node canvas for building logic systems.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/54">
            Add components, wire outputs to inputs, multi-select nodes, pan the workspace, zoom the grid, and watch active signals glow.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="premium-button primary" onClick={() => setRunning((value) => !value)}>
            <Play className="h-4 w-4" />
            {running ? "Simulating" : "Run"}
          </button>
          <button className="premium-button" onClick={undo}><Undo2 className="h-4 w-4" />Undo</button>
          <button className="premium-button" onClick={() => commit(nodes, wires)}><Redo2 className="h-4 w-4" />Evaluate</button>
          <button className="icon-button" onClick={deleteSelected} aria-label="Delete selected"><Trash2 className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="grid min-h-[650px] gap-3 xl:grid-cols-[var(--builder-cols)]" style={{ "--builder-cols": `${paletteOpen ? "260px" : "62px"} minmax(0,1fr) 280px` } as CSSProperties}>
        <aside className="premium-card p-3">
          <button className="icon-button mb-3 xl:hidden" onClick={() => setPaletteOpen((value) => !value)} aria-label="Toggle components">
            <Plus className="h-4 w-4" />
          </button>
          <button className="mb-3 hidden w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-white/60 xl:flex" onClick={() => setPaletteOpen((value) => !value)}>
            <Plus className="h-3.5 w-3.5" />
            {paletteOpen ? "Collapse" : ""}
          </button>
          {paletteOpen && (
          <>
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
            <Search className="h-4 w-4 text-white/36" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search components" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/28" />
          </div>
          <div className="space-y-4">
            {["IO", "Gates", "Memory"].map((group) => (
              <div key={group}>
                <div className="mb-2 font-mono text-xs font-black uppercase tracking-widest text-white/34">{group}</div>
                <div className="grid gap-2">
                  {filteredPalette.filter((item) => item.group === group).map((item) => (
                    <button key={item.type} onClick={() => addNode(item.type)} className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left transition hover:border-cyan-300/28 hover:bg-cyan-300/8">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-black/20" style={{ color: item.color }}>
                          <Cpu className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-black text-white">{item.label}</span>
                          <span className="font-mono text-[10px] text-white/32">{item.type}</span>
                        </span>
                      </span>
                      <Plus className="h-4 w-4 text-white/28 group-hover:text-white" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          </>
          )}
        </aside>

        <div className="premium-card overflow-hidden p-2.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button className="icon-button" onClick={() => setZoom((value) => Math.max(0.55, value - 0.1))} aria-label="Zoom out"><ZoomOut className="h-4 w-4" /></button>
              <span className="mono-chip">{Math.round(zoom * 100)}%</span>
              <button className="icon-button" onClick={() => setZoom((value) => Math.min(1.65, value + 0.1))} aria-label="Zoom in"><ZoomIn className="h-4 w-4" /></button>
              <button className="icon-button" onClick={() => setPan({ x: 0, y: 0 })} aria-label="Reset pan"><RotateCcw className="h-4 w-4" /></button>
            </div>
            <div className="flex gap-2">
              <span className="mono-chip"><Grid3X3 className="h-3.5 w-3.5" /> snap 24</span>
              <span className="mono-chip"><Workflow className="h-3.5 w-3.5" /> {wires.length} wires</span>
              <span className="mono-chip"><MousePointer2 className="h-3.5 w-3.5" /> {selected.length} selected</span>
            </div>
          </div>
          <div
            ref={canvasRef}
            className="canvas-grid relative h-[560px] overflow-hidden rounded-2xl border border-white/10 md:h-[610px]"
            onMouseMove={(event) => {
              if (!dragging) return;
              const point = canvasPoint(event);
              setNodes((value) => value.map((node) => (node.id === dragging.id ? { ...node, x: snap(point.x - dragging.dx), y: snap(point.y - dragging.dy) } : node)));
            }}
            onMouseUp={() => {
              if (dragging) commit(nodes, wires);
              setDragging(null);
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              setContext(null);
            }}
          >
            <div className="absolute left-0 top-0 h-[1200px] w-[1600px] origin-top-left" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
              <svg className="absolute inset-0 h-[1200px] w-[1600px]">
                {wirePaths.map(({ wire, d, active }) => (
                  <g key={wire.id}>
                    <path d={d} fill="none" stroke={active ? "#41f29a" : "rgba(226,232,240,0.18)"} strokeWidth={active ? 4 : 2.5} strokeLinecap="round" className={active && running ? "wire-flow" : ""} filter={active ? "drop-shadow(0 0 7px rgba(65,242,154,0.75))" : undefined} />
                  </g>
                ))}
              </svg>

              {nodes.map((node) => {
                const color = colorFor(node.type);
                const active = node.value === 1;
                const isSelected = selected.includes(node.id);
                return (
                  <motion.div
                    key={node.id}
                    layout
                    className="absolute"
                    style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
                    onMouseDown={(event) => {
                      event.stopPropagation();
                      const point = canvasPoint(event);
                      setDragging({ id: node.id, dx: point.x - node.x, dy: point.y - node.y });
                      setSelected(event.shiftKey ? Array.from(new Set([...selected, node.id])) : [node.id]);
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setContext({ x: event.clientX, y: event.clientY, id: node.id });
                      setSelected([node.id]);
                    }}
                  >
                    <div className={`relative h-full rounded-2xl border bg-[#07111e]/92 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.32)] ${isSelected ? "border-cyan-300/50" : "border-white/12"}`} style={{ boxShadow: active ? `0 0 34px ${color}22` : undefined }}>
                      <button
                        className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-white/20 bg-[#050812]"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (connecting && connecting !== node.id) {
                            const next = [...wires.filter((wire) => !(wire.from === connecting && wire.to === node.id)), { id: `w${counter.current++}`, from: connecting, to: node.id }];
                            setConnecting(null);
                            commit(nodes, next);
                          }
                        }}
                        aria-label="Input port"
                      />
                      <button
                        className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border bg-[#050812]"
                        style={{ borderColor: active ? color : "rgba(255,255,255,0.2)", background: active ? color : "#050812", boxShadow: active ? `0 0 16px ${color}` : undefined }}
                        onClick={(event) => {
                          event.stopPropagation();
                          setConnecting(connecting === node.id ? null : node.id);
                        }}
                        aria-label="Output port"
                      />
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-xs font-black" style={{ color }}>{node.type}</div>
                        <div className={active ? "signal-high font-mono text-lg font-black" : "signal-low font-mono text-lg font-black"}>{node.value}</div>
                      </div>
                      <div className="mt-2 truncate text-sm font-black text-white">{node.label}</div>
                      {(node.type === "INPUT" || node.type === "CLOCK") && (
                        <button onClick={(event) => { event.stopPropagation(); toggleNode(node.id); }} className="mt-2 rounded-lg border border-white/10 bg-white/[0.045] px-2 py-1 font-mono text-[10px] font-black text-white/70">
                          toggle
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {nodes.length === 0 && (
                <div className="absolute left-[420px] top-[240px] text-center text-white/20">
                  <CircuitBoard className="mx-auto mb-4 h-12 w-12" />
                  <div className="font-mono text-sm">Add components from the library</div>
                </div>
              )}
            </div>

            <div className="absolute bottom-3 right-3 h-28 w-40 rounded-xl border border-white/10 bg-[#050812]/84 p-2 backdrop-blur-xl">
              <div className="mb-1 font-mono text-[10px] font-black uppercase tracking-widest text-white/34">minimap</div>
              <div className="relative h-20 overflow-hidden rounded-lg bg-white/[0.035]">
                {nodes.map((node) => (
                  <span key={node.id} className="absolute h-2 w-4 rounded-sm" style={{ left: node.x / 9, top: node.y / 9, background: colorFor(node.type), opacity: 0.8 }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="grid gap-3">
          <div className="premium-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Bot className="h-4 w-4 text-amber-200" />
              <h3 className="font-black text-white">AI Suggestions</h3>
            </div>
            <div className="space-y-3 text-sm leading-6 text-white/54">
              <p>Add a CLOCK and D-FF to turn this combinational XOR example into a sampled parity register.</p>
              <p>Use NAND nodes to recreate every gate from a universal primitive.</p>
            </div>
            <button className="premium-button mt-4 w-full" onClick={() => addNode("D-FF", 460, 360)}>
              <Sparkles className="h-4 w-4" />
              Add D-FF
            </button>
          </div>

          <div className="premium-card p-4">
            <h3 className="mb-3 font-black text-white">Inspector</h3>
            {selected.length ? (
              <div className="space-y-2">
                {nodes.filter((node) => selected.includes(node.id)).map((node) => (
                  <div key={node.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="font-mono text-xs font-black" style={{ color: colorFor(node.type) }}>{node.type}</div>
                    <div className="mt-1 text-sm text-white/58">x {node.x} / y {node.y} / value {node.value}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-white/45">Select a node to inspect position, state, and connections.</p>
            )}
          </div>

          <div className="premium-card p-4">
            <h3 className="mb-3 font-black text-white">Shortcuts</h3>
            <div className="grid gap-2">
              {["Shift-click multi-select", "Click output port then input port to wire", "Right-click node for context menu", "Use zoom controls for dense circuits"].map((item) => (
                <div key={item} className="mono-chip justify-start">{item}</div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {context && (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="fixed z-[100] w-52 rounded-xl border border-white/10 bg-[#070b13]/96 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl" style={{ left: context.x, top: context.y }}>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/68 hover:bg-white/8 hover:text-white" onClick={() => { duplicateSelected(); setContext(null); }}>
              <Copy className="h-4 w-4" /> Duplicate
            </button>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-white/68 hover:bg-white/8 hover:text-white" onClick={() => setContext(null)}>
              <Save className="h-4 w-4" /> Save selection
            </button>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#fb7185] hover:bg-[#fb7185]/10" onClick={() => { deleteSelected(); setContext(null); }}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
