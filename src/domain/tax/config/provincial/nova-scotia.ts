import type { ProvincialConfig } from '../../types';

export const novaScotia2024: ProvincialConfig = {
  name: 'Nova Scotia',
  brackets: [
    { min: 0, max: 29590, rate: 0.0879 },
    { min: 29590, max: 59180, rate: 0.1495 },
    { min: 59180, max: 93000, rate: 0.1667 },
    { min: 93000, max: 150000, rate: 0.175 },
    { min: 150000, max: Infinity, rate: 0.21 }
  ],
  bpa: 8481
};
