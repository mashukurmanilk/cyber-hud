import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { EFFORT_TIERS } from '../utils/streakLogic';
import { cyberAudio } from '../utils/audioSynth';
import { Shield, Flame, CheckSquare, Zap, Target, AlertTriangle, ArrowRight, Activity, Award } from 'lucide-react';

export default function DashboardOverview({ setActiveTab, telemetry }) {
  const habits = useLiveQuery(() => db.habits.toArray(), []) || [];
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) || [];
  const goals = useLiveQuery(() => db.goals.toArray(), []) || [];

  const todayStr = new Date().toISOString().split('T')[0];

  const habitsNeedingAttention = habits.filter(
    (h) => ! (h.dailyEffortLogs || []).some((l) => l.date === todayStr)
  );

  const habitsAtRisk = habits.filter(
    (h) => h.consecutiveMisses >= 2 && !(h.dailyEffortLogs || []).some((l) => l.date === todayStr)
  );

  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  return (
    <div className="space-y-6 font-mono">
      {/* Top Warning Banner if habits are at risk of streak reset */}
      {habitsAtRisk.length > 0 && (
        <div className="p-4 rounded-lg bg-[#ff0055]/15 border-2 border-[#ff0055] text-slate-100 flex items-center justify-between gap-4 animate-cyber-pulse shadow-[0_0_20px_rgba(255,0,85,0.4)]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-[#ff0055] shrink-0" />
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#ff0055] uppercase tracking-wider">
                CRITICAL WARNING: {habitsAtRisk.length} HABIT PROTOCOL(S) NEAR STREAK RESET
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                2 consecutive misses logged! Log today's effort to preserve your consistency streak.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              cyberAudio.playClick();
              setActiveTab('habits');
            }}
            className="px-4 py-2 bg-[#ff0055]/20 hover:bg-[#ff0055]/40 border border-[#ff0055] text-xs font-bold text-[#ff0055] rounded shrink-0 uppercase tracking-wider"
          >
            RESOLVE NOW
          </button>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Effort Index */}
        <div className="cyber-panel hud-corner-tl p-4 rounded-lg border border-[#00f0ff]/40 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest">EFFORT INDEX</p>
            <h3 className="text-2xl font-black text-[#00ff66] text-glow-green mt-1">
              {telemetry.effortIndexPercent}%
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Weighted capacity score</p>
          </div>
          <div className="w-10 h-10 rounded bg-[#00ff66]/10 border border-[#00ff66]/40 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#00ff66]" />
          </div>
        </div>

        {/* Metric 2: Active Streaks */}
        <div className="cyber-panel hud-corner-tl p-4 rounded-lg border border-[#ff007f]/40 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest">HABIT STREAKS</p>
            <h3 className="text-2xl font-black text-[#ffe600] text-glow-yellow mt-1">
              {telemetry.totalStreak} <span className="text-xs text-slate-400 font-normal">DAYS</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Consecutive consistency</p>
          </div>
          <div className="w-10 h-10 rounded bg-[#ff6600]/10 border border-[#ff6600]/40 flex items-center justify-center">
            <Flame className="w-5 h-5 text-[#ff6600] animate-pulse" />
          </div>
        </div>

        {/* Metric 3: Operational Tasks */}
        <div className="cyber-panel hud-corner-tl p-4 rounded-lg border border-[#00f0ff]/40 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest">PENDING TASKS</p>
            <h3 className="text-2xl font-black text-[#00f0ff] text-glow-cyan mt-1">
              {pendingTasks.length} / {tasks.length}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Active action items</p>
          </div>
          <div className="w-10 h-10 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-[#00f0ff]" />
          </div>
        </div>

        {/* Metric 4: Long-Term Goals */}
        <div className="cyber-panel hud-corner-tl p-4 rounded-lg border border-[#9d4edd]/40 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest">ACTIVE GOALS</p>
            <h3 className="text-2xl font-black text-[#9d4edd] mt-1">{goals.length}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Strategic objectives</p>
          </div>
          <div className="w-10 h-10 rounded bg-[#9d4edd]/10 border border-[#9d4edd]/40 flex items-center justify-center">
            <Target className="w-5 h-5 text-[#9d4edd]" />
          </div>
        </div>
      </div>

      {/* Row 2: Today's Action Center & Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Habits Pending Effort Log */}
        <div className="cyber-panel p-5 rounded-lg border border-[#00f0ff]/30 space-y-4">
          <div className="flex items-center justify-between border-b border-[#00f0ff]/20 pb-3">
            <h3 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#00f0ff]" />
              TODAY'S HABIT EFFORT DISPATCH ({habitsNeedingAttention.length} PENDING)
            </h3>
            <button
              onClick={() => {
                cyberAudio.playClick();
                setActiveTab('habits');
              }}
              className="text-xs text-[#00f0ff] hover:underline flex items-center gap-1"
            >
              VIEW ALL <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {habitsNeedingAttention.length === 0 ? (
              <div className="p-4 rounded bg-[#07130c]/50 border border-[#00ff66]/30 text-center text-xs text-[#00ff66]">
                ★ ALL DAILY HABIT EFFORTS LOGGED FOR TODAY. SYSTEM IN OPTIMAL STATE.
              </div>
            ) : (
              habitsNeedingAttention.slice(0, 3).map((h) => (
                <div
                  key={h.id}
                  className="p-3 rounded bg-[#0b0c16] border border-[#00f0ff]/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="text-[10px] text-[#00f0ff] font-bold uppercase">
                      [{h.type === 'long_term' ? 'LONG-TERM' : 'SHORT-TERM'}]
                    </span>
                    <h4 className="font-bold text-slate-200 mt-0.5">{h.title}</h4>
                  </div>
                  <button
                    onClick={() => {
                      cyberAudio.playClick();
                      setActiveTab('habits');
                    }}
                    className="px-3 py-1 bg-[#00ff66]/15 border border-[#00ff66]/60 text-[#00ff66] font-bold text-xs rounded hover:bg-[#00ff66]/30 transition"
                  >
                    LOG EFFORT
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Goals Progress Summary */}
        <div className="cyber-panel p-5 rounded-lg border border-[#9d4edd]/30 space-y-4">
          <div className="flex items-center justify-between border-b border-[#9d4edd]/20 pb-3">
            <h3 className="text-xs font-bold text-[#9d4edd] uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#9d4edd]" />
              STRATEGIC GOAL TELEMETRY
            </h3>
            <button
              onClick={() => {
                cyberAudio.playClick();
                setActiveTab('goals');
              }}
              className="text-xs text-[#9d4edd] hover:underline flex items-center gap-1"
            >
              GOALS MATRIX <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">NO GOALS REGISTERED</p>
            ) : (
              goals.slice(0, 3).map((g) => {
                const subItems = g.subActionItems || [];
                const completedCount = subItems.filter((s) => s.completed).length;
                const percent = subItems.length
                  ? Math.round((completedCount / subItems.length) * 100)
                  : 0;

                return (
                  <div key={g.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center text-slate-200 font-bold">
                      <span className="truncate">{g.title}</span>
                      <span className="text-[#00ff66]">{percent}%</span>
                    </div>
                    <div className="w-full bg-[#0b0c16] rounded-full h-1.5 border border-[#9d4edd]/30 overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-gradient-to-r from-[#9d4edd] to-[#00ff66]"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
