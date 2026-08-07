import React, { useState } from 'react';
import { db, seedSampleData } from '../db/database';
import { cyberAudio } from '../utils/audioSynth';
import { Database, Download, Upload, RefreshCw, Trash2, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function DataNexus() {
  const [statusMsg, setStatusMsg] = useState('');

  // Export JSON backup
  const handleExportJSON = async () => {
    cyberAudio.playClick();
    try {
      const tasks = await db.tasks.toArray();
      const habits = await db.habits.toArray();
      const goals = await db.goals.toArray();
      const systemLogs = await db.systemLogs.toArray();

      const backup = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        tasks,
        habits,
        goals,
        systemLogs
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `cyber-hud-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setStatusMsg('BACKUP ARCHIVE EXPORTED SUCCESSFULLY.');
    } catch (e) {
      console.error(e);
      setStatusMsg('ERROR EXPORTING ARCHIVE.');
    }
  };

  // Import JSON backup
  const handleImportJSON = async (e) => {
    cyberAudio.playClick();
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.tasks && json.habits && json.goals) {
          await db.transaction('rw', db.tasks, db.habits, db.goals, async () => {
            await db.tasks.clear();
            await db.habits.clear();
            await db.goals.clear();

            await db.tasks.bulkAdd(json.tasks);
            await db.habits.bulkAdd(json.habits);
            await db.goals.bulkAdd(json.goals);
          });
          cyberAudio.playSuccess();
          setStatusMsg('DATABASE RESTORED FROM ARCHIVE FILE.');
        } else {
          setStatusMsg('INVALID BACKUP ARCHIVE FORMAT.');
        }
      } catch (err) {
        console.error(err);
        setStatusMsg('CORRUPT JSON FILE.');
      }
    };
    reader.readAsText(file);
  };

  // Reset database & reload sample data
  const handleResetDatabase = async () => {
    cyberAudio.playClick();
    if (window.confirm('WARNING: PERMANENTLY ERASE ALL LOCAL STORAGE DATA?')) {
      await db.tasks.clear();
      await db.habits.clear();
      await db.goals.clear();
      await db.systemLogs.clear();
      await seedSampleData();
      cyberAudio.playBootSound();
      setStatusMsg('DATABASE PURGED AND SEEDED WITH DEMO CYBER PROTOCOLS.');
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="cyber-panel hud-corner-tl p-4 rounded-lg">
        <h2 className="text-base font-bold text-[#00f0ff] tracking-widest uppercase text-glow-cyan flex items-center gap-2">
          <Database className="w-5 h-5 text-[#00f0ff]" />
          DATA NEXUS // INDEXEDDB PERSISTENCE CONTROL
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage local storage archives, JSON backup/restore, and system resets.
        </p>
      </div>

      {statusMsg && (
        <div className="p-3 bg-[#00f0ff]/15 border border-[#00f0ff] text-[#00f0ff] text-xs font-bold rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export Backup Card */}
        <div className="cyber-panel p-5 rounded-lg border border-[#00f0ff]/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center mb-3">
              <Download className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 uppercase">EXPORT BACKUP ARCHIVE</h3>
            <p className="text-xs text-slate-400 mt-1">
              Download your complete tasks, habits, daily logs, and long-term goals as a JSON file.
            </p>
          </div>

          <button
            onClick={handleExportJSON}
            className="w-full py-2.5 bg-[#00f0ff]/15 hover:bg-[#00f0ff]/30 border border-[#00f0ff] text-[#00f0ff] font-bold text-xs rounded transition uppercase tracking-wider cursor-pointer"
          >
            EXPORT JSON BACKUP
          </button>
        </div>

        {/* Import Backup Card */}
        <div className="cyber-panel p-5 rounded-lg border border-[#ff007f]/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded bg-[#ff007f]/10 border border-[#ff007f]/40 flex items-center justify-center mb-3">
              <Upload className="w-5 h-5 text-[#ff007f]" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 uppercase">RESTORE FROM ARCHIVE</h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload a previously exported JSON backup file to overwrite current database state.
            </p>
          </div>

          <label className="w-full py-2.5 bg-[#ff007f]/15 hover:bg-[#ff007f]/30 border border-[#ff007f] text-[#ff007f] font-bold text-xs rounded transition uppercase tracking-wider text-center cursor-pointer block">
            UPLOAD JSON BACKUP
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>

        {/* Purge / Reset Card */}
        <div className="cyber-panel p-5 rounded-lg border border-[#ff0055]/30 flex flex-col justify-between space-y-4">
          <div>
            <div className="w-10 h-10 rounded bg-[#ff0055]/10 border border-[#ff0055]/40 flex items-center justify-center mb-3">
              <AlertOctagon className="w-5 h-5 text-[#ff0055]" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 uppercase">PURGE & RE-SEED DEMO DATA</h3>
            <p className="text-xs text-slate-400 mt-1">
              Wipe current database and reload default retrofuturistic cyber sample protocols.
            </p>
          </div>

          <button
            onClick={handleResetDatabase}
            className="w-full py-2.5 bg-[#ff0055]/15 hover:bg-[#ff0055]/30 border border-[#ff0055] text-[#ff0055] font-bold text-xs rounded transition uppercase tracking-wider cursor-pointer"
          >
            RE-SEED DEMO DATA
          </button>
        </div>
      </div>
    </div>
  );
}
