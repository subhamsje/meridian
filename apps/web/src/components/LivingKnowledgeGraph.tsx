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
  Compass,
  X,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldCheck,
  Activity
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
  showInternalInspector?: boolean;
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
    label: "Subject Entity (PLTR)",
    fill: "#1e2430",
    border: "#3b82f6",
    text: "#ffffff",
    accent: "#60a5fa",
    description: "Primary corporate target under forensic research investigation"
  },
  government_customer: {
    label: "Sovereign / Defense Customer",
    fill: "#15202b",
    border: "#2563eb",
    text: "#93c5fd",
    accent: "#3b82f6",
    description: "National security, intelligence, and defense procurement authorities"
  },
  defense_contract: {
    label: "Defense Program / Contract",
    fill: "#1a1c2e",
    border: "#4f46e5",
    text: "#c7d2fe",
    accent: "#6366f1",
    description: "Government military and modernization programs (TITAN, Maven, Army Vantage)"
  },
  cloud_infrastructure: {
    label: "Cloud & Sovereign Infra",
    fill: "#112624",
    border: "#0d9488",
    text: "#99f6e4",
    accent: "#14b8a6",
    description: "Hyperscale cloud partners hosting classified sovereign compute"
  },
  commercial_customer: {
    label: "Commercial Enterprise Client",
    fill: "#14231b",
    border: "#059669",
    text: "#a7f3d0",
    accent: "#10b981",
    description: "Fortune 500 enterprise customers deploying Foundry/AIP platforms"
  },
  core_platform: {
    label: "Core Software Platform",
    fill: "#291f16",
    border: "#d97706",
    text: "#fde68a",
    accent: "#f59e0b",
    description: "Proprietary software architectures (Foundry, Gotham, Apollo, AIP)"
  },
  competitor: {
    label: "Market Competitor",
    fill: "#28171a",
    border: "#dc2626",
    text: "#fecaca",
    accent: "#ef4444",
    description: "Enterprise software, defense analytics, or hyperscaler cloud competition"
  },
  leadership: {
    label: "Executive Leadership",
    fill: "#281726",
    border: "#db2777",
    text: "#fbcfe8",
    accent: "#ec4899",
    description: "Named executive officers, founders, and governance directors"
  },
  regulatory_body: {
    label: "Regulatory Oversight Body",
    fill: "#221c2b",
    border: "#7c3aed",
    text: "#ddd6fe",
    accent: "#8b5cf6",
    description: "Securities, audit, defense procurement, or antitrust regulatory agencies"
  },
  default: {
    label: "Corporate Connection",
    fill: "#1a1e24",
    border: "#475569",
    text: "#cbd5e1",
    accent: "#64748b",
    description: "Associated institutional entity or transaction counterpart"
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
  typeFilter = "ALL",
  showInternalInspector = false
}: LivingKnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Camera & Interaction State
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 0.9 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<GraphEdge | null>(null);
  const [draggedNode, setDraggedNode] = useState<GraphNode | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);
  const [layoutMode, setLayoutMode] = useState<"force" | "radial" | "clustered">("force");
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);
  const [selectedRelFilter, setSelectedRelFilter] = useState<string>("ALL");
  const [hasAutoFramed, setHasAutoFramed] = useState(false);

  // Compute node connection degrees
  const degreeMap = useMemo(() => {
    const map = new Map<string, number>();
    rawEdges.forEach(e => {
      map.set(e.source, (map.get(e.source) || 0) + 1);
      map.set(e.target, (map.get(e.target) || 0) + 1);
    });
    return map;
  }, [rawEdges]);

  // Local mutable node/edge simulation state
  const simNodesRef = useRef<GraphNode[]>([]);
  const simEdgesRef = useRef<GraphEdge[]>([]);

  // Distinct relationship types extracted from rawEdges
  const relationshipTypes = useMemo(() => {
    const types = new Set<string>();
    rawEdges.forEach(e => {
      if (e.relationship) types.add(e.relationship);
    });
    return Array.from(types).sort();
  }, [rawEdges]);

  // Fit to View Calculation
  const fitToView = useCallback((customNodes?: GraphNode[]) => {
    const nodes = customNodes || simNodesRef.current;
    if (!nodes || nodes.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const width = canvas.width || 800;
    const height = canvas.height || 600;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      const r = n.radius || 16;
      const x = n.x ?? 0;
      const y = n.y ?? 0;
      if (x - r < minX) minX = x - r;
      if (x + r > maxX) maxX = x + r;
      if (y - r < minY) minY = y - r;
      if (y + r > maxY) maxY = y + r;
    });

    if (!isFinite(minX) || !isFinite(maxX)) return;

    const spanX = Math.max(120, maxX - minX);
    const spanY = Math.max(120, maxY - minY);
    const padding = 70;

    const zoomX = (width - padding * 2) / spanX;
    const zoomY = (height - padding * 2) / spanY;
    const optimalZoom = Math.max(0.45, Math.min(1.2, Math.min(zoomX, zoomY)));

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    setCamera({
      x: -midX * optimalZoom,
      y: -midY * optimalZoom,
      zoom: optimalZoom
    });
  }, []);

  // Center camera on a specific node
  const centerOnNode = useCallback((node: GraphNode) => {
    const simNode = simNodesRef.current.find(n => n.id === node.id) || node;
    const targetZoom = Math.max(camera.zoom, 1.1);
    if (simNode.x !== undefined && simNode.y !== undefined) {
      setCamera({ 
        x: -simNode.x * targetZoom, 
        y: -simNode.y * targetZoom, 
        zoom: targetZoom 
      });
    }
    onSelectNode(node);
    onSelectEdge(null);
  }, [camera.zoom, onSelectNode, onSelectEdge]);

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
      let radius = 12;
      if (isTarget) radius = 24;
      else if (degree >= 5) radius = 17;
      else if (degree >= 3) radius = 14;

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
        let ringRadius = 180;
        let angleOffset = (idx / total) * Math.PI * 2;
        if (n.type === "core_platform") { ringRadius = 120; }
        else if (n.type === "government_customer" || n.type === "defense_contract") { ringRadius = 190; }
        else if (n.type === "commercial_customer") { ringRadius = 260; }
        else if (n.type === "cloud_infrastructure") { ringRadius = 310; }
        else if (n.type === "competitor") { ringRadius = 360; }
        else if (n.type === "leadership") { ringRadius = 150; }
        else if (n.type === "regulatory_body") { ringRadius = 240; }

        x = Math.cos(angleOffset) * ringRadius;
        y = Math.sin(angleOffset) * ringRadius;
      } else if (layoutMode === "clustered") {
        let cx = 0;
        let cy = 0;
        if (n.type === "government_customer" || n.type === "defense_contract") {
          cx = -180; cy = -130; // Defense & Sovereign
        } else if (n.type === "commercial_customer") {
          cx = 180; cy = -130; // Commercial Enterprise
        } else if (n.type === "cloud_infrastructure" || n.type === "core_platform") {
          cx = -180; cy = 130; // Infrastructure & Tech
        } else if (n.type === "competitor" || n.type === "leadership" || n.type === "regulatory_body") {
          cx = 180; cy = 130; // Market & Governance
        }
        const offsetAngle = (idx % 8) * (Math.PI / 4);
        const offsetDist = 35 + (idx % 3) * 25;
        x = cx + Math.cos(offsetAngle) * offsetDist;
        y = cy + Math.sin(offsetAngle) * offsetDist;
      } else {
        // Compact angular distribution for force layout
        const angle = (idx / total) * Math.PI * 2;
        const dist = 140 + (idx % 4) * 45;
        x = Math.cos(angle) * dist + (Math.random() - 0.5) * 15;
        y = Math.sin(angle) * dist + (Math.random() - 0.5) * 15;
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

    if (!hasAutoFramed) {
      fitToView(initializedNodes);
      setHasAutoFramed(true);
    }
  }, [rawNodes, rawEdges, layoutMode, degreeMap, hasAutoFramed, fitToView]);

  // First-degree neighbor set for selected or hovered node
  const activeNeighborhood = useMemo(() => {
    const focusNode = hoveredNode || selectedNode;
    if (!focusNode) return null;

    const neighborIds = new Set<string>();
    const incidentEdgeIds = new Set<string>();

    neighborIds.add(focusNode.id);

    simEdgesRef.current.forEach(e => {
      if (e.source === focusNode.id) {
        neighborIds.add(e.target);
        incidentEdgeIds.add(e.id);
      } else if (e.target === focusNode.id) {
        neighborIds.add(e.source);
        incidentEdgeIds.add(e.id);
      }
    });

    return { neighborIds, incidentEdgeIds };
  }, [selectedNode, hoveredNode]);

  // Native non-passive Wheel Event Isolation (Prevents window scrolling & zooms towards cursor)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      const mouseScreenX = e.clientX - rect.left - rect.width / 2;
      const mouseScreenY = e.clientY - rect.top - rect.height / 2;

      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;

      setCamera(prev => {
        const newZoom = Math.max(0.35, Math.min(2.4, prev.zoom * zoomFactor));
        const scaleChange = newZoom / prev.zoom;
        const newX = mouseScreenX - (mouseScreenX - prev.x) * scaleChange;
        const newY = mouseScreenY - (mouseScreenY - prev.y) * scaleChange;
        return { x: newX, y: newY, zoom: newZoom };
      });
    };

    container.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheelNative);
    };
  }, []);

  // Canvas Render Loop with Restrained Physics & ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          canvas.width = newWidth;
          canvas.height = newHeight;
          width = newWidth;
          height = newHeight;
        }
      }
    });

    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    let animFrame: number;

    const stepPhysics = () => {
      if (!isSimulating || layoutMode !== "force") return;
      const nodes = simNodesRef.current;
      const edges = simEdgesRef.current;
      const nLen = nodes.length;

      // 1. Repulsion (Coulomb) - Bounded
      for (let i = 0; i < nLen; i++) {
        for (let j = i + 1; j < nLen; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = (b.x || 0) - (a.x || 0);
          const dy = (b.y || 0) - (a.y || 0);
          const distSq = dx * dx + dy * dy + 0.01;
          const dist = Math.sqrt(distSq);

          if (dist < 200) {
            const force = (200 - dist) / dist * 0.035;
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

      // 2. Attraction along edges (Hooke) - Bounded
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach(n => nodeMap.set(n.id, n));

      edges.forEach(e => {
        const src = nodeMap.get(e.source);
        const tgt = nodeMap.get(e.target);
        if (!src || !tgt) return;

        const dx = (tgt.x || 0) - (src.x || 0);
        const dy = (tgt.y || 0) - (src.y || 0);
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const targetDist = 120;
        const force = (dist - targetDist) * 0.003;

        if (!src.isDragging && src.type !== "target_entity") {
          src.vx = (src.vx || 0) + (dx / dist) * force * 10;
          src.vy = (src.vy || 0) + (dy / dist) * force * 10;
        }
        if (!tgt.isDragging && tgt.type !== "target_entity") {
          tgt.vx = (tgt.vx || 0) - (dx / dist) * force * 10;
          tgt.vy = (tgt.vy || 0) - (dy / dist) * force * 10;
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
        if (distCenter > 240) {
          n.vx = (n.vx || 0) - (n.x || 0) * 0.002;
          n.vy = (n.vy || 0) - (n.y || 0) * 0.002;
        }

        n.vx = (n.vx || 0) * 0.85;
        n.vy = (n.vy || 0) * 0.85;
        n.x = (n.x || 0) + (n.vx || 0);
        n.y = (n.y || 0) + (n.vy || 0);
      });
    };

    const render = () => {
      stepPhysics();

      ctx.clearRect(0, 0, width, height);

      // Deep Dark Workstation Canvas Background
      ctx.fillStyle = "#0d0f12";
      ctx.fillRect(0, 0, width, height);

      // Subtle Precision Coordinate Grid
      ctx.save();
      ctx.strokeStyle = "#16191e";
      ctx.lineWidth = 1;
      const gridSize = 40 * camera.zoom;
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
      ctx.save();
      ctx.translate(width / 2 + camera.x, height / 2 + camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      const nodes = simNodesRef.current;
      const edges = simEdgesRef.current;
      const nodeMap = new Map<string, GraphNode>();
      nodes.forEach(n => nodeMap.set(n.id, n));

      const isNodeMatching = (n: GraphNode) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches = n.label.toLowerCase().includes(q) || 
                          (n.ticker && n.ticker.toLowerCase().includes(q)) ||
                          (n.description && n.description.toLowerCase().includes(q));
          if (!matches) return false;
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

      // ---------------- LEVEL OF DETAIL 1: CLUSTER REGIONS (Far Zoom < 0.7) ----------------
      if (camera.zoom < 0.72) {
        ctx.save();
        const clusters: Record<string, { label: string; color: string; xs: number[]; ys: number[] }> = {
          defense: { label: "Sovereign & Defense", color: "rgba(37, 99, 235, 0.06)", xs: [], ys: [] },
          commercial: { label: "Commercial Enterprise", color: "rgba(16, 185, 129, 0.06)", xs: [], ys: [] },
          infra: { label: "Cloud & Sovereign Infra", color: "rgba(20, 184, 166, 0.06)", xs: [], ys: [] },
          market: { label: "Competitors & Leadership", color: "rgba(239, 68, 68, 0.06)", xs: [], ys: [] }
        };

        nodes.forEach(n => {
          let cKey = "commercial";
          if (n.type === "government_customer" || n.type === "defense_contract") cKey = "defense";
          else if (n.type === "cloud_infrastructure" || n.type === "core_platform") cKey = "infra";
          else if (n.type === "competitor" || n.type === "leadership" || n.type === "regulatory_body") cKey = "market";
          
          if (n.type !== "target_entity") {
            clusters[cKey].xs.push(n.x || 0);
            clusters[cKey].ys.push(n.y || 0);
          }
        });

        Object.values(clusters).forEach(cl => {
          if (cl.xs.length >= 2) {
            const avgX = cl.xs.reduce((a, b) => a + b, 0) / cl.xs.length;
            const avgY = cl.ys.reduce((a, b) => a + b, 0) / cl.ys.length;
            let maxR = 60;
            for (let i = 0; i < cl.xs.length; i++) {
              const d = Math.sqrt((cl.xs[i] - avgX) ** 2 + (cl.ys[i] - avgY) ** 2);
              if (d + 35 > maxR) maxR = d + 35;
            }

            ctx.beginPath();
            ctx.arc(avgX, avgY, maxR, 0, Math.PI * 2);
            ctx.fillStyle = cl.color;
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
            ctx.stroke();

            ctx.font = "600 11px Inter, sans-serif";
            ctx.fillStyle = "rgba(160, 167, 177, 0.4)";
            ctx.textAlign = "center";
            ctx.fillText(cl.label.toUpperCase(), avgX, avgY - maxR + 16);
          }
        });
        ctx.restore();
      }

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

        if (isEdgeSelected) {
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 2.4;
        } else if (isEdgeHovered) {
          ctx.strokeStyle = "#60a5fa";
          ctx.lineWidth = 2.0;
        } else if (isIncident) {
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1.6;
        } else {
          ctx.strokeStyle = "#272e38";
          ctx.lineWidth = 1.0;
        }
        ctx.stroke();

        // Directional Arrow Indicator
        const dx = tx - sx;
        const dy = ty - sy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 35 && passesRelFilter && camera.zoom > 0.6) {
          const targetRadius = tgt.radius || 14;
          const arrowOffset = targetRadius + 5;
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

        // Relationship label pill: Level of Detail (Only shown if close zoom or selected)
        const shouldShowEdgeLabel = showEdgeLabels && passesRelFilter && (
          isEdgeSelected || isEdgeHovered || (isIncident && camera.zoom > 1.05) || camera.zoom > 1.3
        );

        if (shouldShowEdgeLabel) {
          const midX = (sx + tx) / 2;
          const midY = (sy + ty) / 2;
          const relText = (e.relationship || "RELATED_TO").replace(/_/g, " ");

          ctx.font = "500 8.5px Inter, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const textMetrics = ctx.measureText(relText);
          const padX = 4;
          const padY = 2;

          ctx.fillStyle = isEdgeSelected ? "#1e293b" : "#14171b";
          ctx.fillRect(
            midX - textMetrics.width / 2 - padX,
            midY - 5 - padY,
            textMetrics.width + padX * 2,
            10 + padY * 2
          );

          ctx.strokeStyle = isEdgeSelected ? "#3b82f6" : "#2b323c";
          ctx.lineWidth = 1;
          ctx.strokeRect(
            midX - textMetrics.width / 2 - padX,
            midY - 5 - padY,
            textMetrics.width + padX * 2,
            10 + padY * 2
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

        // Shock Impact State
        if (isAffectedByShock) {
          ctx.beginPath();
          ctx.arc(nx, ny, radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Selection Ring
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

        // Main Node Body
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fillStyle = cat.fill;
        ctx.fill();

        ctx.strokeStyle = isSelected ? "#3b82f6" : cat.border;
        ctx.lineWidth = isSelected ? 2.0 : (n.type === "target_entity" ? 2.2 : 1.4);
        ctx.stroke();

        // Node Monogram or Center Dot
        if (n.type === "target_entity") {
          ctx.font = "bold 9.5px monospace";
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
          ctx.beginPath();
          ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = cat.accent;
          ctx.fill();
        }

        // ---------------- 3. LABELS (Level of Detail) ----------------
        // Show labels if: selected, hovered, neighbor, target, OR zoom > 0.75
        const shouldShowLabel = isSelected || isHovered || isNeighbor || n.type === "target_entity" || camera.zoom > 0.75;

        if (shouldShowLabel && passesFilter) {
          ctx.font = isSelected || n.type === "target_entity" 
            ? "600 10.5px Inter, -apple-system, sans-serif" 
            : "500 9px Inter, -apple-system, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "top";

          const labelY = ny + radius + 4;
          const textMetrics = ctx.measureText(n.label);
          const bgPadX = 3.5;
          const bgPadY = 1.5;

          ctx.fillStyle = "rgba(13, 15, 18, 0.90)";
          ctx.fillRect(
            nx - textMetrics.width / 2 - bgPadX,
            labelY - bgPadY,
            textMetrics.width + bgPadX * 2,
            11 + bgPadY * 2
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

      ctx.restore(); // Exit camera coordinates

      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrame);
      if (canvas.parentElement) {
        resizeObserver.unobserve(canvas.parentElement);
      }
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

    const nodes = simNodesRef.current;
    let hitNode: GraphNode | null = null;

    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = worldX - (n.x || 0);
      const dy = worldY - (n.y || 0);
      const r = (n.radius || 14) + 4;
      if (dx * dx + dy * dy <= r * r) {
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

    // Check edge click
    const edges = simEdgesRef.current;
    const nodeMap = new Map<string, GraphNode>();
    nodes.forEach(n => nodeMap.set(n.id, n));
    let hitEdge: GraphEdge | null = null;

    for (const eItem of edges) {
      const src = nodeMap.get(eItem.source);
      const tgt = nodeMap.get(eItem.target);
      if (!src || !tgt) continue;

      const sx = src.x || 0;
      const sy = src.y || 0;
      const tx = tgt.x || 0;
      const ty = tgt.y || 0;

      const dx = tx - sx;
      const dy = ty - sy;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) continue;

      let t = ((worldX - sx) * dx + (worldY - sy) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const projX = sx + t * dx;
      const projY = sy + t * dy;

      const distSq = (worldX - projX) * (worldX - projX) + (worldY - projY) * (worldY - projY);
      if (distSq < 36) {
        hitEdge = eItem;
        break;
      }
    }

    if (hitEdge) {
      onSelectEdge(hitEdge);
      onSelectNode(null);
      return;
    }

    // Canvas panning start
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
      const r = (n.radius || 14) + 4;
      if (dx * dx + dy * dy <= r * r) {
        hitNode = n;
        break;
      }
    }

    setHoveredNode(hitNode);
  };

  const handleMouseUp = () => {
    if (draggedNode) {
      draggedNode.isDragging = false;
      setDraggedNode(null);
    }
    setIsPanning(false);
  };

  const resetView = () => {
    fitToView();
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col bg-[#0d0f12] select-none overflow-hidden viewport-fixed">
      {/* =========================================================================
          FLOATING TOP CONTROLS (Material A — Apple Clear Glass)
         ========================================================================= */}
      
      {/* Top-Left: Mode & Stats Indicator */}
      <div className="absolute top-3 left-3 z-20 flex items-center space-x-2 glass-clear px-3 py-1.5 rounded-md text-xs">
        <div className="flex items-center space-x-1.5 text-[#a0a7b1]">
          <Network className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="font-medium text-[#e5e7eb] hidden sm:inline">Living Graph</span>
        </div>

        <div className="h-3 w-px bg-white/10"></div>

        {/* Layout Switcher */}
        <div className="flex items-center space-x-1 bg-[#111315]/80 p-0.5 rounded border border-[#30353c] text-[10.5px]">
          <button
            onClick={() => setLayoutMode("force")}
            className={`px-2 py-0.5 rounded transition-colors ${
              layoutMode === "force"
                ? "bg-[#2563eb] text-white font-medium"
                : "text-[#a0a7b1] hover:text-[#e5e7eb]"
            }`}
          >
            Force
          </button>
          <button
            onClick={() => setLayoutMode("radial")}
            className={`px-2 py-0.5 rounded transition-colors ${
              layoutMode === "radial"
                ? "bg-[#2563eb] text-white font-medium"
                : "text-[#a0a7b1] hover:text-[#e5e7eb]"
            }`}
          >
            Radial
          </button>
          <button
            onClick={() => setLayoutMode("clustered")}
            className={`px-2 py-0.5 rounded transition-colors ${
              layoutMode === "clustered"
                ? "bg-[#2563eb] text-white font-medium"
                : "text-[#a0a7b1] hover:text-[#e5e7eb]"
            }`}
          >
            Clusters
          </button>
        </div>

        <div className="h-3 w-px bg-white/10 hidden md:block"></div>

        <div className="text-[10px] font-mono text-[#737c88] hidden md:flex items-center space-x-2">
          <span>NODES: <strong className="text-[#e5e7eb] font-sans">{rawNodes.length}</strong></span>
          <span>LINKS: <strong className="text-[#e5e7eb] font-sans">{rawEdges.length}</strong></span>
          <span>ZOOM: <strong className="text-[#3b82f6] font-sans">{(camera.zoom * 100).toFixed(0)}%</strong></span>
        </div>
      </div>

      {/* Top-Right: Quick Action Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-1 glass-clear p-1 rounded-md">
        <button
          onClick={() => fitToView()}
          className="p-1.5 rounded hover:bg-white/10 text-[#a0a7b1] hover:text-white transition-colors cursor-pointer"
          title="Fit Graph to View"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#3b82f6]" />
        </button>

        <button
          onClick={() => setCamera(prev => ({ ...prev, zoom: Math.min(2.4, prev.zoom * 1.15) }))}
          className="p-1.5 rounded hover:bg-white/10 text-[#a0a7b1] hover:text-white transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setCamera(prev => ({ ...prev, zoom: Math.max(0.35, prev.zoom * 0.85) }))}
          className="p-1.5 rounded hover:bg-white/10 text-[#a0a7b1] hover:text-white transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={resetView}
          className="p-1.5 rounded hover:bg-white/10 text-[#a0a7b1] hover:text-white transition-colors cursor-pointer"
          title="Center Camera View"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-px bg-white/10 mx-0.5"></div>

        <button
          onClick={() => setIsSimulating(prev => !prev)}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            isSimulating ? "text-[#10b981] hover:bg-white/10" : "text-[#737c88] hover:bg-white/10"
          }`}
          title={isSimulating ? "Pause Physics Simulation" : "Resume Physics Simulation"}
        >
          {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setShowEdgeLabels(prev => !prev)}
          className={`p-1.5 rounded transition-colors cursor-pointer ${
            showEdgeLabels ? "text-[#3b82f6] hover:bg-white/10" : "text-[#737c88] hover:bg-white/10"
          }`}
          title={showEdgeLabels ? "Hide Edge Labels" : "Show Edge Labels"}
        >
          {showEdgeLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* =========================================================================
          CENTER CANVAS VIEWPORT
         ========================================================================= */}
      <div className="relative flex-1 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="absolute inset-0 w-full h-full block"
        />

        {/* Selected Node Notification Chip (Non-intrusive) */}
        {selectedNode && (
          <div className="absolute top-12 left-3 z-20 flex items-center space-x-2 glass-clear px-2.5 py-1 rounded text-[11px] animate-fadeIn pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]"></span>
            <span className="text-[#a0a7b1]">Focused:</span>
            <span className="text-[#f8fafc] font-medium">{selectedNode.label}</span>
          </div>
        )}

        {/* Bottom-Left: Refined Entity Types Legend */}
        <div className="absolute bottom-3 left-3 z-20 glass-clear rounded p-2.5 max-w-xs shadow-xl hidden md:block select-none">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#e5e7eb] font-semibold mb-1.5 flex items-center justify-between">
            <span>Entity Ontology</span>
            <span className="text-[#737c88] text-[9px] font-mono">{rawNodes.length} Nodes</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px]">
            {Object.entries(INSTITUTIONAL_CATEGORIES).map(([key, cat]) => {
              if (key === "default") return null;
              return (
                <div key={key} className="flex items-center space-x-1.5 truncate" title={cat.description}>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.fill, border: `1px solid ${cat.border}` }}
                  />
                  <span className="text-[#a0a7b1] truncate text-[9.5px]">{cat.label.split("(")[0].trim()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom-Right: Tactical Radar Minimap */}
        <div className="absolute bottom-3 right-3 z-20 glass-clear rounded p-2 hidden sm:block select-none">
          <div className="flex items-center justify-between text-[9px] font-mono uppercase text-[#737c88] mb-1">
            <span>Spatial Radar</span>
            <span>{(camera.zoom * 100).toFixed(0)}%</span>
          </div>
          <div className="w-28 h-20 bg-[#111315]/90 border border-[#30353c] rounded relative overflow-hidden">
            {/* Draw miniature nodes in minimap */}
            {simNodesRef.current.map(n => {
              const mmScale = 0.08;
              const mx = 56 + (n.x || 0) * mmScale;
              const my = 40 + (n.y || 0) * mmScale;
              if (mx < 0 || mx > 112 || my < 0 || my > 80) return null;
              const isSel = n.id === selectedNode?.id;
              return (
                <div
                  key={n.id}
                  className={`absolute rounded-full pointer-events-none ${
                    isSel ? "w-2 h-2 bg-[#3b82f6] -ml-1 -mt-1 ring-1 ring-white" : "w-1 h-1 bg-[#64748b] -ml-0.5 -mt-0.5"
                  }`}
                  style={{ left: `${mx}px`, top: `${my}px` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
