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
  const radarChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineChartRef.current) return;
    const lineChart = echarts.init(lineChartRef.current, "dark");

    const option = {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#181b1f",
        borderColor: "#30353c",
        textStyle: { color: "#e5e7eb", fontSize: 11, fontFamily: "monospace" }
      },
      legend: {
        bottom: 0,
        textStyle: { color: "#a0a7b1", fontSize: 10, fontFamily: "monospace" },
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
        axisLine: { lineStyle: { color: "#30353c" } },
        axisLabel: { color: "#737c88", fontSize: 10, fontFamily: "monospace" }
      },
      yAxis: {
        type: "value",
        min: 0.3,
        max: 1.0,
        axisLine: { lineStyle: { color: "#30353c" } },
        splitLine: { lineStyle: { color: "#20242a" } },
        axisLabel: { color: "#737c88", fontSize: 10, fontFamily: "monospace", formatter: "{value}" }
      },
      series: confidenceSeries.map((s, idx) => {
        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
        return {
          ...s,
          lineStyle: { width: 2, color: colors[idx % colors.length] },
          itemStyle: { color: colors[idx % colors.length] }
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
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded bg-[#181b1f] border border-[#30353c]">
          <div className="text-[10px] font-mono text-[#737c88] uppercase">Consensus Index</div>
          <div className="text-xl font-bold font-mono text-[#10b981] mt-1">{consensusIndex}%</div>
          <div className="text-[9.5px] text-[#a0a7b1] mt-0.5">Calibrated Epistemic Agreement</div>
        </div>
        <div className="p-3 rounded bg-[#181b1f] border border-[#30353c]">
          <div className="text-[10px] font-mono text-[#737c88] uppercase">Active Specialists</div>
          <div className="text-xl font-bold font-mono text-[#3b82f6] mt-1">{confidenceSeries.length}</div>
          <div className="text-[9.5px] text-[#a0a7b1] mt-0.5">Multi-perspective debate</div>
        </div>
        <div className="p-3 rounded bg-[#181b1f] border border-[#30353c]">
          <div className="text-[10px] font-mono text-[#737c88] uppercase">Tokens Consumed</div>
          <div className="text-xl font-bold font-mono text-[#e5e7eb] mt-1">{totalTokens.toLocaleString()}</div>
          <div className="text-[9.5px] text-[#a0a7b1] mt-0.5">Input & reasoning budget</div>
        </div>
        <div className="p-3 rounded bg-[#181b1f] border border-[#30353c]">
          <div className="text-[10px] font-mono text-[#737c88] uppercase">Estimated Compute Cost</div>
          <div className="text-xl font-bold font-mono text-[#f59e0b] mt-1">${totalCostUsd.toFixed(4)}</div>
          <div className="text-[9.5px] text-[#a0a7b1] mt-0.5">LiteLLM accounted USD</div>
        </div>
      </div>

      {/* Main Trajectory Chart */}
      <div className="p-4 rounded bg-[#181b1f] border border-[#30353c]">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#e5e7eb] font-mono">
              Epistemic Confidence Trajectories Across Rounds
            </h3>
            <p className="text-[11px] text-[#737c88] mt-0.5">
              Tracks how specialist confidence drifts through cross-examination, evidence retrieval, and consensus revisions.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#3b82f6] bg-[#15202e] px-2 py-0.5 rounded border border-[#3b82f6]/30">
            6 Debate Rounds
          </span>
        </div>
        <div ref={lineChartRef} className="w-full h-72" />
      </div>
    </div>
  );
}
