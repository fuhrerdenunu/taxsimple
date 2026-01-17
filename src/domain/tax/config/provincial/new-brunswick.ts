import type { ProvincialConfig } from '../../types';

export const newBrunswick2024: ProvincialConfig = {
  name: 'New Brunswick',
  brackets: [
    { min: 0, max: 49958, rate: 0.094 },
    { min: 49958, max: 99916, rate: 0.14 },
    { min: 99916, max: 185064, rate: 0.16 },
    { min: 185064, max: Infinity, rate: 0.195 }
  ],
  bpa: 13044
};
