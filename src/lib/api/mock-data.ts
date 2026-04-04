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
  { rntstnId: 'ST-10',  rntstnNm: '108. 서교동 사거리',        lat: '37.5527', lot: '126.9186', roadNmAddr: '서울특별시 마포구 양화로 93' },
  { rntstnId: 'ST-11',  rntstnNm: '109. 합정역 1번출구 앞',    lat: '37.5498', lot: '126.9141', roadNmAddr: '서울특별시 마포구 양화로 92' },
  { rntstnId: 'ST-12',  rntstnNm: '110. 망원역 2번출구 앞',    lat: '37.5560', lot: '126.9100', roadNmAddr: '서울특별시 마포구 포은로 109' },
  { rntstnId: 'ST-20',  rntstnNm: '201. 광화문역 5번출구 앞',  lat: '37.5719', lot: '126.9769', roadNmAddr: '서울특별시 종로구 세종대로 189' },
  { rntstnId: 'ST-21',  rntstnNm: '202. 경복궁역 1번출구 앞',  lat: '37.5752', lot: '126.9769', roadNmAddr: '서울특별시 종로구 사직로 130' },
  { rntstnId: 'ST-30',  rntstnNm: '301. 강남역 10번출구 앞',   lat: '37.4979', lot: '127.0276', roadNmAddr: '서울특별시 강남구 강남대로 396' },
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
  { cntrId: 'TC001', cntrNm: '서울시 교통약자 이동지원센터 (종로)', lat: '37.5735', lot: '126.9790', cntrTelno: '02-6311-4200', cntrRoadNmAddr: '서울특별시 종로구 종로1길 36', stdgCd: '1100000000', lclgvNm: '서울특별시', hldVhclTcntom: '45' },
  { cntrId: 'TC002', cntrNm: '강남구 교통약자 이동지원센터', lat: '37.5172', lot: '127.0473', cntrTelno: '02-3423-5880', cntrRoadNmAddr: '서울특별시 강남구 학동로 426', stdgCd: '1168000000', lclgvNm: '서울특별시 강남구', hldVhclTcntom: '38' },
  { cntrId: 'TC003', cntrNm: '마포구 교통약자 이동지원센터', lat: '37.5639', lot: '126.9010', cntrTelno: '02-3153-9200', cntrRoadNmAddr: '서울특별시 마포구 월드컵로 212', stdgCd: '1144000000', lclgvNm: '서울특별시 마포구', hldVhclTcntom: '30' },
  { cntrId: 'TC004', cntrNm: '영등포구 교통약자 이동지원센터', lat: '37.5260', lot: '126.8963', cntrTelno: '02-2670-3700', cntrRoadNmAddr: '서울특별시 영등포구 당산로 123', stdgCd: '1156000000', lclgvNm: '서울특별시 영등포구', hldVhclTcntom: '25' },
  { cntrId: 'TC005', cntrNm: '송파구 교통약자 이동지원센터', lat: '37.5145', lot: '127.1059', cntrTelno: '02-2147-3700', cntrRoadNmAddr: '서울특별시 송파구 올림픽로 326', stdgCd: '1171000000', lclgvNm: '서울특별시 송파구', hldVhclTcntom: '42' },
  { cntrId: 'TC006', cntrNm: '노원구 교통약자 이동지원센터', lat: '37.6542', lot: '127.0568', cntrTelno: '02-2116-3700', cntrRoadNmAddr: '서울특별시 노원구 노해로 437', stdgCd: '1135000000', lclgvNm: '서울특별시 노원구', hldVhclTcntom: '20' },
];

export const MOCK_TRANSPORT_AVAILABILITY: TransportVehicleUse[] = [
  { cntrId: 'TC001', cntrNm: '서울시 교통약자 이동지원센터', tvhclCntom: '45', oprVhclCntom: '33', avlVhclCntom: '12', rsvtNocs: '28', wtngNocs: '5' },
  { cntrId: 'TC002', cntrNm: '강남구 교통약자 이동지원센터', tvhclCntom: '38', oprVhclCntom: '30', avlVhclCntom: '8',  rsvtNocs: '22', wtngNocs: '3' },
  { cntrId: 'TC003', cntrNm: '마포구 교통약자 이동지원센터', tvhclCntom: '30', oprVhclCntom: '15', avlVhclCntom: '15', rsvtNocs: '10', wtngNocs: '0' },
  { cntrId: 'TC004', cntrNm: '영등포구 교통약자 이동지원센터', tvhclCntom: '25', oprVhclCntom: '19', avlVhclCntom: '6',  rsvtNocs: '18', wtngNocs: '7' },
  { cntrId: 'TC005', cntrNm: '송파구 교통약자 이동지원센터', tvhclCntom: '42', oprVhclCntom: '22', avlVhclCntom: '20', rsvtNocs: '15', wtngNocs: '2' },
  { cntrId: 'TC006', cntrNm: '노원구 교통약자 이동지원센터', tvhclCntom: '20', oprVhclCntom: '11', avlVhclCntom: '9',  rsvtNocs: '8',  wtngNocs: '1' },
];

