import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ---------- Enums ----------

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "draft",
  "available",
  "pending",
  "sold",
  "hidden",
]);
export const bodyTypeEnum = pgEnum("body_type", [
  "SUV",
  "Sedan",
  "Coupe",
  "Truck",
  "Convertible",
  "EV",
  "Wagon",
  "Hatchback",
  "Van",
]);
export const drivetrainEnum = pgEnum("drivetrain", ["AWD", "FWD", "RWD", "4WD"]);
export const fuelEnum = pgEnum("fuel", [
  "Gas",
  "Hybrid",
  "Plug-in Hybrid",
  "Diesel",
  "Electric",
]);
export const transmissionEnum = pgEnum("transmission", [
  "Automatic",
  "Manual",
  "CVT",
  "DCT",
]);
export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "approved",
  "sold",
  "lost",
]);

// ---------- Vehicles ----------

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    status: vehicleStatusEnum("status").notNull().default("draft"),
    vin: text("vin"),
    year: integer("year").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    trim: text("trim"),
    body: bodyTypeEnum("body").notNull(),
    transmission: transmissionEnum("transmission").notNull(),
    drivetrain: drivetrainEnum("drivetrain").notNull(),
    fuel: fuelEnum("fuel").notNull(),
    exteriorColor: text("exterior_color"),
    interiorColor: text("interior_color"),
    /** Stored in cents to avoid float drift; format to dollars at the boundary. */
    priceCents: integer("price_cents").notNull(),
    /** Stored as miles (US). Column name kept as "mileage_km" to preserve existing migration. */
    mileage: integer("mileage_km").notNull(),
    description: text("description"),
    badges: text("badges").array().notNull().default(sql`ARRAY[]::text[]`),
    carfaxUrl: text("carfax_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    soldAt: timestamp("sold_at", { withTimezone: true }),
  },
  (t) => ({
    slugUnique: uniqueIndex("vehicles_slug_idx").on(t.slug),
    statusIdx: index("vehicles_status_idx").on(t.status),
    vinIdx: index("vehicles_vin_idx").on(t.vin),
    publishedIdx: index("vehicles_published_idx").on(t.publishedAt),
  })
);

export const vehicleRelations = relations(vehicles, ({ many }) => ({
  photos: many(vehiclePhotos),
  leads: many(creditApplications),
}));

// ---------- Vehicle photos ----------

export const vehiclePhotos = pgTable(
  "vehicle_photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    /** base64 LQIP from sharp; ~600 bytes; used for next/image placeholder="blur" */
    blur: text("blur"),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    /** Ordering for drag-reorder; first photo (lowest position) is the card thumbnail */
    position: integer("position").notNull().default(0),
    alt: text("alt"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    vehicleIdx: index("vehicle_photos_vehicle_idx").on(t.vehicleId, t.position),
  })
);

export const vehiclePhotoRelations = relations(vehiclePhotos, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [vehiclePhotos.vehicleId],
    references: [vehicles.id],
  }),
}));

// ---------- Credit application leads ----------

export const creditApplications = pgTable(
  "credit_applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    vehicleTitle: text("vehicle_title"),
    status: leadStatusEnum("status").notNull().default("new"),
    /** Encrypted at rest via @noble/ciphers AES-GCM (key from ENCRYPTION_KEY env) */
    payloadEncrypted: text("payload_encrypted").notNull(),
    /** Plaintext minimal contact info, to surface in the leads list w/o decrypt */
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    contactPhone: text("contact_phone").notNull(),
    notes: text("notes"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
    contactedAt: timestamp("contacted_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ip: text("ip"),
    userAgent: text("user_agent"),
  },
  (t) => ({
    statusIdx: index("credit_apps_status_idx").on(t.status),
    submittedIdx: index("credit_apps_submitted_idx").on(t.submittedAt),
  })
);

export const creditApplicationRelations = relations(creditApplications, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [creditApplications.vehicleId],
    references: [vehicles.id],
  }),
}));

// ---------- Auth (NextAuth Drizzle adapter standard) ----------

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date", withTimezone: true }),
  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.identifier, t.token] }),
  })
);

// ---------- Type exports ----------

export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type VehiclePhoto = typeof vehiclePhotos.$inferSelect;
export type NewVehiclePhoto = typeof vehiclePhotos.$inferInsert;
export type CreditApplicationRow = typeof creditApplications.$inferSelect;
export type NewCreditApplication = typeof creditApplications.$inferInsert;

export type VehicleWithPhotos = Vehicle & { photos: VehiclePhoto[] };

// ---------- Status helpers ----------

export const PUBLIC_STATUSES = ["available", "pending"] as const;
// Suppress unused-import warning while keeping `boolean` reachable for future columns.
export const _typeAnchor = { boolean };
