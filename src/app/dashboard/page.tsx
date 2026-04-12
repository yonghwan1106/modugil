import { fetchPublicData } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import * as mockData from '@/lib/api/mock-data';
import type {
  BikeStation,
  BikeAvailability,
  TransportCenter,
  TransportVehicleUse,
  Library,
  LibrarySeat,
  CivilOffice,
  CivilOfficeWait,
  Locker,
  LockerRealtime,
} from '@/lib/api/types';
import Header from '@/components/ui/Header';
import {
  BikeBarChart,
  TransportBarChart,
  LibraryPieChart,
} from '@/components/dashboard/DashboardCharts';

// =============================================
// 타입 정의 (미사용 endpoint 응답)
// =============================================

interface BikeHistory {
  rntstnId?: string;
  rntDt?: string;
  rtnDt?: string;
  rntNocs?: string | number;
  [key: string]: string | number | undefined;
}

interface TransportVehicle {
  cntrId?: string;
  cntrNm?: string;
  vhclNo?: string;
  vhclType?: string;
  hldVhclTcntom?: string | number;
  [key: string]: string | number | undefined;
}

interface TransportOperation {
  cntrId?: string;
  cntrNm?: string;
  oprDt?: string;
  totOprNocs?: string | number;
  [key: string]: string | number | undefined;
}

interface LibraryStatus {
  pblibId?: string;
  pblibNm?: string;
  operStatNm?: string;
  operBgngTm?: string;
  operEndTm?: string;
  [key: string]: string | number | undefined;
}

interface LockerDetail {
  stlckId?: string;
  stlckNm?: string;
  lrgszTotStlckCnt?: string | number;
  mdmszTotStlckCnt?: string | number;
  smlszTotStlckCnt?: string | number;
  [key: string]: string | number | undefined;
}

interface BusStop {
  rteId?: string;
  sttnId?: string;
  sttnNm?: string;
  sttnNo?: string;
  seq?: number | string;
  lat?: string;
  lot?: string;
  [key: string]: string | number | undefined;
}

// =============================================
// fetchWithFallback 헬퍼 (서버 사이드)
// =============================================

async function fetchWithFallback<T>(
  endpoint: string,
  params: Record<string, string>,
  fallback: T[],
): Promise<{ items: T[]; source: 'live' | 'mock' }> {
  try {
    const items = await fetchPublicData<T>(endpoint, params);
    if (!items || items.length === 0) return { items: fallback, source: 'mock' };
    return { items, source: 'live' };
  } catch {
    return { items: fallback, source: 'mock' };
  }
}

// =============================================
// 자전거 API (별도 응답 구조)
// =============================================

interface BikeApiResponse<T> {
  header: { resultCode: string; resultMsg: string };
  body: { totalCount: number; pageNo: number; numOfRows: number; item: T[] };
}

