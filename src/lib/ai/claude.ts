import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT } from './system-prompt';
import { AI_TOOLS } from './tools';

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
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: AI_TOOLS,
    messages,
  });
}
