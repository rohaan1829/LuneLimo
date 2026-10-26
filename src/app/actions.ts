"use server";

export type QuoteState =
  | { status: "idle" }
  | { status: "sent"; name: string }
  | { status: "error"; message: string; missing: string[]; values: Record<string, string> };

const REQUIRED: Record<string, string> = {
  pickup: "pickup address",
  dropoff: "destination",
  date: "date",
  time: "time",
  name: "name",
  contact: "phone or email",
};

export async function requestQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  const values = Object.fromEntries(
    ["pickup", "dropoff", "date", "time", "passengers", "name", "contact"].map((k) => [
      k,
      String(formData.get(k) ?? "").trim(),
    ]),
  );

  // Keep a record of text-message consent with the request: carriers can ask for proof of opt-in.
  const smsConsent = formData.get("smsConsent") === "yes";

  const missing = Object.keys(REQUIRED).filter((k) => !values[k]);
  if (missing.length) {
    const labels = missing.map((k) => REQUIRED[k]);
    const list = labels.length > 1 ? `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}` : labels[0];
    return {
      status: "error",
      message: `Add your ${list} so we can quote the trip.`,
      missing,
      values: { ...values, smsConsent: smsConsent ? "yes" : "" },
    };
  }

  // TODO: deliver to Lune Limo's booking inbox or dispatch system once they choose one.
  console.info("[quote request]", { ...values, smsConsent, receivedAt: new Date().toISOString() });

  return { status: "sent", name: values.name.split(" ")[0] };
}
