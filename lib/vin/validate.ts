/** VINs are 17 chars and exclude I, O, Q to avoid confusion with 1, 0. */
export const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

export function normalizeVin(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]/g, "");
}

export function isValidVin(input: string): boolean {
  return VIN_RE.test(normalizeVin(input));
}
