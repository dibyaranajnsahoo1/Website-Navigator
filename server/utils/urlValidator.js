const xss = require('xss');

function validateUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;

  let url = xss(raw.trim());

  url = url.replace(/^["'\s]+|["'\s]+$/g, '');

  if (!url) return null;

  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) return null;

    const hostname = parsed.hostname;
    if (!hostname) return null;
    if (hostname !== 'localhost' && !hostname.includes('.')) return null;
    const privatePatterns = [
      /^10\./,
      /^192\.168\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^127\./,
      /^0\./,
      /^::1$/,
      /^localhost$/i,
    ];
    if (privatePatterns.some((p) => p.test(hostname))) return null;

    return parsed.href;
  } catch {
    return null;
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function getFaviconUrl(url) {
  try {
    const domain = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

function deduplicateUrls(urls) {
  const seen = new Set();
  return urls.filter((u) => {
    if (seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

module.exports = { validateUrl, extractDomain, getFaviconUrl, deduplicateUrls };
