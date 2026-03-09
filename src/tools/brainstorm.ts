import { callCodex, type CodexResponse } from "./codex.js";

export interface BrainstormInput {
  idea: string;
  constraints?: string;
}

export interface BrainstormResult extends CodexResponse {
  tool: "brainstorm";
}

const SYSTEM_PROMPT =
  "You are a devil's advocate. Challenge this idea, find weaknesses, and suggest alternatives.";

export async function brainstorm(
  input: BrainstormInput,
  accessToken: string,
): Promise<BrainstormResult> {
  const parts: string[] = [`Idea: ${input.idea}`];

  if (input.constraints) {
    parts.push(`Constraints: ${input.constraints}`);
  }

  const response = await callCodex({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: parts.join("\n\n"),
    accessToken,
  });

  return { ...response, tool: "brainstorm" };
}
