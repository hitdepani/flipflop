"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Bit = 0 | 1;
type ComponentType = "AND" | "OR" | "NOT" | "NAND" | "NOR" | "XOR" | "INPUT" | "OUTPUT" | "CLOCK" | "SR-FF" | "JK-FF" | "D-FF" | "T-FF";

interface Port {
  id: string;
  type: "input" | "output";
  label: string;
  x: number;
  y: number;
}

interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  inputs: Record<string, Bit>;
  output: Bit;
  outputs?: Record<string, Bit>;
  label?: string;
  ports: Port[];
  prevQ?: Bit;
}

interface Wire {
  id: string;
  fromCompId: string;
  fromPort: string;
  toCompId: string;
  toPort: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  targetId: string | null;
  targetType: "component" | "wire" | "canvas";
}

interface HistoryState {
  components: CircuitComponent[];
  wires: Wire[];
}

const GRID = 24;
const snap = (v: number) => Math.round(v / GRID) * GRID;

const COMPONENT_COLORS: Record<ComponentType, string> = {
  AND: "#e8a849", OR: "#34d399", NOT: "#f472b6",
  NAND: "#60a5fa", NOR: "#fb923c", XOR: "#2dd4bf",
  INPUT: "#34d399", OUTPUT: "#f472b6", CLOCK: "#e8a849",
  "SR-FF": "#e8a849", "JK-FF": "#60a5fa", "D-FF": "#34d399", "T-FF": "#f472b6",
};

const COMP_W = 100;
const COMP_H = 60;
const FF_H = 80;

function makePorts(type: ComponentType): Port[] {
  const isFF = ["SR-FF", "JK-FF", "D-FF", "T-FF"].includes(type);

  if (type === "OUTPUT") {
    return [{ id: "in0", type: "input", label: "IN", x: 0, y: COMP_H / 2 }];
  }
  if (type === "INPUT" || type === "CLOCK") {
    return [{ id: "out0", type: "output", label: "Q", x: COMP_W, y: COMP_H / 2 }];
  }
  if (isFF) {
    const h = FF_H;
    switch (type) {
      case "D-FF":
        return [
          { id: "D", type: "input", label: "D", x: 0, y: 20 },
          { id: "CLK", type: "input", label: "CLK", x: 0, y: h - 20 },
          { id: "Q", type: "output", label: "Q", x: COMP_W, y: 20 },
          { id: "Qb", type: "output", label: "Q'", x: COMP_W, y: h - 20 },
        ];
      case "T-FF":
        return [
          { id: "T", type: "input", label: "T", x: 0, y: 20 },
          { id: "CLK", type: "input", label: "CLK", x: 0, y: h - 20 },
          { id: "Q", type: "output", label: "Q", x: COMP_W, y: 20 },
          { id: "Qb", type: "output", label: "Q'", x: COMP_W, y: h - 20 },
        ];
      case "SR-FF":
        return [
          { id: "S", type: "input", label: "S", x: 0, y: 16 },
          { id: "R", type: "input", label: "R", x: 0, y: 40 },
          { id: "CLK", type: "input", label: "CLK", x: 0, y: h - 16 },
          { id: "Q", type: "output", label: "Q", x: COMP_W, y: 20 },
          { id: "Qb", type: "output", label: "Q'", x: COMP_W, y: h - 20 },
        ];
      case "JK-FF":
        return [
          { id: "J", type: "input", label: "J", x: 0, y: 16 },
          { id: "K", type: "input", label: "K", x: 0, y: 40 },
          { id: "CLK", type: "input", label: "CLK", x: 0, y: h - 16 },
          { id: "Q", type: "output", label: "Q", x: COMP_W, y: 20 },
          { id: "Qb", type: "output", label: "Q'", x: COMP_W, y: h - 20 },
        ];
    }
  }

  const single = type === "NOT";
  const inputs: Port[] = single
    ? [{ id: "a", type: "input", label: "A", x: 0, y: COMP_H / 2 }]
    : [
        { id: "a", type: "input", label: "A", x: 0, y: 18 },
        { id: "b", type: "input", label: "B", x: 0, y: 42 },
      ];
  return [...inputs, { id: "out", type: "output", label: "Y", x: COMP_W, y: COMP_H / 2 }];
}

