import Dexie from 'dexie';

export const db = new Dexie('CyberHUDTrackerDB');

// Define database schema
db.version(1).stores({
  tasks: 'id, title, dueDate, status, effort, linkedGoalId, createdAt',
  habits: 'id, title, category, targetDuration, type, currentStreak, consecutiveMisses, creationDate',
  goals: 'id, title, targetDate, category, status',
  systemLogs: 'id, timestamp, type, message'
});

// Helper function to seed initial sci-fi demo data if database is empty
export async function seedSampleData() {
  const isInitialized = await db.systemLogs.get('log-001');

  if (isInitialized) {
    return; // Already initialized
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const prevDateStr = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];

  // Seed Long-Term Goals
  const sampleGoalId = 'goal-cyber-01';
  await db.goals.add({
    id: sampleGoalId,
    title: 'MASTER QUANTUM NEURAL ARCHITECTURE',
    description: 'Build and deploy deep neural subroutines to automate cyber-defense grid.',
    targetDate: '2026-12-31',
    category: 'CYBERNETICS',
    status: 'in_progress',
    subActionItems: [
      { id: 'sub-1', title: 'Complete Advanced Neural Net Algorithm Course', completed: true, effort: 'full', lastUpdated: yesterdayStr },
      { id: 'sub-2', title: 'Implement Tensor-Matrix GPU Acceleration Subroutine', completed: true, effort: 'partial', lastUpdated: todayStr },
      { id: 'sub-3', title: 'Optimize Memory Overhead & Latency (<5ms)', completed: false, effort: null, lastUpdated: todayStr },
      { id: 'sub-4', title: 'Deploy Autonomous Agent to Production Grid', completed: false, effort: null, lastUpdated: todayStr }
    ]
  });

  await db.goals.add({
    id: 'goal-cyber-02',
    title: 'PHYSICAL CONDITIONING & CYBER-AUGMENTATION',
    description: 'Maintain peak physiological biometric performance and mobility.',
    targetDate: '2026-11-30',
    category: 'HEALTH',
    status: 'in_progress',
    subActionItems: [
      { id: 'sub-201', title: '30-Minute High Intensity Kinetic Cardio Protocol', completed: true, effort: 'full', lastUpdated: todayStr },
      { id: 'sub-202', title: 'Hydration Protocol: 3.5 Liters Electrolyte Liquid', completed: true, effort: 'full', lastUpdated: todayStr },
      { id: 'sub-203', title: 'Postural Alignment & Flexibility Conditioning', completed: false, effort: null, lastUpdated: todayStr }
    ]
  });

  // Seed Habits
  // Short-Term Habit (targetDuration <= 30)
  await db.habits.add({
    id: 'habit-1',
    title: '15-MIN CYBER CODING SPRINT',
    description: 'Daily hyper-focused coding exercise without distractions.',
    category: 'CODING',
    creationDate: prevDateStr,
    targetDuration: 21,
    type: 'short_term',
    currentStreak: 4,
    consecutiveMisses: 0,
    dailyEffortLogs: [
      { date: prevDateStr, effort: 'full', timestamp: Date.now() - 86400000 * 2 },
      { date: yesterdayStr, effort: 'partial', timestamp: Date.now() - 86400000 },
      { date: todayStr, effort: 'full', timestamp: Date.now() }
    ]
  });

  // Long-Term Habit (targetDuration > 30)
  await db.habits.add({
    id: 'habit-2',
    title: 'NEURAL MEDITATION & COGNITIVE RECALIBRATION',
    description: 'Deep breathing & mental clarity maintenance protocol.',
    category: 'MIND',
    creationDate: '2026-07-01',
    targetDuration: 60,
    type: 'long_term',
    currentStreak: 12,
    consecutiveMisses: 0,
    dailyEffortLogs: [
      { date: prevDateStr, effort: 'full', timestamp: Date.now() - 86400000 * 2 },
      { date: yesterdayStr, effort: 'lazy', timestamp: Date.now() - 86400000 },
      { date: todayStr, effort: 'full', timestamp: Date.now() }
    ]
  });

  await db.habits.add({
    id: 'habit-3',
    title: 'KINETIC WORKOUT PROTOCOL',
    description: 'Strength & physical resistance training routine.',
    category: 'HEALTH',
    creationDate: '2026-06-15',
    targetDuration: 90,
    type: 'long_term',
    currentStreak: 8,
    consecutiveMisses: 0,
    dailyEffortLogs: [
      { date: prevDateStr, effort: 'partial', timestamp: Date.now() - 86400000 * 2 },
      { date: yesterdayStr, effort: 'full', timestamp: Date.now() - 86400000 }
    ]
  });

  // Seed Tasks
  await db.tasks.add({
    id: 'task-101',
    title: 'REFACTOR DATABASE INDEXEDDB SCHEMA',
    description: 'Upgrade Dexie stores to support effort spectrum analytics.',
    dueDate: todayStr,
    status: 'completed',
    effort: 'full',
    linkedGoalId: sampleGoalId,
    completedAt: todayStr,
    createdAt: yesterdayStr
  });

  await db.tasks.add({
    id: 'task-102',
    title: 'AUDIT CYBER SECURITY GRID PROTOCOLS',
    description: 'Run diagnostic sweep on API endpoints and token auth layers.',
    dueDate: todayStr,
    status: 'pending',
    effort: null,
    linkedGoalId: sampleGoalId,
    completedAt: null,
    createdAt: todayStr
  });

  await db.tasks.add({
    id: 'task-103',
    title: 'SYNTHESIZE WEEKLY TELEMETRY REPORT',
    description: 'Compile effort spectrum charts for command matrix presentation.',
    dueDate: todayStr,
    status: 'completed',
    effort: 'partial',
    linkedGoalId: null,
    completedAt: todayStr,
    createdAt: yesterdayStr
  });

  // System Log
  await db.systemLogs.add({
    id: 'log-001',
    timestamp: Date.now(),
    type: 'INIT',
    message: 'NEXUS HUD initialized with default cyber protocols.'
  });
}
