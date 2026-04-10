import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '활용 공공데이터 | 모두의 길',
  description:
    '모두의 길(modugil)이 활용하는 공공데이터포털 7개 통합데이터 주제 × 20개 API 현황',
};

// ──────────────────────────────────────────────
// 데이터 정의
// ──────────────────────────────────────────────

interface ApiItem {
  name: string;
  path: string;
  description: string;
}

interface DataTheme {
  id: number;
  title: string;
  icon: string;
  apiCount: number;
  usage: string;
  apis: ApiItem[];
}

const THEMES: DataTheme[] = [
  {
    id: 1,
    title: '전국 공영자전거 실시간 정보',
    icon: '🚲',
    apiCount: 3,
    usage: 'AI 챗봇 → 자전거 빈자리·대여소 조회',
    apis: [
      {
        name: '공영자전거 대여소 정보',
        path: 'apis.data.go.kr/B551982/pbdo_v2/inf_101_00010001_v2',
        description: '대여소 위치·명칭·거치대 수',
      },
      {
        name: '공영자전거 실시간 가용 현황',
        path: 'apis.data.go.kr/B551982/pbdo_v2/inf_101_00010002_v2',
        description: '대여 가능 자전거 수·반납 가능 거치대 수',
      },
      {
        name: '공영자전거 이력 정보',
        path: 'apis.data.go.kr/B551982/pbdo_v2/inf_101_00010003_v2',
        description: '대여·반납 이력 통계',
      },
    ],
  },
  {
    id: 2,
    title: '교통약자 이동지원 현황 실시간 정보',
    icon: '♿',
    apiCount: 4,
    usage: 'AI 챗봇 → 장애인 콜택시·이동지원 차량 가용 현황',
    apis: [
      {
        name: '이동지원센터 기본정보',
        path: 'apis.data.go.kr/B551982/tsdo_v2/center_info_v2',
        description: '센터명·전화번호·위치',
      },
      {
        name: '지원차량 정보',
        path: 'apis.data.go.kr/B551982/tsdo_v2/info_vehicle_v2',
        description: '보유 차량 목록·차종',
      },
      {
        name: '차량 운행 정보',
        path: 'apis.data.go.kr/B551982/tsdo_v2/info_vehicle_operation_v2',
        description: '운행 중 차량 수·운행 상태',
      },
      {
        name: '차량 가용 실시간 현황',
        path: 'apis.data.go.kr/B551982/tsdo_v2/info_vehicle_use_v2',
        description: '가용 차량·예약·대기 건수',
      },
    ],
  },
  {
    id: 3,
    title: '공공도서관 열람실 현황 실시간 정보',
    icon: '📚',
    apiCount: 3,
    usage: 'AI 챗봇 → 가까운 도서관 빈 자리 조회',
    apis: [
      {
        name: '공공도서관 기본정보',
        path: 'apis.data.go.kr/B551982/plr_v2/info_v2',
        description: '도서관명·주소·위치 좌표',
      },
      {
        name: '도서관 운영 현황',
        path: 'apis.data.go.kr/B551982/plr_v2/prst_info_v2',
        description: '열람실 운영 여부·개방 시간',
      },
      {
        name: '열람실 실시간 좌석 현황',
        path: 'apis.data.go.kr/B551982/plr_v2/rlt_rdrm_info_v2',
        description: '총 좌석·사용 중·잔여 좌석 수',
      },
    ],
  },
  {
    id: 4,
    title: '공영 물품보관함 현황 실시간 정보',
    icon: '🗄️',
    apiCount: 3,
    usage: 'AI 챗봇 → 짐 보관소 위치·가용 보관함 크기별 조회',
    apis: [
      {
        name: '물품보관함 기본정보',
        path: 'apis.data.go.kr/B551982/psl_v2/locker_info_v2',
        description: '보관함 위치·명칭·주소',
      },
      {
        name: '물품보관함 상세정보',
        path: 'apis.data.go.kr/B551982/psl_v2/locker_detail_info_v2',
        description: '규격별(대·중·소) 보관함 총 수',
      },
      {
        name: '물품보관함 실시간 가용 현황',
        path: 'apis.data.go.kr/B551982/psl_v2/locker_realtime_use_v2',
        description: '대형·중형·소형 사용 가능 수',
      },
    ],
  },
  {
    id: 5,
    title: '교통안전 실시간 신호등 정보',
    icon: '🚦',
    apiCount: 2,
    usage: 'AI 챗봇 → 횡단보도 신호 잔여 시간·색상 안내',
    apis: [
      {
        name: '신호등 교차로 위치정보',
        path: 'apis.data.go.kr/B551982/rti/crsrd_map_info',
        description: '교차로명·위치 좌표',
      },
      {
        name: '신호등 방향별 실시간 현황',
        path: 'apis.data.go.kr/B551982/rti/tl_drct_info',
        description: '방향별 잔여 시간(초)·점등 상태',
      },
    ],
  },
  {
    id: 6,
    title: '민원실 이용 현황 실시간 정보',
    icon: '🏛️',
    apiCount: 2,
    usage: 'AI 챗봇 → 민원실 혼잡도·업무별 대기 인원 조회',
    apis: [
      {
        name: '민원실 기본정보',
        path: 'apis.data.go.kr/B551982/cso_v2/cso_info_v2',
        description: '민원실명·주소·운영 시간',
      },
      {
        name: '민원실 실시간 대기 현황',
        path: 'apis.data.go.kr/B551982/cso_v2/cso_realtime_v2',
        description: '업무별 대기 인원·호출 번호',
      },
    ],
  },
  {
    id: 7,
    title: '전국 초정밀 버스 실시간 위치 정보',
    icon: '🚌',
    apiCount: 3,
    usage: 'AI 챗봇 → 저상버스 운행 여부·버스 실시간 위치 조회',
    apis: [
      {
        name: '버스 노선 마스터 정보',
        path: 'apis.data.go.kr/B551982/rte/mst_info',
        description: '노선번호·기점·종점·노선유형',
      },
      {
        name: '버스 정류소 정보',
        path: 'apis.data.go.kr/B551982/rte/ps_info',
        description: '정류소명·위치 좌표·순서',
      },
      {
        name: '버스 실시간 위치 정보',
        path: 'apis.data.go.kr/B551982/rte/rtm_loc_info',
        description: '차량 위도·경도·속도·방향각',
      },
    ],
  },
];

