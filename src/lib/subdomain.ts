export const RESERVED_SUBDOMAINS = new Set([
  'www',
  'api',
  'admin',
  'app',
  'mail',
  'support',
  'help',
  'status',
  'dashboard',
  'auth',
  'cdn',
  'static',
  'assets',
  'docs',
  'blog',
  'ftp',
  'localhost',
  'root',
]);

export function normalizeSubdomain(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidSubdomainFormat(value: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value);
}
