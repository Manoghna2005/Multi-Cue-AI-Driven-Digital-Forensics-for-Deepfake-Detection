# Project Explanation: Multi-Cue AI-Driven Digital Forensics for Deepfake Detection

**Course:** Forensic Analytics, Vellore Institute of Technology, Chennai  
**Subject code:** CSE4074  
**Semester:** Fall 2026-27  
**Professor:** Dr. S. Johanan Joysingh  
**Team:** Vallurupalli Manoghna (23MIA1154) and Kasetty Narasimha Purna (23MIA1136)

## 1. Project motivation

Image manipulation and synthetic media make it harder to judge whether a visual record is trustworthy. This project explores a multi-cue workflow that surfaces measurable differences within an image and presents the analysis in an interactive dashboard. It is designed to help students understand how classical image processing and machine-learning components can be combined in a forensic application.

## 2. Problem addressed

A single visual artifact is rarely enough to determine whether an image has been manipulated. The project therefore examines several complementary properties around a standardized image crop: texture, edges near the crop boundary, spatial-frequency content, luminance, colour distribution, and overall image quality. Classical classifiers consume these measurements and return model outputs where artifacts are available.

## 3. System design

The application has two main parts:

- **Frontend:** React and TypeScript components provide image upload, sample selection, stage-by-stage results, model status, and a viva guide.
- **Backend:** a FastAPI service validates image inputs, performs preprocessing and feature extraction with OpenCV and NumPy, calls the available model components, and returns a structured analysis response.

The development server in `server.ts` serves the Vite frontend and proxies API requests to the backend. It attempts to start FastAPI on port 5000.

## 4. Seven-stage analysis pipeline

### Stage 1 — Image preprocessing

The backend prepares a center crop and a standardized 299 × 299 representation for the analysis stages. The API checks the image format, file size, and minimum dimensions before analysis.

### Stage 2 — Five visual cues

The cue module compares the selected crop with surrounding context:

1. **Texture gap:** compares Sobel gradient energy, which can reveal a difference in fine texture between regions.
2. **Boundary density:** measures Canny edge activity in a band around the crop boundary, where blending seams may appear.
3. **Frequency gap:** compares high-frequency power estimated with a two-dimensional Fourier transform.
4. **Lighting gap:** compares luminance statistics between the crop and its context.
5. **Colour gap:** compares HSV colour distributions using a histogram distance.

These are heuristic measurements. Authentic images can contain strong regional differences, and manipulation may leave no obvious cue.

### Stage 3 — Image quality assessment

The service calculates blur, brightness, and contrast measures. These describe image conditions and are also included in the eight-feature input to the classical classifiers.

### Stage 4 — Classical machine learning

The backend loads Logistic Regression, Random Forest, and Gradient Boosting artifacts from `backend/models/`. The feature vector contains the five visual cues and three image-quality values. The application reports each classifier’s output and availability.

The archive does not document the training data or validation methodology for the supplied artifacts. Performance on real-world images has not been established by the contents of this repository.

### Stage 5 — XceptionNet integration

The backend defines preprocessing and inference support for XceptionNet weights in H5, Keras, or ONNX formats. No compatible XceptionNet weight file is included, so this stage is not operational in the supplied project.

### Stage 6 — Prediction fusion

The fusion module defines a 12-feature schema combining the three classical model probabilities, an XceptionNet probability, five cue values, and three quality values. A trained fusion artifact is not included. The service therefore reports fusion as unavailable and does not claim that a fused model prediction was made.

### Stage 7 — Results and interpretation

The web interface organizes results by stage and presents a summary, cue visualizations, quality measurements, model outputs, and model availability. The report is intended to support human inspection and demonstration.

## 5. Demonstration samples

The API can generate synthetic patterns representing a natural-looking control, a boundary splice, and a periodic spectral artifact. These make it possible to demonstrate the application without uploading an image. They are illustrative inputs only and are not a substitute for a labeled evaluation dataset.

## 6. Intended use and limitations

This project is an academic prototype for exploring a forensic analysis pipeline. It does not establish image authenticity, identify who created or edited an image, or replace expert examination. Reliable performance claims would require documented training data, independent test data, reproducible metrics, and analysis of false positives and false negatives. The current repository does not provide those materials. It analyzes still images and does not perform video-frame extraction.

## 7. Future development

- Document dataset sources, licenses, preprocessing, and training procedures for every model.
- Train and validate XceptionNet and fusion models using appropriately separated datasets.
- Report class-wise precision, recall, F1 score, ROC-AUC, and confidence calibration on independent data.
- Add reproducible evaluation scripts and representative error analysis.
- Expand image validation, user guidance, and accessibility of the results interface.
- Consider video analysis as a separate extension, with frame sampling and temporal evidence documented explicitly.

## 8. How to run

See the root [README](../README.md) for dependencies, setup instructions, local startup, and API endpoints.
