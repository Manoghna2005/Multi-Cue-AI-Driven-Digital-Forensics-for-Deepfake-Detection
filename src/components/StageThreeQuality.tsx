import React from 'react';
import { Eye, Sun, Gauge, Monitor, AlertTriangle } from 'lucide-react';
import { StageThreeQuality as QualityData } from '../types/forensics';

interface StageThreeProps {
  data: QualityData;
}

export const StageThreeQuality: React.FC<StageThreeProps> = ({ data }) => {
  return (
    <section className="bg-white rounded-lg border border-stone-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded bg-stone-100 text-stone-700 text-xs font-mono font-bold flex items-center justify-center border border-stone-200">
            03
          </span>
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              Stage Three: Image Quality Assessment (IQA)
            </h3>
            <p className="text-xs text-stone-500">
              Sensor noise, sharpness, photometric exposure, and dynamic range measurements
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-stone-500 bg-stone-50 px-2.5 py-1 rounded border border-stone-200">
          Resolution: {data.width} × {data.height} px ({data.megapixels} MP)
        </div>
      </div>

      {/* Quality Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
        {/* Metric 1: Blur Score */}
        <div className="p-4 bg-stone-50/60 rounded-lg border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-stone-600" />
              Blur / Sharpness
            </span>
            <span className="text-[10px] font-mono bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-600">
              Laplacian Var
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-stone-900">
              {data.blur_score.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-stone-600">
              ({data.blur_evaluation})
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-1">
              <span>Blurry (&lt;40)</span>
              <span>Moderate</span>
              <span>Sharp (&gt;100)</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-stone-800 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (data.blur_score / 250) * 100)}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-stone-500 mt-3 leading-relaxed">
            Measures the variance of the 2D Laplacian operator. Low variance indicates Gaussian smoothing, motion blur, or heavy compression.
          </p>
        </div>

        {/* Metric 2: Mean Brightness */}
        <div className="p-4 bg-stone-50/60 rounded-lg border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-stone-600" />
              Mean Brightness
            </span>
            <span className="text-[10px] font-mono bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-600">
              Scale 0–255
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-stone-900">
              {data.brightness.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-stone-600">
              ({data.brightness_evaluation})
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-1">
              <span>Dark (0)</span>
              <span>Normal (128)</span>
              <span>Blown (255)</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-stone-800 h-full rounded-full transition-all"
                style={{ width: `${(data.brightness / 255) * 100}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-stone-500 mt-3 leading-relaxed">
            Overall average grayscale pixel luminance across the full frame. Deepfake composites often struggle with consistent dynamic exposure.
          </p>
        </div>

        {/* Metric 3: RMS Contrast */}
        <div className="p-4 bg-stone-50/60 rounded-lg border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-stone-900 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-stone-600" />
              RMS Contrast
            </span>
            <span className="text-[10px] font-mono bg-white border border-stone-200 px-2 py-0.5 rounded text-stone-600">
              Std Dev
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-stone-900">
              {data.contrast.toFixed(1)}
            </span>
            <span className="text-xs font-medium text-stone-600">
              ({data.contrast_evaluation})
            </span>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-1">
              <span>Flat (&lt;30)</span>
              <span>Balanced</span>
              <span>High (&gt;80)</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-stone-800 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (data.contrast / 100) * 100)}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-stone-500 mt-3 leading-relaxed">
            Standard deviation of pixel intensities reflecting total dynamic tonal range. Essential for preventing false positives on low-contrast cameras.
          </p>
        </div>
      </div>

      {/* Critical Academic Viva Disclaimer */}
      <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">Academic Viva Note: </span>
          {data.disclaimer}
        </div>
      </div>
    </section>
  );
};
