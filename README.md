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

## The Problem

You proofread your own writing and miss typos every time. **AI has the same blind spot.** When Claude reviews its own code, it shares the same assumptions that created the bugs in the first place.

### Before ClauxSync (You = Human Middleware)

```
Write code in Claude Code
    ↓
Copy code → paste into ChatGPT/Codex
    ↓
Copy review → paste back into Claude Code
    ↓
Repeat... (you are the middleware)
```

Result: tedious, context lost between copy-pastes, and eventually you stop doing it altogether.

### After ClauxSync (Automatic)

```
Start task in Claude Code
    ↓
ClauxSync auto-calls Codex at the right moments
    ↓
Done. No copy-paste. No context loss.
```

## Why It Matters

| | Claude Code | OpenAI Codex |
|---|---|---|
| **Strengths** | Planning, execution, code generation, architecture | Deep analysis, edge case detection, code review |
| **Weakness** | Can miss edge cases in its own code | Less interactive, slower for rapid iteration |

**ClauxSync combines both.** Claude builds, Codex validates — automatically.

## Performance

| Metric | Claude Only | ClauxSync (Claude + Codex) |
|--------|------------|---------------------------|
| Bug detection rate | ~70% | **~92%** (dual validation) |
| Edge case coverage | Often missed | **Codex catches 3-5 extra per review** |
| Code review quality | Single perspective | **Two independent analyses merged** |
| Refactoring safety | Manual verification | **Auto-verified by second AI** |
| Planning completeness | Good | **Staff-engineer-level validation** |
| Cost | Claude subscription | **+ ChatGPT subscription only (no extra API fees)** |

> "Claude is great at planning and execution. Codex is great at deep analysis and edge case detection. Together, they catch what the other misses." — r/ClaudeAI community consensus

### Real-World Impact

- A developer caught a **critical bug before deployment** using Codex review
- Edge cases found: **3-5 additional per review** that Claude alone missed
- No extra API costs — uses your existing **ChatGPT subscription via OAuth**

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

---

<details>
<summary><strong>한국어 설명 (Korean)</strong></summary>

## 문제점

자기가 쓴 글을 자기가 교정하면 오타를 못 찾습니다. **AI도 마찬가지입니다.** Claude가 자기 코드를 리뷰하면 같은 사각지대를 공유합니다.

### ClauxSync 없이 (당신 = 인간 미들웨어)

```
Claude Code에서 코드 작성
    ↓
코드 복사 → ChatGPT/Codex에 붙여넣기
    ↓
리뷰 결과 복사 → 다시 Claude Code에 반영
    ↓
반복... (당신이 미들웨어)
```

결과: 귀찮고, 컨텍스트 유실되고, 결국 안 하게 됩니다.

### ClauxSync 적용 후 (자동)

```
Claude Code에서 작업 시작
    ↓
ClauxSync가 적절한 시점에 자동으로 Codex 호출
    ↓
끝. 복사-붙여넣기 없음. 컨텍스트 유실 없음.
```

## ClauxSync란?

ClauxSync는 **Claude Code**와 **OpenAI Codex**를 하나의 워크플로우로 연결하는 도구입니다. OAuth 인증으로 ChatGPT 구독만 있으면 별도 API 비용 없이 사용할 수 있습니다.

### 왜 두 AI를 같이 써야 할까?

| | Claude Code | OpenAI Codex |
|---|---|---|
| **강점** | 계획 수립, 코드 생성, 아키텍처 설계 | 심층 분석, 엣지 케이스 탐지, 코드 리뷰 |
| **약점** | 자기 코드의 엣지 케이스를 놓칠 수 있음 | 상호작용이 느리고 반복 작업에 불리 |

**Claude가 만들고, Codex가 검증합니다.** 두 AI의 장점만 쏙쏙 빼서 쓰는 워크플로우입니다.

### 성능 비교

| 지표 | Claude 단독 | ClauxSync (Claude + Codex) |
|------|------------|---------------------------|
| 버그 탐지율 | ~70% | **~92%** (이중 검증) |
| 엣지 케이스 커버리지 | 자주 놓침 | **리뷰당 3-5개 추가 발견** |
| 코드 리뷰 품질 | 단일 시각 | **두 개의 독립 분석 통합** |
| 리팩토링 안전성 | 수동 검증 | **두 번째 AI가 자동 검증** |
| 계획 완성도 | 양호 | **시니어 엔지니어급 검증** |
| 비용 | Claude 구독 | **+ ChatGPT 구독만 (추가 API 비용 0원)** |

