export type CountryMeta = {
  // comes from API
  name: string;
  capital: string;
  population: string;
  currency: string;
  languages: string;
  timezone: string;

  // economic overrides
  subtitle?: string;
  note?: string;

  heroImage?: string;
  sideImage?: string;

  rent50m2?: string;
  cityPrices?: {
    beer?: string;
    coffee?: string;
    meal?: string;
    fastFood?: string;
  };
  groceries?: {
    milk?: string;
    eggs?: string;
    chicken?: string;
    mincedMeat?: string;
    cocaCola?: string;
    flour?: string;
  };
  publicTransport?: {
    monthly?: string;
    yearly?: string;
  };
  phonePlan?: string;
  homeInternet?: string;
  fuel?: {
    petrol?: string;
    diesel?: string;
  };
  officialWebsite?: {
    label?: string;
    url?: string;
  };
};
