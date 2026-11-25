# MERIDIAN — Testing Guide & Quality Assurance

## 1. Running the Automated Test Suites

### Backend Unit & Integration Tests (34 Tests)
Run the complete test suite from the repository root:
```bash
pytest tests
```

To run individual test modules:
```bash
# Universal company resolution (US, India, Europe, Startups, Sparse entities)
pytest tests/test_universal_company_resolution.py

# System resilience, document parser edge cases, and provider diagnostics
pytest tests/test_system_resilience.py

# Independent reasoning, claim decomposition, and adversarial debate
pytest tests/test_independent_reasoning_and_debate.py

# 7-stage durable investigation execution lifecycle
pytest tests/test_investigation_execution_lifecycle.py

# Flagship institutional demonstration & dossier compilation
pytest tests/test_flagship_demo.py
```

---

## 2. Running Frontend Production Builds
To verify TypeScript types and page generation:
```bash
cd apps/web
pnpm build
```

---

## 3. Live Browser Quality Assurance
Browser verification uses standard automated browser runners targeting:
1. Executive Landing Page (`http://localhost:3000/`) at `1280x800` and `1440x900` viewports to verify masthead responsive margins and interactive scenario buttons.
2. Flagship Demo Page (`http://localhost:3000/demo`) to verify 19 memorandum sections, dynamic numbering (`Section 10`..`Section 19`), and PDF download link.
3. Institutional Workstation (`http://localhost:3000/app?demo=true`) to verify tab switching across all 6 tabs, document dropzone upload, and scenario sensitivity recalculations.
