# MedGuide AI Service (rule-based, legal-safe)

No black-box diagnosis. Deterministic rules only:

| Module (requested)        | File in this folder          |
|---------------------------|------------------------------|
| symptom-classification    | `triage-engine.ts` (triage)  |
| safety-red-flag-rules     | `triage-engine.ts` (RED_FLAGS) |
| language-detection (UI)   | `src/apps/web-app/lib/i18n.ts` |
| speech-to-text (upload)   | voice notes stored, doctor listens |
| translation (UI labels)   | `src/apps/web-app/lib/i18n.ts` |
| image-document-analysis   | uploads attached for doctor review |

Guided Q&A for common problems: `common-problems.ts`. Emergency steps: `emergency-protocols.ts`.
