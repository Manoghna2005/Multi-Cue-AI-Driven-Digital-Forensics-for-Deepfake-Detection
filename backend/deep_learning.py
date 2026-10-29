"""
XceptionNet Deep Learning Pipeline
Stage Five: XceptionNet feature extraction and binary classification.
Target model file: backend/models/xception_deepfake.h5 (or .keras / .onnx)
Input specification: 299 × 299 × 3, normalized to [-1.0, 1.0].
"""
import os
from typing import Dict, Any, Optional
import numpy as np
import cv2

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

class XceptionPipeline:
    def __init__(self):
        self.model = None
        self.model_path: Optional[str] = None
        self.backend_framework: Optional[str] = None
        self.check_model_file()

    def check_model_file(self):
        """Scans backend/models/ for recognized XceptionNet model weights."""
        candidates = [
            "xception_deepfake.h5",
            "xception_deepfake.keras",
            "xception_model.h5",
            "xception.onnx"
        ]
        for name in candidates:
            p = os.path.join(MODELS_DIR, name)
            if os.path.exists(p):
                self.model_path = p
                self._attempt_load()
                return

    def _attempt_load(self):
        """Attempts to load using TensorFlow/Keras or ONNX Runtime if installed."""
        if not self.model_path:
            return
        
        # Try TensorFlow
        try:
            import tensorflow as tf
            self.model = tf.keras.models.load_model(self.model_path)
            self.backend_framework = "TensorFlow / Keras"
            return
        except ImportError:
            pass
        except Exception as e:
            print(f"Error loading TF model: {e}")

        # Try ONNX Runtime
        try:
            import onnxruntime as ort
            self.model = ort.InferenceSession(self.model_path)
            self.backend_framework = "ONNX Runtime"
            return
        except ImportError:
            pass
        except Exception as e:
            print(f"Error loading ONNX model: {e}")

    def predict(self, resized_299_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Executes XceptionNet inference pipeline if model file is present.
        If missing, returns exact architectural contract and integration readiness status.
        Never fakes or fabricates neural network predictions.
        """
        pipeline_spec = [
            {
                "step": 1,
                "name": "Input Standardization",
                "detail": "Crop resized to exact 299 × 299 px resolution using bicubic interpolation"
            },
            {
                "step": 2,
                "name": "Color Transformation & Normalization",
                "detail": "BGR -> RGB conversion, normalized to [-1.0, +1.0] via xception.preprocess_input ((x / 127.5) - 1.0)"
            },
            {
                "step": 3,
                "name": "Depthwise Separable Convolution Backbone",
                "detail": "Entry Flow (Conv + SeparableConv) -> Middle Flow (8 repeated blocks) -> Exit Flow"
            },
            {
                "step": 4,
                "name": "Classification Head",
                "detail": "GlobalAveragePooling2D -> Dense(128, ReLU) -> Dropout(0.5) -> Dense(1, Sigmoid)"
            }
        ]

        if self.model is None:
            return {
                "is_operational": False,
                "status": "model_file_missing",
                "model_name": "XceptionNet Deepfake Classifier",
                "expected_weight_file": "backend/models/xception_deepfake.h5",
                "input_dimensions": "299 × 299 × 3",
                "normalization_range": "[-1.0, +1.0]",
                "message": (
                    "Trained XceptionNet weight file 'backend/models/xception_deepfake.h5' was not found. "
                    "The neural preprocessing pipeline and input tensors are fully wired. "
                    "Place your saved .h5 or .keras model file in the backend/models directory to activate deep neural inference."
                ),
                "pipeline_steps": pipeline_spec,
                "prediction": "STANDBY",
                "confidence_score": None,
                "probability_fake": None,
                "probability_real": None,
            }

        try:
            # Preprocessing
            rgb_299 = cv2.cvtColor(resized_299_bgr, cv2.COLOR_BGR2RGB)
            normalized_tensor = (rgb_299.astype(np.float32) / 127.5) - 1.0
            input_batch = np.expand_dims(normalized_tensor, axis=0)

            # Inference
            if self.backend_framework == "TensorFlow / Keras":
                preds = self.model.predict(input_batch)
                prob_fake = float(preds[0][0])
            elif self.backend_framework == "ONNX Runtime":
                input_name = self.model.get_inputs()[0].name
                preds = self.model.run(None, {input_name: input_batch})
                prob_fake = float(preds[0][0][0])
            else:
                raise RuntimeError("Unsupported framework")

            prob_real = 1.0 - prob_fake
            prediction_label = "FAKE" if prob_fake >= 0.5 else "REAL"

            return {
                "is_operational": True,
                "status": "success",
                "model_name": "XceptionNet Deepfake Classifier",
                "weight_path": self.model_path,
                "framework": self.backend_framework,
                "input_dimensions": "299 × 299 × 3",
                "prediction": prediction_label,
                "probability_fake": round(prob_fake, 4),
                "probability_real": round(prob_real, 4),
                "confidence_score": round(max(prob_fake, prob_real) * 100, 2),
                "pipeline_steps": pipeline_spec
            }
        except Exception as e:
            return {
                "is_operational": False,
                "status": "inference_error",
                "error": str(e),
                "pipeline_steps": pipeline_spec
            }

xception_pipeline = XceptionPipeline()
