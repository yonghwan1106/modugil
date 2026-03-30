// =============================================
// Mock 데이터 (실제 API 승인 대기 중 fallback)
// 서울 종로구/강남구/마포구 중심 실제 위치 사용
// =============================================

import type {
  BikeStation,
  BikeAvailability,
  TransportCenter,
  TransportVehicleUse,
  Library,
  LibrarySeat,
  TrafficLightCrossroad,
  TrafficLightStatus,
  CivilOffice,
  CivilOfficeWait,
  BusRoute,
  BusLocation,
  Locker,
  LockerRealtime,
} from './types';

// =============================================
// 공영자전거 대여소 (fallback mock)
// =============================================

export const MOCK_BIKE_STATIONS: BikeStation[] = [
  { rntstnId: 'ST-10',  rntstnNm: '108. 서교동 사거리',        lat: 37.5527, lot: 126.9186, roadNmAddr: '서울특별시 마포구 양화로 93' },
  { rntstnId: 'ST-11',  rntstnNm: '109. 합정역 1번출구 앞',    lat: 37.5498, lot: 126.9141, roadNmAddr: '서울특별시 마포구 양화로 92' },
  { rntstnId: 'ST-12',  rntstnNm: '110. 망원역 2번출구 앞',    lat: 37.5560, lot: 126.9100, roadNmAddr: '서울특별시 마포구 포은로 109' },
  { rntstnId: 'ST-20',  rntstnNm: '201. 광화문역 5번출구 앞',  lat: 37.5719, lot: 126.9769, roadNmAddr: '서울특별시 종로구 세종대로 189' },
  { rntstnId: 'ST-21',  rntstnNm: '202. 경복궁역 1번출구 앞', lat: 37.5752, lot: 126.9769, roadNmAddr: '서울특별시 종로구 사직로 130' },
  { rntstnId: 'ST-30',  rntstnNm: '301. 강남역 10번출구 앞',   lat: 37.4979, lot: 127.0276, roadNmAddr: '서울특별시 강남구 강남대로 396' },
];

export const MOCK_BIKE_AVAILABILITY: BikeAvailability[] = [
  { rntstnId: 'ST-10', bcyclTpkctNocs: 9,  rntNocs: 5, rtnNocs: 4 },
  { rntstnId: 'ST-11', bcyclTpkctNocs: 12, rntNocs: 7, rtnNocs: 5 },
  { rntstnId: 'ST-12', bcyclTpkctNocs: 8,  rntNocs: 3, rtnNocs: 5 },
  { rntstnId: 'ST-20', bcyclTpkctNocs: 15, rntNocs: 10, rtnNocs: 5 },
  { rntstnId: 'ST-21', bcyclTpkctNocs: 10, rntNocs: 6, rtnNocs: 4 },
  { rntstnId: 'ST-30', bcyclTpkctNocs: 20, rntNocs: 12, rtnNocs: 8 },
];

// =============================================
// 교통약자 이동지원 센터
// =============================================

export const MOCK_TRANSPORT_CENTERS: TransportCenter[] = [
  { centerId: 'TC001', centerNm: '서울시 교통약자 이동지원센터 (종로)', lat: 37.5735, lot: 126.9790, telNo: '02-6311-4200' },
  { centerId: 'TC002', centerNm: '강남구 교통약자 이동지원센터', lat: 37.5172, lot: 127.0473, telNo: '02-3423-5880' },
  { centerId: 'TC003', centerNm: '마포구 교통약자 이동지원센터', lat: 37.5639, lot: 126.9010, telNo: '02-3153-9200' },
  { centerId: 'TC004', centerNm: '영등포구 교통약자 이동지원센터', lat: 37.5260, lot: 126.8963, telNo: '02-2670-3700' },
  { centerId: 'TC005', centerNm: '송파구 교통약자 이동지원센터', lat: 37.5145, lot: 127.1059, telNo: '02-2147-3700' },
  { centerId: 'TC006', centerNm: '노원구 교통약자 이동지원센터', lat: 37.6542, lot: 127.0568, telNo: '02-2116-3700' },
];

