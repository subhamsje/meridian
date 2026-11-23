"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
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

export function ReactFlowKnowledgeGraph({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
  selectedEdge,
  onSelectEdge,
  searchQuery = "",
  typeFilter = "ALL"
}: ReactFlowKnowledgeGraphProps) {
  // Filter nodes according to search and type filter
  const filteredNodes = useMemo(() => {
    return nodes.filter(n => {
      if (typeFilter !== "ALL" && n.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return n.label.toLowerCase().includes(q) || (n.sector && n.sector.toLowerCase().includes(q));
      }
      return true;
    });
  }, [nodes, typeFilter, searchQuery]);

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Convert to React Flow Nodes with concentric / force layout positioning
  const flowNodes = useMemo(() => {
    const centerNode = filteredNodes.find(n => n.id === "palantir_core" || n.type === "target_entity") || filteredNodes[0];
    const centerX = 400;
    const centerY = 350;
    const count = filteredNodes.length;

    return filteredNodes.map((n, idx) => {
      let x = centerX;
      let y = centerY;

      if (n.id === centerNode?.id) {
        x = centerX;
        y = centerY;
      } else {
        const angle = (idx / Math.max(1, count - 1)) * 2 * Math.PI;
        const radius = 220 + ((idx % 3) * 70);
        x = centerX + Math.cos(angle) * radius;
        y = centerY + Math.sin(angle) * radius;
      }

      return {
        id: n.id,
        type: "institutional",
        position: { x, y },
        data: { node: n },
        selected: selectedNode?.id === n.id,
      };
    });
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
        minZoom={0.2}
        maxZoom={2.5}
      >
        <Background color="#20242a" gap={20} size={1} />
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
