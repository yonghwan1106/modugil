// =============================================
// 공공데이터포털 API 공통 클라이언트
// =============================================

import type { ApiResponse } from './types';

// ----------------------
// 메모리 캐시 (Map + TTL)
// ----------------------

const CACHE_TTL_MS = 5 * 60 * 1000; // 5분

interface CacheEntry<T> {
  data: T[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T[] | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached<T>(key: string, data: T[]): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ----------------------
// API 호출 공통 함수
// ----------------------

/**
 * 공공데이터포털 API를 호출하고 items 배열을 반환합니다.
 *
 * @param endpoint - ENDPOINTS 상수에서 가져온 엔드포인트 URL
 * @param params   - 추가 쿼리 파라미터 (예: stdgCd, pageNo, numOfRows 등)
 * @returns items 배열
 *
 * @example
 * const stations = await fetchPublicData<BikeStation>(ENDPOINTS.bicycle.stations, { stdgCd: '11' });
 */
export async function fetchPublicData<T>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T[]> {
  const serviceKey = process.env.DATA_API_KEY;
  if (!serviceKey) {
    throw new Error('DATA_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  // 캐시 키: 엔드포인트 + 파라미터 직렬화
  const cacheKey = `${endpoint}?${new URLSearchParams({ ...params }).toString()}`;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  // 쿼리 파라미터 조합
  const query = new URLSearchParams({
    serviceKey,
    type: 'json',
    pageNo: '1',
    numOfRows: '100',
    ...params,
  });

  const url = `${endpoint}?${query.toString()}`;

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    // Next.js 캐시 비활성화 (실시간 데이터이므로)
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`API 요청 실패: HTTP ${res.status} — ${url}`);
  }

  const json = (await res.json()) as ApiResponse<T>;

  // HTTP 200이어도 body의 resultCode 확인
  const { resultCode, resultMsg } = json.response.header;
  if (resultCode !== '00') {
    throw new Error(`API 오류 [${resultCode}]: ${resultMsg}`);
  }

  const items = json.response.body.items ?? [];
  setCached<T>(cacheKey, items);
  return items;
}

/**
 * 캐시를 수동으로 초기화합니다 (테스트 또는 강제 갱신 시 사용).
 */
export function clearApiCache(): void {
  cache.clear();
}
