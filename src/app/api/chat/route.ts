import type { NextRequest } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { chat } from '@/lib/ai/claude';
import { executeToolCall } from './tool-executor';
import type { ToolResult } from '@/lib/ai/claude';

const TIMEOUT_MS = 30_000;

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

    // 1차 Claude 호출 (재시도 1회, 30초 타임아웃)
    let response = await chatWithRetry(messages);

    // Tool Use 루프 (Claude가 도구 호출을 요청하면 실행)
    const toolResults: ToolResult[] = [];
    let currentMessages: Anthropic.Messages.MessageParam[] = [...messages];

    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use',
      );

      // 도구 병렬 실행 — 개별 도구 실패 시 해당 도구만 에러 처리하고 나머지 계속 진행
      const executedResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          const input = block.input as Record<string, unknown>;
          try {
            const output = await executeToolCall(block.name, input);
            return { block, output, isError: false };
          } catch (err) {
            console.error(`[tool-executor] ${block.name} 실패:`, err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            return {
              block,
              output: { error: `${block.name} 조회 중 오류가 발생했습니다: ${errorMessage}` },
              isError: true,
            };
          }
        }),
      );

      // toolResults 누적 (프론트 지도 마커 업데이트용)
      for (const { block, output } of executedResults) {
        toolResults.push({
          toolName: block.name,
          input: block.input as Record<string, unknown>,
          output,
        });
      }

      // tool_result 메시지 구성
      const toolResultContents: Anthropic.Messages.ToolResultBlockParam[] = executedResults.map(
        ({ block, output, isError }) => ({
          type: 'tool_result' as const,
          tool_use_id: block.id,
          content: JSON.stringify(output),
          is_error: isError,
        }),
      );

      // 대화 기록에 assistant 응답 + tool_result 추가
      currentMessages = [
        ...currentMessages,
        { role: 'assistant' as const, content: response.content },
        { role: 'user' as const, content: toolResultContents },
      ];

      // 재호출 (재시도 1회, 30초 타임아웃)
      response = await chatWithRetry(currentMessages);
    }

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
