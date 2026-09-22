import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Clock3,
  HeartPulse,
  Home,
  Hospital,
  RefreshCw,
  ShieldAlert,
  Stethoscope,
  TriangleAlert
} from 'lucide-react';
import Disclaimer from '../components/Disclaimer';
import { useLanguage } from '../lib/language';

type Urgency = 'green' | 'yellow' | 'red';

type PossibleCause = {
  name: string;
  relevance: 'low' | 'moderate' | 'strong';
  reason: string;
};

type TriageResult = {
  urgency: Urgency;
  urgencyTitle: string;
  summary: string;
  possibleCauses: PossibleCause[];
  detectedSymptoms: string[];
  importantContext: string[];
  redFlags: string[];
  recommendations: string[];
  selfCare: string[];
  doctorAdvice: string[];
  emergencyAdvice: string[];
  followUpQuestions: string[];
  needsMoreInformation: boolean;
  disclaimer: string;
};

type StoredResult = {
  source: 'common-problems';
  lang: string;
  problemKey: string;
  problemTitle: string;
  problemHindi?: string;
  duration: string;
  days: number;
  severity: number;
  pattern: string;
  warningSigns: string[];
  result: TriageResult;
};

const CONFIG = {
  green: {
    label: 'Ghar par care se shuru karein',
    shortLabel: 'Home Care',
    description:
      'Aapke diye gaye answers me abhi koi major emergency warning sign report nahi hua.',
    icon: CheckCircle2,
    wrapper:
      'from-emerald-500 to-teal-600',
    soft:
      'bg-emerald-50 text-emerald-800 ring-emerald-100',
    iconBox:
      'bg-emerald-100 text-emerald-700'
  },
  yellow: {
    label: 'Doctor se baat karna better rahega',
    shortLabel: 'Doctor Advice',
    description:
      'Aapke answers ke basis par medical assessment lena useful rahega.',
    icon: CircleAlert,
    wrapper:
      'from-amber-500 to-orange-500',
    soft:
      'bg-amber-50 text-amber-800 ring-amber-100',
    iconBox:
      'bg-amber-100 text-amber-700'
  },
  red: {
    label: 'Urgent medical help lein',
    shortLabel: 'Urgent Help',
    description:
      'Aapke selected answers me aisi warning signs hain jinhe delay nahi karna chahiye.',
    icon: TriangleAlert,
    wrapper:
      'from-red-600 to-rose-700',
    soft:
      'bg-red-50 text-red-800 ring-red-100',
    iconBox:
      'bg-red-100 text-red-700'
  }
} as const;

function cleanItems(
  primary: string[] | undefined,
  fallback: string[] | undefined,
  limit = 4
) {
  const source =
    primary && primary.length > 0
      ? primary
      : fallback || [];

  return Array.from(
    new Set(
      source
        .map((item) => String(item).trim())
        .filter(Boolean)
    )
  ).slice(0, limit);
}

