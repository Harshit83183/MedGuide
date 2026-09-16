export function MedGuideMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="MedGuide logo">
      <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#mgblue)" />
      <path d="M32 16v32M16 32h32" stroke="white" strokeWidth="9" strokeLinecap="round" />
      <circle cx="32" cy="32" r="5.2" fill="#0B1F3A" />
      <path d="M46 12c3.4 2.6 5.4 6.6 5.4 11" stroke="#7DD3FC" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="mgblue" x1="0" y1="0" x2="64" y2="64">
          <stop offset="0" stopColor="#1D6FF2" />
          <stop offset="1" stopColor="#0B3D91" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1z" />
      <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44A11.98 11.98 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.87 8.87 4.76 12 4.76z" />
    </svg>
  );
}
