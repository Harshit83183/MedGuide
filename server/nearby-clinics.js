const OVERPASS_URLS = [
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

const cache = new Map();

const CACHE_TIME = 15 * 60 * 1000;

const USER_AGENT =
  'MedGuide-Healthcare-Educational-Project/1.0';

const toNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const distanceKm = (lat1, lon1, lat2, lon2) => {
  const r = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return (
    r *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )
  );
};

const getCoordinates = (element) => {
  if (
    typeof element.lat === 'number' &&
    typeof element.lon === 'number'
  ) {
    return {
      lat: element.lat,
      lon: element.lon
    };
  }

  if (
    typeof element.center?.lat === 'number' &&
    typeof element.center?.lon === 'number'
  ) {
    return {
      lat: element.center.lat,
      lon: element.center.lon
    };
  }

  return null;
};

const getPhone = (tags) =>
  tags.phone ||
  tags['contact:phone'] ||
  tags['contact:mobile'] ||
  '';

const getWebsite = (tags) =>
  tags.website ||
  tags['contact:website'] ||
  tags.url ||
  '';

const getAddress = (tags) => {
  if (tags['addr:full']) {
    return tags['addr:full'];
  }

  const parts = [
    tags['addr:housename'],
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:neighbourhood'],
    tags['addr:suburb'],
    tags['addr:city'],
    tags['addr:district'],
    tags['addr:state'],
    tags['addr:postcode']
  ].filter(Boolean);

  return [...new Set(parts)].join(', ');
};

const getCity = (tags) =>
  tags['addr:city'] ||
  tags['addr:town'] ||
  tags['addr:village'] ||
  tags['addr:district'] ||
  '';

const getType = (tags) => {
  if (tags.amenity === 'hospital') {
    return 'Hospital';
  }

  if (
    tags.amenity === 'clinic' ||
    tags.healthcare === 'clinic'
  ) {
    return 'Clinic';
  }

  if (
    tags.amenity === 'doctors' ||
    tags.healthcare === 'doctor'
  ) {
    return 'Doctor';
  }

  if (
    tags.amenity === 'dentist' ||
    tags.healthcare === 'dentist'
  ) {
    return 'Dental Clinic';
  }

  return 'Healthcare';
};

const getSpecialties = (tags) => {
  const value =
    tags['healthcare:speciality'] ||
    tags.speciality ||
    tags.specialty ||
    '';

  if (!value) {
    return [];
  }

  return value
    .split(';')
    .map((item) =>
      item
        .replaceAll('_', ' ')
        .trim()
        .replace(
          /\b\w/g,
          (letter) => letter.toUpperCase()
        )
    )
    .filter(Boolean);
};

const getBoundingBox = (
  lat,
  lon,
  radiusMeters
) => {
  const radiusKm =
    radiusMeters / 1000;

  const latDelta =
    radiusKm / 111.32;

  const cosLat =
    Math.cos((lat * Math.PI) / 180);

  const safeCos =
    Math.max(
      Math.abs(cosLat),
      0.01
    );

  const lonDelta =
    radiusKm /
    (111.32 * safeCos);

  return {
    south: lat - latDelta,
    west: lon - lonDelta,
    north: lat + latDelta,
    east: lon + lonDelta
  };
};

const createQuery = (
  lat,
  lon,
  radius
) => {
  const box =
    getBoundingBox(
      lat,
      lon,
      radius
    );

  const bbox =
    `${box.south},${box.west},${box.north},${box.east}`;

  return `
[out:json][timeout:20];
(
  nwr["amenity"~"clinic|hospital|doctors|dentist"](${bbox});
  nwr["healthcare"~"clinic|doctor|dentist"](${bbox});
);
out center tags qt;
`;
};

const requestOverpass = async (query) => {
  let lastError;
  for (const endpoint of OVERPASS_URLS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'User-Agent': USER_AGENT },
        body: 'data=' + encodeURIComponent(query),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Overpass ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.elements)) throw new Error('Invalid Overpass response');
      return data;
    } catch (error) { lastError = error; }
    finally { clearTimeout(timer); }
  }
  throw lastError || new Error('Nearby map data unavailable');
};


