# Multi-Cue AI-Driven Digital Forensics for Deepfake Detection

Developed as part of the course on "Forensic Analytics" at Vellore Institute of Technology, Chennai.

by Vallurupalli Manoghna (23MIA1154), Kasetty Narasimha Purna (23MIA1136)

Subject Code: CSE4074

Semester: Fall 2026-27

Professor: Dr. S. Johanan Joysingh

---

## Project overview

This academic project is a web application for examining images for visual signs that may be associated with manipulation. A React and TypeScript interface sends an uploaded image or a built-in demonstration sample to a Python FastAPI service. The service reports preprocessing details, five visual cue measurements, image quality metrics, available classical machine-learning predictions, and the status of optional deep-learning and fusion models.

The application is intended for learning and demonstration. Its output is an aid to forensic review, not proof that an image is authentic or manipulated.

## Analysis workflow

1. **Preprocessing:** prepares a standardized image crop for downstream analysis.
2. **Visual cues:** computes texture difference, boundary edge density, frequency difference, lighting difference, and HSV colour difference between the crop and surrounding image context.
3. **Image quality:** measures blur, brightness, and contrast.
4. **Classical machine learning:** evaluates Logistic Regression, Random Forest, and Gradient Boosting using the eight cue and quality features.
5. **XceptionNet:** provides an integration path for a 299 × 299 image classifier. It only produces an inference when compatible trained weights are present.
6. **Prediction fusion:** provides an integration path for a trained meta-classifier that combines model probabilities and image features. If required weights are unavailable, the API reports that state and may provide a separate consensus of available classical models.
7. **Results dashboard:** displays the analysis, model availability, measurements, and a summary for review.

## What is included

- React, TypeScript, and Vite frontend in `src/`.
- FastAPI backend and image-analysis modules in `backend/`.
- Four classical model artifacts in `backend/models/`.
- Built-in synthetic demonstration samples served by the API.
- API health, model status, sample, and image analysis endpoints.
- A detailed [project explanation](docs/project-overview.md) suitable as a companion to the project presentation.

## Model and research limitations

- The archive contains Logistic Regression, Random Forest, Gradient Boosting, and scaler artifacts. The repository does not include dataset provenance, a training notebook, evaluation results, or evidence that these artifacts were trained on a representative real-world deepfake dataset. Their predictions should therefore be treated as a software demonstration, not as validated forensic performance.
- No XceptionNet weights (`xception_deepfake.h5`, `.keras`, or supported ONNX file) or fusion meta-classifier (`fusion_model.joblib`) are included. Those stages report unavailable/standby status until the corresponding trained artifacts are supplied.
- The visual measurements are heuristic signals. Natural image variation and image processing can produce similar signals; a cue by itself cannot establish manipulation.
- The built-in samples are generated patterns for demonstrating the workflow. They are not a benchmark dataset and cannot substantiate model accuracy.
- The system currently analyzes still images. It does not extract or analyze video frames.

## Requirements

- Node.js with npm (or Bun, if preferred).
- Python 3.10 or later recommended, with pip.
- The Python dependencies listed in `backend/requirements.txt`.

## Run locally

The provided `npm run dev` command starts the Express/Vite development server and attempts to launch FastAPI on port 5000. Run it from the project root:

```bash
npm install
python -m venv .venv
```

Activate the virtual environment, then install backend dependencies:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt

# macOS / Linux activation instead:
# source .venv/bin/activate
```

Start the application:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The server expects the `python3` executable on macOS/Linux and currently invokes `python3` when launching the backend; on Windows, ensure that command is available or start the backend separately with `python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 5000` before starting the frontend.

The FastAPI documentation is available at [http://localhost:5000/docs](http://localhost:5000/docs) when the backend is running directly on its configured port.

## API endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/health` | Backend health and supported image formats |
| `GET /api/model-status` | Availability of model artifacts |
| `GET /api/samples` | Synthetic demonstration samples |
| `POST /api/analyze` | Analyze an uploaded image, or pass a `sample_id` query parameter |

The backend accepts JPEG, PNG, and WebP images up to 15 MB and requires a minimum image dimension of 64 × 64 pixels.

## Repository

GitHub: [Manoghna2005/Multi-Cue-AI-Driven-Digital-Forensics-for-Deepfake-Detection](https://github.com/Manoghna2005/Multi-Cue-AI-Driven-Digital-Forensics-for-Deepfake-Detection)

## Team

- Vallurupalli Manoghna — 23MIA1154
- Kasetty Narasimha Purna — 23MIA1136

## License

No license file was supplied with the project archive. All rights are reserved by default unless the project authors add a license.
