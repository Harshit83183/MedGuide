import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import TrustBar from './TrustBar';
import type { SessionUser } from '../lib/api';

export default function Shell({ user, onLogout, children }: { user: SessionUser; onLogout: () => void; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F9FC] text-slate-800">
      <TrustBar slim />
      <Navbar user={user} onLogout={onLogout} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-4 pt-6 sm:px-6">{children}</main>
      <Footer />
    </div>
  );
}
