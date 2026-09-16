import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Search, BadgePercent, ArrowRightLeft, ShieldCheck, TrendingDown } from 'lucide-react';
import PageHero from '../components/PageHero';
import Disclaimer from '../components/Disclaimer';
import Reveal from '../components/Reveal';
import { api, inr } from '../lib/api';

interface Med { id: number; composition: string; strength: string; brand: string; maker: string; pack: string; price: number; mrp: number; generic: boolean; jan_aushadhi: boolean; rating: number; category: string; }

export default function Medicines() {
  const [meds, setMeds] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selComp, setSelComp] = useState('');
  const [months, setMonths] = useState(1);
  const [packsPerMonth, setPacksPerMonth] = useState(1);

  useEffect(() => {
    api<Med[]>('/api/medicines').then((d) => {
      setMeds(d);
      if (d.length) setSelComp(d[0].composition);
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  const comps = useMemo(() => {
    const map = new Map<string, Med[]>();
    for (const m of meds) {
      const k = m.composition + ' ' + m.strength;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    }
    return Array.from(map.entries()).map(([label, items]) => ({ label, items, comp: items[0].composition }));
  }, [meds]);

  const filtered = useMemo(() => {
    if (!q.trim()) return comps;
    const n = q.trim().toLowerCase();
    return comps.filter((c) => c.items.some((m) => [m.composition, m.brand, m.maker].join(' ').toLowerCase().includes(n)));
  }, [comps, q]);

  const group = useMemo(() => comps.find((c) => c.comp === selComp) || filtered[0], [comps, selComp, filtered]);

  const sorted = useMemo(() => {
    if (!group) return [];
    return [...group.items].sort((a, b) => a.price - b.price);
  }, [group]);

  const cheapest = sorted[0];
  const costliest = sorted[sorted.length - 1];
  const savingPerPack = costliest && cheapest ? costliest.price - cheapest.price : 0;
  const pct = costliest && cheapest && costliest.price > 0 ? Math.round((savingPerPack / costliest.price) * 100) : 0;
  const totalSave = savingPerPack * packsPerMonth * months;

  return (
    <div>
      <PageHero icon={<Pill size={28} />} kicker="Jan Aushadhi · Savings Calculator" title="Same Dawa, Sahi Daam" sub="Same composition, alag brand — price compare karein aur dekhein Jan Aushadhi/generic se kitni bachat hogi." />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Reveal>
          <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:sticky lg:top-20">
            <div className="flex items-center gap-2 rounded-2xl border-2 border-slate-200 px-3 py-2.5">
              <Search size={17} className="text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Dawa / composition khojein..." className="w-full bg-transparent text-sm outline-none" />
            </div>
            <p className="mb-2 mt-3 text-xs font-bold uppercase tracking-wider text-slate-400">{filtered.length} compositions</p>
            <div className="max-h-[420px] space-y-1.5 overflow-y-auto pr-1">
              {loading && <p className="py-6 text-center text-sm text-slate-400">Loading medicines...</p>}
              {filtered.map((c) => {
                const prices = c.items.map((m) => m.price);
                const lo = Math.min(...prices);
                const hi = Math.max(...prices);
                return (
                  <button key={c.label} onClick={() => setSelComp(c.comp)} className={'w-full rounded-2xl border-2 p-3 text-left transition ' + (group?.comp === c.comp ? 'border-amber-400 bg-amber-50' : 'border-slate-100 hover:border-amber-200')}>
                    <p className="text-[13px] font-extrabold text-[#0B1F3A]">{c.label}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{c.items.length} brands · {inr(lo)} – {inr(hi)}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
        <div>
          {!group ? (
            <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-slate-100"><p className="font-extrabold text-[#0B1F3A]">Koi dawa nahi mili</p><p className="text-sm text-slate-500">Search badal kar dekhein.</p></div>
          ) : (
            <>
              <Reveal>
                <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-600 via-teal-600 to-[#0B3D91] p-6 text-white shadow-xl sm:p-8">
                  <motion.div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 7, repeat: Infinity }} />
                  <div className="relative">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200"><BadgePercent size={14} /> Aapki Bachat</p>
                    <h2 className="mt-1 text-xl font-extrabold sm:text-2xl">{group.label}</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/25">
                        <p className="text-[11px] font-bold text-emerald-200">SABSE SASTA</p>
                        <p className="text-2xl font-extrabold">{cheapest ? inr(cheapest.price) : '—'}</p>
                        <p className="truncate text-xs text-white/80">{cheapest?.brand} · {cheapest?.pack}</p>
                      </div>
                      <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/25">
                        <p className="text-[11px] font-bold text-orange-200">SABSE MEHNGA</p>
                        <p className="text-2xl font-extrabold">{costliest ? inr(costliest.price) : '—'}</p>
                        <p className="truncate text-xs text-white/80">{costliest?.brand} · {costliest?.pack}</p>
                      </div>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-2xl bg-white p-4 text-center text-[#0B1F3A] shadow-xl">
                        <p className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-600"><TrendingDown size={13} /> BACHAT / PACK</p>
                        <p className="text-3xl font-extrabold text-emerald-600">{inr(savingPerPack)}</p>
                        <p className="text-xs font-bold text-slate-500">({pct}% tak kam!)</p>
                      </motion.div>
                    </div>
                    <div className="mt-4 grid gap-3 rounded-2xl bg-black/20 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                      <div>
                        <label className="text-xs font-bold text-white/80">Mahine me kitne pack lagte hain?</label>
                        <input type="range" min={1} max={8} value={packsPerMonth} onChange={(e) => setPacksPerMonth(Number(e.target.value))} className="w-full accent-amber-300" />
                        <p className="text-sm font-extrabold">{packsPerMonth} pack / mahina</p>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-white/80">Kitne mahine ki dawa?</label>
                        <input type="range" min={1} max={12} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-amber-300" />
                        <p className="text-sm font-extrabold">{months} mahina</p>
                      </div>
                      <div className="rounded-2xl bg-amber-300 px-5 py-3 text-center text-[#0B1F3A]">
                        <p className="text-[11px] font-bold">KUL BACHAT</p>
                        <motion.p key={totalSave} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="text-2xl font-extrabold">{inr(totalSave)}</motion.p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
              <div className="mt-4 space-y-2.5">
                {sorted.map((m, i) => (
                  <Reveal key={m.id} delay={i * 0.05}>
                    <div className={'flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 transition ' + (i === 0 ? 'shadow-lg ring-emerald-300' : 'ring-slate-100')}>
                      <span className={'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-extrabold text-white ' + (m.jan_aushadhi ? 'bg-gradient-to-br from-emerald-500 to-teal-700' : m.generic ? 'bg-gradient-to-br from-sky-500 to-blue-700' : 'bg-gradient-to-br from-slate-400 to-slate-600')}>
                        {i === 0 ? '₹' : <Pill size={20} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-[#0B1F3A]">
                          {m.brand}
                          {m.jan_aushadhi && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">🏥 Jan Aushadhi</span>}
                          {m.generic && !m.jan_aushadhi && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">Generic</span>}
                          {i === 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">⭐ Best Value</span>}
                        </p>
                        <p className="truncate text-xs text-slate-500">{m.maker} · {m.composition} {m.strength} · {m.pack}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-extrabold text-[#0B1F3A]">{inr(m.price)}</p>
                        {m.mrp > m.price && <p className="text-xs text-slate-400 line-through">{inr(m.mrp)}</p>}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-[13px] text-blue-900">
                <p className="flex gap-2"><ArrowRightLeft size={16} className="mt-0.5 shrink-0" /><span><b>Brand switch karne se pehle:</b> composition + strength same honi chahiye. Pehli baar switch kar rahe hain to <b>doctor/pharmacist se confirm</b> zaroor karein — khaas taur par BP, sugar, thyroid, dil ki dawaiyon me.</span></p>
              </div>
              <div className="mt-3"><Disclaimer compact /></div>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck size={13} /> Prices sanket-matra (indicative) hain — store par confirm karein.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
