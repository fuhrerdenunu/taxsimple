import type { ProvincialConfig } from '../../types';

export const manitoba2024: ProvincialConfig = {
  name: 'Manitoba',
  brackets: [
    { min: 0, max: 47000, rate: 0.108 },
    { min: 47000, max: 100000, rate: 0.1275 },
    { min: 100000, max: Infinity, rate: 0.174 }
  ],
  bpa: 15780
};
