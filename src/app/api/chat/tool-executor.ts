import { fetchPublicData } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import * as mockData from '@/lib/api/mock-data';
import type {
  BikeStation,
  BikeAvailability,
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
// 지역명 → 자전거 API lcgvmnInstCd 매핑
// =============================================

const BIKE_REGION_CODES: Record<string, string> = {
  '서울': '1100000000',
  '서울특별시': '1100000000',
  '서울 종로구': '1100000000',
  '서울 중구': '1100000000',
  '서울 용산구': '1100000000',
  '서울 성동구': '1100000000',
  '서울 광진구': '1100000000',
  '서울 동대문구': '1100000000',
  '서울 중랑구': '1100000000',
  '서울 성북구': '1100000000',
  '서울 강북구': '1100000000',
  '서울 도봉구': '1100000000',
  '서울 노원구': '1100000000',
  '서울 은평구': '1100000000',
  '서울 서대문구': '1100000000',
  '서울 마포구': '1100000000',
  '서울 양천구': '1100000000',
  '서울 강서구': '1100000000',
  '서울 구로구': '1100000000',
  '서울 금천구': '1100000000',
  '서울 영등포구': '1100000000',
  '서울 동작구': '1100000000',
  '서울 관악구': '1100000000',
  '서울 서초구': '1100000000',
  '서울 강남구': '1100000000',
  '서울 송파구': '1100000000',
  '서울 강동구': '1100000000',
  '대전': '3000000000',
  '대전광역시': '3000000000',
  '세종': '3600000000',
  '세종시': '3600000000',
};

// =============================================
// 지역명 → 지자체코드 매핑 (10자리)
// =============================================

const REGION_CODES: Record<string, string> = {
  // 서울특별시
  '서울': '1100000000',
  '서울특별시': '1100000000',
  '서울 종로구': '1111000000',
  '서울 중구': '1114000000',
  '서울 용산구': '1117000000',
  '서울 성동구': '1120000000',
  '서울 광진구': '1121500000',
  '서울 동대문구': '1123000000',
  '서울 중랑구': '1126000000',
  '서울 성북구': '1129000000',
  '서울 강북구': '1130500000',
  '서울 도봉구': '1132000000',
  '서울 노원구': '1135000000',
  '서울 은평구': '1138000000',
  '서울 서대문구': '1141000000',
  '서울 마포구': '1144000000',
  '서울 양천구': '1147000000',
  '서울 강서구': '1150000000',
  '서울 구로구': '1153000000',
  '서울 금천구': '1154500000',
  '서울 영등포구': '1156000000',
  '서울 동작구': '1159000000',
  '서울 관악구': '1162000000',
  '서울 서초구': '1165000000',
  '서울 강남구': '1168000000',
  '서울 송파구': '1171000000',
  '서울 강동구': '1174000000',
  // 부산광역시
  '부산': '2600000000',
  '부산광역시': '2600000000',
  '부산 해운대구': '2635000000',
  '부산 강서구': '2605300000',
  '부산 금정구': '2619000000',
  '부산 남구': '2608000000',
  '부산 동구': '2602000000',
  '부산 동래구': '2616000000',
  '부산 부산진구': '2611000000',
  '부산 북구': '2622000000',
  '부산 사상구': '2642000000',
  '부산 사하구': '2638000000',
  '부산 서구': '2603000000',
  '부산 수영구': '2641000000',
  '부산 연제구': '2640000000',
  '부산 영도구': '2604000000',
  '부산 중구': '2601000000',
  // 대구광역시
  '대구': '2700000000',
  '대구광역시': '2700000000',
  // 인천광역시
  '인천': '2800000000',
  '인천광역시': '2800000000',
  // 광주광역시
  '광주': '2900000000',
  '광주광역시': '2900000000',
  // 대전광역시
  '대전': '3000000000',
  '대전광역시': '3000000000',
  // 울산광역시
  '울산': '3100000000',
  '울산광역시': '3100000000',
  // 세종특별자치시
  '세종': '3600000000',
  '세종시': '3600000000',
  // 경기도
  '경기': '4100000000',
  '경기도': '4100000000',
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

// 자전거 API는 응답 구조가 다름 (item 단수, lat/lot 문자열)
interface BikeApiResponse<T> {
  header: { resultCode: string; resultMsg: string };
  body: { totalCount: number; pageNo: number; numOfRows: number; item: T[] };
}

async function fetchBikeApi<T>(endpoint: string, params: Record<string, string>): Promise<T[]> {
  const serviceKey = process.env.DATA_API_KEY;
  if (!serviceKey) throw new Error('DATA_API_KEY 환경변수가 설정되지 않았습니다.');

  const otherParams = new URLSearchParams({ type: 'json', pageNo: '1', numOfRows: '50', ...params });
  const res = await fetch(`${endpoint}?serviceKey=${serviceKey}&${otherParams.toString()}`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (!res.ok) throw new Error(`자전거 API 요청 실패: HTTP ${res.status}`);

  const json = (await res.json()) as BikeApiResponse<T>;
  if (json.header.resultCode !== 'K0' && json.header.resultCode !== '00') {
    throw new Error(`자전거 API 오류 [${json.header.resultCode}]: ${json.header.resultMsg}`);
  }
  return json.body.item ?? [];
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
  // 시/도 단위 코드 추출 (구 단위 → 시 단위 폴백: 1168000000 → 1100000000)
  const cityLevelCd = stdgCd ? stdgCd.slice(0, 2) + '00000000' : '';
  // 교통약자/신호등/보관함: 시 단위에서만 데이터 제공
  const cityParams: Record<string, string> = cityLevelCd ? { stdgCd: cityLevelCd } : {};
  // 도서관: 구 단위 시도 → 실패 시 stdgCd 없이 재시도
  const districtParams: Record<string, string> = stdgCd ? { stdgCd } : {};
  // 민원실/버스: stdgCd를 보내면 NODATA → stdgCd 없이 호출
  const noRegionParams: Record<string, string> = {};

  switch (toolName) {
    case 'get_bicycle_availability': {
      const lcgvmnInstCd = BIKE_REGION_CODES[regionInput] ?? '1100000000';
      const bikeParams = { lcgvmnInstCd };

      let stations: BikeStation[] = [];
      let availabilities: BikeAvailability[] = [];
      let source: 'live' | 'mock' = 'mock';

      try {
        const [stationsRaw, availRaw] = await Promise.all([
          fetchBikeApi<BikeStation>(ENDPOINTS.bicycle.stations, bikeParams),
          fetchBikeApi<BikeAvailability>(ENDPOINTS.bicycle.availability, bikeParams),
        ]);
        stations = stationsRaw;
        availabilities = availRaw;
        source = 'live';
      } catch {
        stations = mockData.MOCK_BIKE_STATIONS;
        availabilities = mockData.MOCK_BIKE_AVAILABILITY;
      }

      const availMap = new Map(availabilities.map((a) => [a.rntstnId, a]));

      const items = stations.slice(0, 20).map((s) => {
        const avail = availMap.get(s.rntstnId);
        return {
          stationId: s.rntstnId,
          stationName: s.rntstnNm,
          address: s.roadNmAddr,
          lat: Number(s.lat),
          lot: Number(s.lot),
          lng: Number(s.lot),
          totalSlots: Number(avail?.bcyclTpkctNocs ?? 0),
          availableBikes: Number(avail?.rntNocs ?? 0),
          availableSlots: Number(avail?.rtnNocs ?? 0),
        };
      });

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 공영자전거 대여소 ${items.length}개 조회`
        : `${regionInput || '서울'} 공영자전거 대여소 ${items.length}개 실시간 조회 완료 (총 ${stations.length}개 중 상위 20개)`;

      return { source, region: regionInput, count: items.length, summary, items };
    }

    case 'get_traffic_light_status': {
      const [crossroadsResult, statusesResult] = await Promise.all([
        fetchWithFallback<TrafficLightCrossroad>(
          ENDPOINTS.trafficLight.crossroads,
          cityParams,
          mockData.MOCK_TRAFFIC_LIGHTS,
        ),
        fetchWithFallback<TrafficLightStatus>(
          ENDPOINTS.trafficLight.status,
          cityParams,
          mockData.MOCK_TRAFFIC_LIGHT_STATUS,
        ),
      ]);

      const crossroads = crossroadsResult.items;
      const statuses = statusesResult.items;
      const source = crossroadsResult.source === 'live' ? 'live' : 'mock';

      // 영어 신호 상태를 한글로 변환
      function translateSignal(signal: string): string {
        const s = signal.toLowerCase();
        if (s.includes('protected movement')) return '녹색(진행)';
        if (s.includes('stop and remain')) return '적색(정지)';
        if (s.includes('stop then proceed')) return '적색(정지 후 진행)';
        if (s.includes('caution')) return '황색(주의)';
        if (s.includes('green')) return '녹색';
        if (s.includes('red')) return '적색';
        if (s.includes('yellow')) return '황색';
        return signal || '정보없음';
      }

      const statusMap = new Map<string, TrafficLightStatus[]>();
      for (const s of statuses) {
        const list = statusMap.get(s.crsrdId) ?? [];
        list.push(s);
        statusMap.set(s.crsrdId, list);
      }

      const items = crossroads.slice(0, 20).map((c) => {
        const dirStatuses = statusMap.get(c.crsrdId) ?? [];
        // 실제 API에서는 방향별 컬럼이 하나의 row에 다 들어있음
        const directions: { direction: string; remainSeconds: number; signal: string }[] = [];
        if (dirStatuses.length > 0) {
          const s = dirStatuses[0];
          const dirPrefixes = ['nt', 'et', 'st', 'wt', 'ne', 'se', 'sw', 'nw'];
          const dirNames: Record<string, string> = { nt: '북', et: '동', st: '남', wt: '서', ne: '북동', se: '남동', sw: '남서', nw: '북서' };
          for (const dir of dirPrefixes) {
            const pdsgRemain = s[`${dir}PdsgRmndCs`];
            const pdsgStatus = s[`${dir}PdsgSttsNm`];
            const stsgRemain = s[`${dir}StsgRmndCs`];
            const stsgStatus = s[`${dir}StsgSttsNm`];
            if (pdsgRemain || pdsgStatus) {
              directions.push({
                direction: `${dirNames[dir]}_보행자`,
                remainSeconds: Math.round(Number(pdsgRemain || 0) / 10),
                signal: translateSignal(String(pdsgStatus || '')),
              });
            }
            if (stsgRemain || stsgStatus) {
              directions.push({
                direction: `${dirNames[dir]}_차량`,
                remainSeconds: Math.round(Number(stsgRemain || 0) / 10),
                signal: translateSignal(String(stsgStatus || '')),
              });
            }
          }
        }

        return {
          crossroadId: c.crsrdId,
          crossroadName: c.crsrdNm,
          lat: Number(c.mapCtptIntLat),
          lot: Number(c.mapCtptIntLot),
          lng: Number(c.mapCtptIntLot),
          directions,
        };
      });

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 신호등 교차로 ${items.length}개 조회`
        : `${regionInput || '서울'} 신호등 교차로 ${items.length}개 실시간 조회 완료`;

      return { source, region: regionInput, count: items.length, summary, items };
    }

    case 'get_accessible_transport': {
      const [centersResult, availResult] = await Promise.all([
        fetchWithFallback<TransportCenter>(
          ENDPOINTS.transport.centers,
          cityParams,
          mockData.MOCK_TRANSPORT_CENTERS,
        ),
        fetchWithFallback<TransportVehicleUse>(
          ENDPOINTS.transport.availability,
          cityParams,
          mockData.MOCK_TRANSPORT_AVAILABILITY,
        ),
      ]);

      const centers = centersResult.items;
      const availability = availResult.items;
      const source = centersResult.source === 'live' ? 'live' : 'mock';

      const availMap = new Map(availability.map((a) => [a.cntrId, a]));

      const items = centers.map((c) => {
        const avail = availMap.get(c.cntrId);
        return {
          centerId: c.cntrId,
          centerName: c.cntrNm,
          lat: Number(c.lat),
          lot: Number(c.lot),
          lng: Number(c.lot),
          tel: c.cntrTelno,
          totalVehicles: Number(avail?.tvhclCntom ?? 0),
          operVehicles: Number(avail?.oprVhclCntom ?? 0),
          availableVehicles: Number(avail?.avlVhclCntom ?? 0),
          reservations: Number(avail?.rsvtNocs ?? 0),
          waiting: Number(avail?.wtngNocs ?? 0),
        };
      });

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 교통약자 이동지원센터 ${items.length}개 조회`
        : `${regionInput || '서울'} 교통약자 이동지원센터 ${items.length}개 실시간 조회 완료`;

      return { source, region: regionInput, count: items.length, summary, items };
    }

    case 'get_bus_realtime_location': {
      const routeNo = input.routeNo as string | undefined;

      const routesResult = await fetchWithFallback<BusRoute>(
        ENDPOINTS.bus.routes,
        noRegionParams,
        mockData.MOCK_BUS_ROUTES,
      );

      const filteredRoutes = routeNo
        ? routesResult.items.filter((r) => r.rteNo === routeNo)
        : routesResult.items;

      const locationsResult = await fetchWithFallback<BusLocation>(
        ENDPOINTS.bus.locations,
        noRegionParams,
        mockData.MOCK_BUS_LOCATIONS,
      );

      const source = routesResult.source === 'live' ? 'live' : 'mock';

      const locationsByRoute = new Map<string, BusLocation[]>();
      for (const loc of locationsResult.items) {
        const list = locationsByRoute.get(loc.rteId) ?? [];
        list.push(loc);
        locationsByRoute.set(loc.rteId, list);
      }

      const items = filteredRoutes.slice(0, 10).map((route) => ({
        routeId: route.rteId,
        routeNo: route.rteNo,
        routeType: route.rteType,
        startStop: route.stpnt,
        endStop: route.edpnt,
        realtimeLocations: (locationsByRoute.get(route.rteId) ?? []).map((loc) => ({
          ...loc,
          lat: Number(loc.lat),
          lot: Number(loc.lot),
          lng: Number(loc.lot),
        })),
      }));

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 버스 노선 ${items.length}개 조회`
        : `${regionInput || '서울'} 버스 노선 ${items.length}개 실시간 위치 조회 완료`;

      return { source, region: regionInput, routeCount: items.length, summary, items };
    }

    case 'get_library_seats': {
      const libraryName = input.libraryName as string | undefined;

      // 구 단위로 먼저 시도, 실패(NODATA) 시 stdgCd 없이 재시도
      let [librariesResult, seatsResult] = await Promise.all([
        fetchWithFallback<Library>(
          ENDPOINTS.library.info,
          districtParams,
          mockData.MOCK_LIBRARIES,
        ),
        fetchWithFallback<LibrarySeat>(
          ENDPOINTS.library.seats,
          districtParams,
          mockData.MOCK_LIBRARY_SEATS,
        ),
      ]);

      // 구 단위에서 mock 폴백된 경우 stdgCd 없이 재시도
      if (librariesResult.source === 'mock' && Object.keys(districtParams).length > 0) {
        [librariesResult, seatsResult] = await Promise.all([
          fetchWithFallback<Library>(ENDPOINTS.library.info, noRegionParams, mockData.MOCK_LIBRARIES),
          fetchWithFallback<LibrarySeat>(ENDPOINTS.library.seats, noRegionParams, mockData.MOCK_LIBRARY_SEATS),
        ]);
      }

      const source = librariesResult.source === 'live' ? 'live' : 'mock';

      const filteredLibraries = libraryName
        ? librariesResult.items.filter((l) => l.pblibNm.includes(libraryName))
        : librariesResult.items;

      const seatsByLibrary = new Map<string, LibrarySeat[]>();
      for (const seat of seatsResult.items) {
        const list = seatsByLibrary.get(seat.pblibId) ?? [];
        list.push(seat);
        seatsByLibrary.set(seat.pblibId, list);
      }

      const items = filteredLibraries.map((lib) => {
        const libSeats = seatsByLibrary.get(lib.pblibId) ?? [];
        const totalSeats = libSeats.reduce((sum, s) => sum + Number(s.tseatCnt), 0);
        const usedSeats = libSeats.reduce((sum, s) => sum + Number(s.useSeatCnt), 0);
        return {
          libraryId: lib.pblibId,
          libraryName: lib.pblibNm,
          address: lib.pblibRoadNmAddr,
          lat: Number(lib.lat),
          lot: Number(lib.lot),
          lng: Number(lib.lot),
          totalSeats,
          usedSeats,
          availableSeats: totalSeats - usedSeats,
          readingRooms: libSeats.map((s) => ({
            name: s.rdrmNm,
            total: Number(s.tseatCnt),
            used: Number(s.useSeatCnt),
            available: Number(s.rmndSeatCnt),
          })),
        };
      });

      const limitedItems = items.slice(0, 20);

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 도서관 ${limitedItems.length}개 좌석 현황 조회`
        : `${regionInput || '서울'} 도서관 ${limitedItems.length}개 실시간 좌석 조회 완료 (총 ${items.length}개 중)`;

      return { source, region: regionInput, count: limitedItems.length, summary, items: limitedItems };
    }

    case 'get_civil_office_wait': {
      const taskName = input.taskName as string | undefined;

      const [officesResult, waitResult] = await Promise.all([
        fetchWithFallback<CivilOffice>(
          ENDPOINTS.civil.info,
          noRegionParams,
          mockData.MOCK_CIVIL_OFFICES,
        ),
        fetchWithFallback<CivilOfficeWait>(
          ENDPOINTS.civil.realtime,
          noRegionParams,
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
          lat: Number(office.lat),
          lot: Number(office.lot),
          lng: Number(office.lot),
          openTime: office.wkdyOperBgngTm,
          closeTime: office.wkdyOperEndTm,
          tasks: tasks.map((t) => ({
            taskName: t.taskNm,
            waitingCount: t.wtngCnt,
            ticketNo: t.clotNo,
          })),
        };
      });

      const limitedCivilItems = items.slice(0, 20);

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 민원실 ${limitedCivilItems.length}개 대기 현황 조회`
        : `${regionInput || '서울'} 민원실 ${limitedCivilItems.length}개 실시간 대기 조회 완료 (총 ${items.length}개 중)`;

      return { source, region: regionInput, count: limitedCivilItems.length, summary, items: limitedCivilItems };
    }

    case 'get_locker_availability': {
      const [lockersResult, realtimeResult] = await Promise.all([
        fetchWithFallback<Locker>(
          ENDPOINTS.locker.info,
          cityParams,
          mockData.MOCK_LOCKERS,
        ),
        fetchWithFallback<LockerRealtime>(
          ENDPOINTS.locker.realtime,
          cityParams,
          mockData.MOCK_LOCKER_REALTIME,
        ),
      ]);

      const source = lockersResult.source === 'live' ? 'live' : 'mock';

      const realtimeMap = new Map(realtimeResult.items.map((r) => [r.stlckId, r]));

      const items = lockersResult.items.map((locker) => {
        const rt = realtimeMap.get(locker.stlckId);
        return {
          lockerId: locker.stlckId,
          lockerName: locker.stlckRprsPstnNm,
          address: locker.fcltRoadNmAddr,
          lat: Number(locker.lat),
          lot: Number(locker.lot),
          lng: Number(locker.lot),
          available: {
            large: Number(rt?.usePsbltyLrgszStlckCnt ?? 0),
            medium: Number(rt?.usePsbltyMdmszStlckCnt ?? 0),
            small: Number(rt?.usePsbltySmlszStlckCnt ?? 0),
          },
        };
      });

      const summary = source === 'mock'
        ? `[Mock] ${regionInput || '서울'} 물품보관함 ${items.length}개 가용 현황 조회`
        : `${regionInput || '서울'} 물품보관함 ${items.length}개 실시간 가용 조회 완료`;

      return { source, region: regionInput, count: items.length, summary, items };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
