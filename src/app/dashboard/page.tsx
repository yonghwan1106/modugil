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
  MOCK_TRAFFIC_LIGHTS,
} from '@/lib/api/mock-data';
import Header from '@/components/ui/Header';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function DashboardPage() {
  // --- 요약 카드 계산 ---
  const totalTransportCenters = MOCK_TRANSPORT_CENTERS.length;

  const avgLibraryUsage = useMemo(() => {
    const total = MOCK_LIBRARY_SEATS.reduce((sum, s) => sum + s.useSeatCnt, 0);
    const cap = MOCK_LIBRARY_SEATS.reduce((sum, s) => sum + s.totSeatCnt, 0);
    return cap > 0 ? Math.round((total / cap) * 100) : 0;
  }, []);

  const avgCivilWait = useMemo(() => {
    if (MOCK_CIVIL_WAIT.length === 0) return 0;
    const total = MOCK_CIVIL_WAIT.reduce((sum, w) => sum + w.wtngCnt, 0);
    return Math.round(total / MOCK_CIVIL_OFFICES.length);
  }, []);

  const totalTrafficLights = MOCK_TRAFFIC_LIGHTS.length;

  // --- 교통약자 차량 현황 차트 데이터 ---
  const transportChartData = useMemo(() => {
    return MOCK_TRANSPORT_CENTERS.map((center) => {
      const avail = MOCK_TRANSPORT_AVAILABILITY.find((a) => a.centerId === center.centerId);
      // 센터명 줄이기 (차트 가독성)
      const shortName = center.centerNm.replace('교통약자 이동지원센터', '').replace('서울시 ', '').trim();
      return {
        name: shortName,
        운영차량: avail?.operVhcleCnt ?? 0,
        가용차량: avail?.usePsbltVhcleCnt ?? 0,
      };
    });
  }, []);

  // --- 도서관 좌석 사용률 차트 데이터 ---
  const libraryChartData = useMemo(() => {
    return MOCK_LIBRARIES.map((lib) => {
      const seats = MOCK_LIBRARY_SEATS.filter((s) => s.lbrryId === lib.lbrryId);
      const total = seats.reduce((sum, s) => sum + s.totSeatCnt, 0);
      const used = seats.reduce((sum, s) => sum + s.useSeatCnt, 0);
      const rate = total > 0 ? Math.round((used / total) * 100) : 0;
      const shortName = lib.lbrryNm.replace('도서관', '관').replace('서울', 'S.');
      return { name: shortName, value: rate };
    });
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">실시간 현황 대시보드</h2>

        {/* 요약 카드 4개 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            title="교통약자 이동지원 센터"
            value={`${totalTransportCenters}개소`}
            sub="운영중"
            color="blue"
            icon="🚗"
          />
          <SummaryCard
            title="공공도서관"
            value={`${MOCK_LIBRARIES.length}개소`}
            sub={`평균 좌석 사용률 ${avgLibraryUsage}%`}
            color="green"
            icon="📚"
          />
          <SummaryCard
            title="민원실"
            value={`${MOCK_CIVIL_OFFICES.length}개소`}
            sub={`평균 대기 ${avgCivilWait}명`}
            color="amber"
            icon="🏢"
          />
          <SummaryCard
            title="실시간 신호등"
            value={`${totalTrafficLights}개`}
            sub="교차로 모니터링"
            color="purple"
            icon="🚦"
          />
        </div>

        {/* 차트 2개 나란히 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 교통약자 차량 현황 BarChart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">교통약자 차량 현황</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={transportChartData} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="운영차량" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="가용차량" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 도서관 좌석 사용률 PieChart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">도서관 좌석 사용률 (%)</h3>
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
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-700">
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

        {/* 민원실 대기 현황 테이블 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">민원실 실시간 대기 현황</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">민원실</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">업무</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">대기 인원</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_CIVIL_WAIT.map((w, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 px-3 text-gray-800">{w.csoNm}</td>
                    <td className="py-2 px-3 text-gray-600">{w.taskNm}</td>
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

type CardColor = 'blue' | 'green' | 'amber' | 'purple';

const colorMap: Record<CardColor, { bg: string; text: string; border: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
};

function SummaryCard({
  title,
  value,
  sub,
  color,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  color: CardColor;
  icon: string;
}) {
  const c = colorMap[color];
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-xs text-gray-600 font-medium">{title}</span>
      </div>
      <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
}

function WaitBadge({ count }: { count: number }) {
  const colorClass =
    count >= 10
      ? 'bg-red-100 text-red-700'
      : count >= 5
        ? 'bg-amber-100 text-amber-700'
        : 'bg-green-100 text-green-700';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
      {count}명
    </span>
  );
}
