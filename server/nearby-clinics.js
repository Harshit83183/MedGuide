const OVERPASS_URL =
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter';

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
[out:json][timeout:10];
(
  nwr["amenity"~"clinic|hospital|doctors|dentist"](${bbox});
  nwr["healthcare"~"clinic|doctor|dentist"](${bbox});
);
out center tags qt;
`;
};

const requestOverpass = async (
  query
) => {
  const controller =
    new AbortController();

  const timer =
    setTimeout(() => {
      controller.abort();
    }, 15000);

  try {
    const response =
      await fetch(
        OVERPASS_URL,
        {
          method: 'POST',
          headers: {
            Accept:
              'application/json',
            'Content-Type':
              'application/x-www-form-urlencoded;charset=UTF-8',
            'User-Agent':
              USER_AGENT
          },
          body:
            'data=' +
            encodeURIComponent(
              query
            ),
          signal:
            controller.signal
        }
      );

    if (!response.ok) {
      const body =
        await response.text();

      throw new Error(
        `Overpass ${response.status}: ${body.slice(0, 200)}`
      );
    }

    const data =
      await response.json();

    if (
      !Array.isArray(
        data.elements
      )
    ) {
      throw new Error(
        'Invalid nearby clinic response'
      );
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
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
    console.error(
      'Nearby clinics:',
      error
    );

    return res
      .status(503)
      .json({
        error:
          'Nearby clinic service abhi available nahi hai.'
      });
  }
}