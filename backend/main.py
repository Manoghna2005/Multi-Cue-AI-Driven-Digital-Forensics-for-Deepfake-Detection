"""
FastAPI Backend Application
AI-Based Deepfake Detection Using Visual Cues, Machine Learning, XceptionNet, and Prediction Fusion
Academic Project Web Application
"""
import os
import io
import time
from typing import Dict, Any, List
from fastapi import FastAPI, File, UploadFile, HTTPException, Query, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import cv2
from PIL import Image

# Import internal modules
from cues import run_all_cues, encode_cv2_image_to_base64
from quality import assess_image_quality
from ml_models import ml_pipeline, FEATURE_NAMES
from deep_learning import xception_pipeline
from fusion import fusion_engine, FUSION_FEATURE_SCHEMA

app = FastAPI(
    title="Deepfake Detection Forensics API",
    description="Academic REST API for multi-stage forensic deepfake detection using visual cues, ML, XceptionNet, and fusion.",
    version="1.0.0"
)

# CORS setup for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

START_TIME = time.time()
MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]

@app.get("/health")
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Deepfake Forensics Detection API",
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "version": "1.0.0",
        "supported_formats": ["JPG", "JPEG", "PNG", "WEBP"]
    }

@app.get("/model-status")
@app.get("/api/model-status")
async def get_model_status():
    """Reports real status of all forensic models and neural weights."""
    return {
        "classical_ml": {
            "logistic_regression": ml_pipeline.status["logistic_regression"],
            "random_forest": ml_pipeline.status["random_forest"],
            "gradient_boosting": ml_pipeline.status["gradient_boosting"],
            "scaler": ml_pipeline.status["scaler"],
            "feature_schema": FEATURE_NAMES
        },
        "deep_learning": {
            "model_name": "XceptionNet (Chollet, 2017)",
            "is_operational": xception_pipeline.model is not None,
            "weight_file": xception_pipeline.model_path,
            "expected_file": "backend/models/xception_deepfake.h5",
            "framework": xception_pipeline.backend_framework or "None (Standby)"
        },
        "fusion_engine": {
            "is_operational": fusion_engine.fusion_model is not None,
            "weight_file": fusion_engine.model_path if fusion_engine.fusion_model else None,
            "expected_file": "backend/models/fusion_model.joblib",
            "input_schema": FUSION_FEATURE_SCHEMA
        }
    }

def generate_sample_image(sample_type: str) -> np.ndarray:
    """Generates synthetic test patterns for viva demonstrations."""
    img = np.zeros((400, 400, 3), dtype=np.uint8)
    
    if sample_type == "authentic_portrait":
        # Smooth natural skin gradient with coherent lighting
        for y in range(400):
            for x in range(400):
                lum = int(120 + 30 * np.sin(x / 60.0) + 20 * np.cos(y / 60.0))
                img[y, x] = [int(lum * 0.75), int(lum * 0.85), lum]
        # Add natural high-frequency texture across entire image
        noise = np.random.normal(0, 8, (400, 400, 3)).astype(np.int16)
        img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    elif sample_type == "deepfake_boundary_splice":
        # Realistic background + distinct spliced center crop with high boundary seam
        img[:] = [90, 110, 140]
        # Draw background elements
        cv2.circle(img, (100, 100), 50, (60, 80, 110), -1)
        cv2.circle(img, (300, 300), 70, (80, 95, 120), -1)
        # Spliced face region with different color temperature & strong seam
        center_box = img[100:300, 100:300].copy()
        center_box[:] = [140, 170, 220] # warmer illumination
        # Smooth center face (low high-frequency texture)
        center_box = cv2.GaussianBlur(center_box, (7, 7), 2.0)
        img[100:300, 100:300] = center_box
        # Distinct boundary artifact
        cv2.rectangle(img, (99, 99), (301, 301), (180, 200, 240), 2)

    elif sample_type == "spectral_gan_artifact":
        # High-frequency periodic checkerboard / grid artifact
        img[:] = 130
        for y in range(400):
            for x in range(400):
                grid = int(25 * np.sin(x * 0.9) * np.sin(y * 0.9))
                img[y, x] = np.clip([130 + grid, 140 + grid, 160 + grid], 0, 255)
        # Smooth central crop
        img[110:290, 110:290] = cv2.GaussianBlur(img[110:290, 110:290], (9, 9), 3.0)

    else:
        # Default neutral portrait test pattern
        cv2.circle(img, (200, 200), 120, (160, 180, 210), -1)
        cv2.circle(img, (160, 170), 16, (40, 40, 60), -1)
        cv2.circle(img, (240, 170), 16, (40, 40, 60), -1)
        cv2.ellipse(img, (200, 240), (45, 20), 0, 0, 180, (70, 80, 150), 3)

    return img

