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
  Filter,
  Search,
  Layers,
  Network,
  CircleDot,
  Compass
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

// Institutional Category Palette: Restrained, High-Contrast, Professional
export const INSTITUTIONAL_CATEGORIES: Record<string, {
  label: string;
  fill: string;
  border: string;
  text: string;
  accent: string;
  description: string;
}> = {
  target_entity: {
    label: "Subject Entity",
    fill: "#1e2229",
    border: "#94a3b8",
    text: "#f8fafc",
    accent: "#cbd5e1",
    description: "Primary target under investigation (Palantir Technologies)"
  },
  government_customer: {
    label: "Sovereign / Defense Customer",
    fill: "#15202e",
    border: "#3b82f6",
    text: "#dbeafe",
    accent: "#60a5fa",
    description: "Federal, intelligence, and defense procurement accounts"
  },
  defense_contract: {
    label: "Defense Program / Contract",
    fill: "#1a1c30",
    border: "#6366f1",
    text: "#e0e7ff",
    accent: "#818cf8",
    description: "Formally appropriated defense software & hardware programs"
  },
  cloud_infrastructure: {
    label: "Cloud & Sovereign Infrastructure",
    fill: "#122627",
    border: "#14b8a6",
    text: "#ccfbf1",
    accent: "#2dd4bf",
    description: "IL-5/IL-6 compliant sovereign cloud deployment hosts"
  },
  commercial_customer: {
    label: "Commercial Enterprise Client",
    fill: "#12251e",
    border: "#10b981",
    text: "#d1fae5",
    accent: "#34d399",
    description: "Private sector enterprise customer cohorts"
  },
  core_platform: {
    label: "Core Software Platform",
    fill: "#221a30",
    border: "#8b5cf6",
    text: "#ede9fe",
    accent: "#a78bfa",
    description: "Proprietary software suites (AIP, Foundry, Gotham, Apollo)"
  },
  competitor: {
    label: "Market Competitor",
    fill: "#281e18",
    border: "#f59e0b",
    text: "#fef3c7",
    accent: "#fbbf24",
    description: "Direct enterprise data & analytics market rivals"
  },
  leadership: {
    label: "Key Executive / Director",
    fill: "#28171d",
    border: "#f43f5e",
    text: "#ffe4e6",
    accent: "#fb7185",
    description: "Executive leadership & founders with Class F voting shares"
  },
  regulatory_body: {
    label: "Regulatory & Oversight Body",
    fill: "#181d24",
    border: "#64748b",
    text: "#e2e8f0",
    accent: "#94a3b8",
    description: "Securities, defense compliance, and audit authorities"
  },
  default: {
    label: "Institutional Entity",
    fill: "#181b1f",
    border: "#4b5563",
    text: "#e5e7eb",
    accent: "#9ca3af",
    description: "General verified corporate or government entity"
  }
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

  // Camera & Interaction State
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);

  // Layout & Display Controls
  const [layoutMode, setLayoutMode] = useState<"force" | "radial" | "clustered">("force");
  const [isSimulating, setIsSimulating] = useState(true);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [selectedRelFilter, setSelectedRelFilter] = useState<string>("ALL");

  // Local mutable node/edge simulation state
  const simNodesRef = useRef<GraphNode[]>([]);
  const simEdgesRef = useRef<GraphEdge[]>([]);

  // Distinct relationship types extracted from rawEdges
  const relationshipTypes = useMemo(() => {
    const types = new Set<string>();
    rawEdges.forEach(e => {
      if (e.relationship) types.add(e.relationship);
    });
    return Array.from(types);
  }, [rawEdges]);

  // Compute degree map for node sizing
  const degreeMap = useMemo(() => {
    const map = new Map<string, number>();
    rawEdges.forEach(e => {
      map.set(e.source, (map.get(e.source) || 0) + 1);
      map.set(e.target, (map.get(e.target) || 0) + 1);
    });
    return map;
  }, [rawEdges]);

  // Initialize and lay out nodes
  useEffect(() => {
    if (!rawNodes || rawNodes.length === 0) return;

    const existingMap = new Map<string, GraphNode>();
    simNodesRef.current.forEach(n => existingMap.set(n.id, n));

    const total = rawNodes.length;

    const initializedNodes: GraphNode[] = rawNodes.map((n, idx) => {
      const existing = existingMap.get(n.id);
      const degree = degreeMap.get(n.id) || 1;
      const isTarget = n.type === "target_entity" || n.label.toLowerCase().includes("palantir");

      // Defensible radius based on connection degree and target status
      let radius = 13;
      if (isTarget) radius = 26;
      else if (degree >= 5) radius = 18;
      else if (degree >= 3) radius = 15;

      if (existing && layoutMode === "force") {
        return {
          ...n,
          x: existing.x,
          y: existing.y,
          vx: existing.vx,
          vy: existing.vy,
          radius
        };
      }

      // Compute initial positions based on layoutMode
      let x = 0;
      let y = 0;

      if (isTarget) {
        x = 0;
        y = 0;
      } else if (layoutMode === "radial") {
        // Concentric rings by category hierarchy
        let ringRadius = 240;
        let angleOffset = (idx / total) * Math.PI * 2;
        if (n.type === "core_platform") { ringRadius = 150; }
        else if (n.type === "government_customer" || n.type === "defense_contract") { ringRadius = 250; }
        else if (n.type === "commercial_customer") { ringRadius = 330; }
        else if (n.type === "cloud_infrastructure") { ringRadius = 390; }
        else if (n.type === "competitor") { ringRadius = 450; }
        else if (n.type === "leadership") { ringRadius = 190; }
        else if (n.type === "regulatory_body") { ringRadius = 300; }

        x = Math.cos(angleOffset) * ringRadius;
        y = Math.sin(angleOffset) * ringRadius;
      } else if (layoutMode === "clustered") {
        // Quadrant spatial domain clustering
        let cx = 0;
        let cy = 0;
        if (n.type === "government_customer" || n.type === "defense_contract") {
          cx = -260; cy = -180; // Top-Left: Defense & Sovereign
        } else if (n.type === "commercial_customer") {
          cx = 260; cy = -180; // Top-Right: Commercial Enterprise
        } else if (n.type === "cloud_infrastructure" || n.type === "core_platform") {
          cx = -260; cy = 180; // Bottom-Left: Infrastructure & Tech
        } else if (n.type === "competitor" || n.type === "leadership" || n.type === "regulatory_body") {
          cx = 260; cy = 180; // Bottom-Right: Market & Governance
        }
        const offsetAngle = (idx % 8) * (Math.PI / 4);
        const offsetDist = 50 + (idx % 3) * 35;
        x = cx + Math.cos(offsetAngle) * offsetDist;
        y = cy + Math.sin(offsetAngle) * offsetDist;
      } else {
        // Standard angular distribution for force layout
        const angle = (idx / total) * Math.PI * 2;
        const dist = 180 + (idx % 4) * 60;
        x = Math.cos(angle) * dist + (Math.random() - 0.5) * 20;
        y = Math.sin(angle) * dist + (Math.random() - 0.5) * 20;
      }

      return {
        ...n,
        x,
        y,
        vx: 0,
        vy: 0,
        radius
      };
    });

    simNodesRef.current = initializedNodes;
    simEdgesRef.current = rawEdges;
  }, [rawNodes, rawEdges, layoutMode, degreeMap]);

  // First-degree neighbor set for selected or hovered node
  const activeNeighborhood = useMemo(() => {
    const active = selectedNode || hoveredNode;
    if (!active) return null;

    const neighborIds = new Set<string>();
    const incidentEdgeIds = new Set<string>();

    neighborIds.add(active.id);

    simEdgesRef.current.forEach(e => {
      if (e.source === active.id) {
        neighborIds.add(e.target);
        incidentEdgeIds.add(e.id);
      }
      if (e.target === active.id) {
        neighborIds.add(e.source);
        incidentEdgeIds.add(e.id);
      }
    });

    return { neighborIds, incidentEdgeIds };
  }, [selectedNode, hoveredNode]);

  // Canvas Render Loop with Restrained Physics
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

    let animFrame: number;

    const stepPhysics = () => {
      if (!isSimulating || layoutMode !== "force") return;
      const nodes = simNodesRef.current;
      const edges = simEdgesRef.current;
      const nLen = nodes.length;

      // 1. Repulsion (Coulomb)
      for (let i = 0; i < nLen; i++) {
        for (let j = i + 1; j < nLen; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = (b.x || 0) - (a.x || 0);
          const dy = (b.y || 0) - (a.y || 0);
          const distSq = dx * dx + dy * dy + 0.01;
          const dist = Math.sqrt(distSq);

          if (dist < 280) {
            const force = (280 - dist) / dist * 0.045;
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

      // 2. Attraction along edges (Hooke)
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach(n => nodeMap.set(n.id, n));

      edges.forEach(e => {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        if (!src || !tgt) return;

        const dx = (tgt.x || 0) - (src.x || 0);
        const dy = (tgt.y || 0) - (src.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const targetDist = 170;
        const force = (dist - targetDist) * 0.0025;

        if (!src.isDragging && src.type !== "target_entity") {
          src.vx = (src.vx || 0) + (dx / dist) * force * 12;
          src.vy = (src.vy || 0) + (dy / dist) * force * 12;
        }
        if (!tgt.isDragging && tgt.type !== "target_entity") {
          tgt.vx = (tgt.vx || 0) - (dx / dist) * force * 12;
          tgt.vy = (tgt.vy || 0) - (dy / dist) * force * 12;
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

        const distCenter = Math.sqrt((n.x || 0) * (n.x || 0) + (n.y || 0) * (n.y || 0));
        if (distCenter > 480) {
          n.vx = (n.vx || 0) - (n.x || 0) * 0.0015;
          n.vy = (n.vy || 0) - (n.y || 0) * 0.0015;
        }

        n.vx = (n.vx || 0) * 0.86;
        n.vy = (n.vy || 0) * 0.86;
        n.x = (n.x || 0) + (n.vx || 0);
        n.y = (n.y || 0) + (n.vy || 0);
      });
    };

    const render = () => {
      stepPhysics();

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Graphite Foundation Background: #111315
      ctx.fillStyle = "#111315";
      ctx.fillRect(0, 0, width, height);

      // Subtle Coordinate Grid Matrix
      ctx.save();
      ctx.strokeStyle = "#1a1e24";
      ctx.lineWidth = 1;
      const gridSize = 48 * camera.zoom;
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

      const isNodeMatching = (n: GraphNode) => {
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

      const isEdgeMatching = (e: GraphEdge) => {
        if (selectedRelFilter && selectedRelFilter !== "ALL") {
          return e.relationship === selectedRelFilter;
        }
        return true;
      };

      // ---------------- 1. DRAW EDGES ----------------
      edges.forEach(e => {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        if (!src || !tgt) return;

        const passesRelFilter = isEdgeMatching(e);
        const isSrcActive = activeNeighborhood?.neighborIds.has(src.id);
        const isTgtActive = activeNeighborhood?.neighborIds.has(tgt.id);
        const isIncident = isSrcActive && isTgtActive;

        const isEdgeSelected = selectedEdge?.id === e.id;
        const isEdgeHovered = hoveredEdge?.id === e.id;
        const isDimmed = activeNeighborhood && !isIncident;

        const sx = src.x || 0;
        const sy = src.y || 0;
        const tx = tgt.x || 0;
        const ty = tgt.y || 0;

        ctx.save();

        if (!passesRelFilter) {
          ctx.globalAlpha = 0.08;
        } else if (isDimmed) {
          ctx.globalAlpha = 0.12;
        }

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);

        // Edge styling: restrained strokes without neon glow
        if (isEdgeSelected) {
          ctx.strokeStyle = "#3b82f6"; // Primary blue
          ctx.lineWidth = 2.4;
        } else if (isEdgeHovered) {
          ctx.strokeStyle = "#60a5fa";
          ctx.lineWidth = 2.0;
        } else if (isIncident) {
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1.6;
        } else {
          ctx.strokeStyle = "#272e38"; // Subtle graphite stroke
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();

        // Directional Arrow Indicator
        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 40 && passesRelFilter) {
          const targetRadius = tgt.radius || 14;
          const arrowOffset = targetRadius + 6;
          const ax = tx - (dx / dist) * arrowOffset;
          const ay = ty - (dy / dist) * arrowOffset;

          const arrowLen = isIncident || isEdgeSelected ? 7 : 5;
          const angle = Math.atan2(dy, dx);

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(
            ax - arrowLen * Math.cos(angle - Math.PI / 6),
            ay - arrowLen * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            ax - arrowLen * Math.cos(angle + Math.PI / 6),
            ay - arrowLen * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = isEdgeSelected ? "#3b82f6" : (isIncident ? "#64748b" : "#374151");
          ctx.fill();
        }

        // Relationship label pill (visible on zoom > 1.15 or when active/selected)
        const shouldShowEdgeLabel = showEdgeLabels && passesRelFilter && (
          isEdgeSelected || isEdgeHovered || isIncident || camera.zoom > 1.2
        );

        if (shouldShowEdgeLabel) {
          const midX = (sx + tx) / 2;
          const midY = (sy + ty) / 2;
          const relText = e.relationship.replace(/_/g, " ");

          ctx.font = "500 8.5px Inter, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const textMetrics = ctx.measureText(relText);
          const padX = 5;
          const padY = 2.5;

          ctx.fillStyle = isEdgeSelected ? "#1e293b" : "#181b1f";
          ctx.fillRect(
            midX - textMetrics.width / 2 - padX,
            midY - 6 - padY,
            textMetrics.width + padX * 2,
            12 + padY * 2
          );

          ctx.strokeStyle = isEdgeSelected ? "#3b82f6" : "#30353c";
          ctx.lineWidth = 1;
          ctx.strokeRect(
            midX - textMetrics.width / 2 - padX,
            midY - 6 - padY,
            textMetrics.width + padX * 2,
            12 + padY * 2
          );

          ctx.fillStyle = isEdgeSelected ? "#93c5fd" : "#94a3b8";
          ctx.fillText(relText, midX, midY);
        }

        ctx.restore();
      });

      // ---------------- 2. DRAW NODES ----------------
      nodes.forEach(n => {
        const passesFilter = isNodeMatching(n);
        const isSelected = selectedNode?.id === n.id;
        const isHovered = hoveredNode?.id === n.id;
        const isNeighbor = activeNeighborhood?.neighborIds.has(n.id);
        const isDimmed = activeNeighborhood && !isNeighbor;
        const isAffectedByShock = affectedEntityNames.some(name => n.label.toLowerCase().includes(name.toLowerCase()));

        const cat = INSTITUTIONAL_CATEGORIES[n.type || "default"] || INSTITUTIONAL_CATEGORIES.default;
        const radius = n.radius || 14;
        const nx = n.x || 0;
        const ny = n.y || 0;

        ctx.save();

        if (!passesFilter) {
          ctx.globalAlpha = 0.12;
        } else if (isDimmed && !isSelected) {
          ctx.globalAlpha = 0.15;
        }

        // Shock Impact State (Subtle warning ring, non-distracting)
        if (isAffectedByShock) {
          ctx.beginPath();
          ctx.arc(nx, ny, radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "#f59e0b"; // Institutional amber
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Selection Ring (Solid technical double ring, zero glow)
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(nx, ny, radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2.0;
          ctx.stroke();
        } else if (isHovered) {
          ctx.beginPath();
          ctx.arc(nx, ny, radius + 3, 0, Math.PI * 2);
          ctx.strokeStyle = "#64748b";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Main Node Body (Solid elevated graphite fill + category border)
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fillStyle = cat.fill;
        ctx.fill();

        ctx.strokeStyle = isSelected ? "#3b82f6" : cat.border;
        ctx.lineWidth = isSelected ? 2.0 : (n.type === "target_entity" ? 2.2 : 1.5);
        ctx.stroke();

        // Target Entity Center Monogram or Category Badge inside Node
        if (n.type === "target_entity") {
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#f8fafc";
          ctx.fillText("PLTR", nx, ny);
        } else if (radius >= 16) {
          const initials = n.label
            .split(" ")
            .map(w => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          ctx.font = "600 8.5px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = cat.accent;
          ctx.fillText(initials, nx, ny);
        } else {
          // Small technical center dot
          ctx.beginPath();
          ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = cat.accent;
          ctx.fill();
        }

        // ---------------- 3. LABELS (Level of Detail) ----------------
        const shouldShowLabel = isSelected || isHovered || isNeighbor || n.type === "target_entity" || camera.zoom > 0.95;

        if (shouldShowLabel && passesFilter) {
          ctx.font = isSelected || n.type === "target_entity" 
            ? "600 11px Inter, -apple-system, sans-serif" 
            : "500 9.5px Inter, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          const labelY = ny + radius + 4;
          const textMetrics = ctx.measureText(n.label);
          const bgPadX = 4;
          const bgPadY = 1.5;

          // Legible background backing
          ctx.fillStyle = "rgba(17, 19, 21, 0.92)";
          ctx.fillRect(
            nx - textMetrics.width / 2 - bgPadX,
            labelY - bgPadY,
            textMetrics.width + bgPadX * 2,
            12 + bgPadY * 2
          );

          if (isSelected) {
            ctx.fillStyle = "#ffffff";
          } else if (isNeighbor) {
            ctx.fillStyle = "#e2e8f0";
          } else {
            ctx.fillStyle = "#cbd5e1";
          }
          ctx.fillText(n.label, nx, labelY);
        }

        ctx.restore();
      });

      // ---------------- 4. RADAR MINIMAP ----------------
      ctx.restore(); // Exit camera coordinates to render HUD overlay

      const minimapW = 120;
      const minimapH = 80;
      const minimapX = width - minimapW - 16;
      const minimapY = height - minimapH - 16;

      ctx.save();
      ctx.fillStyle = "#181b1f";
      ctx.strokeStyle = "#30353c";
      ctx.lineWidth = 1;
      ctx.fillRect(minimapX, minimapY, minimapW, minimapH);
      ctx.strokeRect(minimapX, minimapY, minimapW, minimapH);

      // Radar dots
      const scale = 0.08;
      const mmCenterX = minimapX + minimapW / 2;
      const mmCenterY = minimapY + minimapH / 2;

      nodes.forEach(n => {
        const mx = mmCenterX + (n.x || 0) * scale;
        const my = mmCenterY + (n.y || 0) * scale;
        if (mx >= minimapX && mx <= minimapX + minimapW && my >= minimapY && my <= minimapY + minimapH) {
          ctx.beginPath();
          ctx.arc(mx, my, n.type === "target_entity" ? 2.5 : 1.2, 0, Math.PI * 2);
          ctx.fillStyle = n.id === selectedNode?.id ? "#3b82f6" : "#64748b";
          ctx.fill();
        }
      });

      // Viewport bounds rectangle on minimap
      const vpW = (width / camera.zoom) * scale;
      const vpH = (height / camera.zoom) * scale;
      const vpX = mmCenterX - (camera.x / camera.zoom) * scale - vpW / 2;
      const vpY = mmCenterY - (camera.y / camera.zoom) * scale - vpH / 2;

      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 1;
      ctx.strokeRect(vpX, vpY, vpW, vpH);

      ctx.restore();

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", handleResize);
    };
  }, [
    camera,
    isSimulating,
    layoutMode,
    selectedNode,
    hoveredNode,
    selectedEdge,
    hoveredEdge,
    activeNeighborhood,
    affectedEntityNames,
    searchQuery,
    typeFilter,
    selectedRelFilter,
    showEdgeLabels
  ]);

  // Coordinate Conversion Helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { worldX: 0, worldY: 0, clientX: 0, clientY: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;

    const worldX = (clientX - width / 2 - camera.x) / camera.zoom;
    const worldY = (clientY - height / 2 - camera.y) / camera.zoom;

    return { worldX, worldY, clientX, clientY };
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { worldX, worldY, clientX, clientY } = getCanvasCoords(e);

    // Check if clicked a node
    const nodes = simNodesRef.current;
    let hitNode: GraphNode | null = null;

    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = worldX - (n.x || 0);
      const dy = worldY - (n.y || 0);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= (n.radius || 14) + 4) {
        hitNode = n;
        break;
      }
    }

    if (hitNode) {
      hitNode.isDragging = true;
      setDraggedNode(hitNode);
      onSelectNode(hitNode);
      onSelectEdge(null);
      return;
    }

    // Check if clicked an edge
    const edges = simEdgesRef.current;
    const nodeMap = new Map<string, GraphNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));

    let hitEdge: GraphEdge | null = null;
    for (const edge of edges) {
      const src = nodeMap.get(edge.source);
      const tgt = nodeMap.get(edge.target);
      if (!src || !tgt) continue;

      const sx = src.x || 0;
      const sy = src.y || 0;
      const tx = tgt.x || 0;
      const ty = tgt.y || 0;

      // Distance from point to line segment
      const dx = tx - sx;
      const dy = ty - sy;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;

      const t = Math.max(0, Math.min(1, ((worldX - sx) * dx + (worldY - sy) * dy) / lenSq));
      const projX = sx + t * dx;
      const projY = sy + t * dy;
      const distToLine = Math.sqrt((worldX - projX) * (worldX - projX) + (worldY - projY) * (worldY - projY));

      if (distToLine < 8) {
        hitEdge = edge;
        break;
      }
    }

    if (hitEdge) {
      onSelectEdge(hitEdge);
      onSelectNode(null);
      return;
    }

    // Otherwise start panning
    setIsPanning(true);
    setPanStart({ x: clientX - camera.x, y: clientY - camera.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { worldX, worldY, clientX, clientY } = getCanvasCoords(e);

    if (draggedNode) {
      draggedNode.x = worldX;
      draggedNode.y = worldY;
      draggedNode.vx = 0;
      draggedNode.vy = 0;
      return;
    }

    if (isPanning) {
      setCamera(prev => ({
        ...prev,
        x: clientX - panStart.x,
        y: clientY - panStart.y
      }));
      return;
    }

    // Hover detection
    const nodes = simNodesRef.current;
    let hitNode: GraphNode | null = null;

    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = worldX - (n.x || 0);
      const dy = worldY - (n.y || 0);
      if (Math.sqrt(dx * dx + dy * dy) <= (n.radius || 14) + 4) {
        hitNode = n;
        break;
      }
    }

    setHoveredNode(hitNode);

    if (!hitNode) {
      const edges = simEdgesRef.current;
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach(n => nodeMap.set(n.id, n));

      let hitEdge: GraphEdge | null = null;
      for (const edge of edges) {
        const src = nodeMap.get(edge.source);
        const tgt = nodeMap.get(edge.target);
        if (!src || !tgt) continue;

        const sx = src.x || 0;
        const sy = src.y || 0;
        const tx = tgt.x || 0;
        const ty = tgt.y || 0;

        const dx = tx - sx;
        const dy = ty - sy;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) continue;

        const t = Math.max(0, Math.min(1, ((worldX - sx) * dx + (worldY - sy) * dy) / lenSq));
        const projX = sx + t * dx;
        const projY = sy + t * dy;
        const distToLine = Math.sqrt((worldX - projX) * (worldX - projX) + (worldY - projY) * (worldY - projY));

        if (distToLine < 8) {
          hitEdge = edge;
          break;
        }
      }
      setHoveredEdge(hitEdge);
    } else {
      setHoveredEdge(null);
    }
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
      zoom: Math.max(0.3, Math.min(3.2, prev.zoom * zoomFactor))
    }));
  };

  const resetView = () => {
    setCamera({ x: 0, y: 0, zoom: 1 });
    onSelectNode(null);
    onSelectEdge(null);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col bg-[#111315] select-none overflow-hidden">
      {/* Top Workstation Graph Toolbar */}
      <div className="h-10 px-4 bg-[#181b1f] border-b border-[#30353c] flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-[#a0a7b1] font-medium">
            <Network className="w-3.5 h-3.5 text-[#3b82f6]" />
            <span>Corporate Intelligence Graph</span>
          </div>

          <div className="h-3.5 w-px bg-[#30353c]"></div>

          {/* Layout Mode Selector */}
          <div className="flex items-center space-x-1 bg-[#111315] p-0.5 rounded border border-[#30353c] text-[11px]">
            <button
              onClick={() => setLayoutMode("force")}
              className={`px-2 py-0.5 rounded transition-colors ${
                layoutMode === "force"
                  ? "bg-[#20242a] text-[#f8fafc] font-medium"
                  : "text-[#a0a7b1] hover:text-[#e5e7eb]"
              }`}
            >
              Force-Relaxed
            </button>
            <button
              onClick={() => setLayoutMode("radial")}
              className={`px-2 py-0.5 rounded transition-colors ${
                layoutMode === "radial"
                  ? "bg-[#20242a] text-[#f8fafc] font-medium"
                  : "text-[#a0a7b1] hover:text-[#e5e7eb]"
              }`}
            >
              Radial Hierarchy
            </button>
            <button
              onClick={() => setLayoutMode("clustered")}
              className={`px-2 py-0.5 rounded transition-colors ${
                layoutMode === "clustered"
                  ? "bg-[#20242a] text-[#f8fafc] font-medium"
                  : "text-[#a0a7b1] hover:text-[#e5e7eb]"
              }`}
            >
              Domain Clusters
            </button>
          </div>

          {/* Relationship Filter */}
          {relationshipTypes.length > 0 && (
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-[#a0a7b1]">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#737c88]">Link:</span>
              <select
                value={selectedRelFilter}
                onChange={(e) => setSelectedRelFilter(e.target.value)}
                className="bg-[#111315] border border-[#30353c] text-[11px] text-[#e5e7eb] rounded px-2 py-0.5 focus:outline-none focus:border-[#3b82f6]"
              >
                <option value="ALL">All Relationships ({rawEdges.length})</option>
                {relationshipTypes.map(r => (
                  <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Viewport & Render Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowEdgeLabels(prev => !prev)}
            title={showEdgeLabels ? "Hide edge labels" : "Show edge labels"}
            className={`p-1.5 rounded border transition-colors ${
              showEdgeLabels
                ? "bg-[#20242a] text-[#3b82f6] border-[#30353c]"
                : "bg-[#111315] text-[#737c88] border-[#30353c] hover:text-[#e5e7eb]"
            }`}
          >
            {showEdgeLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsSimulating(prev => !prev)}
            title={isSimulating ? "Freeze physics simulation" : "Resume physics simulation"}
            className={`p-1.5 rounded border transition-colors ${
              isSimulating
                ? "bg-[#20242a] text-[#10b981] border-[#30353c]"
                : "bg-[#111315] text-[#737c88] border-[#30353c] hover:text-[#e5e7eb]"
            }`}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setCamera(prev => ({ ...prev, zoom: Math.min(3.2, prev.zoom * 1.2) }))}
            className="p-1.5 rounded bg-[#111315] hover:bg-[#20242a] text-[#a0a7b1] hover:text-[#e5e7eb] border border-[#30353c] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCamera(prev => ({ ...prev, zoom: Math.max(0.3, prev.zoom * 0.8) }))}
            className="p-1.5 rounded bg-[#111315] hover:bg-[#20242a] text-[#a0a7b1] hover:text-[#e5e7eb] border border-[#30353c] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded bg-[#111315] hover:bg-[#20242a] text-[#a0a7b1] hover:text-[#e5e7eb] border border-[#30353c] transition-colors"
            title="Reset to Center View"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive HTML5 Canvas */}
      <div className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Floating Technical Stats Overlay */}
        <div className="absolute top-3 left-3 px-2.5 py-1.5 rounded bg-[#181b1f]/90 border border-[#30353c] backdrop-blur text-[10px] font-mono text-[#737c88] pointer-events-none space-x-3 flex items-center">
          <span>ENTITIES: <strong className="text-[#e5e7eb] font-sans">{rawNodes.length}</strong></span>
          <span>LINKS: <strong className="text-[#e5e7eb] font-sans">{rawEdges.length}</strong></span>
          <span>ZOOM: <strong className="text-[#e5e7eb] font-sans">{(camera.zoom * 100).toFixed(0)}%</strong></span>
          {selectedNode && (
            <span className="text-[#3b82f6]">ACTIVE: <strong className="text-[#f8fafc] font-sans">{selectedNode.label}</strong></span>
          )}
        </div>
      </div>

      {/* Bottom Institutional Legend Bar */}
      <div className="px-4 py-2 bg-[#181b1f] border-t border-[#30353c] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#a0a7b1]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#737c88]">Legend:</span>
        {Object.entries(INSTITUTIONAL_CATEGORIES).map(([key, cat]) => {
          if (key === "default") return null;
          return (
            <div key={key} className="flex items-center space-x-1.5" title={cat.description}>
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: cat.fill, border: `1.5px solid ${cat.border}` }}
              />
              <span className="text-[10.5px] text-[#a0a7b1]">{cat.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
