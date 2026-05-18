export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(req) {
  const user = process.env.INTERNAL_USER;
  const pass = process.env.INTERNAL_PASSWORD;

  if (!user || !pass) {
    return new Response(null, { status: 200, headers: { 'x-internal-auth': 'not-configured' } });
  }

  const auth = req.headers.get('authorization') || '';
  const expected = 'Basic ' + btoa(`${user}:${pass}`);

  if (auth === expected) {
    return new Response(null, { status: 200, headers: { 'x-internal-auth': 'ok' } });
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
