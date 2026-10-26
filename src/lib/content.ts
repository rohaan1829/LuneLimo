/**
 * Every client-facing fact on the site lives here.
 * Items marked CONFIRM are working copy for the pitch and need checking with Lune Limo.
 */

export const site = "https://lunelimo.ca";

export const contact = {
  // CONFIRM: real number, inbox and service area.
  phone: "+00 000 000 000",
  phoneHref: "tel:+00000000000",
  email: "support@lunelimo.ca",
  area: "City, airports and intercity",
  hours: "Open 24 hours, every day",
};

// CONFIRM: the fleet's models and colours.
export const fleet = ["Cadillac Escalade", "Chevrolet Suburban", "GMC Yukon"] as const;

export const carChapters = [
  {
    id: "fleet",
    title: "Escalade, Suburban or Yukon.",
    body: "Full-size, washed and parked outside before you come down. Every car in the fleet is kept to the same standard, whichever one arrives.",
  },
  {
    id: "cabin",
    title: "Room for six, or room to think.",
    body: "Captain’s chairs, privacy glass and a cabin quiet enough to take a call.",
    // CONFIRM: capacity and amenities per vehicle.
    specs: [
      ["Seats", "Up to 6 passengers"],
      ["Luggage", "4 large cases"],
      ["On board", "Wi-Fi, chargers, still water"],
    ],
  },
  {
    id: "chauffeur",
    title: "Your chauffeur takes it from here.",
    body: "Licensed, vetted and in a suit. Trained to be on time, never in a hurry.",
  },
] as const;

// An early-morning airport run, start to finish. CONFIRM: the timings match how Lune Limo operates.
export const rideSteps = [
  {
    when: "The night before",
    title: "You book",
    body: "Online or by phone. The fare is fixed and confirmed in writing, with your chauffeur’s name and number.",
  },
  {
    when: "An hour before",
    title: "We check the flight and the roads",
    body: "If your flight moves or traffic builds, we adjust the pickup and text you.",
  },
  {
    when: "Fifteen minutes before",
    title: "The car is outside",
    body: "Engine quiet, cabin at the temperature you asked for.",
  },
  {
    when: "Pickup",
    title: "Bags in, door closed",
    body: "Your chauffeur handles the luggage. Water, chargers and Wi-Fi are already in the car.",
  },
  {
    when: "Arrival",
    title: "Drop-off at departures",
    body: "Nothing to pay in the car. The receipt is in your inbox before you reach security.",
  },
] as const;

export const dayServices = [
  ["Airport transfers", "Flights tracked. Your chauffeur meets you inside arrivals with your name."],
  ["Corporate travel", "Meetings, roadshows and site visits, booked by the hour or the day."],
  ["Weddings", "The car dressed in your colours, and a chauffeur who knows the running order."],
  ["City to city", "Longer trips without the airport. A quiet cabin and Wi-Fi the whole way."],
] as const;

export const nightServices = [
  ["Evenings out", "Dinner, theatre, the game. Dropped at the door, collected when you call."],
  ["Events and galas", "Arrivals timed to the minute, with a car for every guest if you need one."],
  ["Late flights", "Landing after midnight is fine. We’re tracking the flight either way."],
  ["The whole night", "Keep the car and the chauffeur for as long as the evening lasts."],
] as const;

// CONFIRM: replace with real, approved client quotes.
export const voices = [
  {
    quote: "The flight landed two hours late and the driver was still there, with water and a charger waiting. That’s the whole review.",
    who: "Finance director, regular airport client",
  },
  {
    quote: "Three cars for our wedding, all early, all spotless. Nobody had to chase anyone all day.",
    who: "Wedding client",
  },
  {
    quote: "We use them for every board visit now. Same car, same standard, every time.",
    who: "Executive assistant, private equity firm",
  },
] as const;
