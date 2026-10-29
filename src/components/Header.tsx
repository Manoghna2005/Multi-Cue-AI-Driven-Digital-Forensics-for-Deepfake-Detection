import React from 'react';
import { Shield, Cpu, BookOpen, Activity, AlertCircle } from 'lucide-react';

interface HeaderProps {
  onOpenModelStatus: () => void;
  onOpenVivaGuide: () => void;
  backendHealthy: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenModelStatus,
  onOpenVivaGuide,
  backendHealthy,
}) => {
  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-stone-900 flex items-center justify-center text-white shadow-xs">
            <Shield className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-stone-900 tracking-tight">
                AI Deepfake Forensics Studio
              </h1>
              <span className="text-[11px] font-mono font-medium text-stone-500 uppercase tracking-wider">
                v1.0 · Academic Edition
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal">
              Visual Cues · Classical ML · XceptionNet · Prediction Fusion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs w-full sm:w-auto justify-end">
          {/* Health indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-50 border border-stone-200 text-stone-600">
            <span
              className={`w-2 h-2 rounded-full ${
                backendHealthy === true
                  ? 'bg-emerald-500'
                  : backendHealthy === false
                  ? 'bg-red-500'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="font-mono text-[11px]">
              {backendHealthy === true
                ? 'API Online'
                : backendHealthy === false
                ? 'API Disconnected'
                : 'Connecting...'}
            </span>
          </div>

          {/* Model Status button */}
          <button
            onClick={onOpenModelStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-900 font-medium transition-colors"
            title="Inspect backend model files and load status"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Model Status</span>
          </button>

          {/* Technical Viva Guide */}
          <button
            onClick={onOpenVivaGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-stone-900 bg-stone-900 text-white hover:bg-stone-800 font-medium transition-colors shadow-xs"
            title="Open College Project & Viva Technical Defense Guide"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Viva Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
