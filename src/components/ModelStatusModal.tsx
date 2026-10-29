import React, { useState, useEffect } from 'react';
import { X, Cpu, CheckCircle, AlertCircle, RefreshCw, Folder } from 'lucide-react';

interface ModelStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelStatusModal: React.FC<ModelStatusModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = () => {
    setLoading(true);
    setError(null);
    fetch('/api/model-status')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setStatusData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-stone-300 w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center text-stone-800">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Backend Forensic Model Registry & Status
              </h3>
              <p className="text-xs text-stone-500">
                Inspect physical model weight files in <code className="font-mono">backend/models/</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="p-1.5 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to fetch model registry: {error}</span>
            </div>
          )}

          {/* Classical ML Models */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <span>Classical Machine Learning Models (Stage 4)</span>
              <span className="text-stone-400 font-mono text-[11px]">(8-Feature Vector)</span>
            </h4>

            <div className="border border-stone-200 rounded-lg divide-y divide-stone-200 overflow-hidden">
              {[
                { key: 'logistic_regression', name: 'Logistic Regression' },
                { key: 'random_forest', name: 'Random Forest' },
                { key: 'gradient_boosting', name: 'Gradient Boosting' },
                { key: 'scaler', name: 'StandardScaler Normalizer' },
              ].map(({ key, name }) => {
                const info = statusData?.classical_ml?.[key];
                const isLoaded = info?.loaded;

                return (
                  <div key={key} className="p-3 bg-stone-50/50 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-stone-900 block">{name}</span>
                      <span className="font-mono text-[11px] text-stone-500 block">
                        File: {info?.file || `${key}.joblib`}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 rounded border ${
                        isLoaded
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      {isLoaded ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Active / Loaded</span>
                        </>
                      ) : (
                        <span>Standby Baseline</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* XceptionNet Deep Learning */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <span>XceptionNet Deep Learning (Stage 5)</span>
              <span className="text-stone-400 font-mono text-[11px]">(299×299×3 Tensor)</span>
            </h4>

            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block">
                    {statusData?.deep_learning?.model_name || 'XceptionNet'}
                  </span>
                  <span className="font-mono text-[11px] text-stone-500 block">
                    Target Path: {statusData?.deep_learning?.expected_file || 'backend/models/xception_deepfake.h5'}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 rounded border ${
                    statusData?.deep_learning?.is_operational
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {statusData?.deep_learning?.is_operational ? 'Loaded' : 'Standby For Weights'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed pt-1">
                When you train your custom XceptionNet model, export it as a <code className="font-mono">.h5</code> or <code className="font-mono">.keras</code> file and place it in the <code className="font-mono">backend/models/</code> directory to automatically enable deep convolutional inference.
              </p>
            </div>
          </div>

          {/* Prediction Fusion Engine */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <span>Prediction Fusion Stacking Engine (Stage 6)</span>
              <span className="text-stone-400 font-mono text-[11px]">(12-Feature Stacking)</span>
            </h4>

            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-stone-900 block">
                    Multi-Modal Meta-Learner
                  </span>
                  <span className="font-mono text-[11px] text-stone-500 block">
                    Target Path: {statusData?.fusion_engine?.expected_file || 'backend/models/fusion_model.joblib'}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 rounded border ${
                    statusData?.fusion_engine?.is_operational
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                >
                  {statusData?.fusion_engine?.is_operational ? 'Loaded' : 'Awaiting Stacking Model'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed pt-1">
                Combines individual probabilities from LR, RF, GB, and XceptionNet with the 5 visual cues. If unpopulated, the system safely falls back to calibrated classical consensus without fabricating numbers.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
