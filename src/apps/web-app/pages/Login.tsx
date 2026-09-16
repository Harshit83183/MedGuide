import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  ShieldCheck,
  Lock,
  ArrowRight,
  HeartPulse,
  Stethoscope,
  Pill,
  ChevronLeft,
  Sparkles,
  BadgeCheck,
  Mail,
  KeyRound,
  UserRoundPlus,
  LogIn,
  Eye,
  EyeOff,
  Siren,
} from 'lucide-react';
import TrustBar from '../components/TrustBar';
import { MedGuideMark, GoogleG } from '../components/MedIcons';
import supabase, { isSupabaseConfigured } from '../lib/supabase';
import { signInWithGoogle } from '../lib/googleAuth';
import { saveSession, type SessionUser } from '../lib/api';

const PERKS = [
  { icon: Stethoscope, t: 'Smart Symptom Triage', d: 'Green / Yellow / Red — turant samjho kitni urgent hai problem.' },
  { icon: HeartPulse, t: 'Verified Doctors & Clinics', d: 'Rating, distance aur booking slots ke saath.' },
  { icon: Pill, t: 'Jan Aushadhi Savings', d: 'Same composition, sasti dawa — bachat calculator.' },
];

type PasswordMode = 'signup' | 'signin';
type CredentialType = 'email' | 'phone';