export const MOCK_TRANSPORT_AVAILABILITY: TransportVehicleUse[] = [
  { centerId: 'TC001', operVhcleCnt: 45, usePsbltVhcleCnt: 12, rsrvtnCnt: 28, wtngCnt: 5 },
  { centerId: 'TC002', operVhcleCnt: 38, usePsbltVhcleCnt: 8,  rsrvtnCnt: 22, wtngCnt: 3 },
  { centerId: 'TC003', operVhcleCnt: 30, usePsbltVhcleCnt: 15, rsrvtnCnt: 10, wtngCnt: 0 },
  { centerId: 'TC004', operVhcleCnt: 25, usePsbltVhcleCnt: 6,  rsrvtnCnt: 18, wtngCnt: 7 },
  { centerId: 'TC005', operVhcleCnt: 42, usePsbltVhcleCnt: 20, rsrvtnCnt: 15, wtngCnt: 2 },
  { centerId: 'TC006', operVhcleCnt: 20, usePsbltVhcleCnt: 9,  rsrvtnCnt: 8,  wtngCnt: 1 },
];

// =============================================
// 공공도서관
// =============================================

export const MOCK_LIBRARIES: Library[] = [
  { lbrryId: 'LIB001', lbrryNm: '서울도서관',         lat: 37.5662, lot: 126.9785, roadNmAddr: '서울특별시 중구 세종대로 110' },
  { lbrryId: 'LIB002', lbrryNm: '종로도서관',         lat: 37.5705, lot: 126.9930, roadNmAddr: '서울특별시 종로구 사직로9길 15-14' },
  { lbrryId: 'LIB003', lbrryNm: '국립중앙도서관',     lat: 37.5001, lot: 126.9799, roadNmAddr: '서울특별시 서초구 반포대로 201' },
  { lbrryId: 'LIB004', lbrryNm: '강남도서관',         lat: 37.5172, lot: 127.0272, roadNmAddr: '서울특별시 강남구 테헤란로 108길 12' },
  { lbrryId: 'LIB005', lbrryNm: '마포중앙도서관',     lat: 37.5540, lot: 126.9088, roadNmAddr: '서울특별시 마포구 독막로 324' },
  { lbrryId: 'LIB006', lbrryNm: '용산도서관',         lat: 37.5381, lot: 126.9650, roadNmAddr: '서울특별시 용산구 백범로99길 40' },
  { lbrryId: 'LIB007', lbrryNm: '영등포구립도서관',   lat: 37.5263, lot: 126.8987, roadNmAddr: '서울특별시 영등포구 신길로 65' },
];

export const MOCK_LIBRARY_SEATS: LibrarySeat[] = [
  { lbrryId: 'LIB001', rdrmNm: '일반열람실1',   totSeatCnt: 200, useSeatCnt: 145 },
  { lbrryId: 'LIB001', rdrmNm: '일반열람실2',   totSeatCnt: 150, useSeatCnt: 98  },
  { lbrryId: 'LIB001', rdrmNm: '디지털자료실',  totSeatCnt: 80,  useSeatCnt: 42  },
  { lbrryId: 'LIB002', rdrmNm: '일반열람실',    totSeatCnt: 120, useSeatCnt: 76  },
  { lbrryId: 'LIB002', rdrmNm: '어린이열람실',  totSeatCnt: 60,  useSeatCnt: 18  },
  { lbrryId: 'LIB003', rdrmNm: '일반열람실1',   totSeatCnt: 500, useSeatCnt: 321 },
  { lbrryId: 'LIB003', rdrmNm: '일반열람실2',   totSeatCnt: 500, useSeatCnt: 412 },
  { lbrryId: 'LIB003', rdrmNm: '고문헌실',      totSeatCnt: 50,  useSeatCnt: 22  },
  { lbrryId: 'LIB004', rdrmNm: '일반열람실',    totSeatCnt: 180, useSeatCnt: 110 },
  { lbrryId: 'LIB004', rdrmNm: '노트북열람실',  totSeatCnt: 60,  useSeatCnt: 55  },
  { lbrryId: 'LIB005', rdrmNm: '일반열람실',    totSeatCnt: 160, useSeatCnt: 89  },
  { lbrryId: 'LIB005', rdrmNm: '디지털자료실',  totSeatCnt: 40,  useSeatCnt: 27  },
  { lbrryId: 'LIB006', rdrmNm: '일반열람실',    totSeatCnt: 100, useSeatCnt: 63  },
  { lbrryId: 'LIB007', rdrmNm: '일반열람실',    totSeatCnt: 140, useSeatCnt: 91  },
];

// =============================================
// 신호등 교차로
// =============================================

