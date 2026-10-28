// Where the live data (/api/...) comes from.
// On Cloudflare the pages and the API are on the same site, so this is empty.
// The Hostinger copy is plain files, so it asks the Cloudflare site instead.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}
