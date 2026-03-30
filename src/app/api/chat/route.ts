import type { NextRequest } from 'next/server';
import type Anthropic from '@anthropic-ai/sdk';
import { chat } from '@/lib/ai/claude';
import { executeToolCall } from './tool-executor';
import type { ToolResult } from '@/lib/ai/claude';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { messages: Anthropic.Messages.MessageParam[] };
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: '메시지가 없습니다.' }, { status: 400 });
    }

    // 1차 Claude 호출
    let response = await chat(messages);

    // Tool Use 루프 (Claude가 도구 호출을 요청하면 실행)
    const toolResults: ToolResult[] = [];
    let currentMessages: Anthropic.Messages.MessageParam[] = [...messages];

    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.Messages.ToolUseBlock => b.type === 'tool_use',
      );

      // 도구 병렬 실행
      const executedResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          const input = block.input as Record<string, unknown>;
          try {
            const output = await executeToolCall(block.name, input);
            return { block, output, isError: false };
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            return { block, output: { error: errorMessage }, isError: true };
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

      // 재호출
      response = await chat(currentMessages);
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
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