const requestNominatim = async (lat, lon, radiusMeters) => {
  const box = getBoundingBox(lat, lon, radiusMeters);
  const viewbox = `${box.west},${box.north},${box.east},${box.south}`;
  const terms = ['hospital', 'clinic', 'doctor'];
  const found = [];

  for (const term of terms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    try {
      const params = new URLSearchParams({
        q: term,
        format: 'jsonv2',
        limit: '12',
        addressdetails: '1',
        extratags: '1',
        namedetails: '1',
        bounded: '1',
        viewbox
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT }
      });
      if (!response.ok) continue;
      const rows = await response.json();
      if (Array.isArray(rows)) found.push(...rows);
    } catch { /* try the next term */ }
    finally { clearTimeout(timer); }
  }

  const unique = new Map();
  for (const row of found) {
    const rlat = Number(row.lat);
    const rlon = Number(row.lon);
    if (!Number.isFinite(rlat) || !Number.isFinite(rlon)) continue;
    const distance = distanceKm(lat, lon, rlat, rlon);
    if (distance > radiusMeters / 1000) continue;
    const name = row.namedetails?.name || String(row.display_name || '').split(',')[0]?.trim();
    if (!name) continue;
    const kind = String(row.type || row.category || '').toLowerCase();
    const type = kind.includes('hospital') ? 'Hospital' : kind.includes('doctor') ? 'Doctor' : 'Clinic';
    const extra = row.extratags || {};
    const specialties = getSpecialties(extra);
    const clinic = {
      id: `nominatim-${row.osm_type || 'place'}-${row.osm_id || row.place_id}`,
      name,
      type,
      address: row.display_name || '',
      city: row.address?.city || row.address?.town || row.address?.village || row.address?.county || '',
      distance_km: Number(distance.toFixed(2)),
      latitude: rlat,
      longitude: rlon,
      phone: extra.phone || extra['contact:phone'] || '',
      website: extra.website || extra['contact:website'] || '',
      opening_hours: extra.opening_hours || '',
      emergency: extra.emergency === 'yes' || extra.emergency === '24_7',
      specialties,
      source: 'OpenStreetMap Nominatim'
    };
    const key = `${name.toLowerCase()}|${rlat.toFixed(4)}|${rlon.toFixed(4)}`;
    if (!unique.has(key)) unique.set(key, clinic);
  }
  return [...unique.values()].sort((a,b) => a.distance_km - b.distance_km);
};

