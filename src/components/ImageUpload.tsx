import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  FileCheck,
  Sparkles,
  AlertCircle,
  Play,
  RotateCw,
  SlidersHorizontal,
} from 'lucide-react';
import { BenchmarkSample } from '../types/forensics';

interface ImageUploadProps {
  onAnalyze: (file: File | null, sampleId: string | null) => void;
  isLoading: boolean;
  activeSampleId: string | null;
  onClear: () => void;
  hasResults: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onAnalyze,
  isLoading,
  activeSampleId,
  onClear,
  hasResults,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    width: number;
    height: number;
    sizeFormatted: string;
    type: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [samples, setSamples] = useState<BenchmarkSample[]>([]);
  const [chosenSampleId, setChosenSampleId] = useState<string | null>(activeSampleId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch benchmark samples from backend for instant viva demo
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data.samples) {
          setSamples(data.samples);
        }
      })
      .catch(() => {
        // Fallback local benchmark descriptions if API is warming up
        setSamples([
          {
            id: 'authentic_portrait',
            name: 'Natural Portrait',
            category: 'Authentic (Control)',
            description: 'Uniform high-frequency textures and continuous color balance.',
            expected_verdict: 'REAL',
          },
          {
            id: 'deepfake_boundary_splice',
            name: 'Boundary Seam Splice',
            category: 'Manipulated (Deepfake)',
            description: 'High Canny edge concentration along rectangular seam perimeter.',
            expected_verdict: 'FAKE',
          },
          {
            id: 'spectral_gan_artifact',
            name: 'Periodic Spectral Artifact',
            category: 'GAN / Diffusion Synthesis',
            description: 'Significant 2D FFT spectral discrepancy and smoothed central skin.',
            expected_verdict: 'FAKE',
          },
        ]);
      });
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setChosenSampleId(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported format. Please upload a JPG, JPEG, or PNG image.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 15 MB limit. Please select a smaller image.');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);

    // Compute dimensions
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const sizeStr =
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      setImageMeta({
        width: img.width,
        height: img.height,
        sizeFormatted: sizeStr,
        type: file.type.replace('image/', '').toUpperCase(),
      });
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSelectSample = (sample: BenchmarkSample) => {
    setErrorMessage(null);
    setSelectedFile(null);
    setChosenSampleId(sample.id);

    if (sample.thumbnail) {
      setPreviewUrl(sample.thumbnail);
    } else {
      setPreviewUrl(null);
    }

    setImageMeta({
      width: 400,
      height: 400,
      sizeFormatted: '468 KB',
      type: 'SYNTHETIC TEST BENCHMARK',
    });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageMeta(null);
    setChosenSampleId(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  const handleStartAnalysis = () => {
    if (!selectedFile && !chosenSampleId) {
      setErrorMessage('Please select or upload an image first.');
      return;
    }
    onAnalyze(selectedFile, chosenSampleId);
  };

  return (
    <section className="bg-white rounded-lg border border-stone-200 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-stone-100 gap-2">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span>Primary Image Input & Analysis</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Upload a facial photo or select an academic benchmark pattern to run the multi-stage detection pipeline.
          </p>
        </div>

        {/* Benchmark quick load pill tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-stone-400 font-mono mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Quick Benchmarks:
          </span>
          {samples.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectSample(s)}
              disabled={isLoading}
              className={`px-2.5 py-1 text-xs rounded border transition-colors font-medium ${
                chosenSampleId === s.id
                  ? 'bg-stone-900 border-stone-900 text-white'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 p-3 rounded bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone / Active Preview */}
      <div className="mt-5">
        {!previewUrl ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              dragActive
                ? 'border-stone-900 bg-stone-50'
                : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 mb-3">
                <Upload className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900">
                Drag and drop image here, or{' '}
                <span className="text-stone-900 underline underline-offset-2">browse files</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Supports JPG, JPEG, and PNG (up to 15 MB)
              </p>
              <div className="mt-3 text-[11px] font-mono text-stone-400 bg-stone-100/70 px-2.5 py-1 rounded">
                Standard resolution ≥ 256×256 recommended for optimal visual cue extraction
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-lg bg-stone-50/70 border border-stone-200">
            {/* Image Preview Container */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 shrink-0 bg-stone-900 rounded border border-stone-200 overflow-hidden flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Selected forensic target"
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-1.5 left-1.5 text-[10px] font-mono bg-stone-900/80 text-stone-300 px-1.5 py-0.5 rounded">
                Original Image
              </span>
            </div>

            {/* Metadata & Action Controls */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-stone-400 tracking-wider">
                    {chosenSampleId ? 'Benchmark Test Pattern' : 'Uploaded File'}
                  </span>
                  <button
                    onClick={handleReset}
                    disabled={isLoading}
                    className="text-stone-400 hover:text-stone-700 text-xs flex items-center gap-1 transition-colors"
                    title="Remove and pick another image"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
                <h4 className="text-sm font-bold text-stone-900 truncate mt-0.5">
                  {selectedFile?.name || (chosenSampleId ? `${chosenSampleId}.jpg` : 'Test Image')}
                </h4>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded border border-stone-200">
                  <span className="text-stone-400 text-[10px] uppercase font-mono block">Width</span>
                  <span className="font-mono font-medium text-stone-800">
                    {imageMeta ? `${imageMeta.width} px` : '—'}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-stone-200">
                  <span className="text-stone-400 text-[10px] uppercase font-mono block">Height</span>
                  <span className="font-mono font-medium text-stone-800">
                    {imageMeta ? `${imageMeta.height} px` : '—'}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-stone-200">
                  <span className="text-stone-400 text-[10px] uppercase font-mono block">File Size</span>
                  <span className="font-mono font-medium text-stone-800">
                    {imageMeta ? imageMeta.sizeFormatted : '—'}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded border border-stone-200">
                  <span className="text-stone-400 text-[10px] uppercase font-mono block">Format</span>
                  <span className="font-mono font-medium text-stone-800">
                    {imageMeta ? imageMeta.type : 'JPG'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleStartAnalysis}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded font-medium text-xs transition-all shadow-xs ${
                    isLoading
                      ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
                      : 'bg-stone-900 hover:bg-stone-800 text-white cursor-pointer'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Processing Forensic Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{hasResults ? 'Re-Analyse Image' : 'Analyse Image'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="px-3.5 py-2.5 rounded border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 text-xs font-medium transition-colors"
                >
                  Upload Another Image
                </button>
              </div>

              {isLoading && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1 font-mono">
                    <span>Executing Stages 1–7 Pipeline</span>
                    <span className="animate-pulse">FastAPI Engine Active</span>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-stone-900 h-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
