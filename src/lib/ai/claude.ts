import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './system-prompt';

const MODEL = 'claude-haiku-4-5-20251001';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ToolResult {
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
}

export async function chat(
  messages: Anthropic.Messages.MessageParam[],
): Promise<Anthropic.Messages.Message> {
  return client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages,
  });
}