// =============================================
// 공공도서관
// =============================================

export const MOCK_LIBRARIES: Library[] = [
  { pblibId: 'LIB001', pblibNm: '서울도서관',         lat: '37.5662', lot: '126.9785', pblibRoadNmAddr: '서울특별시 중구 세종대로 110' },
  { pblibId: 'LIB002', pblibNm: '종로도서관',         lat: '37.5705', lot: '126.9930', pblibRoadNmAddr: '서울특별시 종로구 사직로9길 15-14' },
  { pblibId: 'LIB003', pblibNm: '국립중앙도서관',     lat: '37.5001', lot: '126.9799', pblibRoadNmAddr: '서울특별시 서초구 반포대로 201' },
  { pblibId: 'LIB004', pblibNm: '강남도서관',         lat: '37.5172', lot: '127.0272', pblibRoadNmAddr: '서울특별시 강남구 테헤란로 108길 12' },
  { pblibId: 'LIB005', pblibNm: '마포중앙도서관',     lat: '37.5540', lot: '126.9088', pblibRoadNmAddr: '서울특별시 마포구 독막로 324' },
  { pblibId: 'LIB006', pblibNm: '용산도서관',         lat: '37.5381', lot: '126.9650', pblibRoadNmAddr: '서울특별시 용산구 백범로99길 40' },
  { pblibId: 'LIB007', pblibNm: '영등포구립도서관',   lat: '37.5263', lot: '126.8987', pblibRoadNmAddr: '서울특별시 영등포구 신길로 65' },
];

export const MOCK_LIBRARY_SEATS: LibrarySeat[] = [
  { pblibId: 'LIB001', pblibNm: '서울도서관', rdrmNm: '일반열람실1',   tseatCnt: '200', useSeatCnt: '145', rmndSeatCnt: '55' },
  { pblibId: 'LIB001', pblibNm: '서울도서관', rdrmNm: '일반열람실2',   tseatCnt: '150', useSeatCnt: '98',  rmndSeatCnt: '52' },
  { pblibId: 'LIB001', pblibNm: '서울도서관', rdrmNm: '디지털자료실',  tseatCnt: '80',  useSeatCnt: '42',  rmndSeatCnt: '38' },
  { pblibId: 'LIB002', pblibNm: '종로도서관', rdrmNm: '일반열람실',    tseatCnt: '120', useSeatCnt: '76',  rmndSeatCnt: '44' },
  { pblibId: 'LIB002', pblibNm: '종로도서관', rdrmNm: '어린이열람실',  tseatCnt: '60',  useSeatCnt: '18',  rmndSeatCnt: '42' },
  { pblibId: 'LIB003', pblibNm: '국립중앙도서관', rdrmNm: '일반열람실1',   tseatCnt: '500', useSeatCnt: '321', rmndSeatCnt: '179' },
  { pblibId: 'LIB003', pblibNm: '국립중앙도서관', rdrmNm: '일반열람실2',   tseatCnt: '500', useSeatCnt: '412', rmndSeatCnt: '88' },
  { pblibId: 'LIB003', pblibNm: '국립중앙도서관', rdrmNm: '고문헌실',      tseatCnt: '50',  useSeatCnt: '22',  rmndSeatCnt: '28' },
  { pblibId: 'LIB004', pblibNm: '강남도서관', rdrmNm: '일반열람실',    tseatCnt: '180', useSeatCnt: '110', rmndSeatCnt: '70' },
  { pblibId: 'LIB004', pblibNm: '강남도서관', rdrmNm: '노트북열람실',  tseatCnt: '60',  useSeatCnt: '55',  rmndSeatCnt: '5' },
  { pblibId: 'LIB005', pblibNm: '마포중앙도서관', rdrmNm: '일반열람실',    tseatCnt: '160', useSeatCnt: '89',  rmndSeatCnt: '71' },
  { pblibId: 'LIB005', pblibNm: '마포중앙도서관', rdrmNm: '디지털자료실',  tseatCnt: '40',  useSeatCnt: '27',  rmndSeatCnt: '13' },
  { pblibId: 'LIB006', pblibNm: '용산도서관', rdrmNm: '일반열람실',    tseatCnt: '100', useSeatCnt: '63',  rmndSeatCnt: '37' },
  { pblibId: 'LIB007', pblibNm: '영등포구립도서관', rdrmNm: '일반열람실',    tseatCnt: '140', useSeatCnt: '91',  rmndSeatCnt: '49' },
];

