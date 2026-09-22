import { useEffect, useState } from 'react';
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
  ShieldCheck,
  HeartPulse,
  CircleHelp,
  FileText,
  Brain,
  ListChecks
} from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import RecommendedCare from '../components/RecommendedCare';
import ReportTabs, { type ReportTab } from '../components/ReportTabs';
import { api, type SessionUser } from '../lib/api';

type TriageLevel = 'green' | 'yellow' | 'red';

type PossibleCause = {
  name: string;
  relevance: 'low' | 'moderate' | 'strong';
  reason: string;
};

type TriageResult = {
  urgency: TriageLevel;
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

type Attachment = {
  url?: string;
  name: string;
  kind: 'image' | 'audio' | 'doc';
};

type StoredTriage = {
  text: string;
  lang: string;
  attachments: Attachment[];
  provider?: string;
  model?: string;
  result: TriageResult;
};

const CONF: Record<
  TriageLevel,
  {
    ring: string;
    bg: string;
    badge: string;
    icon: typeof CheckCircle2;
    title: string;
    desc: string;
  }
> = {
  green: {
    ring: 'ring-emerald-200',
    bg: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle2,
    title: 'GREEN — Self-Care Zone',
    desc: 'Filhaal diye gaye symptoms me clear emergency warning sign identify nahi hua.'
  },
  yellow: {
    ring: 'ring-amber-200',
    bg: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-100 text-amber-700',
    icon: AlertTriangle,
    title: 'YELLOW — Medical Assessment',
    desc: 'Diye gaye symptoms ya medical context ke basis par clinician se assessment lena appropriate rahega.'
  },
  red: {
    ring: 'ring-red-300',
    bg: 'from-red-600 to-rose-700',
    badge: 'bg-red-100 text-red-700',
    icon: Siren,
    title: 'RED — Urgent Medical Help',
    desc: 'Diye gaye symptoms me potentially serious warning sign identify hua hai. Medical care delay na karein.'
  }
};

const RELEVANCE_LABEL: Record<
  PossibleCause['relevance'],
  string
> = {
  low: 'Low relevance',
  moderate: 'Moderate relevance',
  strong: 'Strong relevance'
};

const RELEVANCE_CLASS: Record<
  PossibleCause['relevance'],
  string
> = {
  low: 'bg-slate-100 text-slate-600',
  moderate: 'bg-amber-100 text-amber-700',
  strong: 'bg-blue-100 text-[#0B3D91]'
};

function ListSection({
  title,
  icon,
  items,
  tone = 'slate'
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone?: 'slate' | 'blue' | 'emerald' | 'amber' | 'red';
}) {
  if (!items.length) {
    return null;
  }

  const classes = {
    slate: 'bg-slate-50 ring-slate-200',
    blue: 'bg-blue-50 ring-blue-100',
    emerald: 'bg-emerald-50 ring-emerald-100',
    amber: 'bg-amber-50 ring-amber-100',
    red: 'bg-red-50 ring-red-100'
  };

  return (
    <div
      className={
        'rounded-2xl p-4 ring-1 ' +
        classes[tone]
      }
    >
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-sm font-extrabold text-[#0B1F3A]">
          {title}
        </p>
      </div>

      <ul className="mt-3 space-y-2">
        {items.map((item, index) => (
          <li
            key={`${item}-${index}`}
            className="flex gap-2.5 text-sm leading-relaxed text-slate-700"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#0B3D91] shadow-sm">
              {index + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Triage({
  user
}: {
  user: SessionUser;
}) {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const nav = useNavigate();

  const [triageData, setTriageData] =
    useState<StoredTriage | null>(null);

  const [loaded, setLoaded] =
    useState(false);

  const [saved, setSaved] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const [saveError, setSaveError] =
    useState('');

  const [followUpAnswers, setFollowUpAnswers] =
    useState<Record<number, string>>({});

  const [refining, setRefining] =
    useState(false);

  const [refineError, setRefineError] =
    useState('');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(
        'medguide_triage_result'
      );

      if (!raw) {
        setLoaded(true);
        return;
      }

      const parsed = JSON.parse(
        raw
      ) as StoredTriage;

      if (
        !parsed ||
        !parsed.result ||
        !['green', 'yellow', 'red'].includes(
          parsed.result.urgency
        )
      ) {
        setLoaded(true);
        return;
      }

      setTriageData(parsed);
    } catch {
      setTriageData(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (
      !triageData ||
      saved || saving || saveFailed
    ) {
      return;
    }

    const result =
      triageData.result;
    

    const causes =
      result.possibleCauses
        .map(
          (cause) =>
            `${cause.name} [${cause.relevance}]: ${cause.reason}`
        )
        .join(' | ');

    const adviceParts = [
      result.summary,
      result.recommendations.length
        ? `Recommendations: ${result.recommendations.join(' | ')}`
        : '',
      result.selfCare.length
        ? `Self care: ${result.selfCare.join(' | ')}`
        : '',
      result.doctorAdvice.length
        ? `Doctor advice: ${result.doctorAdvice.join(' | ')}`
        : '',
      result.emergencyAdvice.length
        ? `Emergency advice: ${result.emergencyAdvice.join(' | ')}`
        : '',
      causes
        ? `Possible causes: ${causes}`
        : ''
    ]
      .filter(Boolean)
      .join(' || ');

    setSaving(true);
    console.log('Saving symptom result to My Records...');
    api('/api/health-records', {
      method: 'POST',
      body: {
        user_id: user.id,
        title:
          `AI Triage: ${result.urgency.toUpperCase()} — ` +
          triageData.text.slice(
            0,
            60
          ),
        issue:
          triageData.text,
        triage:
          result.urgency,
        severity:
          result.urgency === 'red'
            ? 10
            : result.urgency ===
                'yellow'
              ? 6
              : 3,
        days: '',
        language:
          triageData.lang ||
          'hinglish',
        advice:
          adviceParts,
        attachment_url:
          triageData.attachments
            ?.map(
              (attachment) =>
                attachment.url || ''
            )
            .filter(Boolean)
            .join(',') || '',
        source:
          'ai-symptom-checker'
      }
    })
      .then(() => {
        setSaved(true);
        setSaving(false);
        setSaveError('');
      })
      .catch((error) => {
        setSaving(false);
        setSaveFailed(true);

        setSaveError(
          error instanceof Error
            ? error.message
            : 'Health record save nahi ho saka.'
        );
      });
  }, [
    triageData,
    saved,
    saving,
    saveFailed,
    user.id
  ]);

  if (!loaded) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <Loader2
          size={34}
          className="mx-auto animate-spin text-[#1D6FF2]"
        />

        <p className="mt-3 text-sm font-semibold text-slate-500">
          Smart Triage result load
          ho raha hai...
        </p>
      </div>
    );
  }

  if (!triageData) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#0B3D91]">
          <Activity size={30} />
        </div>

        <h2 className="mt-4 text-xl font-extrabold text-[#0B1F3A]">
          Pehle apni takleef
          batayein
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          AI Smart Triage result
          generate karne ke liye
          Symptom Checker se shuru
          karein.
        </p>

        <Link
          to="/symptom-checker"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#0B3D91] px-5 py-3 text-sm font-bold text-white"
        >
          Symptom Checker
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const result =
    triageData.result;

  const config =
    CONF[result.urgency];

  const Icon =
    config.icon;

  const width =
    result.urgency === 'green'
      ? '33%'
      : result.urgency ===
          'yellow'
        ? '66%'
        : '100%';

  const submitFollowUpAnswers = async () => {
    if (!triageData) {
      return;
    }

    const questions =
      triageData.result.followUpQuestions;

    const answers = questions.map(
      (question, index) => ({
        question,
        answer:
          followUpAnswers[index]?.trim() ||
          ''
      })
    );

    if (
      answers.some(
        (item) => !item.answer
      )
    ) {
      setRefineError(
        'Kripya sabhi follow-up questions ka answer dein.'
      );
      return;
    }

    setRefining(true);
    setRefineError('');

    try {
      const response = await fetch(
        '/api/ai-triage',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            text: triageData.text,
            language:
              triageData.lang ||
              'hinglish',
            attachments:
              triageData.attachments || [],
            previousResult:
              triageData.result,
            followUpAnswers: answers
          })
        }
      );

      let data: {
        success?: boolean;
        provider?: string;
        model?: string;
        result?: TriageResult;
        error?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          'Smart Triage se valid response nahi mila.'
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Follow-up answers analyse nahi ho sake.'
        );
      }

      if (
        !data.success ||
        !data.result ||
        !data.result.urgency
      ) {
        throw new Error(
          'Updated Smart Triage response incomplete hai.'
        );
      }

      const updated: StoredTriage = {
        ...triageData,
        provider:
          data.provider ||
          triageData.provider,
        model:
          data.model ||
          triageData.model,
        result: data.result
      };

      sessionStorage.setItem(
        'medguide_triage_result',
        JSON.stringify(updated)
      );

      setTriageData(updated);
      setFollowUpAnswers({});
      setSaved(false);
      setSaveFailed(false);
      setSaveError('');

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    } catch (error) {
      setRefineError(
        error instanceof Error
          ? error.message
          : 'Follow-up answers analyse nahi ho sake.'
      );
    } finally {
      setRefining(false);
    }
  };

  const startNewCheck = () => {
    sessionStorage.removeItem(
      'medguide_triage_result'
    );

    sessionStorage.removeItem(
      'medguide_intake'
    );

    nav('/symptom-checker');
  };

  return (
    <div>
      <PageHero
        icon={<Activity size={28} />}
        kicker="Step 2 · AI Smart Triage Result"
        title="Aapka Health Signal"
        sub={
          '"' +
          triageData.text.slice(
            0,
            100
          ) +
          (triageData.text.length >
          100
            ? '...'
            : '') +
          '"'
        }
      />

      <div className="mx-auto w-full max-w-[1560px]">
        <ReportTabs active={activeTab} onChange={setActiveTab} />
        {result.urgency === 'red' && <div role="alert" className="mb-4 rounded-xl bg-red-50 p-4 font-bold text-red-900">Emergency warning: seek immediate medical care. Call 112 in India. Do not wait for an appointment.</div>}
        {(activeTab === 'overview' || activeTab === 'care') && <div className="grid items-start gap-4">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96
          }}
          animate={{
            opacity: 1,
            scale: 1
          }}
          transition={{
            type: 'spring',
            stiffness: 160,
            damping: 18
          }}
          className={
            'overflow-hidden rounded-[28px] bg-white shadow-2xl ring-4 ' +
            config.ring
          }
        >
          <div
            className={
              'relative bg-gradient-to-r p-6 text-white sm:p-8 ' +
              config.bg
            }
          >
            {result.urgency ===
              'red' && (
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{
                  opacity: [
                    0,
                    0.45,
                    0
                  ]
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity
                }}
              />
            )}

            <div className="relative flex items-center gap-4">
              <motion.span
                initial={{
                  scale: 0,
                  rotate: -30
                }}
                animate={{
                  scale: 1,
                  rotate: 0
                }}
                transition={{
                  type: 'spring',
                  stiffness: 220
                }}
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/40"
              >
                <Icon size={34} />
              </motion.span>

              <div>
                <h2 className="text-2xl font-extrabold sm:text-3xl">
                  {config.title}
                </h2>

                <p className="mt-1 text-sm font-semibold text-white/90">
                  {result.urgencyTitle}
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
                  initial={{
                    width: '0%'
                  }}
                  animate={{
                    width
                  }}
                  transition={{
                    duration: 1,
                    ease: 'easeOut'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 auto-rows-min grid-flow-row-dense gap-4 p-4 sm:p-5 lg:grid-cols-2">
            <div className={activeTab === 'overview' ? 'contents' : 'hidden'}>
            <p className="col-span-full text-[14px] font-medium leading-relaxed text-slate-600">
              {config.desc}
            </p>

            <div className="col-span-full rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="flex items-center gap-2">
                <Brain
                  size={19}
                  className="text-[#0B3D91]"
                />

                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Smart Triage Summary
                </p>
              </div>

              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-700">
                {result.summary}
              </p>
            </div>

            {result.detectedSymptoms.length >
              0 && (
              <div className="col-span-full">
                <p className="text-sm font-extrabold text-[#0B1F3A]">
                  Detected Symptoms
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  {result.detectedSymptoms.map(
                    (
                      symptom,
                      index
                    ) => (
                      <span
                        key={`${symptom}-${index}`}
                        className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0B3D91] ring-1 ring-blue-100"
                      >
                        {symptom}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {result.importantContext.length >
              0 && (
              <div className="min-w-0 col-span-full">
                <ListSection
                  title="Important Context"
                  icon={
                    <FileText
                      size={18}
                      className="text-[#0B3D91]"
                    />
                  }
                  items={
                    result.importantContext
                  }
                  tone="blue"
                />
              </div>
            )}

            <div className="min-w-0 col-span-full">
              <div className="mb-3 flex items-center gap-2">
                <Stethoscope
                  size={20}
                  className="text-[#0B3D91]"
                />

                <div>
                  <p className="text-sm font-extrabold text-[#0B1F3A]">
                    Possible Causes
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Symptom patterns
                    only — diagnosis
                    nahi
                  </p>
                </div>
              </div>

              {result.possibleCauses
                .length > 0 ? (
                <div className={`grid gap-3 ${result.possibleCauses.length > 1 ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                  {result.possibleCauses.map(
                    (
                      cause,
                      index
                    ) => (
                      <motion.div
                        key={`${cause.name}-${index}`}
                        initial={{
                          opacity: 0,
                          y: 10
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        transition={{
                          delay:
                            index *
                            0.08
                        }}
                        className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="min-w-0">
                            <p className="font-extrabold text-[#0B1F3A]">
                              {
                                cause.name
                              }
                            </p>

                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                              {
                                cause.reason
                              }
                            </p>
                          </div>

                          <span
                            className={
                              'shrink-0 rounded-full px-3 py-1.5 text-[11px] font-extrabold ' +
                              RELEVANCE_CLASS[
                                cause
                                  .relevance
                              ]
                            }
                          >
                            {
                              RELEVANCE_LABEL[
                                cause
                                  .relevance
                              ]
                            }
                          </span>
                        </div>
                      </motion.div>
                    )
                  )}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                  <p className="text-sm font-bold text-slate-700">
                    Specific cause
                    suggest karne ke
                    liye enough
                    information nahi
                    hai.
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Neeche diye gaye
                    follow-up questions
                    se aur useful
                    information mil
                    sakti hai.
                  </p>
                </div>
              )}
            </div>

            </div>
            <div className={activeTab === 'care' ? 'contents' : 'hidden'}>
            {result.redFlags.length >
              0 && (
              <div className="min-w-0">
                <ListSection
                  title="Warning Signs"
                  icon={
                    <AlertTriangle
                      size={18}
                      className="text-red-600"
                    />
                  }
                  items={
                    result.redFlags
                  }
                  tone="red"
                />
              </div>
            )}

            {result.recommendations.length >
              0 && (
              <div className="min-w-0">
                <ListSection
                  title="Recommended Next Steps"
                  icon={
                    <ListChecks
                      size={18}
                      className="text-indigo-600"
                    />
                  }
                  items={
                    result.recommendations
                  }
                  tone="blue"
                />
              </div>
            )}

            {result.selfCare.length >
              0 &&
              result.urgency !==
                'red' && (
                <div className="mt-5">
                  <ListSection
                    title="Self-Care"
                    icon={
                      <HeartPulse
                        size={18}
                        className="text-emerald-600"
                      />
                    }
                    items={
                      result.selfCare
                    }
                    tone="emerald"
                  />
                </div>
              )}

            {result.doctorAdvice.length >
              0 && (
              <div className="min-w-0">
                <ListSection
                  title="Doctor Advice"
                  icon={
                    <Stethoscope
                      size={18}
                      className="text-amber-600"
                    />
                  }
                  items={
                    result.doctorAdvice
                  }
                  tone="amber"
                />
              </div>
            )}

            {result.emergencyAdvice.length >
              0 && (
              <div className="min-w-0">
                <ListSection
                  title="Emergency Advice"
                  icon={
                    <Siren
                      size={18}
                      className="text-red-600"
                    />
                  }
                  items={
                    result.emergencyAdvice
                  }
                  tone="red"
                />
              </div>
            )}

            {result.urgency !== 'red' &&
              result.needsMoreInformation &&
              result.followUpQuestions.length > 0 && (
                <div className="col-span-full rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-100">
                  <div className="flex items-center gap-2">
                    <CircleHelp
                      size={19}
                      className="text-violet-600"
                    />

                    <div>
                      <p className="text-sm font-extrabold text-[#0B1F3A]">
                        Thodi aur information chahiye
                      </p>

                      <p className="text-[11px] font-semibold text-violet-600">
                        In questions ke answers se Smart Triage result aur accurate context ke saath update hoga
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    {result.followUpQuestions.map(
                      (question, index) => (
                        <div
                          key={`${question}-${index}`}
                          className="rounded-2xl bg-white p-4 ring-1 ring-violet-100"
                        >
                          <label
                            htmlFor={`follow-up-${index}`}
                            className="flex gap-2 text-sm font-bold leading-relaxed text-violet-950"
                          >
                            <span className="shrink-0 font-black text-violet-600">
                              Q{index + 1}.
                            </span>

                            <span>{question}</span>
                          </label>

                          <textarea
                            id={`follow-up-${index}`}
                            value={
                              followUpAnswers[index] ||
                              ''
                            }
                            onChange={(event) => {
                              const value =
                                event.target.value;

                              setFollowUpAnswers(
                                (current) => ({
                                  ...current,
                                  [index]: value
                                })
                              );

                              if (refineError) {
                                setRefineError('');
                              }
                            }}
                            disabled={refining}
                            rows={2}
                            placeholder="Apna answer yahan likhein..."
                            className="mt-3 w-full resize-none rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>
                      )
                    )}
                  </div>

                  {refineError && (
                    <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 ring-1 ring-red-100">
                      {refineError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={submitFollowUpAnswers}
                    disabled={refining}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {refining ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Answers analyse ho rahe hain...
                      </>
                    ) : (
                      <>
                        Answers Submit Karein
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              )}

            </div>
            {triageData.attachments &&
              triageData.attachments
                .length > 0 && (
                <div className="col-span-full rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Uploaded Files
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    Files securely
                    upload hue hain,
                    lekin is result me
                    unki medical content
                    analyse nahi ki gayi
                    hai.
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {triageData.attachments.map(
                      (
                        attachment,
                        index
                      ) => (
                        <span
                          key={`${attachment.name}-${index}`}
                          className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200"
                        >
                          {
                            attachment.name
                          }
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

            <div className="col-span-full rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
              <div className="flex gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-[#0B3D91]"
                />

                <p className="text-xs leading-relaxed text-slate-600">
                  {result.disclaimer}
                </p>
              </div>
            </div>

            {saveError && (
              <p className="col-span-full rounded-xl bg-amber-50 p-3 text-center text-xs font-semibold text-amber-700">
                Triage result dikh
                raha hai, lekin health
                record save nahi ho
                saka: {saveError} <button type="button" className="ml-2 underline font-bold" onClick={() => { setSaveError(''); setSaveFailed(false); }}>Retry saving</button>
              </p>
            )}

            <div className="col-span-full grid gap-2 sm:grid-cols-3">
              {result.urgency ===
              'red' ? (
                <>
                  <a
                    href="tel:112"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-red-600 py-3.5 text-sm font-bold text-white shadow-lg"
                  >
                    <Siren
                      size={16}
                    />
                    Call 112
                  </a>

                  <Link
                    to="/sos"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#0B1F3A] py-3.5 text-sm font-bold text-white"
                  >
                    1-Tap SOS
                    <ArrowRight
                      size={16}
                    />
                  </Link>


                </>
              ) : (
                <>


                  <Link
                    to="/video-consult"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 py-3.5 text-sm font-bold text-white shadow-lg"
                  >
                    <Video
                      size={16}
                    />
                    Video Doctor
                  </Link>

                  <Link
                    to="/medicines"
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-700"
                  >
                    <Pill
                      size={16}
                    />
                    Medicines
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={
                startNewCheck
              }
              className="col-span-full flex w-full items-center justify-center gap-1.5 py-2 text-[13px] font-bold text-slate-400 hover:text-[#0B3D91]"
            >
              <RotateCcw
                size={14}
              />
              Nayi takleef check
              karein
            </button>
          </div>
        </motion.div>

        </div>}
        <div role="tabpanel" className={activeTab === 'clinics' ? '' : 'hidden'}><RecommendedCare assessment={result} sourceText={triageData.text} view="clinics" /></div>
        <div role="tabpanel" className={activeTab === 'medicines' ? '' : 'hidden'}><RecommendedCare assessment={result} sourceText={triageData.text} view="medicines" /></div>

        <div className="mt-4">
          <Disclaimer />
        </div>
      </div>
    </div>
  );
}