const PRINCIPLES = [
  { icon: '⚡', title: '실시간 호출', desc: '매 요청마다 공공데이터포털 API를 직접 호출합니다.' },
  { icon: '⏱️', title: '5분 캐싱', desc: '동일 지역 반복 조회 시 5분간 응답을 캐시해 부하를 줄입니다.' },
  { icon: '📋', title: '출처 명시', desc: '모든 데이터에 공공데이터포털(data.go.kr) 출처를 표시합니다.' },
  { icon: '🔄', title: '폴백 처리', desc: 'API 장애 시 마지막 정상 데이터(Mock)로 서비스를 유지합니다.' },
  { icon: '🔒', title: '개인정보 미수집', desc: '위치·대기 현황 등 집계 데이터만 사용하며 개인정보를 수집하지 않습니다.' },
];

// ──────────────────────────────────────────────
// 컴포넌트
// ──────────────────────────────────────────────

export default function DataPage() {
  const totalApis = THEMES.reduce((sum, t) => sum + t.apiCount, 0);

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: '#0f172a', color: '#faf9f7' }}
    >
      {/* ── 상단 네비 ── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: '#d4a853' }}
          >
            <span aria-hidden="true">←</span>
            홈으로
          </Link>
        </div>
      </nav>

      {/* ── 페이지 헤더 ── */}
      <header className="mx-auto max-w-7xl px-4 py-12 text-center">
        <p
          className="mb-3 text-sm font-semibold uppercase tracking-widest"
          style={{ color: '#d4a853' }}
        >
          공공데이터 활용 현황
        </p>
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl" style={{ color: '#faf9f7' }}>
          활용 공공데이터 현황
          <span className="block mt-1 text-2xl sm:text-3xl" style={{ color: '#d4a853' }}>
            7개 주제 · {totalApis}개 API
          </span>
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed" style={{ color: '#94a3b8' }}>
          모두의 길은 행정안전부 전국 통합데이터 플랫폼의 공공 API를 실시간으로 호출하여
          교통약자와 모든 시민에게 정확한 이동 정보를 제공합니다.
        </p>

        {/* 요약 통계 */}
        <div className="mt-8 flex flex-wrap justify-center gap-6">
          {[
            { label: '통합데이터 주제', value: '7개' },
            { label: '활용 API', value: `${totalApis}개` },
            { label: '데이터 출처', value: 'data.go.kr' },
            { label: '제공기관', value: '한국지역정보개발원' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg px-6 py-4 text-center"
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            >
              <p className="text-2xl font-bold" style={{ color: '#d4a853' }}>
                {stat.value}
              </p>
              <p className="mt-1 text-xs" style={{ color: '#94a3b8' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </header>

      {/* ── 주제별 카드 그리드 ── */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="sr-only">주제별 API 목록</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((theme) => (
            <article
              key={theme.id}
              className="flex flex-col rounded-xl p-6"
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            >
              {/* 카드 헤더 */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {theme.icon}
                  </span>
                  <h3 className="text-base font-semibold leading-snug" style={{ color: '#faf9f7' }}>
                    {theme.title}
                  </h3>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ backgroundColor: '#d4a85320', color: '#d4a853', border: '1px solid #d4a85340' }}
                >
                  {theme.apiCount}개 API
                </span>
              </div>

              {/* 활용 위치 */}
              <p
                className="mb-4 rounded-md px-3 py-2 text-xs font-medium"
                style={{ backgroundColor: '#0f172a', color: '#64748b' }}
              >
                <span style={{ color: '#d4a853' }}>활용:</span> {theme.usage}
              </p>

              {/* API 목록 */}
              <ul className="flex flex-col gap-3 flex-1">
                {theme.apis.map((api) => (
                  <li
                    key={api.path}
                    className="rounded-lg p-3"
                    style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                  >
                    <p className="mb-1 text-sm font-medium" style={{ color: '#e2e8f0' }}>
                      {api.name}
                    </p>
                    <p
                      className="mb-1.5 break-all font-mono text-xs"
                      style={{ color: '#d4a853' }}
                    >
                      {api.path}
                    </p>
                    <p className="text-xs" style={{ color: '#64748b' }}>
                      {api.description}
                    </p>
                  </li>
                ))}
              </ul>

              {/* 출처 */}
              <footer
                className="mt-4 border-t pt-3 text-xs"
                style={{ borderColor: '#334155', color: '#475569' }}
              >
                출처:{' '}
                <a
                  href="https://www.data.go.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 transition-colors hover:opacity-80"
                  style={{ color: '#d4a853' }}
                >
                  공공데이터포털 (data.go.kr)
                </a>
                {' '}· 제공기관: 한국지역정보개발원
              </footer>
            </article>
          ))}
        </div>
      </section>

      {/* ── 데이터 활용 원칙 ── */}
      <section
        className="border-t"
        style={{ borderColor: '#1e293b', backgroundColor: '#0a1120' }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="mb-8 text-center text-xl font-bold" style={{ color: '#faf9f7' }}>
            데이터 활용 원칙
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PRINCIPLES.map((p) => (
              <li
                key={p.title}
                className="flex flex-col items-center rounded-xl p-5 text-center"
                style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              >
                <span className="mb-3 text-3xl" aria-hidden="true">
                  {p.icon}
                </span>
                <p className="mb-1 text-sm font-semibold" style={{ color: '#d4a853' }}>
                  {p.title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
                  {p.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 페이지 푸터 ── */}
      <footer
        className="border-t py-6 text-center text-xs"
        style={{ borderColor: '#1e293b', color: '#475569' }}
      >
        본 페이지에 표시된 API 경로는 공공데이터포털 개발 가이드에 따라 base URL(
        <code className="rounded px-1 py-0.5" style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}>
          apis.data.go.kr
        </code>
        )을 포함합니다. 서비스키는 서버 환경변수로만 관리되며 노출되지 않습니다.
      </footer>
    </main>
  );
}