export const MOCK_TRAFFIC_LIGHTS: TrafficLightCrossroad[] = [
  { crsrdId: 'TL001', crsrdNm: '광화문 사거리',     lat: 37.5719, lot: 126.9768 },
  { crsrdId: 'TL002', crsrdNm: '종로3가 사거리',    lat: 37.5704, lot: 126.9917 },
  { crsrdId: 'TL003', crsrdNm: '강남역 사거리',     lat: 37.4979, lot: 127.0276 },
  { crsrdId: 'TL004', crsrdNm: '서울역 광장',       lat: 37.5547, lot: 126.9707 },
  { crsrdId: 'TL005', crsrdNm: '시청 앞 사거리',    lat: 37.5663, lot: 126.9779 },
  { crsrdId: 'TL006', crsrdNm: '홍대입구 사거리',   lat: 37.5572, lot: 126.9241 },
  { crsrdId: 'TL007', crsrdNm: '신촌 오거리',       lat: 37.5555, lot: 126.9368 },
  { crsrdId: 'TL008', crsrdNm: '교대역 사거리',     lat: 37.4937, lot: 127.0144 },
];

export const MOCK_TRAFFIC_LIGHT_STATUS: TrafficLightStatus[] = [
  // TL001 광화문 - 4방향
  { crsrdId: 'TL001', drctCd: '1', rmdrCs: 30, lgtStts: 'G' },
  { crsrdId: 'TL001', drctCd: '2', rmdrCs: 30, lgtStts: 'R' },
  { crsrdId: 'TL001', drctCd: '3', rmdrCs: 30, lgtStts: 'G' },
  { crsrdId: 'TL001', drctCd: '4', rmdrCs: 30, lgtStts: 'R' },
  // TL002 종로3가 - 4방향
  { crsrdId: 'TL002', drctCd: '1', rmdrCs: 15, lgtStts: 'R' },
  { crsrdId: 'TL002', drctCd: '2', rmdrCs: 15, lgtStts: 'G' },
  { crsrdId: 'TL002', drctCd: '3', rmdrCs: 15, lgtStts: 'R' },
  { crsrdId: 'TL002', drctCd: '4', rmdrCs: 15, lgtStts: 'G' },
  // TL003 강남역 - 4방향
  { crsrdId: 'TL003', drctCd: '1', rmdrCs: 45, lgtStts: 'G' },
  { crsrdId: 'TL003', drctCd: '2', rmdrCs: 45, lgtStts: 'R' },
  { crsrdId: 'TL003', drctCd: '3', rmdrCs: 45, lgtStts: 'G' },
  { crsrdId: 'TL003', drctCd: '4', rmdrCs: 45, lgtStts: 'R' },
  // TL004 서울역 - 4방향
  { crsrdId: 'TL004', drctCd: '1', rmdrCs: 8,  lgtStts: 'Y' },
  { crsrdId: 'TL004', drctCd: '2', rmdrCs: 38, lgtStts: 'R' },
  { crsrdId: 'TL004', drctCd: '3', rmdrCs: 8,  lgtStts: 'Y' },
  { crsrdId: 'TL004', drctCd: '4', rmdrCs: 38, lgtStts: 'R' },
  // TL005 시청 - 4방향
  { crsrdId: 'TL005', drctCd: '1', rmdrCs: 22, lgtStts: 'G' },
  { crsrdId: 'TL005', drctCd: '2', rmdrCs: 22, lgtStts: 'R' },
  { crsrdId: 'TL005', drctCd: '3', rmdrCs: 22, lgtStts: 'G' },
  { crsrdId: 'TL005', drctCd: '4', rmdrCs: 22, lgtStts: 'R' },
  // TL006~008 간략히
  { crsrdId: 'TL006', drctCd: '1', rmdrCs: 35, lgtStts: 'R' },
  { crsrdId: 'TL006', drctCd: '2', rmdrCs: 35, lgtStts: 'G' },
  { crsrdId: 'TL007', drctCd: '1', rmdrCs: 12, lgtStts: 'G' },
  { crsrdId: 'TL007', drctCd: '2', rmdrCs: 12, lgtStts: 'R' },
  { crsrdId: 'TL008', drctCd: '1', rmdrCs: 50, lgtStts: 'R' },
  { crsrdId: 'TL008', drctCd: '2', rmdrCs: 50, lgtStts: 'G' },
];

