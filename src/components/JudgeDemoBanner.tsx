'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'judge_demo_banner_dismissed';

const SCENARIOS = [
  {
    label: '휠체어 · 도서관 찾기',
    userType: '휠체어',
    query: '종로구+도서관+빈자리+엘리베이터+휠체어',
    ariaLabel: '시나리오 1: 휠체어 사용자 도서관 찾기 데모 실행',
  },
  {
    label: '시각장애 · 신호등 확인',
    userType: '시각장애',
    query: '강남역+횡단보도+신호등+잔여시간',
    ariaLabel: '시나리오 2: 시각장애인 신호등 확인 데모 실행',
  },
  {
    label: '임산부 · 민원실 대기',
    userType: '임산부',
    query: '서울역+민원실+대기시간+임산부',
    ariaLabel: '시나리오 3: 임산부 민원실 대기 데모 실행',
  },
  {
    label: '고령자 · 자전거 대여',
    userType: '고령자',
    query: '마포구+공공자전거+대여현황',
    ariaLabel: '시나리오 4: 고령자 자전거 대여 데모 실행',
  },
] as const;

function isDismissed(): boolean {
  try {
    return !!localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

export default function JudgeDemoBanner() {
  const [visible, setVisible] = useState(() => !isDismissed());
  const router = useRouter();

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // localStorage unavailable — ignore
    }
    setVisible(false);
  };

  const handleScenario = (userType: string, query: string) => {
    router.push(`/?userType=${encodeURIComponent(userType)}&q=${query}`);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="심사위원 데모 가이드"
      style={{
        backgroundColor: '#0f172a',
        border: '1px solid rgba(212,168,83,0.4)',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* 상단 행: 텍스트 + 닫기 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <p
          style={{
            color: '#d4a853',
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: '1.4',
            margin: 0,
          }}
        >
          🎖️ 심사위원 가이드 — 3가지 핵심 시나리오를 원클릭으로 체험하세요
        </p>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="심사위원 데모 배너 닫기"
          style={{
            flexShrink: 0,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: '18px',
            lineHeight: 1,
            padding: '2px 4px',
            borderRadius: '4px',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
        >
          ×
        </button>
      </div>

      {/* 버튼 행 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {SCENARIOS.map((s) => (
          <button
            key={s.userType}
            type="button"
            onClick={() => handleScenario(s.userType, s.query)}
            aria-label={s.ariaLabel}
            style={{
              flex: '1 1 auto',
              minWidth: '140px',
              backgroundColor: 'rgba(212,168,83,0.12)',
              border: '1px solid rgba(212,168,83,0.35)',
              borderRadius: '8px',
              color: '#d4a853',
              fontSize: '12px',
              fontWeight: 600,
              padding: '8px 12px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(212,168,83,0.25)';
              e.currentTarget.style.borderColor = '#d4a853';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(212,168,83,0.12)';
              e.currentTarget.style.borderColor = 'rgba(212,168,83,0.35)';
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid #d4a853';
              e.currentTarget.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
