import type { ProvincialConfig } from '../../types';

export const nunavut2024: ProvincialConfig = {
  name: 'Nunavut',
  brackets: [
    { min: 0, max: 53268, rate: 0.04 },
    { min: 53268, max: 106537, rate: 0.07 },
    { min: 106537, max: 173205, rate: 0.09 },
    { min: 173205, max: Infinity, rate: 0.115 }
  ],
  bpa: 18767
};
