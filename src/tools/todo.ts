import { readFileSync, writeFileSync, existsSync } from "fs";

export interface TodoItem {
  id: number;
  text: string;
  status: "pending" | "in_progress" | "done" | "blocked" | "skipped";
  aiUsed?: string;
  reflection?: string;
}

export interface TodoFile {
  taskName: string;
  mode: string;
  created: string;
  items: TodoItem[];
}

export function createTodoMd(todo: TodoFile): string {
  let md = `# ClauxSync Todo \u2014 ${todo.taskName}\n`;
  md += `> Mode: ${todo.mode} | Created: ${todo.created}\n\n`;
  md += `## Checklist\n\n`;

  for (const item of todo.items) {
    const checkbox = item.status === "done" ? "[x]" : item.status === "in_progress" ? "[\u2192]" : item.status === "blocked" ? "[!]" : item.status === "skipped" ? "[~]" : "[ ]";
    md += `- ${checkbox} Step ${item.id}: ${item.text}\n`;
  }

  md += `\n## Progress Log\n\n`;
  md += `| Step | Status | AI Used | Reflection |\n`;
  md += `|------|--------|---------|------------|\n`;

  for (const item of todo.items) {
    const statusEmoji = item.status === "done" ? "\u2705" : item.status === "in_progress" ? "\uD83D\uDD04" : item.status === "blocked" ? "\uD83D\uDEAB" : item.status === "skipped" ? "\u23ED\uFE0F" : "\u23F3";
    md += `| ${item.id} | ${statusEmoji} | ${item.aiUsed || "-"} | ${item.reflection || "-"} |\n`;
  }

  return md;
}

export function updateTodoItem(
  todoContent: string,
  stepId: number,
  status: "done" | "in_progress" | "blocked" | "skipped",
  aiUsed?: string,
  reflection?: string
): string {
  // Update checkbox
  const oldCheckboxPattern = new RegExp(`- \\[.\\] Step ${stepId}:`);
  const newCheckbox = status === "done" ? "[x]" : status === "in_progress" ? "[\u2192]" : status === "blocked" ? "[!]" : "[~]";
  let updated = todoContent.replace(oldCheckboxPattern, `- ${newCheckbox} Step ${stepId}:`);

  // Update progress log row
  const statusEmoji = status === "done" ? "\u2705" : status === "in_progress" ? "\uD83D\uDD04" : status === "blocked" ? "\uD83D\uDEAB" : "\u23ED\uFE0F";
  const oldRowPattern = new RegExp(`\\| ${stepId} \\|[^\\n]+`);
  updated = updated.replace(oldRowPattern, `| ${stepId} | ${statusEmoji} | ${aiUsed || "-"} | ${reflection || "-"} |`);

  return updated;
}
