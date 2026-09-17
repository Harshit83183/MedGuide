import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareText, ImagePlus, Mic, MicOff, X, ArrowRight, Languages, Loader2, Paperclip, Volume2 } from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { LANGUAGES as LANGS, useLanguage, type Lang } from '../lib/language';
import { api, uploadFile, type SessionUser } from '../lib/api';

const HINTS: Record<Lang, string> = {
  en: 'e.g. I have had fever and body pain for 2 days...',
  hi: 'उदा. मुझे 2 दिन से बुखार और बदन दर्द है...',
  hinglish: 'e.g. Mujhe 2 din se bukhar hai, gala bhi kharab hai...',
  mr: 'उदा. मला 2 दिवसांपासून ताप आहे...',
  ta: 'உதா. எனக்கு 2 நாட்களாக காய்ச்சல் மற்றும் உடல்வலி உள்ளது...',
  bn: 'উদা. আমার ২ দিন ধরে জ্বর ও শরীর ব্যথা আছে...',
};

const LABEL: Record<Lang, string> = {
  en: 'Describe your problem in your own words',
  hi: 'अपनी तकलीफ अपने शब्दों में बताएं',
  hinglish: 'Apni takleef apne shabdon me batayein',
  mr: 'तुमची तक्रार तुमच्या शब्दांत सांगा',
  ta: 'உங்கள் பிரச்சினையை உங்கள் சொற்களில் கூறுங்கள்',
  bn: 'আপনার সমস্যা নিজের ভাষায় বলুন',
};

