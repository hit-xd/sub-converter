// Base64 helpers that tolerate the messy encodings found in share links:
// URL-safe alphabet (-_), missing padding, and UTF-8 payloads (Chinese node names).

/** Normalize a URL-safe / unpadded base64 string to standard padded base64. */
function normalizeBase64(input: string): string {
  let s = input.trim().replace(/\s/g, '')
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4
  if (pad === 2) s += '=='
  else if (pad === 3) s += '='
  else if (pad === 1) s = s.slice(0, -1) // malformed tail byte, drop it
  return s
}

/** Decode base64 (standard or URL-safe) into a UTF-8 string. */
export function decodeBase64(input: string): string {
  const normalized = normalizeBase64(input)
  const binary = atob(normalized)
  // Reinterpret the latin1 bytes from atob as UTF-8 so multibyte names survive.
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder('utf-8').decode(bytes)
}

/** Encode a UTF-8 string to standard base64 (used only in tests/round-trips). */
export function encodeBase64(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

/** True if the string is plausibly a base64 blob (no obvious link scheme). */
export function looksLikeBase64(input: string): boolean {
  const s = input.trim().replace(/\s/g, '')
  if (s.length === 0) return false
  return /^[A-Za-z0-9+/\-_=]+$/.test(s)
}
