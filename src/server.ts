#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import OpenAI from "openai";

import { authenticate, getAccessToken, isAuthenticated } from "./auth/oauth.js";
import { createPlan, formatPlanAsMarkdown } from "./tools/plan.js";
import { createTodoMd, updateTodoItem } from "./tools/todo.js";
import type { TodoItem } from "./tools/todo.js";

// ---------------------------------------------------------------------------
// Codex client helper
// ---------------------------------------------------------------------------

let openaiClient: OpenAI | null = null;

async function getClient(): Promise<OpenAI> {
  const token = await getAccessToken();
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: token });
  } else {
    openaiClient.apiKey = token;
  }
  return openaiClient;
}

async function queryCodex(systemPrompt: string, userContent: string): Promise<string> {
  const client = await getClient();

  const response = await client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content ?? "(no response from Codex)";
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

interface ToolSpec {
  name: string;
  description: string;
  systemPrompt: string;
}

const TOOLS: ToolSpec[] = [
  {
    name: "clauxsync_review",
    description:
      "Send code to OpenAI Codex for a thorough code review. Returns observations about quality, potential bugs, style issues, and improvement suggestions.",
    systemPrompt:
      "You are an expert code reviewer. Analyze the provided code for bugs, security issues, performance problems, and style concerns. Provide concrete, actionable feedback organized by severity.",
  },
  {
    name: "clauxsync_debug",
    description:
      "Send code and error context to OpenAI Codex for debugging assistance. Returns root cause analysis and suggested fixes.",
    systemPrompt:
      "You are an expert debugger. Given the code and any error context, identify the root cause of the problem. Explain the issue clearly and provide a corrected version of the code.",
  },
  {
    name: "clauxsync_refactor",
    description:
      "Send code to OpenAI Codex for refactoring suggestions. Returns cleaner, more maintainable versions of the code with explanations.",
    systemPrompt:
      "You are an expert software architect. Refactor the provided code to improve readability, maintainability, and adherence to best practices. Explain each change you make and why.",
  },
  {
    name: "clauxsync_brainstorm",
    description:
      "Send a problem description or code context to OpenAI Codex for brainstorming. Returns creative approaches, architectural ideas, and implementation strategies.",
    systemPrompt:
      "You are a creative senior engineer. Given the problem or code context, brainstorm multiple approaches and solutions. Consider trade-offs, scalability, and developer experience. Present ideas clearly with pros and cons.",
  },
  {
    name: "clauxsync_test",
    description:
      "Send code to OpenAI Codex to generate comprehensive test cases. Returns test code covering happy paths, edge cases, and error scenarios.",
    systemPrompt:
      "You are an expert test engineer. Generate comprehensive tests for the provided code. Cover happy paths, edge cases, error handling, and boundary conditions. Use appropriate testing patterns and frameworks for the language.",
  },
];

const toolInputSchema = z.object({
  code: z.string().describe("The source code to analyze"),
  context: z
    .string()
    .optional()
    .describe("Additional context such as error messages, requirements, or constraints"),
});

// ---------------------------------------------------------------------------
// Server setup
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: "ClauxSync",
  version: "1.0.0",
});

for (const tool of TOOLS) {
  const { name, description, systemPrompt } = tool;

  server.tool(
    name,
    description,
    {
      code: z.string().describe("The source code to analyze"),
      context: z
        .string()
        .optional()
        .describe("Additional context such as error messages, requirements, or constraints"),
    },
    async ({ code, context }) => {
      const userContent = context ? `${code}\n\n---\nContext: ${context}` : code;

      try {
        const result = await queryCodex(systemPrompt, userContent);
        return {
          content: [{ type: "text" as const, text: result }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [{ type: "text" as const, text: `Error from Codex: ${message}` }],
          isError: true,
        };
      }
    },
  );
}

// ---------------------------------------------------------------------------
// Plan & Todo tools
// ---------------------------------------------------------------------------

server.tool(
  "clauxsync_plan",
  "Create an execution plan for a task with steps assigned to AI agents (claude, codex, or both). Returns formatted markdown.",
  {
    taskName: z.string().describe("Name of the task to plan"),
    mode: z.enum(["recommend", "manual"]).describe("Plan mode: 'recommend' for AI-suggested assignment or 'manual' for user-chosen"),
    steps: z.string().describe("JSON array of step objects, each with: title (string), description (string), aiAssignment ('claude' | 'codex' | 'both')"),
  },
  async ({ taskName, mode, steps: stepsJson }) => {
    try {
      const parsedSteps = JSON.parse(stepsJson) as Array<{
        title: string;
        description: string;
        aiAssignment: "claude" | "codex" | "both";
      }>;
      const plan = createPlan(taskName, mode, parsedSteps);
      const markdown = formatPlanAsMarkdown(plan);
      return {
        content: [{ type: "text" as const, text: markdown }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: `Error creating plan: ${message}` }],
        isError: true,
      };
    }
  },
);

server.tool(
  "clauxsync_todo_create",
  "Create a todo.md checklist with progress tracking for a task. Returns formatted markdown with checkboxes and a progress log table.",
  {
    taskName: z.string().describe("Name of the task"),
    mode: z.string().describe("Mode description (e.g. 'recommend' or 'manual')"),
    items: z.string().describe("JSON array of item objects, each with: text (string)"),
  },
  async ({ taskName, mode, items: itemsJson }) => {
    try {
      const parsedItems = JSON.parse(itemsJson) as Array<{ text: string }>;
      const todoItems: TodoItem[] = parsedItems.map((item, i) => ({
        id: i + 1,
        text: item.text,
        status: "pending" as const,
      }));
      const todoFile = {
        taskName,
        mode,
        created: new Date().toISOString(),
        items: todoItems,
      };
      const markdown = createTodoMd(todoFile);
      return {
        content: [{ type: "text" as const, text: markdown }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: `Error creating todo: ${message}` }],
        isError: true,
      };
    }
  },
);

server.tool(
  "clauxsync_todo_update",
  "Update the status of a specific step in a todo.md file. Returns the updated markdown content.",
  {
    todoContent: z.string().describe("The current todo markdown content"),
    stepId: z.number().describe("The step number to update"),
    status: z.enum(["done", "in_progress", "blocked", "skipped"]).describe("New status for the step"),
    aiUsed: z.string().optional().describe("Which AI was used for this step (e.g. 'claude', 'codex')"),
    reflection: z.string().optional().describe("Reflection or notes about this step's completion"),
  },
  async ({ todoContent, stepId, status, aiUsed, reflection }) => {
    try {
      const updated = updateTodoItem(todoContent, stepId, status, aiUsed, reflection);
      return {
        content: [{ type: "text" as const, text: updated }],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: "text" as const, text: `Error updating todo: ${message}` }],
        isError: true,
      };
    }
  },
);

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Check authentication before starting the transport.
  if (!isAuthenticated()) {
    console.error("[clauxsync] No valid tokens found. Starting OAuth authentication flow...");
    await authenticate();
  } else {
    console.error("[clauxsync] Authenticated. Token loaded from ~/.clauxsync/tokens.json");
  }

  // Verify token is usable.
  try {
    await getAccessToken();
  } catch {
    console.error("[clauxsync] Stored token is invalid. Re-authenticating...");
    await authenticate();
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[clauxsync] MCP server running on stdio.");
}

main().catch((err) => {
  console.error("[clauxsync] Fatal:", err);
  process.exit(1);
});
