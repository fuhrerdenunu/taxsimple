# TaxSimple Demo → Production-Ready Recommendations

This plan is designed to **elevate** current functionality without removing existing capabilities.

## 1) Keep Current Strengths, Add Missing Coverage

### What already works well
- Multi-income support (employment, self-employment, rental, investments)
- Provincial/federal tax calculations with major credits/deductions
- Slip/document intake pipeline (validation, parsing, basic scanning)
- Real-time refund/owing visibility and guided wizard UX

### What to add next
- Expand from “good calculator” to “complete filing workflow”:
  - Return completeness checks (missing forms/fields)
  - Audit-traceable calculations (line-by-line worksheet view)
  - Filing package generation (PDF package + schedules + checklist)

---

## 2) Filing Coverage Strategy (How to Cover Most Tax Needs)

Use a **tiered coverage model** so functionality grows without regressions.

### Tier 1 (must-have for majority of filers)
- T4-only and T4+RRSP scenarios
- T4 + T5 + capital gains
- Tuition/medical/donations
- Basic dependants/spousal amount handling
- Provincial differences surfaced clearly

### Tier 2 (high-impact complexity)
- Self-employment (T2125) with expense categorization and reasonability checks
- Rental income schedules with CCA guardrails
- Multi-slip reconciliation across issuers
- Pension splitting and common retirement cases

### Tier 3 (long-tail / advanced)
- Foreign income/foreign tax credits
- Carry-forward optimization (losses, tuition, donations)
- Deceased/estate and special election edge cases

**Recommendation:** publish a “Supported Scenarios” matrix and keep it versioned by tax year.

---

## 3) Tax Engine Enhancements (Accuracy + Explainability)

### A. Tax year controls
- Introduce explicit `taxYear` in app state and every calculation entry-point.
- Prevent silent year mismatches by showing active year badge everywhere.
- Keep historical year engines side-by-side (2024, 2025, …) with golden tests.

### B. Explainable calculations
- For each computed value, store:
  - source inputs
  - formula/rule reference
  - intermediate values
  - final line mapping
- Add a “Why this number?” drill-down panel in Review.

### C. Deterministic rounding and currency policy
- Centralize rounding behavior (banker’s vs arithmetic rounding, 2-decimal policy).
- Add explicit tests for boundary cents around bracket thresholds.

### D. Rule provenance
- Track CRA/source references per rule in config metadata.
- Add a changelog file for annual updates and legislative patches.

---

## 4) Data Model and Form Architecture

### A. Canonical tax return schema
- Create one normalized return schema:
  - identity/profile
  - slips
  - schedules
  - deductions/credits
  - review flags
- Add migration support between schema versions to avoid breaking saved returns.

### B. Form abstraction
- Move each major form/schedule into plugin-style modules:
  - input model
  - validation rules
  - calculation hooks
  - review summary renderer
- This allows adding forms without touching core wizard flow.

### C. Validation lifecycle
- Add three validation stages:
  1. field-level (format/range)
  2. cross-field (consistency)
  3. return-level (completeness/compliance)

---

## 5) Slip Intake & Document Experience

Even if localStorage remains for now, you can improve functionality significantly.

### A. Better extraction reliability
- Add confidence scoring per extracted box with user-confirm prompts.
- Maintain a per-slip parser benchmark set (sample PDFs/images).
- Show extracted source snippet next to each mapped tax field.

### B. Reconciliation engine
- Detect duplicate slips (same issuer/amount/year/identifier).
- Flag conflicting values across imported vs manual entries.
- Add “trust imported value / trust manual value” controls.

### C. Intake quality gates
- Introduce image quality checks (blurry, skewed, low contrast).
- Guide user to retake photo/upload better version before parsing.

---

## 6) UX Upgrades That Increase Completion Rate

### A. Smart interview flow
- Adaptive questions based on prior answers and imported slips.
- “You may be eligible for…” prompts for missed deductions/credits.

