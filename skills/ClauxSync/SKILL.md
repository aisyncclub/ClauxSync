---
name: ClauxSync
description: Use when starting any development task - creates a Manus-style execution plan with todo.md tracking, assigns Claude and Codex roles per phase with independent comparison pattern (Co-Commands compatible), and manages the full task lifecycle with reflection checkpoints
---

## Overview

ClauxSync combines Claude Code + OpenAI Codex via OAuth with Manus-style task orchestration. Every task gets a structured plan, persistent todo.md tracking, and dual-AI validation.

## Phase 1: Task Setup (Every Task Starts Here)

When this skill activates:

### Step 1 — Mode Selection
Present to user:

**🔧 모드 선택:**
1. **직접 선택 모드** — 각 작업별 AI를 직접 지정
2. **추천 모드** — 자동 배분 (리팩토링/리뷰/디버깅/테스트 → Codex 필수)

### Step 2 — Role Assignment Table

| 작업 유형 | Claude | Codex | 추천모드 기본값 |
|-----------|--------|-------|----------------|
| 브레인스토밍 | 주도 | 반론 | Claude 주도 + Codex 반론 |
| 계획/설계 | 주도 | - | Claude 주도 |
| 코드 작성 | 단독 | - | Claude 단독 |
| 리팩토링 | 작성 | **리뷰 필수** | Claude → Codex 리뷰 필수 |
| 코드 리뷰 | 종합 | **필수** | Codex 필수 + Claude 종합 |
| 디버깅 | 분석 | **검증 필수** | Claude → Codex 검증 필수 |
| 테스트 작성 | 작성 | **검증 필수** | Claude → Codex 검증 필수 |

### Step 3 — Create Execution Plan

After mode selection, create a numbered execution plan:

```
## Execution Plan
Task: [task description]
Mode: [직접선택/추천]
Created: [timestamp]

### Steps
1. [ ] 분석 — 요구사항 및 현재 상태 파악
2. [ ] 설계 — 구현 방향 결정 [Claude/Codex: based on mode]
3. [ ] 구현 — 코드 작성 [Claude/Codex: based on mode]
4. [ ] 검증 — 리뷰/테스트/디버깅 [Claude/Codex: based on mode]
5. [ ] 완료 — 결과 제출 및 정리
```

### Step 4 — Create todo.md

Create a `todo.md` file in the project root as a persistent live checklist:

```markdown
# ClauxSync Todo — [Task Name]
> Mode: 추천모드 | Created: YYYY-MM-DD HH:mm

## Plan
- [ ] Step 1: 분석 — [specific details]
- [ ] Step 2: 설계 — [specific details]
- [ ] Step 3: 구현 — [specific details]
- [ ] Step 4: 검증 — [specific details]
- [ ] Step 5: 완료 — [specific details]

## AI Assignment
- 브레인스토밍: Claude 주도 / Codex 반론
- 계획: Claude
- 코드작성: Claude
- 리팩토링: Claude → Codex 리뷰
- 코드리뷰: Codex → Claude 종합
- 디버깅: Claude → Codex 검증
- 테스트: Claude → Codex 검증

## Progress Log
| Step | Status | AI Used | Reflection |
|------|--------|---------|------------|
| 1 | ⏳ | - | - |
| 2 | ⏳ | - | - |
| 3 | ⏳ | - | - |
| 4 | ⏳ | - | - |
| 5 | ⏳ | - | - |
```

## Phase 2: Agent Loop (Task Execution)

For each step in the plan, follow this loop:

```
1. Analyze — Read current state, understand what needs to happen
2. Execute — Perform the work (Claude or Codex based on assignment)
3. Reflect — Did this step succeed? Any issues? Update todo.md
4. Iterate — Move to next step or adjust plan if needed
```

### Execution Rules
- **One step at a time** — Complete and verify each step before moving on
- **Update todo.md immediately** — After completing each step, change `[ ]` to `[x]` and update the Progress Log
- **Reflection is mandatory** — After each step, write a brief reflection in the Progress Log
- **Plan changes require notification** — If the plan needs to change, notify the user first
- **Codex calls at checkpoints** — When a step requires Codex, call the appropriate MCP tool:
  - clauxsync_review — Code review
  - clauxsync_debug — Debugging verification
  - clauxsync_refactor — Refactoring review
  - clauxsync_test — Test verification
  - clauxsync_brainstorm — Devil's advocate brainstorming

### Status Markers
- `[ ]` — Pending
- `[→]` — In Progress (current step)
- `[x]` — Completed
- `[!]` — Blocked/Issue found
- `[~]` — Skipped (with reason)

## Codex Interaction Pattern (Co-Commands Style)

When calling Codex at any checkpoint, follow the **independent comparison** pattern:

### For Brainstorming
1. Claude brainstorms independently first
2. Spawn background subagent → call `mcp__validate-plans-and-brainstorm-ideas__codex` with brainstorming prompt
3. Do NOT read Codex results until Claude's own brainstorming is complete
4. Compare both sets of ideas, integrate the best

### For Plan Validation (co-validate)
1. Claude creates/reviews the plan independently
2. Send plan to Codex: "You are a staff engineer reviewing this plan. Find critical issues, simplifications, or better approaches."
3. Compare both reviews
4. Accept or override each point with explanation

### For Code Review / Debugging / Testing / Refactoring
1. Claude completes its analysis first
2. Send code + context to Codex via appropriate clauxsync tool
3. Compare findings
4. Claude synthesizes final result

### Key Rule
**Never read Codex's output before completing your own independent analysis.** Two independent perspectives catch more issues than one influenced by the other.

### Codex Response Treatment
Treat Codex responses as coming from a knowledgeable peer:
- Validate each suggestion independently
- Claude has final say as the lead engineer
- Accept good suggestions, override bad ones with explanation

## Phase 3: Completion

When all steps are done:
1. Verify todo.md — all items must be `[x]` or `[~]` with reason
2. Remove skipped items or document why they were skipped
3. Present final summary to user with:
   - What was accomplished
   - Which AI handled what
   - Any issues encountered and how they were resolved
   - Codex feedback summary (if applicable)

## Key Principles

- **Plan before act** — Never start coding without a plan
- **Track everything** — todo.md is the source of truth
- **Reflect at every step** — Catch issues early
- **Two AIs validate** — Claude creates, Codex validates
- **User stays informed** — Progress updates at each milestone
