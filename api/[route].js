import aiTriage from '../server/ai-triage.js';
import appointments from '../server/appointments.js';
import clinicReviews from '../server/clinic-reviews.js';
import clinics from '../server/clinics.js';
import doctors from '../server/doctors.js';
import familyMembers from '../server/family-members.js';
import healthRecords from '../server/health-records.js';
import medicines from '../server/medicines.js';
import pharmacyStock from '../server/pharmacy-stock.js';
import sosAlerts from '../server/sos-alerts.js';
import sosContacts from '../server/sos-contacts.js';
import subscriptions from '../server/subscriptions.js';
import testimonials from '../server/testimonials.js';
import upload from '../server/upload.js';
import videoConsults from '../server/video-consults.js';
import voiceTranscribe from '../server/voice-transcribe.js';

const handlers = {
  'ai-triage': aiTriage,
  appointments,
  'clinic-reviews': clinicReviews,
  clinics,
  doctors,
  'family-members': familyMembers,
  'health-records': healthRecords,
  medicines,
  'pharmacy-stock': pharmacyStock,
  'sos-alerts': sosAlerts,
  'sos-contacts': sosContacts,
  subscriptions,
  testimonials,
  upload,
  'video-consults': videoConsults,
  'voice-transcribe': voiceTranscribe
};

export default async function handler(req, res) {
  const routeValue = req.query.route;

  const route = Array.isArray(routeValue)
    ? routeValue[0]
    : routeValue;

  if (!route) {
    return res.status(404).json({
      error: 'API route not found'
    });
  }

  const routeHandler = handlers[route];

  if (!routeHandler) {
    return res.status(404).json({
      error: `Unknown API route: ${route}`
    });
  }

  const originalQuery = req.query;

  req.query = {
    ...originalQuery
  };

  delete req.query.route;

  try {
    return await routeHandler(req, res);
  } catch (error) {
    console.error(`API ${route}:`, error);

    if (res.headersSent) {
      return;
    }

    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : 'Internal server error'
    });
  }
}