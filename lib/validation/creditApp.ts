import { z } from "zod";

const phoneRe = /^[+()0-9\-.\s]{7,20}$/;
const postalRe = /^[A-Za-z0-9\s-]{3,10}$/;

export const vehicleSchema = z.object({
  vehicleId: z.string().optional(),
  vehicleTitle: z.string().max(120).optional(),
});

export const personalSchema = z.object({
  firstName: z.string().min(1, "Required").max(60),
  lastName: z.string().min(1, "Required").max(60),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(phoneRe, "Enter a valid phone number"),
  dob: z
    .string()
    .min(1, "Required")
    .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  street: z.string().min(1, "Required").max(120),
  city: z.string().min(1, "Required").max(60),
  region: z.string().min(1, "Required").max(40),
  postal: z.string().regex(postalRe, "Enter a valid postal code"),
});

export const employmentSchema = z.object({
  employer: z.string().min(1, "Required").max(80),
  jobTitle: z.string().max(80).optional().or(z.literal("")),
  monthlyIncome: z
    .string()
    .min(1, "Required")
    .refine((v) => Number(v.replace(/[^0-9.]/g, "")) > 0, "Enter a valid amount"),
  monthsAtJob: z
    .string()
    .min(1, "Required")
    .refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Enter months"),
  housingStatus: z.enum(["own", "rent", "other"]),
  monthlyHousing: z
    .string()
    .min(1, "Required")
    .refine((v) => Number(v.replace(/[^0-9.]/g, "")) >= 0, "Enter a valid amount"),
});

export const consentSchema = z.object({
  consent: z.literal(true, { message: "You must agree to continue" }),
});

export const creditApplicationSchema = vehicleSchema
  .merge(personalSchema)
  .merge(employmentSchema)
  .merge(consentSchema);

export type CreditApplicationInput = z.infer<typeof creditApplicationSchema>;
export type PersonalInput = z.infer<typeof personalSchema>;
export type EmploymentInput = z.infer<typeof employmentSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
