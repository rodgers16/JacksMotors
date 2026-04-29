export type BodyType = "SUV" | "Sedan" | "Coupe" | "Truck" | "Convertible" | "EV";
export type Transmission = "Automatic" | "Manual";
export type Drivetrain = "AWD" | "FWD" | "RWD" | "4WD";
export type Fuel = "Gas" | "Hybrid" | "Diesel" | "Electric";

export type Vehicle = {
  id: string;
  slug: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  price: number;
  mileage: number;
  body: BodyType;
  transmission: Transmission;
  drivetrain: Drivetrain;
  fuel: Fuel;
  badges?: string[];
  href: string;
  /** Primary image URL (Unsplash placeholder until real inventory photos land via the CMS) */
  image: string;
};

const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
export const formatPrice = (n: number) => `$${fmt(n)}`;
export const formatMileage = (n: number) => `${fmt(n)} mi`;

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1600&q=80&auto=format&fit=crop`;

const make = (
  v: Omit<Vehicle, "href" | "slug"> & { slug?: string }
): Vehicle => {
  const slug =
    v.slug ??
    `${v.make}-${v.model}${v.trim ? `-${v.trim}` : ""}-${v.id}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return { ...v, slug, href: `/inventory/${slug}` };
};

export const vehicles: Vehicle[] = [
  make({ id: "1",  year: 2022, make: "Porsche",       model: "911",      trim: "Carrera S",     price: 142900, mileage: 18420, body: "Coupe",       transmission: "Automatic", drivetrain: "RWD", fuel: "Gas",      badges: ["Sport Chrono", "PASM"],     image: u("1503376780353-7e6692767b70") }),
  make({ id: "2",  year: 2023, make: "Mercedes-Benz", model: "GLE 450",  trim: "4MATIC",        price: 78900,  mileage: 22100, body: "SUV",         transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["AMG Line", "Pano roof"],    image: u("1618843479313-40f8afb4b4d8") }),
  make({ id: "3",  year: 2024, make: "BMW",           model: "M340i",    trim: "xDrive",        price: 68500,  mileage: 9200,  body: "Sedan",       transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["M Sport", "Harman Kardon"], image: u("1555215695-3004980ad54e") }),
  make({ id: "4",  year: 2023, make: "Tesla",         model: "Model Y",  trim: "Long Range",    price: 54900,  mileage: 14800, body: "EV",          transmission: "Automatic", drivetrain: "AWD", fuel: "Electric", badges: ["FSD-capable", "7-seat"],    image: u("1617788138017-80ad40651399") }),
  make({ id: "5",  year: 2022, make: "Audi",          model: "RS5",      trim: "Sportback",     price: 89900,  mileage: 21300, body: "Sedan",       transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["Quattro", "B&O"],           image: u("1606664515524-ed2f786a0bd6") }),
  make({ id: "6",  year: 2024, make: "Lexus",         model: "LX 600",   trim: "Ultra Luxury",  price: 132500, mileage: 6800,  body: "SUV",         transmission: "Automatic", drivetrain: "4WD", fuel: "Gas",      badges: ["Ultra Luxury", "Mark Levinson"], image: u("1494905998402-395d579af36f") }),
  make({ id: "7",  year: 2021, make: "BMW",           model: "X5",       trim: "M50i",          price: 72500,  mileage: 38400, body: "SUV",         transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["M Performance"],            image: u("1494905998402-395d579af36f") }),
  make({ id: "8",  year: 2023, make: "Porsche",       model: "Cayenne",  trim: "GTS",           price: 124900, mileage: 11900, body: "SUV",         transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["Sport Chrono"],             image: u("1618843479313-40f8afb4b4d8") }),
  make({ id: "9",  year: 2022, make: "Tesla",         model: "Model 3",  trim: "Performance",   price: 48900,  mileage: 26500, body: "Sedan",       transmission: "Automatic", drivetrain: "AWD", fuel: "Electric", badges: ["FSD-capable"],              image: u("1560958089-b8a1929cea89") }),
  make({ id: "10", year: 2020, make: "Audi",          model: "Q5",       trim: "Premium Plus",  price: 38900,  mileage: 54200, body: "SUV",         transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["Quattro"],                  image: u("1606664515524-ed2f786a0bd6") }),
  make({ id: "11", year: 2024, make: "Mercedes-Benz", model: "C300",     trim: "4MATIC",        price: 58900,  mileage: 4200,  body: "Sedan",       transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["AMG Line"],                 image: u("1502877338535-766e1452684a") }),
  make({ id: "12", year: 2023, make: "Acura",         model: "MDX",      trim: "Type S",        price: 67500,  mileage: 18900, body: "SUV",         transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["ELS Studio 3D"],            image: u("1494905998402-395d579af36f") }),
  make({ id: "13", year: 2021, make: "Porsche",       model: "Macan",    trim: "S",             price: 64900,  mileage: 32100, body: "SUV",         transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["PASM", "Sport Chrono"],     image: u("1618843479313-40f8afb4b4d8") }),
  make({ id: "14", year: 2024, make: "Ford",          model: "F-150",    trim: "Lariat",        price: 62500,  mileage: 11200, body: "Truck",       transmission: "Automatic", drivetrain: "4WD", fuel: "Gas",      badges: ["Tow Package", "Pro Power"], image: u("1606664515524-ed2f786a0bd6") }),
  make({ id: "15", year: 2022, make: "Jeep",          model: "Wrangler", trim: "Rubicon 4xe",   price: 56900,  mileage: 24800, body: "SUV",         transmission: "Automatic", drivetrain: "4WD", fuel: "Hybrid",   badges: ["4xe Hybrid", "Sky One-Touch"], image: u("1494905998402-395d579af36f") }),
  make({ id: "16", year: 2023, make: "BMW",           model: "i4",       trim: "M50",           price: 71900,  mileage: 13400, body: "EV",          transmission: "Automatic", drivetrain: "AWD", fuel: "Electric", badges: ["M Sport", "Harman Kardon"], image: u("1560958089-b8a1929cea89") }),
  make({ id: "17", year: 2022, make: "Mercedes-Benz", model: "C63",      trim: "AMG S",         price: 84500,  mileage: 22600, body: "Coupe",       transmission: "Automatic", drivetrain: "RWD", fuel: "Gas",      badges: ["AMG Performance"],          image: u("1485291571150-772bcfc10da5") }),
  make({ id: "18", year: 2020, make: "Honda",         model: "Civic",    trim: "Type R",        price: 39900,  mileage: 41200, body: "Sedan",       transmission: "Manual",    drivetrain: "FWD", fuel: "Gas",      badges: ["Manual"],                   image: u("1502877338535-766e1452684a") }),
  make({ id: "19", year: 2024, make: "BMW",           model: "M4",       trim: "Competition",   price: 92900,  mileage: 5800,  body: "Coupe",       transmission: "Automatic", drivetrain: "RWD", fuel: "Gas",      badges: ["M Driver's Pkg"],           image: u("1485291571150-772bcfc10da5") }),
  make({ id: "20", year: 2021, make: "Toyota",        model: "RAV4",     trim: "Hybrid XSE",    price: 36500,  mileage: 48900, body: "SUV",         transmission: "Automatic", drivetrain: "AWD", fuel: "Hybrid",   badges: ["Hybrid"],                   image: u("1494905998402-395d579af36f") }),
  make({ id: "21", year: 2023, make: "Audi",          model: "A7",       trim: "Prestige 55",   price: 76900,  mileage: 16200, body: "Sedan",       transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["Bang & Olufsen"],           image: u("1502877338535-766e1452684a") }),
  make({ id: "22", year: 2022, make: "Mercedes-Benz", model: "SL 55",    trim: "AMG Roadster",  price: 134900, mileage: 8400,  body: "Convertible", transmission: "Automatic", drivetrain: "AWD", fuel: "Gas",      badges: ["AMG", "Burmester"],         image: u("1542362567-b07e54358753") }),
  make({ id: "23", year: 2024, make: "Porsche",       model: "Taycan",   trim: "4S",            price: 119900, mileage: 7200,  body: "EV",          transmission: "Automatic", drivetrain: "AWD", fuel: "Electric", badges: ["Performance Battery+"],     image: u("1560958089-b8a1929cea89") }),
  make({ id: "24", year: 2023, make: "Lexus",         model: "RX 500h",  trim: "F Sport",       price: 71900,  mileage: 14600, body: "SUV",         transmission: "Automatic", drivetrain: "AWD", fuel: "Hybrid",   badges: ["F Sport", "Mark Levinson"], image: u("1494905998402-395d579af36f") }),
];