### B. Progressive review
- Continuous “issues to fix” panel instead of only final review failures.
- Severity levels: blocking, warning, optimization tip.

### C. Scenario simulation
- Let users compare outcomes:
  - with/without RRSP contribution
  - donation amount impact
  - pension split alternatives

### D. Filing confidence dashboard
- Completeness score
- Data confidence score (imported vs manual vs unverified)
- Refund/owing confidence range for low-confidence inputs

---

## 7) Security and Privacy (while staying demo-friendly)

You said localStorage is acceptable for now; keep it, but harden behavior:

- Add explicit “demo mode” banner and local data warning.
- Session auto-timeout and optional local passcode lock.
- Encrypt sensitive fields consistently and rotate storage keys by version.
- Add secure erase option for all local tax data.
- Implement tamper detection for stored return payloads (integrity hash/signature).

For production transition later:
- Move auth/session to backend identity provider.
- Use managed key services and per-user envelope encryption.
- Add immutable audit events for key user actions.

---

## 8) Compliance & Trust Features

- Add “not tax advice” contextual disclaimers at decision points.
- Generate a reviewer package:
  - return summary
  - assumptions made
  - unresolved warnings
  - source document index
- Create consent log for user-accepted overrides and manual adjustments.

---

## 9) Testing Strategy to Ensure Broad Filing Readiness

### A. Tax rule test pyramid
1. **Unit tests** for each bracket/credit/rule
2. **Scenario tests** by taxpayer persona
3. **Golden return snapshots** (known-good outputs per tax year/province)
4. **Property-based tests** for monotonicity and boundary conditions

### B. Coverage matrix (minimum set)
- Provinces/territories × income bands
- Employment-only, self-employed, rental, investments, mixed income
- Low-income credit-heavy cases
- High-income bracket/surtax cases
- Edge cases: zero income, negative net, carry-forward interactions

### C. Intake tests
- PDF/image parser test corpus
- Corrupt file and adversarial file tests
- Duplicate/conflict detection tests

### D. End-to-end user flows
- New filer from signup to final review package
- Returning filer with prior-year carry-forward data
- Manual-only flow vs import-assisted flow

### E. Release quality gates
- No regression on golden returns
- Explainability output generated for every calculated line
- All blocking validations pass before “Ready to File” state

---

## 10) Operational Readiness

- Version every tax rule set and parser model.
- Add feature flags for risky enhancements.
- Add telemetry for drop-off points in wizard steps.
- Add in-app feedback capture tied to step + field context.
- Maintain a tax-season runbook for urgent rule updates.

---

## 11) 90-Day Execution Plan (Practical)

### Phase 1 (Weeks 1–3)
- Add tax-year explicit state + UI badge
- Add completeness/consistency validator framework
- Publish supported scenarios matrix

### Phase 2 (Weeks 4–7)
- Add explainability panel and line-by-line derivations
- Add reconciliation engine for duplicate/conflicting slips
- Add scenario simulation for top 3 optimization levers

### Phase 3 (Weeks 8–10)
- Build golden return suite across provinces and archetypes
- Add E2E flows for first-time and returning filers
- Add release gates and readiness dashboard

### Phase 4 (Weeks 11–13)
- Harden demo-mode security UX (timeouts, erase, integrity checks)
- Improve parser confidence UX + manual verification workflow
- Launch tax-season monitoring + hotfix process

---

## 12) Success Metrics (Track these)

- Return completion rate
- Average time-to-complete
- % returns with blocking errors caught pre-review
- % fields auto-filled and accepted without edits
- Parser precision/recall by slip type
- Regression rate on golden returns per release
- User confidence score at filing-ready step

---

## Bottom line

To cover most filing needs, focus on:
1. **Coverage depth** (common + complex scenarios)
2. **Explainability** (trust every number)
3. **Validation & reconciliation** (catch mistakes early)
4. **Robust testing matrix** (confidence before release)

This approach preserves existing strengths and adds production-grade reliability, user trust, and filing completeness over time.
