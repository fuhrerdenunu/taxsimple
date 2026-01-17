import type { ProvincialConfig } from '../../types';

export const quebec2024: ProvincialConfig = {
  name: 'Quebec',
  brackets: [
    { min: 0, max: 51780, rate: 0.14 },
    { min: 51780, max: 103545, rate: 0.19 },
    { min: 103545, max: 126000, rate: 0.24 },
    { min: 126000, max: Infinity, rate: 0.2575 }
  ],
  bpa: 18056,
  abatement: 0.165
};

// Quebec has a separate provincial return (TP-1)
// This config is used for estimating combined tax burden
// Users must file TP-1 separately with Revenu Quebec
