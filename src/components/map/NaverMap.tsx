'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MapMarker } from '@/app/page';

declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapProps {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
}

const MARKER_COLORS: Record<MapMarker['type'], string> = {
  transport: '#dc2626',
  bus: '#16a34a',
  trafficLight: '#f59e0b',
  library: '#2563eb',
  civil: '#7c3aed',
  bicycle: '#0891b2',
  locker: '#9d174d',
};

const MARKER_LABELS: Record<MapMarker['type'], string> = {
  transport: '교통약자',
  bus: '버스',
  trafficLight: '신호등',
  library: '도서관',
  civil: '민원실',
  bicycle: '자전거',
  locker: '보관함',
};

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.9780 };

function createMarkerIcon(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
    <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0z" fill="${color}"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`;
}

export default function NaverMap({ markers, onMarkerClick }: NaverMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const naverMarkersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  const initMap = useCallback(() => {
    if (!mapContainerRef.current || !window.naver?.maps) return;

    const map = new window.naver.maps.Map(mapContainerRef.current, {
      center: new window.naver.maps.LatLng(SEOUL_CITY_HALL.lat, SEOUL_CITY_HALL.lng),
      zoom: 13,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT,
      },
    });

    mapInstanceRef.current = map;
    infoWindowRef.current = new window.naver.maps.InfoWindow({
      anchorSkew: true,
      borderWidth: 0,
      backgroundColor: 'transparent',
      disableAnchor: false,
      pixelOffset: new window.naver.maps.Point(0, -8),
    });
  }, []);

  useEffect(() => {
    if (window.naver?.maps) {
      initMap();
    } else {
      const interval = setInterval(() => {
        if (window.naver?.maps) {
          clearInterval(interval);
          initMap();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, [initMap]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.naver?.maps) return;

    naverMarkersRef.current.forEach((m) => m.setMap(null));
    naverMarkersRef.current = [];

    markers.forEach((marker) => {
      const color = MARKER_COLORS[marker.type] ?? '#2563eb';

      const naverMarker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(marker.lat, marker.lng),
        map,
        title: marker.title,
        icon: {
          content: `<div style="cursor:pointer;">${createMarkerIcon(color)}</div>`,
          size: new window.naver.maps.Size(24, 32),
          anchor: new window.naver.maps.Point(12, 32),
        },
      });

      window.naver.maps.Event.addListener(naverMarker, 'click', () => {
        const infoContent = `
          <div style="padding:10px 14px;background:white;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,0.15);min-width:160px;font-family:Pretendard,sans-serif;">
            <p style="font-size:13px;font-weight:600;color:#1e293b;margin:0 0 4px;">${marker.title}</p>
            <span style="display:inline-block;font-size:11px;color:white;background:${color};padding:2px 8px;border-radius:20px;">${MARKER_LABELS[marker.type]}</span>
            ${marker.info ? `<p style="font-size:12px;color:#64748b;margin:6px 0 0;">${Object.entries(marker.info).filter(([k]) => !['info','lat','lot','lng','type'].includes(k)).slice(0, 6).map(([k, v]) => `${k}: ${typeof v === 'object' && v !== null ? Object.entries(v as Record<string,unknown>).map(([k2,v2]) => `${k2}=${v2}`).join(', ') : v}`).join('<br/>')}</p>` : ''}
          </div>`;

        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(map, naverMarker);
        }

        onMarkerClick?.(marker);
      });

      naverMarkersRef.current.push(naverMarker);
    });

    if (markers.length > 0) {
      const bounds = new window.naver.maps.LatLngBounds(
        new window.naver.maps.LatLng(
          Math.min(...markers.map((m) => m.lat)),
          Math.min(...markers.map((m) => m.lng))
        ),
        new window.naver.maps.LatLng(
          Math.max(...markers.map((m) => m.lat)),
          Math.max(...markers.map((m) => m.lng))
        )
      );
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [markers, onMarkerClick]);

  return (
    <div className="relative w-full h-full">
      {/* 스크린리더용 마커 요약 */}
      <div className="sr-only">
        이 지도는 {markers.length}개의 위치를 표시합니다
        {markers.length > 0 && (
          <>: {markers.map((m) => `${MARKER_LABELS[m.type]} — ${m.title}`).join(', ')}</>
        )}
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-full"
        role="application"
        aria-label="네이버 지도 — 키보드 방향키로 탐색 가능"
      />
      <div
        className="absolute bottom-4 left-4 rounded-xl p-3 text-xs space-y-1.5"
        style={{
          background: 'rgba(15,23,42,0.85)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(212,168,83,0.3)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}
      >
        <p className="font-semibold mb-1" style={{ color: '#d4a853' }}>마커 범례</p>
        {(Object.entries(MARKER_COLORS) as [MapMarker['type'], string][]).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }} />
            <span style={{ color: '#faf9f7' }}>{MARKER_LABELS[type]}</span>
          </div>
        ))}
      </div>

      {/* 키보드 사용자용 마커 접근 버튼 목록 (sr-only, 포커스 시 노출) */}
      {markers.length > 0 && (
        <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:bottom-4 focus-within:right-4 focus-within:z-10 focus-within:max-h-48 focus-within:overflow-y-auto focus-within:rounded-xl focus-within:p-3 focus-within:space-y-1" style={{ backgroundColor: 'rgba(15,23,42,0.92)', border: '1px solid rgba(212,168,83,0.4)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: '#d4a853' }}>마커 목록 (키보드 접근)</p>
          {markers.map((marker) => (
            <button
              key={`kb-marker-${marker.title}-${marker.lat}-${marker.lng}`}
              type="button"
              aria-label={`마커 선택: ${marker.title} (${MARKER_LABELS[marker.type]})`}
              onClick={() => onMarkerClick?.(marker)}
              className="block w-full text-left text-xs px-2 py-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d4a853]"
              style={{ color: '#faf9f7', backgroundColor: 'transparent' }}
            >
              {MARKER_LABELS[marker.type]} — {marker.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
