export type CareLocation = { lat: number; lon: number; label: string; source: 'device' | 'city' };
export const careLocationKey = (id: string) => `medguide_care_location_${id}`;
export const careSetupKey = (id: string) => `medguide_care_setup_${id}`;
export function getCareLocation(id: string): CareLocation | null {
  try {
    const raw = sessionStorage.getItem(careLocationKey(id)) || localStorage.getItem(careLocationKey(id));
    if (!raw) return null;
    const value = JSON.parse(raw) as CareLocation;
    return Number.isFinite(value.lat) && Number.isFinite(value.lon) && typeof value.label === 'string' ? value : null;
  } catch { return null; }
}
export function saveCareLocation(id: string, location: CareLocation) {
  sessionStorage.setItem(careLocationKey(id), JSON.stringify(location));
  localStorage.setItem(careLocationKey(id), JSON.stringify(location));
  window.dispatchEvent(new Event('medguide-location-updated'));
}
export function requestCareLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation is not supported.'));
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 });
  });
}
