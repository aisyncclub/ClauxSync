import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import http from "node:http";
import { URL, URLSearchParams } from "node:url";
import open from "open";

// ---------------------------------------------------------------------------
// OpenAI Codex OAuth 2.0 configuration
// ---------------------------------------------------------------------------

const OPENAI_AUTH_BASE = "https://auth.openai.com";
const AUTHORIZATION_ENDPOINT = `${OPENAI_AUTH_BASE}/authorize`;
const TOKEN_ENDPOINT = `${OPENAI_AUTH_BASE}/oauth/token`;

const CLIENT_ID = process.env.CLAUXSYNC_CLIENT_ID ?? "clauxsync-mcp";
const REDIRECT_PORT = 9876;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;
const SCOPES = "openai.codex offline_access";

// ---------------------------------------------------------------------------
// Token storage
// ---------------------------------------------------------------------------

interface StoredTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number; // epoch ms
  token_type: string;
}

const CONFIG_DIR = path.join(os.homedir(), ".clauxsync");
const TOKEN_PATH = path.join(CONFIG_DIR, "tokens.json");

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

function readTokens(): StoredTokens | null {
  try {
    if (!fs.existsSync(TOKEN_PATH)) return null;
    const raw = fs.readFileSync(TOKEN_PATH, "utf-8");
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

function writeTokens(tokens: StoredTokens): void {
  ensureConfigDir();
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), {
    mode: 0o600,
  });
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function generateCodeVerifier(): string {
  return base64url(crypto.randomBytes(32));
}

function generateCodeChallenge(verifier: string): string {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return base64url(hash);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns true when a non-expired access token is available (or a refresh
 * token that can be exchanged for a new one).
 */
export function isAuthenticated(): boolean {
  const tokens = readTokens();
  if (!tokens) return false;
  if (Date.now() < tokens.expires_at) return true;
  return !!tokens.refresh_token;
}

/**
 * Returns a valid access token.  Refreshes automatically when the current
 * token has expired and a refresh token is available.  Throws if no tokens
 * exist – call `authenticate()` first.
 */
export async function getAccessToken(): Promise<string> {
  const tokens = readTokens();
  if (!tokens) {
    throw new Error("Not authenticated. Run authenticate() first.");
  }

  // Token still valid – return it directly.
  if (Date.now() < tokens.expires_at - 60_000) {
    return tokens.access_token;
  }

  // Attempt refresh.
  if (tokens.refresh_token) {
    const refreshed = await refreshAccessToken(tokens.refresh_token);
    return refreshed.access_token;
  }

  throw new Error("Access token expired and no refresh token available. Re-authenticate.");
}

/**
 * Runs the full browser-based OAuth 2.0 authorization code flow with PKCE
 * against OpenAI's auth endpoints.  Opens the user's default browser and
 * listens on a local HTTP server for the redirect callback.
 */
export async function authenticate(): Promise<void> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = new URL(AUTHORIZATION_ENDPOINT);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", SCOPES);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  const authCode = await startCallbackServer(state);

  await exchangeCodeForTokens(authCode, codeVerifier);

  console.error("[clauxsync] Authentication successful. Tokens stored.");
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function startCallbackServer(expectedState: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url?.startsWith("/callback")) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
      const code = url.searchParams.get("code");
      const returnedState = url.searchParams.get("state");
      const error = url.searchParams.get("error");

      if (error) {
        const desc = url.searchParams.get("error_description") ?? error;
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`<html><body><h2>Authentication failed</h2><p>${desc}</p></body></html>`);
        server.close();
        reject(new Error(`OAuth error: ${desc}`));
        return;
      }

      if (!code || returnedState !== expectedState) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end("<html><body><h2>Invalid callback</h2></body></html>");
        server.close();
        reject(new Error("Invalid OAuth callback – state mismatch or missing code."));
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        "<html><body><h2>ClauxSync authenticated!</h2><p>You can close this tab.</p></body></html>",
      );
      server.close();
      resolve(code);
    });

    server.listen(REDIRECT_PORT, "127.0.0.1", () => {
      const authUrl = new URL(AUTHORIZATION_ENDPOINT);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.set("scope", SCOPES);
      authUrl.searchParams.set("state", expectedState);

      // We already built the full URL earlier but the verifier isn't in
      // scope here.  The caller computes challenge params independently;
      // we build the URL with them in authenticate() and open the browser
      // from there.  Here we just need the server running.
      console.error("[clauxsync] Waiting for OAuth callback on port", REDIRECT_PORT);
    });

    // Open the browser from the caller (authenticate) after the server
    // is ready.  We signal readiness by resolving through the code callback.
    server.on("listening", () => {
      // Build and open the authorization URL.  Note: code_challenge params
      // are baked into the URL opened in authenticate() – that function
      // calls us, so the browser is opened there.
    });

    // Timeout after 5 minutes.
    const timeout = setTimeout(() => {
      server.close();
      reject(new Error("OAuth callback timed out after 5 minutes."));
    }, 5 * 60 * 1000);

    server.on("close", () => clearTimeout(timeout));
  });
}

async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<StoredTokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };

  const tokens: StoredTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
    token_type: data.token_type,
  };

  writeTokens(tokens);
  return tokens;
}

async function refreshAccessToken(refreshToken: string): Promise<StoredTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  });

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };

  const tokens: StoredTokens = {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? refreshToken,
    expires_at: Date.now() + data.expires_in * 1000,
    token_type: data.token_type,
  };

  writeTokens(tokens);
  return tokens;
}