export default function Login({ onLogin }: { onLogin: (u: SessionUser) => void }) {
  const nav = useNavigate();

  const [passwordMode, setPasswordMode] = useState<PasswordMode>('signup');
  const [credentialType, setCredentialType] = useState<CredentialType>('email');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);

  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [demoOtp, setDemoOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [err, setErr] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (!u) return;

      const authProvider = u.app_metadata?.provider === 'google' ? 'google' : 'password';
      const fallbackName = u.email
        ? u.email.split('@')[0]
        : u.phone
          ? 'User ' + u.phone.slice(-4)
          : 'MedGuide User';
      const userName =
        (u.user_metadata?.full_name as string) ||
        (u.user_metadata?.name as string) ||
        fallbackName;

      const sess: SessionUser = {
        id: (authProvider === 'google' ? 'g-' : 'a-') + u.id.slice(0, 12),
        name: userName,
        provider: authProvider,
        email: u.email || undefined,
        phone: u.phone || undefined,
      };

      saveSession(sess);
      onLogin(sess);
      nav('/welcome', { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [onLogin, nav]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const resetMessages = () => {
    setErr('');
    setInfo('');
  };

  const phoneForSupabase = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return '+91' + digits;
    if (digits.length === 12 && digits.startsWith('91')) return '+' + digits;
    return '';
  };

  const submitPasswordAuth = async () => {
    resetMessages();

    if (!isSupabaseConfigured) {
      setErr('Email/phone + password account ke liye pehle apna Supabase project connect karein (.env.local me URL aur anon key).');
      return;
    }

    const cleanIdentifier = identifier.trim();
    if (passwordMode === 'signup' && name.trim().length < 2) {
      setErr('Apna naam kam se kam 2 characters me likhein.');
      return;
    }

    if (credentialType === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier)) {
        setErr('Sahi email address likhein.');
        return;
      }
    } else if (!phoneForSupabase(cleanIdentifier)) {
      setErr('Sahi 10-digit Indian mobile number likhein.');
      return;
    }

    if (password.length < 6) {
      setErr('Password kam se kam 6 characters ka hona chahiye.');
      return;
    }
    if (passwordMode === 'signup' && password !== confirmPassword) {
      setErr('Password aur Confirm Password match nahi kar rahe.');
      return;
    }

    setBusy(true);
    try {
      if (passwordMode === 'signup') {
        const credentials = credentialType === 'email'
          ? { email: cleanIdentifier, password, options: { data: { full_name: name.trim() } } }
          : { phone: phoneForSupabase(cleanIdentifier), password, options: { data: { full_name: name.trim() } } };

        const { data, error } = await supabase.auth.signUp(credentials);
        if (error) {
          setErr(error.message);
          return;
        }

        if (!data.session) {
          if (credentialType === 'email') {
            setInfo('Account create ho gaya. Verification email bheji gayi hai — email verify karke Sign In karein.');
          } else {
            setInfo('Account create request successful. Agar Supabase phone confirmation enabled hai to mobile verification complete karke Sign In karein.');
          }
          setPasswordMode('signin');
          setConfirmPassword('');
        }
        // If Supabase returns a session, onAuthStateChange above completes login.
      } else {
        const credentials = credentialType === 'email'
          ? { email: cleanIdentifier, password }
          : { phone: phoneForSupabase(cleanIdentifier), password };

        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) setErr(error.message);
        // Successful login is handled by onAuthStateChange above.
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Authentication failed. Dobara try karein.');
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = () => {
    resetMessages();
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setErr('Sahi 10-digit mobile number likhein (6-9 se shuru).');
      return;
    }
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setDemoOtp(code);
    setOtpSent(true);
    setOtp(['', '', '', '']);
    setTimer(30);
  };

  const verify = () => {
    resetMessages();
    if (otp.join('') !== demoOtp) {
      setErr('Galat OTP. Demo OTP screen par dikh raha hai — wahi daalein.');
      return;
    }
    const sess: SessionUser = {
      id: 'p-' + phone.trim(),
      name: 'User ' + phone.trim().slice(-4),
      provider: 'phone',
      phone: phone.trim(),
    };
    saveSession(sess);
    onLogin(sess);
    nav('/welcome', { replace: true });
  };

  const google = async () => {
    resetMessages();
    setShowPhoneOtp(false);
    if (!isSupabaseConfigured) {
      setErr('Google login use karne ke liye pehle .env.local me apne Supabase URL aur anon/publishable key add karein.');
      return;
    }
    setBusy(true);
    const ok = await signInWithGoogle('MedGuide');
    setBusy(false);
    if (!ok) setErr('Google login configure nahi hai. Supabase me Google provider enable karein.');
  };

  const demo = () => {
    const sess: SessionUser = { id: 'demo-user', name: 'Demo Mehmaan', provider: 'demo' };
    saveSession(sess);
    onLogin(sess);
    nav('/welcome', { replace: true });
  };

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 3) document.getElementById('otp-' + (i + 1))?.focus();
  };

  const switchPasswordMode = (mode: PasswordMode) => {
    setPasswordMode(mode);
    setPassword('');
    setConfirmPassword('');
    resetMessages();
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      <TrustBar />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2 lg:py-14">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="relative hidden overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B3D91] via-[#1559c7] to-[#0B1F3A] p-10 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
          <motion.div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 8, repeat: Infinity }} />
          <motion.div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-teal-300/20 blur-3xl" animate={{ scale: [1.25, 1, 1.25] }} transition={{ duration: 9, repeat: Infinity }} />
          <div className="relative">
            <div className="flex items-center gap-3">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity }}><MedGuideMark size={52} /></motion.div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">MedGuide</h1>
                <p className="text-sm text-blue-100">Sehat ka Smart Saathi 💙</p>
              </div>
            </div>
            <motion.h2 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-10 text-4xl font-extrabold leading-tight">
              Bukhar ho ya <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">badi chinta</span>,<br />sahi raasta yahin milega.
            </motion.h2>
            <p className="mt-3 max-w-md text-[15px] text-blue-100">Hindi, English, Hinglish + 3 aur bhashayein · Photo/voice se symptom batayein · Verified doctors · Jan Aushadhi bachat · 1-Tap SOS</p>

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="relative mt-8 h-[370px] overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-white/[0.12] via-cyan-300/[0.06] to-slate-950/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_30px_70px_rgba(2,16,44,0.18)] backdrop-blur-md"
            >
              <div
                className="absolute inset-0 opacity-[0.13]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)',
                  backgroundSize: '34px 34px',
                }}
              />
              <motion.div
                className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl"
                animate={{ x: [0, 26, 0], y: [0, 18, 0], opacity: [0.35, 0.65, 0.35] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -right-12 bottom-10 h-48 w-48 rounded-full bg-violet-300/15 blur-3xl"
                animate={{ x: [0, -22, 0], y: [0, -16, 0], opacity: [0.25, 0.55, 0.25] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="absolute inset-x-5 top-4 z-20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/70">MedGuide Care Core</p>
                  <p className="mt-1 text-xs font-semibold text-white/90">One connected path for smarter care</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-300/10 px-2.5 py-1.5 text-[10px] font-extrabold text-emerald-200 ring-1 ring-emerald-200/20">
                  <motion.span className="h-1.5 w-1.5 rounded-full bg-emerald-300" animate={{ opacity: [1, 0.3, 1], scale: [1, 1.35, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                  LIVE
                </div>
              </div>

              <div className="absolute left-1/2 top-[48%] z-10 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  className="absolute inset-0 rounded-full border border-dashed border-cyan-100/25"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-[24px] rounded-full border border-white/15"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-[47px] rounded-full border border-cyan-200/20"
                  animate={{ scale: [0.94, 1.06, 0.94], opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                />

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-gradient-to-br from-white/25 via-cyan-200/15 to-blue-400/10 shadow-[0_18px_70px_rgba(34,211,238,0.28)] ring-1 ring-white/30 backdrop-blur-xl"
                >
                  <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.7, repeat: Infinity }}>
                    <HeartPulse size={38} className="text-white drop-shadow" />
                  </motion.div>
                  <span className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-50">Care AI</span>
                </motion.div>

                <motion.div animate={{ y: [0, -6, 0], x: [0, 3, 0] }} transition={{ duration: 3.2, repeat: Infinity }} className="absolute -left-8 top-5 flex items-center gap-2 rounded-2xl bg-[#0c2d68]/80 px-3 py-2 text-[11px] font-bold shadow-xl ring-1 ring-white/20 backdrop-blur-xl">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-300/15"><Sparkles size={14} className="text-amber-300" /></span>
                  Symptom AI
                </motion.div>
                <motion.div animate={{ y: [0, 6, 0], x: [0, -3, 0] }} transition={{ duration: 3.8, repeat: Infinity }} className="absolute -right-10 top-9 flex items-center gap-2 rounded-2xl bg-[#0c2d68]/80 px-3 py-2 text-[11px] font-bold shadow-xl ring-1 ring-white/20 backdrop-blur-xl">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-300/15"><BadgeCheck size={14} className="text-emerald-300" /></span>
                  Verified Care
                </motion.div>
                <motion.div animate={{ y: [0, 5, 0], x: [0, 4, 0] }} transition={{ duration: 4.1, repeat: Infinity }} className="absolute -left-5 bottom-1 flex items-center gap-2 rounded-2xl bg-[#0c2d68]/80 px-3 py-2 text-[11px] font-bold shadow-xl ring-1 ring-white/20 backdrop-blur-xl">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-300/15"><Pill size={14} className="text-cyan-200" /></span>
                  Smart Medicine
                </motion.div>
                <motion.div animate={{ y: [0, -5, 0], x: [0, -4, 0] }} transition={{ duration: 3.6, repeat: Infinity }} className="absolute -right-7 bottom-4 flex items-center gap-2 rounded-2xl bg-[#0c2d68]/80 px-3 py-2 text-[11px] font-bold shadow-xl ring-1 ring-white/20 backdrop-blur-xl">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-300/15"><Siren size={14} className="text-rose-300" /></span>
                  SOS Ready
                </motion.div>
              </div>

              <svg viewBox="0 0 460 92" className="absolute bottom-[72px] left-1/2 z-0 w-[88%] -translate-x-1/2 opacity-65" aria-hidden="true">
                <motion.path
                  d="M0 49 H66 L80 49 L93 33 L106 67 L121 41 L136 49 H195 L209 49 L221 24 L237 73 L252 39 L268 49 H325 L339 49 L352 34 L366 62 L379 43 L393 49 H460"
                  fill="none"
                  stroke="rgba(165,243,252,0.75)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0.15 }}
                  animate={{ pathLength: [0, 1, 1], opacity: [0.15, 0.95, 0.35] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              </svg>

              <div className="absolute inset-x-4 bottom-4 z-20 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white/[0.09] px-3 py-2.5 text-center ring-1 ring-white/15 backdrop-blur-md">
                  <p className="text-[15px] font-black text-white">6</p><p className="text-[9px] font-bold uppercase tracking-wider text-blue-100/75">Languages</p>
                </div>
                <div className="rounded-2xl bg-white/[0.09] px-3 py-2.5 text-center ring-1 ring-white/15 backdrop-blur-md">
                  <p className="text-[15px] font-black text-white">&lt; 1 min</p><p className="text-[9px] font-bold uppercase tracking-wider text-blue-100/75">Smart Triage</p>
                </div>
                <div className="rounded-2xl bg-white/[0.09] px-3 py-2.5 text-center ring-1 ring-white/15 backdrop-blur-md">
                  <p className="text-[15px] font-black text-white">108 / 112</p><p className="text-[9px] font-bold uppercase tracking-wider text-blue-100/75">Emergency</p>
                </div>
              </div>
            </motion.div>
          </div>
          <div className="relative mt-8 space-y-3">
            {PERKS.map((p, i) => (
              <motion.div key={p.t} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15 }} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15"><p.icon size={22} /></span>
                <div><p className="font-bold">{p.t}</p><p className="text-[13px] text-blue-100">{p.d}</p></div>
              </motion.div>
            ))}
            <div className="flex items-center gap-2 pt-2 text-xs text-blue-100">
              <ShieldCheck size={15} className="text-emerald-300" /> DPDP Act 2023 compliant
              <span className="mx-1">·</span>
              <Lock size={13} className="text-sky-300" /> 256-bit encrypted
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl shadow-blue-100 ring-1 ring-slate-100 sm:p-8">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <MedGuideMark size={44} />
              <div><h1 className="text-2xl font-extrabold text-[#0B1F3A]">MedGuide</h1><p className="text-xs text-slate-500">Sehat ka Smart Saathi</p></div>
            </div>

            <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-bold">
              <button onClick={() => switchPasswordMode('signup')} className={'flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition ' + (passwordMode === 'signup' ? 'bg-white text-[#0B3D91] shadow' : 'text-slate-500')}>
                <UserRoundPlus size={16} /> Create Account
              </button>
              <button onClick={() => switchPasswordMode('signin')} className={'flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition ' + (passwordMode === 'signin' ? 'bg-white text-[#0B3D91] shadow' : 'text-slate-500')}>
                <LogIn size={16} /> Sign In
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={passwordMode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <h2 className="text-xl font-extrabold text-[#0B1F3A]">
                  {passwordMode === 'signup' ? 'Create your account' : 'Welcome back 👋'}
                </h2>
                <p className="mb-4 mt-1 text-sm text-slate-500">
                  {passwordMode === 'signup' ? 'Email ya phone aur password se MedGuide account banayein.' : 'Email ya phone aur password se sign in karein.'}
                </p>

                <div className="mb-4 grid grid-cols-2 rounded-xl bg-slate-50 p-1 text-xs font-bold ring-1 ring-slate-200">
                  <button onClick={() => { setCredentialType('email'); setIdentifier(''); resetMessages(); }} className={'flex items-center justify-center gap-1.5 rounded-lg py-2 transition ' + (credentialType === 'email' ? 'bg-white text-[#0B3D91] shadow-sm' : 'text-slate-500')}>
                    <Mail size={14} /> Email
                  </button>
                  <button onClick={() => { setCredentialType('phone'); setIdentifier(''); resetMessages(); }} className={'flex items-center justify-center gap-1.5 rounded-lg py-2 transition ' + (credentialType === 'phone' ? 'bg-white text-[#0B3D91] shadow-sm' : 'text-slate-500')}>
                    <Phone size={14} /> Phone
                  </button>
                </div>

                {passwordMode === 'signup' && (
                  <div className="mb-3">
                    <label className="mb-1.5 block text-[13px] font-bold text-slate-600">Full Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-[#0B1F3A] outline-none transition focus:border-[#1D6FF2]" />
                  </div>
                )}

                <div className="mb-3">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-600">{credentialType === 'email' ? 'Email Address' : 'Mobile Number'}</label>
                  <div className="flex items-center rounded-2xl border-2 border-slate-200 px-4 focus-within:border-[#1D6FF2]">
                    {credentialType === 'phone' && <span className="mr-2 font-bold text-slate-500">+91</span>}
                    <input
                      value={identifier}
                      onChange={(e) => setIdentifier(credentialType === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value)}
                      placeholder={credentialType === 'email' ? 'you@example.com' : '98765 43210'}
                      type={credentialType === 'email' ? 'email' : 'tel'}
                      inputMode={credentialType === 'email' ? 'email' : 'numeric'}
                      autoComplete={credentialType === 'email' ? 'email' : 'tel'}
                      className="w-full bg-transparent py-3 text-sm font-semibold text-[#0B1F3A] outline-none placeholder:font-medium placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-600">Password</label>
                  <div className="flex items-center rounded-2xl border-2 border-slate-200 px-4 focus-within:border-[#1D6FF2]">
                    <KeyRound size={17} className="mr-2 text-slate-400" />
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Minimum 6 characters" autoComplete={passwordMode === 'signup' ? 'new-password' : 'current-password'} className="w-full bg-transparent py-3 text-sm font-semibold text-[#0B1F3A] outline-none" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="ml-2 text-slate-400 hover:text-[#0B3D91]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {passwordMode === 'signup' && (
                  <div className="mb-3">
                    <label className="mb-1.5 block text-[13px] font-bold text-slate-600">Confirm Password</label>
                    <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Password dobara likhein" autoComplete="new-password" className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-[#0B1F3A] outline-none transition focus:border-[#1D6FF2]" />
                  </div>
                )}

                <motion.button whileTap={{ scale: 0.98 }} onClick={submitPasswordAuth} disabled={busy} className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-3.5 font-bold text-white shadow-lg shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60">
                  {passwordMode === 'signup' ? <UserRoundPlus size={18} /> : <LogIn size={18} />}
                  {busy ? 'Please wait...' : passwordMode === 'signup' ? 'Create Account' : 'Sign In with Password'}
                  {!busy && <ArrowRight size={17} />}
                </motion.button>

                <p className="mt-3 text-center text-xs text-slate-500">
                  {passwordMode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button onClick={() => switchPasswordMode(passwordMode === 'signup' ? 'signin' : 'signup')} className="font-bold text-[#1D6FF2] hover:underline">
                    {passwordMode === 'signup' ? 'Sign in' : 'Create account'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>

            {info && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl bg-emerald-50 p-3 text-center text-[13px] font-semibold text-emerald-700">{info}</motion.p>}
            {err && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl bg-red-50 p-3 text-center text-[13px] font-semibold text-red-600">{err}</motion.p>}

            <div className="my-5 flex items-center gap-3 text-xs font-bold text-slate-300"><span className="h-px flex-1 bg-slate-200" /> OR CONTINUE WITH <span className="h-px flex-1 bg-slate-200" /></div>

            <div className="grid grid-cols-2 gap-3">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={google} disabled={busy} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-3 font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60">
                <GoogleG /> Google
              </motion.button>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => { setShowPhoneOtp((v) => !v); resetMessages(); }} className={'flex items-center justify-center gap-2 rounded-2xl border-2 py-3 font-bold transition ' + (showPhoneOtp ? 'border-[#1D6FF2] bg-blue-50 text-[#0B3D91]' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50')}>
                <Phone size={17} /> Phone OTP
              </motion.button>
            </div>

            <AnimatePresence>
              {showPhoneOtp && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    {!otpSent ? (
                      <div>
                        <label className="mb-1.5 block text-[13px] font-bold text-slate-600">Mobile Number</label>
                        <div className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 focus-within:border-[#1D6FF2]">
                          <span className="font-bold text-slate-500">+91</span>
                          <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" inputMode="numeric" className="w-full bg-transparent text-base font-bold tracking-wider text-[#0B1F3A] outline-none placeholder:font-medium placeholder:text-slate-300" />
                        </div>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={sendOtp} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-3 font-bold text-white">
                          Send OTP <ArrowRight size={17} />
                        </motion.button>
                      </div>
                    ) : (
                      <div>
                        <button onClick={() => setOtpSent(false)} className="mb-3 flex items-center gap-1 text-[13px] font-bold text-slate-500 hover:text-[#0B3D91]"><ChevronLeft size={15} /> +91 {phone} badlein</button>
                        <div className="mb-4 rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-3 text-center">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500">Demo mode — aapka OTP</p>
                          <p className="text-3xl font-extrabold tracking-[0.4em] text-[#0B3D91]">{demoOtp}</p>
                        </div>
                        <div className="flex justify-center gap-3">
                          {otp.map((d, i) => (
                            <motion.input key={i} id={'otp-' + i} value={d} onChange={(e) => setDigit(i, e.target.value)} onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById('otp-' + (i - 1))?.focus(); }} inputMode="numeric" maxLength={1} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.07 }} className="h-12 w-11 rounded-xl border-2 border-slate-200 bg-white text-center text-xl font-extrabold text-[#0B1F3A] outline-none focus:border-[#1D6FF2]" />
                          ))}
                        </div>
                        <motion.button whileTap={{ scale: 0.97 }} onClick={verify} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-bold text-white">
                          <BadgeCheck size={18} /> Verify & Login
                        </motion.button>
                        <p className="mt-3 text-center text-[13px] text-slate-500">
                          {timer > 0 ? ('OTP dobara ' + timer + 's me bhejein') : (<button onClick={sendOtp} className="font-bold text-[#1D6FF2]">Resend OTP</button>)}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Sparkles size={14} className="text-amber-500" /> Google se pehli baar login par account automatically ban jayega.
            </div>

            <div className="my-5 flex items-center gap-3 text-xs font-bold text-slate-300"><span className="h-px flex-1 bg-slate-200" /> YA <span className="h-px flex-1 bg-slate-200" /></div>
            <button onClick={demo} className="w-full rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-500 hover:border-[#1D6FF2] hover:text-[#0B3D91]">✨ Bina login explore karein (Demo Mode)</button>
            <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">Account banakar ya login karke aap <b>Terms</b> aur <b>Privacy Policy</b> se sehmat hote hain.<br />MedGuide guidance deta hai, diagnosis nahi.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
