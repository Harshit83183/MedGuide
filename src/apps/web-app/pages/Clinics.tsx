import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Hospital,
  MapPin,
  Navigation,
  Loader2,
  Stethoscope,
  HeartPulse,
  Cross,
  LocateFixed,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Map,
  Search
} from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import type { SessionUser } from '../lib/api';

type LocationState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'denied'
  | 'unavailable'
  | 'timeout'
  | 'error';

type Category = {
  id: string;
  title: string;
  description: string;
  query: string;
  icon: React.ReactNode;
};

const categories: Category[] = [
  {
    id: 'clinics',
    title: 'Nearby Clinics',
    description: 'Aapke aas-paas ke clinics dekhein.',
    query: 'clinics',
    icon: <Hospital size={24} />
  },
  {
    id: 'hospitals',
    title: 'Nearby Hospitals',
    description: 'Nearby hospitals aur healthcare centres.',
    query: 'hospitals',
    icon: <HeartPulse size={24} />
  },
  {
    id: 'doctors',
    title: 'Doctors Near Me',
    description: 'Aas-paas available doctors search karein.',
    query: 'doctors',
    icon: <Stethoscope size={24} />
  },
  {
    id: 'dental',
    title: 'Dental Clinics',
    description: 'Nearby dentists aur dental clinics.',
    query: 'dental clinics',
    icon: <Cross size={24} />
  },
  {
    id: 'emergency',
    title: 'Emergency Hospitals',
    description: 'Emergency hospital options nearby dekhein.',
    query: 'emergency hospitals',
    icon: <ShieldCheck size={24} />
  }
];

