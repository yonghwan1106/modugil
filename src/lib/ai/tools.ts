import type Anthropic from '@anthropic-ai/sdk';

export const AI_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'get_traffic_light_status',
    description:
      '특정 지역의 교차로 신호등 실시간 잔여시간과 점등상태를 조회합니다. ' +
      '교통약자의 안전한 횡단보도 보행을 위해 사용됩니다. ' +
      '신호 잔여 시간(초), 현재 신호 색상(RED/GREEN/YELLOW), 교차로명, 위도·경도 정보를 반환합니다.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          description: '지자체코드(숫자) 또는 지역명 (예: "서울 종로구", "부산 해운대구")',
        },
      },
      required: ['region'],
    },
  },
  {
    name: 'get_accessible_transport',
    description:
      '교통약자 이동지원 센터의 가용 차량 수, 예약 건수, 대기 건수를 실시간으로 조회합니다. ' +
      '장애인·고령자·임산부 등 교통약자가 이동지원 서비스를 이용할 수 있는지 확인할 때 사용합니다. ' +
      '센터명, 전화번호, 운행 중인 차량 수, 사용 가능 차량 수, 예약 건수, 대기 건수를 반환합니다.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          description: '지자체코드(숫자) 또는 지역명 (예: "서울 강남구", "대구 달서구")',
        },
      },
      required: ['region'],
    },
  },
  {
    name: 'get_bus_realtime_location',
    description:
      '특정 지역의 버스 노선 실시간 위치(위도, 경도, 속도, 방향각)를 조회합니다. ' +
      '저상버스 운행 여부 확인, 버스 도착 예정 시간 파악 등에 활용됩니다. ' +
      '노선 번호, 차량 번호, 현재 위도·경도, 속도(km/h), 방향각을 반환합니다.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          description: '지자체코드(숫자) 또는 지역명 (예: "서울 노원구", "인천 부평구")',
        },
        routeNo: {
          type: 'string',
          description: '조회할 버스 노선 번호 (예: "272", "9403"). 생략하면 해당 지역 전체 노선을 조회합니다.',
        },
      },
      required: ['region'],
    },
  },
  {
    name: 'get_library_seats',
    description:
      '특정 지역 공공도서관 열람실의 실시간 좌석 현황(총 좌석 수, 사용 중 좌석 수, 잔여 좌석 수)을 조회합니다. ' +
      '도서관 이름, 위치(위도·경도), 도로명 주소, 각 열람실별 좌석 현황을 반환합니다.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          description: '지자체코드(숫자) 또는 지역명 (예: "서울 마포구", "경기 성남시")',
        },
        libraryName: {
          type: 'string',
          description: '특정 도서관명으로 필터링할 때 사용합니다 (예: "마포구립 서강도서관"). 생략하면 해당 지역 전체 도서관을 조회합니다.',
        },
      },
      required: ['region'],
    },
  },
  {
    name: 'get_bicycle_availability',
    description:
      '특정 지역의 공영자전거 대여소 위치와 실시간 대여 가능 자전거 수를 조회합니다. ' +
      '따릉이(서울), 타슈(대전) 등 지자체 공영자전거 대여소명, 주소, 위치(위도·경도), 거치대 수를 반환합니다.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          description: '지역명 (예: "서울 종로구", "서울 마포구", "서울"). 서울은 lcgvmnInstCd=1100000000으로 조회됩니다.',
        },
      },
      required: ['region'],
    },
  },
  {
    name: 'get_civil_office_wait',
    description:
      '특정 지역 민원실의 업무별 실시간 대기 인원수와 예상 대기 시간을 조회합니다. ' +
      '교통약자가 불필요하게 장시간 대기하지 않도록 사전에 혼잡도를 파악하는 데 사용합니다. ' +
      '민원실명, 위치(위도·경도), 도로명 주소, 운영 시간, 업무별 대기 인원수를 반환합니다.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          description: '지자체코드(숫자) 또는 지역명 (예: "서울 종로구", "광주 북구")',
        },
        taskName: {
          type: 'string',
          description: '특정 민원 업무명으로 필터링할 때 사용합니다 (예: "주민등록", "여권"). 생략하면 전체 업무를 조회합니다.',
        },
      },
      required: ['region'],
    },
  },
  {
    name: 'get_locker_availability',
    description:
      '특정 지역의 공영 물품보관함(락커) 위치와 실시간 사용 가능 현황(대형·중형·소형)을 조회합니다. ' +
      '교통약자가 짐을 보관하고 가볍게 이동할 수 있도록 사용됩니다. ' +
      '보관함명, 위치(위도·경도), 도로명 주소, 대형/중형/소형 보관함 사용 가능 수를 반환합니다.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          description: '지자체코드(숫자) 또는 지역명 (예: "서울 종로구", "서울 강남구")',
        },
      },
      required: ['region'],
    },
  },
];
