export const config = {
  matcher: ['/((?!favicon.ico).*)'],
};

export function middleware(req) {
  const user = process.env.INTERNAL_USER;
  const pass = process.env.INTERNAL_PASSWORD;

  // If credentials are not configured yet, let the app pass through.
  // This prevents accidental lockout during setup.
  if (!user || !pass) return;

  const auth = req.headers.get('authorization') || '';
  const expected = 'Basic ' + btoa(`${user}:${pass}`);

  if (auth === expected) return;

  return new Response('Cleared SourcingOS Lite is internal. Enter your username and password.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Cleared SourcingOS Lite"',
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    },
  });
}
