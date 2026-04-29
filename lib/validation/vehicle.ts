import { z } from "zod";
import { VIN_RE } from "@/lib/vin/validate";

export const BODY_VALUES = ["SUV", "Sedan", "Coupe", "Truck", "Convertible", "EV", "Wagon", "Hatchback", "Van"] as const;
export const DRIVETRAIN_VALUES = ["AWD", "FWD", "RWD", "4WD"] as const;
export const FUEL_VALUES = ["Gas", "Hybrid", "Plug-in Hybrid", "Diesel", "Electric"] as const;
export const TRANSMISSION_VALUES = ["Automatic", "Manual", "CVT", "DCT"] as const;
export const STATUS_VALUES = ["draft", "available", "pending", "sold", "hidden"] as const;

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  vin: z
    .string()
    .trim()
    .toUpperCase()
    .regex(VIN_RE, "VIN must be 17 characters (no I, O, or Q)")
    .optional()
    .or(z.literal("")),
  year: z.number().int().min(1990).max(currentYear + 1),
  make: z.string().trim().min(1, "Required").max(60),
  model: z.string().trim().min(1, "Required").max(60),
  trim: z.string().trim().max(80).optional().or(z.literal("")),
  body: z.enum(BODY_VALUES),
  transmission: z.enum(TRANSMISSION_VALUES),
  drivetrain: z.enum(DRIVETRAIN_VALUES),
  fuel: z.enum(FUEL_VALUES),
  exteriorColor: z.string().trim().max(40).optional().or(z.literal("")),
  interiorColor: z.string().trim().max(40).optional().or(z.literal("")),
  /** Dollars, integer */
  price: z.number().int().min(1).max(1_000_000),
  mileage: z.number().int().min(0).max(999_999),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  badges: z.array(z.string().trim().min(1).max(60)).max(40).default([]),
  carfaxUrl: z.string().trim().url().optional().or(z.literal("")),
  status: z.enum(STATUS_VALUES).default("available"),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