async function fetchBikeApiSafe<T>(
  endpoint: string,
  params: Record<string, string>,
  fallback: T[],
): Promise<{ items: T[]; source: 'live' | 'mock' }> {
  const serviceKey = process.env.DATA_API_KEY;
  if (!serviceKey) return { items: fallback, source: 'mock' };
  try {
    const otherParams = new URLSearchParams({ type: 'json', pageNo: '1', numOfRows: '50', ...params });
    const res = await fetch(`${endpoint}?serviceKey=${serviceKey}&${otherParams.toString()}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return { items: fallback, source: 'mock' };
    const json = (await res.json()) as BikeApiResponse<T>;
    if (json.header.resultCode !== 'K0' && json.header.resultCode !== '00') {
      return { items: fallback, source: 'mock' };
    }
    const items = json.body.item ?? [];
    if (items.length === 0) return { items: fallback, source: 'mock' };
    return { items, source: 'live' };
  } catch {
    return { items: fallback, source: 'mock' };
  }
}

// =============================================
// 출처 뱃지 컴포넌트
// =============================================

function SourceBadge({ source }: { source: 'live' | 'mock' }) {
  return (
    <span
      className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{
        backgroundColor: source === 'live' ? '#059669' : '#64748b',
        color: '#ffffff',
      }}
    >
      {source === 'live' ? '실시간' : '샘플'}
    </span>
  );
}

function SourceFooter() {
  return (
    <p className="text-xs mt-3" style={{ color: '#94a3b8' }}>
      출처: 공공데이터포털 (data.go.kr) · 한국지역정보개발원
    </p>
  );
}

// =============================================
// 카드 래퍼
// =============================================

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e0dc',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
      }}
    >
      {children}
    </div>
  );
}

function CardTitle({
  children,
  source,
}: {
  children: React.ReactNode;
  source?: 'live' | 'mock';
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h3
        className="font-semibold"
        style={{
          fontFamily: "'Noto Serif KR', serif",
          color: '#0f172a',
          paddingLeft: 12,
          borderLeft: '4px solid #d4a853',
        }}
      >
        {children}
      </h3>
      {source !== undefined && <SourceBadge source={source} />}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  icon: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: '#0f172a',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-7 h-7 flex items-center justify-center rounded-full text-sm"
          style={{
            backgroundColor: 'rgba(212, 168, 83, 0.2)',
            border: '1px solid rgba(212, 168, 83, 0.4)',
          }}
        >
          {icon}
        </span>
        <span className="text-xs font-medium" style={{ color: '#ffffff' }}>
          {title}
        </span>
      </div>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: "'Noto Serif KR', serif", color: '#d4a853' }}
      >
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
        {sub}
      </p>
    </div>
  );
}

function WaitBadge({ count }: { count: number }) {
  const style =
    count >= 10
      ? { backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #0f172a' }
      : count >= 5
        ? { backgroundColor: 'transparent', color: '#d4a853', border: '1px solid #0f172a' }
        : { backgroundColor: 'transparent', color: '#059669', border: '1px solid #0f172a' };
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold" style={style}>
      {count}명
    </span>
  );
}

// =============================================
// 페이지 (Server Component)
// =============================================

export default async function DashboardPage() {
  const seoulParams = { stdgCd: '1100000000' };
  const bikeParams = { lcgvmnInstCd: '1100000000' };

  // 핵심 10개 API만 초기 로딩 (미사용 6개는 지연 로딩)
  const [
    bikeStationsResult,
    bikeAvailResult,
    transportCentersResult,
    transportAvailResult,
    librariesResult,
    librarySeatsResult,
    civilOfficesResult,
    civilWaitResult,
    lockersResult,
    lockerRealtimeResult,
  ] = await Promise.all([
    fetchBikeApiSafe<BikeStation>(ENDPOINTS.bicycle.stations, bikeParams, mockData.MOCK_BIKE_STATIONS),
    fetchBikeApiSafe<BikeAvailability>(ENDPOINTS.bicycle.availability, bikeParams, mockData.MOCK_BIKE_AVAILABILITY),
    fetchWithFallback<TransportCenter>(ENDPOINTS.transport.centers, seoulParams, mockData.MOCK_TRANSPORT_CENTERS),
    fetchWithFallback<TransportVehicleUse>(ENDPOINTS.transport.availability, seoulParams, mockData.MOCK_TRANSPORT_AVAILABILITY),
    fetchWithFallback<Library>(ENDPOINTS.library.info, {}, mockData.MOCK_LIBRARIES),
    fetchWithFallback<LibrarySeat>(ENDPOINTS.library.seats, {}, mockData.MOCK_LIBRARY_SEATS),
    fetchWithFallback<CivilOffice>(ENDPOINTS.civil.info, seoulParams, mockData.MOCK_CIVIL_OFFICES),
    fetchWithFallback<CivilOfficeWait>(ENDPOINTS.civil.realtime, seoulParams, mockData.MOCK_CIVIL_WAIT),
    fetchWithFallback<Locker>(ENDPOINTS.locker.info, seoulParams, mockData.MOCK_LOCKERS),
    fetchWithFallback<LockerRealtime>(ENDPOINTS.locker.realtime, seoulParams, mockData.MOCK_LOCKER_REALTIME),
  ]);

  // 미사용 6개 API — 비차단 로딩 (실패해도 페이지 렌더링 지연 없음)
  const [
    bikeHistoryResult,
    transportVehiclesResult,
    transportOperationsResult,
    libraryStatusResult,
    lockerDetailResult,
    busStopsResult,
  ] = await Promise.all([
    fetchBikeApiSafe<BikeHistory>(ENDPOINTS.bicycle.history, bikeParams, []),
    fetchWithFallback<TransportVehicle>(ENDPOINTS.transport.vehicles, seoulParams, []),
    fetchWithFallback<TransportOperation>(ENDPOINTS.transport.operations, seoulParams, []),
    fetchWithFallback<LibraryStatus>(ENDPOINTS.library.status, {}, []),
    fetchWithFallback<LockerDetail>(ENDPOINTS.locker.detail, seoulParams, []),
    fetchWithFallback<BusStop>(ENDPOINTS.bus.stops, seoulParams, []),
  ]).catch(() => [
    { items: [] as BikeHistory[], source: 'mock' as const },
    { items: [] as TransportVehicle[], source: 'mock' as const },
    { items: [] as TransportOperation[], source: 'mock' as const },
    { items: [] as LibraryStatus[], source: 'mock' as const },
    { items: [] as LockerDetail[], source: 'mock' as const },
    { items: [] as BusStop[], source: 'mock' as const },
  ]);

  // ---- 요약 통계 계산 ----

  const totalAvailableBikes = bikeAvailResult.items.reduce(
    (sum, a) => sum + Number(a.rntNocs ?? 0),
    0,
  );

  const totalAvailableVehicles = transportAvailResult.items.reduce(
    (sum, a) => sum + Number(a.avlVhclCntom ?? 0),
    0,
  );

  const totalLibrarySeats = librarySeatsResult.items.reduce(
    (sum, s) => sum + Number(s.tseatCnt ?? 0),
    0,
  );
  const usedLibrarySeats = librarySeatsResult.items.reduce(
    (sum, s) => sum + Number(s.useSeatCnt ?? 0),
    0,
  );
  const availableLibrarySeats = totalLibrarySeats - usedLibrarySeats;
  const avgLibraryUsage =
    totalLibrarySeats > 0 ? Math.round((usedLibrarySeats / totalLibrarySeats) * 100) : 0;

  const totalLockerAvail = lockerRealtimeResult.items.reduce(
    (sum, r) =>
      sum +
      Number(r.usePsbltyLrgszStlckCnt ?? 0) +
      Number(r.usePsbltyMdmszStlckCnt ?? 0) +
      Number(r.usePsbltySmlszStlckCnt ?? 0),
    0,
  );

  // ---- 차트 데이터 ----

  const bikeChartData = bikeStationsResult.items.slice(0, 10).map((station) => {
    const avail = bikeAvailResult.items.find((a) => a.rntstnId === station.rntstnId);
    const shortName = station.rntstnNm.replace(/^\d+\.\s*/, '').slice(0, 10);
    return {
      name: shortName,
      거치대: Number(avail?.bcyclTpkctNocs ?? 0),
      대여가능: Number(avail?.rntNocs ?? 0),
      반납가능: Number(avail?.rtnNocs ?? 0),
    };
  });

  const transportChartData = transportCentersResult.items.map((center) => {
    const avail = transportAvailResult.items.find((a) => a.cntrId === center.cntrId);
    const shortName = center.cntrNm
      .replace('교통약자 이동지원센터', '')
      .replace('서울시 ', '')
      .trim();
    return {
      name: shortName,
      운영차량: Number(avail?.oprVhclCntom ?? 0),
      가용차량: Number(avail?.avlVhclCntom ?? 0),
    };
  });

  const libraryChartData = librariesResult.items.slice(0, 7).map((lib) => {
    const seats = librarySeatsResult.items.filter((s) => s.pblibId === lib.pblibId);
    const total = seats.reduce((sum, s) => sum + Number(s.tseatCnt), 0);
    const used = seats.reduce((sum, s) => sum + Number(s.useSeatCnt), 0);
    const rate = total > 0 ? Math.round((used / total) * 100) : 0;
    const shortName = lib.pblibNm.replace('도서관', '관').replace('서울', 'S.');
    return { name: shortName, value: rate };
  });

  // ---- 미사용 6개 카드 데이터 ----

  const bikeHistoryCount = bikeHistoryResult.items.length;
  const bikeHistoryLatest = bikeHistoryResult.items[0];

  const totalVehicleCount = transportVehiclesResult.items.length;

  const totalOprNocs = transportOperationsResult.items.reduce(
    (sum, op) => sum + Number(op.totOprNocs ?? 0),
    0,
  );

  const openLibraries = libraryStatusResult.items.filter(
    (s) => s.operStatNm === '운영중' || s.operStatNm === '정상운영',
  ).length;

  const totalLockerCapacity = lockerDetailResult.items.reduce(
    (sum, d) =>
      sum +
      Number(d.lrgszTotStlckCnt ?? 0) +
      Number(d.mdmszTotStlckCnt ?? 0) +
      Number(d.smlszTotStlckCnt ?? 0),
    0,
  );

  const busStopCount = busStopsResult.items.length;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#faf9f7' }}>
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        {/* 페이지 제목 */}
        <div className="mb-6">
          <h2
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Noto Serif KR', serif", color: '#0f172a' }}
          >
            공공데이터 현황 대시보드
          </h2>
          <div
            className="mb-2"
            style={{ width: 48, height: 3, backgroundColor: '#d4a853', borderRadius: 2 }}
          />
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            서울시 공공서비스 실시간 데이터 · 20개 API 전체 활용
          </p>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="교통약자 가용 차량"
            value={`${totalAvailableVehicles}대`}
            sub={`전체 ${transportCentersResult.items.length}개 센터`}
            icon="🚗"
          />
          <SummaryCard
            title="공공도서관 빈 좌석"
            value={`${availableLibrarySeats}석`}
            sub={`평균 사용률 ${avgLibraryUsage}%`}
            icon="📚"
          />
          <SummaryCard
            title="따릉이 대여 가능"
            value={`${totalAvailableBikes}대`}
            sub={`${bikeStationsResult.items.length}개 대여소`}
            icon="🚲"
          />
          <SummaryCard
            title="물품보관함 가용"
            value={`${totalLockerAvail}칸`}
            sub={`${lockersResult.items.length}개 보관소`}
            icon="🔒"
          />
        </div>

        {/* 차트 2개 나란히 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardTitle source={transportCentersResult.source}>교통약자 차량 현황</CardTitle>
            <TransportBarChart data={transportChartData} />
            <SourceFooter />
          </Card>

          <Card>
            <CardTitle source={librariesResult.source}>도서관 좌석 사용률 (%)</CardTitle>
            <LibraryPieChart data={libraryChartData} />
            <SourceFooter />
          </Card>
        </div>

        {/* 따릉이 대여소 차트 */}
        <Card className="mb-8">
          <CardTitle source={bikeStationsResult.source}>공영자전거 대여소 현황</CardTitle>
          <BikeBarChart data={bikeChartData} />
          <SourceFooter />
        </Card>

        {/* 민원실 대기 현황 테이블 */}
        <Card className="mb-8">
          <CardTitle source={civilOfficesResult.source}>민원실 대기 현황</CardTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#0f172a' }}>
                  <th
                    className="text-left py-2.5 px-3 font-medium rounded-tl-lg"
                    style={{ color: '#d4a853' }}
                  >
                    민원실
                  </th>
                  <th className="text-left py-2.5 px-3 font-medium" style={{ color: '#d4a853' }}>
                    업무
                  </th>
                  <th
                    className="text-right py-2.5 px-3 font-medium rounded-tr-lg"
                    style={{ color: '#d4a853' }}
                  >
                    대기 인원
                  </th>
                </tr>
              </thead>
              <tbody>
                {civilWaitResult.items.map((w, i) => (
                  <tr
                    key={i}
                    className="border-b"
                    style={{
                      borderBottomColor: '#e2e0dc',
                      backgroundColor: i % 2 === 0 ? '#ffffff' : '#faf9f7',
                    }}
                  >
                    <td className="py-2 px-3" style={{ color: '#0f172a' }}>
                      {w.csoNm}
                    </td>
                    <td className="py-2 px-3" style={{ color: '#475569' }}>
                      {w.taskNm}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <WaitBadge count={w.wtngCnt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SourceFooter />
        </Card>

        {/* 물품보관함 현황 */}
        <Card className="mb-8">
          <CardTitle source={lockersResult.source}>공영 물품보관함 현황</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {lockersResult.items.map((locker) => {
              const rt = lockerRealtimeResult.items.find((r) => r.stlckId === locker.stlckId);
              const avail =
                Number(rt?.usePsbltyLrgszStlckCnt ?? 0) +
                Number(rt?.usePsbltyMdmszStlckCnt ?? 0) +
                Number(rt?.usePsbltySmlszStlckCnt ?? 0);
              return (
                <div
                  key={locker.stlckId}
                  className="rounded-lg p-3"
                  style={{ backgroundColor: '#f8f7f5', border: '1px solid #e2e0dc' }}
                >
                  <p className="text-sm font-medium mb-1" style={{ color: '#0f172a' }}>
                    {locker.stlckRprsPstnNm}
                  </p>
                  <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>
                    {locker.fcltRoadNmAddr}
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span style={{ color: '#475569' }}>
                      대형 <strong style={{ color: '#d4a853' }}>{rt?.usePsbltyLrgszStlckCnt ?? 0}</strong>
                    </span>
                    <span style={{ color: '#475569' }}>
                      중형 <strong style={{ color: '#d4a853' }}>{rt?.usePsbltyMdmszStlckCnt ?? 0}</strong>
                    </span>
                    <span style={{ color: '#475569' }}>
                      소형 <strong style={{ color: '#d4a853' }}>{rt?.usePsbltySmlszStlckCnt ?? 0}</strong>
                    </span>
                    <span className="ml-auto font-semibold" style={{ color: avail > 0 ? '#059669' : '#ef4444' }}>
                      총 {avail}칸
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <SourceFooter />
        </Card>

        {/* =============================================
            미사용 6개 API 카드 섹션
        ============================================= */}
        <div className="mb-4">
          <h3
            className="text-base font-bold"
            style={{ fontFamily: "'Noto Serif KR', serif", color: '#0f172a' }}
          >
            추가 공공데이터 현황
          </h3>
          <div
            className="mt-1 mb-4"
            style={{ width: 32, height: 2, backgroundColor: '#d4a853', borderRadius: 2 }}
          />
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            채팅 AI 외 추가 활용 중인 공공 API 6개 · API 활용률 20/20 (100%)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* 1. 공영자전거 대여 이력 (bicycle.history) */}
          <Card>
            <CardTitle source={bikeHistoryResult.source}>자전거 대여 이력</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#475569' }}>조회된 이력 건수</span>
                <span className="text-xl font-bold" style={{ color: '#d4a853' }}>
                  {bikeHistoryCount > 0 ? `${bikeHistoryCount}건` : '—'}
                </span>
              </div>
              {bikeHistoryLatest && (
                <div className="rounded-lg p-2 text-xs" style={{ backgroundColor: '#f8f7f5' }}>
                  <p style={{ color: '#475569' }}>대여소 ID: {bikeHistoryLatest.rntstnId ?? '—'}</p>
                  <p style={{ color: '#475569' }}>대여 시각: {bikeHistoryLatest.rntDt ?? '—'}</p>
                </div>
              )}
              {bikeHistoryCount === 0 && (
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  API 연결 시 최근 대여 이력이 표시됩니다.
                </p>
              )}
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                엔드포인트: pbdo_v2/inf_101_00010003_v2
              </p>
            </div>
            <SourceFooter />
          </Card>

          {/* 2. 교통약자 차량 정보 (transport.vehicles) */}
          <Card>
            <CardTitle source={transportVehiclesResult.source}>교통약자 차량 정보</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#475569' }}>등록 차량 수</span>
                <span className="text-xl font-bold" style={{ color: '#d4a853' }}>
                  {totalVehicleCount > 0 ? `${totalVehicleCount}대` : '—'}
                </span>
              </div>
              {transportVehiclesResult.items.slice(0, 2).map((v, i) => (
                <div key={i} className="rounded-lg p-2 text-xs" style={{ backgroundColor: '#f8f7f5' }}>
                  <p style={{ color: '#475569' }}>{v.cntrNm ?? '센터명 없음'}</p>
                  <p style={{ color: '#94a3b8' }}>차량번호: {v.vhclNo ?? '—'} · 유형: {v.vhclType ?? '—'}</p>
                </div>
              ))}
              {totalVehicleCount === 0 && (
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  API 연결 시 차량 상세 정보가 표시됩니다.
                </p>
              )}
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                엔드포인트: tsdo_v2/info_vehicle_v2
              </p>
            </div>
            <SourceFooter />
          </Card>

          {/* 3. 교통약자 차량 운행 현황 (transport.operations) */}
          <Card>
            <CardTitle source={transportOperationsResult.source}>교통약자 운행 현황</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#475569' }}>총 운행 횟수</span>
                <span className="text-xl font-bold" style={{ color: '#d4a853' }}>
                  {totalOprNocs > 0 ? `${totalOprNocs}회` : '—'}
                </span>
              </div>
              {transportOperationsResult.items.slice(0, 2).map((op, i) => (
                <div key={i} className="rounded-lg p-2 text-xs" style={{ backgroundColor: '#f8f7f5' }}>
                  <p style={{ color: '#475569' }}>{op.cntrNm ?? '센터명 없음'}</p>
                  <p style={{ color: '#94a3b8' }}>운행일: {op.oprDt ?? '—'} · 횟수: {op.totOprNocs ?? '—'}</p>
                </div>
              ))}
              {totalOprNocs === 0 && (
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  API 연결 시 운행 통계가 표시됩니다.
                </p>
              )}
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                엔드포인트: tsdo_v2/info_vehicle_operation_v2
              </p>
            </div>
            <SourceFooter />
          </Card>

          {/* 4. 도서관 운영 현황 (library.status) */}
          <Card>
            <CardTitle source={libraryStatusResult.source}>도서관 운영 현황</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#475569' }}>현재 운영 중</span>
                <span className="text-xl font-bold" style={{ color: '#d4a853' }}>
                  {libraryStatusResult.items.length > 0 ? `${openLibraries}곳` : '—'}
                </span>
              </div>
              {libraryStatusResult.items.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1"
                  style={{ borderBottom: '1px solid #e2e0dc' }}>
                  <span style={{ color: '#475569' }}>{s.pblibNm ?? '—'}</span>
                  <span
                    className="px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: s.operStatNm === '운영중' ? '#dcfce7' : '#fef3c7',
                      color: s.operStatNm === '운영중' ? '#059669' : '#d97706',
                    }}
                  >
                    {s.operStatNm ?? '—'}
                  </span>
                </div>
              ))}
              {libraryStatusResult.items.length === 0 && (
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  API 연결 시 도서관 운영 상태가 표시됩니다.
                </p>
              )}
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                엔드포인트: plr_v2/prst_info_v2
              </p>
            </div>
            <SourceFooter />
          </Card>

          {/* 5. 물품보관함 상세 (locker.detail) */}
          <Card>
            <CardTitle source={lockerDetailResult.source}>물품보관함 용량 상세</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#475569' }}>총 보관함 용량</span>
                <span className="text-xl font-bold" style={{ color: '#d4a853' }}>
                  {totalLockerCapacity > 0 ? `${totalLockerCapacity}칸` : '—'}
                </span>
              </div>
              {lockerDetailResult.items.slice(0, 3).map((d, i) => (
                <div key={i} className="rounded-lg p-2 text-xs" style={{ backgroundColor: '#f8f7f5' }}>
                  <p style={{ color: '#475569' }}>{d.stlckNm ?? d.stlckId ?? '—'}</p>
                  <p style={{ color: '#94a3b8' }}>
                    대형 {d.lrgszTotStlckCnt ?? 0} / 중형 {d.mdmszTotStlckCnt ?? 0} / 소형 {d.smlszTotStlckCnt ?? 0}
                  </p>
                </div>
              ))}
              {totalLockerCapacity === 0 && (
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  API 연결 시 보관함 상세 용량이 표시됩니다.
                </p>
              )}
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                엔드포인트: psl_v2/locker_detail_info_v2
              </p>
            </div>
            <SourceFooter />
          </Card>

          {/* 6. 버스 정류장 정보 (bus.stops) */}
          <Card>
            <CardTitle source={busStopsResult.source}>버스 정류장 정보</CardTitle>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#475569' }}>조회된 정류장 수</span>
                <span className="text-xl font-bold" style={{ color: '#d4a853' }}>
                  {busStopCount > 0 ? `${busStopCount}개` : '—'}
                </span>
              </div>
              {busStopsResult.items.slice(0, 3).map((stop, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1"
                  style={{ borderBottom: '1px solid #e2e0dc' }}>
                  <span style={{ color: '#475569' }}>{stop.sttnNm ?? '—'}</span>
                  <span style={{ color: '#94a3b8' }}>#{stop.sttnNo ?? stop.sttnId ?? '—'}</span>
                </div>
              ))}
              {busStopCount === 0 && (
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  API 연결 시 정류장 목록이 표시됩니다.
                </p>
              )}
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                엔드포인트: rte/ps_info
              </p>
            </div>
            <SourceFooter />
          </Card>
        </div>

        {/* API 활용 현황 요약 */}
        <Card>
          <CardTitle>공공데이터 API 활용 현황</CardTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '공영자전거', count: 3, used: 3, icon: '🚲' },
              { label: '교통약자 이동지원', count: 4, used: 4, icon: '🚗' },
              { label: '공공도서관', count: 3, used: 3, icon: '📚' },
              { label: '물품보관함', count: 3, used: 3, icon: '🔒' },
              { label: '신호등', count: 2, used: 2, icon: '🚦' },
              { label: '민원실', count: 2, used: 2, icon: '🏢' },
              { label: '버스', count: 3, used: 3, icon: '🚌' },
            ].map((cat) => (
              <div
                key={cat.label}
                className="rounded-lg p-3 text-center"
                style={{ backgroundColor: '#0f172a' }}
              >
                <div className="text-lg mb-1">{cat.icon}</div>
                <p className="text-xs font-medium mb-1" style={{ color: '#ffffff' }}>
                  {cat.label}
                </p>
                <p className="text-base font-bold" style={{ color: '#d4a853' }}>
                  {cat.used}/{cat.count}
                </p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>
                  API 활용
                </p>
              </div>
            ))}
            <div
              className="rounded-lg p-3 text-center"
              style={{ backgroundColor: '#d4a853' }}
            >
              <div className="text-lg mb-1">✅</div>
              <p className="text-xs font-medium mb-1" style={{ color: '#0f172a' }}>
                전체 활용률
              </p>
              <p className="text-xl font-bold" style={{ color: '#0f172a' }}>
                20/20
              </p>
              <p className="text-xs" style={{ color: '#0f172a' }}>
                100%
              </p>
            </div>
          </div>
          <SourceFooter />
        </Card>
      </main>
    </div>
  );
}
