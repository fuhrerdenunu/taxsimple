import type { ProvincialConfig } from '../../types';

export const saskatchewan2024: ProvincialConfig = {
  name: 'Saskatchewan',
  brackets: [
    { min: 0, max: 52057, rate: 0.105 },
    { min: 52057, max: 148734, rate: 0.125 },
    { min: 148734, max: Infinity, rate: 0.145 }
  ],
  bpa: 18491
};
