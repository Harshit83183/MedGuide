import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Siren, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { MedGuideMark } from './MedIcons';
import { clearSession, type SessionUser } from '../lib/api';
import supabase, { isSupabaseConfigured } from '../lib/supabase';

const LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/symptom-checker', label: 'Symptom Checker' },
  { to: '/common-problems', label: 'Common Problems' },
  { to: '/clinics', label: 'Clinics' },
  { to: '/medicines', label: 'Save on Medicines' },
  { to: '/video-consult', label: 'Video Consult' },
  { to: '/records', label: 'My Records' },
];

export default function Navbar({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const logout = () => {
    // Clear the app session/state immediately so logout never depends on network.
    clearSession();
    onLogout();
    nav('/login', { replace: true });

    // Also end the Supabase session when configured, without blocking the UI.
    if (isSupabaseConfigured) void supabase.auth.signOut().catch(() => undefined);
  };
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4">
        <Link to="/home" className="flex items-center gap-2.5">
          <motion.span whileHover={{ rotate: -8, scale: 1.06 }} transition={{ type: 'spring', stiffness: 300 }}>
            <MedGuideMark size={38} />
          </motion.span>
          <span className="leading-tight">
            <span className="block text-lg font-extrabold tracking-tight text-[#0B1F3A]">MedGuide</span>
            <span className="block text-[11px] font-medium text-slate-500">Sehat ka Smart Saathi</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                'rounded-full px-3.5 py-2 text-[13px] font-semibold transition ' +
                (isActive ? 'bg-[#0B3D91] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B3D91]')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => nav('/sos')}
            className="relative flex items-center gap-1.5 rounded-full bg-red-600 px-3.5 py-2 text-[13px] font-bold text-white shadow-lg shadow-red-600/30 hover:bg-red-700"
          >
            <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" />
            <Siren size={16} className="relative" />
            <span className="relative hidden sm:inline">SOS</span>
          </motion.button>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3 md:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1D6FF2] to-[#0B3D91] text-sm font-bold text-white">
              {(user.name || 'M').charAt(0).toUpperCase()}
            </span>
            <span data-no-translate="true" className="max-w-[110px] truncate text-[13px] font-semibold text-slate-700">{user.name}</span>
          </div>
          <button onClick={logout} title="Logout" className="hidden rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 md:block">
            <LogOut size={18} />
          </button>
          <button onClick={() => setOpen(!open)} className="rounded-full p-2 text-slate-700 hover:bg-slate-100 lg:hidden">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="space-y-1 px-4 py-3">
              {[...LINKS, { to: '/sos', label: '🚨 Emergency SOS' }, { to: '/family', label: 'Family Profiles' }].map((l) => (
                <NavLink
                  key={l.to + l.label}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => 'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ' + (isActive ? 'bg-blue-50 text-[#0B3D91]' : 'text-slate-600 hover:bg-slate-50')}
                >
                  <LayoutDashboard size={15} className="opacity-40" /> {l.label}
                </NavLink>
              ))}
              <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                <LogOut size={15} /> Logout ({user.name})
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
