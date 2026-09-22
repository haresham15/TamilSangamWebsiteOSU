# Workflow: /ml-experiment
# Reproducible AI & Machine Learning Engineering Trajectory

Invoke this workflow when initiating a new data analysis project, computer vision model, embedding pipeline, or AI backend.

## Step 1: Environment Integrity
- **Pinned Dependencies**: Generate a `requirements.txt` or `environment.yml` with strictly pinned package versions (e.g., `torch==2.5.1`, `numpy==1.26.4`, `scikit-learn==1.5.2`) to prevent downstream dependency drift.
- **Hardware Agnostic Runtime**: Initialize device runtime checks (`CUDA`, `MPS`, `CPU`) and enforce deterministic seeds (`torch.manual_seed(42)`, `np.random.seed(42)`).

## Step 2: Dummy Data Verification
- **Synthetic Batch Generation**: Before ingesting large datasets, synthesize a minimal random dummy batch matching the exact expected tensor shapes (e.g., `torch.randn(batch_size, channels, H, W)`).
- **Forward Pass Verification**: Pass the dummy batch through the entire model, loss function, and backward step to verify tensor shapes, gradient flow, and memory bounds.
- **Defensive Assertions**: Assert all input/output dimensions explicitly at layer transitions.

## Step 3: Metrics Dashboard
- **Lightweight Telemetry**: Spin up a minimal tracking interface (such as Streamlit, Weights & Biases, or TensorBoard) to record training loss curves, validation metrics, and inference latency.
- **Evaluation Gates**: Evaluate against a held-out test split with proper statistical metrics before saving model artifacts.
