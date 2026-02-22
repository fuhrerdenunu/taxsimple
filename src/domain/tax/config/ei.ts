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

// 2025 EI Configuration
export const ei2025: EIConfig = {
  max: 1077.48,
  rate: 0.0164,
  maxInsurable: 65700
};

// Quebec 2025 - reduced EI rate due to QPIP
export const eiQuebec2025: EIConfig = {
  max: 856.58,
  rate: 0.01303,
  maxInsurable: 65700
};
