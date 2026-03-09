# ClauxSync Setup Guide

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Node.js** | 18+ | Check with `node --version` |
| **ChatGPT Plus or Pro** | Active subscription | Required for Codex OAuth access |
| **Claude Code** | Latest | [Install Claude Code](https://docs.anthropic.com/en/docs/claude-code) |
| **OpenAI Account** | Active | ChatGPT Plus/Pro subscription (for Codex OAuth access) |
| **Codex MCP Server** | Latest | `npx -y @openai/codex mcp-server` (auto-installed via config) |

## Installation

### Option 1: Run directly with npx (recommended)

No install needed. Just run:

```bash
npx clauxsync auth
```

### Option 2: Global install

```bash
npm install -g clauxsync
```

## OAuth Authentication

ClauxSync uses OAuth to connect to OpenAI Codex through your ChatGPT subscription. No API keys required.

### Step 1: Start the auth flow

```bash
npx clauxsync auth
```

This opens your browser to OpenAI's OAuth consent screen.

### Step 2: Approve access

Sign in with your ChatGPT account and approve ClauxSync's access. The permissions requested are:

- **Codex completions** — send prompts to Codex for review and validation
- **Read-only profile** — verify your subscription tier

### Step 3: Token storage

After approval, ClauxSync stores an encrypted refresh token locally at:

```
~/.clauxsync/tokens.json
```

Tokens auto-refresh. You only need to run `auth` once.

### Revoking access

To revoke ClauxSync's access:

```bash
npx clauxsync logout
```

Or revoke manually at [platform.openai.com/account/apps](https://platform.openai.com/account/apps).

## MCP Configuration for Claude Code

Add ClauxSync as an MCP server so Claude Code can use it as a tool.

### Automatic setup

```bash
npx clauxsync init
```

This creates or updates `.claude/mcp.json` in your project root.

### Manual setup

Add the following to `.claude/mcp.json`:

```json
{
  "mcpServers": {
    "clauxsync": {
      "command": "npx",
      "args": ["clauxsync", "start"]
    }
  }
}
```

### Verify the connection

Start Claude Code and look for `clauxsync` in the available MCP tools. You can test with:

```
Use the clauxsync_ping tool to verify the connection.
```

### Codex MCP Server Setup

ClauxSync uses the official OpenAI Codex MCP server for AI collaboration. Add it to your MCP config:

**Option A: CLI (Recommended)**
```bash
claude mcp add validate-plans-and-brainstorm-ideas -- npx -y @openai/codex mcp-server
```

**Option B: Manual**
Add to `~/.claude.json`:
```json
"validate-plans-and-brainstorm-ideas": {
  "command": "npx",
  "args": ["-y", "@openai/codex", "mcp-server"]
}
```

The first time you use a Codex tool, it will open your browser for OAuth login. No API key needed.

## Configuration Options

ClauxSync can be configured via `clauxsync.config.json` in your project root:

```json
{
  "mode": "recommend",
  "codex": {
    "model": "codex",
    "temperature": 0.2
  },
  "tasks": {
    "refactoring": { "codex": "required" },
    "code_review": { "codex": "required" },
    "debugging":   { "codex": "required" },
    "testing":     { "codex": "required" },
    "brainstorming": { "codex": "optional" },
    "planning":    { "codex": "off" },
    "coding":      { "codex": "off" }
  }
}
```

### Modes

| Mode | Behavior |
|------|----------|
| `recommend` | Auto-assigns Codex based on the role table (default) |
| `always` | Always sends to Codex for a second opinion |
| `manual` | Only uses Codex when you explicitly request it |

## Troubleshooting

### "OAuth flow failed" or browser doesn't open

- Ensure you're on Node.js 18+
- Try setting the browser manually: `BROWSER=chrome npx clauxsync auth`
- If behind a corporate proxy, set `HTTPS_PROXY` in your environment

### "Subscription not eligible"

ClauxSync requires a ChatGPT Plus or Pro subscription for Codex access. Free-tier accounts are not supported.

### "MCP server not found" in Claude Code

1. Confirm `.claude/mcp.json` exists in your project root
2. Restart Claude Code after editing the config
3. Run `npx clauxsync start` manually to check for errors

### "Token expired" errors

Tokens should auto-refresh. If they don't:

```bash
npx clauxsync logout
npx clauxsync auth
```

### High latency on Codex responses

Codex responses add a round-trip. If speed is critical:

- Switch to `manual` mode for time-sensitive tasks
- Override specific task phases in `clauxsync.config.json`

### Still stuck?

Open an issue at [github.com/openclaw-studio/clauxsync/issues](https://github.com/openclaw-studio/clauxsync/issues).
