# MedGuide API Documentation

Base URL: `/api`. All routes send CORS `*` and JSON.

- `GET /api/clinics?city=&type=&specialty=&q=`
- `GET /api/doctors?clinic_id=&specialty=&video=1`
- `GET/POST /api/clinic-reviews`
- `GET /api/medicines?q=&category=`
- `GET /api/pharmacy-stock?clinic_id=`
- `GET/POST/PUT/DELETE /api/appointments`
- `GET/POST/DELETE /api/health-records`
- `GET/POST/PUT/DELETE /api/family-members`
- `GET/POST/PUT /api/subscriptions`
- `GET/POST/PUT /api/video-consults`
- `GET/POST /api/testimonials`
- `GET/POST/PUT /api/sos-alerts`
- `GET/POST/DELETE /api/sos-contacts`
- `POST /api/upload` — `{ fileName, fileBase64, contentType, folder }` → `{ url }` (max 3 MB, bucket `medguide-uploads`)