// =============================================
// 신호등 교차로
// =============================================

export const MOCK_TRAFFIC_LIGHTS: TrafficLightCrossroad[] = [
  { crsrdId: 'TL001', crsrdNm: '광화문 사거리',     mapCtptIntLat: '37.5719', mapCtptIntLot: '126.9768' },
  { crsrdId: 'TL002', crsrdNm: '종로3가 사거리',    mapCtptIntLat: '37.5704', mapCtptIntLot: '126.9917' },
  { crsrdId: 'TL003', crsrdNm: '강남역 사거리',     mapCtptIntLat: '37.4979', mapCtptIntLot: '127.0276' },
  { crsrdId: 'TL004', crsrdNm: '서울역 광장',       mapCtptIntLat: '37.5547', mapCtptIntLot: '126.9707' },
  { crsrdId: 'TL005', crsrdNm: '시청 앞 사거리',    mapCtptIntLat: '37.5663', mapCtptIntLot: '126.9779' },
  { crsrdId: 'TL006', crsrdNm: '홍대입구 사거리',   mapCtptIntLat: '37.5572', mapCtptIntLot: '126.9241' },
  { crsrdId: 'TL007', crsrdNm: '신촌 오거리',       mapCtptIntLat: '37.5555', mapCtptIntLot: '126.9368' },
  { crsrdId: 'TL008', crsrdNm: '교대역 사거리',     mapCtptIntLat: '37.4937', mapCtptIntLot: '127.0144' },
];

export const MOCK_TRAFFIC_LIGHT_STATUS: TrafficLightStatus[] = [
  { crsrdId: 'TL001', ntPdsgRmndCs: '300', ntPdsgSttsNm: 'stop-And-Remain', etStsgRmndCs: '300', etStsgSttsNm: 'protected-Movement-Allowed', stPdsgRmndCs: '300', stPdsgSttsNm: 'stop-And-Remain', wtStsgRmndCs: '300', wtStsgSttsNm: 'protected-Movement-Allowed' },
  { crsrdId: 'TL002', ntPdsgRmndCs: '150', ntPdsgSttsNm: 'permissive-Movement-Allowed', etStsgRmndCs: '150', etStsgSttsNm: 'stop-And-Remain', stPdsgRmndCs: '150', stPdsgSttsNm: 'permissive-Movement-Allowed', wtStsgRmndCs: '150', wtStsgSttsNm: 'stop-And-Remain' },
  { crsrdId: 'TL003', ntPdsgRmndCs: '450', ntPdsgSttsNm: 'permissive-Movement-Allowed', etStsgRmndCs: '450', etStsgSttsNm: 'stop-And-Remain', stPdsgRmndCs: '450', stPdsgSttsNm: 'permissive-Movement-Allowed', wtStsgRmndCs: '450', wtStsgSttsNm: 'stop-And-Remain' },
  { crsrdId: 'TL004', ntPdsgRmndCs: '80', ntPdsgSttsNm: 'stop-And-Remain', etStsgRmndCs: '380', etStsgSttsNm: 'stop-And-Remain', stPdsgRmndCs: '80', stPdsgSttsNm: 'stop-And-Remain', wtStsgRmndCs: '380', wtStsgSttsNm: 'stop-And-Remain' },
  { crsrdId: 'TL005', ntPdsgRmndCs: '220', ntPdsgSttsNm: 'permissive-Movement-Allowed', etStsgRmndCs: '220', etStsgSttsNm: 'stop-And-Remain', stPdsgRmndCs: '220', stPdsgSttsNm: 'permissive-Movement-Allowed', wtStsgRmndCs: '220', wtStsgSttsNm: 'stop-And-Remain' },
  { crsrdId: 'TL006', ntPdsgRmndCs: '350', ntPdsgSttsNm: 'stop-And-Remain', etStsgRmndCs: '350', etStsgSttsNm: 'permissive-Movement-Allowed' },
  { crsrdId: 'TL007', ntPdsgRmndCs: '120', ntPdsgSttsNm: 'permissive-Movement-Allowed', etStsgRmndCs: '120', etStsgSttsNm: 'stop-And-Remain' },
  { crsrdId: 'TL008', ntPdsgRmndCs: '500', ntPdsgSttsNm: 'stop-And-Remain', etStsgRmndCs: '500', etStsgSttsNm: 'permissive-Movement-Allowed' },
];

