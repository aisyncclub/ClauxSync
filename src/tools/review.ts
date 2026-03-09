import { callCodex, type CodexResponse } from "./codex.js";

export interface ReviewInput {
  code: string;
  context?: string;
  language?: string;
}

export interface ReviewResult extends CodexResponse {
  tool: "review";
}

const SYSTEM_PROMPT =
  "You are a code reviewer. Review this code for bugs, security issues, performance, and best practices. Be specific and actionable.";

export async function review(
  input: ReviewInput,
  accessToken: string,
): Promise<ReviewResult> {
  const parts: string[] = [];

  if (input.language) {
    parts.push(`Language: ${input.language}`);
  }
  if (input.context) {
    parts.push(`Context: ${input.context}`);
  }
  parts.push(`Code:\n\`\`\`\n${input.code}\n\`\`\``);

  const response = await callCodex({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: parts.join("\n\n"),
    accessToken,
  });

  return { ...response, tool: "review" };
}
