import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, Activity, Volume2, VolumeX, Play } from 'lucide-react';
import { cyberAudio } from '../utils/audioSynth';

export default function TerminalWelcome({ onEnterHUD, audioEnabled, setAudioEnabled }) {
  const [typedText, setTypedText] = useState('');
  const [step, setStep] = useState(0);
  const fullText = "> INITIALIZING SYSTEM... WELCOME OPERATOR.";

  useEffect(() => {
    cyberAudio.playBootSound();
  }, []);

  useEffect(() => {
    if (step < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + fullText[step]);
        setStep(step + 1);
      }, 45);
      return () => clearTimeout(timeout);
    }
  }, [step, fullText]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050508]/95 backdrop-blur-xl p-4 sm:p-6 font-mono text-slate-200">
      <div className="w-full max-w-3xl cyber-panel hud-corner-tl hud-corner-br border border-[#00f0ff]/30 p-6 sm:p-8 rounded-lg shadow-2xl relative overflow-hidden">
        {/* Animated Scanline overlay */}
        <div className="animate-scanline" />

        {/* Cyber Header Bar */}
        <div className="flex items-center justify-between border-b border-[#00f0ff]/30 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#ff0055] animate-ping" />
            <span className="text-xs tracking-widest text-[#00f0ff] font-bold uppercase">
              NEXUS TERMINAL // SECURE ACCESS PORTAL
            </span>
          </div>
          <button
            onClick={() => {
              const newState = setAudioEnabled(!audioEnabled);
              cyberAudio.toggleAudio(newState);
              cyberAudio.playClick();
            }}
            className="flex items-center gap-2 px-3 py-1 text-xs border border-[#00f0ff]/40 rounded hover:bg-[#00f0ff]/10 text-[#00f0ff] transition"
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            {audioEnabled ? 'SFX: ON' : 'SFX: MUTED'}
          </button>
        </div>

        {/* Terminal Screen Container */}
        <div className="bg-[#0b0c16] border border-[#00f0ff]/20 rounded p-5 font-mono text-sm space-y-4 shadow-inner min-h-[220px]">
          {/* Main Welcome Typewriter */}
          <div className="flex items-center gap-2 text-[#00ff66] text-lg sm:text-xl font-bold tracking-wide">
            <Terminal className="w-6 h-6 text-[#00f0ff] shrink-0" />
            <span>{typedText}</span>
            <span className="w-2.5 h-5 bg-[#00ff66] animate-pulse inline-block ml-1" />
          </div>

          {/* System Check Readouts (Fades in after typing completes) */}
          {step >= fullText.length && (
            <div className="space-y-2 pt-4 border-t border-[#00f0ff]/20 text-xs sm:text-sm text-slate-300 animate-fadeIn">
              <div className="flex justify-between items-center text-[#00f0ff]">
                <span className="flex items-center gap-2"><Cpu className="w-4 h-4" /> CORE TELEMETRY DATABASE:</span>
                <span className="text-[#00ff66] font-bold">[ONLINE // INDEXEDDB LINKED]</span>
              </div>
              <div className="flex justify-between items-center text-[#ff007f]">
                <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> DAILY STREAK ENGINE:</span>
                <span className="text-[#ffe600] font-bold">[CHECKER READY]</span>
              </div>
              <div className="flex justify-between items-center text-[#9d4edd]">
                <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> EFFORT SPECTRUM ANALYTICS:</span>
                <span className="text-[#00ff66] font-bold">[SPECTRUM LOADED]</span>
              </div>

              <p className="text-[#ffb700] pt-2 italic text-xs">
                &gt; READY TO RECEIVE OPERATOR PROTOCOLS AND DAILY ACTIONS.
              </p>
            </div>
          )}
        </div>

        {/* Enter HUD CTA Button */}
        {step >= fullText.length && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => {
                cyberAudio.playClick();
                cyberAudio.playSuccess();
                onEnterHUD();
              }}
              className="group relative inline-flex items-center gap-3 px-8 py-3 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] border-2 border-[#00f0ff] font-bold text-sm sm:text-base tracking-widest uppercase rounded shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.8)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <Play className="w-5 h-5 text-[#00ff66] group-hover:scale-110 transition-transform" />
              <span>INITIALIZE HUD COMMAND</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
