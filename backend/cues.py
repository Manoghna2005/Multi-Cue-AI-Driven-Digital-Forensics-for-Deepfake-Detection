"""
Visual Cues Extraction Module
Stage One & Two: Preprocessing and Five Forensic Visual Cues
- Texture Gap (Sobel gradient magnitude difference)
- Boundary Density (Canny edge concentration near crop seam)
- Frequency Gap (2D FFT high-frequency power spectrum ratio)
- Lighting Gap (Luminance mean and standard deviation divergence)
- Context & Colour Gap (HSV histogram correlation / Bhattacharyya distance)
"""
import base64
from typing import Dict, Any, Tuple
import cv2
import numpy as np

def extract_crop_and_context(
    image_bgr: np.ndarray,
    crop_scale: float = 0.55
) -> Tuple[np.ndarray, np.ndarray, np.ndarray, Dict[str, Any]]:
    """
    Extracts a canonical central crop (representing face/central target)
    and surrounding context mask/region according to academic baseline.
    Does NOT pretend face detector was run if center crop is performed.
    """
    h, w = image_bgr.shape[:2]
    crop_size = int(min(h, w) * crop_scale)
    crop_size = max(64, crop_size) # ensure valid minimum size
    
    # Calculate bounding box coordinates
    start_y = max(0, (h - crop_size) // 2)
    start_x = max(0, (w - crop_size) // 2)
    end_y = start_y + crop_size
    end_x = start_x + crop_size
    
    # Crop region
    crop_bgr = image_bgr[start_y:end_y, start_x:end_x].copy()
    
    # Context region: full image with central crop masked out
    context_mask = np.ones((h, w), dtype=np.uint8) * 255
    context_mask[start_y:end_y, start_x:end_x] = 0
    
    meta = {
        "crop_method": "Deterministic Center-Crop Extraction (Central Region)",
        "original_dimensions": [w, h],
        "crop_box": {"x": int(start_x), "y": int(start_y), "w": int(crop_size), "h": int(crop_size)},
        "crop_dimensions": [int(crop_size), int(crop_size)],
        "target_model_input_size": [299, 299],
    }
    
    return crop_bgr, image_bgr, context_mask, meta

def encode_cv2_image_to_base64(img: np.ndarray, fmt: str = ".jpg") -> str:
    """Encodes an OpenCV image to a base64 data URI."""
    success, buffer = cv2.imencode(fmt, img)
    if not success:
        return ""
    b64 = base64.b64encode(buffer).decode("utf-8")
    mime = "image/jpeg" if fmt in [".jpg", ".jpeg"] else "image/png"
    return f"data:{mime};base64,{b64}"

def compute_cue1_texture_gap(crop_gray: np.ndarray, full_gray: np.ndarray, context_mask: np.ndarray) -> Dict[str, Any]:
    """
    Cue 1: Texture Gap
    Calculates Sobel gradients (Sobel X and Sobel Y) to measure mean edge strength
    in the central crop versus the surrounding context region.
    Deepfakes frequently exhibit smoothed or blurred synthetic textures relative to natural background.
    """
    # Sobel gradients on crop
    sobelx_crop = cv2.Sobel(crop_gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely_crop = cv2.Sobel(crop_gray, cv2.CV_64F, 0, 1, ksize=3)
    crop_grad_mag = np.sqrt(sobelx_crop**2 + sobely_crop**2)
    mean_crop_texture = float(np.mean(crop_grad_mag))
    
    # Sobel gradients on full image
    sobelx_full = cv2.Sobel(full_gray, cv2.CV_64F, 1, 0, ksize=3)
    sobely_full = cv2.Sobel(full_gray, cv2.CV_64F, 0, 1, ksize=3)
    full_grad_mag = np.sqrt(sobelx_full**2 + sobely_full**2)
    
    # Mask context pixels
    context_pixels = full_grad_mag[context_mask > 0]
    mean_context_texture = float(np.mean(context_pixels)) if len(context_pixels) > 0 else mean_crop_texture
    
    # Normalized Texture Gap metric
    # Range typically 0.0 to 1.0+
    texture_gap = float(abs(mean_crop_texture - mean_context_texture) / (mean_context_texture + 1e-5))
    
    return {
        "cue_id": "cue_1",
        "name": "Texture Gap",
        "value": round(texture_gap, 4),
        "metric_unit": "Gradient Discrepancy Index",
        "crop_value": round(mean_crop_texture, 3),
        "context_value": round(mean_context_texture, 3),
        "comparison_label": "Sobel Edge Magnitude",
        "explanation": "Compares high-gradient fine texture between the target region and background context. GAN/diffusion synthesis often produces subtle smoothing or uneven micro-texture gradients.",
        "status": "valid"
    }

def compute_cue2_boundary_density(
    full_gray: np.ndarray,
    crop_box: Dict[str, int],
    boundary_band_px: int = 14
) -> Dict[str, Any]:
    """
    Cue 2: Boundary Density
    Uses Canny edge detection to measure the proportion of edge pixels along the crop boundary seam.
    Splice or blending artifacts often introduce unnatural edge density spikes along boundary perimeters.
    """
    h, w = full_gray.shape[:2]
    x, y, bw, bh = crop_box["x"], crop_box["y"], crop_box["w"], crop_box["h"]
    
    # Standard Canny edge detector
    canny_edges = cv2.Canny(full_gray, threshold1=50, threshold2=150)
    
    # Create seam ring mask around the rectangular boundary
    seam_mask = np.zeros((h, w), dtype=np.uint8)
    
    # Outer rectangle
    y1 = max(0, y - boundary_band_px)
    y2 = min(h, y + bh + boundary_band_px)
    x1 = max(0, x - boundary_band_px)
    x2 = min(w, x + bw + boundary_band_px)
    seam_mask[y1:y2, x1:x2] = 255
    
    # Inner cutout
    iy1 = min(h, y + boundary_band_px)
    iy2 = max(0, y + bh - boundary_band_px)
    ix1 = min(w, x + boundary_band_px)
    ix2 = max(0, x + bw - boundary_band_px)
    if iy2 > iy1 and ix2 > ix1:
        seam_mask[iy1:iy2, ix1:ix2] = 0
        
    total_boundary_pixels = int(np.count_nonzero(seam_mask))
    if total_boundary_pixels == 0:
        return {
            "cue_id": "cue_2",
            "name": "Boundary Density",
            "value": 0.0,
            "metric_unit": "Edge Ratio",
            "crop_value": 0.0,
            "context_value": 0.0,
            "explanation": "Measures edge density along the boundary band.",
            "status": "error"
        }
        
    edge_pixels_in_boundary = int(np.count_nonzero((canny_edges > 0) & (seam_mask > 0)))
    boundary_density = float(edge_pixels_in_boundary / total_boundary_pixels)
    
    # Baseline comparison: edge density in whole image
    global_edge_density = float(np.count_nonzero(canny_edges > 0) / (h * w))
    
    return {
        "cue_id": "cue_2",
        "name": "Boundary Density",
        "value": round(boundary_density, 4),
        "metric_unit": "Seam Edge Fraction",
        "crop_value": round(boundary_density, 4),
        "context_value": round(global_edge_density, 4),
        "comparison_label": "Seam vs Global Density",
        "explanation": "Calculates the ratio of active Canny edges inside the transition perimeter. Face swaps or spliced boundaries frequently leave Poisson blending seams or edge discontinuities.",
        "status": "valid"
    }

def compute_cue3_frequency_gap(
    crop_gray: np.ndarray,
    full_gray: np.ndarray,
    crop_box: Dict[str, int]
) -> Dict[str, Any]:
    """
    Cue 3: Frequency Gap
    Applies 2D Fast Fourier Transform (FFT) to compare high-frequency spectral energy ratios.
    Generative models exhibit distinctive spectral falloff or high-frequency periodic grid artifacts.
    """
    def get_hf_ratio(gray_block: np.ndarray) -> float:
        # Resize to standardized power-of-two square for FFT consistency
        sq = cv2.resize(gray_block, (128, 128), interpolation=cv2.INTER_AREA)
        f_transform = np.fft.fft2(sq.astype(np.float32))
        f_shift = np.fft.fftshift(f_transform)
        magnitude_spectrum = np.abs(f_shift) ** 2
        
        # Calculate radial high frequency mask (> 40% radius from DC center)
        cy, cx = 64, 64
        y, x = np.ogrid[:128, :128]
        dist_from_center = np.sqrt((x - cx)**2 + (y - cy)**2)
        
        hf_mask = dist_from_center > (0.40 * 64)
        total_energy = float(np.sum(magnitude_spectrum)) + 1e-8
        hf_energy = float(np.sum(magnitude_spectrum[hf_mask]))
        return float(hf_energy / total_energy)
        
    # Crop HF ratio
    crop_hf = get_hf_ratio(crop_gray)
    
    # Extract representative background context block
    h, w = full_gray.shape[:2]
    # Sample context from upper or side background patch
    bx = 0 if crop_box["x"] > 32 else min(w - 64, crop_box["x"] + crop_box["w"])
    by = 0 if crop_box["y"] > 32 else min(h - 64, crop_box["y"] + crop_box["h"])
    bw = min(w - bx, max(64, crop_box["w"]))
    bh = min(h - by, max(64, crop_box["h"]))
    
    context_patch = full_gray[by:by+bh, bx:bx+bw]
    context_hf = get_hf_ratio(context_patch) if context_patch.size > 0 else crop_hf
    
    # Frequency gap metric
    freq_gap = float(abs(crop_hf - context_hf) / (context_hf + 1e-6))
    
    return {
        "cue_id": "cue_3",
        "name": "Frequency Gap",
        "value": round(freq_gap, 4),
        "metric_unit": "Spectral Energy Delta",
        "crop_value": round(crop_hf, 4),
        "context_value": round(context_hf, 4),
        "comparison_label": "High-Frequency Power Ratio",
        "explanation": "Computes 2D FFT spectral decay. Up-sampling artifacts from transposed convolutions and autoencoders reveal significant power discrepancies in high-frequency spectral bands.",
        "status": "valid"
    }

def compute_cue4_lighting_gap(
    crop_gray: np.ndarray,
    full_gray: np.ndarray,
    context_mask: np.ndarray
) -> Dict[str, Any]:
    """
    Cue 4: Lighting Gap
    Compares average brightness and standard deviation (illumination variance) between crop and context.
    """
    mean_crop_lum = float(np.mean(crop_gray))
    std_crop_lum = float(np.std(crop_gray))
    
    context_pixels = full_gray[context_mask > 0]
    if len(context_pixels) == 0:
        context_pixels = crop_gray.flatten()
        
    mean_context_lum = float(np.mean(context_pixels))
    std_context_lum = float(np.std(context_pixels))
    
    # Lighting gap captures discrepancy in mean intensity and dynamic dispersion
    delta_mean = abs(mean_crop_lum - mean_context_lum) / 255.0
    delta_std = abs(std_crop_lum - std_context_lum) / 255.0
    lighting_gap = float(delta_mean * 0.6 + delta_std * 0.4)
    
    return {
        "cue_id": "cue_4",
        "name": "Lighting Gap",
        "value": round(lighting_gap, 4),
        "metric_unit": "Luminance Delta [0-1]",
        "crop_value": round(mean_crop_lum, 2),
        "context_value": round(mean_context_lum, 2),
        "crop_std": round(std_crop_lum, 2),
        "context_std": round(std_context_lum, 2),
        "comparison_label": "Mean Luminance (0-255)",
        "explanation": "Evaluates lighting consistency and dynamic variance. Inconsistent directional illumination or ambient mismatch between pasted face and scene indicates composite manipulation.",
        "status": "valid"
    }

def compute_cue5_color_gap(
    crop_bgr: np.ndarray,
    full_bgr: np.ndarray,
    context_mask: np.ndarray
) -> Dict[str, Any]:
    """
    Cue 5: Context and Colour Gap
    Uses 2D HSV (Hue-Saturation) histograms to compare color distributions between crop and context.
    Uses Bhattacharyya distance / correlation metric.
    """
    crop_hsv = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2HSV)
    full_hsv = cv2.cvtColor(full_bgr, cv2.COLOR_BGR2HSV)
    
    # 2D Histogram on Hue (30 bins) and Saturation (32 bins)
    hist_crop = cv2.calcHist([crop_hsv], [0, 1], None, [30, 32], [0, 180, 0, 256])
    cv2.normalize(hist_crop, hist_crop, 0, 1, cv2.NORM_MINMAX)
    
    hist_context = cv2.calcHist([full_hsv], [0, 1], context_mask, [30, 32], [0, 180, 0, 256])
    cv2.normalize(hist_context, hist_context, 0, 1, cv2.NORM_MINMAX)
    
    # Correlation distance: 1.0 = identical, -1.0 = opposite
    corr = float(cv2.compareHist(hist_crop, hist_context, cv2.HISTCMP_CORREL))
    
    # Bhattacharyya distance: 0.0 = identical, 1.0 = disjoint
    bhatt = float(cv2.compareHist(hist_crop, hist_context, cv2.HISTCMP_BHATTACHARYYA))
    
    # Color gap index: normalize Bhattacharyya distance
    color_gap = float(np.clip(bhatt, 0.0, 1.0))
    
    return {
        "cue_id": "cue_5",
        "name": "Context & Colour Gap",
        "value": round(color_gap, 4),
        "metric_unit": "Bhattacharyya Distance [0-1]",
        "crop_value": round(corr, 3),
        "context_value": round(bhatt, 3),
        "comparison_label": "HSV Correlation & Divergence",
        "explanation": "Analyzes color gamuts in Hue-Saturation color space. Deepfake synthesizers often exhibit white-balance shifts, skin tone chromatic aberrations, or color temperature separation.",
        "status": "valid"
    }

def run_all_cues(
    image_bgr: np.ndarray
) -> Tuple[Dict[str, Any], Dict[str, Any], np.ndarray, np.ndarray]:
    """
    Executes the complete Stage 1 (Preprocessing) and Stage 2 (Five Visual Cues).
    Returns:
        preprocessing_data, cues_dict, crop_bgr, resized_299_bgr
    """
    h, w = image_bgr.shape[:2]
    
    # 1. Extraction of Center-Crop and Context
    crop_bgr, full_bgr, context_mask, prep_meta = extract_crop_and_context(image_bgr)
    
    # Grayscale representations
    crop_gray = cv2.cvtColor(crop_bgr, cv2.COLOR_BGR2GRAY)
    full_gray = cv2.cvtColor(full_bgr, cv2.COLOR_BGR2GRAY)
    
    # Resizing for XceptionNet standard (299 x 299)
    resized_299 = cv2.resize(crop_bgr, (299, 299), interpolation=cv2.INTER_CUBIC)
    
    # Preprocessing outputs
    prep_data = {
        "original_resolution": f"{w} × {h} px",
        "crop_resolution": f"{prep_meta['crop_dimensions'][0]} × {prep_meta['crop_dimensions'][1]} px",
        "xception_input_resolution": "299 × 299 px",
        "channels": 3,
        "crop_box": prep_meta["crop_box"],
        "method_notes": prep_meta["crop_method"],
        "crop_thumbnail_b64": encode_cv2_image_to_base64(crop_bgr),
        "preview_299_b64": encode_cv2_image_to_base64(resized_299)
    }
    
    # 2. Compute 5 Cues
    c1 = compute_cue1_texture_gap(crop_gray, full_gray, context_mask)
    c2 = compute_cue2_boundary_density(full_gray, prep_meta["crop_box"])
    c3 = compute_cue3_frequency_gap(crop_gray, full_gray, prep_meta["crop_box"])
    c4 = compute_cue4_lighting_gap(crop_gray, full_gray, context_mask)
    c5 = compute_cue5_color_gap(crop_bgr, full_bgr, context_mask)
    
    cues_dict = {
        "cue_1_texture_gap": c1,
        "cue_2_boundary_density": c2,
        "cue_3_frequency_gap": c3,
        "cue_4_lighting_gap": c4,
        "cue_5_color_gap": c5,
        "cue_vector": [
            c1["value"],
            c2["value"],
            c3["value"],
            c4["value"],
            c5["value"]
        ]
    }
    
    return prep_data, cues_dict, crop_bgr, resized_299
