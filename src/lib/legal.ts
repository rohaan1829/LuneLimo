import { contact } from "./content";

/**
 * The facts the terms and privacy policy depend on.
 *
 * CONFIRM every field with Lune Limo before publishing. For toll-free verification, `legalName`
 * must match the business name on the application exactly.
 */
export const company = {
  brand: "Lune Limo",
  /** Registered name, e.g. "Lune Limo Inc.". */
  legalName: "Lune Limo",
  /** Province whose law governs the terms, e.g. "Ontario". Left empty, the terms fall back to the province of registration. */
  province: "",
  /** Mailing address. Shown on both pages once set. */
  address: "",
  email: contact.email,
  /** Change this whenever either document changes. */
  updated: "October 25, 2026",
};

/** Name of the text-message program, as it appears in the terms and on the booking form. */
export const smsProgram = "Lune Limo ride updates";
