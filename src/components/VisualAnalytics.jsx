import React, { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { EFFORT_TIERS } from '../utils/streakLogic';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieIcon, BarChart2, Activity, Calendar, ShieldCheck } from 'lucide-react';

export default function VisualAnalytics() {
  const habits = useLiveQuery(() => db.habits.toArray(), []) || [];
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) || [];
  const goals = useLiveQuery(() => db.goals.toArray(), []) || [];

  // Calculate effort totals for Pie/Donut Chart
  const pieData = useMemo(() => {
    let full = 0;
    let partial = 0;
    let lazy = 0;
    let zero = 0;

    habits.forEach((h) => {
      (h.dailyEffortLogs || []).forEach((l) => {
        if (l.effort === 'full') full++;
        else if (l.effort === 'partial') partial++;
        else if (l.effort === 'lazy') lazy++;
        else if (l.effort === 'zero') zero++;
      });
    });

    tasks.forEach((t) => {
      if (t.status === 'completed') {
        if (t.effort === 'full') full++;
        else if (t.effort === 'partial') partial++;
        else if (t.effort === 'lazy') lazy++;
        else if (t.effort === 'zero') zero++;
      }
    });

    goals.forEach((g) => {
      (g.subActionItems || []).forEach((sub) => {
        if (sub.completed) {
          if (sub.effort === 'full') full++;
          else if (sub.effort === 'partial') partial++;
          else if (sub.effort === 'lazy') lazy++;
          else if (sub.effort === 'zero') zero++;
        }
      });
    });

    return [
      { name: 'Full Effort (100%)', value: full, color: '#00ff66' },
      { name: 'Not Full Effort (70%)', value: partial, color: '#ffe600' },
      { name: 'Lazy Way (40%)', value: lazy, color: '#ff6600' },
      { name: 'Zero / Missed (0%)', value: zero, color: '#ff0055' }
    ].filter((item) => item.value > 0);
  }, [habits, tasks, goals]);

  // Calculate Past 7 Days Stacked Bar Chart Data
  const weeklyBarData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

      let full = 0;
      let partial = 0;
      let lazy = 0;
      let zero = 0;

      habits.forEach((h) => {
        (h.dailyEffortLogs || []).forEach((l) => {
          if (l.date === dateStr) {
            if (l.effort === 'full') full++;
            else if (l.effort === 'partial') partial++;
            else if (l.effort === 'lazy') lazy++;
            else if (l.effort === 'zero') zero++;
          }
        });
      });

      tasks.forEach((t) => {
        if (t.completedAt === dateStr) {
          if (t.effort === 'full') full++;
          else if (t.effort === 'partial') partial++;
          else if (t.effort === 'lazy') lazy++;
          else if (t.effort === 'zero') zero++;
        }
      });

      days.push({
        day: `${dayName} (${dateStr.slice(5)})`,
        Full: full,
        Partial: partial,
        Lazy: lazy,
        Zero: zero
      });
    }
    return days;
  }, [habits, tasks]);

  // Category Breakdown Bar Chart
  const categoryBarData = useMemo(() => {
    const categories = {};
    habits.forEach((h) => {
      const cat = h.category || 'OTHER';
      if (!categories[cat]) categories[cat] = { category: cat, totalLogs: 0, streak: 0 };
      categories[cat].totalLogs += (h.dailyEffortLogs || []).length;
      categories[cat].streak += h.currentStreak || 0;
    });

    return Object.values(categories);
  }, [habits]);

  // 30-Day Activity Matrix Heatmap Tiles
  const matrix30Days = useMemo(() => {
    const tiles = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];

      const logsOnDate = [];
      habits.forEach((h) => {
        (h.dailyEffortLogs || []).forEach((l) => {
          if (l.date === dateStr) logsOnDate.push(l.effort);
        });
      });

      let dominantEffort = 'none';
      if (logsOnDate.includes('full')) dominantEffort = 'full';
      else if (logsOnDate.includes('partial')) dominantEffort = 'partial';
      else if (logsOnDate.includes('lazy')) dominantEffort = 'lazy';
      else if (logsOnDate.includes('zero')) dominantEffort = 'zero';

      tiles.push({
        date: dateStr,
        effort: dominantEffort,
        count: logsOnDate.length
      });
    }
    return tiles;
  }, [habits]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b0c16] border border-[#00f0ff] p-3 rounded text-xs font-mono shadow-xl">
          <p className="text-[#00f0ff] font-bold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Bar */}
      <div className="cyber-panel hud-corner-tl p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#00f0ff] tracking-widest uppercase text-glow-cyan flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#00f0ff]" />
            VISUAL ANALYTICS // EFFORT SPECTRUM TELEMETRY
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-dimensional color-coded charts and heatmap activity matrix.
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          {Object.values(EFFORT_TIERS).map((tier) => (
            <div key={tier.key} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: tier.color, boxShadow: `0 0 8px ${tier.color}` }}
              />
              <span className="text-slate-300 font-bold">{tier.label.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Row 1: Pie/Donut Chart & 7-Day Stacked Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Effort Distribution Pie / Donut Chart */}
        <div className="cyber-panel p-5 rounded-lg border border-[#00f0ff]/30">
          <h3 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider mb-4 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-[#00ff66]" />
            EFFORT SPECTRUM RATIO (DONUT CHART)
          </h3>

          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-500">NO EFFORT LOGS RECORDED YET</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#06070c" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 7-Day Stacked Effort Bar Chart */}
        <div className="cyber-panel p-5 rounded-lg border border-[#ff007f]/30">
          <h3 className="text-xs font-bold text-[#ff007f] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#ff007f]" />
            PAST 7 DAYS EFFORT LOGS (STACKED BAR CHART)
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Full" stackId="a" fill="#00ff66" />
                <Bar dataKey="Partial" stackId="a" fill="#ffe600" />
                <Bar dataKey="Lazy" stackId="a" fill="#ff6600" />
                <Bar dataKey="Zero" stackId="a" fill="#ff0055" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Category Bar Chart & 30-Day Activity Matrix Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Category Bar Chart */}
        <div className="cyber-panel p-5 rounded-lg border border-[#9d4edd]/30">
          <h3 className="text-xs font-bold text-[#9d4edd] uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#9d4edd]" />
            HABIT CATEGORY LOGS (BAR CHART)
          </h3>

          <div className="h-60 w-full">
            {categoryBarData.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">NO CATEGORY DATA</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalLogs" name="Total Logs" fill="#9d4edd" />
                  <Bar dataKey="streak" name="Current Streak" fill="#00f0ff" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 30-Day Activity Matrix Grid (Heatmap Calendar) */}
        <div className="cyber-panel p-5 rounded-lg border border-[#00f0ff]/30">
          <h3 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00f0ff]" />
            30-DAY EFFORT MATRIX (HEATMAP TILE GRID)
          </h3>

          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2.5 py-2">
            {matrix30Days.map((tile, idx) => {
              let colorBg = 'rgba(15, 23, 42, 0.6)';
              let borderColor = 'rgba(51, 65, 85, 0.4)';
              let labelColor = '#64748b';

              if (tile.effort === 'full') {
                colorBg = 'rgba(0, 255, 102, 0.25)';
                borderColor = '#00ff66';
                labelColor = '#00ff66';
              } else if (tile.effort === 'partial') {
                colorBg = 'rgba(255, 230, 0, 0.25)';
                borderColor = '#ffe600';
                labelColor = '#ffe600';
              } else if (tile.effort === 'lazy') {
                colorBg = 'rgba(255, 102, 0, 0.25)';
                borderColor = '#ff6600';
                labelColor = '#ff6600';
              } else if (tile.effort === 'zero') {
                colorBg = 'rgba(255, 0, 85, 0.25)';
                borderColor = '#ff0055';
                labelColor = '#ff0055';
              }

              return (
                <div
                  key={tile.date}
                  style={{ backgroundColor: colorBg, borderColor: borderColor }}
                  className="aspect-square p-1 border rounded flex flex-col items-center justify-center transition-transform hover:scale-110 cursor-pointer group relative"
                  title={`${tile.date}: ${tile.effort.toUpperCase()} EFFORT (${tile.count} logs)`}
                >
                  <span className="text-[9px] font-bold" style={{ color: labelColor }}>
                    {tile.date.slice(8)}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: labelColor, boxShadow: `0 0 6px ${labelColor}` }}
                  />
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 mt-4 text-center">
            Hover over tiles to view exact date telemetries and effort breakdown.
          </p>
        </div>
      </div>
    </div>
  );
}
