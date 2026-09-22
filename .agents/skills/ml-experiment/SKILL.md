---
name: ml-experiment
description: Guides reproducible machine learning, deep learning, and AI model workflows from environment pinning to metric visualization.
---

# ML Experiment Protocol

Use this skill when developing AI models, vector search pipelines, computer vision networks, or ML APIs.

## Execution Order

1. **Environment Integrity**:
   - Strictly pin all library versions in `requirements.txt` or `environment.yml`.
   - Seed all RNGs (`torch.manual_seed(42)`, `np.random.seed(42)`).
   - Configure device-agnostic execution (`cuda`/`mps`/`cpu`).
2. **Dummy Data Verification**:
   - Feed a synthetic mini-batch through the complete pipeline.
   - Assert tensor shapes at all transition points (`assert x.shape == ...`).
   - Validate backward gradient flow before using real training data.
3. **Metrics Dashboard**:
   - Establish live tracking via Streamlit, Weights & Biases, or TensorBoard.
   - Guard against data leakage by evaluating strictly on held-out test partitions.
