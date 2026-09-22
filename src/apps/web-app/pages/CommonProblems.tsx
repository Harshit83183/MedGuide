import MedGuideResumeResult from '../components/MedGuideResumeResult';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  ChevronLeft,
  ArrowRight,
  Thermometer,
  Brain,
  Wind,
  Cookie,
  AudioWaveform,
  PersonStanding,
  Sparkles,
  Flame,
  Loader2
} from 'lucide-react';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { COMMON_PROBLEMS } from '../../../ai-service/common-problems';
import { RED_FLAGS } from '../../../ai-service/triage-engine';
import { useLanguage } from '../lib/language';

const ICONS: Record<string, typeof Thermometer> = {
  Thermometer,
  Brain,
  Wind,
  Cookie,
  AudioWaveform,
  PersonStanding,
  Sparkles,
  Flame
};

const DAY_OPTS = [
  'Aaj se',
  '2-3 din',
  '4-7 din',
  '1-2 hafte',
  '2+ hafte'
];

const DAY_NUM = [0, 2, 5, 10, 20];

const DAY_TEXT = [
  'aaj se',
  '2-3 din se',
  '4-7 din se',
  '1-2 hafte se',
  '2 hafte se zyada'
];

type PossibleCause = {
  name: string;
  relevance: 'low' | 'moderate' | 'strong';
  reason: string;
};

