import React from 'react';
import {
  Layers,
  CheckCircle,
  AlertCircle,
  Cpu,
  ArrowRight,
  Database,
  ShieldAlert,
} from 'lucide-react';
import { StageFiveXception as XceptionData } from '../types/forensics';

interface StageFiveProps {
  data: XceptionData;
}

export const StageFiveXception: React.FC<StageFiveProps> = ({ data }) => {
  return (
    <section className="bg-white rounded-lg border border-stone-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded bg-stone-100 text-stone-700 text-xs font-mono font-bold flex items-center justify-center border border-stone-200">
            05
          </span>
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              Stage Five: XceptionNet Deep Learning Architecture
            </h3>
            <p className="text-xs text-stone-500">
              Depthwise separable convolutional neural network for spatial artifact detection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span
            className={`font-mono text-[11px] px-2.5 py-1 rounded border flex items-center gap-1.5 ${
              data.is_operational
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-stone-50 text-stone-700 border-stone-300'
            }`}
          >
            {data.is_operational ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Neural Weights Loaded ({data.framework})</span>
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5 text-stone-500" />
                <span>Pipeline Wired · Standby for Weights</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Operational vs Standby State */}
      {data.is_operational ? (
        <div className="mt-5 p-4 rounded-lg bg-emerald-50/60 border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block">
              XceptionNet Inference Execution
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-950">
                {data.prediction}
              </span>
              <span className="text-xs font-mono text-emerald-800">
                Score: {data.confidence_score}%
              </span>
            </div>
            <p className="text-xs text-emerald-900 mt-1">
              Evaluated on 299 × 299 normalized tensor. Real: {(Number(data.probability_real) * 100).toFixed(1)}% | Fake: {(Number(data.probability_fake) * 100).toFixed(1)}%.
            </p>
          </div>
          <div className="text-right text-[11px] font-mono text-emerald-800">
            <span>Framework: {data.framework}</span>
          </div>
        </div>
      ) : (
        <div className="mt-5 p-4 rounded-lg bg-stone-50 border border-stone-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-stone-900">
                Academic Integrity Notice: XceptionNet Model Standby Mode
              </h4>
              <p className="text-stone-600 leading-relaxed">
                {data.message}
              </p>
              <div className="pt-2 text-[11px] font-mono text-stone-500">
                <span className="font-semibold text-stone-700">Expected File Path: </span>
                <code className="bg-white px-2 py-0.5 rounded border border-stone-200">
                  {data.expected_weight_file}
                </code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4-Step Deep Learning Pipeline Flow */}
      <div className="mt-6">
        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
          End-to-End Neural Processing Pipeline
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {data.pipeline_steps.map((st) => (
            <div
              key={st.step}
              className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase block mb-1">
                  Step 0{st.step}
                </span>
                <span className="font-bold text-stone-900 block">{st.name}</span>
                <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed">
                  {st.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Model Specification for Viva */}
      <div className="mt-5 p-3.5 bg-stone-100/60 rounded-lg text-xs space-y-1.5 text-stone-700">
        <div className="font-bold text-stone-900">Technical Viva Specification:</div>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-600">
          <li>
            <strong className="text-stone-800">Backbone:</strong> Modified Xception architecture with 36 convolutional stages structured into 14 modules.
          </li>
          <li>
            <strong className="text-stone-800">Separable Convolutions:</strong> Decouples spatial cross-channel correlations from depthwise convolutions to capture micro-level synthetic compression artifacts.
          </li>
          <li>
            <strong className="text-stone-800">No Hallucinated Attention:</strong> As required by scientific standards, no fabricated heatmaps are generated when weights are in standby.
          </li>
        </ul>
      </div>
    </section>
  );
};
