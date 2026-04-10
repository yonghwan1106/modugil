import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '발전 로드맵 | 모두의 길',
  description: '모두의 길 서비스의 향후 고도화 계획 및 분기별 발전 로드맵',
};

interface MilestoneItem {
  text: string;
}

interface Quarter {
  period: string;
  title: string;
  items: MilestoneItem[];
}

interface Issue {
  title: string;
  description: string;
}

const QUARTERS: Quarter[] = [
  {
    period: '2026 Q2',
    title: '4~6월',
    items: [
      { text: '음성 인식 한국어 정확도 개선 (Whisper API 검토)' },
      { text: '다국어 지원 MVP — 영어·중국어·일본어' },
      { text: '카카오톡 봇 채널 베타 오픈' },
    ],
  },
  {
    period: '2026 Q3',
    title: '7~9월',
    items: [
      { text: '지자체 추가 연계 — 부산·대구·광주 통합데이터' },
      { text: '사용자 피드백 분석 대시보드 구축' },
      { text: '실시간 PWA 푸시 알림 지원' },
    ],
  },
  {
    period: '2026 Q4',
    title: '10~12월',
    items: [
      { text: 'AI 경로 최적화 — 휠체어 동선 자동 추천' },
      { text: '보조공학 기기 연동 (점자 디스플레이·스크린리더 최적화)' },
      { text: '공공기관 API 협약 확장' },
    ],
  },
  {
    period: '2027 H1',
    title: '상반기',
    items: [
      { text: '전국 17개 광역지자체 커버리지 100% 달성' },
      { text: 'B2G SaaS 전환 모델 검토 및 파일럿' },
    ],
  },
];

const OPEN_ISSUES: Issue[] = [
  {
    title: '데이터 격차',
    description: '지방 소도시 공공데이터 공급 부족 — 지자체 협력 및 크라우드소싱으로 보완 예정',
  },
  {
    title: 'API 안정성',
    description: 'data.go.kr SLA 미보장으로 인한 간헐적 장애 — 캐싱 레이어 및 폴백 전략 도입 검토',
  },
  {
    title: '사투리·방언 인식',
    description: '음성 인식 모델의 지역 사투리 정확도 저하 — 방언 파인튜닝 데이터셋 수집 중',
  },
];

export default function RoadmapPage() {
  return (
    <main
      className="min-h-screen px-4 py-10 md:px-8 md:py-16"
      style={{ backgroundColor: '#0f172a', color: '#faf9f7' }}
    >
      {/* 홈 링크 */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm transition-colors duration-200"
          style={{ color: '#94a3b8' }}
          onMouseOver={undefined}
        >
          <span aria-hidden="true">←</span>
          <span>홈으로</span>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* 페이지 헤더 */}
        <header className="mb-12 text-center">
          <div
            className="inline-block mb-4 px-3 py-1 rounded-full text-xs font-medium tracking-wide"
            style={{
              backgroundColor: 'rgba(212,168,83,0.15)',
              color: '#d4a853',
              border: '1px solid rgba(212,168,83,0.3)',
            }}
          >
            향후 고도화 계획
          </div>
          <h1
            className="font-serif mb-3"
            style={{
              fontFamily: "'Noto Serif KR', serif",
              fontSize: 'clamp(2rem, 6vw, 3rem)',
              letterSpacing: '-0.02em',
              color: '#faf9f7',
            }}
          >
            모두의 길 — 발전 로드맵
          </h1>
          <p className="text-sm md:text-base" style={{ color: '#94a3b8' }}>
            교통약자 이동 지원 서비스를 전국 단위로 확장하고 지속 가능한 플랫폼으로 성장시키기 위한 분기별 계획입니다.
          </p>
        </header>

        {/* 분기별 마일스톤 */}
        <section aria-labelledby="milestones-heading" className="mb-16">
          <h2
            id="milestones-heading"
            className="text-lg font-semibold mb-6"
            style={{ color: '#d4a853' }}
          >
            분기별 마일스톤
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {QUARTERS.map((q) => (
              <article
                key={q.period}
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                }}
              >
                <header className="mb-4">
                  <div
                    className="text-xs font-semibold tracking-widest uppercase mb-1"
                    style={{ color: '#d4a853' }}
                  >
                    {q.period}
                  </div>
                  <h3 className="text-sm font-medium" style={{ color: '#64748b' }}>
                    {q.title}
                  </h3>
                </header>
                <ul className="space-y-3">
                  {q.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm leading-relaxed"
                      style={{ color: '#cbd5e1' }}
                    >
                      <span
                        className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: '#d4a853' }}
                        aria-hidden="true"
                      />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* 현재 진행 중인 미해결 이슈 */}
        <section aria-labelledby="issues-heading" className="mb-12">
          <h2
            id="issues-heading"
            className="text-lg font-semibold mb-6"
            style={{ color: '#d4a853' }}
          >
            현재 진행 중인 미해결 이슈
          </h2>
          <div className="space-y-4">
            {OPEN_ISSUES.map((issue) => (
              <article
                key={issue.title}
                className="rounded-xl p-5 flex gap-4 items-start"
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                }}
              >
                <span
                  className="mt-0.5 shrink-0 w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#f59e0b' }}
                  aria-hidden="true"
                />
                <div>
                  <h3
                    className="text-sm font-semibold mb-1"
                    style={{ color: '#faf9f7' }}
                  >
                    {issue.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                    {issue.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 하단 푸터 */}
        <footer className="text-center text-xs" style={{ color: '#475569' }}>
          <p>이 로드맵은 공모전 심사 기준 및 사용자 피드백에 따라 조정될 수 있습니다.</p>
          <p className="mt-1">
            문의:{' '}
            <a
              href="https://github.com/yonghwan1106/modugil"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200"
              style={{ color: '#475569' }}
            >
              GitHub
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
