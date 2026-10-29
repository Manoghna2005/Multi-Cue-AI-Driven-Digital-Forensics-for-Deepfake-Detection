import React from 'react';
import { X, BookOpen, CheckCircle, HelpCircle, FileCode, Shield } from 'lucide-react';

interface VivaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VivaGuideModal: React.FC<VivaGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-stone-300 w-full max-w-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-stone-900 flex items-center justify-center text-white">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Technical Viva & Project Defense Dossier
              </h3>
              <p className="text-xs text-stone-500">
                AI-Based Deepfake Detection Using Visual Cues, ML, XceptionNet, and Prediction Fusion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-xs text-stone-700 leading-relaxed">
          {/* Section 1: Project Abstract */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
              1. Project Motivation & Theoretical Framework
            </h4>
            <p className="text-stone-600">
              Deepfake facial manipulation tools (such as FaceForensics++, DeepFaceLab, and latent diffusion models) synthesize altered regions that are visually convincing to the human eye but violate fundamental image formation physics. This project demonstrates a multi-modal defense framework combining hand-crafted physical cues (spatial, spectral, photometric), classical supervised machine learning classifiers, deep convolutional neural networks (XceptionNet), and prediction stacking.
            </p>
          </div>

          {/* Section 2: Mathematical Foundation of 5 Visual Cues */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
              2. Theoretical Derivation of the Five Forensic Cues
            </h4>

            <div className="space-y-3">
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="font-bold text-stone-900 block">
                  Cue 1: Texture Gap (Sobel Gradient Energy)
                </span>
                <p className="text-stone-600 mt-1">
                  <strong>Why it works:</strong> Generative models optimize perceptual loss functions that often under-represent high-frequency skin micro-textures (pores, hair follicle patterns). The Sobel operator calculates edge magnitude: G = sqrt(Sx² + Sy²). The relative discrepancy between crop and context exposes abnormal synthetic smoothing.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="font-bold text-stone-900 block">
                  Cue 2: Boundary Density (Canny Edge Seam Analysis)
                </span>
                <p className="text-stone-600 mt-1">
                  <strong>Why it works:</strong> Face swapping requires blending the synthesized face into the target body frame (e.g., via Poisson blending or Laplacian pyramid blending). Even state-of-the-art feathering creates edge density spikes along the perimeter transition zone.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="font-bold text-stone-900 block">
                  Cue 3: Frequency Gap (2D FFT High-Frequency Power Spectrum)
                </span>
                <p className="text-stone-600 mt-1">
                  <strong>Why it works:</strong> Transposed convolution layers used for up-sampling in GAN decoders produce grid periodicities (checkerboard artifacts). Computing the 2D Fourier Transform F&#123;f(x,y)&#125; and integrating radial high-frequency power reveals spectral anomalies invisible in the spatial domain.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="font-bold text-stone-900 block">
                  Cue 4: Lighting Gap (Luminance Mean & Dispersion)
                </span>
                <p className="text-stone-600 mt-1">
                  <strong>Why it works:</strong> Spliced faces inherit the lighting environment of the source training data. This cue measures discrepancies in first-order (mean luminance μ) and second-order (dispersion σ) illumination statistics between the target ROI and ambient scene context.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="font-bold text-stone-900 block">
                  Cue 5: Context & Colour Gap (HSV Histogram Bhattacharyya Distance)
                </span>
                <p className="text-stone-600 mt-1">
                  <strong>Why it works:</strong> RGB representations conflate intensity with chromaticity. By transforming to Hue-Saturation (HSV) space and computing the Bhattacharyya distance d(H1, H2), color gamuts are compared independently of absolute brightness.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Examiner Viva Q&A */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-900" />
              3. Key Examiner Questions & Prepared Defense
            </h4>

            <div className="space-y-3">
              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="font-bold text-stone-900 block">
                  Q1: Why combine classical machine learning with XceptionNet deep learning?
                </span>
                <p className="text-stone-600 mt-1">
                  <strong>Answer:</strong> Deep neural networks like XceptionNet excel at discovering latent spatial patterns, but can be brittle against unseen perturbations and lack direct interpretability. Classical ML on hand-crafted visual cues provides interpretable, physics-grounded verification. Prediction fusion stacks both modalities for robust generalization.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="font-bold text-stone-900 block">
                  Q2: Why use separable convolutions in XceptionNet?
                </span>
                <p className="text-stone-600 mt-1">
                  <strong>Answer:</strong> Depthwise separable convolutions decouple spatial convolution (filtering each channel independently) from pointwise $1 \times 1$ convolution (combining across channels). This dramatically reduces parameter count while increasing efficiency in modeling subtle cross-channel synthesis inconsistencies.
                </p>
              </div>

              <div className="p-3 bg-stone-50 rounded border border-stone-200">
                <span className="font-bold text-stone-900 block">
                  Q3: Why is image quality (IQA) not alone considered proof of deepfake?
                </span>
                <p className="text-stone-600 mt-1">
                  <strong>Answer:</strong> Natural images can be blurry, dark, or compressed due to low-light capture, sensor quality, or social media re-compression. Image quality metrics serve as conditioning features to calibrate confidence, not definitive verdicts.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded text-xs font-medium transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
