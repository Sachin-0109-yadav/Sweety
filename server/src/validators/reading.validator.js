import { z } from "zod";

const readingSlots = [
  "Morning fasting",
  "After breakfast",
  "After lunch",
  "After dinner",
];


const dateSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}$/,
    "Date must use YYYY-MM-DD format"
  )
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Invalid calendar date")
  .refine(
    (value) => value <= new Date().toISOString().slice(0, 10),
    "Future dates are not allowed"
  );

export const createReadingSchema = z.object({
  reading_date: dateSchema,
  reading_slot: z.enum(readingSlots),
  glucose_level: z.number().int().min(40).max(600),
});

export const updateReadingSchema = z
  .object({
    reading_date: dateSchema.optional(),
    reading_slot: z.enum(readingSlots).optional(),
    glucose_level: z.number().int().min(40).max(600).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided",
    }
  );