import { db } from '../db/database';

export const EFFORT_TIERS = {
  full: {
    key: 'full',
    label: 'FULL EFFORT',
    subtitle: 'Max capacity 100%',
    color: '#00ff66', // Matrix Green / Cyber Cyan
    bgColor: 'rgba(0, 255, 102, 0.15)',
    borderColor: 'rgba(0, 255, 102, 0.6)',
    score: 1.0
  },
  partial: {
    key: 'partial',
    label: 'NOT FULL EFFORT',
    subtitle: 'Moderate effort 70%',
    color: '#ffe600', // Electric Yellow
    bgColor: 'rgba(255, 230, 0, 0.15)',
    borderColor: 'rgba(255, 230, 0, 0.6)',
    score: 0.7
  },
  lazy: {
    key: 'lazy',
    label: 'LAZY WAY',
    subtitle: 'Half-assed it 40%',
    color: '#ff6600', // Neon Amber/Orange
    bgColor: 'rgba(255, 102, 0, 0.15)',
    borderColor: 'rgba(255, 102, 0, 0.6)',
    score: 0.4
  },
  zero: {
    key: 'zero',
    label: 'ZERO EFFORT / MISSED',
    subtitle: 'No action taken 0%',
    color: '#ff0055', // Glitch Crimson
    bgColor: 'rgba(255, 0, 85, 0.15)',
    borderColor: 'rgba(255, 0, 85, 0.6)',
    score: 0.0
  }
};

/**
 * Runs the daily state checker on all active habits.
 * Called when the app initializes or date boundary shifts.
 */
export async function runDailyStateChecker() {
  const habits = await db.habits.toArray();
  const todayStr = new Date().toISOString().split('T')[0];

  for (const habit of habits) {
    let updated = false;
    let newConsecutiveMisses = habit.consecutiveMisses || 0;
    let newCurrentStreak = habit.currentStreak || 0;
    let dailyLogs = [...(habit.dailyEffortLogs || [])];
    let newType = habit.type;

    // Check Auto-Promotion rule: if targetDuration > 30 -> Long Term Habit
    if (habit.targetDuration > 30 && habit.type !== 'long_term') {
      newType = 'long_term';
      updated = true;
    }

    // Sort logs by date ascending
    dailyLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Determine missed days up to yesterday
    const creationDate = habit.creationDate ? new Date(habit.creationDate) : new Date();
    const today = new Date(todayStr);

    // Iterate through past days starting from creationDate up to yesterday
    let checkDate = new Date(creationDate);
    while (checkDate < today) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const existingLog = dailyLogs.find(l => l.date === dateStr);

      if (!existingLog) {
        // Missed day! Record zero effort
        dailyLogs.push({
          date: dateStr,
          effort: 'zero',
          timestamp: checkDate.getTime()
        });
        newConsecutiveMisses += 1;
        if (newConsecutiveMisses >= 3) {
          newCurrentStreak = 0;
        }
        updated = true;
      }
      checkDate.setDate(checkDate.getDate() + 1);
    }

    if (updated) {
      await db.habits.update(habit.id, {
        consecutiveMisses: newConsecutiveMisses,
        currentStreak: newCurrentStreak,
        dailyEffortLogs: dailyLogs,
        type: newType
      });
    }
  }
}

/**
 * Logs completion of a habit for today with chosen effort level.
 */
export async function logHabitCompletion(habitId, effortTier) {
  const habit = await db.habits.get(habitId);
  if (!habit) return;

  const todayStr = new Date().toISOString().split('T')[0];
  let dailyLogs = [...(habit.dailyEffortLogs || [])];

  const existingIdx = dailyLogs.findIndex(l => l.date === todayStr);
  const newLog = {
    date: todayStr,
    effort: effortTier,
    timestamp: Date.now()
  };

  let newStreak = habit.currentStreak;
  let newConsecutiveMisses = 0; // Reset consecutive misses on completion

  if (existingIdx >= 0) {
    dailyLogs[existingIdx] = newLog;
  } else {
    dailyLogs.push(newLog);
    // Increment streak if not already logged today
    newStreak += 1;
  }

  // Auto-promote if targetDuration > 30
  const isLongTerm = habit.targetDuration > 30 || habit.type === 'long_term';

  await db.habits.update(habitId, {
    consecutiveMisses: newConsecutiveMisses,
    currentStreak: newStreak,
    dailyEffortLogs: dailyLogs,
    type: isLongTerm ? 'long_term' : 'short_term'
  });
}

/**
 * Calculates overall HUD effort spectrum statistics across all habits & tasks.
 */
export function calculateEffortTelemetry(habits = [], tasks = [], goals = []) {
  let fullCount = 0;
  let partialCount = 0;
  let lazyCount = 0;
  let zeroCount = 0;

  habits.forEach(h => {
    (h.dailyEffortLogs || []).forEach(log => {
      if (log.effort === 'full') fullCount++;
      else if (log.effort === 'partial') partialCount++;
      else if (log.effort === 'lazy') lazyCount++;
      else if (log.effort === 'zero') zeroCount++;
    });
  });

  tasks.forEach(t => {
    if (t.status === 'completed') {
      if (t.effort === 'full') fullCount++;
      else if (t.effort === 'partial') partialCount++;
      else if (t.effort === 'lazy') lazyCount++;
      else if (t.effort === 'zero') zeroCount++;
    }
  });

  goals.forEach(g => {
    (g.subActionItems || []).forEach(sub => {
      if (sub.completed) {
        if (sub.effort === 'full') fullCount++;
        else if (sub.effort === 'partial') partialCount++;
        else if (sub.effort === 'lazy') lazyCount++;
        else if (sub.effort === 'zero') zeroCount++;
      }
    });
  });

  const totalLogs = fullCount + partialCount + lazyCount + zeroCount;
  const weightedScore =
    (fullCount * 1.0 + partialCount * 0.7 + lazyCount * 0.4 + zeroCount * 0.0) /
    (totalLogs || 1);

  return {
    fullCount,
    partialCount,
    lazyCount,
    zeroCount,
    totalLogs,
    effortIndexPercent: Math.round(weightedScore * 100)
  };
}
