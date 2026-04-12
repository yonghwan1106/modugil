import type { NextRequest } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { chatStream } from '@/lib/ai/claude';
import { executeToolCall } from './tool-executor';
import type { ToolResult } from '@/lib/ai/claude';

const TIMEOUT_MS = 30_000;

// =============================================
// Rate Limiting (인메모리 토큰 버킷)
// =============================================

const ipBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = { requests: 20, windowMs: 60_000 };

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs });
    return true;
  }
  if (bucket.count >= RATE_LIMIT.requests) return false;
  bucket.count++;
  return true;
}

// =============================================
// 키워드 기반 도구 라우터 (선언적 설정)
// =============================================

const TOOL_ROUTING: { keywords: RegExp; tool: string; alsoInclude?: string[] }[] = [
  { keywords: /도서관|빈자리|열람실|좌석/, tool: 'get_library_seats', alsoInclude: ['get_accessible_transport'] },
  { keywords: /민원실|민원|대기 현황|대기시간|대기 시간/, tool: 'get_civil_office_wait', alsoInclude: ['get_accessible_transport'] },
  { keywords: /교통약자 차량|이동지원|특별교통/, tool: 'get_accessible_transport' },
  { keywords: /신호등|횡단보도/, tool: 'get_traffic_light_status' },
  { keywords: /버스|저상버스/, tool: 'get_bus_realtime_location' },
  { keywords: /자전거|따릉이|대여소/, tool: 'get_bicycle_availability' },
  { keywords: /보관함|물품보관|짐 보관|짐보관|락커/, tool: 'get_locker_availability' },
];

const DEFAULT_TOOLS = ['get_accessible_transport', 'get_traffic_light_status'];

function getRequiredTools(text: string): string[] {
  const tools = new Set<string>();
  for (const route of TOOL_ROUTING) {
    if (route.keywords.test(text)) {
      tools.add(route.tool);
      route.alsoInclude?.forEach((t) => tools.add(t));
    }
  }
  return tools.size > 0 ? [...tools] : DEFAULT_TOOLS;
}

// 텍스트에서 지역명 추출 (단순 패턴 매칭)
function extractRegion(text: string): string {
  // 구체적인 구/군 먼저 매핑
  const districtMap: Record<string, string> = {
    '강남': '서울 강남구', '강남구': '서울 강남구', '강남역': '서울 강남구',
    '종로': '서울 종로구', '종로구': '서울 종로구',
    '중구': '서울 중구', '서울역': '서울 중구',
    '마포': '서울 마포구', '마포구': '서울 마포구',
    '영등포': '서울 영등포구', '영등포구': '서울 영등포구',
    '송파': '서울 송파구', '송파구': '서울 송파구',
    '노원': '서울 노원구', '노원구': '서울 노원구',
    '서초': '서울 서초구', '서초구': '서울 서초구',
    '용산': '서울 용산구', '용산구': '서울 용산구',
    '성동': '서울 성동구', '성동구': '서울 성동구',
    '동작': '서울 동작구', '동작구': '서울 동작구',
    '관악': '서울 관악구', '관악구': '서울 관악구',
    '강서': '서울 강서구', '강서구': '서울 강서구',
    '은평': '서울 은평구', '은평구': '서울 은평구',
    '서대문': '서울 서대문구', '서대문구': '서울 서대문구',
    '강동': '서울 강동구', '강동구': '서울 강동구',
    '강북': '서울 강북구', '강북구': '서울 강북구',
    '광진': '서울 광진구', '광진구': '서울 광진구',
    '구로': '서울 구로구', '구로구': '서울 구로구',
    '금천': '서울 금천구', '금천구': '서울 금천구',
    '도봉': '서울 도봉구', '도봉구': '서울 도봉구',
    '동대문': '서울 동대문구', '동대문구': '서울 동대문구',
    '성북': '서울 성북구', '성북구': '서울 성북구',
    '양천': '서울 양천구', '양천구': '서울 양천구',
    '중랑': '서울 중랑구', '중랑구': '서울 중랑구',
    // 주요 랜드마크 → 구 매핑
    '여의도': '서울 영등포구', '잠실': '서울 송파구', '잠실역': '서울 송파구',
    '홍대': '서울 마포구', '홍대입구': '서울 마포구', '합정': '서울 마포구',
    '이태원': '서울 용산구', '한남': '서울 용산구',
    '신촌': '서울 서대문구', '연대': '서울 서대문구',
    '건대': '서울 광진구', '건대입구': '서울 광진구',
    '목동': '서울 양천구', '신림': '서울 관악구', '신림역': '서울 관악구',
    '왕십리': '서울 성동구', '성수': '서울 성동구', '성수동': '서울 성동구',
    '혜화': '서울 종로구', '대학로': '서울 종로구', '광화문': '서울 종로구',
    '명동': '서울 중구',
    '사당': '서울 동작구', '노량진': '서울 동작구',
    '부산': '부산', '대구': '대구', '인천': '인천',
    '광주': '광주', '대전': '대전', '울산': '울산', '세종': '세종',
  };
  for (const [keyword, region] of Object.entries(districtMap)) {
    if (text.includes(keyword)) return region;
  }
  return '서울';
}

