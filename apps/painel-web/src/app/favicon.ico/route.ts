const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#5b7cfa"/><path d="M18 18h28v8H26v7h16v8H26v13h-8V18z" fill="white"/></svg>`;

export function GET() {
  return new Response(favicon, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
  });
}
