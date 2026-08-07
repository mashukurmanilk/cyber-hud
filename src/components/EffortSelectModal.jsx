import React from 'react';
import { EFFORT_TIERS } from '../utils/streakLogic';
import { cyberAudio } from '../utils/audioSynth';
import { CheckCircle2, X } from 'lucide-react';

export default function EffortSelectModal({ isOpen, onClose, onSelectEffort, itemTitle = 'TASK / HABIT' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn font-mono">
      <div className="w-full max-w-md cyber-panel hud-corner-tl hud-corner-br border border-[#00f0ff]/40 p-6 rounded-lg shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => {
            cyberAudio.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-[#ff0055] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-5 border-b border-[#00f0ff]/20 pb-3">
          <h3 className="text-sm font-bold tracking-widest text-[#00f0ff] uppercase">
            LOG EFFORT SPECTRUM LEVEL
          </h3>
          <p className="text-xs text-slate-300 mt-1 truncate">
            TARGET: <span className="text-[#ffe600] font-semibold">{itemTitle}</span>
          </p>
        </div>

        {/* Effort Options List */}
        <div className="space-y-3">
          {Object.values(EFFORT_TIERS).map((tier) => (
            <button
              key={tier.key}
              onClick={() => {
                cyberAudio.playEffortSelect(tier.key);
                cyberAudio.playSuccess();
                onSelectEffort(tier.key);
              }}
              style={{
                backgroundColor: tier.bgColor,
                borderColor: tier.borderColor
              }}
              className="w-full text-left p-3.5 border rounded-lg hover:scale-[1.02] active:scale-[0.99] transition-all duration-200 group flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tier.color, boxShadow: `0 0 10px ${tier.color}` }}
                  />
                  <span className="text-sm font-bold tracking-wide text-slate-100 group-hover:text-white">
                    {tier.label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 pl-5">{tier.subtitle}</p>
              </div>

              <CheckCircle2
                className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: tier.color }}
              />
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 mt-5 text-center italic">
          Effort log will update your long-term telemetry analytics & consistency index.
        </p>
      </div>
    </div>
  );
}