/** Backwards-compat alias used by the homepage's featured rail */
export const featuredVehicles: Vehicle[] = vehicles.slice(0, 6);

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return vehicles.find((v) => v.slug === slug);
}

// ---------- Filter & sort ----------

export type SortKey = "newest" | "price-asc" | "price-desc" | "mileage-asc";

export type InventoryFilters = {
  make?: string;
  body?: string; // accepts lower- or mixed-case (matches Vehicle["body"] case-insensitively)
  fuel?: string;
  drivetrain?: string;
  minYear?: number;
  maxPrice?: number;
  q?: string;
  sort?: SortKey;
};

export function parseFilters(searchParams: Record<string, string | string[] | undefined>): InventoryFilters {
  const get = (k: string): string | undefined => {
    const v = searchParams[k];
    if (Array.isArray(v)) return v[0];
    return v;
  };
  const num = (k: string): number | undefined => {
    const v = get(k);
    if (!v) return undefined;
    const n = Number(v.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const sortKey = get("sort") as SortKey | undefined;
  return {
    make: get("make")?.trim() || undefined,
    body: get("body")?.trim() || undefined,
    fuel: get("fuel")?.trim() || undefined,
    drivetrain: get("drivetrain")?.trim() || undefined,
    minYear: num("minYear"),
    maxPrice: num("maxPrice"),
    q: get("q")?.trim() || undefined,
    sort: ["newest", "price-asc", "price-desc", "mileage-asc"].includes(sortKey ?? "")
      ? sortKey
      : undefined,
  };
}

export function applyFilters(list: Vehicle[], f: InventoryFilters): Vehicle[] {
  let out = list;
  if (f.make)       out = out.filter((v) => v.make.toLowerCase() === f.make!.toLowerCase());
  if (f.body)       out = out.filter((v) => v.body.toLowerCase() === f.body!.toLowerCase());
  if (f.fuel)       out = out.filter((v) => v.fuel.toLowerCase() === f.fuel!.toLowerCase());
  if (f.drivetrain) out = out.filter((v) => v.drivetrain.toLowerCase() === f.drivetrain!.toLowerCase());
  if (f.minYear)    out = out.filter((v) => v.year >= f.minYear!);
  if (f.maxPrice)   out = out.filter((v) => v.price <= f.maxPrice!);
  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter((v) =>
      `${v.year} ${v.make} ${v.model} ${v.trim ?? ""}`.toLowerCase().includes(q)
    );
  }
  return out;
}

export function applySort(list: Vehicle[], sort: SortKey = "newest"): Vehicle[] {
  const out = [...list];
  switch (sort) {
    case "price-asc":   return out.sort((a, b) => a.price - b.price);
    case "price-desc":  return out.sort((a, b) => b.price - a.price);
    case "mileage-asc": return out.sort((a, b) => a.mileage - b.mileage);
    case "newest":
    default:            return out.sort((a, b) => b.year - a.year || a.mileage - b.mileage);
  }
}

// ---------- Page imagery ----------

/** Hero — a wide cinematic shot to underlay the headline */
export const heroImage = u("1493238792000-8113da705763");

/** Body-type tile imagery */
export const bodyTypeImages: Record<string, string> = {
  suv: u("1494905998402-395d579af36f"),
  sedan: u("1502877338535-766e1452684a"),
  coupe: u("1485291571150-772bcfc10da5"),
  truck: u("1606664515524-ed2f786a0bd6"),
  ev: u("1560958089-b8a1929cea89"),
  convertible: u("1542362567-b07e54358753"),
};

/** Trade-in / showroom imagery */
export const tradeInImage = u("1494976388531-d1058494cdd8");

/** Live grid (Instagram-style social tiles) */
export const liveImages: string[] = [
  u("1552519507-da3b142c6e3d"),
  u("1542362567-b07e54358753"),
  u("1485291571150-772bcfc10da5"),
  u("1502877338535-766e1452684a"),
  u("1493238792000-8113da705763"),
  u("1494976388531-d1058494cdd8"),
];
