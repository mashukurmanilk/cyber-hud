import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, Zap, Target, PieChart, Database, Volume2, VolumeX, Eye, EyeOff, Flame, ShieldAlert } from 'lucide-react';
import { cyberAudio } from '../utils/audioSynth';

export default function HUDHeader({
  activeTab,
  setActiveTab,
  telemetry,
  audioEnabled,
  setAudioEnabled,
  bgGridEnabled,
  setBgGridEnabled
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString('en-US', { hour12: false }) + ' LOCAL');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'COMMAND HUD', icon: LayoutDashboard },
    { id: 'tasks', label: 'TASKS MATRIX', icon: CheckSquare },
    { id: 'habits', label: 'HABIT PROTOCOLS', icon: Zap },
    { id: 'goals', label: 'LONG-TERM GOALS', icon: Target },
    { id: 'analytics', label: 'VISUAL ANALYTICS', icon: PieChart },
    { id: 'nexus', label: 'DATA NEXUS', icon: Database }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#06070c]/90 backdrop-blur-md border-b border-[#00f0ff]/30 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto px-4 py-3">
        {/* Upper Row: Brand & Telemetry HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-[#00f0ff]/15">
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#00f0ff]/10 border border-[#00f0ff] flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Zap className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-widest text-[#00f0ff] text-glow-cyan uppercase">
                NEXUS HUD <span className="text-[#ff007f] font-normal text-xs">// HABIT & TASK COMMAND</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                SYSTEM TIME: <span className="text-[#00ff66]">{timeStr}</span>
              </p>
            </div>
          </div>

          {/* Quick HUD Metrics Bar */}
          <div className="flex items-center gap-3 text-xs font-mono">
            {/* Effort Telemetry */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0b0c16] border border-[#00f0ff]/30 shadow-inner">
              <span className="text-slate-400">EFFORT INDEX:</span>
              <span className="text-[#00ff66] font-bold text-sm">
                {telemetry.effortIndexPercent}%
              </span>
            </div>

            {/* Total Active Streak */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0b0c16] border border-[#ff007f]/30 shadow-inner">
              <Flame className="w-4 h-4 text-[#ff6600] animate-pulse" />
              <span className="text-slate-400">STREAK TIER:</span>
              <span className="text-[#ffe600] font-bold text-sm">
                {telemetry.totalStreak || 0} DAYS
              </span>
            </div>

            {/* Sound & Visual Toggles */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => {
                  const val = !audioEnabled;
                  setAudioEnabled(val);
                  cyberAudio.toggleAudio(val);
                  cyberAudio.playClick();
                }}
                title="Toggle Web Audio SFX"
                className={`p-2 rounded border transition ${
                  audioEnabled
                    ? 'border-[#00f0ff]/50 bg-[#00f0ff]/10 text-[#00f0ff]'
                    : 'border-slate-700 bg-slate-900 text-slate-500'
                }`}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  cyberAudio.playClick();
                  setBgGridEnabled(!bgGridEnabled);
                }}
                title="Toggle 3D Cyber Wireframe Grid"
                className={`p-2 rounded border transition ${
                  bgGridEnabled
                    ? 'border-[#ff007f]/50 bg-[#ff007f]/10 text-[#ff007f]'
                    : 'border-slate-700 bg-slate-900 text-slate-500'
                }`}
              >
                {bgGridEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Lower Row: Navigation Tabs */}
        <nav className="flex items-center gap-2 overflow-x-auto pt-3 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  cyberAudio.playClick();
                  setActiveTab(item.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wider uppercase transition-all duration-200 border rounded-t-md whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff] border-b-transparent shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#00f0ff]/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00f0ff]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