@app.get("/samples")
@app.get("/api/samples")
async def list_sample_images():
    """Lists preconfigured forensic benchmark images for instant viva demo."""
    samples = [
        {
            "id": "authentic_portrait",
            "name": "Natural Photographic Portrait",
            "category": "Authentic (Control)",
            "description": "Consistent high-frequency edge gradients, uniform illumination, and continuous color distribution.",
            "expected_verdict": "REAL"
        },
        {
            "id": "deepfake_boundary_splice",
            "name": "Composite Seam / Boundary Splice",
            "category": "Manipulated (Deepfake)",
            "description": "Synthesized face with high Canny boundary edge density along seam perimeter and lighting divergence.",
            "expected_verdict": "FAKE"
        },
        {
            "id": "spectral_gan_artifact",
            "name": "Periodic Spectral Artifact",
            "category": "GAN / Diffusion Synthesis",
            "description": "Features high-frequency checkerboard spectral peaks in 2D FFT and fine texture attenuation.",
            "expected_verdict": "FAKE"
        }
    ]
    
    # Generate thumbnail base64 for each
    for s in samples:
        mat = generate_sample_image(s["id"])
        s["thumbnail"] = encode_cv2_image_to_base64(mat)

    return {"samples": samples}

@app.post("/analyze")
@app.post("/api/analyze")
async def analyze_image(
    file: UploadFile = File(None),
    sample_id: str = Query(None)
):
    """
    Main image forensic analysis pipeline.
    Accepts either an uploaded image or a sample_id.
    Executes Stages 1 through 7 in strict modular order.
    """
    image_bgr: np.ndarray = None
    original_filename = "sample.jpg"
    filesize_bytes = 0

    if sample_id:
        image_bgr = generate_sample_image(sample_id)
        original_filename = f"{sample_id}.jpg"
        filesize_bytes = image_bgr.nbytes
    elif file:
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {file.content_type}. Only JPG, JPEG, and PNG images are supported."
            )
        contents = await file.read()
        filesize_bytes = len(contents)
        if filesize_bytes > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"File exceeds maximum allowed size of 15MB (Current: {filesize_bytes / (1024*1024):.1f}MB)."
            )
        original_filename = file.filename or "uploaded_image.jpg"
        
        # Decode image using OpenCV
        nparr = np.frombuffer(contents, np.uint8)
        image_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image_bgr is None:
            raise HTTPException(
                status_code=400,
                detail="Unable to decode image. File may be corrupted or in an unsupported format."
            )
    else:
        raise HTTPException(status_code=400, detail="Either an image file or sample_id must be provided.")

    h, w = image_bgr.shape[:2]
    if h < 64 or w < 64:
        raise HTTPException(
            status_code=400,
            detail=f"Image dimensions ({w} × {h} px) are too small. Minimum supported resolution is 64 × 64 pixels."
        )

    t0 = time.time()

    # Stage 1 & 2: Preprocessing and Five Visual Cues
    prep_data, cues_dict, crop_bgr, resized_299 = run_all_cues(image_bgr)

    # Stage 3: Image Quality Assessment
    quality_data = assess_image_quality(image_bgr)

    # Prepare 8-dimensional feature vector:
    # [texture_gap, boundary_density, frequency_gap, lighting_gap, color_gap, blur_score, brightness, contrast]
    feature_vector = [
        cues_dict["cue_1_texture_gap"]["value"],
        cues_dict["cue_2_boundary_density"]["value"],
        cues_dict["cue_3_frequency_gap"]["value"],
        cues_dict["cue_4_lighting_gap"]["value"],
        cues_dict["cue_5_color_gap"]["value"],
        quality_data["blur_score"],
        quality_data["brightness"],
        quality_data["contrast"]
    ]

    # Stage 4: Machine Learning Predictions
    ml_results = ml_pipeline.predict_all(feature_vector)

    # Stage 5: XceptionNet Deep Learning
    dl_results = xception_pipeline.predict(resized_299)

    # Stage 6: Prediction Fusion Model
    fusion_results = fusion_engine.evaluate(
        ml_results=ml_results,
        dl_result=dl_results,
        cue_values=cues_dict["cue_vector"],
        quality_values=[quality_data["blur_score"], quality_data["brightness"], quality_data["contrast"]]
    )

    total_proc_ms = round((time.time() - t0) * 1000, 1)

    # Stage 7: Comprehensive Results & Summary
    # Determine primary verdict based on available operational systems
    final_verdict = "INCONCLUSIVE"
    final_prob_fake = 0.5
    verdict_source = "Classical ML Consensus"

    if fusion_results.get("is_operational") and fusion_results.get("fusion_prediction"):
        final_verdict = fusion_results["fusion_prediction"]
        final_prob_fake = fusion_results.get("probability_fake", 0.5)
        verdict_source = "Multi-Modal Prediction Fusion"
    elif dl_results.get("is_operational") and dl_results.get("prediction") in ["FAKE", "REAL"]:
        # If both ML and DL are available, classical consensus vs DL
        final_verdict = dl_results["prediction"]
        final_prob_fake = dl_results.get("probability_fake", 0.5)
        verdict_source = "XceptionNet Deep Learning"
    else:
        # Based strictly on the classical ML models
        active_preds = [
            m.get("probability_fake")
            for m in ml_results.get("models", {}).values()
            if m.get("status") == "success" and m.get("probability_fake") is not None
        ]
        if active_preds:
            final_prob_fake = float(np.mean(active_preds))
            final_verdict = "FAKE" if final_prob_fake >= 0.5 else "REAL"
            verdict_source = f"Classical ML Ensemble ({len(active_preds)} Classifiers)"

    # Status & warnings
    warnings: List[str] = []
    if not dl_results.get("is_operational"):
        warnings.append("XceptionNet deep learning weights are missing (backend/models/xception_deepfake.h5). Neural pipeline is in standby.")
    if not fusion_results.get("is_operational"):
        warnings.append("Trained fusion stacking model is not present. Results reflect calibrated classical ML classifiers.")

    response = {
        "analysis_status": "complete",
        "processing_time_ms": total_proc_ms,
        "input_metadata": {
            "filename": original_filename,
            "filesize_bytes": filesize_bytes,
            "filesize_formatted": f"{filesize_bytes / 1024:.1f} KB" if filesize_bytes < 1024*1024 else f"{filesize_bytes / (1024*1024):.2f} MB",
            "original_width": w,
            "original_height": h,
            "aspect_ratio": quality_data["aspect_ratio"]
        },
        "stage_1_preprocessing": prep_data,
        "stage_2_visual_cues": cues_dict,
        "stage_3_image_quality": quality_data,
        "stage_4_machine_learning": ml_results,
        "stage_5_xception": dl_results,
        "stage_6_fusion": fusion_results,
        "stage_7_summary": {
            "final_verdict": final_verdict,
            "probability_fake": round(final_prob_fake, 4),
            "probability_real": round(1.0 - final_prob_fake, 4),
            "confidence_percentage": round(max(final_prob_fake, 1.0 - final_prob_fake) * 100, 1),
            "verdict_source": verdict_source,
            "warnings": warnings,
            "disclaimer": "Automated forensic predictions are probabilistic estimates for academic research and viva demonstration. They do not constitute definitive legal proof of image authenticity."
        }
    }

    return JSONResponse(content=response)
