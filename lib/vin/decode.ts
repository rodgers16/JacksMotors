import { isValidVin, normalizeVin } from "./validate";

export type DecodedVehicle = {
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  body?: "SUV" | "Sedan" | "Coupe" | "Truck" | "Convertible" | "EV" | "Wagon" | "Hatchback" | "Van";
  drivetrain?: "AWD" | "FWD" | "RWD" | "4WD";
  fuel?: "Gas" | "Hybrid" | "Plug-in Hybrid" | "Diesel" | "Electric";
  transmission?: "Automatic" | "Manual" | "CVT" | "DCT";
};

export type DecodeResult =
  | { ok: true; fields: DecodedVehicle }
  | { ok: false; reason: string };

type NhtsaResult = { Variable: string; Value: string | null };
type NhtsaResponse = { Results?: NhtsaResult[] };

const MAKE_FIXES: Record<string, string> = {
  "MERCEDES-BENZ": "Mercedes-Benz",
  "BMW": "BMW",
  "JAGUAR": "Jaguar",
  "LAND ROVER": "Land Rover",
  "ROLLS-ROYCE": "Rolls-Royce",
  "ALFA ROMEO": "Alfa Romeo",
  "ASTON MARTIN": "Aston Martin",
};

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function normalizeMake(raw: string): string {
  const upper = raw.toUpperCase().trim();
  return MAKE_FIXES[upper] ?? titleCase(raw.trim());
}

function normalizeBody(raw: string): DecodedVehicle["body"] {
  const s = raw.toLowerCase();
  if (s.includes("convertible") || s.includes("roadster") || s.includes("cabriolet")) return "Convertible";
  if (s.includes("coupe")) return "Coupe";
  if (s.includes("sport utility") || s.includes("suv") || s.includes("crossover") || s.includes("mpv")) return "SUV";
  if (s.includes("sedan") || s.includes("saloon")) return "Sedan";
  if (s.includes("pickup") || s.includes("truck")) return "Truck";
  if (s.includes("wagon") || s.includes("estate")) return "Wagon";
  if (s.includes("hatchback")) return "Hatchback";
  if (s.includes("van") || s.includes("minivan")) return "Van";
  return undefined;
}

function normalizeFuel(raw: string): DecodedVehicle["fuel"] {
  const s = raw.toLowerCase();
  if (s.includes("plug-in") || s.includes("phev")) return "Plug-in Hybrid";
  if (s.includes("battery electric") || s === "electric" || s.includes("bev")) return "Electric";
  if (s.includes("hybrid")) return "Hybrid";
  if (s.includes("diesel")) return "Diesel";
  if (s.includes("gasoline") || s.includes("gas")) return "Gas";
  return undefined;
}

function normalizeDrive(raw: string): DecodedVehicle["drivetrain"] {
  const s = raw.toUpperCase();
  if (s.includes("4WD") || s.includes("4X4") || s.includes("4-WHEEL")) return "4WD";
  if (s.includes("AWD") || s.includes("ALL-WHEEL") || s.includes("ALL WHEEL")) return "AWD";
  if (s.includes("FWD") || s.includes("FRONT-WHEEL") || s.includes("FRONT WHEEL")) return "FWD";
  if (s.includes("RWD") || s.includes("REAR-WHEEL") || s.includes("REAR WHEEL")) return "RWD";
  return undefined;
}

function normalizeTransmission(raw: string): DecodedVehicle["transmission"] {
  const s = raw.toLowerCase();
  if (s.includes("dual clutch") || s.includes("dct")) return "DCT";
  if (s.includes("continuously variable") || s.includes("cvt")) return "CVT";
  if (s.includes("manual")) return "Manual";
  if (s.includes("auto")) return "Automatic";
  return undefined;
}

export async function decodeVin(rawVin: string): Promise<DecodeResult> {
  const vin = normalizeVin(rawVin);
  if (!isValidVin(vin)) return { ok: false, reason: "Invalid VIN format (17 chars, no I/O/Q)" };

  let json: NhtsaResponse;
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vin}?format=json`,
      { signal: AbortSignal.timeout(8000), headers: { Accept: "application/json" } }
    );
    if (!res.ok) return { ok: false, reason: `NHTSA returned ${res.status}` };
    json = (await res.json()) as NhtsaResponse;
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "Network error" };
  }

  const map = new Map<string, string>();
  for (const r of json.Results ?? []) {
    if (r.Value && r.Value !== "Not Applicable") map.set(r.Variable, r.Value);
  }

  const yearStr = map.get("Model Year");
  const year = yearStr ? Number(yearStr) : undefined;

  return {
    ok: true,
    fields: {
      vin,
      year: Number.isFinite(year) ? year : undefined,
      make: map.has("Make") ? normalizeMake(map.get("Make")!) : undefined,
      model: map.get("Model") ?? undefined,
      body: map.has("Body Class") ? normalizeBody(map.get("Body Class")!) : undefined,
      fuel: map.has("Fuel Type - Primary") ? normalizeFuel(map.get("Fuel Type - Primary")!) : undefined,
      drivetrain: map.has("Drive Type") ? normalizeDrive(map.get("Drive Type")!) : undefined,
      transmission: map.has("Transmission Style") ? normalizeTransmission(map.get("Transmission Style")!) : undefined,
    },
  };
}
