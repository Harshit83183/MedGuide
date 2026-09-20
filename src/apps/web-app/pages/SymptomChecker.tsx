import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareText,
  ImagePlus,
  Mic,
  MicOff,
  X,
  ArrowRight,
  Languages,
  Loader2,
  Paperclip,
  Volume2
} from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { LANGUAGES as LANGS, useLanguage, type Lang } from '../lib/language';
import { uploadFile, type SessionUser } from '../lib/api';

const HINTS: Record<Lang, string> = {
  en: 'e.g. I have had fever and body pain for 2 days...',
  hi: 'उदा. मुझे 2 दिन से बुखार और बदन दर्द है...',
  hinglish: 'e.g. Mujhe 2 din se bukhar hai, gala bhi kharab hai...',
  mr: 'उदा. मला 2 दिवसांपासून ताप आहे...',
  ta: 'உதா. எனக்கு 2 நாட்களாக காய்ச்சல் மற்றும் உடல்வலி உள்ளது...',
  bn: 'উদা. আমার ২ দিন ধরে জ্বর ও শরীর ব্যথা আছে...'
};

const LABEL: Record<Lang, string> = {
  en: 'Describe your problem in your own words',
  hi: 'अपनी तकलीफ अपने शब्दों में बताएं',
  hinglish: 'Apni takleef apne shabdon me batayein',
  mr: 'तुमची तक्रार तुमच्या शब्दांत सांगा',
  ta: 'உங்கள் பிரச்சினையை உங்கள் சொற்களில் கூறுங்கள்',
  bn: 'আপনার সমস্যা নিজের ভাষায় বলুন'
};

type UploadedFile = {
  url?: string;
  name: string;
  kind: 'image' | 'audio' | 'doc';
  preview?: string;
};

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
  success: boolean;
  provider: string;
  model: string;
  result: TriageResult;
  error?: string;
};

export default function SymptomChecker({ user }: { user: SessionUser }) {
  const nav = useNavigate();
  const { lang, setLang } = useLanguage();

  const [text, setText] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const imgRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const addFiles = async (
    list: FileList | null,
    kind: 'image' | 'doc'
  ) => {
    if (!list || list.length === 0) return;

    setErr('');
    setUploading(true);

    try {
      for (const f of Array.from(list).slice(0, 3)) {
        if (f.size > 3 * 1024 * 1024) {
          setErr(`"${f.name}" 3 MB se bada hai — chhoti file chunein.`);
          continue;
        }

        const preview =
          kind === 'image'
            ? URL.createObjectURL(f)
            : undefined;

        const url = await uploadFile(
          f,
          `symptoms/${user.id}`
        );

        setFiles((previous) => [
          ...previous,
          {
            url,
            name: f.name,
            kind,
            preview
          }
        ]);
      }
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : 'Upload fail ho gaya.'
      );
    } finally {
      setUploading(false);
    }
  };

  const blobToBase64 = (
  blob: Blob
): Promise<string> => {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onloadend = () => {
        const result =
          String(
            reader.result || ''
          );

        const base64 =
          result.includes(',')
            ? result.split(',')[1]
            : result;

        if (!base64) {
          reject(
            new Error(
              'Audio convert nahi ho saka.'
            )
          );
          return;
        }

        resolve(base64);
      };

      reader.onerror = () => {
        reject(
          new Error(
            'Audio read nahi ho saka.'
          )
        );
      };

      reader.readAsDataURL(
        blob
      );
    }
  );
};

const transcribeVoice = async (
  blob: Blob
) => {
  const audio =
    await blobToBase64(blob);

  const response =
    await fetch(
      '/api/voice-transcribe',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          audio,
          mimeType:
            blob.type ||
            'audio/webm',
          language: lang
        })
      }
    );

  let data: {
    success?: boolean;
    transcript?: string;
    error?: string;
    model?: string;
  };

  try {
    data =
      await response.json();
  } catch {
    throw new Error(
      'Voice transcription se valid response nahi mila.'
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
        'Voice samajh nahi aayi.'
    );
  }

  const transcript =
    String(
      data.transcript || ''
    ).trim();

  if (!transcript) {
    throw new Error(
      'Voice me clear speech detect nahi hui. Dobara clearly bolkar try karein.'
    );
  }

  setText((previous) => {
    const current =
      previous.trim();

    if (!current) {
      return transcript;
    }

    return `${current} ${transcript}`;
  });

  return transcript;
};