// =============================================
// 민원실 (서울 구청)
// =============================================

export const MOCK_CIVIL_OFFICES: CivilOffice[] = [
  { csoSn: 'CS001', csoNm: '종로구청 민원실',   lat: 37.5735, lot: 126.9790, roadNmAddr: '서울특별시 종로구 종로1길 36',       wkdyOperBgngTm: '0900', wkdyOperEndTm: '1800' },
  { csoSn: 'CS002', csoNm: '강남구청 민원실',   lat: 37.5172, lot: 127.0473, roadNmAddr: '서울특별시 강남구 학동로 426',       wkdyOperBgngTm: '0900', wkdyOperEndTm: '1800' },
  { csoSn: 'CS003', csoNm: '마포구청 민원실',   lat: 37.5639, lot: 126.9010, roadNmAddr: '서울특별시 마포구 월드컵로 212',     wkdyOperBgngTm: '0900', wkdyOperEndTm: '1800' },
  { csoSn: 'CS004', csoNm: '서초구청 민원실',   lat: 37.4835, lot: 127.0325, roadNmAddr: '서울특별시 서초구 남부순환로 2584', wkdyOperBgngTm: '0900', wkdyOperEndTm: '1800' },
  { csoSn: 'CS005', csoNm: '영등포구청 민원실', lat: 37.5260, lot: 126.8963, roadNmAddr: '서울특별시 영등포구 당산로 123',     wkdyOperBgngTm: '0900', wkdyOperEndTm: '1800' },
  { csoSn: 'CS006', csoNm: '중구청 민원실',     lat: 37.5640, lot: 126.9979, roadNmAddr: '서울특별시 중구 창경궁로 17',       wkdyOperBgngTm: '0900', wkdyOperEndTm: '1800' },
];

export const MOCK_CIVIL_WAIT: CivilOfficeWait[] = [
  { csoSn: 'CS001', csoNm: '종로구청 민원실',   taskNm: '주민등록',   wtngCnt: 3,  totDt: '2026-03-30 14:30' },
  { csoSn: 'CS001', csoNm: '종로구청 민원실',   taskNm: '여권발급',   wtngCnt: 8,  totDt: '2026-03-30 14:30' },
  { csoSn: 'CS001', csoNm: '종로구청 민원실',   taskNm: '인감증명',   wtngCnt: 2,  totDt: '2026-03-30 14:30' },
  { csoSn: 'CS002', csoNm: '강남구청 민원실',   taskNm: '주민등록',   wtngCnt: 12, totDt: '2026-03-30 14:30' },
  { csoSn: 'CS002', csoNm: '강남구청 민원실',   taskNm: '여권발급',   wtngCnt: 15, totDt: '2026-03-30 14:30' },
  { csoSn: 'CS002', csoNm: '강남구청 민원실',   taskNm: '건축민원',   wtngCnt: 5,  totDt: '2026-03-30 14:30' },
  { csoSn: 'CS003', csoNm: '마포구청 민원실',   taskNm: '주민등록',   wtngCnt: 6,  totDt: '2026-03-30 14:30' },
  { csoSn: 'CS003', csoNm: '마포구청 민원실',   taskNm: '여권발급',   wtngCnt: 4,  totDt: '2026-03-30 14:30' },
  { csoSn: 'CS004', csoNm: '서초구청 민원실',   taskNm: '주민등록',   wtngCnt: 9,  totDt: '2026-03-30 14:30' },
  { csoSn: 'CS004', csoNm: '서초구청 민원실',   taskNm: '건축민원',   wtngCnt: 11, totDt: '2026-03-30 14:30' },
  { csoSn: 'CS005', csoNm: '영등포구청 민원실', taskNm: '주민등록',   wtngCnt: 7,  totDt: '2026-03-30 14:30' },
  { csoSn: 'CS005', csoNm: '영등포구청 민원실', taskNm: '인감증명',   wtngCnt: 3,  totDt: '2026-03-30 14:30' },
  { csoSn: 'CS006', csoNm: '중구청 민원실',     taskNm: '주민등록',   wtngCnt: 2,  totDt: '2026-03-30 14:30' },
  { csoSn: 'CS006', csoNm: '중구청 민원실',     taskNm: '여권발급',   wtngCnt: 6,  totDt: '2026-03-30 14:30' },
];

// =============================================
// 버스 노선 및 실시간 위치
// =============================================

