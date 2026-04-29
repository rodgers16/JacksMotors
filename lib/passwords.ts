import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * scrypt-based password hashing using only Node's built-in crypto.
 * No external deps. Format: "scrypt:<saltHex>:<hashHex>" — 16 byte salt, 64 byte hash.
 *
 * We use `:` as the separator (not `$`) so the hash can be stored in .env files
 * without dotenv-expand interpreting parts of it as variable references.
 */

const KEYLEN = 64;
const SALT_LEN = 16;
const SCRYPT_OPTS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;

export function hashPassword(plain: string): string {
  if (typeof plain !== "string" || plain.length === 0) {
    throw new Error("password must be a non-empty string");
  }
  const salt = randomBytes(SALT_LEN);
  const hash = scryptSync(plain, salt, KEYLEN, SCRYPT_OPTS);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(plain: string, encoded: string | undefined): boolean {
  if (!encoded) return false;
  const parts = encoded.split(":");
  if (parts.length !== 3) return false;
  const [scheme, saltHex, hashHex] = parts;
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(saltHex, "hex");
    expected = Buffer.from(hashHex, "hex");
  } catch {
    return false;
  }
  if (expected.length !== KEYLEN) return false;
  let got: Buffer;
  try {
    got = scryptSync(plain, salt, expected.length, SCRYPT_OPTS);
  } catch {
    return false;
  }
  return got.length === expected.length && timingSafeEqual(got, expected);
}
