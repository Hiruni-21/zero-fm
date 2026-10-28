// Lets the Hostinger copy of the site (zerofm.live) read the live data
// from this Cloudflare site.
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function withCors<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response> | Response
) {
  return async (...args: Args) => {
    const response = await handler(...args);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      headers.set(key, value);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

// The browser checks with this before sending a request from zerofm.live
export function corsPreflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