function computeOutput(type: ComponentType, inputs: Record<string, Bit>, prevQ?: Bit): { output: Bit; outputs?: Record<string, Bit> } {
  const a = inputs["a"] ?? 0;
  const b = inputs["b"] ?? 0;
  switch (type) {
    case "AND": return { output: (a & b) as Bit };
    case "OR": return { output: (a | b) as Bit };
    case "NOT": return { output: (1 - a) as Bit };
    case "NAND": return { output: ((a & b) === 1 ? 0 : 1) as Bit };
    case "NOR": return { output: ((a | b) === 0 ? 1 : 0) as Bit };
    case "XOR": return { output: (a ^ b) as Bit };
    case "INPUT": return { output: inputs["val"] ?? 0 };
    case "CLOCK": return { output: inputs["val"] ?? 0 };
    case "OUTPUT": return { output: inputs["in0"] ?? 0 };
    case "D-FF": {
      const D = inputs["D"] ?? 0;
      return { output: D, outputs: { Q: D, Qb: (1 - D) as Bit } };
    }
    case "T-FF": {
      const T = inputs["T"] ?? 0;
      const pQ = prevQ ?? 0;
      const Q = T === 1 ? ((1 - pQ) as Bit) : pQ;
      return { output: Q, outputs: { Q, Qb: (1 - Q) as Bit } };
    }
    case "SR-FF": {
      const S = inputs["S"] ?? 0, R = inputs["R"] ?? 0;
      const pQ = prevQ ?? 0;
      let Q: Bit;
      if (S === 1 && R === 0) Q = 1;
      else if (S === 0 && R === 1) Q = 0;
      else if (S === 1 && R === 1) Q = 0;
      else Q = pQ;
      return { output: Q, outputs: { Q, Qb: (1 - Q) as Bit } };
    }
    case "JK-FF": {
      const J = inputs["J"] ?? 0, K = inputs["K"] ?? 0;
      const pQ = prevQ ?? 0;
      let Q: Bit;
      if (J === 1 && K === 1) Q = (1 - pQ) as Bit;
      else if (J === 1) Q = 1;
      else if (K === 1) Q = 0;
      else Q = pQ;
      return { output: Q, outputs: { Q, Qb: (1 - Q) as Bit } };
    }
  }
}

const isFFType = (t: ComponentType) => ["SR-FF", "JK-FF", "D-FF", "T-FF"].includes(t);

const PALETTE: { type: ComponentType; label: string; icon: string; group: string }[] = [
  { type: "INPUT", label: "Input", icon: "⬛", group: "IO" },
  { type: "OUTPUT", label: "Output", icon: "💡", group: "IO" },
  { type: "CLOCK", label: "Clock", icon: "⏱", group: "IO" },
  { type: "AND", label: "AND", icon: "⊓", group: "Gates" },
  { type: "OR", label: "OR", icon: "⊔", group: "Gates" },
  { type: "NOT", label: "NOT", icon: "¬", group: "Gates" },
  { type: "NAND", label: "NAND", icon: "⊼", group: "Gates" },
  { type: "NOR", label: "NOR", icon: "⊽", group: "Gates" },
  { type: "XOR", label: "XOR", icon: "⊕", group: "Gates" },
  { type: "D-FF", label: "D FF", icon: "⎋", group: "Flip-Flops" },
  { type: "T-FF", label: "T FF", icon: "⟲", group: "Flip-Flops" },
  { type: "SR-FF", label: "SR FF", icon: "⇌", group: "Flip-Flops" },
  { type: "JK-FF", label: "JK FF", icon: "⇋", group: "Flip-Flops" },
];

const SAVE_KEY = "fliplogic-circuits";

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className="toast">{message}</div>;
}

