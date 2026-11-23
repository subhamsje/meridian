"use client";

import React, { useMemo, useState } from "react";
import { Users, MessageSquare, Shield, ArrowRight, Zap } from "lucide-react";

interface AgentNode {
  agent_id: string;
  name: string;
  role: string;
  specialization?: string;
  confidence: number;
  current_position?: string;
  interaction_count: number;
}

interface AgentEdge {
  source: string;
  target: string;
  type: string;
}

interface AgentNetworkProps {
  agents: AgentNode[];
  interactions: any[];
  onSelectAgent: (agent: AgentNode) => void;
  onInterviewAgent: (agent: AgentNode) => void;
}

export function AgentNetworkGraph({
  agents,
  interactions,
  onSelectAgent,
  onInterviewAgent
}: AgentNetworkProps) {
  const [selectedId, setSelectedId] = useState<string | null>(agents[0]?.agent_id || null);

  // Derive interaction links between agents
  const links = useMemo(() => {
    const linkMap = new Map<string, { source: string; target: string; count: number; types: Set<string> }>();
    for (const msg of interactions) {
      if (msg.sender_agent_id && msg.recipient_agent_id && msg.recipient_agent_id !== "ALL") {
        const key = `${msg.sender_agent_id}->${msg.recipient_agent_id}`;
        if (!linkMap.has(key)) {
          linkMap.set(key, {
            source: msg.sender_agent_id,
            target: msg.recipient_agent_id,
            count: 0,
            types: new Set()
          });
        }
        const record = linkMap.get(key)!;
        record.count += 1;
        record.types.add(msg.interaction_type || "MESSAGE");
      }
    }
    return Array.from(linkMap.values());
  }, [interactions]);

  const selectedAgent = agents.find(a => a.agent_id === selectedId) || agents[0];

  // Radial positioning in an SVG canvas
  const centerX = 260;
  const centerY = 240;
  const radius = 160;

  const nodePositions = useMemo(() => {
    const count = agents.length;
    const posMap = new Map<string, { x: number; y: number }>();
    agents.forEach((ag, idx) => {
      const angle = (idx / Math.max(1, count)) * 2 * Math.PI - Math.PI / 2;
      posMap.set(ag.agent_id, {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    });
    return posMap;
  }, [agents]);

  const roleColors: Record<string, string> = {
    "Principal Systems Architect": "#3b82f6",
    "Chief Sovereign Risk Officer": "#8b5cf6",
    "Quantitative Financial Strategist": "#10b981",
    "Counter-Thesis Strategist (Devil's Advocate)": "#ef4444",
    "Strategic Growth Lead": "#06b6d4",
    "Independent Adjudication Moderator": "#f59e0b"
  };

  return (
    <div className="flex h-full bg-[#111315] divide-x divide-[#30353c]">
      {/* Left Center: SVG Network Visualizer */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden select-none">
        <svg viewBox="0 0 520 480" className="w-full h-full max-w-xl max-h-[480px]">
          <defs>
            <marker
              id="network-arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#474d57" />
            </marker>
            <marker
              id="network-arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Concentric Grid Rings */}
          <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#20242a" strokeDasharray="3 3" />
          <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#181b1f" strokeDasharray="2 2" />

          {/* Links between Agents */}
          {links.map((link, idx) => {
            const src = nodePositions.get(link.source);
            const tgt = nodePositions.get(link.target);
            if (!src || !tgt) return null;
            const isConnected = selectedId === link.source || selectedId === link.target;
            return (
              <line
                key={idx}
                x1={src.x}
                y1={src.y}
                x2={tgt.x}
                y2={tgt.y}
                stroke={isConnected ? "#3b82f6" : "#2a2f38"}
                strokeWidth={isConnected ? 2 : 1}
                strokeOpacity={isConnected ? 0.9 : 0.4}
                markerEnd={isConnected ? "url(#network-arrow-active)" : "url(#network-arrow)"}
              />
            );
          })}

          {/* Center Hub Label */}
          <circle cx={centerX} cy={centerY} r="28" fill="#181b1f" stroke="#30353c" strokeWidth="1.5" />
          <text
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            fill="#a0a7b1"
            fontSize="9"
            fontFamily="monospace"
          >
            DEBATE
          </text>

          {/* Agent Nodes */}
          {agents.map((ag) => {
            const pos = nodePositions.get(ag.agent_id);
            if (!pos) return null;
            const isSelected = selectedId === ag.agent_id;
            const nodeColor = roleColors[ag.role] || "#3b82f6";

            return (
              <g
                key={ag.agent_id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => {
                  setSelectedId(ag.agent_id);
                  onSelectAgent(ag);
                }}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Node Ring */}
                <circle
                  r={isSelected ? 20 : 16}
                  fill="#181b1f"
                  stroke={isSelected ? "#f8fafc" : nodeColor}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />
                <circle r={isSelected ? 14 : 10} fill={nodeColor} fillOpacity={0.25} />
                
                {/* Initial */}
                <text
                  textAnchor="middle"
                  y="4"
                  fill="#f8fafc"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                >
                  {ag.name.charAt(0)}
                </text>

                {/* Node Label */}
                <text
                  y={isSelected ? 32 : 28}
                  textAnchor="middle"
                  fill={isSelected ? "#f8fafc" : "#a0a7b1"}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight={isSelected ? "bold" : "normal"}
                >
                  {ag.name.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-[#181b1f]/90 border border-[#30353c] rounded p-2 text-[10px] font-mono backdrop-blur-sm space-y-1">
          <div className="text-[#737c88] uppercase">Agent Network Topography</div>
          <div className="flex items-center space-x-2 text-[#a0a7b1]">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            <span>Technical</span>
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
            <span>Risk / Legal</span>
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span>Adversary</span>
          </div>
        </div>
      </div>

      {/* Right Column: Detailed Agent Profile & 1-on-1 Interview Drawer */}
      <div className="w-80 flex flex-col bg-[#181b1f] overflow-hidden">
        {selectedAgent ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#30353c] bg-[#141619]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#20242a] text-[#3b82f6] border border-[#30353c]">
                  {selectedAgent.role}
                </span>
                <span className="text-xs font-mono font-bold text-[#10b981]">
                  {Math.round(selectedAgent.confidence * 100)}% Conf
                </span>
              </div>
              <h3 className="text-base font-serif font-bold text-[#f8fafc]">{selectedAgent.name}</h3>
              <p className="text-[11px] text-[#737c88] mt-0.5 font-mono">{selectedAgent.specialization || selectedAgent.role}</p>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div>
                <div className="text-[10px] font-mono text-[#737c88] uppercase mb-1">Current Stance</div>
                <p className="text-[#cbd5e1] font-serif leading-relaxed p-2.5 rounded bg-[#111315] border border-[#30353c]">
                  "{selectedAgent.current_position || 'Active in peer debate rounds.'}"
                </p>
              </div>

              <div>
                <div className="text-[10px] font-mono text-[#737c88] uppercase mb-1">Debate Engagement</div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded bg-[#111315] border border-[#30353c]">
                    <div className="text-sm font-bold font-mono text-[#e5e7eb]">{selectedAgent.interaction_count || 12}</div>
                    <div className="text-[9px] text-[#737c88]">Exchanges</div>
                  </div>
                  <div className="p-2 rounded bg-[#111315] border border-[#30353c]">
                    <div className="text-sm font-bold font-mono text-[#10b981]">Active</div>
                    <div className="text-[9px] text-[#737c88]">Epistemic State</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-3 border-t border-[#30353c] bg-[#141619]">
              <button
                onClick={() => onInterviewAgent(selectedAgent)}
                className="w-full py-2 rounded bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Interview {selectedAgent.name.split(" ")[0]} 1-on-1</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs font-mono text-[#737c88]">
            Select an agent node to inspect relationships and interview them.
          </div>
        )}
      </div>
    </div>
  );
}
