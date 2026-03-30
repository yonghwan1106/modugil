// =============================================
// 동적 API 라우트 - 7종 공공데이터 API 통합
// GET /api/data/[category]?sub=info&stdgCd=11
// =============================================

import type { NextRequest } from 'next/server';
import { fetchPublicData } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import * as mockData from '@/lib/api/mock-data';

type RouteContext = { params: Promise<{ category: string }> };

// ----------------------
// 엔드포인트 매핑
// ----------------------

function getEndpoint(category: string, sub: string): string | null {
  switch (category) {
    case 'bicycle':
      if (sub === 'availability') return ENDPOINTS.bicycle.availability;
      if (sub === 'history')      return ENDPOINTS.bicycle.history;
      return ENDPOINTS.bicycle.stations;

    case 'transport':
      if (sub === 'vehicles')      return ENDPOINTS.transport.vehicles;
      if (sub === 'operations')    return ENDPOINTS.transport.operations;
      if (sub === 'availability')  return ENDPOINTS.transport.availability;
      return ENDPOINTS.transport.centers;

    case 'library':
      if (sub === 'status') return ENDPOINTS.library.status;
      if (sub === 'seats')  return ENDPOINTS.library.seats;
      return ENDPOINTS.library.info;

    case 'locker':
      if (sub === 'detail')   return ENDPOINTS.locker.detail;
      if (sub === 'realtime') return ENDPOINTS.locker.realtime;
      return ENDPOINTS.locker.info;

    case 'trafficLight':
      if (sub === 'status') return ENDPOINTS.trafficLight.status;
      return ENDPOINTS.trafficLight.crossroads;

    case 'civil':
      if (sub === 'realtime') return ENDPOINTS.civil.realtime;
      return ENDPOINTS.civil.info;

    case 'bus':
      if (sub === 'stops')     return ENDPOINTS.bus.stops;
      if (sub === 'locations') return ENDPOINTS.bus.locations;
      return ENDPOINTS.bus.routes;

    default:
      return null;
  }
}

// ----------------------
// Mock 데이터 매핑
// ----------------------

function getMockData(category: string, sub: string): unknown[] {
  switch (category) {
    case 'bicycle':
      // 자전거는 실제 API가 작동하므로 Mock이 호출될 일 없으나 대비
      return [];

    case 'transport':
      if (sub === 'availability') return mockData.MOCK_TRANSPORT_AVAILABILITY;
      return mockData.MOCK_TRANSPORT_CENTERS;

    case 'library':
      if (sub === 'seats') return mockData.MOCK_LIBRARY_SEATS;
      return mockData.MOCK_LIBRARIES;

    case 'locker':
      if (sub === 'realtime') return mockData.MOCK_LOCKER_REALTIME;
      return mockData.MOCK_LOCKERS;

    case 'trafficLight':
      if (sub === 'status') return mockData.MOCK_TRAFFIC_LIGHT_STATUS;
      return mockData.MOCK_TRAFFIC_LIGHTS;

    case 'civil':
      if (sub === 'realtime') return mockData.MOCK_CIVIL_WAIT;
      return mockData.MOCK_CIVIL_OFFICES;

    case 'bus':
      if (sub === 'locations') return mockData.MOCK_BUS_LOCATIONS;
      return mockData.MOCK_BUS_ROUTES;

    default:
      return [];
  }
}

// ----------------------
// Route Handler
// ----------------------

export async function GET(request: NextRequest, ctx: RouteContext) {
  const { category } = await ctx.params;
  const { searchParams } = request.nextUrl;
  const sub = searchParams.get('sub') ?? 'info';
  const stdgCd = searchParams.get('stdgCd') ?? '';

  const endpoint = getEndpoint(category, sub);
  if (!endpoint) {
    return Response.json({ error: `Invalid category or sub: ${category}/${sub}` }, { status: 400 });
  }

  // 실제 API 호출 시도
  try {
    const apiParams: Record<string, string> = {};
    if (stdgCd) apiParams.stdgCd = stdgCd;

    const items = await fetchPublicData<unknown>(endpoint, apiParams);
    return Response.json({ source: 'live', data: items });
  } catch {
    // Mock fallback (403 / 승인 대기 중인 API)
    const items = getMockData(category, sub);
    return Response.json({ source: 'mock', data: items });
  }
}
