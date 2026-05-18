import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(req) {
  const user = process.env.INTERNAL_USER;
  const pass = process.env.INTERNAL_PASSWORD;

  if (!user || !pass) {
    const res = NextResponse.next();
    res.headers.set('x-internal-auth', 'not-configured');
    return res;
  }

  const auth = req.headers.get('authorization') || '';
  const expected = 'Basic ' + btoa(`${user}:${pass}`);

  if (auth === expected) {
    const res = NextResponse.next();
    res.headers.set('x-internal-auth', 'ok');
    return res;
  }

  return new Response('Cleared SourcingOS Lite is internal. Enter your username and password.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Cleared SourcingOS Lite"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    },
  });
}
