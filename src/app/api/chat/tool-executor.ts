import { fetchPublicData } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import * as mockData from '@/lib/api/mock-data';
import type {
  TrafficLightCrossroad,
  TrafficLightStatus,
  TransportCenter,
  TransportVehicleUse,
  BusRoute,
  BusLocation,
  Library,
  LibrarySeat,
  CivilOffice,
  CivilOfficeWait,
  Locker,
  LockerRealtime,
} from '@/lib/api/types';

// =============================================
// 지역명 → 지자체코드 매핑
// =============================================

const REGION_CODES: Record<string, string> = {
  // 서울특별시 (11)
  '서울': '11',
  '서울특별시': '11',
  '서울 종로구': '1111',
  '서울 중구': '1114',
  '서울 용산구': '1117',
  '서울 성동구': '1120',
  '서울 광진구': '1121',
  '서울 동대문구': '1123',
  '서울 중랑구': '1126',
  '서울 성북구': '1129',
  '서울 강북구': '1130',
  '서울 도봉구': '1132',
  '서울 노원구': '1135',
  '서울 은평구': '1138',
  '서울 서대문구': '1141',
  '서울 마포구': '1144',
  '서울 양천구': '1147',
  '서울 강서구': '1150',
  '서울 구로구': '1153',
  '서울 금천구': '1154',
  '서울 영등포구': '1156',
  '서울 동작구': '1159',
  '서울 관악구': '1162',
  '서울 서초구': '1165',
  '서울 강남구': '1168',
  '서울 송파구': '1171',
  '서울 강동구': '1174',
  // 부산광역시 (26)
  '부산': '26',
  '부산광역시': '26',
  '부산 해운대구': '2635',
  '부산 강서구': '2605',
  '부산 금정구': '2619',
  '부산 남구': '2608',
  '부산 동구': '2602',
  '부산 동래구': '2616',
  '부산 부산진구': '2611',
  '부산 북구': '2622',
  '부산 사상구': '2642',
  '부산 사하구': '2638',
  '부산 서구': '2603',
  '부산 수영구': '2641',
  '부산 연제구': '2640',
  '부산 영도구': '2604',
  '부산 중구': '2601',
  // 대구광역시 (27)
  '대구': '27',
  '대구광역시': '27',
  '대구 달서구': '2771',
  '대구 달성군': '2772',
  '대구 동구': '2723',
  '대구 북구': '2724',
  '대구 서구': '2722',
  '대구 남구': '2725',
  '대구 수성구': '2726',
  '대구 중구': '2721',
  // 인천광역시 (28)
  '인천': '28',
  '인천광역시': '28',
  '인천 부평구': '2817',
  '인천 계양구': '2821',
  '인천 남동구': '2818',
  '인천 미추홀구': '2815',
  '인천 서구': '2823',
  '인천 연수구': '2816',
  '인천 중구': '2811',
  // 광주광역시 (29)
  '광주': '29',
  '광주광역시': '29',
  '광주 광산구': '2920',
  '광주 남구': '2915',
  '광주 동구': '2911',
  '광주 북구': '2916',
  '광주 서구': '2912',
  // 대전광역시 (30)
  '대전': '30',
  '대전광역시': '30',
  '대전 대덕구': '3017',
  '대전 동구': '3011',
  '대전 서구': '3014',
  '대전 유성구': '3016',
  '대전 중구': '3013',
  // 울산광역시 (31)
  '울산': '31',
  '울산광역시': '31',
  // 세종특별자치시 (36)
  '세종': '36',
  '세종시': '36',
  // 경기도 (41)
  '경기': '41',
  '경기도': '41',
  '경기 성남시': '4113',
  '경기 수원시': '4111',
  '경기 안양시': '4117',
  '경기 부천시': '4119',
  '경기 광명시': '4121',
  '경기 평택시': '4122',
  '경기 안산시': '4131',
  '경기 고양시': '4128',
  '경기 의정부시': '4115',
  '경기 용인시': '4146',
};

// =============================================
// 실제 API + Mock fallback 헬퍼
// =============================================

async function fetchWithFallback<T>(
  endpoint: string,
  params: Record<string, string>,
  fallback: T[],
): Promise<{ items: T[]; source: 'live' | 'mock' }> {
  try {
    const items = await fetchPublicData<T>(endpoint, params);
    return { items, source: 'live' };
  } catch {
    return { items: fallback, source: 'mock' };
  }
}

// lat/lot → lat/lng 변환 (프론트엔드 지도 마커용)
function normalizeLngLat<T extends object>(item: T): T & { lng: number } {
  const rec = item as Record<string, unknown>;
  return { ...item, lng: rec.lot as number };
}

// =============================================
// 도구 실행 함수
// =============================================

