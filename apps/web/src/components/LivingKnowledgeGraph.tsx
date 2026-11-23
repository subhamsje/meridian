"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Play, 
  Pause, 
  Eye, 
  EyeOff,
  Crosshair,
  Sparkles,
  Layers
} from "lucide-react";

export interface GraphNode {
  id: string;
  label: string;
  type?: string;
  sector?: string;
  ticker?: string;
  description?: string;
  confidence?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  radius?: number;
  color?: string;
  isDragging?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  description?: string;
  confidence?: number;
  evidence_id?: string;
  particles?: number[]; // offsets [0..1]
}

interface LivingKnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
  selectedEdge: GraphEdge | null;
  onSelectEdge: (edge: GraphEdge | null) => void;
  affectedEntityNames?: string[];
  investigatingEntityNames?: string[];
  searchQuery?: string;
  typeFilter?: string;
}

const CATEGORY_COLORS: Record<string, { fill: string; border: string; glow: string; text: string }> = {
  target_entity: { fill: "#064e3b", border: "#10b981", glow: "#34d399", text: "#a7f3d0" },
  government_customer: { fill: "#0c4a6e", border: "#0284c7", glow: "#38bdf8", text: "#bae6fd" },
  defense_contract: { fill: "#1e1b4b", border: "#4f46e5", glow: "#818cf8", text: "#c7d2fe" },
  cloud_infrastructure: { fill: "#134e4a", border: "#0d9488", glow: "#2dd4bf", text: "#99f6e4" },
  commercial_customer: { fill: "#065f46", border: "#059669", glow: "#10b981", text: "#a7f3d0" },
  competitor: { fill: "#701a75", border: "#c026d3", glow: "#e879f9", text: "#f5d0fe" },
  core_platform: { fill: "#3b0764", border: "#9333ea", glow: "#c084fc", text: "#e9d5ff" },
  leadership: { fill: "#713f12", border: "#ca8a04", glow: "#facc15", text: "#fef08a" },
  regulatory_body: { fill: "#1e293b", border: "#64748b", glow: "#94a3b8", text: "#e2e8f0" },
  default: { fill: "#1e293b", border: "#3b82f6", glow: "#60a5fa", text: "#dbeafe" }
};

