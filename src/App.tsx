import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
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
import { loadSession, type SessionUser } from './apps/web-app/lib/api';
import { handleGoogleRedirect } from './apps/web-app/lib/googleAuth';

handleGoogleRedirect();

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

function WelcomeGate({ user }: { user: SessionUser }) {
  const nav = useNavigate();

  const done = useCallback(() => {
    nav('/home', { replace: true });
  }, [nav]);

  return <Splash onDone={done} name={user.name} />;
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

  useEffect(() => {
    setUser(loadSession());
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  const logout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route
          path="/login"
          element={
            user
              ? <Navigate to="/welcome" replace />
              : <Login onLogin={setUser} />
          }
        />

        <Route
          path="/welcome"
          element={
            user
              ? <WelcomeGate user={user} />
              : <Navigate to="/login" replace />
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
              <SymptomChecker user={user!} />
            </Guard>
          }
        />

        <Route
          path="/common-problems"
          element={
            <Guard user={user} onLogout={logout}>
              <CommonProblems />
            </Guard>
          }
        />

        <Route
          path="/common-problems/result"
          element={
            <Guard user={user} onLogout={logout}>
              <CommonProblemResult />
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