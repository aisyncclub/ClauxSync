---
description: "Refactor code with Codex validation. Pass a file path as argument."
---

You MUST call the `clauxsync_refactor` MCP tool to validate the refactoring with Codex.

Steps:
1. Read the file from $ARGUMENTS (or use current context)
2. Perform your own refactoring first
3. Send the ORIGINAL code to `clauxsync_refactor` to get Codex's independent refactoring suggestions
4. Compare both refactoring approaches
5. Present the best version to the user, explaining key differences
6. Ensure behavior is preserved — no regressions