export default function LivingKnowledgeGraph({
  nodes: rawNodes,
  edges: rawEdges,
  selectedNode,
  onSelectNode,
  selectedEdge,
  onSelectEdge,
  affectedEntityNames = [],
  investigatingEntityNames = [],
  searchQuery = "",
  typeFilter = "ALL"
}: LivingKnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Camera State
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);

  // Animation & Rendering Controls
  const [isPlaying, setIsPlaying] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [densityMode, setDensityMode] = useState<"dense" | "focused">("dense");
  const animFrameRef = useRef<number | null>(null);

  // Local mutable node/edge simulation state
  const simNodesRef = useRef<GraphNode[]>([]);
  const simEdgesRef = useRef<GraphEdge[]>([]);

  // Initialize and cluster nodes
  useEffect(() => {
    if (!rawNodes || rawNodes.length === 0) return;

    const existingMap = new Map<string, GraphNode>();
    simNodesRef.current.forEach(n => existingMap.set(n.id, n));

    const total = rawNodes.length;
    const center = { x: 0, y: 0 };

    const initializedNodes: GraphNode[] = rawNodes.map((n, idx) => {
      const existing = existingMap.get(n.id);
      if (existing) {
        return {
          ...n,
          x: existing.x,
          y: existing.y,
          vx: existing.vx,
          vy: existing.vy,
          radius: n.type === "target_entity" ? 28 : (n.type === "government_customer" || n.type === "core_platform" ? 20 : 16)
        };
      }

      // Clustered angular distribution
      const isTarget = n.type === "target_entity" || n.label.toLowerCase().includes("palantir");
      if (isTarget) {
        return {
          ...n,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          radius: 30
        };
      }

      // Assign sector angles
      let baseAngle = (idx / total) * Math.PI * 2;
      let dist = 180 + (idx % 3) * 60;

      if (n.type === "government_customer") { baseAngle = Math.PI * 1.1 + (idx % 4) * 0.25; dist = 220; }
      else if (n.type === "defense_contract") { baseAngle = Math.PI * 1.35 + (idx % 3) * 0.2; dist = 280; }
      else if (n.type === "cloud_infrastructure") { baseAngle = Math.PI * 0.25 + (idx % 4) * 0.2; dist = 240; }
      else if (n.type === "commercial_customer") { baseAngle = Math.PI * 0.65 + (idx % 4) * 0.25; dist = 260; }
      else if (n.type === "core_platform") { baseAngle = -Math.PI * 0.5 + (idx % 4) * 0.3; dist = 200; }
      else if (n.type === "competitor") { baseAngle = Math.PI * 0.05 + (idx % 3) * 0.25; dist = 290; }
      else if (n.type === "leadership") { baseAngle = Math.PI * 0.85 + (idx % 3) * 0.2; dist = 190; }

      return {
        ...n,
        x: Math.cos(baseAngle) * dist + (Math.random() - 0.5) * 30,
        y: Math.sin(baseAngle) * dist + (Math.random() - 0.5) * 30,
        vx: 0,
        vy: 0,
        radius: n.type === "core_platform" || n.type === "government_customer" ? 20 : 16
      };
    });

    const initializedEdges: GraphEdge[] = rawEdges.map(e => ({
      ...e,
      particles: [Math.random(), (Math.random() + 0.5) % 1]
    }));

    simNodesRef.current = initializedNodes;
    simEdgesRef.current = initializedEdges;
  }, [rawNodes, rawEdges]);

  // Connected Neighbor IDs for Hover/Select Highlights
  const activeHighlightedNeighborIds = useMemo(() => {
    const active = selectedNode || hoveredNode;
    if (!active) return null;

    const set = new Set<string>();
    set.add(active.id);

    simEdgesRef.current.forEach(e => {
      if (e.source === active.id) set.add(e.target);
      if (e.target === active.id) set.add(e.source);
    });

    return set;
  }, [selectedNode, hoveredNode]);

  // Main Canvas Render Loop with Physics Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Physics step
    const stepPhysics = () => {
      if (!isPlaying) return;
      const nodes = simNodesRef.current;
      const edges = simEdgesRef.current;
      const nodeCount = nodes.length;

      // 1. Repulsion between nodes (Coulomb)
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = (b.x || 0) - (a.x || 0);
          const dy = (b.y || 0) - (a.y || 0);
          const distSq = dx * dx + dy * dy + 0.01;
          const dist = Math.sqrt(distSq);

          if (dist < 320) {
            const force = (320 - dist) / dist * 0.06;
            if (!a.isDragging && a.type !== "target_entity") {
              a.vx = (a.vx || 0) - dx * force;
              a.vy = (a.vy || 0) - dy * force;
            }
            if (!b.isDragging && b.type !== "target_entity") {
              b.vx = (b.vx || 0) + dx * force;
              b.vy = (b.vy || 0) + dy * force;
            }
          }
        }
      }

      // 2. Spring attraction along edges (Hooke's Law)
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach(n => nodeMap.set(n.id, n));

      edges.forEach(e => {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        if (!src || !tgt) return;

        const dx = (tgt.x || 0) - (src.x || 0);
        const dy = (tgt.y || 0) - (src.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const targetDist = 180;
        const force = (dist - targetDist) * 0.003;

        if (!src.isDragging && src.type !== "target_entity") {
          src.vx = (src.vx || 0) + (dx / dist) * force * 15;
          src.vy = (src.vy || 0) + (dy / dist) * force * 15;
        }
        if (!tgt.isDragging && tgt.type !== "target_entity") {
          tgt.vx = (tgt.vx || 0) - (dx / dist) * force * 15;
          tgt.vy = (tgt.vy || 0) - (dy / dist) * force * 15;
        }

        // Advance edge photon particles
        if (e.particles) {
          e.particles = e.particles.map(p => (p + 0.006) % 1);
        }
      });

      // 3. Center gravity & velocity damping
      nodes.forEach(n => {
        if (n.type === "target_entity") {
          n.x = 0;
          n.y = 0;
          return;
        }
        if (n.isDragging) return;

        // Soft center gravity pull
        const distCenter = Math.sqrt((n.x || 0) * (n.x || 0) + (n.y || 0) * (n.y || 0));
        if (distCenter > 500) {
          n.vx = (n.vx || 0) - (n.x || 0) * 0.002;
          n.vy = (n.vy || 0) - (n.y || 0) * 0.002;
        }

        // Velocity damping
        n.vx = (n.vx || 0) * 0.88;
        n.vy = (n.vy || 0) * 0.88;
        n.x = (n.x || 0) + (n.vx || 0);
        n.y = (n.y || 0) + (n.vy || 0);
      });
    };

    // Render loop
    const render = () => {
      stepPhysics();

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Deep space grid background
      ctx.fillStyle = "#05070c";
      ctx.fillRect(0, 0, width, height);

      // Draw subtle coordinate grid
      ctx.save();
      ctx.strokeStyle = "rgba(14, 28, 48, 0.4)";
      ctx.lineWidth = 1;
      const gridSize = 60 * camera.zoom;
      const offsetX = (width / 2 + camera.x) % gridSize;
      const offsetY = (height / 2 + camera.y) % gridSize;

      for (let x = offsetX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // Camera transformation
      ctx.translate(width / 2 + camera.x, height / 2 + camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      const nodes = simNodesRef.current;
      const edges = simEdgesRef.current;
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach(n => nodeMap.set(n.id, n));

      const isNodeFiltered = (n: GraphNode) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match = n.label.toLowerCase().includes(q) || (n.type && n.type.toLowerCase().includes(q));
          if (!match) return false;
        }
        if (typeFilter && typeFilter !== "ALL") {
          return n.type?.toUpperCase() === typeFilter.toUpperCase();
        }
        return true;
      };

      // ---------------- 1. DRAW EDGES ----------------
      edges.forEach(e => {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        if (!src || !tgt) return;

        const isSrcActive = activeHighlightedNeighborIds?.has(src.id);
        const isTgtActive = activeHighlightedNeighborIds?.has(tgt.id);
        const isConnectedActive = isSrcActive && isTgtActive;

        const isEdgeSelected = selectedEdge?.id === e.id;
        const isDimmed = activeHighlightedNeighborIds && !isConnectedActive;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(src.x || 0, src.y || 0);
        ctx.lineTo(tgt.x || 0, tgt.y || 0);

        if (isEdgeSelected) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 12;
        } else if (isConnectedActive) {
          ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
          ctx.lineWidth = 1.8;
          ctx.shadowColor = "#0284c7";
          ctx.shadowBlur = 8;
        } else if (isDimmed) {
          ctx.strokeStyle = "rgba(14, 40, 68, 0.15)";
          ctx.lineWidth = 0.8;
        } else {
          // Luminous cyber cyan edge
          ctx.strokeStyle = "rgba(14, 165, 233, 0.32)";
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();
        ctx.restore();

        // Draw traveling photon particles on active or all edges
        if (isPlaying && (!isDimmed || isConnectedActive) && e.particles) {
          ctx.save();
          e.particles.forEach(t => {
            const px = (src.x || 0) + ((tgt.x || 0) - (src.x || 0)) * t;
            const py = (src.y || 0) + ((tgt.y || 0) - (src.y || 0)) * t;

            ctx.beginPath();
            ctx.arc(px, py, isConnectedActive ? 2.5 : 1.5, 0, Math.PI * 2);
            ctx.fillStyle = isConnectedActive ? "#38bdf8" : "rgba(56, 189, 248, 0.8)";
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 8;
            ctx.fill();
          });
          ctx.restore();
        }
      });

      // ---------------- 2. DRAW NODES ----------------
      nodes.forEach(n => {
        const passesFilter = isNodeFiltered(n);
        const isSelected = selectedNode?.id === n.id;
        const isHovered = hoveredNode?.id === n.id;
        const isNeighborActive = activeHighlightedNeighborIds?.has(n.id);
        const isDimmed = activeHighlightedNeighborIds && !isNeighborActive;
        const isAffectedByShock = affectedEntityNames.some(name => n.label.toLowerCase().includes(name.toLowerCase()));
        const isBeingInvestigated = investigatingEntityNames.some(name => n.label.toLowerCase().includes(name.toLowerCase()));

        const style = CATEGORY_COLORS[n.type || "default"] || CATEGORY_COLORS.default;
        const radius = n.radius || 18;
        const nx = n.x || 0;
        const ny = n.y || 0;

        ctx.save();

        if (isDimmed && !isSelected) {
          ctx.globalAlpha = 0.22;
        } else if (!passesFilter) {
          ctx.globalAlpha = 0.15;
        }

        // Draw Shock Warning Pulse Ring
        if (isAffectedByShock) {
          ctx.save();
          const pulse = (Date.now() % 1200) / 1200;
          ctx.beginPath();
          ctx.arc(nx, ny, radius + 10 + pulse * 14, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 158, 11, ${1 - pulse})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }

        // Draw Active Agent Investigating Scanner Ring
        if (isBeingInvestigated) {
          ctx.save();
          const pulse = (Date.now() % 1600) / 1600;
          ctx.beginPath();
          ctx.arc(nx, ny, radius + 6 + pulse * 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(6, 182, 212, ${1 - pulse})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }

        // Outer Glow Halo
        if (isSelected || isHovered || n.type === "target_entity") {
          ctx.save();
          ctx.beginPath();
          ctx.arc(nx, ny, radius + (isSelected ? 8 : 5), 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? "rgba(56, 189, 248, 0.2)" : "rgba(16, 185, 129, 0.15)";
          ctx.shadowColor = style.glow;
          ctx.shadowBlur = 24;
          ctx.fill();
          ctx.restore();
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        
        // Gradient fill
        const grad = ctx.createRadialGradient(nx, ny, 2, nx, ny, radius);
        grad.addColorStop(0, "#0c1322");
        grad.addColorStop(1, style.fill);
        ctx.fillStyle = grad;
        ctx.fill();

        // Stroke
        ctx.strokeStyle = isSelected ? "#38bdf8" : (isHovered ? "#67e8f9" : style.border);
        ctx.lineWidth = isSelected ? 2.5 : 1.8;
        ctx.stroke();

        // Core Hub Orbital Rings for Palantir (Target Entity)
        if (n.type === "target_entity") {
          ctx.save();
          ctx.beginPath();
          ctx.arc(nx, ny, radius + 7, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }

        // ---------------- 3. NODE LABELS (LOD) ----------------
        const shouldShowLabel = showLabels || isSelected || isHovered || isNeighborActive || n.type === "target_entity" || camera.zoom > 1.1;

        if (shouldShowLabel && passesFilter) {
          ctx.save();
          ctx.font = isSelected || n.type === "target_entity" ? "bold 11px system-ui" : "9px system-ui";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          // Text shadow backing for high contrast
          ctx.fillStyle = "#020617";
          ctx.shadowColor = "#020617";
          ctx.shadowBlur = 4;
          ctx.fillText(n.label, nx, ny + radius + 4);

          // Front crisp text
          ctx.fillStyle = isSelected ? "#38bdf8" : (isNeighborActive ? "#e0f2fe" : style.text);
          ctx.fillText(n.label, nx, ny + radius + 4);
          ctx.restore();
        }

        ctx.restore();
      });

      ctx.restore();

      // Request next frame
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [camera, isPlaying, showLabels, selectedNode, hoveredNode, selectedEdge, activeHighlightedNeighborIds, affectedEntityNames, investigatingEntityNames, searchQuery, typeFilter]);

  // Mouse Coordinate Translation to Simulation World Space
  const getSimCoordinates = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const cx = clientX - rect.left;
    const cy = clientY - rect.top;
    const width = canvas.width;
    const height = canvas.height;

    const simX = (cx - width / 2 - camera.x) / camera.zoom;
    const simY = (cy - height / 2 - camera.y) / camera.zoom;
    return { x: simX, y: simY };
  }, [camera]);

  // Find node under cursor
  const findNodeAt = useCallback((simX: number, simY: number) => {
    const nodes = simNodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = simX - (n.x || 0);
      const dy = simY - (n.y || 0);
      const radius = (n.radius || 18) + 4;
      if (dx * dx + dy * dy <= radius * radius) {
        return n;
      }
    }
    return null;
  }, []);

  // Mouse Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getSimCoordinates(e.clientX, e.clientY);
    const clickedNode = findNodeAt(x, y);

    if (clickedNode) {
      clickedNode.isDragging = true;
      setDraggedNode(clickedNode);
      onSelectNode(clickedNode);
      onSelectEdge(null);
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX - camera.x, y: e.clientY - camera.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setCamera(prev => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }));
      return;
    }

    const { x, y } = getSimCoordinates(e.clientX, e.clientY);

    if (draggedNode) {
      draggedNode.x = x;
      draggedNode.y = y;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
      return;
    }

    const nodeUnder = findNodeAt(x, y);
    setHoveredNode(nodeUnder);
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      draggedNode.isDragging = false;
      setDraggedNode(null);
    }
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.4, Math.min(prev.zoom * zoomFactor, 3.2))
    }));
  };

  const handleResetCamera = () => {
    setCamera({ x: 0, y: 0, zoom: 1 });
    onSelectNode(null);
    onSelectEdge(null);
  };

  const handleFitToScreen = () => {
    setCamera({ x: 0, y: 0, zoom: 0.85 });
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none bg-[#05070c]">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-full block ${isPanning ? "cursor-grabbing" : (hoveredNode ? "cursor-pointer" : "cursor-grab")}`}
      />

      {/* Floating HUD Controls (Bottom Right) */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center space-x-1.5 p-1.5 rounded-lg bg-[#0b1019]/90 border border-[#1e2a3b] backdrop-blur text-slate-300 shadow-2xl">
        <button
          onClick={() => setCamera(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 3.2) }))}
          className="p-1.5 rounded hover:bg-[#162030] hover:text-cyan-300 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setCamera(prev => ({ ...prev, zoom: Math.max(prev.zoom * 0.8, 0.4) }))}
          className="p-1.5 rounded hover:bg-[#162030] hover:text-cyan-300 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleFitToScreen}
          className="p-1.5 rounded hover:bg-[#162030] hover:text-cyan-300 transition-colors"
          title="Fit to Screen"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded hover:bg-[#162030] hover:text-cyan-300 transition-colors"
          title="Reset View"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <span className="w-px h-4 bg-[#1e2a3b]"></span>
        <button
          onClick={() => setIsPlaying(prev => !prev)}
          className={`p-1.5 rounded transition-colors ${isPlaying ? "text-cyan-400 hover:bg-[#162030]" : "text-slate-500 hover:text-slate-300"}`}
          title={isPlaying ? "Pause Physics Simulation" : "Resume Physics Simulation"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => setShowLabels(prev => !prev)}
          className={`p-1.5 rounded transition-colors ${showLabels ? "text-cyan-400 hover:bg-[#162030]" : "text-slate-500 hover:text-slate-300"}`}
          title={showLabels ? "Hide Node Labels (LOD)" : "Show All Node Labels"}
        >
          {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Floating Radar / Minimap Pill (Bottom Left) */}
      <div className="absolute bottom-5 left-5 z-20 p-2.5 rounded-lg bg-[#0b1019]/85 border border-[#1e2a3b] backdrop-blur shadow-2xl text-[10px] font-mono text-slate-400 flex items-center space-x-3">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-cyan-300 font-semibold uppercase tracking-wider">Living Network</span>
        </div>
        <span className="text-slate-600">|</span>
        <span>{rawNodes.length} Nodes</span>
        <span>•</span>
        <span>{rawEdges.length} Edges</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-500">Zoom: {(camera.zoom * 100).toFixed(0)}%</span>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredNode && !selectedNode && (
        <div 
          className="absolute z-30 pointer-events-none p-2.5 rounded bg-[#0b111a]/95 border border-cyan-500/40 text-xs text-slate-200 shadow-2xl backdrop-blur font-sans max-w-xs"
          style={{
            top: 20,
            left: 20
          }}
        >
          <div className="flex items-center justify-between text-[9px] font-mono uppercase text-cyan-400 mb-0.5">
            <span>{hoveredNode.type?.replace(/_/g, " ")}</span>
            <span>{hoveredNode.confidence ? `${(hoveredNode.confidence * 100).toFixed(0)}% Conf` : "Verified"}</span>
          </div>
          <div className="font-semibold text-slate-100 text-xs">{hoveredNode.label}</div>
          {hoveredNode.description && (
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 font-serif">{hoveredNode.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
