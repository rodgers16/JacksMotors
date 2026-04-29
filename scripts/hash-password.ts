/**
 * Generate a scrypt password hash to paste into ADMIN_PASSWORD_HASH.
 * Usage:  npm run admin:hash -- "your password here"
 *
 * The plain password never touches disk — it's read from argv, hashed,
 * and only the hash (one-way) is printed.
 */
import { hashPassword } from "../lib/passwords";

const plain = process.argv.slice(2).join(" ");
if (!plain) {
  console.error('Usage: npm run admin:hash -- "your password"');
  process.exit(1);
}

const hash = hashPassword(plain);
console.log("\nADMIN_PASSWORD_HASH=" + hash + "\n");
