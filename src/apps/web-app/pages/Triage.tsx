import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Siren,
  ArrowRight,
  Hospital,
  Video,
  Pill,
  RotateCcw,
  Loader2,
  Stethoscope,
  Search,
  ShieldCheck,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import {
  triage,
  problemAdvice,
  RED_FLAGS,
  type TriageLevel,
} from '../../../ai-service/triage-engine';
import { api, type SessionUser } from '../lib/api';
import { useLanguage } from '../lib/language';

interface Intake {
  recordId?: number;
  text?: string;
  lang?: string;
  days?: number;
  severity?: number;
  flags?: string[];
  problemKey?: string;
}

const CONF: Record<
  TriageLevel,
  {
    ring: string;
    bg: string;
    bar: string;
    icon: typeof CheckCircle2;
    title: string;
    titleHi: string;
    desc: string;
  }
> = {
  green: {
    ring: 'ring-emerald-200',
    bg: 'from-emerald-500 to-teal-600',
    bar: 'bg-emerald-500',
    icon: CheckCircle2,
    title: 'GREEN — Self-Care Zone',
    titleHi: 'Filhaal emergency warning sign nahi mila',
    desc: 'Symptoms ko monitor karein aur neeche diye gaye relevant care steps follow karein.',
  },
  yellow: {
    ring: 'ring-amber-200',
    bg: 'from-amber-500 to-orange-500',
    bar: 'bg-amber-500',
    icon: AlertTriangle,
    title: 'YELLOW — Doctor ko Dikhayein',
    titleHi: 'Medical assessment lena better rahega',
    desc: 'Symptoms ki severity ya duration ke basis par doctor se consultation recommended hai.',
  },
  red: {
    ring: 'ring-red-300',
    bg: 'from-red-600 to-rose-700',
    bar: 'bg-red-600',
    icon: Siren,
    title: 'RED — Emergency!',
    titleHi: 'Turant medical help lein',
    desc: 'Aapke diye gaye symptoms me emergency warning sign mila hai. Delay na karein.',
  },
};

