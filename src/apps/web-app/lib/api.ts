export async function api<T>(path: string, opts?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(path, {
    method: opts?.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}) as Record<string, string>);
    throw new Error((e as Record<string, string>).error || 'Request failed (' + res.status + ')');
  }
  return (await res.json()) as T;
}

export interface SessionUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  provider: 'google' | 'phone' | 'password' | 'demo';
}

const KEY = 'medguide_session';

export function loadSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function saveSession(u: SessionUser) {
  localStorage.setItem(KEY, JSON.stringify(u));
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function inr(n: number): string {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

export async function uploadFile(file: File, folder: string): Promise<string> {
  const b64 = await fileToBase64(file);
  const data = await api<{ url: string }>('/api/upload', {
    method: 'POST',
    body: { fileName: file.name, fileBase64: b64, contentType: file.type, folder },
  });
  return data.url;
}
