
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Siren,
  Phone,
  MapPin,
  UserPlus,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react';
import PageHero from '../components/PageHero';
import {
  EMERGENCY_NUMBERS,
  ER_STEPS
} from '../../../ai-service/emergency-protocols';
import { api, type SessionUser } from '../lib/api';

type Contact = {
  id: number;
  name: string;
  phone: string;
  relation: string;
  telegram_connected_at: string | null;
};

type Alert = {
  id: number;
  status: string;
  note: string;
  created_at: string;
  tracking_token?: string;
};

type Position = {
  lat: number;
  lng: number;
  accuracy: number;
  at: number;
};

type Delivery = {
  name: string;
  sent: boolean;
};

type Created = {
  id: number;
  delivery: Delivery[];
  tracking_url: string;
};

export default function SOS({
  user
}: {
  user: SessionUser;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [position, setPosition] = useState<Position | null>(null);
  const [locationError, setLocationError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<Created | null>(null);
  const [delivery, setDelivery] = useState<Delivery[]>([]);
  const [note, setNote] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Family');
  const [showAdd, setShowAdd] = useState(false);
  const [link, setLink] = useState('');

  const watchId = useRef<number | null>(null);
  const activeId = useRef<number | null>(null);
  const lastSent = useRef(0);
  const sendingLocation = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const [contactData, alertData] = await Promise.all([
        api<Contact[]>(
          '/api/sos-contacts?user_id=' +
          encodeURIComponent(user.id)
        ),
        api<Alert[]>(
          '/api/sos-alerts?user_id=' +
          encodeURIComponent(user.id)
        )
      ]);

      setContacts(contactData);
      setAlerts(alertData);

      const existing = alertData.find(
        item =>
          item.status === 'active' &&
          item.tracking_token
      );

      if (existing && !activeId.current) {
        activeId.current = existing.id;

        setActive({
          id: existing.id,
          delivery: [],
          tracking_url:
            window.location.origin +
            '/sos-track.html?token=' +
            existing.tracking_token
        });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'SOS data unavailable'
      );
    }
  }, [user.id]);

  const stopWatch = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
    }

    watchId.current = null;
  }, []);

  const startWatch = useCallback(() => {
    if (
      !navigator.geolocation ||
      watchId.current !== null
    ) {
      return;
    }

    watchId.current =
      navigator.geolocation.watchPosition(
        async gps => {
          const next: Position = {
            lat: gps.coords.latitude,
            lng: gps.coords.longitude,
            accuracy: gps.coords.accuracy,
            at: gps.timestamp
          };

          setPosition(next);
          setLocationError('');

          const id = activeId.current;

          if (
            !id ||
            sendingLocation.current ||
            Date.now() - lastSent.current < 5000
          ) {
            return;
          }

          sendingLocation.current = true;

          try {
            await api('/api/sos-location', {
              method: 'POST',
              body: {
                alert_id: id,
                user_id: user.id,
                lat: next.lat,
                lng: next.lng,
                accuracy: next.accuracy
              }
            });

            lastSent.current = Date.now();
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : 'Live GPS update failed'
            );
          } finally {
            sendingLocation.current = false;
          }
        },
        () => {
          setLocationError(
            'GPS unavailable. Enable location and keep this page open.'
          );
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000
        }
      );
  }, [user.id]);

  useEffect(() => {
    void refresh();
    startWatch();

    return () => {
      stopWatch();
    };
  }, [refresh, startWatch, stopWatch]);

  const addContact = async () => {
    setError('');

    if (
      !name.trim() ||
      !/^[6-9]\d{9}$/.test(phone)
    ) {
      setError(
        'Enter a valid name and 10-digit mobile number'
      );
      return;
    }

    try {
      await api('/api/sos-contacts', {
        method: 'POST',
        body: {
          user_id: user.id,
          name,
          phone,
          relation
        }
      });

      setName('');
      setPhone('');
      setShowAdd(false);

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Cannot add contact'
      );
    }
  };

  const connect = async (id: number) => {
    setError('');

    try {
      const result = await api<{
        link: string;
      }>('/api/sos-contacts', {
        method: 'PATCH',
        body: {
          id,
          user_id: user.id
        }
      });

      setLink(result.link);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Cannot create Telegram invitation'
      );
    }
  };

  const trigger = async () => {
    setError('');

    if (busy || activeId.current) {
      return;
    }

    if (
      !contacts.some(
        contact => contact.telegram_connected_at
      )
    ) {
      setError(
        'Connect at least one emergency contact to Telegram first'
      );
      return;
    }

    if (
      !window.confirm(
        'Send emergency SOS to your connected contacts?'
      )
    ) {
      return;
    }

    setBusy(true);

    try {
      const gps =
        await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 12000
              }
            );
          }
        );

      const next: Position = {
        lat: gps.coords.latitude,
        lng: gps.coords.longitude,
        accuracy: gps.coords.accuracy,
        at: gps.timestamp
      };

      setPosition(next);

      const result = await api<Created>(
        '/api/sos-alerts',
        {
          method: 'POST',
          body: {
            user_id: user.id,
            user_name: user.name,
            lat: next.lat,
            lng: next.lng,
            note
          }
        }
      );

      activeId.current = result.id;
      setActive(result);
      setDelivery(result.delivery);

      if (watchId.current === null) {
        startWatch();
      }

      await refresh();

      if (
        !result.delivery.some(
          contact => contact.sent
        )
      ) {
        setError(
          'SOS created, but Telegram alerts failed. Call 112 if urgent.'
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'SOS failed. Call 112 if urgent.'
      );
    } finally {
      setBusy(false);
    }
  };

  const resolve = async () => {
    if (!activeId.current || busy) {
      return;
    }

    setBusy(true);
    setError('');

    try {
      await api('/api/sos-alerts', {
        method: 'PUT',
        body: {
          id: activeId.current,
          user_id: user.id
        }
      });

      activeId.current = null;
      setActive(null);
      setDelivery([]);

      await refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not stop SOS'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        icon={<Siren size={28} />}
        kicker="Emergency"
        title="SOS & Live Location"
        sub="Emergency alerts and live tracking for connected Telegram contacts."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-3xl bg-gradient-to-br from-red-600 to-red-900 p-7 text-center text-white">
            <h2 className="text-xl font-bold">
              Emergency SOS
            </h2>

            <button
              disabled={busy || !!active}
              onClick={trigger}
              className="mx-auto my-7 flex h-44 w-44 items-center justify-center rounded-full bg-white text-4xl font-black text-red-600 shadow-xl disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="animate-spin" />
              ) : (
                'SOS'
              )}
            </button>

            <div className="rounded-xl bg-white/15 p-3 text-sm">
              <MapPin
                className="mr-1 inline"
                size={16}
              />

              {position
                ? `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)} · Accuracy ~${Math.round(position.accuracy)} m`
                : locationError ||
                  'Detecting your location automatically...'}
            </div>

            {active && (
              <div className="mt-4 space-y-3 rounded-xl bg-white p-4 text-left text-slate-800">
                <p className="font-bold text-red-700">
                  SOS active — Keep this page open
                  for live GPS
                </p>

                <a
                  href={active.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 underline"
                >
                  Open live tracking
                  <ExternalLink size={14} />
                </a>

                <div className="space-y-1 text-sm">
                  {delivery.map(contact => (
                    <p key={contact.name}>
                      {contact.sent ? '✅' : '❌'}{' '}
                      {contact.name}:{' '}
                      {contact.sent
                        ? 'Telegram accepted alert'
                        : 'Alert request failed'}
                    </p>
                  ))}
                </div>

                <button
                  disabled={busy}
                  onClick={resolve}
                  className="w-full rounded-xl bg-emerald-600 p-3 font-bold text-white"
                >
                  I'm Safe — Stop SOS
                </button>
              </div>
            )}

            <input
              value={note}
              onChange={event =>
                setNote(event.target.value)
              }
              placeholder="Emergency note (optional)"
              className="mt-4 w-full rounded-xl bg-white/20 p-3 text-white placeholder:text-red-100"
            />

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {EMERGENCY_NUMBERS.map(number => (
                <a
                  key={number.number}
                  href={'tel:' + number.number}
                  className="rounded-xl bg-white p-3 text-red-700"
                >
                  <Phone
                    size={16}
                    className="inline"
                  />
                  {' '}
                  {number.number}

                  <span className="block text-xs text-slate-600">
                    {number.label}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          <section className="rounded-3xl bg-white p-5">
            <h3 className="font-bold">
              Emergency first-aid steps
            </h3>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {ER_STEPS.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-xl bg-slate-50 p-3"
                >
                  <b>
                    {index + 1}. {step.title}
                  </b>

                  <p className="text-sm text-slate-600">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-3xl bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">
                Emergency contacts ({contacts.length})
              </h3>

              <button
                onClick={() =>
                  setShowAdd(value => !value)
                }
                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
              >
                <UserPlus
                  size={15}
                  className="inline"
                />
                {' '}
                Add
              </button>
            </div>

            {showAdd && (
              <div className="mt-3 space-y-2">
                <input
                  className="w-full rounded-xl border p-2"
                  placeholder="Name"
                  value={name}
                  onChange={event =>
                    setName(event.target.value)
                  }
                />

                <input
                  className="w-full rounded-xl border p-2"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={event =>
                    setPhone(
                      event.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10)
                    )
                  }
                />

                <select
                  className="w-full rounded-xl border p-2"
                  value={relation}
                  onChange={event =>
                    setRelation(event.target.value)
                  }
                >
                  {[
                    'Family',
                    'Friend',
                    'Neighbour',
                    'Doctor'
                  ].map(value => (
                    <option key={value}>
                      {value}
                    </option>
                  ))}
                </select>

                <button
                  onClick={addContact}
                  className="w-full rounded-xl bg-emerald-600 p-2 text-white"
                >
                  Save contact
                </button>
              </div>
            )}

            {link && (
              <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm">
                <p>
                  Send this invitation to your
                  contact. They must tap Start
                  in Telegram.
                </p>

                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-blue-700 underline"
                >
                  {link}
                </a>

                <button
                  onClick={() =>
                    void navigator.clipboard.writeText(
                      link
                    )
                  }
                  className="ml-2 font-bold text-blue-800"
                >
                  Copy
                </button>
              </div>
            )}

            <div className="mt-4 space-y-3">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className="rounded-xl bg-slate-50 p-3"
                >
                  <p className="font-bold">
                    {contact.name}
                    {' '}
                    <span className="text-xs font-normal">
                      {contact.relation}
                    </span>
                  </p>

                  <p className="text-sm text-slate-600">
                    {contact.phone}
                  </p>

                  <p
                    className={
                      'text-xs ' +
                      (contact.telegram_connected_at
                        ? 'text-emerald-700'
                        : 'text-amber-700')
                    }
                  >
                    {contact.telegram_connected_at
                      ? 'Telegram connected'
                      : 'Telegram not connected'}
                  </p>

                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() =>
                        connect(contact.id)
                      }
                      className="rounded-lg bg-blue-600 px-2 py-1 text-xs text-white"
                    >
                      {contact.telegram_connected_at
                        ? 'Reconnect'
                        : 'Connect Telegram'}
                    </button>

                    <a
                      href={'tel:' + contact.phone}
                      className="rounded-lg bg-white p-1"
                    >
                      <Phone size={16} />
                    </a>

                    <button
                      onClick={async () => {
                        if (
                          !window.confirm(
                            'Delete this contact?'
                          )
                        ) {
                          return;
                        }

                        try {
                          await api(
                            '/api/sos-contacts?id=' +
                            contact.id +
                            '&user_id=' +
                            encodeURIComponent(user.id),
                            { method: 'DELETE' }
                          );

                          await refresh();
                        } catch (err) {
                          setError(
                            err instanceof Error
                              ? err.message
                              : 'Cannot delete contact'
                          );
                        }
                      }}
                      className="p-1 text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => void refresh()}
              className="mt-3 text-sm font-semibold text-blue-700"
            >
              Refresh contact connection status
            </button>
          </section>

          <section className="rounded-3xl bg-white p-5">
            <h3 className="font-bold">
              Recent SOS alerts
            </h3>

            {alerts.slice(0, 8).map(alert => (
              <div
                key={alert.id}
                className="mt-2 rounded-xl bg-slate-50 p-3 text-sm"
              >
                <span
                  className={
                    alert.status === 'active'
                      ? 'text-red-700'
                      : 'text-emerald-700'
                  }
                >
                  {alert.status}
                </span>

                {' · '}

                {new Date(
                  alert.created_at
                ).toLocaleString('en-IN')}
              </div>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}