export default function Clinics({ user: _user }: { user: SessionUser }) {
  const [locationState, setLocationState] =
    useState<LocationState>('idle');

  const [latitude, setLatitude] =
    useState<number | null>(null);

  const [longitude, setLongitude] =
    useState<number | null>(null);

  const [accuracy, setAccuracy] =
    useState<number | null>(null);

  const [radius, setRadius] = useState(5);

  const [search, setSearch] = useState('');

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('unavailable');
      return;
    }

    setLocationState('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAccuracy(position.coords.accuracy);
        setLocationState('ready');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState('denied');
          return;
        }

        if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationState('unavailable');
          return;
        }

        if (error.code === error.TIMEOUT) {
          setLocationState('timeout');
          return;
        }

        setLocationState('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000
      }
    );
  };

  const buildMapsUrl = (query: string) => {
    const location =
      latitude !== null && longitude !== null
        ? `${latitude},${longitude}`
        : '';

    const searchQuery =
      location
        ? `${query} near ${location}`
        : `${query} near me`;

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      searchQuery
    )}`;
  };

  const openCategory = (query: string) => {
    if (locationState !== 'ready') {
      getLocation();
      return;
    }

    window.open(
      buildMapsUrl(query),
      '_blank',
      'noopener,noreferrer'
    );
  };

  const searchPlace = () => {
    const value = search.trim();

    if (!value) {
      return;
    }

    if (locationState !== 'ready') {
      getLocation();
      return;
    }

    window.open(
      buildMapsUrl(value),
      '_blank',
      'noopener,noreferrer'
    );
  };

  const openCurrentLocation = () => {
    if (
      latitude === null ||
      longitude === null
    ) {
      getLocation();
      return;
    }

    const url =
      `https://www.google.com/maps/search/?api=1&query=` +
      encodeURIComponent(
        `${latitude},${longitude}`
      );

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const locationMessage = () => {
    if (locationState === 'denied') {
      return 'Location permission blocked hai. Browser address bar ke paas location permission Allow karke Retry karein.';
    }

    if (locationState === 'unavailable') {
      return 'Aapki current location detect nahi ho pa rahi hai.';
    }

    if (locationState === 'timeout') {
      return 'Location detect hone me zyada samay lag gaya. Dobara try karein.';
    }

    if (locationState === 'error') {
      return 'Location detect karte waqt problem aayi. Dobara try karein.';
    }

    return '';
  };

  const hasLocationError = [
    'denied',
    'unavailable',
    'timeout',
    'error'
  ].includes(locationState);

  return (
    <div>
      <PageHero
        icon={<Hospital size={28} />}
        kicker="Location Based Healthcare"
        title="Clinics & Hospitals Near You"
        sub="Apni current location ke aas-paas real clinics, hospitals, doctors aur emergency healthcare options Google Maps par dekhein."
      />

      <Reveal>
        <div className="mb-5 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1D6FF2]">
                    <LocateFixed size={22} />
                  </span>

                  <div>
                    <h2 className="font-extrabold text-[#0B1F3A]">
                      Your Location
                    </h2>

                    <p className="text-sm text-slate-500">
                      Nearby healthcare options ke liye location access dein.
                    </p>
                  </div>
                </div>

                {locationState === 'ready' && (
                  <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 ring-1 ring-emerald-200">
                    <p className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                      <MapPin size={16} />
                      Location successfully detected
                    </p>

                    {accuracy !== null && (
                      <p className="mt-1 text-xs text-emerald-600">
                        Approx. accuracy: {Math.round(accuracy)} metres
                      </p>
                    )}
                  </div>
                )}

                {hasLocationError && (
                  <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
                    <p className="text-sm font-semibold text-red-700">
                      {locationMessage()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={getLocation}
                  disabled={locationState === 'loading'}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:opacity-95 disabled:opacity-60"
                >
                  {locationState === 'loading' ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Detecting...
                    </>
                  ) : locationState === 'ready' ? (
                    <>
                      <RefreshCw size={17} />
                      Refresh Location
                    </>
                  ) : (
                    <>
                      <Navigation size={17} />
                      Use My Location
                    </>
                  )}
                </button>

                {locationState === 'ready' && (
                  <button
                    onClick={openCurrentLocation}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                  >
                    <Map size={17} />
                    View My Location
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="mb-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
          <p className="mb-3 text-sm font-extrabold text-[#0B1F3A]">
            Search Healthcare
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border-2 border-slate-200 px-4 py-2.5 focus-within:border-[#1D6FF2]">
              <Search
                size={18}
                className="text-slate-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchPlace();
                  }
                }}
                placeholder="Search: eye hospital, skin doctor, child clinic..."
                className="w-full bg-transparent text-sm font-medium outline-none"
              />
            </div>

            <button
              onClick={searchPlace}
              disabled={!search.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0B3D91] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              <Search size={17} />
              Search Nearby
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="mb-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <MapPin
                size={17}
                className="text-[#1D6FF2]"
              />

              <span className="text-sm font-extrabold text-[#0B1F3A]">
                Preferred Search Radius
              </span>
            </div>

            <div className="flex flex-wrap gap-2 sm:ml-auto">
              {[2, 5, 10, 15].map((km) => (
                <button
                  key={km}
                  onClick={() => setRadius(km)}
                  className={
                    'rounded-xl px-4 py-2 text-xs font-bold transition ' +
                    (radius === km
                      ? 'bg-[#0B3D91] text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                  }
                >
                  {km} km
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Google Maps nearby results apni location aur Maps ke available place data ke basis par dikhata hai. Radius preference informational hai aur exact Maps result boundary ko force nahi karti.
          </p>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <Reveal
            key={category.id}
            delay={(index % 3) * 0.07}
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="flex h-full flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-xl"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow">
                {category.icon}
              </span>

              <h3 className="mt-4 text-base font-extrabold text-[#0B1F3A]">
                {category.title}
              </h3>

              <p className="mt-1 flex-1 text-sm leading-6 text-slate-500">
                {category.description}
              </p>

              <button
                onClick={() =>
                  openCategory(category.query)
                }
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-2.5 text-sm font-bold text-white shadow transition hover:opacity-95"
              >
                <MapPin size={16} />
                Find Near Me
                <ExternalLink size={14} />
              </button>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-6 rounded-3xl bg-blue-50/70 p-5 ring-1 ring-blue-100">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#1D6FF2] shadow-sm">
              <MapPin size={20} />
            </span>

            <div>
              <p className="font-extrabold text-[#0B1F3A]">
                Real place information
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                MedGuide is page par clinic rating, fee, availability, reviews ya verification status invent nahi karta. Google Maps khulne ke baad wahi place information dikhegi jo Maps par available hai.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <div className="mt-6">
        <Disclaimer compact />
      </div>
    </div>
  );
}