import { z } from "zod";

import { formatDateOnly, isDateOnly } from "@/shared/utils/date-only";

import { hiveMaintenanceTypes } from "../types/hive-maintenance";

const costPattern = /^\d+(?:[.,]\d{1,2})?$/;

export const recordHiveMaintenanceSchema = z
  .object({
    performedOn: z
      .string()
      .trim()
      .refine(isDateOnly, "Datum održavanja je obavezan."),
    maintenanceType: z.enum(
      hiveMaintenanceTypes,
      "Izaberite vrstu održavanja.",
    ),
    costAmount: z.string().trim(),
    currencyCode: z.enum(["RSD", "EUR"]).nullable(),
    serviceProvider: z
      .string()
      .trim()
      .max(100, "Izvršilac može imati najviše 100 karaktera."),
    notes: z
      .string()
      .trim()
      .max(1000, "Napomena može imati najviše 1.000 karaktera."),
  })
  .superRefine((values, context) => {
    if (values.performedOn > formatDateOnly(new Date())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["performedOn"],
        message: "Datum održavanja ne može biti u budućnosti.",
      });
    }

    if (values.costAmount && !costPattern.test(values.costAmount)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["costAmount"],
        message: "Unesite nenegativan iznos sa najviše dve decimale.",
      });
    }

    if (values.costAmount && !values.currencyCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["currencyCode"],
        message: "Unesite valutu uz trošak.",
      });
    }

    if (values.currencyCode && !values.costAmount) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["costAmount"],
        message: "Unesite trošak uz valutu.",
      });
    }
  });

export type RecordHiveMaintenanceFormValues = z.infer<
  typeof recordHiveMaintenanceSchema
>;
