export const EMPTY_COUNTRY_META: CountryMeta = {
  name: "Country",
  capital: "—",
  population: "—",
  currency: "—",
  languages: "—",
  timezone: "—",
  note: "",

  heroImage: "",
  sideImage: "",

  rent50m2: "—",
  cityPrices: {
    beer: "—",
    coffee: "—",
    meal: "—",
  },
  groceries: {
    milk: "—",
    eggs: "—",
    chicken: "—",
    mincedMeat: "—",
    cocaCola: "—",
  },
  publicTransport: {
    monthly: "—",
    yearly: "—",
  },
  phonePlan: "—",
  homeInternet: "—",
  fuel: {
    petrol: "—",
    diesel: "—",
  },
  officialWebsite: {
    label: "—",
    url: "#",
  },
};

export type CountryMeta = {
  name: string;
  subtitle?: string;
  capital: string;
  population: string;
  currency: string;
  languages: string;
  timezone: string;
  note?: string;

  heroImage: string;
  sideImage: string;

  // cost of living
  rent50m2: string; // € / month
  cityPrices: {
    beer: string;
    coffee: string;
    meal: string;
  };
  groceries: {
    milk: string;
    eggs: string;
    chicken: string;
    mincedMeat: string;
    cocaCola: string;
  };
  publicTransport: {
    monthly: string;
    yearly: string;
  };
  phonePlan: string;
  homeInternet: string;
  fuel: {
    petrol: string;
    diesel: string;
  };
  officialWebsite: {
    label: string;
    url: string;
  };
};

export const COUNTRY_META: Record<string, CountryMeta> = {
  si: {
    name: "Slovenia",
    subtitle: "Safe, green, and surprisingly diverse.",
    capital: "Ljubljana",
    population: "~2.1M",
    currency: "EUR",
    languages: "Slovene",
    timezone: "CET/CEST",
    note: "Placeholder values — replace later with real sources.",
    heroImage:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=2400&q=80",
    sideImage:
      "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=2400&q=80",

    rent50m2: "€850–€1,200 / month",
    cityPrices: {
      beer: "€3.5–€5",
      coffee: "€1.8–€3",
      meal: "€10–€18",
    },
    groceries: {
      milk: "€1.0–€1.5",
      eggs: "€2.0–€3.5 (10 pcs)",
      chicken: "€7–€10 / kg",
      mincedMeat: "€8–€12 / kg",
      cocaCola: "€1.3–€2 (1.5L)",
    },
    publicTransport: {
      monthly: "€25–€45",
      yearly: "€250–€450",
    },
    phonePlan: "€10–€20 / month",
    homeInternet: "€25–€35 / month",
    fuel: {
      petrol: "€1.45–€1.70 / L",
      diesel: "€1.50–€1.75 / L",
    },
    officialWebsite: {
      label: "gov.si (Government portal)",
      url: "https://www.gov.si/",
    },
  },

  de: {
    name: "Germany",
    subtitle: "Industry, culture, and strong infrastructure.",
    capital: "Berlin",
    population: "~84M",
    currency: "EUR",
    languages: "German",
    timezone: "CET/CEST",
    note: "Placeholder values — replace later with real sources.",
    heroImage:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=2400&q=80",
    sideImage:
      "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1800&q=80",

    rent50m2: "€1,000–€1,800 / month",
    cityPrices: {
      beer: "€3–€5",
      coffee: "€2–€4",
      meal: "€12–€22",
    },
    groceries: {
      milk: "€1.0–€1.6",
      eggs: "€2.0–€4.0 (10 pcs)",
      chicken: "€8–€12 / kg",
      mincedMeat: "€9–€13 / kg",
      cocaCola: "€1.3–€2.2 (1.5L)",
    },
    publicTransport: {
      monthly: "€49 (Deutschlandticket)",
      yearly: "€588",
    },
    phonePlan: "€10–€25 / month",
    homeInternet: "€25–€45 / month",
    fuel: {
      petrol: "€1.55–€1.90 / L",
      diesel: "€1.55–€1.95 / L",
    },
    officialWebsite: {
      label: "bundesregierung.de (Federal Government)",
      url: "https://www.bundesregierung.de/",
    },
  },

  at: {
    name: "Austria",
    subtitle: "Alps, high living standards, great cities.",
    capital: "Vienna",
    population: "~9.1M",
    currency: "EUR",
    languages: "German",
    timezone: "CET/CEST",
    note: "Placeholder values — replace later with real sources.",
    heroImage:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=80",
    sideImage:
      "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1800&q=80",

    rent50m2: "€900–€1,600 / month",
    cityPrices: {
      beer: "€4–€6",
      coffee: "€2.5–€4",
      meal: "€12–€24",
    },
    groceries: {
      milk: "€1.1–€1.7",
      eggs: "€2.5–€4.5 (10 pcs)",
      chicken: "€9–€13 / kg",
      mincedMeat: "€10–€14 / kg",
      cocaCola: "€1.5–€2.5 (1.5L)",
    },
    publicTransport: {
      monthly: "€50–€70",
      yearly: "€500–€700",
    },
    phonePlan: "€10–€25 / month",
    homeInternet: "€25–€40 / month",
    fuel: {
      petrol: "€1.55–€1.95 / L",
      diesel: "€1.55–€2.00 / L",
    },
    officialWebsite: {
      label: "oesterreich.gv.at (Government services)",
      url: "https://www.oesterreich.gv.at/",
    },
  },
};
