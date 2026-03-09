---
description: "Send code to Codex for an independent code review. Pass a file path or let it review the current context."
---

You MUST call the `clauxsync_review` MCP tool to send the code to OpenAI Codex for review.

If $ARGUMENTS contains a file path, read that file first and send its contents.
If $ARGUMENTS is empty, review the most recently discussed or modified code in context.

Steps:
1. Complete your own independent code review first — identify bugs, security issues, performance, style
2. Call `clauxsync_review` with the code and any relevant context
3. Compare Codex's review against your own
4. Present a unified review to the user, noting where you and Codex agree or disagree
5. For disagreements, explain your reasoning and let the user decide
