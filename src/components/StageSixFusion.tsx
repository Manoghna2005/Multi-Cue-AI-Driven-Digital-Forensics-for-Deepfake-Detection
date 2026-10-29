import React from 'react';
import {
  GitMerge,
  Layers,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { StageSixFusion as FusionData } from '../types/forensics';

interface StageSixProps {
  data: FusionData;
}

export const StageSixFusion: React.FC<StageSixProps> = ({ data }) => {
  return (
    <section className="bg-white rounded-lg border border-stone-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded bg-stone-100 text-stone-700 text-xs font-mono font-bold flex items-center justify-center border border-stone-200">
            06
          </span>
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              Stage Six: Prediction Fusion & Stacking Architecture
            </h3>
            <p className="text-xs text-stone-500">
              Multi-modal fusion integrating ML classifiers, XceptionNet probabilities, and forensic cues
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-stone-500 bg-stone-50 px-2.5 py-1 rounded border border-stone-200">
          Schema: 12-Dimensional Meta-Vector
        </div>
      </div>

      {/* Operational vs Missing Fusion Model */}
      {data.is_operational ? (
        <div className="mt-5 p-4 rounded-lg bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-emerald-800">
              Multi-Modal Meta-Learner Prediction
            </span>
            <span className="text-xs font-mono font-bold text-emerald-900">
              Confidence: {data.confidence_pct}%
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl font-mono font-bold text-emerald-950">
              {data.fusion_prediction}
            </span>
            <span className="text-xs font-mono text-emerald-800">
              P(Fake): {((data.probability_fake ?? 0.5) * 100).toFixed(1)}% | P(Real): {((data.probability_real ?? 0.5) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
              <Scale className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 text-xs">
              <h4 className="font-bold text-stone-900">
                Academic Standard Maintained: Prediction Fusion Interface Defined
              </h4>
              <p className="text-stone-600 leading-relaxed">
                {data.message}
              </p>

              {data.missing_artifacts && data.missing_artifacts.length > 0 && (
                <div className="pt-1">
                  <span className="font-semibold text-stone-700 text-[11px] block mb-1">
                    Required Training Artifacts:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] font-mono text-stone-600">
                    {data.missing_artifacts.map((art: string) => (
                      <li key={art}>{art}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Classical ML Consensus Fallback Box */}
          {data.classical_ml_consensus && (
            <div className="p-3 bg-white rounded border border-stone-200 text-xs">
              <div className="flex items-center justify-between font-mono text-[11px] text-stone-500 mb-1">
                <span>Classical ML Calibrated Consensus</span>
                <span className="font-bold text-stone-800">
                  {data.classical_ml_consensus.available_classifiers} Classifiers Evaluated
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase border ${
                    data.classical_ml_consensus.consensus_verdict === 'FAKE'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {data.classical_ml_consensus.consensus_verdict}
                </span>
                <span className="text-stone-600 font-mono text-[11px]">
                  Mean P(Fake):{' '}
                  {data.classical_ml_consensus.mean_classical_prob_fake !== null
                    ? (data.classical_ml_consensus.mean_classical_prob_fake * 100).toFixed(1) + '%'
                    : '—'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                {data.classical_ml_consensus.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 12-Dimensional Meta-Learner Input Schema */}
      <div className="mt-5">
        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
          12-Dimensional Stacking Schema Specification
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {data.input_schema?.map((field: string, idx: number) => (
            <div
              key={field}
              className="p-2 bg-stone-50 rounded border border-stone-200 flex items-center justify-between"
            >
              <span className="text-stone-400 text-[10px]">[{idx}]</span>
              <span className="text-stone-800 text-[11px] truncate" title={field}>
                {field}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
