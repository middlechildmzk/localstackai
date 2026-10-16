/**
 * StackBuilder AI — Discovery agent (Loop 1) polite HTTP helper.
 *
 * Rules for every source module:
 *  - Unauthenticated public endpoints only. No API keys, no login walls.
 *  - Every request carries a descriptive User-Agent.
 *  - Hard timeout on every request (default 12s); one retry on timeout only.
 *  - Small jittered delay between sequential requests inside a source.
 */

const USER_AGENT =
  process.env.DISCOVERY_USER_AGENT ??
  "StackBuilderDiscovery/1.0 (+https://stackbuilder.ai)";

export const DEFAULT_TIMEOUT_MS = 12_000;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Jittered polite delay between sequential requests (base ms ± 40%). */
export async function politeDelay(baseMs = 900): Promise<void> {
  const jitter = baseMs * (0.8 + Math.random() * 0.4);
  await sleep(jitter);
}

export interface FetchOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  /** Retries on timeout/network error only (default 1). */
  retries?: number;
}

async function fetchOnce(url: string, opts: FetchOptions): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        ...opts.headers,
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch with timeout + one retry on timeout/network failure. Never throws on HTTP error status. */
export async function politeFetch(url: string, opts: FetchOptions = {}): Promise<Response> {
  const retries = opts.retries ?? 1;
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchOnce(url, opts);
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) await politeDelay(1500);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`fetch failed: ${url}`);
}

export async function fetchJson<T>(url: string, opts: FetchOptions = {}): Promise<T> {
  const res = await politeFetch(url, {
    ...opts,
    headers: { Accept: "application/json", ...opts.headers },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return (await res.json()) as T;
}

export async function fetchText(url: string, opts: FetchOptions = {}): Promise<string> {
  const res = await politeFetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return await res.text();
}

export { USER_AGENT };
