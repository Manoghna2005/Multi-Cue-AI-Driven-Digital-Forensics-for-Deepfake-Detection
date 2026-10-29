import React from 'react';
import {
  Activity,
  Maximize2,
  Radio,
  Sun,
  Palette,
  Info,
  HelpCircle,
} from 'lucide-react';
import { StageTwoVisualCues as VisualCuesData, VisualCueMetric } from '../types/forensics';

interface StageTwoProps {
  data: VisualCuesData;
}

export const StageTwoVisualCues: React.FC<StageTwoProps> = ({ data }) => {
  const cues: VisualCueMetric[] = [
    data.cue_1_texture_gap,
    data.cue_2_boundary_density,
    data.cue_3_frequency_gap,
    data.cue_4_lighting_gap,
    data.cue_5_color_gap,
  ];

  const getCueIcon = (id: string) => {
    switch (id) {
      case 'cue_1':
        return <Activity className="w-4 h-4 text-stone-700" />;
      case 'cue_2':
        return <Maximize2 className="w-4 h-4 text-stone-700" />;
      case 'cue_3':
        return <Radio className="w-4 h-4 text-stone-700" />;
      case 'cue_4':
        return <Sun className="w-4 h-4 text-stone-700" />;
      case 'cue_5':
        return <Palette className="w-4 h-4 text-stone-700" />;
      default:
        return <Info className="w-4 h-4 text-stone-700" />;
    }
  };

  // Diagnostic thresholds based on academic forensic distributions
  const getCueSeverity = (id: string, value: number) => {
    switch (id) {
      case 'cue_1': // Texture gap
        return value > 0.18 ? 'high' : value > 0.10 ? 'moderate' : 'low';
      case 'cue_2': // Boundary density
        return value > 0.06 ? 'high' : value > 0.035 ? 'moderate' : 'low';
      case 'cue_3': // Frequency gap
        return value > 0.25 ? 'high' : value > 0.14 ? 'moderate' : 'low';
      case 'cue_4': // Lighting gap
        return value > 0.18 ? 'high' : value > 0.10 ? 'moderate' : 'low';
      case 'cue_5': // Color gap
        return value > 0.35 ? 'high' : value > 0.20 ? 'moderate' : 'low';
      default:
        return 'low';
    }
  };

  return (
    <section className="bg-white rounded-lg border border-stone-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded bg-stone-100 text-stone-700 text-xs font-mono font-bold flex items-center justify-center border border-stone-200">
            02
          </span>
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              Stage Two: Five Forensic Visual Cues
            </h3>
            <p className="text-xs text-stone-500">
              Mathematical gradient, boundary seam, spectral, lighting, and chromatic disparity analysis
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-stone-500 bg-stone-50 px-2.5 py-1 rounded border border-stone-200">
          Raw 5D Vector: [{data.cue_vector.map((v) => v.toFixed(3)).join(', ')}]
        </div>
      </div>

      {/* Grid of 5 Cues */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {cues.map((cue) => {
          const severity = getCueSeverity(cue.cue_id, cue.value);
          const severityColor =
            severity === 'high'
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : severity === 'moderate'
              ? 'text-stone-700 bg-stone-100 border-stone-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200';

          const severityLabel =
            severity === 'high'
              ? 'Elevated Discrepancy'
              : severity === 'moderate'
              ? 'Nominal Divergence'
              : 'Consistent / Coherent';

          return (
            <div
              key={cue.cue_id}
              className="p-4 rounded-lg bg-stone-50/60 border border-stone-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-white border border-stone-200 flex items-center justify-center">
                      {getCueIcon(cue.cue_id)}
                    </div>
                    <span className="text-xs font-mono text-stone-400 uppercase">
                      {cue.cue_id.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${severityColor}`}
                  >
                    {severityLabel}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900">{cue.name}</h4>

                {/* Primary Computed Numerical Value */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-mono font-bold text-stone-900 tracking-tight">
                    {cue.value.toFixed(4)}
                  </span>
                  <span className="text-[11px] font-mono text-stone-500">{cue.metric_unit}</span>
                </div>

                {/* Crop vs Context Comparison */}
                <div className="mt-4 pt-3 border-t border-stone-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-500">{cue.comparison_label || 'Region Readings'}</span>
                    <span className="font-mono text-stone-400">Target vs Surrounding</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white rounded border border-stone-200">
                      <span className="text-[10px] font-mono text-stone-400 uppercase block">
                        Crop Target
                      </span>
                      <span className="font-mono font-semibold text-stone-800 text-xs">
                        {cue.crop_value.toFixed(3)}
                      </span>
                    </div>

                    <div className="p-2 bg-white rounded border border-stone-200">
                      <span className="text-[10px] font-mono text-stone-400 uppercase block">
                        Context Area
                      </span>
                      <span className="font-mono font-semibold text-stone-800 text-xs">
                        {cue.context_value.toFixed(3)}
                      </span>
                    </div>
                  </div>

                  {cue.crop_std !== undefined && cue.context_std !== undefined && (
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1">
                      <span>Crop Std Dev: {cue.crop_std.toFixed(1)}</span>
                      <span>Context Std Dev: {cue.context_std.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Relative Visual Disparity Bar */}
                  <div className="pt-1">
                    <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          severity === 'high'
                            ? 'bg-amber-600'
                            : severity === 'moderate'
                            ? 'bg-stone-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(8, cue.value * 120))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Forensic Explanation */}
              <p className="mt-3.5 text-[11px] text-stone-600 leading-relaxed border-t border-stone-200/60 pt-2.5">
                {cue.explanation}
              </p>
            </div>
          );
        })}

        {/* Feature Vector Integration Summary Card */}
        <div className="p-4 rounded-lg bg-stone-900 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-stone-400 uppercase">
                Vector Standardization
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Visual Cue Feature Extraction</h4>
            <p className="text-xs text-stone-300 mt-2 leading-relaxed">
              These 5 calculated cues represent spatial, spectral, and photometric forensic invariants.
              They are passed directly into Stage 4 (Machine Learning Classifiers) alongside Stage 3 image quality metrics.
            </p>

            <div className="mt-4 space-y-1.5 text-[11px] font-mono text-stone-300">
              <div className="flex justify-between py-1 border-b border-stone-800">
                <span className="text-stone-400">Sobel Texture Gap</span>
                <span>{data.cue_1_texture_gap.value.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800">
                <span className="text-stone-400">Canny Boundary Density</span>
                <span>{data.cue_2_boundary_density.value.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800">
                <span className="text-stone-400">2D FFT Spectral Gap</span>
                <span>{data.cue_3_frequency_gap.value.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-800">
                <span className="text-stone-400">Lighting Gap</span>
                <span>{data.cue_4_lighting_gap.value.toFixed(4)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-400">HSV Colour Gap</span>
                <span>{data.cue_5_color_gap.value.toFixed(4)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800 text-[10px] text-stone-400 font-mono">
            Pipeline: Deterministic NumPy & OpenCV calculations
          </div>
        </div>
      </div>
    </section>
  );
};
