// =============================================
// 공공데이터포털 API 응답 타입 정의
// =============================================

// 공통 응답 래퍼
export interface ApiResponse<T> {
  response: {
    header: { resultCode: string; resultMsg: string };
    body: {
      items: T[];
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// =============================================
// 1. 공영자전거 (pbdo_v2)
// =============================================

/** 공영자전거 대여소 정보 */
export interface BikeStation {
  rntstnId: string;    // 대여소 ID
  rntstnNm: string;    // 대여소명
  lat: number;         // 위도
  lot: number;         // 경도
  roadNmAddr: string;  // 도로명주소
}

/** 공영자전거 실시간 가용 현황 */
export interface BikeAvailability {
  rntstnId: string;       // 대여소 ID
  bcyclTpkctNocs: number; // 자전거 주차 총 거치대 수 (총 거치 가능 수)
  rntNocs: number;        // 대여 가능 자전거 수
  rtnNocs: number;        // 반납 가능 거치대 수
}

// =============================================
// 2. 교통약자 이동지원 (tsdo_v2)
// =============================================

/** 교통약자 이동지원 센터 정보 */
export interface TransportCenter {
  centerId: string; // 센터 ID
  centerNm: string; // 센터명
  lat: number;      // 위도
  lot: number;      // 경도
  telNo: string;    // 전화번호
}

/** 교통약자 이동지원 차량 가용 현황 */
export interface TransportVehicleUse {
  centerId: string;        // 센터 ID
  operVhcleCnt: number;    // 운행 차량 수
  usePsbltVhcleCnt: number; // 사용 가능 차량 수
  rsrvtnCnt: number;       // 예약 건수
  wtngCnt: number;         // 대기 건수
}

// =============================================
// 3. 공공도서관 열람실 (plr_v2)
// =============================================

/** 공공도서관 정보 */
export interface Library {
  lbrryId: string;    // 도서관 ID
  lbrryNm: string;    // 도서관명
  lat: number;        // 위도
  lot: number;        // 경도
  roadNmAddr: string; // 도로명주소
}

/** 공공도서관 열람실 좌석 현황 */
export interface LibrarySeat {
  lbrryId: string;    // 도서관 ID
  rdrmNm: string;     // 열람실명
  totSeatCnt: number; // 총 좌석 수
  useSeatCnt: number; // 사용 중 좌석 수
}

// =============================================
// 4. 공영 물품보관함 (psl_v2)
// =============================================

/** 공영 물품보관함 정보 */
export interface Locker {
  lckrId: string;     // 보관함 ID
  lckrNm: string;     // 보관함명
  lat: number;        // 위도
  lot: number;        // 경도
  roadNmAddr: string; // 도로명주소
}

/** 공영 물품보관함 실시간 가용 현황 */
export interface LockerRealtime {
  lckrId: string;             // 보관함 ID
  lgLckrUsePsbltCnt: number;  // 대형 보관함 사용 가능 수
  mdLckrUsePsbltCnt: number;  // 중형 보관함 사용 가능 수
  smLckrUsePsbltCnt: number;  // 소형 보관함 사용 가능 수
}

// =============================================
// 5. 교통안전 신호등 (rti)
// =============================================

/** 교통안전 신호등 교차로 정보 */
export interface TrafficLightCrossroad {
  crsrdId: string; // 교차로 ID
  crsrdNm: string; // 교차로명
  lat: number;     // 위도
  lot: number;     // 경도
}

/** 교통안전 신호등 실시간 상태 */
export interface TrafficLightStatus {
  crsrdId: string; // 교차로 ID
  drctCd: string;  // 방향 코드 (N/S/E/W 등)
  rmdrCs: number;  // 잔여 시간(초) - 추정 필드명
  lgtStts: string; // 신호 상태 (RED/GREEN/YELLOW 등) - 추정 필드명
}

// =============================================
// 6. 민원실 (cso_v2)
// =============================================

/** 민원실 정보 */
export interface CivilOffice {
  csoSn: string;         // 민원실 일련번호
  csoNm: string;         // 민원실명
  lat: number;           // 위도
  lot: number;           // 경도
  roadNmAddr: string;    // 도로명주소
  wkdyOperBgngTm: string; // 평일 운영 시작 시간 (HHmm)
  wkdyOperEndTm: string;  // 평일 운영 종료 시간 (HHmm)
}

/** 민원실 실시간 대기 현황 */
export interface CivilOfficeWait {
  csoSn: string;   // 민원실 일련번호
  csoNm: string;   // 민원실명
  taskNm: string;  // 업무명
  wtngCnt: number; // 대기 인원 수
  totDt: string;   // 총 대기 시간 (분 단위 추정) - 추정 필드명
}

// =============================================
// 7. 초정밀 버스 (rte)
// =============================================

/** 버스 노선 정보 */
export interface BusRoute {
  routeId: string;  // 노선 ID
  routeNo: string;  // 노선 번호
  routeTp: string;  // 노선 유형 (일반/급행 등)
  stNm: string;     // 기점명
  edNm: string;     // 종점명
}

/** 버스 정류장 정보 */
export interface BusStop {
  routeId: string; // 노선 ID
  sttnId: string;  // 정류장 ID
  sttnNm: string;  // 정류장명
  sttnNo: string;  // 정류장 번호
  seq: number;     // 순번
  lat: number;     // 위도
  lot: number;     // 경도
}

/** 버스 실시간 위치 정보 */
export interface BusLocation {
  routeId: string;  // 노선 ID
  vhcleNo: string;  // 차량 번호
  lat: number;      // 위도
  lot: number;      // 경도
  spd: number;      // 속도 (km/h)
  drctAngl: number; // 방향각 (도)
}
