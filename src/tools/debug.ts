import { callCodex, type CodexResponse } from "./codex.js";

export interface DebugInput {
  code: string;
  error: string;
  stackTrace?: string;
}

export interface DebugResult extends CodexResponse {
  tool: "debug";
}

const SYSTEM_PROMPT =
  "You are a debugging expert. Analyze this code and error. Find the root cause and suggest a fix.";

export async function debug(
  input: DebugInput,
  accessToken: string,
): Promise<DebugResult> {
  const parts: string[] = [
    `Code:\n\`\`\`\n${input.code}\n\`\`\``,
    `Error: ${input.error}`,
  ];

  if (input.stackTrace) {
    parts.push(`Stack Trace:\n\`\`\`\n${input.stackTrace}\n\`\`\``);
  }

  const response = await callCodex({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: parts.join("\n\n"),
    accessToken,
  });

  return { ...response, tool: "debug" };
}
