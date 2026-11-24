"use client";

import React, { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";

interface AgentNode {
  agent_id: string;
  name: string;
  role: string;
  specialization?: string;
  confidence: number;
  current_position?: string;
  interaction_count: number;
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

  // Institutional Palette for Roles
  const roleColors: Record<string, string> = {
    "Principal Systems Architect": "#172B27",
    "Chief Sovereign Risk Officer": "#303633",
    "Quantitative Financial Strategist": "#526C60",
    "Counter-Thesis Strategist (Devil's Advocate)": "#8B2834",
    "Strategic Growth Lead": "#A47B48",
    "Independent Adjudication Moderator": "#94671A"
  };

  return (
    <div className="flex h-full bg-[#F4F1E9] divide-x divide-[#D6D0C3]">
      {/* Left Center: SVG Network Visualizer */}
      <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden select-none bg-[#F4F1E9]">
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#B8B0A0" />
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
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#A47B48" />
            </marker>
          </defs>

          {/* Concentric Grid Rings */}
          <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#D6D0C3" strokeDasharray="3 3" />
          <circle cx={centerX} cy={centerY} r={radius * 0.5} fill="none" stroke="#E8E3D7" strokeDasharray="2 2" />

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
                stroke={isConnected ? "#A47B48" : "#D6D0C3"}
                strokeWidth={isConnected ? 2 : 1}
                strokeOpacity={isConnected ? 0.95 : 0.6}
                markerEnd={isConnected ? "url(#network-arrow-active)" : "url(#network-arrow)"}
              />
            );
          })}

          {/* Center Hub Label */}
          <circle cx={centerX} cy={centerY} r="28" fill="#FFFFFF" stroke="#D6D0C3" strokeWidth="1.5" />
          <text
            x={centerX}
            y={centerY + 4}
            textAnchor="middle"
            fill="#172B27"
            fontSize="9"
            fontFamily="var(--font-mono, monospace)"
            fontWeight="bold"
          >
            DEBATE
          </text>

          {/* Agent Nodes */}
          {agents.map((ag) => {
            const pos = nodePositions.get(ag.agent_id);
            if (!pos) return null;
            const isSelected = selectedId === ag.agent_id;
            const nodeColor = roleColors[ag.role] || "#172B27";

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
                  fill="#FFFFFF"
                  stroke={isSelected ? "#A47B48" : nodeColor}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />
                <circle r={isSelected ? 14 : 10} fill={nodeColor} fillOpacity={0.2} />
                
                {/* Initial */}
                <text
                  textAnchor="middle"
                  y="4"
                  fill="#172B27"
                  fontSize="10"
                  fontFamily="var(--font-serif, serif)"
                  fontWeight="bold"
                >
                  {ag.name.charAt(0)}
                </text>

                {/* Node Label */}
                <text
                  y={isSelected ? 32 : 28}
                  textAnchor="middle"
                  fill={isSelected ? "#172B27" : "#79756C"}
                  fontSize="10"
                  fontFamily="var(--font-mono, monospace)"
                  fontWeight={isSelected ? "bold" : "normal"}
                >
                  {ag.name.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-white border border-[#D6D0C3] rounded-[4px] p-2 text-[10px] font-mono shadow-xs space-y-1">
          <div className="text-[#79756C] uppercase tracking-wider font-semibold">Specialist Roster</div>
          <div className="flex items-center space-x-2 text-[#303633]">
            <span className="w-2 h-2 rounded-full bg-[#172B27]" />
            <span>Systems</span>
            <span className="w-2 h-2 rounded-full bg-[#526C60]" />
            <span>Financial</span>
            <span className="w-2 h-2 rounded-full bg-[#8B2834]" />
            <span>Adversary</span>
          </div>
        </div>
      </div>

      {/* Right Column: Detailed Agent Profile & 1-on-1 Interview Drawer */}
      <div className="w-80 flex flex-col bg-white overflow-hidden">
        {selectedAgent ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#D6D0C3] bg-[#F4F1E9]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white text-[#172B27] border border-[#D6D0C3]">
                  {selectedAgent.role}
                </span>
                <span className="text-xs font-mono font-bold text-[#264D3B]">
                  {Math.round(selectedAgent.confidence * 100)}% Conf
                </span>
              </div>
              <h3 className="text-base font-serif font-bold text-[#172B27]">{selectedAgent.name}</h3>
              <p className="text-[11px] text-[#79756C] mt-0.5 font-mono">{selectedAgent.specialization || selectedAgent.role}</p>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              <div>
                <div className="text-[10px] font-mono text-[#79756C] uppercase tracking-wider mb-1">Current Position</div>
                <p className="text-[#303633] font-serif leading-relaxed p-3 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3]">
                  "{selectedAgent.current_position || 'Active in peer debate rounds.'}"
                </p>
              </div>

              <div>
                <div className="text-[10px] font-mono text-[#79756C] uppercase tracking-wider mb-1">Debate Engagement</div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3]">
                    <div className="text-sm font-bold font-mono text-[#172B27]">{selectedAgent.interaction_count || 12}</div>
                    <div className="text-[9px] text-[#79756C] uppercase tracking-wider">Exchanges</div>
                  </div>
                  <div className="p-2.5 rounded-[4px] bg-[#F4F1E9] border border-[#D6D0C3]">
                    <div className="text-sm font-bold font-mono text-[#264D3B]">Active</div>
                    <div className="text-[9px] text-[#79756C] uppercase tracking-wider">Epistemic State</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-3 border-t border-[#D6D0C3] bg-[#F4F1E9]">
              <button
                onClick={() => onInterviewAgent(selectedAgent)}
                className="w-full py-2 rounded-[4px] bg-[#172B27] hover:bg-[#233F3A] text-white font-medium text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Interview {selectedAgent.name.split(" ")[0]} 1-on-1</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs font-mono text-[#79756C]">
            Select an agent node to inspect relationships and interview them.
          </div>
        )}
      </div>
    </div>
  );
}
