import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { EFFORT_TIERS } from '../utils/streakLogic';
import { cyberAudio } from '../utils/audioSynth';
import EffortSelectModal from './EffortSelectModal';
import { Target, Plus, CheckSquare, Square, Trash2, Edit2, Calendar, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function LongTermGoals() {
  const goals = useLiveQuery(() => db.goals.toArray(), []) || [];
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  // Goal Form Modal State
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('2026-12-31');
  const [goalCategory, setGoalCategory] = useState('CYBERNETICS');

  // Checkpoint Form State
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [activeGoalIdForSub, setActiveGoalIdForSub] = useState(null);
  const [subTitle, setSubTitle] = useState('');

  // Effort Modal State
  const [completingSub, setCompletingSub] = useState(null); // { goalId, subId, subTitle }

  const handleOpenAddGoal = () => {
    cyberAudio.playClick();
    setEditingGoal(null);
    setGoalTitle('');
    setGoalDescription('');
    setGoalTargetDate('2026-12-31');
    setGoalCategory('CYBERNETICS');
    setIsGoalModalOpen(true);
  };

  const handleOpenEditGoal = (g) => {
    cyberAudio.playClick();
    setEditingGoal(g);
    setGoalTitle(g.title);
    setGoalDescription(g.description || '');
    setGoalTargetDate(g.targetDate || '2026-12-31');
    setGoalCategory(g.category || 'CYBERNETICS');
    setIsGoalModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    cyberAudio.playClick();
    if (!goalTitle.trim()) return;

    if (editingGoal) {
      await db.goals.update(editingGoal.id, {
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        targetDate: goalTargetDate,
        category: goalCategory
      });
    } else {
      await db.goals.add({
        id: 'goal-' + Date.now(),
        title: goalTitle.trim(),
        description: goalDescription.trim(),
        targetDate: goalTargetDate,
        category: goalCategory,
        status: 'in_progress',
        subActionItems: []
      });
    }

    setIsGoalModalOpen(false);
  };

  const handleDeleteGoal = async (id) => {
    cyberAudio.playClick();
    if (window.confirm('CONFIRM DELETE: Erase long-term goal objective?')) {
      await db.goals.delete(id);
    }
  };

  // Add Checkpoint to Goal
  const handleOpenAddSub = (goalId) => {
    cyberAudio.playClick();
    setActiveGoalIdForSub(goalId);
    setSubTitle('');
    setIsSubModalOpen(true);
  };

  const handleSaveSubItem = async (e) => {
    e.preventDefault();
    cyberAudio.playClick();
    if (!subTitle.trim() || !activeGoalIdForSub) return;

    const goal = await db.goals.get(activeGoalIdForSub);
    if (!goal) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newItems = [
      ...(goal.subActionItems || []),
      {
        id: 'sub-' + Date.now(),
        title: subTitle.trim(),
        completed: false,
        effort: null,
        lastUpdated: todayStr
      }
    ];

    await db.goals.update(activeGoalIdForSub, { subActionItems: newItems });
    setIsSubModalOpen(false);
  };

  const handleDeleteSubItem = async (goalId, subId) => {
    cyberAudio.playClick();
    const goal = await db.goals.get(goalId);
    if (!goal) return;

    const updated = (goal.subActionItems || []).filter((s) => s.id !== subId);
    await db.goals.update(goalId, { subActionItems: updated });
  };

  const handleToggleSubComplete = async (goalId, sub) => {
    cyberAudio.playClick();
    const goal = await db.goals.get(goalId);
    if (!goal) return;

    if (sub.completed) {
      // Uncheck
      const updated = (goal.subActionItems || []).map((s) =>
        s.id === sub.id ? { ...s, completed: false, effort: null } : s
      );
      await db.goals.update(goalId, { subActionItems: updated });
    } else {
      // Open Effort Selection Modal
      setCompletingSub({ goalId, subId: sub.id, subTitle: sub.title });
    }
  };

  const handleSelectEffortForSub = async (effortTier) => {
    if (!completingSub) return;
    const { goalId, subId } = completingSub;
    const goal = await db.goals.get(goalId);
    if (!goal) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const updated = (goal.subActionItems || []).map((s) =>
      s.id === subId ? { ...s, completed: true, effort: effortTier, lastUpdated: todayStr } : s
    );

    await db.goals.update(goalId, { subActionItems: updated });
    setCompletingSub(null);
  };

  // Calculate effort-weighted completion rate for goal
  const calculateGoalProgress = (subActionItems = []) => {
    if (subActionItems.length === 0) return 0;
    let totalScore = 0;

    subActionItems.forEach((item) => {
      if (item.completed) {
        const score = EFFORT_TIERS[item.effort]?.score || 1.0;
        totalScore += score;
      }
    });

    return Math.round((totalScore / subActionItems.length) * 100);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 cyber-panel hud-corner-tl p-4 rounded-lg">
        <div>
          <h2 className="text-base font-bold text-[#00f0ff] tracking-widest uppercase text-glow-cyan flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00f0ff]" />
            LONG-TERM GOALS // STRATEGIC OBJECTIVES
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            High-level mission milestones with key checkpoints.
          </p>
        </div>

        <button
          onClick={handleOpenAddGoal}
          className="flex items-center gap-2 px-4 py-2 bg-[#9d4edd]/10 hover:bg-[#9d4edd]/25 border border-[#9d4edd] text-[#9d4edd] font-bold text-xs rounded transition shadow-[0_0_12px_rgba(157,78,221,0.3)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTER LONG-TERM GOAL</span>
        </button>
      </div>

      {/* Goals Cards */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="cyber-panel p-8 text-center rounded-lg border border-[#00f0ff]/20 text-slate-500 text-xs">
            NO LONG-TERM GOALS REGISTERED. CLICK "REGISTER LONG-TERM GOAL" TO BEGIN.
          </div>
        ) : (
          goals.map((goal) => {
            const subItems = goal.subActionItems || [];
            const progress = calculateGoalProgress(subItems);
            const isExpanded = expandedGoalId === goal.id;

            return (
              <div
                key={goal.id}
                className="cyber-panel p-5 rounded-lg border border-[#9d4edd]/40 hover:border-[#9d4edd]/70 transition-all duration-200"
              >
                {/* Goal Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#9d4edd]/15 text-[#9d4edd] border border-[#9d4edd]/40 font-bold uppercase tracking-wider">
                        {goal.category || 'OBJECTIVE'}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#00f0ff]" />
                        TARGET: {goal.targetDate || '2026-12-31'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-slate-400 mt-1">{goal.description}</p>
                    )}
                  </div>

                  {/* Progress Telemetry Gauge */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-slate-400 font-mono">COMPLETION:</div>
                      <div className="text-lg font-bold text-[#00ff66] text-glow-green">
                        {progress}%
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditGoal(goal)}
                        className="p-1.5 text-slate-400 hover:text-[#00f0ff] transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1.5 text-slate-400 hover:text-[#ff0055] transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          cyberAudio.playClick();
                          setExpandedGoalId(isExpanded ? null : goal.id);
                        }}
                        className="p-1.5 text-[#00f0ff] hover:bg-[#00f0ff]/10 rounded transition"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cyber Progress Bar */}
                <div className="mt-4 w-full bg-[#0b0c16] rounded-full h-2 border border-[#00f0ff]/30 overflow-hidden">
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-[#00f0ff] via-[#00ff66] to-[#ffe600] transition-all duration-500 shadow-[0_0_10px_#00ff66]"
                  />
                </div>

                {/* Expanded Checkpoints List */}
                {isExpanded && (
                  <div className="mt-5 pt-4 border-t border-[#9d4edd]/20 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#ffe600]" />
                        CHECKPOINTS ({subItems.filter(s => s.completed).length}/{subItems.length})
                      </h4>

                      <button
                        onClick={() => handleOpenAddSub(goal.id)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 rounded transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>ADD CHECKPOINT</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {subItems.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">
                          No checkpoints defined. Add milestones to track this goal's progress.
                        </p>
                      ) : (
                        subItems.map((sub) => {
                          const effortInfo = sub.effort ? EFFORT_TIERS[sub.effort] : null;

                          return (
                            <div
                              key={sub.id}
                              className="flex items-center justify-between gap-3 p-2.5 rounded bg-[#0b0c16]/80 border border-[#00f0ff]/20 hover:border-[#00f0ff]/40 transition text-xs"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <button
                                  onClick={() => handleToggleSubComplete(goal.id, sub)}
                                  className="text-slate-400 hover:text-[#00ff66] transition cursor-pointer shrink-0"
                                >
                                  {sub.completed ? (
                                    <CheckSquare className="w-4 h-4 text-[#00ff66]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-[#00f0ff]" />
                                  )}
                                </button>
                                <span
                                  className={`truncate ${
                                    sub.completed ? 'line-through text-slate-400' : 'text-slate-200'
                                  }`}
                                >
                                  {sub.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {effortInfo && (
                                  <span
                                    style={{
                                      color: effortInfo.color,
                                      backgroundColor: effortInfo.bgColor,
                                      borderColor: effortInfo.borderColor
                                    }}
                                    className="text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase tracking-wider"
                                  >
                                    {effortInfo.label}
                                  </span>
                                )}
                                <button
                                  onClick={() => handleDeleteSubItem(goal.id, sub.id)}
                                  className="text-slate-500 hover:text-[#ff0055] transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Register Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md cyber-panel hud-corner-tl border border-[#9d4edd]/50 p-6 rounded-lg shadow-2xl">
            <h3 className="text-sm font-bold tracking-widest text-[#9d4edd] uppercase mb-4">
              {editingGoal ? 'EDIT STRATEGIC OBJECTIVE' : 'REGISTER STRATEGIC OBJECTIVE'}
            </h3>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">GOAL OBJECTIVE TITLE *</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Deploy Cyber Neural Grid"
                  className="w-full bg-[#0b0c16] border border-[#9d4edd]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#9d4edd]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="High-level mission objective outline..."
                  className="w-full bg-[#0b0c16] border border-[#9d4edd]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#9d4edd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">CATEGORY</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full bg-[#0b0c16] border border-[#9d4edd]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#9d4edd]"
                  >
                    <option value="CYBERNETICS">CYBERNETICS</option>
                    <option value="HEALTH">HEALTH</option>
                    <option value="CODING">CODING</option>
                    <option value="MIND">MIND</option>
                    <option value="CAREER">CAREER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">TARGET DATE</label>
                  <input
                    type="date"
                    value={goalTargetDate}
                    onChange={(e) => setGoalTargetDate(e.target.value)}
                    className="w-full bg-[#0b0c16] border border-[#9d4edd]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#9d4edd]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#9d4edd]/20">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded text-slate-400 hover:text-slate-200"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#9d4edd]/20 border border-[#9d4edd] text-[#9d4edd] font-bold rounded hover:bg-[#9d4edd]/30"
                >
                  SAVE GOAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Checkpoint Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md cyber-panel border border-[#00f0ff]/50 p-6 rounded-lg shadow-2xl">
            <h3 className="text-sm font-bold tracking-widest text-[#00f0ff] uppercase mb-4">
              ADD GOAL CHECKPOINT
            </h3>

            <form onSubmit={handleSaveSubItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">CHECKPOINT TITLE *</label>
                <input
                  type="text"
                  required
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  placeholder="e.g. Complete 3 chapters of Neural Net architecture"
                  className="w-full bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#00f0ff]/20">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 border border-slate-700 rounded text-slate-400 hover:text-slate-200"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] font-bold rounded hover:bg-[#00f0ff]/30"
                >
                  ADD CHECKPOINT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Effort Selection Modal for Checkpoint */}
      <EffortSelectModal
        isOpen={Boolean(completingSub)}
        onClose={() => setCompletingSub(null)}
        onSelectEffort={handleSelectEffortForSub}
        itemTitle={completingSub?.subTitle}
      />
    </div>
  );
}