type TriageResult = {
  urgency: 'green' | 'yellow' | 'red';
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

type TriageResponse = {
  success?: boolean;
  provider?: string;
  model?: string;
  result?: TriageResult;
  error?: string;
};

export default function CommonProblems() {
  const nav = useNavigate();
  const { lang, tr } = useLanguage();

  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [days, setDays] = useState(2);
  const [severity, setSeverity] = useState(4);
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const problem = COMMON_PROBLEMS.find(
    (item) => item.key === selectedProblem
  );

  const selectProblem = (key: string) => {
    setSelectedProblem(key);
    setStep(0);
    setDays(2);
    setSeverity(4);
    setPattern('');
    setFlags([]);
    setError('');
  };

  const resetProblem = () => {
    if (saving) {
      return;
    }

    setSelectedProblem(null);
    setStep(0);
    setDays(2);
    setSeverity(4);
    setPattern('');
    setFlags([]);
    setError('');
  };

  const toggleFlag = (key: string) => {
    setFlags((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    );
  };

  const getDurationText = () => {
    const index = DAY_NUM.indexOf(days);

    if (index >= 0) {
      return DAY_TEXT[index];
    }

    return `${days} din se`;
  };

  const getSelectedFlagLabels = () => {
    return RED_FLAGS
      .filter((flag) => flags.includes(flag.key))
      .map((flag) => tr(flag.label));
  };

  const goNext = () => {
    setError('');

    if (step === 2 && !pattern) {
      setError('Kripya ek option select karein.');
      return;
    }

    if (step < 3) {
      setStep((current) => current + 1);
    }
  };

  const goBack = () => {
    setError('');

    if (step > 0) {
      setStep((current) => current - 1);
    }
  };

  const finish = async () => {
    if (!problem || saving) {
      return;
    }

    if (!pattern) {
      setError('Kripya problem ka pattern select karein.');
      setStep(2);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const problemTitle = tr(problem.title);
      const problemHindi = problem.titleHi
        ? tr(problem.titleHi)
        : '';

      const patternText = tr(pattern);
      const selectedFlagLabels = getSelectedFlagLabels();

      const description = [
        `User selected common health problem: ${problemTitle}${problemHindi ? ` (${problemHindi})` : ''}.`,
        `Problem duration: ${getDurationText()}.`,
        `User-reported severity: ${severity}/10.`,
        `Selected symptom pattern or additional detail: ${patternText}.`,
        selectedFlagLabels.length > 0
          ? `User selected these warning signs: ${selectedFlagLabels.join(', ')}.`
          : 'User did not select any of the listed warning signs.'
      ].join(' ');

      const response = await fetch('/api/ai-triage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: description,
          language: lang,
          attachments: []
        })
      });

      let data: TriageResponse;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          'Health guidance se valid response nahi mila.'
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Health guidance generate nahi ho saki.'
        );
      }

      if (
        !data.success ||
        !data.result ||
        !data.result.urgency ||
        !['green', 'yellow', 'red'].includes(data.result.urgency)
      ) {
        throw new Error(
          'Health guidance incomplete mili. Dobara try karein.'
        );
      }

      sessionStorage.setItem(
        'medguide_common_problem_result',
        JSON.stringify({
          source: 'common-problems',
          lang,
          problemKey: problem.key,
          problemTitle,
          problemHindi,
          duration: getDurationText(),
          days,
          severity,
          pattern: patternText,
          warningSigns: selectedFlagLabels,
          result: data.result
        })
      );

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      nav('/common-problems/result');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Health guidance generate nahi ho saki.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-10">
      <div className="mb-5 rounded-3xl bg-gradient-to-r from-teal-50 via-white to-blue-50 p-5 shadow-sm ring-1 ring-teal-100 sm:p-6">
      <MedGuideResumeResult storageKey="medguide_common_problem_result" resultPath="/common-problems/result" />
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-lg">
            <LayoutGrid size={24} />
          </span>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-teal-600">
              Quick Guided Check
            </p>

            <h2 className="mt-1 text-xl font-extrabold text-[#0B1F3A] sm:text-2xl">
              Common Problems
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
              {tr('commonProblems.introduction')}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!problem ? (
          <motion.div
            key="problem-grid"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {COMMON_PROBLEMS.map((item, index) => {
              const Icon = ICONS[item.icon] || Sparkles;

              return (
                <Reveal
                  key={item.key}
                  delay={(index % 4) * 0.07}
                >
                  <motion.button
                    type="button"
                    whileHover={{
                      y: -5
                    }}
                    whileTap={{
                      scale: 0.97
                    }}
                    onClick={() => selectProblem(item.key)}
                    className="group block h-full w-full rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:shadow-xl hover:ring-teal-200"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-lg">
                      <Icon size={24} />
                    </span>

                    <p className="mt-3 font-extrabold text-[#0B1F3A]">
                      {tr(item.title)}
                    </p>

                    <p className="mt-1 min-h-[36px] text-[13px] leading-relaxed text-slate-500">
                      {tr(item.tagline)}
                    </p>

                    <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-teal-700">
                      Start
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </motion.button>
                </Reveal>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="problem-flow"
            initial={{
              opacity: 0,
              y: 18
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -18
            }}
            className="mx-auto max-w-2xl"
          >
            <button
              type="button"
              onClick={resetProblem}
              disabled={saving}
              className="mb-3 flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-[#0B3D91] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Saari problems
            </button>

            <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-100 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-teal-600">
                    Common Problem
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold text-[#0B1F3A]">
                    {tr(problem.title)}
                  </h3>
                </div>

                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-extrabold text-teal-700">
                  {step + 1} / 4
                </span>
              </div>

              <div className="mt-4 flex gap-1.5">
                {[0, 1, 2, 3].map((currentStep) => (
                  <div
                    key={currentStep}
                    className={
                      'h-1.5 flex-1 rounded-full transition-all ' +
                      (currentStep <= step
                        ? 'bg-teal-500'
                        : 'bg-slate-200')
                    }
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="step-duration"
                    initial={{
                      opacity: 0,
                      x: 25
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    exit={{
                      opacity: 0,
                      x: -25
                    }}
                    className="pt-6"
                  >
                    <h4 className="text-lg font-extrabold text-[#0B1F3A]">
                      {tr(problem.questions[0].q)}
                    </h4>

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {DAY_OPTS.map((option, index) => (
                        <motion.button
                          type="button"
                          key={option}
                          whileTap={{
                            scale: 0.96
                          }}
                          onClick={() => {
                            setDays(DAY_NUM[index]);
                            setError('');
                          }}
                          className={
                            'rounded-2xl border-2 px-3 py-3 text-sm font-bold transition ' +
                            (days === DAY_NUM[index]
                              ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-sm'
                              : 'border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50/40')
                          }
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="step-severity"
                    initial={{
                      opacity: 0,
                      x: 25
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    exit={{
                      opacity: 0,
                      x: -25
                    }}
                    className="pt-6"
                  >
                    <h4 className="text-lg font-extrabold text-[#0B1F3A]">
                      Takleef 1 se 10 tak kitni hai?
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      1 ka matlab halki takleef aur 10 ka matlab bahut zyada
                      takleef.
                    </p>

                    <div className="mt-6 text-center">
                      <motion.p
                        key={severity}
                        initial={{
                          scale: 0.8
                        }}
                        animate={{
                          scale: 1
                        }}
                        className={
                          'text-6xl font-extrabold ' +
                          (severity <= 3
                            ? 'text-emerald-500'
                            : severity <= 6
                              ? 'text-amber-500'
                              : severity <= 8
                                ? 'text-orange-500'
                                : 'text-red-600')
                        }
                      >
                        {severity}
                      </motion.p>

                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={severity}
                        onChange={(event) => {
                          setSeverity(Number(event.target.value));
                          setError('');
                        }}
                        className="mt-5 w-full accent-teal-600"
                      />

                      <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-400">
                        <span>1 · Halki</span>
                        <span>5 · Medium</span>
                        <span>10 · Bahut tez</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-pattern"
                    initial={{
                      opacity: 0,
                      x: 25
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    exit={{
                      opacity: 0,
                      x: -25
                    }}
                    className="pt-6"
                  >
                    <h4 className="text-lg font-extrabold text-[#0B1F3A]">
                      {tr(problem.questions[2].q)}
                    </h4>

                    <div className="mt-4 grid gap-2">
                      {(problem.questions[2].choices || []).map((choice) => (
                        <motion.button
                          type="button"
                          key={choice}
                          whileTap={{
                            scale: 0.98
                          }}
                          onClick={() => {
                            setPattern(choice);
                            setError('');
                          }}
                          className={
                            'rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition ' +
                            (pattern === choice
                              ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-sm'
                              : 'border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50/40')
                          }
                        >
                          {tr(choice)}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-red-flags"
                    initial={{
                      opacity: 0,
                      x: 25
                    }}
                    animate={{
                      opacity: 1,
                      x: 0
                    }}
                    exit={{
                      opacity: 0,
                      x: -25
                    }}
                    className="pt-6"
                  >
                    <h4 className="text-lg font-extrabold text-[#0B1F3A]">
                      Koi{' '}
                      <span className="text-red-600">
                        khatre wali nishani
                      </span>{' '}
                      to nahi?
                    </h4>

                    <p className="mt-1 text-sm text-slate-500">
                      Agar inme se koi symptom hai to zaroor select karein.
                      Ek se zyada bhi select kar sakte hain.
                    </p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {RED_FLAGS.map((flag) => {
                        const selected = flags.includes(flag.key);

                        return (
                          <button
                            type="button"
                            key={flag.key}
                            onClick={() => {
                              toggleFlag(flag.key);
                              setError('');
                            }}
                            className={
                              'rounded-2xl border-2 px-3 py-3 text-left text-[13px] font-bold transition ' +
                              (selected
                                ? 'border-red-500 bg-red-50 text-red-700'
                                : 'border-slate-200 text-slate-600 hover:border-red-300 hover:bg-red-50/40')
                            }
                          >
                            {selected ? '☑ ' : '☐ '}
                            {tr(flag.label)}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-400">
                      Agar koi listed warning sign nahi hai to bina select
                      kiye result dekh sakte hain.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 5
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className="mt-5 rounded-2xl bg-red-50 p-3 text-center text-sm font-semibold text-red-700 ring-1 ring-red-100"
                >
                  {error}
                </motion.p>
              )}

              <div className="mt-7 flex gap-2">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={saving}
                    className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Peeche
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Aage
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={finish}
                    disabled={saving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Guidance taiyar ho rahi hai...
                      </>
                    ) : (
                      <>
                        Mera Result Dekhein
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <Disclaimer compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}