import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface PlanStep {
  id: number;
  title: string;
  description: string;
  aiAssignment: "claude" | "codex" | "both";
  status: "pending" | "in_progress" | "completed" | "blocked" | "skipped";
  reflection?: string;
}

export interface ExecutionPlan {
  taskName: string;
  mode: "recommend" | "manual";
  created: string;
  steps: PlanStep[];
}

export function createPlan(taskName: string, mode: "recommend" | "manual", steps: Omit<PlanStep, "id" | "status">[]): ExecutionPlan {
  return {
    taskName,
    mode,
    created: new Date().toISOString(),
    steps: steps.map((s, i) => ({
      ...s,
      id: i + 1,
      status: "pending" as const,
    })),
  };
}

export function formatPlanAsMarkdown(plan: ExecutionPlan): string {
  const statusIcons: Record<string, string> = {
    pending: "\u23F3",
    in_progress: "\uD83D\uDD04",
    completed: "\u2705",
    blocked: "\uD83D\uDEAB",
    skipped: "\u23ED\uFE0F",
  };

  let md = `# ClauxSync Execution Plan\n`;
  md += `> **Task:** ${plan.taskName}\n`;
  md += `> **Mode:** ${plan.mode === "recommend" ? "\uCD94\uCC9C\uBAA8\uB4DC" : "\uC9C1\uC811\uC120\uD0DD"}\n`;
  md += `> **Created:** ${plan.created}\n\n`;
  md += `## Steps\n\n`;

  for (const step of plan.steps) {
    const icon = statusIcons[step.status] || "\u23F3";
    const checkbox = step.status === "completed" ? "[x]" : step.status === "in_progress" ? "[\u2192]" : step.status === "blocked" ? "[!]" : step.status === "skipped" ? "[~]" : "[ ]";
    md += `${checkbox} **Step ${step.id}: ${step.title}** ${icon}\n`;
    md += `   ${step.description}\n`;
    md += `   AI: ${step.aiAssignment}\n`;
    if (step.reflection) {
      md += `   \uD83D\uDCAD Reflection: ${step.reflection}\n`;
    }
    md += `\n`;
  }

  return md;
}
