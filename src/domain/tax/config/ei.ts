import type { EIConfig } from '../types';

export const ei2024: EIConfig = {
  max: 1049.12,
  rate: 0.0166,
  maxInsurable: 63200
};

// Quebec has reduced EI rate due to QPIP
export const eiQuebec2024: EIConfig = {
  max: 834.24,
  rate: 0.0132,
  maxInsurable: 63200
};
