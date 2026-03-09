import { callCodex, type CodexResponse } from "./codex.js";

export interface RefactorInput {
  code: string;
  goal?: string;
}

export interface RefactorResult extends CodexResponse {
  tool: "refactor";
}

const SYSTEM_PROMPT =
  "You are a refactoring expert. Improve this code's readability, maintainability, and performance while preserving behavior.";

export async function refactor(
  input: RefactorInput,
  accessToken: string,
): Promise<RefactorResult> {
  const parts: string[] = [`Code:\n\`\`\`\n${input.code}\n\`\`\``];

  if (input.goal) {
    parts.push(`Refactoring goal: ${input.goal}`);
  }

  const response = await callCodex({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: parts.join("\n\n"),
    accessToken,
  });

  return { ...response, tool: "refactor" };
}
