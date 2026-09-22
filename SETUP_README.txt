MedGuide: Location-aware clinics and cautious medicine guidance

1. Extract this project into a fresh folder (do not merge with old dist or node_modules).
2. npm install
3. npm run build
4. npm run dev

After login, users without a saved language choose one. They then get a one-time location setup: allow device location, select a city, or skip. Exact device coordinates are kept in browser session storage only; city selection is saved in browser local storage. No exact location is stored in Supabase. Browser location permission cannot be granted automatically and may be revoked.

Symptom result pages now fetch actual nearby clinics using the saved location via the existing Overpass/OpenStreetMap endpoint. They never fall back to unrelated database clinics. OSM specialties and availability are unverified; if no matching specialty is listed, nearby hospitals are labeled as unverified rather than presented as specialists. Emergency care remains first for red urgency.

Medicine guidance is limited to cautious, non-prescriptive self-care information for a small set of symptom patterns (fever, dehydration/diarrhea, nasal congestion). It never generates dosages, antibiotics, steroids, or an unverified diagnosis. Check contraindications with a clinician or pharmacist. The official medicine catalogue is linked separately.

The city lookup uses the public OpenStreetMap Nominatim service, which can be unavailable or rate-limited. Nearby results depend on OpenStreetMap coverage and the Overpass service; no result is better than invented clinics.

Build test could not be completed in this environment because the installed dependency tree was incomplete and npm offline cache lacks packages. Run npm install and npm run build on your machine; report any exact error.
