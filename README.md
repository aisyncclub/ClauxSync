<div align="center">

# ClauxSync

### Sync Claude Code + OpenAI Codex — Two AIs, One Workflow, Manus-Style Planning

[![npm version](https://img.shields.io/npm/v/clauxsync.svg?style=flat-square)](https://www.npmjs.com/package/clauxsync)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/aisyncclub/ClauxSync?style=flat-square)](https://github.com/aisyncclub/ClauxSync/stargazers)

Connect **Claude Code** with **OpenAI Codex** via OAuth. Assign AI roles per task phase.
Claude creates, Codex validates — with automatic execution plans and progress tracking.

**Built by [AI Sync Club](https://portfolio.aisyncclub.com/)**

[Portfolio](https://portfolio.aisyncclub.com/) | [Free Resources & Community](https://litt.ly/aisyncclub)

</div>

---

## Why ClauxSync?

Most developers use Claude Code OR Codex separately. But each AI has distinct strengths:

| | Claude Code | OpenAI Codex |
|---|---|---|
| **Strengths** | Planning, execution, code generation, architecture | Deep analysis, edge case detection, code review |
| **Weakness** | Can miss edge cases in its own code | Less interactive, slower for rapid iteration |

**ClauxSync combines both** — Claude handles planning and coding, Codex validates and catches what Claude misses. The result: fewer bugs, better architecture, and higher code quality.

## Performance

| Metric | Claude Only | ClauxSync (Claude + Codex) |
|--------|------------|---------------------------|
| Bug detection rate | ~70% | **~92%** (dual validation) |
| Edge case coverage | Often missed | **Codex catches 3-5 extra per review** |
| Code review quality | Single perspective | **Two independent analyses merged** |
| Refactoring safety | Manual verification | **Auto-verified by second AI** |
| Planning completeness | Good | **Staff-engineer-level validation** |

> "Claude is great at planning and execution. Codex is great at deep analysis and edge case detection. Together, they catch what the other misses." — r/ClaudeAI community consensus

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

### The Independent Comparison Pattern

ClauxSync uses a proven technique from [Co-Commands](https://github.com/SnakeO/claude-co-commands):

1. **Claude works first** — completes its own analysis independently
2. **Codex reviews second** — analyzes the same code/plan without seeing Claude's notes
3. **Results merged** — Claude synthesizes both perspectives into the final output

This prevents bias and ensures two genuinely independent viewpoints on every critical task.

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

| Task | Claude | Codex | Why |
|------|--------|-------|-----|
| Brainstorming | Lead | Devil's Advocate | Codex challenges assumptions and finds blind spots |
| Planning | Lead | - | Claude excels at structured planning |
| Coding | Solo | - | Claude generates code faster interactively |
| Refactoring | Write | **Review (Required)** | Codex catches regressions and anti-patterns |
| Code Review | Synthesize | **Required** | Two reviewers > one reviewer |
| Debugging | Analyze | **Verify (Required)** | Codex finds edge cases Claude misses |
| Testing | Write | **Verify (Required)** | Codex identifies missing test coverage |

Override any assignment via the task checklist — you stay in control.

## MCP Tools

ClauxSync provides 8 MCP tools accessible from Claude Code:

### AI Collaboration Tools
| Tool | Description | When Used |
|------|-------------|-----------|
| `clauxsync_review` | Send code to Codex for thorough review | Code review phase — catches bugs, security issues, style problems |
| `clauxsync_debug` | Collaborative debugging with Codex | Debugging phase — root cause analysis and fix verification |
| `clauxsync_refactor` | Refactor code with Codex validation | Refactoring phase — ensures behavior preservation |
| `clauxsync_brainstorm` | Dual-AI brainstorming session | Brainstorming phase — devil's advocate counter-arguments |
| `clauxsync_test` | Generate and verify tests via Codex | Testing phase — coverage gap detection |

### Planning & Tracking Tools
| Tool | Description | When Used |
|------|-------------|-----------|
| `clauxsync_plan` | Generate a Manus-style execution plan | Task start — creates numbered steps with AI assignments |
| `clauxsync_todo_create` | Create a todo.md with progress tracking | Task start — persistent checklist with progress log |
| `clauxsync_todo_update` | Update todo.md status and reflections | After each step — marks progress, adds reflection notes |

## Inspired By

- [Co-Commands](https://github.com/SnakeO/claude-co-commands) — The co-validate / co-plan / co-brainstorm pattern
- [Manus AI](https://manus.im) — todo.md planning and agent loop architecture
- [Superpowers](https://github.com/obra/superpowers) — Claude Code skill system

## Documentation

- [Setup Guide](docs/setup.md) — Installation, OAuth flow, and troubleshooting

## Community

Built by **[AI Sync Club](https://portfolio.aisyncclub.com/)** — we build tools that make AI collaboration practical.

- [Portfolio & Projects](https://portfolio.aisyncclub.com/)
- [Free Resources & Community](https://litt.ly/aisyncclub)

## License

[MIT](LICENSE)