const toggleRec = async () => {
  if (recording) {
    mediaRef.current?.stop();

    if (timerRef.current) {
      clearInterval(
        timerRef.current
      );

      timerRef.current =
        null;
    }

    setRecording(false);
    return;
  }

  try {
    setErr('');

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices
        .getUserMedia
    ) {
      setErr(
        'Aapka browser microphone recording support nahi karta.'
      );
      return;
    }

    const stream =
      await navigator.mediaDevices.getUserMedia(
        {
          audio: true
        }
      );

    let mimeType = '';

    if (
      MediaRecorder.isTypeSupported(
        'audio/webm;codecs=opus'
      )
    ) {
      mimeType =
        'audio/webm;codecs=opus';
    } else if (
      MediaRecorder.isTypeSupported(
        'audio/webm'
      )
    ) {
      mimeType =
        'audio/webm';
    }

    const mr = mimeType
      ? new MediaRecorder(
          stream,
          {
            mimeType
          }
        )
      : new MediaRecorder(
          stream
        );

    chunksRef.current = [];

    mr.ondataavailable = (
      event
    ) => {
      if (event.data.size > 0) {
        chunksRef.current.push(
          event.data
        );
      }
    };

    mr.onerror = () => {
      stream
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );

      setRecording(false);
      setUploading(false);

      setErr(
        'Voice recording me problem aayi. Dobara try karein.'
      );
    };

    mr.onstop = async () => {
      stream
        .getTracks()
        .forEach(
          (track) =>
            track.stop()
        );

      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;
      }

      const duration =
        recSecs;

      const actualMime =
        mr.mimeType ||
        'audio/webm';

      const blob =
        new Blob(
          chunksRef.current,
          {
            type: actualMime
          }
        );

      chunksRef.current = [];

      if (blob.size < 1000) {
        setErr(
          'Recording bahut chhoti hai. Kam se kam kuch seconds clearly bolkar try karein.'
        );

        setRecSecs(0);
        return;
      }

      const file =
        new File(
          [blob],
          `voice-${Date.now()}.webm`,
          {
            type:
              actualMime
          }
        );

      setUploading(true);
      setErr('');

      try {
        const [
          transcript,
          url
        ] =
          await Promise.all([
            transcribeVoice(
              blob
            ),
            uploadFile(
              file,
              `voice/${user.id}`
            )
          ]);

        setFiles(
          (previous) => [
            ...previous,
            {
              url,
              name:
                `Voice note (${duration}s)`,
              kind: 'audio'
            }
          ]
        );

        if (
          transcript.length < 3
        ) {
          throw new Error(
            'Voice clear nahi thi. Dobara try karein.'
          );
        }
      } catch (e) {
        setErr(
          e instanceof Error
            ? e.message
            : 'Voice process nahi ho saki.'
        );
      } finally {
        setUploading(false);
        setRecSecs(0);
      }
    };

    mediaRef.current = mr;

    mr.start(250);

    setRecording(true);
    setRecSecs(0);

    timerRef.current =
      window.setInterval(
        () => {
          setRecSecs(
            (seconds) => {
              const next =
                seconds + 1;

              if (
                next >= 120
              ) {
                if (
                  mediaRef
                    .current
                    ?.state ===
                  'recording'
                ) {
                  mediaRef.current.stop();
                }

                if (
                  timerRef.current
                ) {
                  clearInterval(
                    timerRef.current
                  );

                  timerRef.current =
                    null;
                }

                setRecording(
                  false
                );
              }

              return next;
            }
          );
        },
        1000
      );
  } catch (e) {
    setRecording(false);

    setErr(
      e instanceof Error &&
        e.name ===
          'NotAllowedError'
        ? 'Mic permission nahi mili. Browser me microphone permission Allow karein.'
        : 'Mic access nahi mila. Browser permission aur microphone check karein.'
    );
  }
};

  const removeFile = (index: number) => {
    setFiles((previous) => {
      const target = previous[index];

      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }

      return previous.filter(
        (_, currentIndex) =>
          currentIndex !== index
      );
    });
  };

  const next = async () => {
    setErr('');

    const symptomText = text.trim();

    if (symptomText.length < 10) {
      if (files.length > 0) {
        setErr(
          'Photo, document aur voice note abhi upload ho sakte hain, lekin Smart Triage unki medical content ko abhi directly analyse nahi karta. Kripya apni takleef kam se kam 10 aksharon me likhein.'
        );
      } else {
        setErr(
          'Kam se kam 10 aksharon me apni takleef likhein.'
        );
      }

      return;
    }

    if (uploading) {
      setErr(
        'Upload complete hone ka wait karein.'
      );
      return;
    }

    if (recording) {
      setErr(
        'Pehle voice recording stop karein.'
      );
      return;
    }

    setSaving(true);

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
            text: symptomText,
            language: lang,
            attachments: files.map(
              (file) => ({
                name: file.name,
                kind: file.kind,
                url: file.url || ''
              })
            )
          })
        }
      );

      let data: TriageResponse;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          'Smart Triage se valid response nahi mila.'
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Smart Triage abhi available nahi hai.'
        );
      }

      if (
        !data.success ||
        !data.result ||
        !data.result.urgency
      ) {
        throw new Error(
          'Smart Triage ka response incomplete hai.'
        );
      }

      const storedFiles = files.map(
        ({ url, name, kind }) => ({
          url,
          name,
          kind
        })
      );

      sessionStorage.setItem(
        'medguide_triage_result',
        JSON.stringify({
          text: symptomText,
          lang,
          attachments: storedFiles,
          provider: data.provider,
          model: data.model,
          result: data.result
        })
      );

      sessionStorage.setItem(
        'medguide_intake',
        JSON.stringify({
          text: symptomText,
          lang,
          attachments: storedFiles
        })
      );

      nav('/triage');
    } catch (e) {
      setErr(
        e instanceof Error
          ? e.message
          : 'Smart Triage fail ho gaya. Dobara try karein.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHero
        icon={
          <MessageSquareText size={28} />
        }
        kicker="Step 1 · AI Smart Intake"
        title="Apni takleef batayein"
        sub="Apni problem apne shabdon me likhein. Smart Triage aapke symptoms aur context ko samajhkar possible causes, urgency aur next steps batayega."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Reveal>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
            <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-slate-600">
              <Languages
                size={15}
                className="text-[#1D6FF2]"
              />
              Apni bhasha chunein
            </p>

            <div className="mb-5 flex flex-wrap gap-2">
              {LANGS.map((language) => (
                <motion.button
                  key={language.code}
                  whileTap={{
                    scale: 0.94
                  }}
                  onClick={() =>
                    setLang(language.code)
                  }
                  className={
                    'rounded-full px-4 py-2 text-[13px] font-bold transition ' +
                    (lang === language.code
                      ? 'bg-[#0B3D91] text-white shadow-lg shadow-blue-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                  }
                >
                  {language.native}
                </motion.button>
              ))}
            </div>

            <label className="mb-1.5 block text-[13px] font-bold text-slate-600">
              {LABEL[lang]}
            </label>

            <textarea
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              rows={5}
              maxLength={6000}
              placeholder={HINTS[lang]}
              className="w-full rounded-2xl border-2 border-slate-200 p-4 text-[15px] leading-relaxed outline-none transition focus:border-[#1D6FF2]"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {text.trim().length} akshar
              (min 10)
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  imgRef.current?.click()
                }
                disabled={
                  uploading || saving
                }
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 hover:border-[#1D6FF2] hover:text-[#0B3D91] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ImagePlus size={18} />
                Photo / Report
              </button>

              <button
                type="button"
                onClick={() =>
                  docRef.current?.click()
                }
                disabled={
                  uploading || saving
                }
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 hover:border-[#1D6FF2] hover:text-[#0B3D91] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Paperclip size={18} />
                Document
              </button>

              <motion.button
                type="button"
                whileTap={{
                  scale: 0.96
                }}
                onClick={toggleRec}
                disabled={
                  uploading || saving
                }
                className={
                  'flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ' +
                  (recording
                    ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                    : 'border-2 border-dashed border-slate-300 text-slate-600 hover:border-red-400 hover:text-red-600')
                }
              >
                {recording ? (
                  <>
                    <MicOff size={18} />
                    Stop ({recSecs}s)
                  </>
                ) : (
                  <>
                    <Mic size={18} />
                    Voice Note
                  </>
                )}
              </motion.button>

              <input
                ref={imgRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(event) => {
                  addFiles(
                    event.target.files,
                    'image'
                  );

                  event.target.value = '';
                }}
              />

              <input
                ref={docRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                multiple
                hidden
                onChange={(event) => {
                  addFiles(
                    event.target.files,
                    'doc'
                  );

                  event.target.value = '';
                }}
              />
            </div>

            {recording && (
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-red-50 py-2.5">
                {Array.from({
                  length: 16
                }).map((_, index) => (
                  <motion.span
                    key={index}
                    className="w-1 rounded-full bg-red-500"
                    animate={{
                      height: [
                        6,
                        22,
                        6
                      ]
                    }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      delay:
                        index * 0.06
                    }}
                  />
                ))}
              </div>
            )}

            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  className="mt-4 grid gap-2 sm:grid-cols-2"
                >
                  {files.map(
                    (file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-2.5 ring-1 ring-slate-200"
                      >
                        {file.kind ===
                          'image' &&
                        file.preview ? (
                          <img
                            src={
                              file.preview
                            }
                            alt=""
                            className="h-11 w-11 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#0B3D91]">
                            {file.kind ===
                            'audio' ? (
                              <Volume2
                                size={
                                  20
                                }
                              />
                            ) : (
                              <Paperclip
                                size={
                                  20
                                }
                              />
                            )}
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold text-slate-700">
                            {file.name}
                          </p>

                          <p className="text-[11px] font-semibold text-emerald-600">
                            ✓ Secure upload
                            complete
                          </p>

                          {file.url &&
                            file.kind ===
                              'audio' && (
                              <audio
                                src={
                                  file.url
                                }
                                controls
                                className="mt-1 h-7 w-full"
                              />
                            )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFile(
                              index
                            )
                          }
                          disabled={saving}
                          className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {files.length > 0 && (
              <p className="mt-3 rounded-xl bg-amber-50 p-3 text-[12px] font-semibold leading-relaxed text-amber-700">
                Photo, document aur
                voice note securely
                upload honge. Current
                Smart Triage abhi
                written description ko
                analyse karta hai;
                uploaded file ki medical
                content ko analyse karne
                ka claim nahi karega.
              </p>
            )}

            {uploading && (
              <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#1D6FF2]">
                <Loader2
                  size={16}
                  className="animate-spin"
                />
                Voice/File process ho raha
                hai...
              </p>
            )}

            {err && (
              <p className="mt-3 rounded-xl bg-red-50 p-3 text-center text-[13px] font-semibold text-red-600">
                {err}
              </p>
            )}

            <motion.button
              type="button"
              whileTap={{
                scale: 0.98
              }}
              onClick={next}
              disabled={
                saving ||
                uploading ||
                recording
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-4 font-bold text-white shadow-xl shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  AI symptoms analyse
                  kar raha hai...
                </>
              ) : (
                <>
                  Aage Badhein — Smart
                  Triage
                  <ArrowRight
                    size={18}
                  />
                </>
              )}
            </motion.button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-[#0B1F3A] to-[#0B3D91] p-5 text-white shadow-xl">
              <p className="text-sm font-bold">
                💡 Achhe se batane ke
                tips
              </p>

              <ul className="mt-2 space-y-1.5 text-[13px] text-blue-100">
                <li>
                  • Kab se hai? (2 din /
                  1 hafta...)
                </li>
                <li>
                  • Dard kitna? (halka /
                  tez / bahut tez)
                </li>
                <li>
                  • Kya khaane/peene se
                  badhta-ghatta hai?
                </li>
                <li>
                  • Koi dawa li? Kaun si?
                </li>
                <li>
                  • Koi existing disease
                  ya treatment chal raha
                  hai to batayein
                </li>
              </ul>
            </div>

            <Disclaimer compact />
          </div>
        </Reveal>
      </div>
    </div>
  );
}