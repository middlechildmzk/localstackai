import { NextRequest, NextResponse } from "next/server";

/**
 * Canonical host enforcement.
 *
 * Google Search Console shows this site indexed under three hosts:
 * https://www.stackbuilderai.com, https://stackbuilderai.com, and
 * http://stackbuilderai.com, plus the fully indexable duplicate at
 * stackbuilder-ai.vercel.app. This middleware 308-redirects every
 * non-canonical production host to the canonical www domain so
 * authority consolidates on one host.
 *
 * - Only runs when VERCEL_ENV === "production" (previews and local
 *   dev are untouched).
 * - /api/* is excluded via the matcher so Vercel Cron and API calls
 *   that hit deployment URLs are never redirected.
 */
const CANONICAL_HOST = "www.stackbuilderai.com";

export function middleware(req: NextRequest) {
  if (process.env.VERCEL_ENV !== "production") return NextResponse.next();

  const host = req.headers.get("host")?.toLowerCase() ?? "";
  if (host === CANONICAL_HOST) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.protocol = "https:";
  url.host = CANONICAL_HOST;
  url.port = "";
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
