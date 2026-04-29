import { gcm } from "@noble/ciphers/aes";
import { bytesToUtf8, hexToBytes, utf8ToBytes } from "@noble/ciphers/utils";
import { managedNonce } from "@noble/ciphers/webcrypto";

/**
 * AES-256-GCM with a managed (random) nonce, keyed off ENCRYPTION_KEY.
 * Used to encrypt credit-application PII at the column level.
 */

function getKey(): Uint8Array {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex) throw new Error("ENCRYPTION_KEY is not set (64 hex chars / 32 bytes).");
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes).");
  }
  return hexToBytes(hex);
}

const cipher = () => managedNonce(gcm)(getKey());

export function encryptString(plaintext: string): string {
  const ct = cipher().encrypt(utf8ToBytes(plaintext));
  return Buffer.from(ct).toString("base64");
}

export function decryptString(b64: string): string {
  const ct = new Uint8Array(Buffer.from(b64, "base64"));
  return bytesToUtf8(cipher().decrypt(ct));
}

export function encryptJSON(value: unknown): string {
  return encryptString(JSON.stringify(value));
}

export function decryptJSON<T = unknown>(b64: string): T {
  return JSON.parse(decryptString(b64)) as T;
}