export async function executeToolCall(
  toolName: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const regionInput = (input.region as string) ?? '';
  const stdgCd = REGION_CODES[regionInput] ?? regionInput;
  const apiParams: Record<string, string> = stdgCd ? { stdgCd } : {};

  switch (toolName) {
    case 'get_traffic_light_status': {
      const [crossroadsResult, statusesResult] = await Promise.all([
        fetchWithFallback<TrafficLightCrossroad>(
          ENDPOINTS.trafficLight.crossroads,
          apiParams,
          mockData.MOCK_TRAFFIC_LIGHTS,
        ),
        fetchWithFallback<TrafficLightStatus>(
          ENDPOINTS.trafficLight.status,
          apiParams,
          mockData.MOCK_TRAFFIC_LIGHT_STATUS,
        ),
      ]);

      const crossroads = crossroadsResult.items;
      const statuses = statusesResult.items;
      const source = crossroadsResult.source === 'live' ? 'live' : 'mock';

      const statusMap = new Map<string, TrafficLightStatus[]>();
      for (const s of statuses) {
        const list = statusMap.get(s.crsrdId) ?? [];
        list.push(s);
        statusMap.set(s.crsrdId, list);
      }

      const items = crossroads.map((c) => ({
        crossroadId: c.crsrdId,
        crossroadName: c.crsrdNm,
        lat: c.lat,
        lot: c.lot,
        lng: c.lot,
        directions: (statusMap.get(c.crsrdId) ?? []).map((s) => ({
          direction: s.drctCd,
          remainSeconds: s.rmdrCs,
          signal: s.lgtStts,
        })),
      }));

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 신호등 교차로 ${items.length}개 조회`
        : `${regionInput} 신호등 교차로 ${items.length}개 실시간 조회 완료`;

      return { source, region: regionInput, count: items.length, summary, items };
    }

    case 'get_accessible_transport': {
      const [centersResult, availResult] = await Promise.all([
        fetchWithFallback<TransportCenter>(
          ENDPOINTS.transport.centers,
          apiParams,
          mockData.MOCK_TRANSPORT_CENTERS,
        ),
        fetchWithFallback<TransportVehicleUse>(
          ENDPOINTS.transport.availability,
          apiParams,
          mockData.MOCK_TRANSPORT_AVAILABILITY,
        ),
      ]);

      const centers = centersResult.items;
      const availability = availResult.items;
      const source = centersResult.source === 'live' ? 'live' : 'mock';

      const availMap = new Map(availability.map((a) => [a.centerId, a]));

      const items = centers.map((c) => {
        const avail = availMap.get(c.centerId);
        return {
          centerId: c.centerId,
          centerName: c.centerNm,
          lat: c.lat,
          lot: c.lot,
          lng: c.lot,
          tel: c.telNo,
          operVehicles: avail?.operVhcleCnt ?? 0,
          availableVehicles: avail?.usePsbltVhcleCnt ?? 0,
          reservations: avail?.rsrvtnCnt ?? 0,
          waiting: avail?.wtngCnt ?? 0,
        };
      });

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 교통약자 이동지원센터 ${items.length}개 조회`
        : `${regionInput} 교통약자 이동지원센터 ${items.length}개 실시간 조회 완료`;

      return { source, region: regionInput, count: items.length, summary, items };
    }

    case 'get_bus_realtime_location': {
      const routeNo = input.routeNo as string | undefined;

      const routesResult = await fetchWithFallback<BusRoute>(
        ENDPOINTS.bus.routes,
        apiParams,
        mockData.MOCK_BUS_ROUTES,
      );

      const filteredRoutes = routeNo
        ? routesResult.items.filter((r) => r.routeNo === routeNo)
        : routesResult.items;

      const locationsResult = await fetchWithFallback<BusLocation>(
        ENDPOINTS.bus.locations,
        apiParams,
        mockData.MOCK_BUS_LOCATIONS,
      );

      const source = routesResult.source === 'live' ? 'live' : 'mock';

      const locationsByRoute = new Map<string, BusLocation[]>();
      for (const loc of locationsResult.items) {
        const list = locationsByRoute.get(loc.routeId) ?? [];
        list.push(loc);
        locationsByRoute.set(loc.routeId, list);
      }

      const items = filteredRoutes.slice(0, 10).map((route) => ({
        routeId: route.routeId,
        routeNo: route.routeNo,
        routeType: route.routeTp,
        startStop: route.stNm,
        endStop: route.edNm,
        realtimeLocations: (locationsByRoute.get(route.routeId) ?? []).map(normalizeLngLat),
      }));

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 버스 노선 ${items.length}개 조회`
        : `${regionInput} 버스 노선 ${items.length}개 실시간 위치 조회 완료`;

      return { source, region: regionInput, routeCount: items.length, summary, items };
    }

    case 'get_library_seats': {
      const libraryName = input.libraryName as string | undefined;

      const [librariesResult, seatsResult] = await Promise.all([
        fetchWithFallback<Library>(
          ENDPOINTS.library.info,
          apiParams,
          mockData.MOCK_LIBRARIES,
        ),
        fetchWithFallback<LibrarySeat>(
          ENDPOINTS.library.seats,
          apiParams,
          mockData.MOCK_LIBRARY_SEATS,
        ),
      ]);

      const source = librariesResult.source === 'live' ? 'live' : 'mock';

      const filteredLibraries = libraryName
        ? librariesResult.items.filter((l) => l.lbrryNm.includes(libraryName))
        : librariesResult.items;

      const seatsByLibrary = new Map<string, LibrarySeat[]>();
      for (const seat of seatsResult.items) {
        const list = seatsByLibrary.get(seat.lbrryId) ?? [];
        list.push(seat);
        seatsByLibrary.set(seat.lbrryId, list);
      }

      const items = filteredLibraries.map((lib) => {
        const libSeats = seatsByLibrary.get(lib.lbrryId) ?? [];
        const totalSeats = libSeats.reduce((sum, s) => sum + s.totSeatCnt, 0);
        const usedSeats = libSeats.reduce((sum, s) => sum + s.useSeatCnt, 0);
        return {
          libraryId: lib.lbrryId,
          libraryName: lib.lbrryNm,
          address: lib.roadNmAddr,
          lat: lib.lat,
          lot: lib.lot,
          lng: lib.lot,
          totalSeats,
          usedSeats,
          availableSeats: totalSeats - usedSeats,
          readingRooms: libSeats.map((s) => ({
            name: s.rdrmNm,
            total: s.totSeatCnt,
            used: s.useSeatCnt,
            available: s.totSeatCnt - s.useSeatCnt,
          })),
        };
      });

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 도서관 ${items.length}개 좌석 현황 조회`
        : `${regionInput} 도서관 ${items.length}개 실시간 좌석 조회 완료`;

      return { source, region: regionInput, count: items.length, summary, items };
    }

    case 'get_civil_office_wait': {
      const taskName = input.taskName as string | undefined;

      const [officesResult, waitResult] = await Promise.all([
        fetchWithFallback<CivilOffice>(
          ENDPOINTS.civil.info,
          apiParams,
          mockData.MOCK_CIVIL_OFFICES,
        ),
        fetchWithFallback<CivilOfficeWait>(
          ENDPOINTS.civil.realtime,
          apiParams,
          mockData.MOCK_CIVIL_WAIT,
        ),
      ]);

      const source = officesResult.source === 'live' ? 'live' : 'mock';

      const waitByOffice = new Map<string, CivilOfficeWait[]>();
      for (const w of waitResult.items) {
        const list = waitByOffice.get(w.csoSn) ?? [];
        list.push(w);
        waitByOffice.set(w.csoSn, list);
      }

      const items = officesResult.items.map((office) => {
        let tasks = waitByOffice.get(office.csoSn) ?? [];
        if (taskName) {
          tasks = tasks.filter((t) => t.taskNm.includes(taskName));
        }
        return {
          officeId: office.csoSn,
          officeName: office.csoNm,
          address: office.roadNmAddr,
          lat: office.lat,
          lot: office.lot,
          lng: office.lot,
          openTime: office.wkdyOperBgngTm,
          closeTime: office.wkdyOperEndTm,
          tasks: tasks.map((t) => ({
            taskName: t.taskNm,
            waitingCount: t.wtngCnt,
            estimatedWaitMinutes: t.totDt,
          })),
        };
      });

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 민원실 ${items.length}개 대기 현황 조회`
        : `${regionInput} 민원실 ${items.length}개 실시간 대기 조회 완료`;

      return { source, region: regionInput, count: items.length, summary, items };
    }

    case 'get_locker_availability': {
      const [lockersResult, realtimeResult] = await Promise.all([
        fetchWithFallback<Locker>(
          ENDPOINTS.locker.info,
          apiParams,
          mockData.MOCK_LOCKERS,
        ),
        fetchWithFallback<LockerRealtime>(
          ENDPOINTS.locker.realtime,
          apiParams,
          mockData.MOCK_LOCKER_REALTIME,
        ),
      ]);

      const source = lockersResult.source === 'live' ? 'live' : 'mock';

      const realtimeMap = new Map(realtimeResult.items.map((r) => [r.lckrId, r]));

      const items = lockersResult.items.map((locker) => {
        const rt = realtimeMap.get(locker.lckrId);
        return {
          lockerId: locker.lckrId,
          lockerName: locker.lckrNm,
          address: locker.roadNmAddr,
          lat: locker.lat,
          lot: locker.lot,
          lng: locker.lot,
          available: {
            large: rt?.lgLckrUsePsbltCnt ?? 0,
            medium: rt?.mdLckrUsePsbltCnt ?? 0,
            small: rt?.smLckrUsePsbltCnt ?? 0,
          },
        };
      });

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 물품보관함 ${items.length}개 가용 현황 조회`
        : `${regionInput} 물품보관함 ${items.length}개 실시간 가용 조회 완료`;

      return { source, region: regionInput, count: items.length, summary, items };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
