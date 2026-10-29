import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  FileText,
  AlertTriangle,
  Download,
  Share2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { ForensicAnalysisResponse } from '../types/forensics';

interface StageSevenProps {
  report: ForensicAnalysisResponse;
}

export const StageSevenSummary: React.FC<StageSevenProps> = ({ report }) => {
  const summary = report.stage_7_summary;
  const isFake = summary.final_verdict === 'FAKE';
  const isReal = summary.final_verdict === 'REAL';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `forensics_report_${report.input_metadata.filename}.json`);
    dlAnchor.click();
  };

  return (
    <section className="bg-white rounded-lg border-2 border-stone-900 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-200 gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${
              isFake ? 'bg-red-600' : isReal ? 'bg-emerald-600' : 'bg-stone-700'
            }`}
          >
            {isFake ? (
              <ShieldAlert className="w-6 h-6 stroke-[2]" />
            ) : isReal ? (
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            ) : (
              <HelpCircle className="w-6 h-6 stroke-[2]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase text-stone-500 tracking-wider">
                Stage Seven Forensics Dossier
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-[11px] font-mono text-stone-500">
                Processed in {report.processing_time_ms} ms
              </span>
            </div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Final Authenticity Determination & Synthesis
            </h2>
          </div>
        </div>

        {/* Action Controls: Print / Export JSON */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
            title="Export complete forensic telemetry as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-stone-900 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors"
            title="Print formal forensic evaluation report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Primary Verdict Hero Card */}
      <div
        className={`mt-6 p-6 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isFake
            ? 'bg-red-50/70 border-red-200'
            : isReal
            ? 'bg-emerald-50/70 border-emerald-200'
            : 'bg-stone-100 border-stone-300'
        }`}
      >
        <div className="space-y-1">
          <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold block">
            Integrated Primary Classification
          </span>
          <div className="flex items-center gap-3">
            <h3
              className={`text-4xl font-extrabold tracking-tight font-mono ${
                isFake ? 'text-red-700' : isReal ? 'text-emerald-700' : 'text-stone-800'
              }`}
            >
              {summary.final_verdict}
            </h3>
            <span
              className={`text-sm font-mono px-2.5 py-1 rounded border font-semibold ${
                isFake
                  ? 'bg-red-100/70 text-red-800 border-red-300'
                  : isReal
                  ? 'bg-emerald-100/70 text-emerald-800 border-emerald-300'
                  : 'bg-stone-200 text-stone-800 border-stone-300'
              }`}
            >
              Confidence: {summary.confidence_percentage}%
            </span>
          </div>
          <p className="text-xs text-stone-600 pt-1">
            Determined via: <strong className="text-stone-900">{summary.verdict_source}</strong>.
          </p>
        </div>

        {/* Probability Breakdown Bar */}
        <div className="w-full md:w-72 p-4 bg-white rounded-lg border border-stone-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-medium">
            <span className="text-emerald-700">Real Probability</span>
            <span>{(summary.probability_real * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full transition-all"
              style={{ width: `${summary.probability_real * 100}%` }}
            />
            <div
              className="bg-red-600 h-full transition-all"
              style={{ width: `${summary.probability_fake * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono font-medium">
            <span className="text-red-700">Fake Probability</span>
            <span>{(summary.probability_fake * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Model Verdict Matrix for Viva Presentation */}
      <div className="mt-6">
        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
          Multi-Model Forensic Consensus Matrix (Viva Presentation Layout)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Logistic Regression */}
          <div className="p-3 bg-stone-50 rounded border border-stone-200">
            <span className="text-[10px] font-mono text-stone-400 block uppercase">
              Linear Classifier
            </span>
            <span className="font-bold text-stone-900 block mt-0.5">Logistic Reg.</span>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`font-mono font-bold text-xs ${
                  report.stage_4_machine_learning.models.logistic_regression.prediction === 'FAKE'
                    ? 'text-red-700'
                    : 'text-emerald-700'
                }`}
              >
                {report.stage_4_machine_learning.models.logistic_regression.prediction}
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                {report.stage_4_machine_learning.models.logistic_regression.confidence_pct}%
              </span>
            </div>
          </div>

          {/* Random Forest */}
          <div className="p-3 bg-stone-50 rounded border border-stone-200">
            <span className="text-[10px] font-mono text-stone-400 block uppercase">
              Ensemble Trees
            </span>
            <span className="font-bold text-stone-900 block mt-0.5">Random Forest</span>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`font-mono font-bold text-xs ${
                  report.stage_4_machine_learning.models.random_forest.prediction === 'FAKE'
                    ? 'text-red-700'
                    : 'text-emerald-700'
                }`}
              >
                {report.stage_4_machine_learning.models.random_forest.prediction}
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                {report.stage_4_machine_learning.models.random_forest.confidence_pct}%
              </span>
            </div>
          </div>

          {/* Gradient Boosting */}
          <div className="p-3 bg-stone-50 rounded border border-stone-200">
            <span className="text-[10px] font-mono text-stone-400 block uppercase">
              Sequential Boosting
            </span>
            <span className="font-bold text-stone-900 block mt-0.5">Gradient Boosting</span>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`font-mono font-bold text-xs ${
                  report.stage_4_machine_learning.models.gradient_boosting.prediction === 'FAKE'
                    ? 'text-red-700'
                    : 'text-emerald-700'
                }`}
              >
                {report.stage_4_machine_learning.models.gradient_boosting.prediction}
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                {report.stage_4_machine_learning.models.gradient_boosting.confidence_pct}%
              </span>
            </div>
          </div>

          {/* XceptionNet */}
          <div className="p-3 bg-stone-50 rounded border border-stone-200">
            <span className="text-[10px] font-mono text-stone-400 block uppercase">
              Deep Neural Net
            </span>
            <span className="font-bold text-stone-900 block mt-0.5">XceptionNet</span>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-stone-600">
                {report.stage_5_xception.is_operational
                  ? report.stage_5_xception.prediction
                  : 'STANDBY'}
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {report.stage_5_xception.is_operational ? `${report.stage_5_xception.confidence_score}%` : 'Standby'}
              </span>
            </div>
          </div>

          {/* Prediction Fusion */}
          <div className="p-3 bg-stone-50 rounded border border-stone-200">
            <span className="text-[10px] font-mono text-stone-400 block uppercase">
              Meta-Stacking
            </span>
            <span className="font-bold text-stone-900 block mt-0.5">Prediction Fusion</span>
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-stone-600">
                {report.stage_6_fusion.is_operational
                  ? report.stage_6_fusion.fusion_prediction
                  : 'STANDBY'}
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                {report.stage_6_fusion.is_operational ? `${report.stage_6_fusion.confidence_pct}%` : 'Standby'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings & Integrity Notes */}
      {summary.warnings.length > 0 && (
        <div className="mt-5 p-3.5 bg-stone-100 rounded-lg text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-stone-800">
            <AlertTriangle className="w-3.5 h-3.5 text-stone-600" />
            <span>Analysis Architecture Warnings & Operational Status:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px] pt-1">
            {summary.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Official Academic Viva Disclaimer */}
      <div className="mt-5 pt-4 border-t border-stone-200 text-[11px] text-stone-500 flex items-start gap-2">
        <span className="font-bold text-stone-700 shrink-0">Academic Project Disclaimer:</span>
        <p className="leading-relaxed">{summary.disclaimer}</p>
      </div>
    </section>
  );
};
