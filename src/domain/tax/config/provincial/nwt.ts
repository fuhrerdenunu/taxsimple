import type { ProvincialConfig } from '../../types';

export const nwt2024: ProvincialConfig = {
  name: 'Northwest Territories',
  brackets: [
    { min: 0, max: 50597, rate: 0.059 },
    { min: 50597, max: 101198, rate: 0.086 },
    { min: 101198, max: 164525, rate: 0.122 },
    { min: 164525, max: Infinity, rate: 0.1405 }
  ],
  bpa: 17373
};
