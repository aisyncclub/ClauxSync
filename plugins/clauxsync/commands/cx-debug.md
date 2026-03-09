---
description: "Collaborate with Codex to debug an issue. Pass error message or file path as argument."
---

You MUST call the `clauxsync_debug` MCP tool to get Codex's debugging analysis.

If $ARGUMENTS contains an error message or file path, use that as context.

Steps:
1. Analyze the bug independently first — identify potential root causes
2. Call `clauxsync_debug` with the code and error context
3. Compare Codex's root cause analysis against yours
4. Present the combined findings — where both AIs agree, confidence is high
5. Suggest a fix based on the stronger analysis
