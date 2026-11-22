export const types = {
  '.html': 'text/html', '.css': 'text/css', '.mjs': 'text/javascript', '.woff2': 'font/woff2',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.txt': 'text/plain'
};

const policy = "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'";

export function responseHeaders(type) {
  return {
    'Content-Type': `${type}${type.startsWith('text/') || type === 'application/json' ? '; charset=utf-8' : ''}`,
    'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': policy,
    'Cross-Origin-Resource-Policy': 'same-origin'
  };
}
