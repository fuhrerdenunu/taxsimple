import type { ProvincialConfig, OntarioSurtax, HealthPremiumBracket } from '../../types';

export const ontario2024: ProvincialConfig = {
  name: 'Ontario',
  brackets: [
    { min: 0, max: 51446, rate: 0.0505 },
    { min: 51446, max: 102894, rate: 0.0915 },
    { min: 102894, max: 150000, rate: 0.1116 },
    { min: 150000, max: 220000, rate: 0.1216 },
    { min: 220000, max: Infinity, rate: 0.1316 }
  ],
  bpa: 12399,
  surtax: {
    first: 5554,
    firstRate: 0.20,
    second: 7108,
    secondRate: 0.36
  } as OntarioSurtax,
  healthPremium: [
    { max: 20000, amount: 0 },
    { max: 25000, base: 0, rate: 0.06 },
    { max: 36000, amount: 300 },
    { max: 38500, base: 300, rate: 0.06 },
    { max: 48000, amount: 450 },
    { max: 48600, base: 450, rate: 0.25 },
    { max: 72000, amount: 600 },
    { max: 200000, base: 600, rate: 0.25, cap: 750 },
    { max: Infinity, amount: 900 }
  ] as HealthPremiumBracket[]
};
