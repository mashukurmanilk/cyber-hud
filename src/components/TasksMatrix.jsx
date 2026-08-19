import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { EFFORT_TIERS } from '../utils/streakLogic';
import { cyberAudio } from '../utils/audioSynth';
import EffortSelectModal from './EffortSelectModal';
import { Plus, CheckSquare, Square, Trash2, Edit2, Target, Calendar, Sparkles, Filter } from 'lucide-react';

export default function TasksMatrix() {
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) || [];
  const goals = useLiveQuery(() => db.goals.toArray(), []) || [];

  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [linkedGoalId, setLinkedGoalId] = useState('');
  const [linkedCheckpointId, setLinkedCheckpointId] = useState('');
  const [isDaily, setIsDaily] = useState(false);

  // Effort Modal State
  const [completingTask, setCompletingTask] = useState(null);

  const handleOpenAddModal = () => {
    cyberAudio.playClick();
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDueDate(new Date().toISOString().split('T')[0]);
    setLinkedGoalId('');
    setLinkedCheckpointId('');
    setIsDaily(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    cyberAudio.playClick();
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
    setLinkedGoalId(task.linkedGoalId || '');
    setLinkedCheckpointId(task.linkedCheckpointId || '');
    setIsDaily(task.isDaily || false);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    cyberAudio.playClick();
    if (!title.trim()) return;

    if (editingTask) {
      await db.tasks.update(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        dueDate,
        linkedGoalId: linkedGoalId || null,
        linkedCheckpointId: linkedCheckpointId || null,
        isDaily
      });
    } else {
      await db.tasks.add({
        id: 'task-' + Date.now(),
        title: title.trim(),
        description: description.trim(),
        dueDate,
        status: 'pending',
        effort: null,
        linkedGoalId: linkedGoalId || null,
        linkedCheckpointId: linkedCheckpointId || null,
        isDaily,
        completedAt: null,
        createdAt: new Date().toISOString()
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteTask = async (id) => {
    cyberAudio.playClick();
    if (window.confirm('CONFIRM DELETE: Purge task from cyber matrix?')) {
      await db.tasks.delete(id);
    }
  };

  const handleToggleComplete = async (task) => {
    cyberAudio.playClick();
    if (task.status === 'completed') {
      // Mark as pending again
      await db.tasks.update(task.id, {
        status: 'pending',
        effort: null,
        completedAt: null
      });
    } else {
      // Open effort tier selector
      setCompletingTask(task);
    }
  };

  const handleSelectEffort = async (effortTier) => {
    if (!completingTask) return;
    const todayStr = new Date().toISOString().split('T')[0];
    // We update status, but if isDaily, streakLogic will reset it tomorrow 
    // and log the effort into dailyEffortLogs.
    await db.tasks.update(completingTask.id, {
      status: 'completed',
      effort: effortTier,
      completedAt: todayStr
    });
    setCompletingTask(null);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'pending') return t.status === 'pending';
    if (filterStatus === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 cyber-panel hud-corner-tl p-4 rounded-lg">
        <div>
          <h2 className="text-base font-bold text-[#00f0ff] tracking-widest uppercase text-glow-cyan flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-[#00f0ff]" />
            TASKS MATRIX // OPERATIONAL ACTIONS
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage daily action subroutines linked to long-term objectives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter Buttons */}
          <div className="flex items-center bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-1 text-xs">
            <button
              onClick={() => { setFilterStatus('all'); cyberAudio.playClick(); }}
              className={`px-3 py-1 rounded ${filterStatus === 'all' ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-bold' : 'text-slate-400'}`}
            >
              ALL ({tasks.length})
            </button>
            <button
              onClick={() => { setFilterStatus('pending'); cyberAudio.playClick(); }}
              className={`px-3 py-1 rounded ${filterStatus === 'pending' ? 'bg-[#ffe600]/20 text-[#ffe600] font-bold' : 'text-slate-400'}`}
            >
              PENDING ({tasks.filter(t => t.status === 'pending').length})
            </button>
            <button
              onClick={() => { setFilterStatus('completed'); cyberAudio.playClick(); }}
              className={`px-3 py-1 rounded ${filterStatus === 'completed' ? 'bg-[#00ff66]/20 text-[#00ff66] font-bold' : 'text-slate-400'}`}
            >
              DONE ({tasks.filter(t => t.status === 'completed').length})
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/25 border border-[#00f0ff] text-[#00f0ff] font-bold text-xs rounded transition shadow-[0_0_12px_rgba(0,240,255,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE TASK</span>
          </button>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full cyber-panel p-8 text-center rounded-lg border border-[#00f0ff]/20 text-slate-500 text-xs">
            NO TASKS FOUND IN CURRENT PARAMETERS. CLICK "CREATE TASK" TO ADD AN ACTION ITEM.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            const effortInfo = task.effort ? EFFORT_TIERS[task.effort] : null;
            const linkedGoal = goals.find((g) => g.id === task.linkedGoalId);
            const linkedCheckpoint = linkedGoal ? (linkedGoal.subActionItems || []).find(c => c.id === task.linkedCheckpointId) : null;

            return (
              <div
                key={task.id}
                className={`cyber-panel p-4 rounded-lg border transition-all duration-200 ${
                  isDone
                    ? 'border-[#00ff66]/30 bg-[#07130c]/40'
                    : 'border-[#00f0ff]/30 hover:border-[#00f0ff]/60'
                } relative group`}
              >
                <div className="flex items-start gap-3">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 text-slate-400 hover:text-[#00ff66] transition cursor-pointer shrink-0"
                  >
                    {isDone ? (
                      <CheckSquare className="w-5 h-5 text-[#00ff66]" />
                    ) : (
                      <Square className="w-5 h-5 text-[#00f0ff]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`text-sm font-bold truncate ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {/* Effort Level Badge */}
                      {effortInfo && (
                        <span
                          style={{
                            color: effortInfo.color,
                            backgroundColor: effortInfo.bgColor,
                            borderColor: effortInfo.borderColor
                          }}
                          className="text-[10px] px-2 py-0.5 rounded border font-bold shrink-0 tracking-wider"
                        >
                          {effortInfo.label}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-400 pt-2 border-t border-[#00f0ff]/10">
                      <span className="flex items-center gap-1 text-[#00f0ff]">
                        <Calendar className="w-3.5 h-3.5" />
                        DUE: {task.dueDate || 'TODAY'}
                      </span>

                      {linkedGoal && (
                        <div className="flex flex-col gap-1 truncate">
                          <span className="flex items-center gap-1 text-[#ff007f]">
                            <Target className="w-3.5 h-3.5 shrink-0" />
                            GOAL: {linkedGoal.title}
                          </span>
                          {linkedCheckpoint && (
                            <span className="flex items-center gap-1 text-[#9d4edd] ml-4 text-[10px]">
                              ↳ CHECKPOINT: {linkedCheckpoint.title}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {task.isDaily && (
                        <span className="flex items-center gap-1 text-[#ffe600] border border-[#ffe600]/40 px-1.5 rounded">
                          [DAILY]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Edit / Delete) */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(task)}
                      className="p-1 text-slate-400 hover:text-[#00f0ff] transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
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

      {/* Task Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md cyber-panel hud-corner-tl border border-[#00f0ff]/50 p-6 rounded-lg shadow-2xl">
            <h3 className="text-sm font-bold tracking-widest text-[#00f0ff] uppercase mb-4">
              {editingTask ? 'EDIT TASK SUBROUTINE' : 'REGISTER NEW TASK SUBROUTINE'}
            </h3>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">TASK TITLE *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Refactor API handler module"
                  className="w-full bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">DESCRIPTION (OPTIONAL)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional context or technical specs..."
                  className="w-full bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">DUE DATE</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={isDaily}
                    className="w-full bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#00f0ff] disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">LINK TO GOAL</label>
                  <select
                    value={linkedGoalId}
                    onChange={(e) => { setLinkedGoalId(e.target.value); setLinkedCheckpointId(''); }}
                    className="w-full bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="">-- UNLINKED --</option>
                    {goals.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {linkedGoalId && (
                <div>
                  <label className="block text-slate-300 mb-1">LINK TO CHECKPOINT</label>
                  <select
                    value={linkedCheckpointId}
                    onChange={(e) => setLinkedCheckpointId(e.target.value)}
                    className="w-full bg-[#0b0c16] border border-[#00f0ff]/30 rounded p-2.5 text-slate-100 focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="">-- NO CHECKPOINT --</option>
                    {(goals.find(g => g.id === linkedGoalId)?.subActionItems || []).map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="isDailyToggle" 
                  checked={isDaily}
                  onChange={(e) => setIsDaily(e.target.checked)}
                  className="w-4 h-4 accent-[#00f0ff]"
                />
                <label htmlFor="isDailyToggle" className="text-slate-300">DAILY RECURRING (Resets at 00:00)</label>
              </div>

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
                  className="px-4 py-2 bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] font-bold rounded hover:bg-[#00f0ff]/30"
                >
                  SAVE SUBROUTINE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Effort Selection Modal */}
      <EffortSelectModal
        isOpen={Boolean(completingTask)}
        onClose={() => setCompletingTask(null)}
        onSelectEffort={handleSelectEffort}
        itemTitle={completingTask?.title}
      />
    </div>
  );
}
