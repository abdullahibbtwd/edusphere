import crypto from "crypto";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hashOneTimeCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim()).digest("hex");
}

/**
 * Backward-compatible matcher:
 * - preferred: hashed comparison
 * - fallback: plain-text comparison for legacy rows
 */
export function matchesOneTimeCode(input: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const normalizedInput = input.trim();
  if (stored === normalizedInput) return true;
  return hashOneTimeCode(normalizedInput) === stored;
}