export default function SymptomChecker({ user }: { user: SessionUser }) {
  const nav = useNavigate();
  const { lang, setLang } = useLanguage();
  const [text, setText] = useState('');
  const [files, setFiles] = useState<{ url?: string; name: string; kind: 'image' | 'audio' | 'doc'; preview?: string }[]>([]);
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

  const addFiles = async (list: FileList | null, kind: 'image' | 'doc') => {
    if (!list || list.length === 0) return;
    setErr('');
    setUploading(true);
    try {
      for (const f of Array.from(list).slice(0, 3)) {
        if (f.size > 3 * 1024 * 1024) {
          setErr('\"' + f.name + '\" 3 MB se bada hai — chhoti file chunein.');
          continue;
        }
        const preview = kind === 'image' ? URL.createObjectURL(f) : undefined;
        const url = await uploadFile(f, 'symptoms/' + user.id);
        setFiles((p) => [...p, { url, name: f.name, kind: kind === 'image' ? 'image' : 'doc', preview }]);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload fail ho gaya.');
    } finally {
      setUploading(false);
    }
  };

  const toggleRec = async () => {
    if (recording) {
      mediaRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], 'voice-' + Date.now() + '.webm', { type: 'audio/webm' });
        setUploading(true);
        try {
          const url = await uploadFile(file, 'voice/' + user.id);
          setFiles((p) => [...p, { url, name: 'Voice note (' + recSecs + 's)', kind: 'audio' }]);
        } catch (e) {
          setErr(e instanceof Error ? e.message : 'Voice upload fail.');
        } finally {
          setUploading(false);
          setRecSecs(0);
        }
      };
      mediaRef.current = mr;
      mr.start();
      setRecording(true);
      setRecSecs(0);
      timerRef.current = window.setInterval(() => setRecSecs((s) => {
        if (s >= 120) { mr.stop(); if (timerRef.current) clearInterval(timerRef.current); setRecording(false); return s; }
        return s + 1;
      }), 1000);
    } catch {
      setErr('Mic access nahi mila. Browser permission allow karein.');
    }
  };

  const next = async () => {
    setErr('');
    if (text.trim().length < 10 && files.length === 0) {
      setErr('Kam se kam 10 aksharon me takleef likhein, ya photo/voice note jodein.');
      return;
    }
    setSaving(true);
    try {
      const rec = await api<{ id: number }>('/api/health-records', {
        method: 'POST',
        body: { user_id: user.id, title: text.trim().slice(0, 80) || files[0]?.name || 'Symptom entry', issue: text.trim(), triage: 'green', severity: 1, days: '', language: lang, advice: '', attachment_url: files.map((f) => f.url || '').filter(Boolean).join(','), source: 'symptom-checker' },
      });
      sessionStorage.setItem('medguide_intake', JSON.stringify({ recordId: rec.id, text: text.trim(), lang, attachments: files }));
      nav('/triage');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save fail ho gaya.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHero icon={<MessageSquareText size={28} />} kicker="Step 1 · Free Text Intake" title="Apni takleef batayein" sub="Likhkar, photo/report upload karke, ya voice note record karke — jis tarah aasaan lage. Phir Smart Triage aapko sahi raasta dikhayega." />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Reveal>
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-7">
            <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-slate-600"><Languages size={15} className="text-[#1D6FF2]" /> Apni bhasha chunein</p>
            <div className="mb-5 flex flex-wrap gap-2">
              {LANGS.map((l) => (
                <motion.button key={l.code} whileTap={{ scale: 0.94 }} onClick={() => setLang(l.code)} className={'rounded-full px-4 py-2 text-[13px] font-bold transition ' + (lang === l.code ? 'bg-[#0B3D91] text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                  {l.native}
                </motion.button>
              ))}
            </div>
            <label className="mb-1.5 block text-[13px] font-bold text-slate-600">{LABEL[lang]}</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder={HINTS[lang]} className="w-full rounded-2xl border-2 border-slate-200 p-4 text-[15px] leading-relaxed outline-none transition focus:border-[#1D6FF2]" />
            <p className="mt-1 text-right text-xs text-slate-400">{text.trim().length} akshar (min 10)</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button onClick={() => imgRef.current?.click()} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 hover:border-[#1D6FF2] hover:text-[#0B3D91]">
                <ImagePlus size={18} /> Photo / Report
              </button>
              <button onClick={() => docRef.current?.click()} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 py-3 text-sm font-bold text-slate-600 hover:border-[#1D6FF2] hover:text-[#0B3D91]">
                <Paperclip size={18} /> Document
              </button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={toggleRec} className={'flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold ' + (recording ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'border-2 border-dashed border-slate-300 text-slate-600 hover:border-red-400 hover:text-red-600')}>
                {recording ? <><MicOff size={18} /> Stop ({recSecs}s)</> : <><Mic size={18} /> Voice Note</>}
              </motion.button>
              <input ref={imgRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files, 'image'); e.target.value = ''; }} />
              <input ref={docRef} type="file" accept=".pdf,.doc,.docx,.txt" multiple hidden onChange={(e) => { addFiles(e.target.files, 'doc'); e.target.value = ''; }} />
            </div>
            {recording && (
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-2xl bg-red-50 py-2.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <motion.span key={i} className="w-1 rounded-full bg-red-500" animate={{ height: [6, 22, 6] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.06 }} />
                ))}
              </div>
            )}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid gap-2 sm:grid-cols-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-2.5 ring-1 ring-slate-200">
                      {f.kind === 'image' && f.preview ? <img src={f.preview} alt="" className="h-11 w-11 rounded-xl object-cover" /> : <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#0B3D91]">{f.kind === 'audio' ? <Volume2 size={20} /> : <Paperclip size={20} />}</span>}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-bold text-slate-700">{f.name}</p>
                        <p className="text-[11px] font-semibold text-emerald-600">✓ Encrypted upload done</p>
                        {f.url && f.kind === 'audio' && <audio src={f.url} controls className="mt-1 h-7 w-full" />}
                      </div>
                      <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><X size={16} /></button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            {uploading && <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-[#1D6FF2]"><Loader2 size={16} className="animate-spin" /> Secure upload ho raha hai...</p>}
            {err && <p className="mt-3 rounded-xl bg-red-50 p-3 text-center text-[13px] font-semibold text-red-600">{err}</p>}
            <motion.button whileTap={{ scale: 0.98 }} onClick={next} disabled={saving} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#1D6FF2] to-[#0B3D91] py-4 font-bold text-white shadow-xl shadow-blue-200 disabled:opacity-60">
              {saving ? <><Loader2 size={18} className="animate-spin" /> Save ho raha hai...</> : <>Aage Badhein — Smart Triage <ArrowRight size={18} /></>}
            </motion.button>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="space-y-4">
            <div className="rounded-3xl bg-gradient-to-br from-[#0B1F3A] to-[#0B3D91] p-5 text-white shadow-xl">
              <p className="text-sm font-bold">💡 Achhe se batane ke tips</p>
              <ul className="mt-2 space-y-1.5 text-[13px] text-blue-100">
                <li>• Kab se hai? (2 din / 1 hafta...)</li>
                <li>• Dard kitna? (halka / tez / bahut tez)</li>
                <li>• Kya khaane/peene se badhta-ghatta hai?</li>
                <li>• Koi dawa li? Kaun si?</li>
                <li>• Rash/sujan hai to photo zaroor jodein</li>
              </ul>
            </div>
            <Disclaimer compact />
          </div>
        </Reveal>
      </div>
    </div>
  );
}
