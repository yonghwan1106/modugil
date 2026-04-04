// =============================================
// 공공데이터포털 API 응답 타입 정의
// =============================================

// =============================================
// 1. 공영자전거 (pbdo_v2)
// =============================================

/** 공영자전거 대여소 정보 */
export interface BikeStation {
  rntstnId: string;    // 대여소 ID
  rntstnNm: string;    // 대여소명
  lat: string;         // 위도 (문자열)
  lot: string;         // 경도 (문자열)
  roadNmAddr: string;  // 도로명주소
}

/** 공영자전거 실시간 가용 현황 */
export interface BikeAvailability {
  rntstnId: string;       // 대여소 ID
  bcyclTpkctNocs: number; // 자전거 주차 총 거치대 수
  rntNocs: number;        // 대여 가능 자전거 수
  rtnNocs: number;        // 반납 가능 거치대 수
}

// =============================================
// 2. 교통약자 이동지원 (tsdo_v2)
// =============================================

/** 교통약자 이동지원 센터 정보 */
export interface TransportCenter {
  cntrId: string;          // 센터 ID
  cntrNm: string;          // 센터명
  lat: string;             // 위도
  lot: string;             // 경도
  cntrTelno: string;       // 전화번호
  cntrRoadNmAddr: string;  // 도로명주소
  stdgCd: string;          // 지역코드
  lclgvNm: string;         // 지자체명
  hldVhclTcntom: string;   // 보유 차량 수
}

/** 교통약자 이동지원 차량 가용 현황 */
export interface TransportVehicleUse {
  cntrId: string;         // 센터 ID
  cntrNm: string;         // 센터명
  tvhclCntom: string;     // 총 차량 수
  oprVhclCntom: string;   // 운행 차량 수
  avlVhclCntom: string;   // 사용 가능 차량 수
  rsvtNocs: string;       // 예약 건수
  wtngNocs: string;       // 대기 건수
}

// =============================================
// 3. 공공도서관 열람실 (plr_v2)
// =============================================

/** 공공도서관 정보 */
export interface Library {
  pblibId: string;       // 도서관 ID
  pblibNm: string;       // 도서관명
  lat: string;           // 위도
  lot: string;           // 경도
  pblibRoadNmAddr: string; // 도로명주소
}

/** 공공도서관 열람실 좌석 현황 */
export interface LibrarySeat {
  pblibId: string;    // 도서관 ID
  pblibNm: string;    // 도서관명
  rdrmNm: string;     // 열람실명
  tseatCnt: string;   // 총 좌석 수
  useSeatCnt: string; // 사용 중 좌석 수
  rmndSeatCnt: string; // 잔여 좌석 수
}

// =============================================
// 4. 공영 물품보관함 (psl_v2)
// =============================================

/** 공영 물품보관함 정보 */
export interface Locker {
  stlckId: string;          // 보관함 ID
  stlckRprsPstnNm: string;  // 보관함명
  lat: string;              // 위도
  lot: string;              // 경도
  fcltRoadNmAddr: string;   // 도로명주소
}

/** 공영 물품보관함 실시간 가용 현황 */
export interface LockerRealtime {
  stlckId: string;                // 보관함 ID
  usePsbltyLrgszStlckCnt: string; // 대형 보관함 사용 가능 수
  usePsbltyMdmszStlckCnt: string; // 중형 보관함 사용 가능 수
  usePsbltySmlszStlckCnt: string; // 소형 보관함 사용 가능 수
}

// =============================================
// 5. 교통안전 신호등 (rti)
// =============================================

/** 교통안전 신호등 교차로 정보 */
export interface TrafficLightCrossroad {
  crsrdId: string;       // 교차로 ID
  crsrdNm: string;       // 교차로명
  mapCtptIntLat: string; // 위도
  mapCtptIntLot: string; // 경도
}

/** 교통안전 신호등 실시간 상태 — 방향별 신호(Bssg=직진, Ltsg=좌회전, Pdsg=보행자, Stsg=직진신호 등) */
export interface TrafficLightStatus {
  crsrdId: string;
  // 북(nt), 동(et), 남(st), 서(wt), 북동(ne), 남동(se), 남서(sw), 북서(nw)
  // 각 방향별 신호 종류: Bssg(직진), Bcsg(버스), Ltsg(좌회전), Pdsg(보행자), Stsg(직진), Utsg(유턴)
  // RmndCs = 잔여시간(0.1초), SttsNm = 신호상태
  [key: string]: string;
}

// =============================================
// 6. 민원실 (cso_v2)
// =============================================

/** 민원실 정보 */
export interface CivilOffice {
  csoSn: string;           // 민원실 일련번호
  csoNm: string;           // 민원실명
  lat: string;             // 위도
  lot: string;             // 경도
  roadNmAddr: string;      // 도로명주소
  wkdyOperBgngTm: string;  // 평일 운영 시작 시간
  wkdyOperEndTm: string;   // 평일 운영 종료 시간
}

/** 민원실 실시간 대기 현황 */
export interface CivilOfficeWait {
  csoSn: string;    // 민원실 일련번호
  csoNm: string;    // 민원실명
  taskNm: string;   // 업무명
  wtngCnt: number;  // 대기 인원 수
  clotNo: string;   // 번호표 번호
}

// =============================================
// 7. 초정밀 버스 (rte)
// =============================================

/** 버스 노선 정보 */
export interface BusRoute {
  rteId: string;    // 노선 ID
  rteNo: string;    // 노선 번호
  rteType: string;  // 노선 유형
  stpnt: string;    // 기점명
  edpnt: string;    // 종점명
}

/** 버스 정류장 정보 */
export interface BusStop {
  rteId: string;   // 노선 ID
  sttnId: string;  // 정류장 ID
  sttnNm: string;  // 정류장명
  sttnNo: string;  // 정류장 번호
  seq: number;     // 순번
  lat: string;     // 위도
  lot: string;     // 경도
}

/** 버스 실시간 위치 정보 */
export interface BusLocation {
  rteId: string;   // 노선 ID
  vhclNo: string;  // 차량 번호
  lat: string;     // 위도
  lot: string;     // 경도
  oprSpd: string;  // 속도
  oprDrct: string; // 방향각
}