export const MOCK_BUS_ROUTES: BusRoute[] = [
  { routeId: 'BR001', routeNo: '151',  routeTp: '간선', stNm: '종로5가',    edNm: '영등포역'   },
  { routeId: 'BR002', routeNo: '472',  routeTp: '간선', stNm: '강남역',     edNm: '서울역'     },
  { routeId: 'BR003', routeNo: '7016', routeTp: '지선', stNm: '마포구청',   edNm: '시청'       },
  { routeId: 'BR004', routeNo: '273',  routeTp: '간선', stNm: '광화문',     edNm: '강남구청'   },
  { routeId: 'BR005', routeNo: '8001', routeTp: '광역', stNm: '수원역',     edNm: '강남역'     },
];

export const MOCK_BUS_LOCATIONS: BusLocation[] = [
  { routeId: 'BR001', vhcleNo: '서울74사1234', lat: 37.5710, lot: 126.9870, spd: 25, drctAngl: 180 },
  { routeId: 'BR001', vhcleNo: '서울74사1235', lat: 37.5593, lot: 126.9710, spd: 18, drctAngl: 200 },
  { routeId: 'BR002', vhcleNo: '서울74사2001', lat: 37.5050, lot: 127.0250, spd: 30, drctAngl: 270 },
  { routeId: 'BR002', vhcleNo: '서울74사2002', lat: 37.5200, lot: 127.0100, spd: 22, drctAngl: 300 },
  { routeId: 'BR003', vhcleNo: '서울74사3001', lat: 37.5600, lot: 126.9150, spd: 15, drctAngl: 90  },
  { routeId: 'BR004', vhcleNo: '서울74사4001', lat: 37.5660, lot: 126.9800, spd: 20, drctAngl: 135 },
  { routeId: 'BR005', vhcleNo: '경기72사5001', lat: 37.4850, lot: 127.0320, spd: 45, drctAngl: 0   },
];

// =============================================
// 공영 물품보관함
// =============================================

export const MOCK_LOCKERS: Locker[] = [
  { lckrId: 'LK001', lckrNm: '서울역 물품보관함',       lat: 37.5547, lot: 126.9707, roadNmAddr: '서울특별시 용산구 한강대로 405' },
  { lckrId: 'LK002', lckrNm: '광화문역 물품보관함',     lat: 37.5719, lot: 126.9769, roadNmAddr: '서울특별시 종로구 새문안로 70' },
  { lckrId: 'LK003', lckrNm: '강남역 물품보관함',       lat: 37.4979, lot: 127.0276, roadNmAddr: '서울특별시 강남구 강남대로 396' },
  { lckrId: 'LK004', lckrNm: '홍대입구역 물품보관함',   lat: 37.5572, lot: 126.9241, roadNmAddr: '서울특별시 마포구 양화로 160' },
  { lckrId: 'LK005', lckrNm: '종로3가역 물품보관함',    lat: 37.5704, lot: 126.9917, roadNmAddr: '서울특별시 종로구 종로 199' },
  { lckrId: 'LK006', lckrNm: '교대역 물품보관함',       lat: 37.4937, lot: 127.0144, roadNmAddr: '서울특별시 서초구 서초대로 301' },
];

export const MOCK_LOCKER_REALTIME: LockerRealtime[] = [
  { lckrId: 'LK001', lgLckrUsePsbltCnt: 5,  mdLckrUsePsbltCnt: 12, smLckrUsePsbltCnt: 20 },
  { lckrId: 'LK002', lgLckrUsePsbltCnt: 2,  mdLckrUsePsbltCnt: 8,  smLckrUsePsbltCnt: 15 },
  { lckrId: 'LK003', lgLckrUsePsbltCnt: 0,  mdLckrUsePsbltCnt: 3,  smLckrUsePsbltCnt: 7  },
  { lckrId: 'LK004', lgLckrUsePsbltCnt: 8,  mdLckrUsePsbltCnt: 20, smLckrUsePsbltCnt: 35 },
  { lckrId: 'LK005', lgLckrUsePsbltCnt: 3,  mdLckrUsePsbltCnt: 6,  smLckrUsePsbltCnt: 11 },
  { lckrId: 'LK006', lgLckrUsePsbltCnt: 1,  mdLckrUsePsbltCnt: 4,  smLckrUsePsbltCnt: 9  },
];