export default async function handler(
  req,
  res
) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({
        error:
          'Method not allowed'
      });
  }

  const lat =
    toNumber(req.query.lat);

  const lon =
    toNumber(req.query.lon);

  const requestedRadius =
    toNumber(
      req.query.radius
    );

  if (
    lat === null ||
    lon === null ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return res
      .status(400)
      .json({
        error:
          'Valid latitude aur longitude required hain.'
      });
  }

  const radius =
    Math.min(
      Math.max(
        requestedRadius ||
          5000,
        1000
      ),
      15000
    );

  const cacheKey = [
    lat.toFixed(3),
    lon.toFixed(3),
    radius
  ].join(':');

  const cached =
    cache.get(cacheKey);

  if (
    cached &&
    Date.now() -
      cached.time <
      CACHE_TIME
  ) {
    return res
      .status(200)
      .json(cached.data);
  }

  try {
    const placesKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    if (placesKey) {
      try {
        const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': placesKey, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.nationalPhoneNumber,places.websiteUri' },
          body: JSON.stringify({ includedTypes: ['hospital', 'doctor'], maxResultCount: 20, rankPreference: 'DISTANCE', locationRestriction: { circle: { center: { latitude: lat, longitude: lon }, radius: Math.min(radius, 10000) } } })
        });
        if (response.ok) {
          const data = await response.json();
          const clinics = (data.places || []).filter(place => place.displayName?.text && place.location).map(place => ({
            id: place.id, name: place.displayName.text, address: place.formattedAddress || '',
            type: place.primaryType === 'hospital' ? 'Hospital' : 'Doctor',
            specialties: [], latitude: place.location.latitude, longitude: place.location.longitude,
            distance_km: distanceKm(lat, lon, place.location.latitude, place.location.longitude),
            phone: place.nationalPhoneNumber || '', website: place.websiteUri || '', source: 'Google Places'
          })).sort((a,b) => a.distance_km - b.distance_km);
          if (clinics.length) {
            const result = { source: 'Google Places', count: clinics.length, clinics };
            cache.set(cacheKey, { time: Date.now(), data: result });
            return res.status(200).json(result);
          }
        } else console.warn('Google Places:', response.status);
      } catch (placesError) { console.warn('Google Places unavailable:', placesError.message); }
    }
    const query =
      createQuery(
        lat,
        lon,
        radius
      );

    const data =
      await requestOverpass(
        query
      );

    const unique =
      new Map();

    for (
      const element
      of data.elements
    ) {
      const tags =
        element.tags || {};

      const coords =
        getCoordinates(
          element
        );

      if (!coords) {
        continue;
      }

      const name =
        tags.name ||
        tags['name:en'] ||
        tags['name:hi'];

      if (!name) {
        continue;
      }

      const distance =
        distanceKm(
          lat,
          lon,
          coords.lat,
          coords.lon
        );

      if (
        distance >
        radius / 1000
      ) {
        continue;
      }

      const clinic = {
        id:
          `${element.type}-${element.id}`,

        osm_type:
          element.type,

        osm_id:
          element.id,

        name,

        type:
          getType(tags),

        address:
          getAddress(tags),

        city:
          getCity(tags),

        distance_km:
          Number(
            distance.toFixed(2)
          ),

        latitude:
          coords.lat,

        longitude:
          coords.lon,

        phone:
          getPhone(tags),

        website:
          getWebsite(tags),

        opening_hours:
          tags.opening_hours ||
          '',

        emergency:
          tags.emergency ===
            'yes' ||
          tags.emergency ===
            '24_7',

        wheelchair:
          tags.wheelchair ||
          '',

        operator:
          tags.operator ||
          '',

        specialties:
          getSpecialties(tags),

        source:
          'OpenStreetMap'
      };

      const duplicateKey = [
        clinic.name
          .toLowerCase(),

        clinic.latitude
          .toFixed(5),

        clinic.longitude
          .toFixed(5)
      ].join('|');

      if (
        !unique.has(
          duplicateKey
        )
      ) {
        unique.set(
          duplicateKey,
          clinic
        );
      }
    }

    const clinics =
      [...unique.values()]
        .sort(
          (a, b) =>
            a.distance_km -
            b.distance_km
        );

    const result = {
      source:
        'OpenStreetMap',

      attribution:
        '© OpenStreetMap contributors',

      radius_km:
        radius / 1000,

      count:
        clinics.length,

      clinics
    };

    cache.set(
      cacheKey,
      {
        time: Date.now(),
        data: result
      }
    );

    console.log(
      `Nearby clinics loaded: ${clinics.length}`
    );

    return res
      .status(200)
      .json(result);
  } catch (error) {
    console.error('Overpass nearby clinics:', error);
    try {
      const clinics = await requestNominatim(lat, lon, radius);
      if (clinics.length) {
        const result = { source: 'OpenStreetMap Nominatim', attribution: '© OpenStreetMap contributors', radius_km: radius / 1000, count: clinics.length, clinics };
        cache.set(cacheKey, { time: Date.now(), data: result });
        return res.status(200).json(result);
      }
    } catch (fallbackError) {
      console.error('Nominatim nearby clinics:', fallbackError);
    }
    return res.status(503).json({ error: 'Nearby clinic providers are temporarily unavailable.' });
  }
}