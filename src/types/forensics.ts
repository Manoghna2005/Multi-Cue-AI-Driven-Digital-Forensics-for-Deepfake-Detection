/**
 * Forensics & Deepfake Detection Data Contract
 * Strictly maps to backend API response
 */

export interface CropBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface StageOnePreprocessing {
  original_resolution: string;
  crop_resolution: string;
  xception_input_resolution: string;
  channels: number;
  crop_box: CropBox;
  method_notes: string;
  crop_thumbnail_b64: string;
  preview_299_b64: string;
}

export interface VisualCueMetric {
  cue_id: string;
  name: string;
  value: number;
  metric_unit: string;
  crop_value: number;
  context_value: number;
  crop_std?: number;
  context_std?: number;
  comparison_label?: string;
  explanation: string;
  status: 'valid' | 'error' | 'unavailable';
}

export interface StageTwoVisualCues {
  cue_1_texture_gap: VisualCueMetric;
  cue_2_boundary_density: VisualCueMetric;
  cue_3_frequency_gap: VisualCueMetric;
  cue_4_lighting_gap: VisualCueMetric;
  cue_5_color_gap: VisualCueMetric;
  cue_vector: number[];
}

export interface StageThreeQuality {
  blur_score: number;
  blur_evaluation: string;
  brightness: number;
  brightness_evaluation: string;
  contrast: number;
  contrast_evaluation: string;
  width: number;
  height: number;
  channels: number;
  aspect_ratio: number;
  megapixels: number;
  disclaimer: string;
}

export interface MLModelPrediction {
  name: string;
  status: 'success' | 'not_loaded' | 'error';
  prediction: 'FAKE' | 'REAL' | 'UNAVAILABLE' | 'ERROR';
  probability_fake?: number | null;
  probability_real?: number | null;
  confidence_pct?: number | null;
  model_type?: string;
  error?: string;
}

export interface StageFourML {
  status: string;
  feature_schema: string[];
  feature_values: number[];
  models: {
    logistic_regression: MLModelPrediction;
    random_forest: MLModelPrediction;
    gradient_boosting: MLModelPrediction;
  };
  chart_comparison: Array<{
    model: string;
    prob_fake: number;
    prob_real: number;
    prediction: string;
  }>;
}

export interface PipelineStep {
  step: number;
  name: string;
  detail: string;
}

export interface StageFiveXception {
  is_operational: boolean;
  status: string;
  model_name?: string;
  weight_path?: string;
  expected_weight_file?: string;
  framework?: string;
  input_dimensions?: string;
  normalization_range?: string;
  message?: string;
  prediction?: string;
  confidence_score?: number | null;
  probability_fake?: number | null;
  probability_real?: number | null;
  pipeline_steps: PipelineStep[];
}

export interface StageSixFusion {
  is_operational: boolean;
  status: string;
  missing_artifacts?: string[];
  input_schema?: string[];
  message?: string;
  classical_ml_consensus?: {
    available_classifiers: number;
    mean_classical_prob_fake: number | null;
    consensus_verdict: string;
    explanation: string;
  };
  fusion_prediction?: string | null;
  probability_fake?: number | null;
  probability_real?: number | null;
  confidence_pct?: number | null;
}

export interface StageSevenSummary {
  final_verdict: 'REAL' | 'FAKE' | 'INCONCLUSIVE';
  probability_fake: number;
  probability_real: number;
  confidence_percentage: number;
  verdict_source: string;
  warnings: string[];
  disclaimer: string;
}

export interface ForensicAnalysisResponse {
  analysis_status: string;
  processing_time_ms: number;
  input_metadata: {
    filename: string;
    filesize_bytes: number;
    filesize_formatted: string;
    original_width: number;
    original_height: number;
    aspect_ratio: number;
  };
  stage_1_preprocessing: StageOnePreprocessing;
  stage_2_visual_cues: StageTwoVisualCues;
  stage_3_image_quality: StageThreeQuality;
  stage_4_machine_learning: StageFourML;
  stage_5_xception: StageFiveXception;
  stage_6_fusion: StageSixFusion;
  stage_7_summary: StageSevenSummary;
}

export interface BenchmarkSample {
  id: string;
  name: string;
  category: string;
  description: string;
  expected_verdict: string;
  thumbnail?: string;
}
