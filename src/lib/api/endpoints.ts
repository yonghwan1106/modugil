// =============================================
// 공공데이터포털 API 엔드포인트 상수
// =============================================

const API_BASE = 'https://apis.data.go.kr/B551982';

export const ENDPOINTS = {
  bicycle: {
    stations: `${API_BASE}/pbdo_v2/inf_101_00010001_v2`,
    availability: `${API_BASE}/pbdo_v2/inf_101_00010002_v2`,
    history: `${API_BASE}/pbdo_v2/inf_101_00010003_v2`,
  },
  transport: {
    centers: `${API_BASE}/tsdo_v2/center_info_v2`,
    vehicles: `${API_BASE}/tsdo_v2/info_vehicle_v2`,
    operations: `${API_BASE}/tsdo_v2/info_vehicle_operation_v2`,
    availability: `${API_BASE}/tsdo_v2/info_vehicle_use_v2`,
  },
  library: {
    info: `${API_BASE}/plr_v2/info_v2`,
    status: `${API_BASE}/plr_v2/prst_info_v2`,
    seats: `${API_BASE}/plr_v2/rlt_rdrm_info_v2`,
  },
  locker: {
    info: `${API_BASE}/psl_v2/locker_info_v2`,
    detail: `${API_BASE}/psl_v2/locker_detail_info_v2`,
    realtime: `${API_BASE}/psl_v2/locker_realtime_use_v2`,
  },
  trafficLight: {
    crossroads: `${API_BASE}/rti/crsrd_map_info`,
    status: `${API_BASE}/rti/tl_drct_info`,
  },
  civil: {
    info: `${API_BASE}/cso_v2/cso_info_v2`,
    realtime: `${API_BASE}/cso_v2/cso_realtime_v2`,
  },
  bus: {
    routes: `${API_BASE}/rte/mst_info`,
    stops: `${API_BASE}/rte/ps_info`,
    locations: `${API_BASE}/rte/rtm_loc_info`,
  },
} as const;
