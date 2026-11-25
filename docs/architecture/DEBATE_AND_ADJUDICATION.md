# MERIDIAN — Debate Engine & Adjudication Protocol

## 1. The Adversarial Mandate
Traditional AI research tools ask a single language model to generate an analysis. If that model assumes margins will expand, no counter-mechanism exists to question that premise.

MERIDIAN solves this through an **automated adversarial debate protocol**:
1. No factual claim is admitted into the final report without surviving cross-examination.
2. The challenger agent is programmatically selected to have an opposing analytical mandate.
3. The adjudicating model is isolated from the agents that authored and challenged the claim.

---

## 2. Adversarial Matchups Matrix

| Author Specialist | Claim Category | Assigned Challenger | Counter-Thesis Focus |
| :--- | :--- | :--- | :--- |
| **Financial Analyst** | Margin expansion / FCF yield | **Forensic Accountant** | Capex underreporting, wafer cost inflation, working capital drain |
| **Competitive Strategist** | Economic moat / Market share | **Supply Chain Engineer** | Wafer allocation choke points, packaging delays, alternative ASIC silicon |
| **Macro Strategist** | Sovereign AI demand subsidies | **Regulatory Counsel** | BIS Greater China export restrictions, FTC antitrust bans, cross-border tariffs |
| **Supply Chain Engineer** | Dual-source manufacturing | **Forensic Accountant** | Unrevealed purchase commitments, single-source dependency on TSMC CoWoS |

---

## 3. Position Revision & Concession Tracking
When a challenge introduces evidence that contradicts an initial claim, the debate engine calculates an updated confidence score and creates a `PositionRevision` record:
- `initial_statement`: Original claim.
- `revised_statement`: Adjusted claim incorporating adversary concessions.
- `shift_magnitude`: Absolute difference between initial and revised confidence (0.0 to 1.0).
- `concession_rationale`: Factual citation explaining why the revision occurred.

All revisions are preserved in the database to prevent historical revisionism.

---

## 4. Adjudication Standards of Proof
The independent committee adjudicator applies institutional standards of proof:

| Adjudication Ruling | Evidentiary Standard | Report Inclusion |
| :--- | :--- | :--- |
| **`ACCEPTED`** | Supported by primary audited SEC filings or dual-source evidence; unrefuted by adversary. | Included as verified fact in Section 04 and Executive Summary. |
| **`ACCEPTED_WITH_QUALIFICATIONS`** | Factually valid, but adversary introduced material risk constraints (e.g. gross margin is 75%, but subject to CoWoS bottlenecks). | Included with explicit qualification tag `(Qualified: ...)` sanitized against duplication. |
| **`REJECTED`** | Contradicted by primary audited filings or refuted with superior evidence by challenger. | Excluded from facts; documented in Section 08 (Adversarial Stress Testing) as an invalidated thesis. |
