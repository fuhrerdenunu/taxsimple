import type { ProvincialConfig, PEISurtax } from '../../types';

export const pei2024: ProvincialConfig = {
  name: 'Prince Edward Island',
  brackets: [
    { min: 0, max: 32656, rate: 0.098 },
    { min: 32656, max: 64313, rate: 0.138 },
    { min: 64313, max: Infinity, rate: 0.167 }
  ],
  bpa: 13500,
  surtax: {
    threshold: 12500,
    rate: 0.10
  } as PEISurtax
};
