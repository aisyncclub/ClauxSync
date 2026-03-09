---
description: "Generate and verify tests with Codex. Pass a file path as argument."
---

You MUST call the `clauxsync_test` MCP tool to get Codex's test analysis.

Steps:
1. Read the file from $ARGUMENTS (or use current context)
2. Write your own tests first — cover happy paths, edge cases, error handling
3. Send the code to `clauxsync_test` for Codex's independent test generation
4. Compare test coverage — identify gaps each AI missed
5. Merge the best tests from both into a final test suite
6. Present to user with coverage summary
