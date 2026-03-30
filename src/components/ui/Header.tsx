'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">🚶</span>
          </div>
          <h1 className="text-lg font-bold text-gray-900">모두의 길</h1>
          <span className="text-xs text-gray-500 hidden sm:inline">AI 교통약자 이동 어시스턴트</span>
        </div>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              pathname === '/'
                ? 'text-blue-600 border-b-2 border-blue-600 rounded-none'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            지도
          </Link>
          <Link
            href="/dashboard"
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              pathname === '/dashboard'
                ? 'text-blue-600 border-b-2 border-blue-600 rounded-none'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            대시보드
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
          전국 통합데이터 활용
        </span>
      </div>
    </header>
  );
}
