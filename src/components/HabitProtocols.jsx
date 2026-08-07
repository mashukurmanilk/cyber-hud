import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { logHabitCompletion, EFFORT_TIERS } from '../utils/streakLogic';
import { cyberAudio } from '../utils/audioSynth';
import EffortSelectModal from './EffortSelectModal';
import { Zap, Flame, ShieldAlert, Plus, Edit2, Trash2, Calendar, Award, CheckCircle2, Clock, BarChart2, Activity, TrendingUp } from 'lucide-react';

export default function HabitProtocols() {
  const habits = useLiveQuery(() => db.habits.toArray(), []) || [];
  const [activeSubTab, setActiveSubTab] = useState('short_term'); // 'short_term' | 'long_term'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CODING');
  const [targetDuration, setTargetDuration] = useState(30);

  // Effort Modal State
  const [loggingHabit, setLoggingHabit] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenAdd = () => {
    cyberAudio.playClick();
    setEditingHabit(null);
    setTitle('');
    setDescription('');
    setCategory('CODING');
    setTargetDuration(30);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (habit) => {
    cyberAudio.playClick();
    setEditingHabit(habit);
    setTitle(habit.title);
    setDescription(habit.description || '');
    setCategory(habit.category || 'CODING');
    setTargetDuration(habit.targetDuration || 30);
    setIsModalOpen(true);
  };

  const handleSaveHabit = async (e) => {
    e.preventDefault();
    cyberAudio.playClick();
    if (!title.trim()) return;

    const durationNum = parseInt(targetDuration, 10) || 30;
    const isLongTerm = durationNum > 30;

    if (editingHabit) {
      await db.habits.update(editingHabit.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        targetDuration: durationNum,
        type: isLongTerm ? 'long_term' : 'short_term'
      });
    } else {
      await db.habits.add({
        id: 'habit-' + Date.now(),
        title: title.trim(),
        description: description.trim(),
        category,
        creationDate: todayStr,
        targetDuration: durationNum,
        type: isLongTerm ? 'long_term' : 'short_term',
        currentStreak: 0,
        consecutiveMisses: 0,
        dailyEffortLogs: []
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteHabit = async (id) => {
    cyberAudio.playClick();
    if (window.confirm('CONFIRM DELETE: Remove habit protocol permanently?')) {
      await db.habits.delete(id);
    }
  };

  const handleSelectEffort = async (effortTier) => {
    if (!loggingHabit) return;
    await logHabitCompletion(loggingHabit.id, effortTier);
    setLoggingHabit(null);
  };

  // Filter short-term vs long-term (auto-promote if targetDuration > 30)
  const shortTermHabits = habits.filter(
    (h) => (h.targetDuration <= 30 && h.type !== 'long_term')
  );
  const longTermHabits = habits.filter(
    (h) => (h.targetDuration > 30 || h.type === 'long_term')
  );

  const displayedHabits = activeSubTab === 'short_term' ? shortTermHabits : longTermHabits;

  // Helper to build 14-day history pills for a habit
  const get14DayHistory = (habit) => {
    const history = [];
    const logsMap = {};
    (habit.dailyEffortLogs || []).forEach((l) => {
      logsMap[l.date] = l.effort;
    });

    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const effort = logsMap[dateStr] || 'none';
      history.push({ date: dateStr, effort });
    }
    return history;
  };

  // Overall Habit Telemetry metrics
  const totalHabitLogs = habits.reduce((acc, h) => acc + (h.dailyEffortLogs || []).length, 0);
  const maxStreak = habits.reduce((acc, h) => Math.max(acc, h.currentStreak || 0), 0);
  const totalStreaksCombined = habits.reduce((acc, h) => acc + (h.currentStreak || 0), 0);

  return (
    <div className="space-y-6 font-mono">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 cyber-panel hud-corner-tl p-4 rounded-lg">
        <div>
          <h2 className="text-base font-bold text-[#00f0ff] tracking-widest uppercase text-glow-cyan flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#00f0ff]" />
            HABIT PROTOCOLS // BEHAVIORAL MATRIX & VISUAL PROGRESS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track short-term (&le;30 days) and long-term (&gt;30 days) routines with visual streak telemetry.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#ff007f]/10 hover:bg-[#ff007f]/25 border border-[#ff007f] text-[#ff007f] font-bold text-xs rounded transition shadow-[0_0_12px_rgba(255,0,127,0.3)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>NEW HABIT PROTOCOL</span>
        </button>
      </div>

      {/* Visual Habit Progress Overview Card */}
      <div className="cyber-panel p-5 rounded-lg border border-[#00f0ff]/30 space-y-4">
        <h3 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00ff66]" />
          HABIT DOMAIN VISUAL TELEMETRY & PROGRESS METRICS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#0b0c16] border border-[#00f0ff]/20 rounded flex items-center justify-between">
            <div>
              <span className="text-slate-400">COMBINED STREAK:</span>
              <div className="text-lg font-bold text-[#ffe600] flex items-center gap-1 mt-0.5">
                <Flame className="w-4 h-4 text-[#ff6600] animate-pulse" />
                {totalStreaksCombined} DAYS
              </div>
            </div>
            <span className="text-[10px] text-slate-500">MAX: {maxStreak}d</span>
          </div>

          <div className="p-3 bg-[#0b0c16] border border-[#00f0ff]/20 rounded flex items-center justify-between">
            <div>
              <span className="text-slate-400">TOTAL EFFORT LOGS:</span>
              <div className="text-lg font-bold text-[#00ff66] mt-0.5">{totalHabitLogs} DISPATCHES</div>
            </div>
            <Activity className="w-5 h-5 text-[#00ff66]" />
          </div>

          <div className="p-3 bg-[#0b0c16] border border-[#00f0ff]/20 rounded flex items-center justify-between">
            <div>
              <span className="text-slate-400">PROTOCOLS ACTIVE:</span>
              <div className="text-lg font-bold text-[#ff007f] mt-0.5">
                {shortTermHabits.length} SHORT / {longTermHabits.length} LONG
              </div>
            </div>
            <Award className="w-5 h-5 text-[#ff007f]" />
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Short-Term vs Long-Term */}
      <div className="flex items-center gap-3 border-b border-[#00f0ff]/20 pb-3">
        <button
          onClick={() => { setActiveSubTab('short_term'); cyberAudio.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wider rounded border transition ${
            activeSubTab === 'short_term'
              ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
              : 'bg-[#0b0c16] text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>SHORT-TERM HABITS (&le; 30 DAYS) [{shortTermHabits.length}]</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('long_term'); cyberAudio.playClick(); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-wider rounded border transition ${
            activeSubTab === 'long_term'
              ? 'bg-[#ff007f]/20 text-[#ff007f] border-[#ff007f] shadow-[0_0_15px_rgba(255,0,127,0.3)]'
              : 'bg-[#0b0c16] text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>LONG-TERM HABITS (&gt; 30 DAYS) [{longTermHabits.length}]</span>
        </button>
      </div>

      {/* Habits Cards with Visual Progress Bars & Mini 14-Day Spectrum Timelines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayedHabits.length === 0 ? (
          <div className="col-span-full cyber-panel p-8 text-center rounded-lg border border-[#00f0ff]/20 text-slate-500 text-xs">
            NO {activeSubTab === 'short_term' ? 'SHORT-TERM' : 'LONG-TERM'} HABITS FOUND.
            CLICK "NEW HABIT PROTOCOL" TO REGISTER ONE.
          </div>
        ) : (
          displayedHabits.map((habit) => {
            const hasLoggedToday = (habit.dailyEffortLogs || []).some(
              (l) => l.date === todayStr
            );
            const todayLog = (habit.dailyEffortLogs || []).find((l) => l.date === todayStr);

            // Calculate progress towards target duration
            const targetDurationDays = habit.targetDuration || 30;
            const progressPercent = Math.min(
              100,
              Math.round(((habit.currentStreak || 0) / targetDurationDays) * 100)
            );

            // 14-day history spectrum
            const history14Days = get14DayHistory(habit);

            return (
              <div
                key={habit.id}
                className="cyber-panel p-5 rounded-lg border border-[#00f0ff]/30 hover:border-[#00f0ff]/60 transition-all duration-200 flex flex-col justify-between group space-y-4"
              >
                <div>
                  {/* Category & Status Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 font-bold uppercase tracking-wider">
                      {habit.category || 'CYBERNETICS'}
                    </span>

                    {/* Streak & Miss Counters */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-[#ffe600] font-bold">
                        <Flame className="w-4 h-4 text-[#ff6600] animate-pulse" />
                        {habit.currentStreak} DAY STREAK
                      </span>

                      {habit.consecutiveMisses > 0 && (
                        <span className="flex items-center gap-1 text-[#ff0055] font-bold text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          MISS: {habit.consecutiveMisses}/3
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-[#00f0ff] transition-colors">
                    {habit.title}
                  </h3>
                  {habit.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {habit.description}
                    </p>
                  )}

                  {/* Visual Progress Bar towards Target Duration */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">TARGET DURATION PROGRESS:</span>
                      <span className="text-[#00ff66] font-bold">
                        {habit.currentStreak} / {targetDurationDays} DAYS ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#0b0c16] rounded-full h-2 border border-[#00f0ff]/30 overflow-hidden">
                      <div
                        style={{ width: `${progressPercent}%` }}
                        className="h-full bg-gradient-to-r from-[#00f0ff] via-[#00ff66] to-[#ffe600] transition-all duration-500 shadow-[0_0_8px_#00ff66]"
                      />
                    </div>
                  </div>

                  {/* Visual 14-Day Effort History Spectrum */}
                  <div className="mt-3 pt-2 border-t border-[#00f0ff]/10">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                      14-DAY EFFORT HISTORY SPECTRUM:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {history14Days.map((tile) => {
                        let tileBg = '#1e293b';
                        let tileBorder = '#334155';
                        if (tile.effort === 'full') { tileBg = '#00ff66'; tileBorder = '#00ff66'; }
                        else if (tile.effort === 'partial') { tileBg = '#ffe600'; tileBorder = '#ffe600'; }
                        else if (tile.effort === 'lazy') { tileBg = '#ff6600'; tileBorder = '#ff6600'; }
                        else if (tile.effort === 'zero') { tileBg = '#ff0055'; tileBorder = '#ff0055'; }

                        return (
                          <div
                            key={tile.date}
                            style={{ backgroundColor: tileBg, borderColor: tileBorder }}
                            className="flex-1 h-3 rounded-sm border opacity-90 hover:opacity-100 transition"
                            title={`${tile.date}: ${tile.effort.toUpperCase()}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-4 pt-3 border-t border-[#00f0ff]/15 flex items-center justify-between">
                  {hasLoggedToday ? (
                    <div className="flex items-center gap-2 text-xs text-[#00ff66] font-bold">
                      <CheckCircle2 className="w-4 h-4 text-[#00ff66]" />
                      <span>LOGGED TODAY ({todayLog?.effort?.toUpperCase()})</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        cyberAudio.playClick();
                        setLoggingHabit(habit);
                      }}
                      className="px-4 py-1.5 bg-[#00ff66]/15 hover:bg-[#00ff66]/30 text-[#00ff66] border border-[#00ff66]/60 rounded text-xs font-bold transition cursor-pointer"
                    >
                      LOG TODAY'S EFFORT
                    </button>
                  )}

                  {/* Edit & Delete */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(habit)}
                      className="p-1 text-slate-400 hover:text-[#00f0ff] transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-1 text-slate-400 hover:text-[#ff0055] transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Habit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md cyber-panel hud-corner-tl border border-[#00f0ff]/50 p-6 rounded-lg shadow-2xl">
            <h3 className="text-sm font-bold tracking-widest text-[#00f0ff] uppercase mb-4">
              {editingHabit ? 'EDIT HABIT PROTOCOL' : 'NEW HABIT PROTOCOL'}
            </h3>

            <form onSubmit={handleSaveHabit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">HABIT TITLE *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 30-Min Kinetic Workout"
                  className="w-full bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Routine details or biometric target..."
                  className="w-full bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="CODING">CODING</option>
                    <option value="HEALTH">HEALTH</option>
                    <option value="MIND">MIND</option>
                    <option value="FITNESS">FITNESS</option>
                    <option value="CYBERNETICS">CYBERNETICS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">TARGET DURATION (DAYS)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={targetDuration}
                    onChange={(e) => setTargetDuration(e.target.value)}
                    className="w-full bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#00f0ff]"
                  />
                </div>
              </div>

              {parseInt(targetDuration, 10) > 30 && (
                <p className="text-[#ff007f] text-[11px] italic">
                  ★ Target duration exceeds 30 days &mdash; will automatically register as a LONG-TERM HABIT.
                </p>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#00f0ff]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded text-slate-400 hover:text-slate-200"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ff007f]/20 border border-[#ff007f] text-[#ff007f] font-bold rounded hover:bg-[#ff007f]/30"
                >
                  SAVE PROTOCOL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Effort Selection Modal */}
      <EffortSelectModal
        isOpen={Boolean(loggingHabit)}
        onClose={() => setLoggingHabit(null)}
        onSelectEffort={handleSelectEffort}
        itemTitle={loggingHabit?.title}
      />
    </div>
  );
}
