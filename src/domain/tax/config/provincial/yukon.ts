import type { ProvincialConfig } from '../../types';

export const yukon2024: ProvincialConfig = {
  name: 'Yukon',
  brackets: [
    { min: 0, max: 55867, rate: 0.064 },
    { min: 55867, max: 111733, rate: 0.09 },
    { min: 111733, max: 173205, rate: 0.109 },
    { min: 173205, max: 500000, rate: 0.128 },
    { min: 500000, max: Infinity, rate: 0.15 }
  ],
  bpa: 15705
};
