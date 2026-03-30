'use client';

import { useState } from 'react';
import Header from '@/components/ui/Header';
import NaverMap from '@/components/map/NaverMap';
import ChatPanel from '@/components/chat/ChatPanel';

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
    results.forEach((result) => {
      if (
        result &&
        typeof result === 'object' &&
        'lat' in result &&
        'lng' in result &&
        'id' in result &&
        'type' in result &&
        'title' in result
      ) {
        newMarkers.push(result as MapMarker);
      }
    });
    if (newMarkers.length > 0) {
      setMarkers((prev) => [...prev, ...newMarkers]);
    }
  };

  // selectedMarker는 향후 상세 패널 등에서 사용 예정
  void selectedMarker;

  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* 지도 영역 (70%) */}
        <div className="flex-1 relative">
          <NaverMap markers={markers} onMarkerClick={setSelectedMarker} />
        </div>
        {/* 챗봇 패널 (30%, min 360px) */}
        <div className="w-[400px] min-w-[360px] border-l border-gray-200 flex flex-col">
          <ChatPanel onToolResults={handleToolResults} />
        </div>
      </div>
    </div>
  );
}
