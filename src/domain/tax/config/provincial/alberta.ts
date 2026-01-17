import type { ProvincialConfig } from '../../types';

export const alberta2024: ProvincialConfig = {
  name: 'Alberta',
  brackets: [
    { min: 0, max: 148269, rate: 0.10 },
    { min: 148269, max: 177922, rate: 0.12 },
    { min: 177922, max: 237230, rate: 0.13 },
    { min: 237230, max: 355845, rate: 0.14 },
    { min: 355845, max: Infinity, rate: 0.15 }
  ],
  bpa: 21003
};
