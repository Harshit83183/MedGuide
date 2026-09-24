
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Shell from './apps/web-app/components/Shell';
import Login from './apps/web-app/pages/Login';
import Splash from './apps/web-app/pages/Splash';
import Home from './apps/web-app/pages/Home';
import SymptomChecker from './apps/web-app/pages/SymptomChecker';
import CommonProblems from './apps/web-app/pages/CommonProblems';
import CommonProblemResult from './apps/web-app/pages/CommonProblemResult';
import Triage from './apps/web-app/pages/Triage';
import Clinics from './apps/web-app/pages/Clinics';
import Medicines from './apps/web-app/pages/Medicines';
import VideoConsult from './apps/web-app/pages/VideoConsult';
import Records from './apps/web-app/pages/Records';
import Family from './apps/web-app/pages/Family';
import SOS from './apps/web-app/pages/SOS';
import Privacy from './apps/web-app/pages/Privacy';
import Legal from './apps/web-app/pages/Legal';

import {
  loadSession,
  clearSession,
  type SessionUser
} from './apps/web-app/lib/api';

import supabase, {
  isSupabaseConfigured
} from './apps/web-app/lib/supabase';

import { handleGoogleRedirect } from './apps/web-app/lib/googleAuth';
import FirstLanguageGate from './apps/web-app/components/FirstLanguageGate';
import { useLanguage } from './apps/web-app/lib/language';
import LocationOnboarding from './apps/web-app/components/LocationOnboarding';

import {
  requestCareLocation,
  saveCareLocation
} from './apps/web-app/lib/careLocation';

if (
  typeof window !== 'undefined' &&
  window.performance
    .getEntriesByType('navigation')
    .some(
      entry =>
        (entry as PerformanceNavigationTiming).type === 'reload'
    )
) {
  sessionStorage.removeItem('medguide_triage_result');
  sessionStorage.removeItem('medguide_common_problem_result');
}

void handleGoogleRedirect();

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto'
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

function ResumeOrStart({
  storageKey,
  resultPath,
  children
}: {
  storageKey: string;
  resultPath: string;
  children: ReactNode;
}) {
  try {
    if (sessionStorage.getItem(storageKey)) {
      return <Navigate to={resultPath} replace />;
    }
  } catch {
  }

  return <>{children}</>;
}

