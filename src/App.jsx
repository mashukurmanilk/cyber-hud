import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedSampleData } from './db/database';
import { runDailyStateChecker, calculateEffortTelemetry } from './utils/streakLogic';
import CyberGridBackground from './components/CyberGridBackground';
import TerminalWelcome from './components/TerminalWelcome';
import HUDHeader from './components/HUDHeader';
import DashboardOverview from './components/DashboardOverview';
import TasksMatrix from './components/TasksMatrix';
import HabitProtocols from './components/HabitProtocols';
import LongTermGoals from './components/LongTermGoals';
import VisualAnalytics from './components/VisualAnalytics';
import DataNexus from './components/DataNexus';

export default function App() {
  const [showTerminal, setShowTerminal] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [bgGridEnabled, setBgGridEnabled] = useState(true);

  // Reactive DB queries
  const habits = useLiveQuery(() => db.habits.toArray(), []) || [];
  const tasks = useLiveQuery(() => db.tasks.toArray(), []) || [];
  const goals = useLiveQuery(() => db.goals.toArray(), []) || [];

  // Initialize DB and run Daily State Checker
  useEffect(() => {
    async function initSystem() {
      await seedSampleData();
      await runDailyStateChecker();
    }
    initSystem();
  }, []);

  // Compute live telemetry for HUD header & dashboard
  const telemetry = React.useMemo(() => {
    const base = calculateEffortTelemetry(habits, tasks, goals);
    const totalStreak = habits.reduce((acc, h) => acc + (h.currentStreak || 0), 0);
    return { ...base, totalStreak };
  }, [habits, tasks, goals]);

  return (
    <div className="min-h-screen bg-[#06070c] text-slate-200 relative overflow-hidden font-mono selection:bg-[#00f0ff] selection:text-black">
      {/* Retrosynth 3D Canvas Background */}
      <CyberGridBackground enabled={bgGridEnabled} />

      {/* Cyber Boot Terminal Overlay */}
      {showTerminal ? (
        <TerminalWelcome
          onEnterHUD={() => setShowTerminal(false)}
          audioEnabled={audioEnabled}
          setAudioEnabled={setAudioEnabled}
        />
      ) : (
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* HUD Top Bar Navigation */}
          <HUDHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            telemetry={telemetry}
            audioEnabled={audioEnabled}
            setAudioEnabled={setAudioEnabled}
            bgGridEnabled={bgGridEnabled}
            setBgGridEnabled={setBgGridEnabled}
          />

          {/* Main App Content Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 my-2">
            {activeTab === 'dashboard' && (
              <DashboardOverview setActiveTab={setActiveTab} telemetry={telemetry} />
            )}
            {activeTab === 'tasks' && <TasksMatrix />}
            {activeTab === 'habits' && <HabitProtocols />}
            {activeTab === 'goals' && <LongTermGoals />}
            {activeTab === 'analytics' && <VisualAnalytics />}
            {activeTab === 'nexus' && <DataNexus />}
          </main>

          {/* Sci-Fi Footer Bar */}
          <footer className="bg-[#04050a]/90 backdrop-blur border-t border-[#00f0ff]/20 py-3 text-center text-xs text-slate-500 font-mono">
            <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#00f0ff]">
                NEXUS HUD // VERSION 2.077 &mdash; OPERATIONAL STATE: OPTIMAL
              </span>
              <span className="text-slate-400">
                PERSISTENT LOCAL STORAGE: INDEXEDDB (DEXIE)
              </span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
