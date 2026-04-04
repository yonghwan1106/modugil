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

export default function Home() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

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
      setMarkers((prev) => [...prev, ...newMarkers]);
    }
  };

  return (
    <div className="h-full flex flex-col">
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
        {/* 챗봇 패널 (데스크톱 30%/min 360px, 모바일 full/50vh) */}
        <div className="w-full md:w-[400px] md:min-w-[360px] h-[50vh] md:h-auto border-t md:border-t-0 md:border-l border-gray-200 flex flex-col">
          <ChatPanel onToolResults={handleToolResults} />
        </div>
      </div>
    </div>
  );
}
