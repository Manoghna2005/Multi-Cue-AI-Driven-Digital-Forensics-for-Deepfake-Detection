"""
Image Quality Assessment Module
Stage Three: Blur (Laplacian variance), Brightness, Contrast (RMS), Dimensions.
Computes genuine numerical metrics with domain explanations.
"""
from typing import Dict, Any
import numpy as np
import cv2

def assess_image_quality(image_bgr: np.ndarray) -> Dict[str, Any]:
    """
    Computes real image quality metrics on an input BGR image.
    Returns:
        blur_score: float (Laplacian variance)
        brightness: float (Mean intensity 0-255)
        contrast: float (RMS / standard deviation of intensities)
        width: int
        height: int
        aspect_ratio: float
        channels: int
        evaluations: dict with human-readable interpretations
    """
    h, w = image_bgr.shape[:2]
    channels = image_bgr.shape[2] if len(image_bgr.shape) > 2 else 1
    
    # Convert to grayscale for standard forensic quality assessment
    if channels > 1:
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
    else:
        gray = image_bgr.copy()
        
    # 1. Blur Score using Laplacian variance (Pech-Pacheco et al.)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    blur_score = float(laplacian.var())
    
    # 2. Brightness: Mean pixel luminance (0 to 255)
    brightness = float(np.mean(gray))
    
    # 3. Contrast: Root Mean Square (RMS) contrast (standard deviation of pixel intensities)
    contrast = float(np.std(gray))
    
    # Quality evaluations / viva notes
    blur_eval = "Sharp (High Edge Frequency)" if blur_score > 100 else ("Moderate Clarity" if blur_score > 40 else "Blurry / Compressed")
    bright_eval = "Well Exposed" if (60 <= brightness <= 190) else ("Underexposed / Dark" if brightness < 60 else "Overexposed / High Key")
    contrast_eval = "Balanced Dynamic Range" if (40 <= contrast <= 80) else ("Low Contrast (Flat)" if contrast < 40 else "High Contrast")

    return {
        "blur_score": round(blur_score, 2),
        "blur_evaluation": blur_eval,
        "brightness": round(brightness, 2),
        "brightness_evaluation": bright_eval,
        "contrast": round(contrast, 2),
        "contrast_evaluation": contrast_eval,
        "width": int(w),
        "height": int(h),
        "channels": int(channels),
        "aspect_ratio": round(w / float(h), 3),
        "megapixels": round((w * h) / 1_000_000.0, 3),
        "disclaimer": "Image quality measurements reflect capture and compression physics; they are forensic support indicators, not standalone proof of authenticity."
    }