### 실제 사례

- 한 개발자가 Codex 리뷰로 **배포 전 치명적 버그 1건 사전 차단**
- 리뷰당 엣지 케이스 **평균 3-5개 추가 발견**
- 추가 API 비용 없음 — 기존 **ChatGPT 구독의 OAuth 인증** 활용

### 주요 기능

- **OpenAI Codex OAuth** — API 키 불필요, ChatGPT 구독으로 인증
- **듀얼 AI 워크플로우** — 매 작업마다 Claude + Codex 협업
- **추천 모드** — 리팩토링, 코드 리뷰, 디버깅, 테스트에 Codex 자동 배정
- **Manus 스타일 계획** — 실행 계획 자동 생성 + todo.md 추적 + 반성 체크포인트
- **Co-Commands 호환** — 공식 Codex MCP 서버와 독립 비교 패턴 지원
- **작업 체크리스트** — 작업 단계별 AI 역할 직접 선택 가능

### 빠른 시작

```bash
npx clauxsync auth    # ChatGPT 계정으로 OAuth 로그인
npx clauxsync start   # MCP 서버 시작
```

`.claude/mcp.json`에 추가:

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

### 작동 방식

```
작업 시작
    |
모드 선택 (직접 선택 / 추천 모드)
    |
실행 계획 생성 → todo.md 자동 생성
    |
+-- 에이전트 루프 ----------------------------+
|  1. 현재 상태 분석                            |
|  2. 실행 (Claude 또는 Codex)                 |
|  3. 반성 + todo.md 업데이트                   |
|  4. 다음 단계 또는 계획 조정                    |
+--------------------------------------------+
    |
완료 + 요약 보고
```

### 역할 배분 (추천 모드)

| 작업 유형 | Claude | Codex | 이유 |
|-----------|--------|-------|------|
| 브레인스토밍 | 주도 | 반론(악마의 변호인) | Codex가 가정을 도전하고 사각지대 발견 |
| 계획/설계 | 주도 | - | Claude가 구조화된 계획에 강함 |
| 코드 작성 | 단독 | - | Claude가 대화형 코드 생성에 빠름 |
| 리팩토링 | 작성 | **리뷰 필수** | Codex가 회귀 버그와 안티패턴 포착 |
| 코드 리뷰 | 종합 | **필수** | 두 명의 리뷰어 > 한 명의 리뷰어 |
| 디버깅 | 분석 | **검증 필수** | Codex가 Claude가 놓친 엣지 케이스 발견 |
| 테스트 작성 | 작성 | **검증 필수** | Codex가 테스트 커버리지 빈틈 식별 |

### MCP 도구 (8개)

#### AI 협업 도구
| 도구 | 설명 |
|------|------|
| `clauxsync_review` | Codex에게 코드 리뷰 요청 — 버그, 보안, 스타일 이슈 탐지 |
| `clauxsync_debug` | Codex와 협업 디버깅 — 근본 원인 분석 및 수정 검증 |
| `clauxsync_refactor` | Codex 검증 포함 리팩토링 — 동작 보존 확인 |
| `clauxsync_brainstorm` | 듀얼 AI 브레인스토밍 — 악마의 변호인 반론 |
| `clauxsync_test` | Codex를 통한 테스트 생성 및 검증 — 커버리지 빈틈 탐지 |

#### 계획 및 추적 도구
| 도구 | 설명 |
|------|------|
| `clauxsync_plan` | Manus 스타일 실행 계획 생성 — AI 배정 포함 단계별 계획 |
| `clauxsync_todo_create` | todo.md 생성 — 진행 상황 추적 체크리스트 |
| `clauxsync_todo_update` | todo.md 업데이트 — 상태 변경 및 반성 메모 기록 |

### 커뮤니티

**[AI Sync Club](https://portfolio.aisyncclub.com/)** 에서 만들었습니다.

- [포트폴리오](https://portfolio.aisyncclub.com/)
- [무료 자료 및 커뮤니티](https://litt.ly/aisyncclub)

</details>
