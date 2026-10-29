import React from 'react';
import { Layers, CheckCircle2, ArrowRight, Crop } from 'lucide-react';
import { StageOnePreprocessing as StageOneData } from '../types/forensics';

interface StageOneProps {
  data: StageOneData;
}

export const StageOnePreprocessing: React.FC<StageOneProps> = ({ data }) => {
  return (
    <section className="bg-white rounded-lg border border-stone-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded bg-stone-100 text-stone-700 text-xs font-mono font-bold flex items-center justify-center border border-stone-200">
            01
          </span>
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight">
              Stage One: Image Preprocessing Pipeline
            </h3>
            <p className="text-xs text-stone-500">
              Dimensional validation, spatial extraction, and neural standardization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-emerald-700 font-mono text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3" /> Preprocessing Completed
          </span>
        </div>
      </div>

      {/* Preprocessing Pipeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 text-xs">
        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-[10px] font-mono text-stone-400 uppercase block">Step 1</span>
          <span className="font-semibold text-stone-900 block mt-0.5">Image Loading</span>
          <span className="text-stone-500 text-[11px] mt-1 block">
            Validated BGR byte stream via OpenCV
          </span>
          <span className="font-mono text-[11px] text-stone-700 mt-2 block">
            {data.original_resolution}
          </span>
        </div>

        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-[10px] font-mono text-stone-400 uppercase block">Step 2</span>
          <span className="font-semibold text-stone-900 block mt-0.5">Spatial Extraction</span>
          <span className="text-stone-500 text-[11px] mt-1 block">
            Deterministic center crop (face ROI)
          </span>
          <span className="font-mono text-[11px] text-stone-700 mt-2 block">
            {data.crop_resolution} (Scale: 55%)
          </span>
        </div>

        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-[10px] font-mono text-stone-400 uppercase block">Step 3</span>
          <span className="font-semibold text-stone-900 block mt-0.5">Neural Resizing</span>
          <span className="text-stone-500 text-[11px] mt-1 block">
            Bicubic interpolation for XceptionNet
          </span>
          <span className="font-mono text-[11px] text-stone-700 mt-2 block">
            {data.xception_input_resolution}
          </span>
        </div>

        <div className="p-3 bg-stone-50 rounded border border-stone-200">
          <span className="text-[10px] font-mono text-stone-400 uppercase block">Step 4</span>
          <span className="font-semibold text-stone-900 block mt-0.5">Tensor Normalization</span>
          <span className="text-stone-500 text-[11px] mt-1 block">
            tf.keras.applications.xception
          </span>
          <span className="font-mono text-[11px] text-stone-700 mt-2 block">
            Range: [-1.0, +1.0]
          </span>
        </div>
      </div>

      {/* Visual Tensors Display */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Extracted Center Crop */}
        <div className="p-4 bg-stone-50/70 rounded-lg border border-stone-200 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-stone-800 flex items-center gap-1.5">
              <Crop className="w-3.5 h-3.5 text-stone-500" />
              Extracted Center Crop (Forensic Target)
            </span>
            <span className="font-mono text-[11px] text-stone-500">{data.crop_resolution}</span>
          </div>

          <div className="w-44 h-44 bg-stone-900 rounded border border-stone-300 overflow-hidden flex items-center justify-center p-1">
            {data.crop_thumbnail_b64 ? (
              <img
                src={data.crop_thumbnail_b64}
                alt="Center crop target"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-stone-400 text-xs">No crop preview</span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 text-center mt-2.5 max-w-xs">
            Coordinates: X={data.crop_box.x}, Y={data.crop_box.y}, W={data.crop_box.w}, H={data.crop_box.h}.
            Extracted as the central foreground candidate.
          </p>
        </div>

        {/* XceptionNet Input Tensor */}
        <div className="p-4 bg-stone-50/70 rounded-lg border border-stone-200 flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs mb-2">
            <span className="font-medium text-stone-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              Standardized XceptionNet Input Tensor
            </span>
            <span className="font-mono text-[11px] text-stone-500">
              {data.xception_input_resolution}
            </span>
          </div>

          <div className="w-44 h-44 bg-stone-900 rounded border border-stone-300 overflow-hidden flex items-center justify-center p-1">
            {data.preview_299_b64 ? (
              <img
                src={data.preview_299_b64}
                alt="XceptionNet 299x299 tensor"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-stone-400 text-xs">No tensor preview</span>
            )}
          </div>
          <p className="text-[11px] text-stone-500 text-center mt-2.5 max-w-xs">
            Scaled using bicubic anti-aliasing to 299 × 299 px; ready for separable convolutional
            feature extraction.
          </p>
        </div>
      </div>

      <div className="mt-4 p-2.5 bg-stone-100/60 rounded text-[11px] text-stone-600 flex items-start gap-2">
        <span className="font-semibold text-stone-800 shrink-0">Method Transparency:</span>
        <span>
          {data.method_notes}. In accordance with project specifications, no external proprietary face
          detector is asserted; deterministic spatial bounding is utilized.
        </span>
      </div>
    </section>
  );
};
