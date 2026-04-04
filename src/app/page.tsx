'use client';

import { useState } from 'react';
import Header from '@/components/ui/Header';
import NaverMap from '@/components/map/NaverMap';
import ChatPanel from '@/components/chat/ChatPanel';
import TrafficLightDetail from '@/components/map/TrafficLightDetail';

// MapMarker 타입 정의
export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: 'transport' | 'bus' | 'trafficLight' | 'library' | 'civil' | 'bicycle' | 'locker';
  title: string;
  info?: Record<string, unknown>;
}

const USER_TYPES = [
  { key: '휠체어', label: '휠체어 사용자', icon: '♿' },
  { key: '시각장애', label: '시각장애인', icon: '👁️' },
  { key: '고령자', label: '고령자', icon: '👴' },
  { key: '임산부', label: '임산부/보호자', icon: '🤰' },
] as const;

type UserTypeKey = (typeof USER_TYPES)[number]['key'];

export default function Home() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [showLanding, setShowLanding] = useState(true);
  const [userType, setUserType] = useState<UserTypeKey | null>(null);

  const handleToolResults = (results: unknown[]) => {
    // AI 챗봇의 tool 결과에서 위치 데이터를 추출하여 지도 마커에 추가
    const newMarkers: MapMarker[] = [];

    const toolTypeMap: Record<string, MapMarker['type']> = {
      get_accessible_transport: 'transport',
      get_traffic_light_status: 'trafficLight',
      get_bus_realtime_location: 'bus',
      get_library_seats: 'library',
      get_civil_office_wait: 'civil',
      get_locker_availability: 'locker',
      get_bicycle_availability: 'bicycle',
    };

    results.forEach((result) => {
      if (!result || typeof result !== 'object') return;
      const r = result as Record<string, unknown>;
      const toolName = typeof r.toolName === 'string' ? r.toolName : '';
      const type = toolTypeMap[toolName] || 'transport';
      const output = r.output && typeof r.output === 'object' ? (r.output as Record<string, unknown>) : {};
      const items = Array.isArray(output.items) ? output.items : [];

      items.forEach((item: unknown, index: number) => {
        if (!item || typeof item !== 'object') return;
        const it = item as Record<string, unknown>;
        const lat = it.lat ?? it.latitude;
        const lng = it.lng ?? it.lot ?? it.longitude;
        if (lat == null || lng == null) return;

        const id = [
          'centerId', 'crossroadId', 'libraryId', 'officeId', 'routeId', 'lockerId', 'stationId',
        ].reduce<string | undefined>((found, key) => found ?? (it[key] != null ? String(it[key]) : undefined), undefined) ?? String(index);

        const title = [
          'centerName', 'crossroadName', 'libraryName', 'officeName', 'routeNo', 'lockerName', 'stationName',
        ].reduce<string | undefined>((found, key) => found ?? (it[key] != null ? String(it[key]) : undefined), undefined) ?? '위치';

        newMarkers.push({
          id: `${toolName}-${id}`,
          lat: Number(lat),
          lng: Number(lng),
          type,
          title,
          info: it as Record<string, unknown>,
        });
      });
    });

    if (newMarkers.length > 0) {
      setMarkers(newMarkers);
    }
  };

  const handleSelectUserType = (key: UserTypeKey) => {
    setUserType(key);
    setShowLanding(false);
  };

  if (showLanding) {
    return (
      <div
        className="h-screen w-full overflow-hidden flex flex-col items-center justify-center px-4 py-6"
        style={{ backgroundColor: '#0f172a' }}
      >
        {/* 상단 배지 */}
        <div
          className="mb-4 px-3 py-1 rounded-full text-xs font-medium tracking-wide"
          style={{ backgroundColor: 'rgba(212,168,83,0.15)', color: '#d4a853', border: '1px solid rgba(212,168,83,0.3)' }}
        >
          2026 전국 통합데이터 활용 공모전
        </div>

        {/* 메인 타이틀 */}
        <h1
          className="font-serif text-center mb-1"
          style={{ color: '#faf9f7', fontSize: 'clamp(2.5rem, 7vw, 4rem)', fontFamily: "'Noto Serif KR', serif", letterSpacing: '-0.02em' }}
        >
          모두의 길
        </h1>
        <p className="text-center mb-5" style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
          AI 기반 교통약자 통합 이동지원 서비스
        </p>

        {/* stat 카드 3개 */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-lg mb-5">
          {[
            { value: '1,500만 명', label: '교통약자 인구 (29%)' },
            { value: '7개 이상', label: '분산된 이동 정보 시스템' },
            { value: '30분+', label: '평균 이동지원 대기시간' },
          ].map((s) => (
            <div
              key={s.value}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
            >
              <div className="font-semibold text-sm" style={{ color: '#d4a853' }}>{s.value}</div>
              <div className="mt-0.5" style={{ color: '#94a3b8', fontSize: '10px', lineHeight: '1.3' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 한 줄 요약 */}
        <p className="text-center text-sm mb-4" style={{ color: '#cbd5e1' }}>
          7종 공공데이터 × AI = <span style={{ color: '#d4a853' }}>하나의 질문, 모든 이동 정보</span>
        </p>

        {/* 7종 데이터 아이콘 그리드 */}
        <div className="grid grid-cols-7 gap-2 w-full max-w-lg mb-5">
          {[
            { icon: '🚲', label: '자전거' },
            { icon: '🚐', label: '교통약자차량' },
            { icon: '📚', label: '도서관' },
            { icon: '🗄️', label: '보관함' },
            { icon: '🚦', label: '신호등' },
            { icon: '🏛️', label: '민원실' },
            { icon: '🚌', label: '버스' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              <span style={{ color: '#64748b', fontSize: '9px', textAlign: 'center', lineHeight: '1.2' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* 사용자 유형 선택 */}
        <p className="text-center text-xs mb-3" style={{ color: '#94a3b8' }}>나의 유형을 선택하면 맞춤 안내를 받을 수 있어요</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-lg mb-5">
          {USER_TYPES.map((ut) => (
            <button
              key={ut.key}
              onClick={() => handleSelectUserType(ut.key)}
              className="flex flex-col items-center gap-2 rounded-xl py-4 px-3 font-medium text-sm transition-all duration-200"
              style={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#e2e8f0' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d4a853';
                e.currentTarget.style.backgroundColor = 'rgba(212,168,83,0.12)';
                e.currentTarget.style.color = '#d4a853';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.backgroundColor = '#1e293b';
                e.currentTarget.style.color = '#e2e8f0';
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{ut.icon}</span>
              <span>{ut.label}</span>
            </button>
          ))}
        </div>

        {/* 하단 링크 */}
        <div className="flex gap-4 text-xs" style={{ color: '#475569' }}>
          <span>modugil.vercel.app</span>
          <span>·</span>
          <a
            href="https://github.com/yonghwan1106/modugil"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#475569' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#d4a853'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#475569'; }}
          >
            GitHub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col bg-[#faf9f7]"
      style={{ animation: 'fadeIn 0.4s ease' }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <Header />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 지도 영역 (데스크톱 70%, 모바일 50vh) */}
        <div className="flex-1 relative h-[50vh] md:h-auto">
          <NaverMap markers={markers} onMarkerClick={setSelectedMarker} />
          {selectedMarker?.type === 'trafficLight' && selectedMarker.info && (
            <div className="absolute top-4 right-4 z-10">
              <TrafficLightDetail
                crossroadName={selectedMarker.title}
                directions={
                  (selectedMarker.info.directions as Array<{
                    direction: string;
                    remainSeconds: number;
                    signal: string;
                  }>) || []
                }
                onClose={() => setSelectedMarker(null)}
              />
            </div>
          )}
        </div>
        {/* 구분선 */}
        <div
          className="hidden md:block w-px self-stretch"
          style={{ background: 'linear-gradient(to bottom, #0f172a, #d4a853, #0f172a)' }}
        />
        <div
          className="md:hidden h-px w-full"
          style={{ background: 'linear-gradient(to right, #0f172a, #d4a853, #0f172a)' }}
        />
        {/* 챗봇 패널 (데스크톱 30%/min 360px, 모바일 full/50vh) */}
        <div className="w-full md:w-[400px] md:min-w-[360px] h-[50vh] md:h-auto flex flex-col">
          <ChatPanel onToolResults={handleToolResults} userType={userType ?? undefined} />
        </div>
      </div>
    </div>
  );
}
