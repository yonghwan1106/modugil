'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      className="h-16 flex items-center justify-between px-5 shrink-0 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #263348 100%)',
      }}
    >
      {/* Subtle geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30Z' fill='none' stroke='%23d4a853' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="flex items-center gap-5 relative z-10">
        <div className="flex items-center gap-3">
          {/* Gold-bordered circle icon */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              border: '2px solid #d4a853',
              background: 'rgba(212, 168, 83, 0.1)',
            }}
          >
            <span
              className="font-serif text-sm font-bold"
              style={{ color: '#d4a853' }}
            >
              길
            </span>
          </div>
          <h1
            className="font-serif text-lg font-bold tracking-tight"
            style={{ color: '#d4a853' }}
          >
            모두의 길
          </h1>
          <span className="text-xs hidden sm:inline" style={{ color: '#94a3b8' }}>
            AI 교통약자 이동 어시스턴트
          </span>
        </div>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'text-white border-b-2'
                : 'text-slate-400 hover:text-white'
            }`}
            style={
              pathname === '/'
                ? { borderBottomColor: '#d4a853', color: '#ffffff' }
                : undefined
            }
          >
            지도
          </Link>
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'text-white border-b-2'
                : 'text-slate-400 hover:text-white'
            }`}
            style={
              pathname === '/dashboard'
                ? { borderBottomColor: '#d4a853', color: '#ffffff' }
                : undefined
            }
          >
            대시보드
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-1 relative z-10">
        <span
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: '#d4a853', color: '#0f172a' }}
        >
          전국 통합데이터 활용
        </span>
      </div>
    </header>
  );
}
