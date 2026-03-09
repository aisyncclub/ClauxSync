import { callCodex, type CodexResponse } from "./codex.js";

export interface TestInput {
  code: string;
  testCode: string;
  framework?: string;
}

export interface TestResult extends CodexResponse {
  tool: "test";
}

const SYSTEM_PROMPT =
  "You are a testing expert. Review these tests for coverage gaps, edge cases, and test quality.";

export async function test(
  input: TestInput,
  accessToken: string,
): Promise<TestResult> {
  const parts: string[] = [
    `Source Code:\n\`\`\`\n${input.code}\n\`\`\``,
    `Test Code:\n\`\`\`\n${input.testCode}\n\`\`\``,
  ];

  if (input.framework) {
    parts.push(`Test Framework: ${input.framework}`);
  }

  const response = await callCodex({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: parts.join("\n\n"),
    accessToken,
  });

  return { ...response, tool: "test" };
}