export default function CircuitBuilder() {
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<{ compId: string; portId: string; x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedWire, setSelectedWire] = useState<string | null>(null);
  const [isDropTarget, setIsDropTarget] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [savedCircuits, setSavedCircuits] = useState<string[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Undo/Redo
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const skipHistory = useRef(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);
  const clockIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Push to history
  const pushHistory = useCallback((comps: CircuitComponent[], ws: Wire[]) => {
    if (skipHistory.current) {
      skipHistory.current = false;
      return;
    }
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIdx + 1);
      newHistory.push({
        components: JSON.parse(JSON.stringify(comps)),
        wires: JSON.parse(JSON.stringify(ws)),
      });
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIdx((prev) => Math.min(prev + 1, 49));
  }, [historyIdx]);

  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    const newIdx = historyIdx - 1;
    const state = history[newIdx];
    if (!state) return;
    skipHistory.current = true;
    setComponents(JSON.parse(JSON.stringify(state.components)));
    setWires(JSON.parse(JSON.stringify(state.wires)));
    setHistoryIdx(newIdx);
    setToast("↩ Undo");
  }, [history, historyIdx]);

  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const newIdx = historyIdx + 1;
    const state = history[newIdx];
    if (!state) return;
    skipHistory.current = true;
    setComponents(JSON.parse(JSON.stringify(state.components)));
    setWires(JSON.parse(JSON.stringify(state.wires)));
    setHistoryIdx(newIdx);
    setToast("↪ Redo");
  }, [history, historyIdx]);

  // Save initial state
  useEffect(() => {
    pushHistory([], []);
  }, []); // eslint-disable-line

  // Load saved circuit names
  useEffect(() => {
    try {
      const data = localStorage.getItem(SAVE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        setSavedCircuits(Object.keys(parsed));
      }
    } catch { /* ignore */ }
  }, []);

  const getCanvasPos = (e: React.MouseEvent | React.DragEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const addComponent = useCallback((type: ComponentType, x?: number, y?: number) => {
    const id = `comp-${idCounter.current++}`;
    const h = isFFType(type) ? FF_H : COMP_H;
    const rawX = x ?? 60 + Math.random() * 300;
    const rawY = y ?? 40 + Math.random() * 250;
    const newComp: CircuitComponent = {
      id,
      type,
      x: snap(rawX),
      y: snap(rawY),
      inputs: (type === "INPUT" || type === "CLOCK") ? { val: 0 as Bit } : {},
      output: 0,
      label: type === "INPUT" ? `IN${idCounter.current}` : type === "CLOCK" ? "CLK" : undefined,
      ports: makePorts(type),
      prevQ: 0,
    };
    setComponents((prev) => {
      const next = [...prev, newComp];
      pushHistory(next, wires);
      return next;
    });
    setSelected(id);
  }, [wires, pushHistory]); // eslint-disable-line

  const duplicateComponent = (compId: string) => {
    const comp = components.find((c) => c.id === compId);
    if (!comp) return;
    addComponent(comp.type, comp.x + 40, comp.y + 40);
    setToast("📋 Duplicated");
  };

  // HTML5 drag from palette
  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData("componentType", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDropTarget(true);
  };

  const handleCanvasDragLeave = () => setIsDropTarget(false);

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTarget(false);
    const type = e.dataTransfer.getData("componentType") as ComponentType;
    if (!type) return;
    const pos = getCanvasPos(e);
    const h = isFFType(type) ? FF_H : COMP_H;
    addComponent(type, pos.x - COMP_W / 2, pos.y - h / 2);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    setMousePos(pos);
    if (dragging) {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === dragging
            ? { ...c, x: snap(pos.x - dragOffset.x), y: snap(pos.y - dragOffset.y) }
            : c
        )
      );
    }
  };

  const handleCompMouseDown = (e: React.MouseEvent, compId: string) => {
    e.stopPropagation();
    const pos = getCanvasPos(e);
    const comp = components.find((c) => c.id === compId);
    if (!comp) return;
    setDragging(compId);
    setDragOffset({ x: pos.x - comp.x, y: pos.y - comp.y });
    setSelected(compId);
    setSelectedWire(null);
    setContextMenu(null);
  };

  const handleMouseUp = () => {
    if (dragging) {
      pushHistory(components, wires);
    }
    setDragging(null);
  };

  const getPortAbsPos = (comp: CircuitComponent, port: Port) => ({
    x: comp.x + port.x,
    y: comp.y + port.y,
  });

  const handlePortClick = (e: React.MouseEvent, compId: string, port: Port) => {
    e.stopPropagation();
    const comp = components.find((c) => c.id === compId);
    if (!comp) return;
    const abs = getPortAbsPos(comp, port);

    if (!connectingFrom) {
      if (port.type === "output") {
        setConnectingFrom({ compId, portId: port.id, x: abs.x, y: abs.y });
      }
    } else {
      if (port.type === "input" && compId !== connectingFrom.compId) {
        // Check if port already has a wire
        const existing = wires.find((w) => w.toCompId === compId && w.toPort === port.id);
        const newWires = existing ? wires.filter((w) => w.id !== existing.id) : [...wires];
        const wireId = `wire-${idCounter.current++}`;
        newWires.push({
          id: wireId,
          fromCompId: connectingFrom.compId,
          fromPort: connectingFrom.portId,
          toCompId: compId,
          toPort: port.id,
        });
        setWires(newWires);
        pushHistory(components, newWires);
        setConnectingFrom(null);
      } else {
        setConnectingFrom(null);
      }
    }
  };

  // Wire click
  const handleWireClick = (e: React.MouseEvent, wireId: string) => {
    e.stopPropagation();
    setSelectedWire(wireId);
    setSelected(null);
  };

  // Signal propagation
  const propagateSignals = useCallback(() => {
    if (components.length === 0) return;
    setComponents((prev) => {
      const updated = prev.map((c) => ({ ...c }));
      for (let iter = 0; iter < 10; iter++) {
        for (const comp of updated) {
          const newInputs = { ...comp.inputs };
          for (const wire of wires) {
            if (wire.toCompId === comp.id) {
              const from = updated.find((c) => c.id === wire.fromCompId);
              if (from) {
                if (isFFType(from.type) && from.outputs) {
                  newInputs[wire.toPort] = wire.fromPort === "Qb" ? (from.outputs.Qb ?? 0) : (from.outputs.Q ?? 0);
                } else {
                  newInputs[wire.toPort] = from.output;
                }
              }
            }
          }
          comp.inputs = newInputs;
          const result = computeOutput(comp.type, newInputs, comp.prevQ);
          comp.output = result.output;
          if (result.outputs) comp.outputs = result.outputs;
          if (isFFType(comp.type)) comp.prevQ = result.output;
        }
      }
      return updated;
    });
  }, [wires, components.length]); // eslint-disable-line

  useEffect(() => { propagateSignals(); }, [wires]); // eslint-disable-line

  // Auto simulate + clock toggle
  useEffect(() => {
    if (!isSimulating) {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
      return;
    }
    clockIntervalRef.current = setInterval(() => {
      // Toggle all clock components
      setComponents((prev) =>
        prev.map((c) =>
          c.type === "CLOCK"
            ? { ...c, inputs: { ...c.inputs, val: (1 - (c.inputs["val"] ?? 0)) as Bit }, output: (1 - (c.inputs["val"] ?? 0)) as Bit }
            : c
        )
      );
      setTimeout(() => propagateSignals(), 10);
    }, 400);
    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, [isSimulating, propagateSignals]);

  const getWireActive = (wire: Wire) => {
    const from = components.find((c) => c.id === wire.fromCompId);
    if (!from) return false;
    if (isFFType(from.type) && from.outputs) {
      return (wire.fromPort === "Qb" ? from.outputs.Qb : from.outputs.Q) === 1;
    }
    return from.output === 1;
  };

  const toggleInput = (compId: string) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== compId || (c.type !== "INPUT" && c.type !== "CLOCK")) return c;
        const newVal = (1 - (c.inputs["val"] ?? 0)) as Bit;
        return { ...c, inputs: { ...c.inputs, val: newVal }, output: newVal };
      })
    );
    setTimeout(() => propagateSignals(), 10);
  };

  const deleteComponent = useCallback((compId: string) => {
    const newComps = components.filter((c) => c.id !== compId);
    const newWires = wires.filter((w) => w.fromCompId !== compId && w.toCompId !== compId);
    setComponents(newComps);
    setWires(newWires);
    pushHistory(newComps, newWires);
    if (selected === compId) setSelected(null);
  }, [components, wires, pushHistory, selected]);

  const deleteWire = useCallback((wireId: string) => {
    const newWires = wires.filter((w) => w.id !== wireId);
    setWires(newWires);
    pushHistory(components, newWires);
    setSelectedWire(null);
    setToast("🗑 Wire deleted");
  }, [wires, components, pushHistory]);

  const deleteSelected = useCallback(() => {
    if (selectedWire) {
      deleteWire(selectedWire);
    } else if (selected) {
      deleteComponent(selected);
    }
  }, [selected, selectedWire, deleteComponent, deleteWire]);

  const clearAll = () => {
    setComponents([]);
    setWires([]);
    setSelected(null);
    setSelectedWire(null);
    setConnectingFrom(null);
    setIsSimulating(false);
    pushHistory([], []);
    setToast("🗑 Canvas cleared");
  };

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, targetId: string | null, targetType: "component" | "wire" | "canvas") => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, targetId, targetType });
  };

  // Close context menu on any click
  useEffect(() => {
    const close = () => setContextMenu(null);
    if (contextMenu) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu]);

  // Save circuit
  const saveCircuit = (name: string) => {
    try {
      const existing = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      existing[name] = { components, wires, idCounter: idCounter.current };
      localStorage.setItem(SAVE_KEY, JSON.stringify(existing));
      setSavedCircuits(Object.keys(existing));
      setToast(`💾 Saved "${name}"`);
      setShowSaveDialog(false);
      setSaveName("");
    } catch { setToast("❌ Save failed"); }
  };

  const loadCircuit = (name: string) => {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      const circuit = data[name];
      if (!circuit) return;
      setComponents(circuit.components);
      setWires(circuit.wires);
      idCounter.current = circuit.idCounter || 0;
      pushHistory(circuit.components, circuit.wires);
      setToast(`📂 Loaded "${name}"`);
      setShowLoadDialog(false);
    } catch { setToast("❌ Load failed"); }
  };

  const deleteSavedCircuit = (name: string) => {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
      delete data[name];
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      setSavedCircuits(Object.keys(data));
      setToast(`🗑 Deleted "${name}"`);
    } catch { /* ignore */ }
  };

  // Export as PNG
  const exportAsPng = async () => {
    if (!canvasRef.current) return;
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: "#0f1419",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = "fliplogic-circuit.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      setToast("📸 Exported as PNG");
    } catch {
      setToast("❌ Export failed");
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        setShowSaveDialog(true);
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }
      if (e.key === "Escape") {
        setConnectingFrom(null);
        setSelected(null);
        setSelectedWire(null);
        setContextMenu(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [deleteSelected, undo, redo]);

  const groups = ["IO", "Gates", "Flip-Flops"];

  return (
    <section id="circuit-builder" className="relative py-16 md:py-24 px-3 md:px-6 grid-bg">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 md:mb-8 px-1"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3">
            <span className="text-white">Circuit </span>
            <span style={{ color: "#60a5fa", textShadow: "0 0 30px rgba(96,165,250,0.3)" }}>Builder</span>
          </h2>
          <p className="text-white/40 text-sm md:text-lg max-w-2xl">
            Drag components onto the canvas. Click output → input ports to wire. Use <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono">Ctrl+Z</kbd> to undo,{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-mono">Del</kbd> to delete.
          </p>
        </motion.div>

        <div className="flex gap-3">
          {/* Palette sidebar */}
          <div
            className={`flex-shrink-0 transition-all duration-300 ${paletteOpen ? "w-44 lg:w-52" : "w-12"}`}
          >
            <div className="glass-card p-2 md:p-3 sticky top-24">
              {/* Toggle palette */}
              <button
                onClick={() => setPaletteOpen(!paletteOpen)}
                className="w-full text-center text-xs py-1.5 rounded-lg text-white/40 hover:text-white/70 cursor-pointer mb-1 md:hidden"
              >
                {paletteOpen ? "◂ Hide" : "▸"}
              </button>

              {paletteOpen ? (
                <>
                  {groups.map((group) => (
                    <div key={group}>
                      <div className="palette-group-header text-[10px] font-mono text-white/25 uppercase tracking-widest py-1 px-1 border-b border-white/[0.04]">
                        {group}
                      </div>
                      {PALETTE.filter((i) => i.group === group).map((item) => (
                        <div
                          key={item.type}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.type)}
                          onClick={() => addComponent(item.type)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-mono cursor-grab active:cursor-grabbing hover:bg-white/[0.04] transition-colors"
                          style={{ color: COMPONENT_COLORS[item.type] }}
                        >
                          <span className="text-sm w-5 text-center">{item.icon}</span>
                          <span className="palette-label truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Actions */}
                  <div className="palette-actions pt-2 mt-1 border-t border-white/[0.05] space-y-1.5">
                    <motion.button
                      onClick={() => {
                        setIsSimulating(!isSimulating);
                        if (!isSimulating) propagateSignals();
                      }}
                      whileHover={{ scale: 1.02 }}
                      className={`w-full text-[11px] py-2 rounded-lg font-bold cursor-pointer ${
                        isSimulating ? "text-[#34d399] border border-[rgba(52,211,153,0.5)] sim-running" : "text-[#60a5fa] border border-[rgba(96,165,250,0.3)]"
                      }`}
                      style={{ background: isSimulating ? "rgba(52,211,153,0.1)" : "rgba(96,165,250,0.08)" }}
                    >
                      {isSimulating ? "⏸ Pause" : "▶ Run"}
                    </motion.button>

                    <button onClick={propagateSignals} className="w-full text-[11px] py-1.5 rounded-lg text-[#e8a849] border border-[rgba(232,168,73,0.2)] cursor-pointer" style={{ background: "rgba(232,168,73,0.05)" }}>
                      ⏭ Step
                    </button>

                    <div className="flex gap-1">
                      <button onClick={undo} className="flex-1 text-[11px] py-1.5 rounded-lg text-white/30 border border-white/[0.08] cursor-pointer hover:text-white/50" title="Undo (Ctrl+Z)">↩</button>
                      <button onClick={redo} className="flex-1 text-[11px] py-1.5 rounded-lg text-white/30 border border-white/[0.08] cursor-pointer hover:text-white/50" title="Redo (Ctrl+Y)">↪</button>
                    </div>

                    <div className="flex gap-1">
                      <button onClick={() => setShowSaveDialog(true)} className="flex-1 text-[11px] py-1.5 rounded-lg text-white/30 border border-white/[0.08] cursor-pointer hover:text-white/50" title="Save">💾</button>
                      <button onClick={() => { setShowLoadDialog(true); }} className="flex-1 text-[11px] py-1.5 rounded-lg text-white/30 border border-white/[0.08] cursor-pointer hover:text-white/50" title="Load">📂</button>
                      <button onClick={exportAsPng} className="flex-1 text-[11px] py-1.5 rounded-lg text-white/30 border border-white/[0.08] cursor-pointer hover:text-white/50" title="Export PNG">📸</button>
                    </div>

                    {(selected || selectedWire) && (
                      <button onClick={deleteSelected} className="w-full text-[11px] py-1.5 rounded-lg text-[#f472b6] border border-[rgba(244,114,182,0.2)] cursor-pointer" style={{ background: "rgba(244,114,182,0.05)" }}>
                        🗑 Delete {selectedWire ? "Wire" : "Selected"}
                      </button>
                    )}

                    <button onClick={clearAll} className="w-full text-[11px] py-1.5 rounded-lg text-white/20 border border-white/[0.06] cursor-pointer hover:text-white/40">↺ Clear</button>
                  </div>
                </>
              ) : (
                /* Collapsed palette — icons only */
                <div className="space-y-1 pt-1">
                  {PALETTE.map((item) => (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item.type)}
                      onClick={() => addComponent(item.type)}
                      className="flex items-center justify-center w-8 h-8 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white/[0.06]"
                      title={item.label}
                      style={{ color: COMPONENT_COLORS[item.type] }}
                    >
                      {item.icon}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 min-w-0">
            <div
              ref={canvasRef}
              className={`relative w-full rounded-2xl overflow-hidden transition-all duration-200 ${isDropTarget ? "canvas-drop-active" : ""}`}
              style={{
                height: "min(70vh, 600px)",
                minHeight: 350,
                background: "radial-gradient(ellipse at 50% 50%, rgba(96,165,250,0.015) 0%, transparent 70%), rgba(255,255,255,0.02)",
                border: `1px solid ${connectingFrom ? "rgba(232,168,73,0.4)" : isDropTarget ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.06)"}`,
                backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                backgroundSize: `${GRID}px ${GRID}px`,
                cursor: connectingFrom ? "crosshair" : "default",
              }}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleMouseUp}
              onDragOver={handleCanvasDragOver}
              onDragLeave={handleCanvasDragLeave}
              onDrop={handleCanvasDrop}
              onContextMenu={(e) => handleContextMenu(e, null, "canvas")}
              onClick={() => {
                setConnectingFrom(null);
                setSelected(null);
                setSelectedWire(null);
              }}
            >
              {/* SVG wires */}
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1, pointerEvents: "none" }}>
                {wires.map((wire) => {
                  const fromComp = components.find((c) => c.id === wire.fromCompId);
                  const toComp = components.find((c) => c.id === wire.toCompId);
                  if (!fromComp || !toComp) return null;
                  const fromPort = fromComp.ports.find((p) => p.id === wire.fromPort);
                  const toPort = toComp.ports.find((p) => p.id === wire.toPort);
                  if (!fromPort || !toPort) return null;
                  const p1 = getPortAbsPos(fromComp, fromPort);
                  const p2 = getPortAbsPos(toComp, toPort);
                  const active = getWireActive(wire);
                  const isSel = selectedWire === wire.id;
                  const mx = (p1.x + p2.x) / 2;
                  const pathD = `M ${p1.x} ${p1.y} C ${mx} ${p1.y} ${mx} ${p2.y} ${p2.x} ${p2.y}`;
                  return (
                    <g key={wire.id}>
                      {/* Invisible thick hit area */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={14}
                        style={{ pointerEvents: "stroke", cursor: "pointer" }}
                        onClick={(e) => handleWireClick(e as unknown as React.MouseEvent, wire.id)}
                        onContextMenu={(e) => { e.stopPropagation(); handleContextMenu(e as unknown as React.MouseEvent, wire.id, "wire"); }}
                      />
                      <path
                        d={pathD}
                        fill="none"
                        stroke={isSel ? "#e8a849" : active ? "#34d399" : "rgba(255,255,255,0.15)"}
                        strokeWidth={isSel ? 3 : active ? 2.5 : 1.5}
                        style={{
                          filter: isSel
                            ? "drop-shadow(0 0 6px #e8a849)"
                            : active
                            ? "drop-shadow(0 0 4px #34d399)"
                            : "none",
                          pointerEvents: "none",
                        }}
                      />
                      {active && isSimulating && (
                        <circle r="3" fill="#34d399" style={{ filter: "drop-shadow(0 0 4px #34d399)" }}>
                          <animateMotion dur="1.2s" repeatCount="indefinite" path={pathD} />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* Wire preview */}
                {connectingFrom && (
                  <line
                    x1={connectingFrom.x} y1={connectingFrom.y}
                    x2={mousePos.x} y2={mousePos.y}
                    stroke="rgba(232,168,73,0.5)"
                    strokeWidth="1.5"
                    strokeDasharray="6,4"
                    style={{ filter: "drop-shadow(0 0 4px rgba(232,168,73,0.6))", pointerEvents: "none" }}
                  />
                )}
              </svg>

              {/* Components */}
              {components.map((comp) => {
                const h = isFFType(comp.type) ? FF_H : COMP_H;
                const isClock = comp.type === "CLOCK";
                return (
                  <motion.div
                    key={comp.id}
                    style={{
                      position: "absolute",
                      left: comp.x,
                      top: comp.y,
                      width: COMP_W,
                      height: h,
                      zIndex: dragging === comp.id ? 10 : selected === comp.id ? 5 : 2,
                    }}
                    animate={{ scale: dragging === comp.id ? 1.05 : 1 }}
                    onMouseDown={(e) => handleCompMouseDown(e, comp.id)}
                    onContextMenu={(e) => handleContextMenu(e, comp.id, "component")}
                  >
                    <div
                      className={`chip-component w-full h-full flex items-center justify-center relative ${dragging === comp.id ? "dragging" : ""}`}
                      style={{
                        borderColor: selected === comp.id ? `${COMPONENT_COLORS[comp.type]}80` : `${COMPONENT_COLORS[comp.type]}25`,
                        boxShadow: selected === comp.id ? `0 0 20px ${COMPONENT_COLORS[comp.type]}20` : "none",
                      }}
                    >
                      {/* Delete × on hover */}
                      <div
                        className="delete-overlay"
                        onClick={(e) => { e.stopPropagation(); deleteComponent(comp.id); }}
                        title="Delete"
                      >
                        ×
                      </div>

                      <div className="text-center">
                        <div className="font-mono font-bold text-[11px]" style={{ color: COMPONENT_COLORS[comp.type] }}>
                          {comp.type === "INPUT" ? comp.label ?? "IN" : comp.type === "CLOCK" ? "CLK" : comp.type}
                        </div>
                        {(comp.type === "INPUT" || isClock) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleInput(comp.id); }}
                            className="mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all"
                            style={{
                              background: comp.output === 1 ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.08)",
                              color: comp.output === 1 ? "#34d399" : "rgba(255,255,255,0.4)",
                              border: comp.output === 1 ? "1px solid rgba(52,211,153,0.4)" : "1px solid rgba(255,255,255,0.1)",
                            }}
                          >
                            {isClock && isSimulating ? "⏱" : comp.output}
                          </button>
                        )}
                        {comp.type === "OUTPUT" && (
                          <div
                            className="mt-0.5 w-4 h-4 rounded-full mx-auto transition-all"
                            style={{
                              background: comp.output === 1 ? "#34d399" : "rgba(255,255,255,0.1)",
                              boxShadow: comp.output === 1 ? "0 0 12px #34d399" : "none",
                            }}
                          />
                        )}
                        {!["INPUT", "OUTPUT", "CLOCK"].includes(comp.type) && !isFFType(comp.type) && (
                          <div className="text-[10px] mt-0.5" style={{ color: comp.output === 1 ? "#34d399" : "rgba(255,255,255,0.25)" }}>
                            Y={comp.output}
                          </div>
                        )}
                        {isFFType(comp.type) && (
                          <div className="text-[10px] mt-0.5 font-mono" style={{ color: (comp.outputs?.Q ?? comp.output) === 1 ? "#34d399" : "rgba(255,255,255,0.25)" }}>
                            Q={comp.outputs?.Q ?? comp.output}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ports */}
                    {comp.ports.map((port) => {
                      let portActive = false;
                      if (port.type === "output") {
                        if (isFFType(comp.type) && comp.outputs) {
                          portActive = (port.id === "Q" ? comp.outputs.Q : comp.outputs.Qb) === 1;
                        } else {
                          portActive = comp.output === 1;
                        }
                      }
                      const isConnecting = connectingFrom?.compId === comp.id && connectingFrom?.portId === port.id;
                      return (
                        <div
                          key={port.id}
                          onClick={(e) => handlePortClick(e, comp.id, port)}
                          className="port absolute"
                          style={{
                            left: port.x - 5,
                            top: port.y - 5,
                            background: isConnecting ? "#e8a849" : portActive ? "#34d399" : undefined,
                            borderColor: isConnecting ? "#e8a849" : portActive ? "#34d399" : undefined,
                            boxShadow: portActive ? "0 0 8px rgba(52,211,153,0.5)" : isConnecting ? "0 0 8px rgba(232,168,73,0.5)" : undefined,
                          }}
                          title={port.label}
                        >
                          <span
                            className="absolute text-[7px] font-mono font-bold pointer-events-none whitespace-nowrap"
                            style={{
                              color: "rgba(255,255,255,0.35)",
                              left: port.type === "input" ? 13 : "auto",
                              right: port.type === "output" ? 13 : "auto",
                              top: "50%",
                              transform: "translateY(-50%)",
                            }}
                          >
                            {port.label}
                          </span>
                        </div>
                      );
                    })}
                  </motion.div>
                );
              })}

              {/* Empty state */}
              {components.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-white/15">
                    <div className="text-5xl mb-3">⬡</div>
                    <div className="font-mono text-sm">Drag or click to add components</div>
                  </div>
                </div>
              )}

              {/* Drop indicator */}
              <AnimatePresence>
                {isDropTarget && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-3 rounded-xl border-2 border-dashed border-[rgba(52,211,153,0.25)] pointer-events-none flex items-center justify-center"
                  >
                    <span className="text-sm font-mono text-[#34d399]/30">Drop here</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status bar */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-white/25 px-1">
              <span>{components.length} components</span>
              <span>·</span>
              <span>{wires.length} wires</span>
              {isSimulating && <span className="text-[#34d399] animate-pulse">· Simulating</span>}
              {connectingFrom && <span className="text-[#e8a849] animate-pulse">· Click input port to wire</span>}
              {selectedWire && <span className="text-[#e8a849]">· Wire selected (Del to remove)</span>}
              {selected && !connectingFrom && <span>· {components.find((c) => c.id === selected)?.type} selected</span>}
              <span className="ml-auto hidden md:inline text-white/15">Ctrl+Z undo · Ctrl+Y redo · Ctrl+S save</span>
            </div>
          </div>
        </div>
      </div>

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="context-menu"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.targetType === "component" && contextMenu.targetId && (
              <>
                <div
                  className="context-menu-item"
                  onClick={() => { duplicateComponent(contextMenu.targetId!); setContextMenu(null); }}
                >
                  📋 Duplicate
                </div>
                <div
                  className="context-menu-item danger"
                  onClick={() => { deleteComponent(contextMenu.targetId!); setContextMenu(null); }}
                >
                  🗑 Delete
                </div>
              </>
            )}
            {contextMenu.targetType === "wire" && contextMenu.targetId && (
              <div
                className="context-menu-item danger"
                onClick={() => { deleteWire(contextMenu.targetId!); setContextMenu(null); }}
              >
                🗑 Delete Wire
              </div>
            )}
            {contextMenu.targetType === "canvas" && (
              <>
                <div className="context-menu-item" onClick={() => { clearAll(); setContextMenu(null); }}>↺ Clear All</div>
                <div className="context-menu-divider" />
                <div className="context-menu-item" onClick={() => { setShowSaveDialog(true); setContextMenu(null); }}>💾 Save Circuit</div>
                <div className="context-menu-item" onClick={() => { setShowLoadDialog(true); setContextMenu(null); }}>📂 Load Circuit</div>
                <div className="context-menu-item" onClick={() => { exportAsPng(); setContextMenu(null); }}>📸 Export PNG</div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save dialog */}
      <AnimatePresence>
        {showSaveDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowSaveDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg text-white mb-4">Save Circuit</h3>
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Circuit name..."
                autoFocus
                className="w-full px-4 py-2.5 rounded-xl text-sm font-mono mb-3"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#e8a849", outline: "none" }}
                onKeyDown={(e) => { if (e.key === "Enter" && saveName.trim()) saveCircuit(saveName.trim()); }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveName.trim() && saveCircuit(saveName.trim())}
                  className="flex-1 py-2 rounded-xl text-sm font-bold cursor-pointer"
                  style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" }}
                >
                  Save
                </button>
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="flex-1 py-2 rounded-xl text-sm cursor-pointer text-white/40 border border-white/10"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load dialog */}
      <AnimatePresence>
        {showLoadDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            onClick={() => setShowLoadDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card p-6 w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg text-white mb-4">Load Circuit</h3>
              {savedCircuits.length === 0 ? (
                <p className="text-sm text-white/30 mb-4">No saved circuits yet.</p>
              ) : (
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {savedCircuits.map((name) => (
                    <div key={name} className="flex items-center gap-2">
                      <button
                        onClick={() => loadCircuit(name)}
                        className="flex-1 text-left px-3 py-2 rounded-lg text-sm font-mono cursor-pointer hover:bg-white/[0.04]"
                        style={{ color: "#e8a849", border: "1px solid rgba(232,168,73,0.15)" }}
                      >
                        {name}
                      </button>
                      <button
                        onClick={() => deleteSavedCircuit(name)}
                        className="px-2 py-2 rounded-lg text-xs text-white/30 hover:text-[#f472b6] cursor-pointer"
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowLoadDialog(false)}
                className="w-full py-2 rounded-xl text-sm cursor-pointer text-white/40 border border-white/10"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>
    </section>
  );
}
