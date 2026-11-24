"use client";

import React, { useMemo, useEffect, useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  NodeProps,
  EdgeProps,
  BaseEdge,
  getBezierPath
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { GraphNode, GraphEdge, INSTITUTIONAL_CATEGORIES } from "./LivingKnowledgeGraph";
import { Maximize2 } from "lucide-react";

// Custom Node Component for Institutional Entity
function InstitutionalNodeComponent({ data, selected }: NodeProps) {
  const node = data.node as GraphNode;
  const cat = INSTITUTIONAL_CATEGORIES[node.type || "default"] || INSTITUTIONAL_CATEGORIES.default;

  return (
    <div
      className={`px-3 py-2.5 rounded border transition-all cursor-pointer shadow-sm select-none ${
        selected
          ? "border-[#3b82f6] bg-[#20242a] ring-1 ring-[#3b82f6]"
          : "border-[#30353c] bg-[#181b1f] hover:border-[#474d57] hover:bg-[#1c2026]"
      }`}
      style={{ minWidth: "150px", maxWidth: "220px" }}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#3b82f6] !w-2 !h-2 !border-none" />
      <div className="flex items-center space-x-1.5 mb-1">
        <span
          className="w-2 h-2 rounded-full inline-block shrink-0"
          style={{ backgroundColor: cat.fill, border: `1px solid ${cat.border}` }}
        />
        <span className="text-[9px] font-mono uppercase tracking-wider text-[#737c88] truncate">
          {cat.label}
        </span>
      </div>
      <div className="font-sans font-semibold text-xs text-[#f8fafc] truncate">
        {node.label}
      </div>
      {node.sector && (
        <div className="text-[10px] text-[#a0a7b1] truncate mt-0.5 font-mono">
          {node.sector} {node.ticker ? `• ${node.ticker}` : ""}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-[#3b82f6] !w-2 !h-2 !border-none" />
    </div>
  );
}

// Custom Edge Component
function InstitutionalEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, stroke: "#30353c", strokeWidth: 1.5 }} />
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <rect
            x={-40}
            y={-10}
            width={80}
            height={20}
            rx={3}
            fill="#111315"
            stroke="#30353c"
            strokeWidth={1}
          />
          <text
            y={3}
            textAnchor="middle"
            fill="#a0a7b1"
            fontSize={9}
            fontFamily="monospace"
            className="select-none pointer-events-none"
          >
            {label}
          </text>
        </g>
      )}
    </>
  );
}

const nodeTypes = {
  institutional: InstitutionalNodeComponent,
};

const edgeTypes = {
  institutional: InstitutionalEdgeComponent,
};

interface ReactFlowKnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  onSelectNode: (node: GraphNode | null) => void;
  selectedEdge: GraphEdge | null;
  onSelectEdge: (edge: GraphEdge | null) => void;
  searchQuery?: string;
  typeFilter?: string;
}

function ReactFlowViewWatcher({ dependency }: { dependency: any }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const t1 = setTimeout(() => {
      fitView({ padding: 0.25, duration: 400 });
    }, 50);
    const t2 = setTimeout(() => {
      fitView({ padding: 0.25, duration: 300 });
    }, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [fitView, dependency]);

  return null;
}

function ReactFlowKnowledgeGraphInner({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  selectedEdge,
  onSelectEdge,
  searchQuery = "",
  typeFilter = "ALL"
}: ReactFlowKnowledgeGraphProps) {
  const { fitView } = useReactFlow();

  // Filter nodes according to search and type filter
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (typeFilter !== "ALL" && n.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (n.label && n.label.toLowerCase().includes(q)) || (n.sector && n.sector.toLowerCase().includes(q));
      }
      return true;
    });
  }, [nodes, typeFilter, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Convert to React Flow Nodes with concentric symmetrical layout centered at (0, 0)
  const flowNodes = useMemo(() => {
    const centerNode = filteredNodes.find(n => n.id === "palantir_core" || n.type === "target_entity") || filteredNodes[0];
    const nonCenterNodes = filteredNodes.filter(n => n.id !== centerNode?.id);
    const count = nonCenterNodes.length;

    const result = [];

    if (centerNode) {
      result.push({
        id: centerNode.id,
        type: "institutional",
        position: { x: -90, y: -40 },
        data: { node: centerNode },
        selected: selectedNode?.id === centerNode.id,
      });
    }

    nonCenterNodes.forEach((n, idx) => {
      const angle = (idx / Math.max(1, count)) * 2 * Math.PI;
      // Stagger concentric orbital rings for clean visibility
      const ring = idx % 3;
      const radius = 260 + ring * 100;
      const x = Math.cos(angle) * radius - 80;
      const y = Math.sin(angle) * radius - 30;

      result.push({
        id: n.id,
        type: "institutional",
        position: { x, y },
        data: { node: n },
        selected: selectedNode?.id === n.id,
      });
    });

    return result;
  }, [filteredNodes, selectedNode]);

  // Convert to React Flow Edges
  const flowEdges = useMemo(() => {
    return edges
      .filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target))
      .map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "institutional",
        label: e.relationship,
        selected: selectedEdge?.id === e.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: selectedEdge?.id === e.id ? "#3b82f6" : "#474d57",
        },
        style: {
          stroke: selectedEdge?.id === e.id ? "#3b82f6" : "#30353c",
          strokeWidth: selectedEdge?.id === e.id ? 2 : 1.2,
        }
      }));
  }, [edges, filteredNodeIds, selectedEdge]);

  return (
    <div className="w-full h-full bg-[#111315] relative select-none">
      <ReactFlowViewWatcher dependency={filteredNodes.length} />
      
      {/* Top Floating Action Pill for React Flow Engine */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-1 glass-clear p-1 rounded-md">
        <button
          onClick={() => fitView({ padding: 0.25, duration: 400 })}
          className="p-1.5 rounded hover:bg-white/10 text-[#a0a7b1] hover:text-white transition-colors cursor-pointer flex items-center space-x-1 text-xs"
          title="Fit Graph to Viewport"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#3b82f6]" />
          <span className="font-mono text-[10px] hidden sm:inline">Fit View</span>
        </button>
      </div>

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, node) => {
          const original = nodes.find(n => n.id === node.id) || null;
          onSelectNode(original);
          onSelectEdge(null);
        }}
        onEdgeClick={(_, edge) => {
          const original = edges.find(e => e.id === edge.id) || null;
          onSelectEdge(original);
          onSelectNode(null);
        }}
        onPaneClick={() => {
          onSelectNode(null);
          onSelectEdge(null);
        }}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2.5}
      >
        <Background color="#20242a" gap={24} size={1} />
        <Controls className="!bg-[#181b1f] !border-[#30353c] !text-[#a0a7b1] [&>button]:!border-[#30353c] [&>button]:!bg-[#181b1f] [&>button:hover]:!bg-[#20242a]" />
        <MiniMap
          nodeColor={(n) => {
            const orig = nodes.find(x => x.id === n.id);
            const cat = orig?.type && INSTITUTIONAL_CATEGORIES[orig.type];
            return cat ? cat.border : "#30353c";
          }}
          className="!bg-[#141619] !border !border-[#30353c] !rounded"
          maskColor="rgba(17, 19, 21, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}

export function ReactFlowKnowledgeGraph(props: ReactFlowKnowledgeGraphProps) {
  return (
    <ReactFlowProvider>
      <ReactFlowKnowledgeGraphInner {...props} />
    </ReactFlowProvider>
  );
}
