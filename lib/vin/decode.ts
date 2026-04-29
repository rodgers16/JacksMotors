import { isValidVin, normalizeVin } from "./validate";

export type DecodedVehicle = {
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  /** Factory trim (e.g. "xDrive40i", "Sport Touring") — when NHTSA returns it. */
  trim?: string;
  /** Series / sub-model identifier sometimes returned alongside model. */
  series?: string;
  body?: "SUV" | "Sedan" | "Coupe" | "Truck" | "Convertible" | "EV" | "Wagon" | "Hatchback" | "Van";
  drivetrain?: "AWD" | "FWD" | "RWD" | "4WD";
  fuel?: "Gas" | "Hybrid" | "Plug-in Hybrid" | "Diesel" | "Electric";
  transmission?: "Automatic" | "Manual" | "CVT" | "DCT";
  /** Number of doors (e.g. 2 / 4) */
  doors?: number;
  /** Engine cylinders (e.g. 4, 6, 8) */
  cylinders?: number;
  /** Displacement in litres (e.g. 2.0, 3.5) */
  displacementL?: number;
  /** Where the vehicle was assembled */
  plantCountry?: string;
  plantCity?: string;
  /** Manufacturer's full name (e.g. "Toyota Motor Manufacturing Kentucky, Inc.") */
  manufacturer?: string;
  /**
   * Active safety / driver-assist features reported by the manufacturer as
   * STANDARD on this VIN's configuration. We omit "Optional" since we can't
   * tell whether this specific car has the option box checked.
   */
  safetyFeatures?: string[];
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

  const numOrUndef = (s: string | undefined): number | undefined => {
    if (!s) return undefined;
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };

  const cleanString = (s: string | undefined): string | undefined => {
    if (!s) return undefined;
    const t = s.trim();
    return t.length === 0 ? undefined : t;
  };

  // Build the safety/driver-assist list from variables NHTSA marks "Standard".
  // Friendly labels for buyers — fewer acronyms.
  const SAFETY_VARS: Array<[string, string]> = [
    ["Anti-lock Braking System (ABS)", "ABS"],
    ["Electronic Stability Control (ESC)", "Stability Control"],
    ["Traction Control", "Traction Control"],
    ["Backup Camera", "Backup Camera"],
    ["Adaptive Cruise Control (ACC)", "Adaptive Cruise"],
    ["Crash Imminent Braking (CIB)", "Auto Emergency Braking"],
    ["Forward Collision Warning (FCW)", "Forward Collision Warning"],
    ["Lane Departure Warning (LDW)", "Lane Departure Alert"],
    ["Lane Keeping Assistance (LKA)", "Lane Keep Assist"],
    ["Lane Centering Assistance (LCA)", "Lane Centering"],
    ["Blind Spot Warning (BSW)", "Blind Spot Monitor"],
    ["Blind Spot Intervention (BSI)", "Blind Spot Intervention"],
    ["Park Assist", "Park Assist"],
    ["Rear Cross Traffic Alert", "Rear Cross-Traffic Alert"],
    ["Rear Automatic Emergency Braking", "Rear Auto Braking"],
    ["Pedestrian Automatic Emergency Braking (PAEB)", "Pedestrian Auto Braking"],
    ["Auto-Reverse System for Windows and Sunroofs", "Auto-Reverse Windows"],
    ["Daytime Running Light (DRL)", "Daytime Running Lights"],
  ];
  const safetyFeatures: string[] = [];
  for (const [variable, label] of SAFETY_VARS) {
    const val = (map.get(variable) ?? "").trim();
    if (val.toLowerCase().startsWith("standard")) safetyFeatures.push(label);
  }
  // TPMS is reported by type, not Standard/Optional — include it whenever a real type is reported.
  const tpms = cleanString(map.get("Tire Pressure Monitoring System (TPMS) Type"));
  if (tpms && !/^(none|not applicable)$/i.test(tpms)) {
    safetyFeatures.push("Tire Pressure Monitor");
  }

  const trim = cleanString(map.get("Trim")) ?? cleanString(map.get("Trim2"));
  const series = cleanString(map.get("Series")) ?? cleanString(map.get("Series2"));

  return {
    ok: true,
    fields: {
      vin,
      year: numOrUndef(map.get("Model Year")),
      make: map.has("Make") ? normalizeMake(map.get("Make")!) : undefined,
      model: cleanString(map.get("Model")),
      trim,
      series: series && series !== trim ? series : undefined,
      body: map.has("Body Class") ? normalizeBody(map.get("Body Class")!) : undefined,
      fuel: map.has("Fuel Type - Primary") ? normalizeFuel(map.get("Fuel Type - Primary")!) : undefined,
      drivetrain: map.has("Drive Type") ? normalizeDrive(map.get("Drive Type")!) : undefined,
      transmission: map.has("Transmission Style") ? normalizeTransmission(map.get("Transmission Style")!) : undefined,
      doors: numOrUndef(map.get("Doors")),
      cylinders: numOrUndef(map.get("Engine Number of Cylinders")),
      displacementL: numOrUndef(map.get("Displacement (L)")),
      plantCountry: cleanString(map.get("Plant Country")),
      plantCity: cleanString(map.get("Plant City")),
      manufacturer: cleanString(map.get("Manufacturer Name")),
      safetyFeatures: safetyFeatures.length > 0 ? safetyFeatures : undefined,
    },
  };
}
