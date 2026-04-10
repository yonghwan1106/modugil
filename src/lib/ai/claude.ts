import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './system-prompt';

const MODEL = 'claude-sonnet-4-6';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ToolResult {
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
}

const CACHED_SYSTEM: Anthropic.Messages.TextBlockParam[] = [
  {
    type: 'text' as const,
    text: SYSTEM_PROMPT,
    cache_control: { type: 'ephemeral' as const },
  },
];

export async function chat(
  messages: Anthropic.Messages.MessageParam[],
): Promise<Anthropic.Messages.Message> {
  return client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: CACHED_SYSTEM,
    messages,
  });
}

export function chatStream(
  messages: Anthropic.Messages.MessageParam[],
): ReturnType<typeof client.messages.stream> {
  return client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: CACHED_SYSTEM,
    messages,
  });
}
