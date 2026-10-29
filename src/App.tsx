import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { StageOnePreprocessing } from './components/StageOnePreprocessing';
import { StageTwoVisualCues } from './components/StageTwoVisualCues';
import { StageThreeQuality } from './components/StageThreeQuality';
import { StageFourML } from './components/StageFourML';
import { StageFiveXception } from './components/StageFiveXception';
import { StageSixFusion } from './components/StageSixFusion';
import { StageSevenSummary } from './components/StageSevenSummary';
import { ModelStatusModal } from './components/ModelStatusModal';
import { VivaGuideModal } from './components/VivaGuideModal';
import { ForensicAnalysisResponse } from './types/forensics';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  Cpu,
  Layers,
  BarChart3,
  GitMerge,
  FileSpreadsheet,
} from 'lucide-react';

export default function App() {
  const [backendHealthy, setBackendHealthy] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<ForensicAnalysisResponse | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [isModelStatusOpen, setIsModelStatusOpen] = useState(false);
  const [isVivaGuideOpen, setIsVivaGuideOpen] = useState(false);

  // Active view filter tab
  const [activeStageFilter, setActiveStageFilter] = useState<string>('all');

  // Verify backend health on startup
  useEffect(() => {
    const checkHealth = () => {
      fetch('/api/health')
        .then((res) => {
          if (res.ok) {
            setBackendHealthy(true);
          } else {
            setBackendHealthy(false);
          }
        })
        .catch(() => {
          setBackendHealthy(false);
        });
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async (file: File | null, sampleId: string | null) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setActiveSampleId(sampleId);

    try {
      let response: Response;

      if (sampleId) {
        response = await fetch(`/api/analyze?sample_id=${encodeURIComponent(sampleId)}`, {
          method: 'POST',
        });
      } else if (file) {
        const formData = new FormData();
        formData.append('file', file);
        response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });
      } else {
        throw new Error('No image file or benchmark sample selected.');
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.detail || `Analysis request failed (HTTP ${response.status})`);
      }

      const data: ForensicAnalysisResponse = await response.json();
      setAnalysisReport(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err.message || 'An error occurred during forensic pipeline execution.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setAnalysisReport(null);
    setActiveSampleId(null);
    setAnalysisError(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200">
      {/* Top Academic Header */}
      <Header
        onOpenModelStatus={() => setIsModelStatusOpen(true)}
        onOpenVivaGuide={() => setIsVivaGuideOpen(true)}
        backendHealthy={backendHealthy}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Project Header Banner */}
        <div className="border-b border-stone-200 pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-wider mb-1">
                <span>College Academic Project</span>
                <span aria-hidden="true">·</span>
                <span>Computer Vision & Deep Learning Lab</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                AI Deepfake Detection via Visual Cues & Prediction Fusion
              </h1>
              <p className="text-sm text-stone-600 mt-2 max-w-3xl leading-relaxed">
                A multi-stage forensic analysis system that extracts 5 physics-grounded visual cues
                (Sobel texture, Canny boundary density, 2D FFT spectral decay, luminance variation, and HSV color gap),
                evaluates image quality, classifies through Logistic Regression, Random Forest, and Gradient Boosting,
                and integrates with XceptionNet deep learning and multi-modal prediction stacking.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3 bg-white rounded border border-stone-200 text-xs font-mono">
                <span className="text-stone-400 block text-[10px] uppercase">Architecture</span>
                <span className="font-semibold text-stone-800">7-Stage Modular Pipeline</span>
              </div>
              <div className="p-3 bg-white rounded border border-stone-200 text-xs font-mono">
                <span className="text-stone-400 block text-[10px] uppercase">Engine</span>
                <span className="font-semibold text-stone-800">FastAPI + OpenCV + Sklearn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Central Upload & Configuration Section */}
        <ImageUpload
          onAnalyze={handleAnalyze}
          isLoading={isAnalyzing}
          activeSampleId={activeSampleId}
          onClear={handleClear}
          hasResults={!!analysisReport}
        />

        {/* Global Error Banner */}
        {analysisError && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Forensic Analysis Execution Failed</span>
              <p className="mt-0.5 leading-relaxed">{analysisError}</p>
              <p className="mt-2 text-stone-500 font-mono text-[11px]">
                Verify backend status using the "Model Status" indicator or check console logs.
              </p>
            </div>
          </div>
        )}

        {/* Active Results Display */}
        {analysisReport && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Stage Navigation / Filter Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 flex-wrap gap-2">
              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs">
                {[
                  { id: 'all', label: 'All 7 Stages' },
                  { id: 'summary', label: 'Verdict Dossier' },
                  { id: 'cues', label: 'Stage 2: Visual Cues' },
                  { id: 'quality', label: 'Stage 3: Image Quality' },
                  { id: 'ml', label: 'Stage 4: ML Models' },
                  { id: 'xception', label: 'Stage 5: XceptionNet' },
                  { id: 'fusion', label: 'Stage 6: Prediction Fusion' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveStageFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      activeStageFilter === tab.id
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-xs font-mono text-stone-500">
                Target: {analysisReport.input_metadata.filename} ({analysisReport.input_metadata.original_width}×{analysisReport.input_metadata.original_height})
              </div>
            </div>

            {/* Stage Seven: Final Results Summary Card */}
            {(activeStageFilter === 'all' || activeStageFilter === 'summary') && (
              <StageSevenSummary report={analysisReport} />
            )}

            {/* Stage One: Preprocessing */}
            {(activeStageFilter === 'all' || activeStageFilter === 'cues') && (
              <StageOnePreprocessing data={analysisReport.stage_1_preprocessing} />
            )}

            {/* Stage Two: Five Visual Cues */}
            {(activeStageFilter === 'all' || activeStageFilter === 'cues') && (
              <StageTwoVisualCues data={analysisReport.stage_2_visual_cues} />
            )}

            {/* Stage Three: Image Quality Assessment */}
            {(activeStageFilter === 'all' || activeStageFilter === 'quality') && (
              <StageThreeQuality data={analysisReport.stage_3_image_quality} />
            )}

            {/* Stage Four: Machine Learning Predictions */}
            {(activeStageFilter === 'all' || activeStageFilter === 'ml') && (
              <StageFourML data={analysisReport.stage_4_machine_learning} />
            )}

            {/* Stage Five: XceptionNet Deep Learning */}
            {(activeStageFilter === 'all' || activeStageFilter === 'xception') && (
              <StageFiveXception data={analysisReport.stage_5_xception} />
            )}

            {/* Stage Six: Prediction Fusion */}
            {(activeStageFilter === 'all' || activeStageFilter === 'fusion') && (
              <StageSixFusion data={analysisReport.stage_6_fusion} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-800">
              AI Deepfake Detection Academic Project
            </span>
            <span aria-hidden="true">·</span>
            <span>Final Year Engineering / viva Demonstration</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>OpenCV 5.0</span>
            <span aria-hidden="true">·</span>
            <span>Scikit-Learn 1.9</span>
            <span aria-hidden="true">·</span>
            <span>FastAPI REST Architecture</span>
          </div>
        </div>
      </footer>

      {/* Support Modals */}
      <ModelStatusModal
        isOpen={isModelStatusOpen}
        onClose={() => setIsModelStatusOpen(false)}
      />

      <VivaGuideModal
        isOpen={isVivaGuideOpen}
        onClose={() => setIsVivaGuideOpen(false)}
      />
    </div>
  );
}
