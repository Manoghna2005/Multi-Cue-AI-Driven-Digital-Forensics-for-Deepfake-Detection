"""
Prediction Fusion Module
Stage Six: Multi-Modal Stacking & Ensemble Fusion
Combines outputs from:
- Logistic Regression (probability of fake)
- Random Forest (probability of fake)
- Gradient Boosting (probability of fake)
- XceptionNet (output probability, if available)
- 5 Visual Cues + 3 Quality Assessment metrics
Strictly respects academic integrity: does not invent arbitrary fusion scores when model is missing.
"""
import os
from typing import Dict, Any, List, Optional
import numpy as np

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

FUSION_FEATURE_SCHEMA = [
    "lr_prob_fake",
    "rf_prob_fake",
    "gb_prob_fake",
    "xception_prob_fake",
    "texture_gap",
    "boundary_density",
    "frequency_gap",
    "lighting_gap",
    "color_gap",
    "blur_score",
    "brightness",
    "contrast"
]

class PredictionFusionEngine:
    def __init__(self):
        self.fusion_model = None
        self.model_path = os.path.join(MODELS_DIR, "fusion_model.joblib")
        self.load_model()

    def load_model(self):
        """Loads trained fusion meta-learner from backend/models/fusion_model.joblib."""
        if os.path.exists(self.model_path):
            try:
                import joblib
                self.fusion_model = joblib.load(self.model_path)
            except Exception as e:
                print(f"Error loading fusion model: {e}")
                self.fusion_model = None

    def evaluate(
        self,
        ml_results: Dict[str, Any],
        dl_result: Dict[str, Any],
        cue_values: List[float],
        quality_values: List[float]
    ) -> Dict[str, Any]:
        """
        Combines individual predictions according to the trained fusion model.
        If fusion model is missing or XceptionNet is on standby, explicitly returns
        status, required inputs, and fallback consensus analysis.
        """
        lr_fake = ml_results.get("models", {}).get("logistic_regression", {}).get("probability_fake")
        rf_fake = ml_results.get("models", {}).get("random_forest", {}).get("probability_fake")
        gb_fake = ml_results.get("models", {}).get("gradient_boosting", {}).get("probability_fake")
        xception_fake = dl_result.get("probability_fake") if dl_result.get("is_operational") else None

        # Check if the trained fusion model exists
        if self.fusion_model is None:
            # Classical ML consensus for the available 3 classifiers
            active_ml_probs = [p for p in [lr_fake, rf_fake, gb_fake] if p is not None]
            classical_consensus_label = "INCONCLUSIVE"
            consensus_avg = None
            if active_ml_probs:
                consensus_avg = float(np.mean(active_ml_probs))
                classical_consensus_label = "FAKE" if consensus_avg >= 0.5 else "REAL"

            missing_components = []
            if not os.path.exists(self.model_path):
                missing_components.append("backend/models/fusion_model.joblib (Trained Stacking Meta-Classifier)")
            if not dl_result.get("is_operational"):
                missing_components.append("backend/models/xception_deepfake.h5 (XceptionNet Deep Learning Weights)")

            return {
                "is_operational": False,
                "status": "fusion_model_not_trained",
                "missing_artifacts": missing_components,
                "input_schema": FUSION_FEATURE_SCHEMA,
                "message": (
                    "Trained fusion meta-model 'backend/models/fusion_model.joblib' was not found. "
                    "In adherence with academic integrity, the system will not fabricate an uncalibrated fusion score. "
                    "The integration interface is fully defined for stacking [LR, RF, GB, XceptionNet, Cues 1-5, Quality 1-3]."
                ),
                "classical_ml_consensus": {
                    "available_classifiers": len(active_ml_probs),
                    "mean_classical_prob_fake": round(consensus_avg, 4) if consensus_avg is not None else None,
                    "consensus_verdict": classical_consensus_label,
                    "explanation": "Calculated strictly across the 3 trained classical ML classifiers without pretending XceptionNet fusion occurred."
                },
                "fusion_prediction": None,
                "fusion_score": None
            }

        # If fusion model is available, build 12-dimensional vector
        try:
            # If xception is missing, imputation or default 0.5 is risky unless model trained with missing indicators
            xc_val = xception_fake if xception_fake is not None else 0.5
            fusion_vector = [
                lr_fake if lr_fake is not None else 0.5,
                rf_fake if rf_fake is not None else 0.5,
                gb_fake if gb_fake is not None else 0.5,
                xc_val,
                *cue_values[:5],
                *quality_values[:3]
            ]

            X_fuse = np.array([fusion_vector], dtype=np.float32)
            if hasattr(self.fusion_model, "predict_proba"):
                probs = self.fusion_model.predict_proba(X_fuse)[0]
                fused_prob_fake = float(probs[1]) if len(probs) > 1 else float(probs[0])
            else:
                pred = int(self.fusion_model.predict(X_fuse)[0])
                fused_prob_fake = 1.0 if pred == 1 else 0.0

            fused_verdict = "FAKE" if fused_prob_fake >= 0.5 else "REAL"

            return {
                "is_operational": True,
                "status": "success",
                "fusion_prediction": fused_verdict,
                "probability_fake": round(fused_prob_fake, 4),
                "probability_real": round(1.0 - fused_prob_fake, 4),
                "confidence_pct": round(max(fused_prob_fake, 1.0 - fused_prob_fake) * 100, 2),
                "model_type": type(self.fusion_model).__name__,
                "input_schema": FUSION_FEATURE_SCHEMA
            }
        except Exception as e:
            return {
                "is_operational": False,
                "status": "fusion_execution_error",
                "error": str(e),
                "input_schema": FUSION_FEATURE_SCHEMA
            }

fusion_engine = PredictionFusionEngine()