// =============================================
// POST handler — SSE streaming
// =============================================

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      {
        message: 'AI 서비스 설정이 완료되지 않았습니다. 관리자에게 문의해 주세요.',
        toolResults: [],
        error: true,
      },
      { status: 503 },
    );
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return Response.json(
      { message: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.', toolResults: [], error: true },
      { status: 429 },
    );
  }

  try {
    const body = await request.json() as { messages: Anthropic.Messages.MessageParam[]; userType?: string };
    const { messages, userType } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        {
          message: '메시지가 없습니다. 질문을 입력해 주세요.',
          toolResults: [],
          error: true,
        },
        { status: 400 },
      );
    }

    // 마지막 사용자 메시지 텍스트 추출
    const lastMsg = messages[messages.length - 1];
    const userText = lastMsg?.role === 'user' && typeof lastMsg.content === 'string'
      ? lastMsg.content
      : '';

    // 키워드 기반으로 필요한 도구 목록 & 지역 결정
    const requiredTools = getRequiredTools(userText);
    const region = extractRegion(userText);

    // 필요한 도구를 서버에서 직접 병렬 실행 (pre-exec 플로우 — 변경 없음)
    const preExecutedResults = await Promise.all(
      requiredTools.map(async (toolName) => {
        const input: Record<string, unknown> = { region, ...(userType ? { userType } : {}) };
        try {
          const output = await executeToolCall(toolName, input);
          return { toolName, input, output, isError: false };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          return {
            toolName,
            input,
            output: { error: `${toolName} 조회 중 오류가 발생했습니다: ${errorMessage}` },
            isError: true,
          };
        }
      }),
    );

    // toolResults (프론트 지도 마커용)
    const toolResults: ToolResult[] = preExecutedResults.map(({ toolName, input, output }) => ({
      toolName,
      input,
      output,
    }));

    // Claude에게 도구 결과를 포함한 컨텍스트로 자연어 응답 생성 요청
    const toolDataSummary = preExecutedResults
      .map(({ toolName, output }) => `[${toolName} 결과]\n${JSON.stringify(output, null, 2)}`)
      .join('\n\n');

    const augmentedMessages: Anthropic.Messages.MessageParam[] = [
      ...messages.slice(0, -1),
      {
        role: 'user' as const,
        content: `${userText}\n\n--- 실시간 데이터 조회 결과 ---\n${toolDataSummary}\n\n위 데이터를 바탕으로 질문에 답변해 주세요.${userType ? `\n\n--- 사용자 유형: ${userType} ---\n이 사용자의 유형에 맞춰 답변해 주세요.` : ''}`,
      },
    ];

    // SSE ReadableStream 생성
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const enqueue = (obj: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(obj)}\n\n`),
          );
        };

        try {
          // 0) 상태 안내
          enqueue({ type: 'status', data: '공공데이터 조회 완료, AI 분석 중...' });

          // 1) toolResults를 지도 마커용으로 먼저 전송
          enqueue({ type: 'toolResults', data: toolResults });

          // 2) Claude stream 시작 (timeout 래핑)
          const claudeStream = chatStream(augmentedMessages);

          const timeoutId = setTimeout(() => {
            claudeStream.abort();
          }, TIMEOUT_MS);

          try {
            for await (const event of claudeStream) {
              if (
                event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta'
              ) {
                enqueue({ type: 'text', data: event.delta.text });
              }
            }
          } finally {
            clearTimeout(timeoutId);
          }

          // 3) 완료 신호
          enqueue({ type: 'done' });
        } catch (err) {
          console.error('[chat/route] stream error:', err);
          const errorMessage =
            err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
          enqueue({
            type: 'error',
            data: `죄송합니다. ${errorMessage} 잠시 후 다시 시도해 주세요.`,
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[chat/route] error:', err);
    const errorMessage =
      err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    return Response.json(
      {
        message: `죄송합니다. ${errorMessage} 잠시 후 다시 시도해 주세요.`,
        toolResults: [],
        error: true,
      },
      { status: 500 },
    );
  }
}
