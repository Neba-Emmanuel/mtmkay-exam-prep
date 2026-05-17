import Link from 'next/link'
import { Home, LayoutDashboard, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#080C14] px-6 overflow-hidden relative">

      {/* ── Atmospheric background glows ── */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {/* Deep blue center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #1D4ED8 0%, transparent 70%)' }} />
        {/* Teal accent top-left */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #0EA5E9 0%, transparent 70%)' }} />
        {/* Purple accent bottom-right */}
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, #7C3AED 0%, transparent 70%)' }} />
      </div>

      {/* ── Main SVG illustration ── */}
      <div className="relative mb-8" style={{ animation: 'floatY 6s ease-in-out infinite' }}>
        <svg
          viewBox="0 0 560 340"
          width="560"
          height="340"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full max-w-[560px]"
        >
          {/* Stars scattered */}
          {[
            [30, 40], [80, 20], [140, 60], [200, 15], [260, 50],
            [330, 25], [400, 55], [460, 30], [510, 65], [540, 20],
            [55, 110], [490, 100], [15, 160], [545, 150],
            [100, 280], [450, 290], [520, 260], [30, 300],
          ].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx} cy={cy}
              r={i % 3 === 0 ? 1.5 : 1}
              fill="white"
              opacity={0.3 + (i % 4) * 0.12}
              style={{ animation: `twinkle ${2 + (i % 4) * 0.7}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}
            />
          ))}

          {/* Ground surface — crater-like terrain */}
          <ellipse cx="280" cy="295" rx="230" ry="28" fill="#0F172A" opacity="0.8" />
          <ellipse cx="280" cy="292" rx="210" ry="20" fill="#1E293B" />
          {/* Surface texture dots */}
          {[210, 240, 260, 290, 310, 335, 355].map((x, i) => (
            <circle key={i} cx={x} cy={292} r={2} fill="#334155" opacity="0.7" />
          ))}

          {/* Distant planet — top right */}
          <circle cx="460" cy="70" r="38" fill="#1E3A5F" opacity="0.6" />
          <circle cx="460" cy="70" r="38" fill="url(#planetGrad)" opacity="0.8" />
          {/* Planet ring */}
          <ellipse cx="460" cy="70" rx="56" ry="12" fill="none" stroke="#3B82F6" strokeWidth="2.5" opacity="0.3" />
          <ellipse cx="460" cy="70" rx="56" ry="12" fill="none" stroke="#60A5FA" strokeWidth="1" opacity="0.2" />
          {/* Planet craters */}
          <circle cx="448" cy="62" r="5" fill="#1a3a6b" opacity="0.5" />
          <circle cx="470" cy="78" r="3.5" fill="#1a3a6b" opacity="0.4" />

          {/* Small moon — top left */}
          <circle cx="88" cy="80" r="18" fill="#1E293B" />
          <circle cx="88" cy="80" r="18" fill="url(#moonGrad)" opacity="0.9" />
          <circle cx="82" cy="75" r="3.5" fill="#0F172A" opacity="0.5" />
          <circle cx="95" cy="86" r="2.5" fill="#0F172A" opacity="0.4" />

          {/* === Astronaut === */}
          {/* Helmet */}
          <circle cx="280" cy="130" r="46" fill="#1E293B" />
          <circle cx="280" cy="130" r="46" fill="url(#helmetGrad)" />
          {/* Helmet visor */}
          <ellipse cx="280" cy="133" rx="30" ry="26" fill="#0369A1" opacity="0.85" />
          <ellipse cx="280" cy="133" rx="30" ry="26" fill="url(#visorGrad)" />
          {/* Visor reflection */}
          <ellipse cx="271" cy="122" rx="10" ry="7" fill="white" opacity="0.12" transform="rotate(-20 271 122)" />
          <ellipse cx="268" cy="118" rx="4" ry="3" fill="white" opacity="0.18" transform="rotate(-20 268 118)" />
          {/* Helmet rim */}
          <circle cx="280" cy="130" r="46" fill="none" stroke="#334155" strokeWidth="3" />
          {/* Helmet antenna */}
          <line x1="280" y1="84" x2="280" y2="62" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <circle cx="280" cy="59" r="5" fill="#3B82F6" />
          <circle cx="280" cy="59" r="5" fill="#3B82F6" style={{ animation: 'antennaPulse 2s ease-in-out infinite' }} />

          {/* Suit body */}
          <rect x="245" y="173" width="70" height="70" rx="18" fill="#1E3A5F" />
          <rect x="245" y="173" width="70" height="70" rx="18" fill="url(#suitGrad)" />
          {/* Suit detail — chest panel */}
          <rect x="261" y="185" width="38" height="28" rx="5" fill="#0F2847" opacity="0.8" />
          <rect x="265" y="189" width="8" height="4" rx="2" fill="#3B82F6" opacity="0.9" />
          <rect x="277" y="189" width="8" height="4" rx="2" fill="#10B981" opacity="0.9" />
          <rect x="289" y="189" width="6" height="4" rx="2" fill="#F59E0B" opacity="0.9" />
          <rect x="265" y="197" width="30" height="2.5" rx="1.5" fill="#1D4ED8" opacity="0.5" />
          <rect x="265" y="202" width="20" height="2.5" rx="1.5" fill="#1D4ED8" opacity="0.3" />

          {/* Left arm */}
          <rect x="215" y="178" width="32" height="22" rx="11" fill="#1E3A5F" transform="rotate(15 215 178)" />
          <circle cx="208" cy="203" r="14" fill="#1E3A5F" />
          <circle cx="208" cy="203" r="14" fill="url(#gloveGrad)" />
          {/* Left arm holding something */}

          {/* Right arm — raised up, holding flag */}
          <rect x="313" y="170" width="32" height="22" rx="11" fill="#1E3A5F" transform="rotate(-20 313 170)" />
          <circle cx="342" cy="158" r="14" fill="#1E3A5F" />
          <circle cx="342" cy="158" r="14" fill="url(#gloveGrad)" />

          {/* Flag pole */}
          <line x1="342" y1="155" x2="342" y2="100" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          {/* Flag */}
          <rect x="342" y="100" width="48" height="32" rx="3" fill="#1D4ED8" opacity="0.9" />
          <text x="358" y="122" fontFamily="monospace" fontSize="14" fontWeight="900" fill="white" opacity="0.95">404</text>
          {/* Flag wave effect */}
          <path d="M342 100 Q366 95 390 100 Q366 105 342 100Z" fill="#2563EB" opacity="0.4" />

          {/* Legs */}
          <rect x="252" y="238" width="26" height="45" rx="13" fill="#1E3A5F" />
          <rect x="282" y="238" width="26" height="45" rx="13" fill="#1E3A5F" />
          {/* Boots */}
          <ellipse cx="265" cy="281" rx="18" ry="10" fill="#0F172A" />
          <ellipse cx="295" cy="281" rx="18" ry="10" fill="#0F172A" />
          <ellipse cx="265" cy="279" rx="14" ry="7" fill="#1E293B" />
          <ellipse cx="295" cy="279" rx="14" ry="7" fill="#1E293B" />

          {/* Tether line floating up */}
          <path
            d="M270 178 Q230 160 215 140 Q195 115 205 85"
            stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4"
            fill="none"
          />

          {/* Floating debris / space junk */}
          <rect x="150" y="200" width="12" height="8" rx="2" fill="#334155" opacity="0.6" transform="rotate(25 150 200)" />
          <rect x="390" y="210" width="9" height="6" rx="2" fill="#334155" opacity="0.5" transform="rotate(-15 390 210)" />
          <circle cx="175" cy="240" r="4" fill="#1E3A5F" opacity="0.6" />
          <circle cx="410" cy="230" r="3" fill="#1E3A5F" opacity="0.5" />

          {/* Defs */}
          <defs>
            <radialGradient id="helmetGrad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </radialGradient>
            <radialGradient id="visorGrad" cx="30%" cy="25%" r="70%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.1" />
            </radialGradient>
            <radialGradient id="planetGrad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#0F172A" />
            </radialGradient>
            <radialGradient id="moonGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1E293B" />
            </radialGradient>
            <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
            </linearGradient>
            <radialGradient id="gloveGrad" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* ── Text content ── */}
      <div className="relative text-center max-w-sm">
        <p
          className="text-[100px] font-black leading-none tracking-tighter mb-3 select-none"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 40%, #A78BFA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Georgia, serif',
            opacity: 0.95,
          }}
        >
          404
        </p>
        <h1 className="text-xl font-semibold text-white mb-2 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
          Lost in space
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          Houston, we have a problem. The page you're looking for has drifted off into the void.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/40"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link
            href="/exams"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <BookOpen className="w-4 h-4" /> Exams
          </Link>
        </div>
      </div>

      {/* ── CSS animations ── */}
      <style>{`
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.9; }
        }
        @keyframes antennaPulse {
          0%, 100% { opacity: 1;   r: 5; box-shadow: 0 0 0 0 #3B82F6; }
          50%       { opacity: 0.4; r: 7; }
        }
      `}</style>
    </div>
  )
}