// =============================================
// 민원실 (서울 구청)
// =============================================

export const MOCK_CIVIL_OFFICES: CivilOffice[] = [
  { csoSn: 'CS001', csoNm: '종로구청 민원실',   lat: '37.5735', lot: '126.9790', roadNmAddr: '서울특별시 종로구 종로1길 36',       wkdyOperBgngTm: '090000', wkdyOperEndTm: '180000' },
  { csoSn: 'CS002', csoNm: '강남구청 민원실',   lat: '37.5172', lot: '127.0473', roadNmAddr: '서울특별시 강남구 학동로 426',       wkdyOperBgngTm: '090000', wkdyOperEndTm: '180000' },
  { csoSn: 'CS003', csoNm: '마포구청 민원실',   lat: '37.5639', lot: '126.9010', roadNmAddr: '서울특별시 마포구 월드컵로 212',     wkdyOperBgngTm: '090000', wkdyOperEndTm: '180000' },
  { csoSn: 'CS004', csoNm: '서초구청 민원실',   lat: '37.4835', lot: '127.0325', roadNmAddr: '서울특별시 서초구 남부순환로 2584', wkdyOperBgngTm: '090000', wkdyOperEndTm: '180000' },
  { csoSn: 'CS005', csoNm: '영등포구청 민원실', lat: '37.5260', lot: '126.8963', roadNmAddr: '서울특별시 영등포구 당산로 123',     wkdyOperBgngTm: '090000', wkdyOperEndTm: '180000' },
  { csoSn: 'CS006', csoNm: '중구청 민원실',     lat: '37.5640', lot: '126.9979', roadNmAddr: '서울특별시 중구 창경궁로 17',       wkdyOperBgngTm: '090000', wkdyOperEndTm: '180000' },
];

export const MOCK_CIVIL_WAIT: CivilOfficeWait[] = [
  { csoSn: 'CS001', csoNm: '종로구청 민원실',   taskNm: '주민등록',   wtngCnt: 3,  clotNo: '15' },
  { csoSn: 'CS001', csoNm: '종로구청 민원실',   taskNm: '여권발급',   wtngCnt: 8,  clotNo: '42' },
  { csoSn: 'CS001', csoNm: '종로구청 민원실',   taskNm: '인감증명',   wtngCnt: 2,  clotNo: '8' },
  { csoSn: 'CS002', csoNm: '강남구청 민원실',   taskNm: '주민등록',   wtngCnt: 12, clotNo: '56' },
  { csoSn: 'CS002', csoNm: '강남구청 민원실',   taskNm: '여권발급',   wtngCnt: 15, clotNo: '78' },
  { csoSn: 'CS002', csoNm: '강남구청 민원실',   taskNm: '건축민원',   wtngCnt: 5,  clotNo: '23' },
  { csoSn: 'CS003', csoNm: '마포구청 민원실',   taskNm: '주민등록',   wtngCnt: 6,  clotNo: '30' },
  { csoSn: 'CS003', csoNm: '마포구청 민원실',   taskNm: '여권발급',   wtngCnt: 4,  clotNo: '19' },
  { csoSn: 'CS004', csoNm: '서초구청 민원실',   taskNm: '주민등록',   wtngCnt: 9,  clotNo: '44' },
  { csoSn: 'CS004', csoNm: '서초구청 민원실',   taskNm: '건축민원',   wtngCnt: 11, clotNo: '52' },
  { csoSn: 'CS005', csoNm: '영등포구청 민원실', taskNm: '주민등록',   wtngCnt: 7,  clotNo: '33' },
  { csoSn: 'CS005', csoNm: '영등포구청 민원실', taskNm: '인감증명',   wtngCnt: 3,  clotNo: '14' },
  { csoSn: 'CS006', csoNm: '중구청 민원실',     taskNm: '주민등록',   wtngCnt: 2,  clotNo: '9' },
  { csoSn: 'CS006', csoNm: '중구청 민원실',     taskNm: '여권발급',   wtngCnt: 6,  clotNo: '28' },
];

// =============================================
// 버스 노선 및 실시간 위치
// =============================================

