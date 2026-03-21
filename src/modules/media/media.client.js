import { prisma } from "../../config/prisma.js";
import { env } from "../../config/env.js";

// In-memory token cache. Tied to the tunnel URL so changing the URL
// forces a re-login against the new host.
let cache = { url: null, token: null, expiry: 0 };

async function getBaseUrl() {
  const config = await prisma.tunnelConfig.findUnique({ where: { id: "singleton" } });
  if (!config?.url) {
    const e = new Error("Media API URL not configured. Set it via PUT /api/tunnel");
    e.status = 503;
    throw e;
  }
  return config.url.replace(/\/$/, ""); // strip trailing slash
}

async function login(baseUrl) {
  let res;
  try {
    res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: env.mediaPassword }),
    });
  } catch {
    const e = new Error("Could not reach Media API");
    e.status = 502;
    throw e;
  }
  if (!res.ok) {
    const e = new Error("Media API authentication failed");
    e.status = 502;
    throw e;
  }
  const data = await res.json();
  return data.token;
}

async function ensureToken(baseUrl) {
  const now = Date.now();
  if (cache.url === baseUrl && cache.token && now < cache.expiry) {
    return cache.token;
  }
  const token = await login(baseUrl);
  cache = { url: baseUrl, token, expiry: now + 23 * 60 * 60 * 1000 }; // 23h TTL (24h JWT - 1h buffer)
  return token;
}

/**
 * Makes an authenticated fetch request to the external media API.
 * Automatically resolves the tunnel URL and manages token refresh on 401.
 *
 * @param {string} path - Path to append to the base URL (e.g. "/media?type=photo")
 * @param {RequestInit} options - Fetch options (method, headers, body, …)
 * @returns {Promise<Response>} Raw fetch Response — caller decides how to handle it
 */
export async function mediaFetch(path, options = {}) {
  const baseUrl = await getBaseUrl();
  let token = await ensureToken(baseUrl);

  const doFetch = (t) =>
    fetch(`${baseUrl}${path}`, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${t}` },
    });

  let res = await doFetch(token);

  // On 401 the token may have expired early — refresh once and retry
  if (res.status === 401) {
    cache = { url: null, token: null, expiry: 0 }; // invalidate
    token = await ensureToken(baseUrl);
    res = await doFetch(token);
  }

  return res;
}

/** Returns the configured base URL (useful for building stream URLs on the client). */
export async function getMediaBaseUrl() {
  return getBaseUrl();
}
