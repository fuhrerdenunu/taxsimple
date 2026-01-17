import type { ProvincialConfig } from '../../types';

export const newfoundland2024: ProvincialConfig = {
  name: 'Newfoundland and Labrador',
  brackets: [
    { min: 0, max: 43198, rate: 0.087 },
    { min: 43198, max: 86395, rate: 0.145 },
    { min: 86395, max: 154244, rate: 0.158 },
    { min: 154244, max: 215943, rate: 0.178 },
    { min: 215943, max: 275870, rate: 0.198 },
    { min: 275870, max: 551739, rate: 0.208 },
    { min: 551739, max: 1103478, rate: 0.213 },
    { min: 1103478, max: Infinity, rate: 0.218 }
  ],
  bpa: 10818
};
