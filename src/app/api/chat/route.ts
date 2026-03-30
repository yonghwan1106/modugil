import type { NextRequest } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { chat } from '@/lib/ai/claude';
import { executeToolCall } from './tool-executor';
import type { ToolResult } from '@/lib/ai/claude';

const TIMEOUT_MS = 30_000;

// =============================================
// 키워드 기반 도구 라우터
// =============================================

function getRequiredTools(text: string): string[] {
  const tools: string[] = [];
  if (/도서관|빈자리|열람실|좌석/.test(text)) tools.push('get_library_seats');
  if (/민원실|민원|대기 현황|대기시간|대기 시간/.test(text)) tools.push('get_civil_office_wait');
  if (/교통약자 차량|이동지원|특별교통/.test(text)) tools.push('get_accessible_transport');
  if (/신호등|횡단보도/.test(text)) tools.push('get_traffic_light_status');
  if (/버스|저상버스/.test(text)) tools.push('get_bus_realtime_location');
  if (/자전거|따릉이|대여소/.test(text)) tools.push('get_bicycle_availability');
  if (/보관함|물품보관|짐 보관|짐보관|락커/.test(text)) tools.push('get_locker_availability');
  // 도서관/민원실은 교통약자 차량도 함께
  if (tools.includes('get_library_seats') && !tools.includes('get_accessible_transport')) {
    tools.push('get_accessible_transport');
  }
  if (tools.includes('get_civil_office_wait') && !tools.includes('get_accessible_transport')) {
    tools.push('get_accessible_transport');
  }
  // 아무것도 매칭 안 되면 기본 세트
  if (tools.length === 0) {
    tools.push('get_accessible_transport', 'get_traffic_light_status');
  }
  return tools;
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
    '부산': '부산', '대구': '대구', '인천': '인천',
    '광주': '광주', '대전': '대전', '울산': '울산', '세종': '세종',
  };
  for (const [keyword, region] of Object.entries(districtMap)) {
    if (text.includes(keyword)) return region;
  }
  return '서울';
}

// =============================================
// Claude 호출 헬퍼
// =============================================

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('요청 시간이 초과되었습니다. 다시 시도해 주세요.')), ms),
  );
  return Promise.race([promise, timeout]);
}

async function chatWithRetry(
  messages: Anthropic.Messages.MessageParam[],
  retries = 1,
): Promise<Awaited<ReturnType<typeof chat>>> {
  try {
    return await withTimeout(chat(messages), TIMEOUT_MS);
  } catch (err) {
    if (retries > 0) {
      return chatWithRetry(messages, retries - 1);
    }
    throw err;
  }
}

// =============================================
// POST handler
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

  try {
    const body = await request.json() as { messages: Anthropic.Messages.MessageParam[] };
    const { messages } = body;

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

    // 필요한 도구를 서버에서 직접 병렬 실행
    const preExecutedResults = await Promise.all(
      requiredTools.map(async (toolName) => {
        const input: Record<string, unknown> = { region };
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
    // tool_use 없이 직접 데이터를 사용자 메시지에 포함
    const toolDataSummary = preExecutedResults
      .map(({ toolName, output }) => `[${toolName} 결과]\n${JSON.stringify(output, null, 2)}`)
      .join('\n\n');

    const augmentedMessages: Anthropic.Messages.MessageParam[] = [
      ...messages.slice(0, -1),
      {
        role: 'user' as const,
        content: `${userText}\n\n--- 실시간 데이터 조회 결과 ---\n${toolDataSummary}\n\n위 데이터를 바탕으로 질문에 답변해 주세요.`,
      },
    ];

    // Claude 호출 (도구 없이 텍스트 응답만)
    const response = await chatWithRetry(augmentedMessages);

    const textBlock = response.content.find(
      (b): b is Anthropic.Messages.TextBlock => b.type === 'text',
    );

    return Response.json({
      message: textBlock?.text ?? '',
      toolResults,
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
