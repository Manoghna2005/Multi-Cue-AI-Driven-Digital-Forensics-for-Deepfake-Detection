import React from 'react';
import {
  BrainCircuit,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Table,
} from 'lucide-react';
import { StageFourML as MLData, MLModelPrediction } from '../types/forensics';

interface StageFourProps {
  data: MLData;
}

export const StageFourML: React.FC<StageFourProps> = ({ data }) => {
  const modelEntries: [string, MLModelPrediction][] = Object.entries(data.models);

  return (
    <section className="bg-white rounded-lg border border-stone-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded bg-stone-100 text-stone-700 text-xs font-mono font-bold flex items-center justify-center border border-stone-200">
            04
          </span>
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              Stage Four: Machine Learning Classifiers
            </h3>
            <p className="text-xs text-stone-500">
              Inference across Logistic Regression, Random Forest, and Gradient Boosting
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-stone-500 bg-stone-50 px-2.5 py-1 rounded border border-stone-200">
          Input Schema: 8-Feature Vector
        </div>
      </div>

      {/* 3 Model Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {modelEntries.map(([key, model]) => {
          const isFake = model.prediction === 'FAKE';
          const isReal = model.prediction === 'REAL';
          const probFake = model.probability_fake ?? 0.5;
          const probReal = model.probability_real ?? 0.5;

          return (
            <div
              key={key}
              className="p-4 rounded-lg bg-stone-50/60 border border-stone-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-stone-400 uppercase">
                    Classifier {model.model_type ? `(${model.model_type})` : ''}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                      model.status === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-300'
                    }`}
                  >
                    {model.status === 'success' ? 'Active Weights' : 'Status Check'}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900">{model.name}</h4>

                {/* Verdict Badge */}
                <div className="mt-3 flex items-center justify-between">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold uppercase tracking-wider border ${
                      isFake
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : isReal
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {model.prediction}
                  </div>

                  <span className="text-xs font-mono text-stone-500">
                    Confidence: {model.confidence_pct ? `${model.confidence_pct}%` : '—'}
                  </span>
                </div>

                {/* Probability Distribution Bar */}
                <div className="mt-4 pt-3 border-t border-stone-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-emerald-700">Real: {(probReal * 100).toFixed(1)}%</span>
                    <span className="text-red-700">Fake: {(probFake * 100).toFixed(1)}%</span>
                  </div>

                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-600 h-full transition-all"
                      style={{ width: `${probReal * 100}%` }}
                      title={`Real: ${(probReal * 100).toFixed(1)}%`}
                    />
                    <div
                      className="bg-red-600 h-full transition-all"
                      style={{ width: `${probFake * 100}%` }}
                      title={`Fake: ${(probFake * 100).toFixed(1)}%`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-2 border-t border-stone-200/60 text-[10px] font-mono text-stone-400">
                P(Fake) = {probFake.toFixed(4)} · P(Real) = {probReal.toFixed(4)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Output Comparison Chart */}
      <div className="mt-6 p-4 rounded-lg bg-stone-50/80 border border-stone-200">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-stone-700" />
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Comparative Classifier Probability Chart (Probability of Manipulation)
          </h4>
        </div>

        <div className="space-y-3">
          {data.chart_comparison.map((item) => (
            <div key={item.model} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-800">{item.model}</span>
                <span className="font-mono text-xs">
                  <span className="text-stone-500">P(Fake): </span>
                  <span
                    className={
                      item.prob_fake >= 50
                        ? 'font-bold text-red-700'
                        : 'font-bold text-emerald-700'
                    }
                  >
                    {item.prob_fake}%
                  </span>
                  <span className="text-stone-400 text-[11px] ml-2">
                    [{item.prediction}]
                  </span>
                </span>
              </div>
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    item.prob_fake >= 50 ? 'bg-red-600' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${item.prob_fake}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8-Dimensional Input Vector Inspection Table */}
      <div className="mt-5 border border-stone-200 rounded-lg overflow-hidden text-xs">
        <div className="p-2.5 bg-stone-100/70 border-b border-stone-200 flex items-center justify-between">
          <span className="font-bold text-stone-800 flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-stone-500" />
            Model Input Feature Vector (Exact Sequence Passed to ML Classifiers)
          </span>
          <span className="font-mono text-[11px] text-stone-500">Shape: (1, 8)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 font-mono text-[10px] uppercase border-b border-stone-200">
              <tr>
                <th className="px-3 py-2">Index</th>
                <th className="px-3 py-2">Feature Name</th>
                <th className="px-3 py-2">Source Stage</th>
                <th className="px-3 py-2 text-right">Computed Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {data.feature_schema.map((feat, idx) => (
                <tr key={feat} className="hover:bg-stone-50/80">
                  <td className="px-3 py-1.5 text-stone-400">[{idx}]</td>
                  <td className="px-3 py-1.5 font-medium text-stone-800">{feat}</td>
                  <td className="px-3 py-1.5 text-stone-500">
                    {idx < 5 ? 'Stage 2 (Visual Cue)' : 'Stage 3 (Image Quality)'}
                  </td>
                  <td className="px-3 py-1.5 text-right font-bold text-stone-900">
                    {data.feature_values[idx] !== undefined
                      ? data.feature_values[idx].toFixed(4)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
