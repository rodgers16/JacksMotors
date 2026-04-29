/**
 * EPA fuel-economy lookup via fueleconomy.gov's free public REST API.
 * No API key, no rate limit for reasonable use.
 *
 * Two-step:
 *   1. Find vehicle option IDs by year/make/model
 *   2. For the first option, fetch full record (city/highway/combined MPG)
 *
 * Many trims of the same model/year share identical MPG, so picking the first
 * option is usually correct. For accuracy with electric/hybrid/PHEV variants
 * we'd need a trim picker — defer to a v2.
 */

export type MpgInfo = {
  city?: number;
  highway?: number;
  combined?: number;
  /** Annual fuel cost estimate from EPA (USD) — useful flavor for buyers. */
  annualFuelCost?: number;
  /** "Gasoline", "Electricity", etc. — surface differs from VIN's fuel type sometimes */
  fuelType?: string;
};

type MenuOption = { value: string; text: string };
type MenuResponse = { menuItem?: MenuOption | MenuOption[] };

type VehicleResponse = {
  city08?: string | number;
  highway08?: string | number;
  comb08?: string | number;
  cityE?: string | number;        // electric / kWh per 100 mi
  highwayE?: string | number;
  combE?: string | number;
  fuelCost08?: string | number;   // annual fuel cost in USD
  fuelType?: string;
};

const num = (v: unknown): number | undefined => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function asArray<T>(v: T | T[] | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export async function lookupMpg(year: number, make: string, model: string): Promise<MpgInfo | null> {
  // EPA's API is XML-by-default; appending ?format=json returns JSON.
  const baseUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options`;
  const params = new URLSearchParams({ year: String(year), make, model });
  const optsRaw = await getJson<MenuResponse>(`${baseUrl}?${params.toString()}&format=json`);
  if (!optsRaw) return null;
  const options = asArray(optsRaw.menuItem);
  if (options.length === 0) return null;

  // Take the first matching trim. Future: filter by transmission/drivetrain to disambiguate.
  const id = options[0].value;
  const detail = await getJson<VehicleResponse>(
    `https://www.fueleconomy.gov/ws/rest/vehicle/${encodeURIComponent(id)}?format=json`
  );
  if (!detail) return null;

  return {
    city:           num(detail.city08)    ?? num(detail.cityE),
    highway:        num(detail.highway08) ?? num(detail.highwayE),
    combined:       num(detail.comb08)    ?? num(detail.combE),
    annualFuelCost: num(detail.fuelCost08),
    fuelType:       typeof detail.fuelType === "string" ? detail.fuelType : undefined,
  };
}