export const MOCK_BUS_ROUTES: BusRoute[] = [
  { rteId: 'BR001', rteNo: '151',  rteType: '간선', stpnt: '종로5가',    edpnt: '영등포역'   },
  { rteId: 'BR002', rteNo: '472',  rteType: '간선', stpnt: '강남역',     edpnt: '서울역'     },
  { rteId: 'BR003', rteNo: '7016', rteType: '지선', stpnt: '마포구청',   edpnt: '시청'       },
  { rteId: 'BR004', rteNo: '273',  rteType: '간선', stpnt: '광화문',     edpnt: '강남구청'   },
  { rteId: 'BR005', rteNo: '8001', rteType: '광역', stpnt: '수원역',     edpnt: '강남역'     },
];

export const MOCK_BUS_LOCATIONS: BusLocation[] = [
  { rteId: 'BR001', vhclNo: '서울74사1234', lat: '37.5710', lot: '126.9870', oprSpd: '25', oprDrct: '180' },
  { rteId: 'BR001', vhclNo: '서울74사1235', lat: '37.5593', lot: '126.9710', oprSpd: '18', oprDrct: '200' },
  { rteId: 'BR002', vhclNo: '서울74사2001', lat: '37.5050', lot: '127.0250', oprSpd: '30', oprDrct: '270' },
  { rteId: 'BR002', vhclNo: '서울74사2002', lat: '37.5200', lot: '127.0100', oprSpd: '22', oprDrct: '300' },
  { rteId: 'BR003', vhclNo: '서울74사3001', lat: '37.5600', lot: '126.9150', oprSpd: '15', oprDrct: '90'  },
  { rteId: 'BR004', vhclNo: '서울74사4001', lat: '37.5660', lot: '126.9800', oprSpd: '20', oprDrct: '135' },
  { rteId: 'BR005', vhclNo: '경기72사5001', lat: '37.4850', lot: '127.0320', oprSpd: '45', oprDrct: '0'   },
];

// =============================================
// 공영 물품보관함
// =============================================

export const MOCK_LOCKERS: Locker[] = [
  { stlckId: 'LK001', stlckRprsPstnNm: '서울역 물품보관함',       lat: '37.5547', lot: '126.9707', fcltRoadNmAddr: '서울특별시 용산구 한강대로 405' },
  { stlckId: 'LK002', stlckRprsPstnNm: '광화문역 물품보관함',     lat: '37.5719', lot: '126.9769', fcltRoadNmAddr: '서울특별시 종로구 새문안로 70' },
  { stlckId: 'LK003', stlckRprsPstnNm: '강남역 물품보관함',       lat: '37.4979', lot: '127.0276', fcltRoadNmAddr: '서울특별시 강남구 강남대로 396' },
  { stlckId: 'LK004', stlckRprsPstnNm: '홍대입구역 물품보관함',   lat: '37.5572', lot: '126.9241', fcltRoadNmAddr: '서울특별시 마포구 양화로 160' },
  { stlckId: 'LK005', stlckRprsPstnNm: '종로3가역 물품보관함',    lat: '37.5704', lot: '126.9917', fcltRoadNmAddr: '서울특별시 종로구 종로 199' },
  { stlckId: 'LK006', stlckRprsPstnNm: '교대역 물품보관함',       lat: '37.4937', lot: '127.0144', fcltRoadNmAddr: '서울특별시 서초구 서초대로 301' },
];

export const MOCK_LOCKER_REALTIME: LockerRealtime[] = [
  { stlckId: 'LK001', usePsbltyLrgszStlckCnt: '5',  usePsbltyMdmszStlckCnt: '12', usePsbltySmlszStlckCnt: '20' },
  { stlckId: 'LK002', usePsbltyLrgszStlckCnt: '2',  usePsbltyMdmszStlckCnt: '8',  usePsbltySmlszStlckCnt: '15' },
  { stlckId: 'LK003', usePsbltyLrgszStlckCnt: '0',  usePsbltyMdmszStlckCnt: '3',  usePsbltySmlszStlckCnt: '7'  },
  { stlckId: 'LK004', usePsbltyLrgszStlckCnt: '8',  usePsbltyMdmszStlckCnt: '20', usePsbltySmlszStlckCnt: '35' },
  { stlckId: 'LK005', usePsbltyLrgszStlckCnt: '3',  usePsbltyMdmszStlckCnt: '6',  usePsbltySmlszStlckCnt: '11' },
  { stlckId: 'LK006', usePsbltyLrgszStlckCnt: '1',  usePsbltyMdmszStlckCnt: '4',  usePsbltySmlszStlckCnt: '9'  },
];
