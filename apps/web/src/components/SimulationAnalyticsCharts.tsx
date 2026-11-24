"use client";

import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface AnalyticsProps {
  roundsLabels: string[];
  confidenceSeries: Array<{
    name: string;
    type: string;
    smooth: boolean;
    data: number[];
  }>;
  totalTokens: number;
  totalCostUsd: number;
  consensusIndex: number;
}

export function SimulationAnalyticsCharts({
  roundsLabels,
  confidenceSeries,
  totalTokens,
  totalCostUsd,
  consensusIndex
}: AnalyticsProps) {
  const lineChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineChartRef.current) return;
    const lineChart = echarts.init(lineChartRef.current);

    // Institutional Financial Visualization Palette
    // Deep Forest, Sage, Muted Brass, Graphite, Warm Grey
    const colors = ["#172B27", "#526C60", "#A47B48", "#303633", "#79756C", "#8F6B3E"];

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#FFFFFF",
        borderColor: "#D6D0C3",
        borderWidth: 1,
        textStyle: { color: "#172B27", fontSize: 11, fontFamily: "var(--font-mono, monospace)" },
        extraCssText: "box-shadow: 0 2px 8px rgba(48, 54, 51, 0.08);"
      },
      legend: {
        bottom: 0,
        textStyle: { color: "#303633", fontSize: 10, fontFamily: "var(--font-mono, monospace)" },
        itemWidth: 10,
        itemHeight: 10
      },
      grid: {
        top: 20,
        left: 40,
        right: 20,
        bottom: 45,
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: roundsLabels.length ? roundsLabels : ["R1", "R2", "R3", "R4", "R5", "R6"],
        axisLine: { lineStyle: { color: "#D6D0C3" } },
        axisLabel: { color: "#79756C", fontSize: 10, fontFamily: "var(--font-mono, monospace)" }
      },
      yAxis: {
        type: "value",
        min: 0.3,
        max: 1.0,
        axisLine: { lineStyle: { color: "#D6D0C3" } },
        splitLine: { lineStyle: { color: "#E8E3D7", type: "dashed" } },
        axisLabel: { color: "#79756C", fontSize: 10, fontFamily: "var(--font-mono, monospace)", formatter: "{value}" }
      },
      series: confidenceSeries.map((s, idx) => {
        const color = colors[idx % colors.length];
        return {
          ...s,
          lineStyle: { width: 2, color },
          itemStyle: { color }
        };
      })
    };

    lineChart.setOption(option);

    const handleResize = () => lineChart.resize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      lineChart.dispose();
    };
  }, [roundsLabels, confidenceSeries]);

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs">
          <div className="text-[10px] font-mono text-[#79756C] uppercase tracking-wider">Consensus Index</div>
          <div className="text-xl font-serif font-bold text-[#172B27] mt-1 tabular-nums">{consensusIndex}%</div>
          <div className="text-[10px] text-[#79756C] mt-0.5">Calibrated Epistemic Agreement</div>
        </div>
        <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs">
          <div className="text-[10px] font-mono text-[#79756C] uppercase tracking-wider">Active Specialists</div>
          <div className="text-xl font-serif font-bold text-[#526C60] mt-1 tabular-nums">{confidenceSeries.length}</div>
          <div className="text-[10px] text-[#79756C] mt-0.5">Multi-perspective debate</div>
        </div>
        <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs">
          <div className="text-[10px] font-mono text-[#79756C] uppercase tracking-wider">Tokens Consumed</div>
          <div className="text-xl font-serif font-bold text-[#303633] mt-1 tabular-nums">{totalTokens.toLocaleString()}</div>
          <div className="text-[10px] text-[#79756C] mt-0.5">Input & reasoning budget</div>
        </div>
        <div className="p-3.5 rounded bg-white border border-[#D6D0C3] shadow-xs">
          <div className="text-[10px] font-mono text-[#79756C] uppercase tracking-wider">Estimated Compute Cost</div>
          <div className="text-xl font-serif font-bold text-[#A47B48] mt-1 tabular-nums">${totalCostUsd.toFixed(4)}</div>
          <div className="text-[10px] text-[#79756C] mt-0.5">LiteLLM accounted USD</div>
        </div>
      </div>

      {/* Main Trajectory Chart */}
      <div className="p-4 rounded bg-white border border-[#D6D0C3] shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-[#D6D0C3] pb-2.5">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#172B27] font-mono">
              Epistemic Confidence Trajectories Across Rounds
            </h3>
            <p className="text-[11px] text-[#79756C] mt-0.5">
              Tracks how specialist confidence drifts through cross-examination, evidence retrieval, and consensus revisions.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#172B27] bg-[#E8E3D7] px-2 py-0.5 rounded border border-[#D6D0C3]">
            6 Debate Rounds
          </span>
        </div>
        <div ref={lineChartRef} className="w-full h-72" />
      </div>
    </div>
  );
}
