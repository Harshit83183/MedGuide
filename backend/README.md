# MedGuide Backend — module map

Serverless API routes live in `/api/*.js` (Vercel). Each requested backend module maps to a route + table:

| Backend module (requested) | API route | Supabase table |
|---|---|---|
| auth | Supabase Auth + phone OTP (demo) | `auth.users` |
| users | session in app | — |
| family-profiles | `api/family-members.js` | `family_members` |
| symptom-intake | `api/upload.js` + `api/health-records.js` | `health_records` |
| triage-engine | rule engine in `src/ai-service/` | — |
| doctor-clinic-directory | `api/clinics.js`, `api/doctors.js` | `clinics`, `doctors` |
| appointments | `api/appointments.js` | `appointments` |
| video-consultation | `api/video-consults.js`, `api/subscriptions.js` | `video_consults`, `subscriptions` |
| prescriptions | via video consult notes | `video_consults.notes` |
| pharmacy-medicine | `api/medicines.js`, `api/pharmacy-stock.js` | `medicines`, `pharmacy_stock` |
| health-records | `api/health-records.js` | `health_records` |
| emergency-sos | `api/sos-alerts.js`, `api/sos-contacts.js` | `sos_alerts`, `sos_contacts` |
| reviews-testimonials | `api/testimonials.js`, `api/clinic-reviews.js` | `testimonials`, `clinic_reviews` |
| notifications | SMS/WhatsApp links on SOS + booking confirm | — |
| admin-verification | `verified` flag on clinics | `clinics.verified` |