export default function Triage({ user }: { user: SessionUser }) {
  const nav = useNavigate();
  const { tr } = useLanguage();

  const [intake, setIntake] = useState<Intake | null>(null);
  const [counted, setCounted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('medguide_intake');

      if (raw) {
        setIntake(JSON.parse(raw));
      }
    } catch {
      setIntake(null);
    }

    const timer = setTimeout(() => {
      setCounted(true);
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  const result = useMemo(() => {
    if (!intake) {
      return null;
    }

    return triage({
      text: intake.text ?? '',
      days: intake.days ?? 2,
      severity: intake.severity ?? 4,
      flags: intake.flags ?? [],
      problemKey: intake.problemKey,
    });
  }, [intake]);

  useEffect(() => {
    if (!intake?.recordId || !result || saved) {
      return;
    }

    const conditionText =
      result.possibleConditions.length > 0
        ? result.possibleConditions
            .map(
              (condition) =>
                `${condition.name} (${condition.matchScore}% symptom match)`
            )
            .join(' | ')
        : 'No confident symptom pattern';

    api('/api/health-records', {
      method: 'POST',
      body: {
        user_id: user.id,
        title:
          'Triage: ' +
          result.level.toUpperCase() +
          ' — ' +
          (intake.text || '').slice(0, 60),
        issue: intake.text || '',
        triage: result.level,
        severity: intake.severity ?? 4,
        days: String(intake.days ?? ''),
        language: intake.lang || 'hinglish',
        advice:
          result.reasons.join(' | ') +
          ' | Possible causes: ' +
          conditionText +
          ' | Recommendation: ' +
          result.recommendation,
        source: 'triage',
      },
    })
      .then(() => setSaved(true))
      .catch(() => setSaved(true));
  }, [intake, result, saved, user.id]);

  if (!intake || !result) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#0B3D91]"
        >
          <Loader2 size={30} />
        </motion.div>

        <h2 className="mt-4 text-xl font-extrabold text-[#0B1F3A]">
          Pehle apni takleef batayein
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Triage result ke liye Symptom Checker ya Common Problems se shuru karein.
        </p>

        <div className="mt-5 flex justify-center gap-2">
          <Link
            to="/symptom-checker"
            className="rounded-2xl bg-[#0B3D91] px-5 py-3 text-sm font-bold text-white"
          >
            Symptom Checker
          </Link>

          <Link
            to="/common-problems"
            className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700"
          >
            Common Problems
          </Link>
        </div>
      </div>
    );
  }

  const c = CONF[result.level];
  const Icon = c.icon;

  const tips =
    result.level === 'green'
      ? result.selfCare
      : result.level === 'yellow'
        ? result.seeDoctor
        : result.emergency;

  const extra = intake.problemKey
    ? problemAdvice(intake.problemKey)
    : [];

  const width =
    result.level === 'green'
      ? '33%'
      : result.level === 'yellow'
        ? '66%'
        : '100%';

  return (
    <div>
      <PageHero
        icon={<Activity size={28} />}
        kicker="Step 2 · Smart Triage Result"
        title="Aapka Health Signal"
        sub={
          '"' +
          (intake.text || '').slice(0, 90) +
          (String(intake.text || '').length > 90 ? '...' : '') +
          '"'
        }
      />

      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 160,
            damping: 16,
          }}
          className={
            'overflow-hidden rounded-[28px] bg-white shadow-2xl ring-4 ' +
            c.ring
          }
        >
          <div
            className={
              'relative bg-gradient-to-r p-6 text-white sm:p-8 ' +
              c.bg
            }
          >
            {result.level === 'red' && (
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                }}
              />
            )}

            <div className="relative flex items-center gap-4">
              <motion.span
                initial={{
                  scale: 0,
                  rotate: -40,
                }}
                animate={{
                  scale: 1,
                  rotate: 0,
                }}
                transition={{
                  delay: 0.2,
                  type: 'spring',
                  stiffness: 220,
                }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/40"
              >
                <Icon size={34} />
              </motion.span>

              <div>
                <motion.h2
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.25,
                  }}
                  className="text-2xl font-extrabold sm:text-3xl"
                >
                  {c.title}
                </motion.h2>

                <p className="text-sm font-semibold text-white/90">
                  {c.titleHi}
                </p>
              </div>
            </div>

            <div className="relative mt-5">
              <div className="flex justify-between text-[11px] font-bold text-white/80">
                <span>GREEN</span>
                <span>YELLOW</span>
                <span>RED</span>
              </div>

              <div className="mt-1 h-3 overflow-hidden rounded-full bg-black/25">
                <motion.div
                  className="h-full rounded-full bg-white"
                  initial={{ width: '0%' }}
                  animate={{
                    width: counted ? width : '0%',
                  }}
                  transition={{
                    duration: 1,
                    ease: 'easeOut',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-[15px] font-medium text-slate-600">
              {c.desc}
            </p>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Kyun yeh result? (Reasons)
              </p>

              <ul className="mt-2 space-y-1.5">
                {result.reasons.map((reason, index) => (
                  <motion.li
                    key={index}
                    initial={{
                      opacity: 0,
                      x: -12,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: 0.5 + index * 0.12,
                    }}
                    className="flex gap-2 text-sm font-medium text-slate-700"
                  >
                    <span className="text-[#1D6FF2]">▶</span>
                    {tr(reason)}
                  </motion.li>
                ))}
              </ul>

              {(intake.flags || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(intake.flags || []).map((flag) => (
                    <span
                      key={flag}
                      className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700"
                    >
                      ⚠{' '}
                      {tr(
                        RED_FLAGS.find(
                          (item) => item.key === flag
                        )?.label || flag
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center gap-2">
                <Stethoscope
                  size={19}
                  className="text-[#0B3D91]"
                />

                <p className="text-sm font-extrabold text-[#0B1F3A]">
                  Possible Causes
                </p>
              </div>

              {result.possibleConditions.length > 0 ? (
                <div className="space-y-3">
                  {result.possibleConditions.map(
                    (condition, index) => (
                      <motion.div
                        key={condition.name}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: 0.3 + index * 0.1,
                        }}
                        className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <p className="font-extrabold text-[#0B1F3A]">
                              {condition.name}
                            </p>

                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                              {condition.description}
                            </p>
                          </div>

                          <div className="shrink-0 rounded-xl bg-white px-3 py-2 text-center shadow-sm ring-1 ring-blue-100">
                            <p className="text-lg font-black text-[#1D6FF2]">
                              {condition.matchScore}%
                            </p>

                            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                              Symptom Match
                            </p>
                          </div>
                        </div>

                        {condition.matchedSymptoms.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {condition.matchedSymptoms.map(
                              (symptom) => (
                                <span
                                  key={symptom}
                                  className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#0B3D91] ring-1 ring-blue-100"
                                >
                                  {symptom}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </motion.div>
                    )
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex gap-3">
                    <Search
                      size={20}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        Clear symptom pattern nahi mila
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        Apne symptoms, duration, location aur severity ko
                        thoda aur detail me likhein. Persistent ya concerning
                        symptoms ke liye doctor se consult karein.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {result.level !== 'red' && (
              <div className="mt-5 rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                <div className="flex gap-3">
                  <ShieldCheck
                    size={21}
                    className="mt-0.5 shrink-0 text-indigo-600"
                  />

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      Recommendation
                    </p>

                    <p className="mt-1 text-sm font-medium leading-relaxed text-indigo-950">
                      {tr(result.recommendation)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <p className="mt-5 text-sm font-extrabold text-[#0B1F3A]">
              {result.level === 'green'
                ? '🌱 Recommended Care'
                : result.level === 'yellow'
                  ? '🩺 Doctor Visit Plan'
                  : '🚨 Emergency Action Plan'}
            </p>

            <ul className="mt-2 space-y-2">
              {tips.map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.7 + index * 0.1,
                  }}
                  className="flex gap-2.5 rounded-2xl border border-slate-100 bg-white p-3 text-sm text-slate-700 shadow-sm"
                >
                  <span
                    className={
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ' +
                      (result.level === 'green'
                        ? 'bg-emerald-500'
                        : result.level === 'yellow'
                          ? 'bg-amber-500'
                          : 'bg-red-600')
                    }
                  >
                    {index + 1}
                  </span>

                  {tr(tip)}
                </motion.li>
              ))}
            </ul>

            {extra.length > 0 && result.level !== 'red' && (
              <div className="mt-4 rounded-2xl bg-teal-50 p-4 ring-1 ring-teal-100">
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Is problem ke khaas tips
                </p>

                <ul className="mt-1.5 space-y-1 text-sm text-teal-900">
                  {extra.map((item, index) => (
                    <li key={index}>• {tr(item)}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              {result.level === 'red' ? (
                <>
                  <a
                    href="tel:112"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg"
                  >
                    <Siren size={16} />
                    Call 112
                  </a>

                  <Link
                    to="/sos"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#0B1F3A] py-3.5 text-sm font-bold text-white"
                  >
                    1-Tap SOS
                    <ArrowRight size={16} />
                  </Link>

                  <Link
                    to="/clinics"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700"
                  >
                    <Hospital size={16} />
                    Nearest ER
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/clinics"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-3.5 text-sm font-bold text-white shadow-lg"
                  >
                    <Hospital size={16} />
                    Book Clinic
                  </Link>

                  <Link
                    to="/video-consult"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg"
                  >
                    <Video size={16} />
                    Video Doctor
                  </Link>

                  <Link
                    to="/medicines"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700"
                  >
                    <Pill size={16} />
                    Medicines
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => nav('/symptom-checker')}
              className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-[13px] font-bold text-slate-400 hover:text-[#0B3D91]"
            >
              <RotateCcw size={14} />
              Nayi takleef check karein
            </button>
          </div>
        </motion.div>

        <div className="mt-4">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}