function Guard({
  user,
  onLogout,
  children
}: {
  user: SessionUser | null;
  onLogout: () => void;
  children: ReactNode;
}) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Shell user={user} onLogout={onLogout}>
      {children}
    </Shell>
  );
}

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  const [languageDone, setLanguageDone] = useState(
    () => localStorage.getItem('medguide_language_chosen') === '1'
  );

  const [locationGranted, setLocationGranted] = useState(false);

  const { setLang } = useLanguage();

  const verificationRef = useRef(false);
  const locationSessionRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function restoreAuthenticatedUser() {
      const saved = loadSession();

      if (!saved) {
        if (active) setReady(true);
        return;
      }

      if (saved.provider === 'demo' || saved.provider === 'phone') {
        if (active) {
          setUser(null);
          setReady(true);
        }

        return;
      }

      if (!isSupabaseConfigured) {
        if (active) {
          setUser(null);
          setReady(true);
        }

        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        const authUser = data.session?.user;

        const expectedId =
          (saved.provider === 'google' ? 'g-' : 'a-') +
          authUser?.id.slice(0, 12);

        if (active) {
          setUser(
            !error && authUser && expectedId === saved.id
              ? saved
              : null
          );
        }
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setReady(true);
      }
    }

    void restoreAuthenticatedUser();

    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(() => {
    locationSessionRef.current += 1;
    clearSession();
    setLocationGranted(false);
    setUser(null);
  }, []);

  const login = useCallback((loggedInUser: SessionUser) => {
    locationSessionRef.current += 1;
    setLocationGranted(false);
    setUser(loggedInUser);
  }, []);

  const locationAllowed = useCallback(() => {
    setLocationGranted(true);
  }, []);

  useEffect(() => {
    if (!user || !locationGranted) return;

    let active = true;
    let permissionStatus: PermissionStatus | null = null;

    const currentSession = locationSessionRef.current;

    const verify = async () => {
      if (!active || verificationRef.current) return;

      verificationRef.current = true;

      try {
        if (!navigator.geolocation) {
          if (active) setLocationGranted(false);
          return;
        }

        if (navigator.permissions) {
          const permission = await navigator.permissions.query({
            name: 'geolocation'
          });

          if (!active) return;

          if (permission.state !== 'granted') {
            setLocationGranted(false);
            return;
          }
        }

        const position = await requestCareLocation();

        if (
          !active ||
          currentSession !== locationSessionRef.current
        ) {
          return;
        }

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        saveCareLocation(user.id, {
          lat,
          lon,
          label: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
          source: 'device'
        });
      } catch {
        if (
          active &&
          currentSession === locationSessionRef.current
        ) {
          setLocationGranted(false);
        }
      } finally {
        verificationRef.current = false;
      }
    };

    const onFocus = () => {
      void verify();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void verify();
      }
    };

    const watchPermission = async () => {
      try {
        if (!navigator.permissions) return;

        const permission = await navigator.permissions.query({
          name: 'geolocation'
        });

        if (!active) return;

        permissionStatus = permission;

        permission.onchange = () => {
          void verify();
        };
      } catch {
      }
    };

    void watchPermission();

    window.addEventListener('focus', onFocus);

    document.addEventListener(
      'visibilitychange',
      onVisibilityChange
    );

    return () => {
      active = false;

      if (permissionStatus) {
        permissionStatus.onchange = null;
      }

      window.removeEventListener('focus', onFocus);

      document.removeEventListener(
        'visibilitychange',
        onVisibilityChange
      );
    };
  }, [user, locationGranted]);

  if (!introDone) {
    return (
      <Splash
        name="Friend"
        onDone={() => setIntroDone(true)}
      />
    );
  }

  if (!languageDone) {
    return (
      <FirstLanguageGate
        onDone={selected => {
          setLang(selected);
          localStorage.setItem(
            'medguide_language_chosen',
            '1'
          );
          setLanguageDone(true);
        }}
      />
    );
  }

  if (!ready) return null;

  if (user && !locationGranted) {
    return (
      <LocationOnboarding
        user={user}
        onGranted={locationAllowed}
      />
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/home" replace />
            ) : (
              <Login onLogin={login} />
            )
          }
        />

        <Route
          path="/welcome"
          element={
            <Navigate
              to={user ? '/home' : '/login'}
              replace
            />
          }
        />

        <Route
          path="/home"
          element={
            <Guard user={user} onLogout={logout}>
              <Home user={user!} />
            </Guard>
          }
        />

        <Route
          path="/symptom-checker"
          element={
            <Guard user={user} onLogout={logout}>
              <ResumeOrStart
                storageKey="medguide_triage_result"
                resultPath="/triage"
              >
                <SymptomChecker user={user!} />
              </ResumeOrStart>
            </Guard>
          }
        />

        <Route
          path="/common-problems"
          element={
            <Guard user={user} onLogout={logout}>
              <ResumeOrStart
                storageKey="medguide_common_problem_result"
                resultPath="/common-problems/result"
              >
                <CommonProblems />
              </ResumeOrStart>
            </Guard>
          }
        />

        <Route
          path="/common-problems/result"
          element={
            <Guard user={user} onLogout={logout}>
              <CommonProblemResult user={user!} />
            </Guard>
          }
        />

        <Route
          path="/triage"
          element={
            <Guard user={user} onLogout={logout}>
              <Triage user={user!} />
            </Guard>
          }
        />

        <Route
          path="/clinics"
          element={
            <Guard user={user} onLogout={logout}>
              <Clinics user={user!} />
            </Guard>
          }
        />

        <Route
          path="/medicines"
          element={
            <Guard user={user} onLogout={logout}>
              <Medicines />
            </Guard>
          }
        />

        <Route
          path="/video-consult"
          element={
            <Guard user={user} onLogout={logout}>
              <VideoConsult user={user!} />
            </Guard>
          }
        />

        <Route
          path="/records"
          element={
            <Guard user={user} onLogout={logout}>
              <Records user={user!} />
            </Guard>
          }
        />

        <Route
          path="/family"
          element={
            <Guard user={user} onLogout={logout}>
              <Family user={user!} />
            </Guard>
          }
        />

        <Route
          path="/sos"
          element={
            <Guard user={user} onLogout={logout}>
              <SOS user={user!} />
            </Guard>
          }
        />

        <Route
          path="/privacy"
          element={
            <Guard user={user} onLogout={logout}>
              <Privacy />
            </Guard>
          }
        />

        <Route
          path="/legal"
          element={
            <Guard user={user} onLogout={logout}>
              <Legal />
            </Guard>
          }
        />

        <Route
          path="/"
          element={
            <Navigate
              to={user ? '/home' : '/login'}
              replace
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={user ? '/home' : '/login'}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}