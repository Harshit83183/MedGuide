import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, X, Loader2, Heart, Trash2 } from 'lucide-react';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { api, type SessionUser } from '../lib/api';

interface Member { id: number; name: string; relation: string; age: number | null; blood_group: string; conditions: string; }

const BG = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const REL = ['Self', 'Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandparent', 'Other'];

export default function Family({ user }: { user: SessionUser }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', relation: 'Father', age: '', blood_group: 'O+', conditions: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const d = await api<Member[]>('/api/family-members?user_id=' + user.id);
      setMembers(d);
    } catch { setMembers([]); } finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      await api('/api/family-members', { method: 'POST', body: { user_id: user.id, name: form.name.trim(), relation: form.relation, age: form.age ? Number(form.age) : null, blood_group: form.blood_group, conditions: form.conditions.trim() } });
      setForm({ name: '', relation: 'Father', age: '', blood_group: 'O+', conditions: '' });
      setShow(false);
      fetchAll();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save fail');
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm('Delete this member?')) return;
    await api('/api/family-members?id=' + id, { method: 'DELETE' });
    fetchAll();
  };

  return (
    <div>
      <PageHero icon={<Users size={28} />} kicker="Parivaar ka Health Hub" title="Family Profiles" sub="Maa-papa, bachche, dada-dadi — sabka blood group, umra aur bimari ka record ek jagah. Emergency me turant kaam aayega." />
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-extrabold text-[#0B1F3A]">👥 Members ({loading ? '...' : members.length})</p>
        <button onClick={() => setShow(!show)} className="flex items-center gap-1.5 rounded-full bg-[#0B3D91] px-5 py-2.5 text-sm font-bold text-white shadow">{show ? <X size={16} /> : <Plus size={16} />} {show ? 'Band karein' : 'Add Member'}</button>
      </div>
      {show && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-slate-200 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="text-xs font-bold text-slate-500">Naam *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ramesh Sharma" className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1D6FF2]" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Rishta</label>
            <select value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm outline-none">
              {REL.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Umra</label>
            <input value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value.replace(/\D/g, '').slice(0, 3) })} placeholder="45" inputMode="numeric" className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1D6FF2]" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500">Blood Group</label>
            <select value={form.blood_group} onChange={(e) => setForm({ ...form, blood_group: e.target.value })} className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm outline-none">
              {BG.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="lg:col-span-4">
            <label className="text-xs font-bold text-slate-500">Pehle se koi bimari? (BP, Sugar, Asthma...)</label>
            <input value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} placeholder="e.g. BP, Sugar" className="mt-1 w-full rounded-xl border-2 border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1D6FF2]" />
          </div>
          <div className="flex items-end">
            <button onClick={save} disabled={busy || !form.name.trim()} className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Save</button>
          </div>
        </motion.div>
      )}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-white" />)}</div>
      ) : members.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
          <Users size={44} className="mx-auto text-slate-300" />
          <p className="mt-2 font-extrabold text-[#0B1F3A]">Abhi koi member nahi</p>
          <p className="text-sm text-slate-500">Upar Add Member dabakar parivaar jodein.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m, i) => (
            <Reveal key={m.id} delay={(i % 3) * 0.07}>
              <motion.div whileHover={{ y: -4 }} className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-rose-100 to-blue-100" />
                <div className="relative flex items-start justify-between">
                  <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1D6FF2] to-[#0B3D91] p-3 text-xl font-extrabold text-white">{m.name.charAt(0).toUpperCase()}</span>
                  <button onClick={() => del(m.id)} className="rounded-full p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
                <p className="relative mt-2 font-extrabold text-[#0B1F3A]">{m.name}</p>
                <p className="relative text-xs font-semibold text-slate-500">{m.relation}{m.age ? ' · ' + m.age + ' yrs' : ''}</p>
                <div className="relative mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-red-700 ring-1 ring-red-200"><Heart size={11} /> {m.blood_group || '?'}</span>
                  {m.conditions ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-700 ring-1 ring-amber-200">⚠ {m.conditions}</span> : <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ring-1 ring-emerald-200">✓ No conditions</span>}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
