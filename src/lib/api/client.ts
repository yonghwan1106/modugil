// =============================================
// 공공데이터포털 API 공통 클라이언트
// =============================================

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
 * 응답 포맷 3가지를 자동 감지합니다:
 * - v2 API (transport/library/locker): {header, body: {item: []}}
 * - rti/cso/rte API (traffic/civil/bus): {header, body: {items: {item: []}}}
 * - response 래핑: {response: {header, body: {items: []}}}
 */
export async function fetchPublicData<T>(
  endpoint: string,
  params?: Record<string, string>,
  options?: { revalidate?: number }
): Promise<T[]> {
  const serviceKey = process.env.DATA_API_KEY;
  if (!serviceKey) {
    throw new Error('DATA_API_KEY 환경변수가 설정되지 않았습니다.');
  }

  // 캐시 키: 엔드포인트 + 파라미터 직렬화
  const cacheKey = `${endpoint}?${new URLSearchParams({ ...params }).toString()}`;
  const cached = getCached<T>(cacheKey);
  if (cached) return cached;

  // 쿼리 파라미터 조합 — serviceKey는 이미 인코딩된 상태이므로 URLSearchParams를 거치지 않음
  const otherParams = new URLSearchParams({
    type: 'json',
    pageNo: '1',
    numOfRows: '100',
    ...params,
  });

  const url = `${endpoint}?serviceKey=${serviceKey}&${otherParams.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { Accept: 'application/json' },
      ...(options?.revalidate
        ? { next: { revalidate: options.revalidate } }
        : { cache: 'no-store' as const }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('API 응답 시간 초과 (8초)');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    throw new Error(`API 요청 실패: HTTP ${res.status} — ${url}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('json')) {
    throw new Error(`API가 JSON이 아닌 응답 반환 (${res.status}, ${contentType})`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json = await res.json() as any;

  // 응답 구조 자동 감지
  const root = json.response ?? json;
  const { resultCode, resultMsg } = root.header;

  if (resultCode !== '00' && resultCode !== 'K0') {
    throw new Error(`API 오류 [${resultCode}]: ${resultMsg}`);
  }

  const body = root.body;
  // body.items.item (rti/cso/rte), body.item (v2), body.items (legacy)
  const items: T[] = body?.items?.item ?? body?.item ?? body?.items ?? [];
  setCached<T>(cacheKey, items);
  return items;
}

/**
 * 캐시를 수동으로 초기화합니다 (테스트 또는 강제 갱신 시 사용).
 */
export function clearApiCache(): void {
  cache.clear();
}
