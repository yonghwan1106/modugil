'use client';

import { useEffect, useRef } from 'react';
import { MapMarker } from '@/app/page';

declare global {
  interface Window {
    kakao: any;
  }
}

interface KakaoMapProps {
  markers: MapMarker[];
  onMarkerClick?: (marker: MapMarker) => void;
}

const MARKER_COLORS: Record<MapMarker['type'], string> = {
  transport: '#dc2626',    // 빨강 - 교통약자
  bus: '#16a34a',          // 초록 - 버스
  trafficLight: '#f59e0b', // 노랑 - 신호등
  library: '#2563eb',      // 파랑 - 도서관
  civil: '#7c3aed',        // 보라 - 민원실
  bicycle: '#0891b2',      // 청록 - 자전거
  locker: '#9d174d',       // 진한 핑크 - 보관함
};

const SEOUL_CITY_HALL = { lat: 37.5665, lng: 126.9780 };
const DEFAULT_ZOOM = 14;

export default function KakaoMap({ markers, onMarkerClick }: KakaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const kakaoMarkersRef = useRef<any[]>([]);

  // 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = () => {
      if (!window.kakao?.maps) return;

      window.kakao.maps.load(() => {
        if (!mapContainerRef.current) return;

        const options = {
          center: new window.kakao.maps.LatLng(SEOUL_CITY_HALL.lat, SEOUL_CITY_HALL.lng),
          level: DEFAULT_ZOOM,
        };

        mapInstanceRef.current = new window.kakao.maps.Map(mapContainerRef.current, options);
      });
    };

    if (window.kakao?.maps) {
      initMap();
    } else {
      // SDK 로드 완료 대기
      const interval = setInterval(() => {
        if (window.kakao?.maps) {
          clearInterval(interval);
          initMap();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  // 마커 업데이트
  useEffect(() => {
    if (!mapInstanceRef.current || !window.kakao?.maps) return;

    // 기존 마커 제거
    kakaoMarkersRef.current.forEach((m) => m.setMap(null));
    kakaoMarkersRef.current = [];

    // 새 마커 생성
    markers.forEach((marker) => {
      const color = MARKER_COLORS[marker.type] ?? '#2563eb';

      const markerImage = new window.kakao.maps.MarkerImage(
        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
          `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20s12-11 12-20C24 5.373 18.627 0 12 0z" fill="${color}"/>
            <circle cx="12" cy="12" r="5" fill="white"/>
          </svg>`
        )}`,
        new window.kakao.maps.Size(24, 32),
        { offset: new window.kakao.maps.Point(12, 32) }
      );

      const kakaoMarker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(marker.lat, marker.lng),
        map: mapInstanceRef.current,
        title: marker.title,
        image: markerImage,
      });

      if (onMarkerClick) {
        window.kakao.maps.event.addListener(kakaoMarker, 'click', () => {
          onMarkerClick(marker);
        });
      }

      kakaoMarkersRef.current.push(kakaoMarker);
    });
  }, [markers, onMarkerClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* 범례 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-md p-3 text-xs space-y-1.5 border border-gray-100">
        <p className="font-semibold text-gray-700 mb-1">마커 범례</p>
        {(Object.entries(MARKER_COLORS) as [MapMarker['type'], string][]).map(([type, color]) => {
          const labels: Record<MapMarker['type'], string> = {
            transport: '교통약자',
            bus: '버스',
            trafficLight: '신호등',
            library: '도서관',
            civil: '민원실',
            bicycle: '자전거',
            locker: '보관함',
          };
          return (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-gray-600">{labels[type]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
