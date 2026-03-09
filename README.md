<div align="center">

# ClauxSync

### Sync Claude Code + OpenAI Codex — Two AIs, One Workflow, Manus-Style Planning

[![npm version](https://img.shields.io/npm/v/clauxsync.svg?style=flat-square)](https://www.npmjs.com/package/clauxsync)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/openclaw-studio/clauxsync?style=flat-square)](https://github.com/openclaw-studio/clauxsync/stargazers)

Connect **Claude Code** with **OpenAI Codex** via OAuth. Assign AI roles per task phase.
Claude creates, Codex validates — with automatic execution plans and progress tracking.

</div>

---

## Features

- :lock: **OpenAI Codex OAuth** — No API key needed, use your ChatGPT subscription
- :robot: **Dual AI Workflow** — Claude + Codex collaborate on every task
- :white_check_mark: **Smart Recommend Mode** — Auto-assigns Codex for review, refactoring, debugging, testing
- :clipboard: **Manus-Style Planning** — Auto-generates execution plans with todo.md tracking, reflection checkpoints, and progress logs
- :handshake: **Co-Commands Compatible** — Works with the official Codex MCP server, uses proven independent comparison patterns from [Co-Commands](https://github.com/SnakeO/claude-co-commands)
- :dart: **Task Checklist** — Choose which AI handles each phase
- :zap: **One-command install**

## Quick Start

```bash
npx clauxsync auth    # OAuth login with your ChatGPT account
npx clauxsync start   # Start MCP server
```

Then add ClauxSync to your Claude Code MCP config (`.claude/mcp.json`):

```json
{
  "mcpServers": {
    "clauxsync": {
      "command": "npx",
      "args": ["clauxsync", "start"]
    },
    "validate-plans-and-brainstorm-ideas": {
      "command": "npx",
      "args": ["-y", "@openai/codex", "mcp-server"]
    }
  }
}
```

That's it. Claude Code now has access to Codex through ClauxSync tools.

## How It Works

```
Task Start
    |
Mode Selection (direct pick / recommend mode)
    |
Plan Creation --> todo.md generated
    |
+-- Agent Loop --------------------------------+
|  1. Analyze current state                    |
|  2. Execute (Claude or Codex)                |
|  3. Reflect + update todo.md                 |
|  4. Next step or adjust plan                 |
+----------------------------------------------+
    |
Completion + Summary
```

**Architecture:**

```
+--------------+         +------------+         +--------------+
|  Claude Code | --MCP-->| ClauxSync  |--OAuth-->| OpenAI Codex |
|  (your IDE)  |<--------|  (server)  |<---------|  (reviewer)  |
+--------------+         +------------+         +--------------+
```

1. You give a task to Claude
2. ClauxSync generates a plan and creates `todo.md`
3. The agent loop executes each step, choosing the right AI
4. Reflection checkpoints update progress after every step
5. Claude merges results and marks the plan complete

## Example: todo.md Output

Every task generates a trackable plan. Here is what a live `todo.md` looks like:

```markdown
# ClauxSync Todo — Add User Auth
> Mode: Recommend | Created: 2026-03-09

## Checklist
- [x] Step 1: Analyze requirements
- [x] Step 2: Design schema
- [->] Step 3: Implement code
- [ ] Step 4: Codex review
- [ ] Step 5: Write tests + Codex verification

## Progress Log
| Step | Status | AI Used      | Reflection                  |
|------|--------|--------------|-----------------------------|
| 1    | done   | Claude       | JWT vs Session compared     |
| 2    | done   | Claude       | Prisma schema finalized     |
| 3    | wip    | Claude       | Implementing...             |
| 4    | pending| Codex        | -                           |
| 5    | pending| Claude+Codex | -                           |
```

## Role Assignment (Recommend Mode)

Smart Recommend Mode auto-assigns the right AI to each task phase:

| Task | Claude | Codex |
|------|--------|-------|
| Brainstorming | Lead | Devil's Advocate |
| Planning | Lead | - |
| Coding | Solo | - |
| Refactoring | Write | **Review (Required)** |
| Code Review | Synthesize | **Required** |
| Debugging | Analyze | **Verify (Required)** |
| Testing | Write | **Verify (Required)** |

Override any assignment via the task checklist — you stay in control.

## MCP Tools

| Tool | Description |
|------|-------------|
| `clauxsync_review` | Send code to Codex for review |
| `clauxsync_debug` | Collaborative debugging with Codex |
| `clauxsync_refactor` | Refactor code with Codex validation |
| `clauxsync_brainstorm` | Dual-AI brainstorming session |
| `clauxsync_test` | Generate and verify tests via Codex |
| `clauxsync_plan` | Generate a Manus-style execution plan for any task |
| `clauxsync_todo_create` | Create a todo.md with steps, mode, and AI assignments |
| `clauxsync_todo_update` | Update todo.md progress, status, and reflection notes |

## Inspired By

- [Co-Commands](https://github.com/SnakeO/claude-co-commands) — The co-validate / co-plan / co-brainstorm pattern
- [Manus AI](https://manus.im) — todo.md planning and agent loop architecture
- [Superpowers](https://github.com/obra/superpowers) — Claude Code skill system

## Documentation

- [Setup Guide](docs/setup.md) — Installation, OAuth flow, and troubleshooting

## License

[MIT](LICENSE)
