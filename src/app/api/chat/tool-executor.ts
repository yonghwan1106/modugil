import { fetchPublicData } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
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
// 도구 실행 함수
// =============================================

export async function executeToolCall(
  toolName: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const regionInput = (input.region as string) ?? '';
  const stdgCd = REGION_CODES[regionInput] ?? regionInput;

  switch (toolName) {
    case 'get_traffic_light_status': {
      const [crossroads, statuses] = await Promise.all([
        fetchPublicData<TrafficLightCrossroad>(ENDPOINTS.trafficLight.crossroads, { stdgCd }),
        fetchPublicData<TrafficLightStatus>(ENDPOINTS.trafficLight.status, { stdgCd }),
      ]);

      const statusMap = new Map(statuses.map((s) => [s.crsrdId, s]));
      const result = crossroads.map((c) => ({
        crossroadId: c.crsrdId,
        crossroadName: c.crsrdNm,
        lat: c.lat,
        lot: c.lot,
        status: statusMap.get(c.crsrdId) ?? null,
      }));

      return {
        region: regionInput,
        count: result.length,
        crossroads: result,
      };
    }

    case 'get_accessible_transport': {
      const [centers, availability] = await Promise.all([
        fetchPublicData<TransportCenter>(ENDPOINTS.transport.centers, { stdgCd }),
        fetchPublicData<TransportVehicleUse>(ENDPOINTS.transport.availability, { stdgCd }),
      ]);

      const availMap = new Map(availability.map((a) => [a.centerId, a]));
      const result = centers.map((c) => ({
        centerId: c.centerId,
        centerName: c.centerNm,
        lat: c.lat,
        lot: c.lot,
        tel: c.telNo,
        availability: availMap.get(c.centerId) ?? null,
      }));

      return {
        region: regionInput,
        count: result.length,
        centers: result,
      };
    }

    case 'get_bus_realtime_location': {
      const routeNo = input.routeNo as string | undefined;
      const routes = await fetchPublicData<BusRoute>(ENDPOINTS.bus.routes, { stdgCd });

      const filteredRoutes = routeNo
        ? routes.filter((r) => r.routeNo === routeNo)
        : routes;

      const locationResults = await Promise.all(
        filteredRoutes.slice(0, 10).map(async (route) => {
          try {
            const locations = await fetchPublicData<BusLocation>(ENDPOINTS.bus.locations, {
              stdgCd,
              routeId: route.routeId,
            });
            return { route, locations };
          } catch {
            return { route, locations: [] };
          }
        }),
      );

      return {
        region: regionInput,
        routeCount: filteredRoutes.length,
        buses: locationResults.map(({ route, locations }) => ({
          routeId: route.routeId,
          routeNo: route.routeNo,
          routeType: route.routeTp,
          startStop: route.stNm,
          endStop: route.edNm,
          realtimeLocations: locations,
        })),
      };
    }

    case 'get_library_seats': {
      const libraryName = input.libraryName as string | undefined;
      const [libraries, seats] = await Promise.all([
        fetchPublicData<Library>(ENDPOINTS.library.info, { stdgCd }),
        fetchPublicData<LibrarySeat>(ENDPOINTS.library.seats, { stdgCd }),
      ]);

      const filteredLibraries = libraryName
        ? libraries.filter((l) => l.lbrryNm.includes(libraryName))
        : libraries;

      const seatsByLibrary = new Map<string, LibrarySeat[]>();
      for (const seat of seats) {
        const list = seatsByLibrary.get(seat.lbrryId) ?? [];
        list.push(seat);
        seatsByLibrary.set(seat.lbrryId, list);
      }

      const result = filteredLibraries.map((lib) => {
        const libSeats = seatsByLibrary.get(lib.lbrryId) ?? [];
        const totalSeats = libSeats.reduce((sum, s) => sum + s.totSeatCnt, 0);
        const usedSeats = libSeats.reduce((sum, s) => sum + s.useSeatCnt, 0);
        return {
          libraryId: lib.lbrryId,
          libraryName: lib.lbrryNm,
          address: lib.roadNmAddr,
          lat: lib.lat,
          lot: lib.lot,
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

      return {
        region: regionInput,
        count: result.length,
        libraries: result,
      };
    }

    case 'get_civil_office_wait': {
      const taskName = input.taskName as string | undefined;
      const [offices, waitList] = await Promise.all([
        fetchPublicData<CivilOffice>(ENDPOINTS.civil.info, { stdgCd }),
        fetchPublicData<CivilOfficeWait>(ENDPOINTS.civil.realtime, { stdgCd }),
      ]);

      const waitByOffice = new Map<string, CivilOfficeWait[]>();
      for (const w of waitList) {
        const list = waitByOffice.get(w.csoSn) ?? [];
        list.push(w);
        waitByOffice.set(w.csoSn, list);
      }

      const result = offices.map((office) => {
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
          openTime: office.wkdyOperBgngTm,
          closeTime: office.wkdyOperEndTm,
          tasks: tasks.map((t) => ({
            taskName: t.taskNm,
            waitingCount: t.wtngCnt,
            estimatedWaitMinutes: t.totDt,
          })),
        };
      });

      return {
        region: regionInput,
        count: result.length,
        offices: result,
      };
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
