'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  MOCK_TRANSPORT_CENTERS,
  MOCK_TRANSPORT_AVAILABILITY,
  MOCK_LIBRARIES,
  MOCK_LIBRARY_SEATS,
  MOCK_CIVIL_OFFICES,
  MOCK_CIVIL_WAIT,
  MOCK_BIKE_STATIONS,
  MOCK_BIKE_AVAILABILITY,
} from '@/lib/api/mock-data';
import Header from '@/components/ui/Header';

const PIE_COLORS = ['#0f172a', '#d4a853', '#334155', '#1e293b', '#b8922f', '#64748b', '#059669'];

export default function DashboardPage() {
  // --- 요약 카드 계산 ---
  const totalTransportCenters = MOCK_TRANSPORT_CENTERS.length;

  const avgLibraryUsage = useMemo(() => {
    const total = MOCK_LIBRARY_SEATS.reduce((sum, s) => sum + Number(s.useSeatCnt), 0);
    const cap = MOCK_LIBRARY_SEATS.reduce((sum, s) => sum + Number(s.tseatCnt), 0);
    return cap > 0 ? Math.round((total / cap) * 100) : 0;
  }, []);

  const avgCivilWait = useMemo(() => {
    if (MOCK_CIVIL_WAIT.length === 0) return 0;
    const total = MOCK_CIVIL_WAIT.reduce((sum, w) => sum + w.wtngCnt, 0);
    return Math.round(total / MOCK_CIVIL_OFFICES.length);
  }, []);

  const totalAvailableBikes = useMemo(() => {
    return MOCK_BIKE_AVAILABILITY.reduce((sum, a) => sum + a.rntNocs, 0);
  }, []);

  // --- 자전거 대여소 현황 차트 데이터 ---
  const bikeChartData = useMemo(() => {
    return MOCK_BIKE_STATIONS.map((station) => {
      const avail = MOCK_BIKE_AVAILABILITY.find((a) => a.rntstnId === station.rntstnId);
      const shortName = station.rntstnNm.replace(/^\d+\.\s*/, '').slice(0, 10);
      return {
        name: shortName,
        거치대: avail?.bcyclTpkctNocs ?? 0,
        대여가능: avail?.rntNocs ?? 0,
        반납가능: avail?.rtnNocs ?? 0,
      };
    });
  }, []);

  // --- 교통약자 차량 현황 차트 데이터 ---
  const transportChartData = useMemo(() => {
    return MOCK_TRANSPORT_CENTERS.map((center) => {
      const avail = MOCK_TRANSPORT_AVAILABILITY.find((a) => a.cntrId === center.cntrId);
      // 센터명 줄이기 (차트 가독성)
      const shortName = center.cntrNm.replace('교통약자 이동지원센터', '').replace('서울시 ', '').trim();
      return {
        name: shortName,
        운영차량: Number(avail?.oprVhclCntom ?? 0),
        가용차량: Number(avail?.avlVhclCntom ?? 0),
      };
    });
  }, []);

  // --- 도서관 좌석 사용률 차트 데이터 ---
  const libraryChartData = useMemo(() => {
    return MOCK_LIBRARIES.map((lib) => {
      const seats = MOCK_LIBRARY_SEATS.filter((s) => s.pblibId === lib.pblibId);
      const total = seats.reduce((sum, s) => sum + Number(s.tseatCnt), 0);
      const used = seats.reduce((sum, s) => sum + Number(s.useSeatCnt), 0);
      const rate = total > 0 ? Math.round((used / total) * 100) : 0;
      const shortName = lib.pblibNm.replace('도서관', '관').replace('서울', 'S.');
      return { name: shortName, value: rate };
    });
  }, []);

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#faf9f7' }}>
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        {/* Page title with gold underline accent */}
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
            서울시 공공서비스 데이터 시각화 (샘플 데이터 기반)
          </p>
        </div>

        {/* 요약 카드 4개 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="교통약자 이동지원 센터"
            value={`${totalTransportCenters}개소`}
            sub="운영중"
            icon="🚗"
          />
          <SummaryCard
            title="공공도서관"
            value={`${MOCK_LIBRARIES.length}개소`}
            sub={`평균 좌석 사용률 ${avgLibraryUsage}%`}
            icon="📚"
          />
          <SummaryCard
            title="민원실"
            value={`${MOCK_CIVIL_OFFICES.length}개소`}
            sub={`평균 대기 ${avgCivilWait}명`}
            icon="🏢"
          />
          <SummaryCard
            title="공영자전거"
            value={`${totalAvailableBikes}대`}
            sub="대여 가능"
            icon="🚲"
          />
        </div>

        {/* 차트 2개 나란히 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 교통약자 차량 현황 BarChart */}
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e0dc',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
            }}
          >
            <h3
              className="font-semibold mb-4"
              style={{
                fontFamily: "'Noto Serif KR', serif",
                color: '#0f172a',
                paddingLeft: 12,
                borderLeft: '4px solid #d4a853',
              }}
            >
              교통약자 차량 현황
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={transportChartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="운영차량" fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="가용차량" fill="#d4a853" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 도서관 좌석 사용률 PieChart */}
          <div
            className="rounded-xl p-5"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e0dc',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
            }}
          >
            <h3
              className="font-semibold mb-4"
              style={{
                fontFamily: "'Noto Serif KR', serif",
                color: '#0f172a',
                paddingLeft: 12,
                borderLeft: '4px solid #d4a853',
              }}
            >
              도서관 좌석 사용률 (%)
            </h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie
                    data={libraryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {libraryChartData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-1.5">
                {libraryChartData.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs" style={{ color: '#334155' }}>
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="truncate">{item.name}</span>
                    <span className="ml-auto font-medium">{item.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 공영자전거 대여소 현황 BarChart */}
        <div
          className="rounded-xl p-5 mb-8"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e0dc',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
          }}
        >
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
              공영자전거 대여소 현황
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: '#059669', color: '#ffffff' }}
            >
              샘플
            </span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bikeChartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e0dc" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="거치대" fill="#1e293b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="대여가능" fill="#d4a853" radius={[4, 4, 0, 0]} />
              <Bar dataKey="반납가능" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 민원실 대기 현황 테이블 */}
        <div
          className="rounded-xl p-5"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e0dc',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
          }}
        >
          <h3
            className="font-semibold mb-4"
            style={{
              fontFamily: "'Noto Serif KR', serif",
              color: '#0f172a',
              paddingLeft: 12,
              borderLeft: '4px solid #d4a853',
            }}
          >
            민원실 대기 현황 (샘플)
          </h3>
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
                {MOCK_CIVIL_WAIT.map((w, i) => (
                  <tr
                    key={i}
                    className="border-b transition-colors"
                    style={{
                      borderBottomColor: '#e2e0dc',
                      backgroundColor: i % 2 === 0 ? '#ffffff' : '#faf9f7',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f5e6c8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#ffffff' : '#faf9f7';
                    }}
                  >
                    <td className="py-2 px-3" style={{ color: '#0f172a' }}>{w.csoNm}</td>
                    <td className="py-2 px-3" style={{ color: '#475569' }}>{w.taskNm}</td>
                    <td className="py-2 px-3 text-right">
                      <WaitBadge count={w.wtngCnt} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- 서브 컴포넌트 ---

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
          style={{ backgroundColor: 'rgba(212, 168, 83, 0.2)', border: '1px solid rgba(212, 168, 83, 0.4)' }}
        >
          {icon}
        </span>
        <span className="text-xs font-medium" style={{ color: '#ffffff' }}>{title}</span>
      </div>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: "'Noto Serif KR', serif", color: '#d4a853' }}
      >
        {value}
      </p>
      <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{sub}</p>
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
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
      style={style}
    >
      {count}명
    </span>
  );
}