export default function CommonProblemResult() {
  const nav = useNavigate();
  const { lang, tr } = useLanguage();
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(false);

  const [stored, setStored] =
    useState<StoredResult | null | undefined>(
      undefined
    );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(
        'medguide_common_problem_result'
      );

      if (!raw) {
        setStored(null);
        return;
      }

      const parsed = JSON.parse(
        raw
      ) as StoredResult;

      if (
        parsed.source !==
          'common-problems' ||
        !parsed.result ||
        !['green', 'yellow', 'red'].includes(
          parsed.result.urgency
        )
      ) {
        setStored(null);
        return;
      }

      setStored(parsed);
    } catch {
      setStored(null);
    }
  }, []);

  useEffect(() => {
    if (!stored || stored.lang === lang) return;
    let cancelled = false;
    const controller = new AbortController();
    setTranslating(true);
    setTranslationError(false);
    const cacheKey = `medguide_result_${stored.problemKey}_${stored.days}_${stored.severity}_${stored.pattern}_${stored.result.summary}_${lang}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const result = JSON.parse(cached) as TriageResult;
        if (result.urgency === stored.result.urgency) {
          setStored({ ...stored, lang, result });
          setTranslating(false);
          return () => controller.abort();
        }
      } catch {}
    }
    fetch('/api/ai-triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'translate', language: lang, result: stored.result }),
      signal: controller.signal
    }).then(async response => {
      const data = await response.json();
      if (!response.ok || !data.success || data.result?.urgency !== stored.result.urgency) throw new Error('Translation failed');
      if (!cancelled) {
        sessionStorage.setItem(cacheKey, JSON.stringify(data.result));
        setStored({ ...stored, lang, result: data.result });
      }
    }).catch(() => { if (!cancelled) setTranslationError(true); })
      .finally(() => { if (!cancelled) setTranslating(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [lang, stored]);

  if (stored === undefined) {
    return null;
  }

  if (!stored) {
    return (
      <Navigate
        to="/common-problems"
        replace
      />
    );
  }

  const result = stored.result;
  const config =
    CONFIG[result.urgency];

  const StatusIcon = config.icon;

  const whatToDo = cleanItems(
    result.recommendations,
    result.doctorAdvice,
    4
  );

  const selfCare = cleanItems(
    result.selfCare,
    result.recommendations,
    4
  );

  const doctorAdvice = cleanItems(
    result.doctorAdvice,
    result.recommendations,
    4
  );

  const emergencyAdvice =
    cleanItems(
      result.emergencyAdvice,
      result.redFlags,
      4
    );

  const checkAgain = () => {
    sessionStorage.removeItem(
      'medguide_common_problem_result'
    );

    nav('/common-problems');
  };

  return (
    <div className="mx-auto max-w-5xl">
      <button
        type="button"
        onClick={checkAgain}
        className="mb-4 inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-bold text-slate-500 transition hover:bg-white hover:text-[#0B3D91]"
      >
        <ArrowLeft size={16} />
        Common Problems
      </button>

      {translating && <div role="status" className="mb-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-900">{tr('Translating your saved medical guidance...')}</div>}
      {translationError && <div role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">{tr('Translation is unavailable. Showing your previous result without changing its medical guidance.')}</div>}
      <motion.section
        initial={{
          opacity: 0,
          y: 15
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        className={`overflow-hidden rounded-[32px] bg-gradient-to-r ${config.wrapper} text-white shadow-xl`}
      >
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
              <StatusIcon size={31} />
            </div>

            <div className="flex-1">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">
                Quick Health Guidance
              </p>

              <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
                {tr(config.label)}
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/90">
                {tr(config.description)}
              </p>
            </div>

            <span className="w-fit rounded-full bg-white/20 px-4 py-2 text-xs font-extrabold ring-1 ring-white/30">
              {tr(config.shortLabel)}
            </span>
          </div>
        </div>
      </motion.section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{
            opacity: 0,
            y: 12
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.05
          }}
          className="space-y-5"
        >
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1D6FF2]">
                <HeartPulse size={21} />
              </span>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#1D6FF2]">
                  Aapne kya bataya
                </p>

                <h2 className="font-extrabold text-[#0B1F3A]">
                  {stored.problemTitle}
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <Clock3
                  size={18}
                  className="text-slate-500"
                />

                <p className="mt-2 text-xs font-bold text-slate-400">
                  Kab se
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-700">
                  {stored.duration}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <HeartPulse
                  size={18}
                  className="text-slate-500"
                />

                <p className="mt-2 text-xs font-bold text-slate-400">
                  Takleef
                </p>

                <p className="mt-1 text-sm font-extrabold text-slate-700">
                  {stored.severity}/10
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <Stethoscope
                  size={18}
                  className="text-slate-500"
                />

                <p className="mt-2 text-xs font-bold text-slate-400">
                  Pattern
                </p>

                <p className="mt-1 text-sm font-extrabold leading-relaxed text-slate-700">
                  {stored.pattern}
                </p>
              </div>
            </div>

            {stored.warningSigns.length > 0 ? (
              <div className="mt-4 rounded-2xl bg-red-50 p-4 ring-1 ring-red-100">
                <div className="flex gap-2">
                  <ShieldAlert
                    size={19}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <div>
                    <p className="text-sm font-extrabold text-red-700">
                      Aapne warning signs select kiye
                    </p>

                    <p className="mt-1 text-[13px] leading-relaxed text-red-700">
                      {stored.warningSigns.join(
                        ' • '
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-sm font-bold text-emerald-700">
                  ✓ Aapne listed emergency warning signs me se koi select nahi kiya.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
            <div className="flex items-start gap-3">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.iconBox}`}>
                <StatusIcon size={21} />
              </span>

              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Simple Summary
                </p>

                <h2 className="mt-1 text-lg font-extrabold text-[#0B1F3A]">
                  Iska matlab kya hai?
                </h2>
              </div>
            </div>

            <p className="mt-4 text-[15px] leading-7 text-slate-600">
              {result.summary}
            </p>
          </section>

          {result.urgency ===
            'red' &&
            emergencyAdvice.length >
              0 && (
              <section className="rounded-3xl bg-red-50 p-5 ring-1 ring-red-200 sm:p-6">
                <div className="flex items-center gap-3">
                  <TriangleAlert
                    size={23}
                    className="text-red-600"
                  />

                  <h2 className="text-lg font-extrabold text-red-800">
                    Abhi kya karein
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  {emergencyAdvice.map(
                    (item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex gap-3"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-xs font-extrabold text-white">
                          {index + 1}
                        </span>

                        <p className="text-sm leading-relaxed text-red-800">
                          {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 12
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.1
          }}
          className="space-y-5"
        >
          {result.urgency !==
            'red' && (
            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1D6FF2]">
                  <ArrowRight size={21} />
                </span>

                <h2 className="text-lg font-extrabold text-[#0B1F3A]">
                  Ab kya karein
                </h2>
              </div>

              <div className="mt-4 space-y-3">
                {whatToDo.length > 0 ? (
                  whatToDo.map(
                    (item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex gap-3"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-extrabold text-[#0B3D91]">
                          {index + 1}
                        </span>

                        <p className="text-sm leading-relaxed text-slate-600">
                          {item}
                        </p>
                      </div>
                    )
                  )
                ) : (
                  <p className="text-sm leading-relaxed text-slate-600">
                    Symptoms ko monitor karein. Agar problem continue ya worse ho to healthcare professional se baat karein.
                  </p>
                )}
              </div>
            </section>
          )}

          {result.urgency !==
            'red' &&
            selfCare.length > 0 && (
              <section className="rounded-3xl bg-emerald-50 p-5 ring-1 ring-emerald-100 sm:p-6">
                <div className="flex items-center gap-3">
                  <Home
                    size={21}
                    className="text-emerald-700"
                  />

                  <h2 className="text-lg font-extrabold text-emerald-900">
                    Ghar par kya kar sakte hain
                  </h2>
                </div>

                <div className="mt-4 space-y-2.5">
                  {selfCare.map(
                    (item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex gap-2.5"
                      >
                        <CheckCircle2
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />

                        <p className="text-sm leading-relaxed text-emerald-900">
                          {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

          {result.urgency !==
            'red' &&
            doctorAdvice.length >
              0 && (
              <section className="rounded-3xl bg-amber-50 p-5 ring-1 ring-amber-100 sm:p-6">
                <div className="flex items-center gap-3">
                  <Stethoscope
                    size={21}
                    className="text-amber-700"
                  />

                  <h2 className="text-lg font-extrabold text-amber-900">
                    Doctor kab dikhayein
                  </h2>
                </div>

                <div className="mt-4 space-y-2.5">
                  {doctorAdvice.map(
                    (item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex gap-2.5"
                      >
                        <CircleAlert
                          size={17}
                          className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <p className="text-sm leading-relaxed text-amber-900">
                          {item}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

          <section className="rounded-3xl bg-[#0B1F3A] p-5 text-white shadow-xl sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Next Step
            </p>

            <h2 className="mt-1 text-lg font-extrabold">
              Aap kya karna chahenge?
            </h2>

            <div className="mt-4 grid gap-2">
              <Link
                to="/clinics"
                className="flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-extrabold text-[#0B3D91] transition hover:bg-blue-50"
              >
                <Hospital size={17} />
                Nearby Clinics
              </Link>

              <button
                type="button"
                onClick={checkAgain}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 text-sm font-extrabold text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <RefreshCw size={17} />
                Check Another Problem
              </button>
            </div>
          </section>
        </motion.div>
      </div>

      <div className="mt-5">
        <Disclaimer compact />
      </div>
    </div>
  );
}