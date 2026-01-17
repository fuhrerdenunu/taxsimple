import type { ProvinceCode, ProvincialConfig, ProvinceInfo } from '../../types';
import { ontario2024 } from './ontario';
import { bc2024 } from './bc';
import { alberta2024 } from './alberta';
import { quebec2024 } from './quebec';
import { manitoba2024 } from './manitoba';
import { saskatchewan2024 } from './saskatchewan';
import { newBrunswick2024 } from './new-brunswick';
import { novaScotia2024 } from './nova-scotia';
import { pei2024 } from './pei';
import { newfoundland2024 } from './newfoundland';
import { yukon2024 } from './yukon';
import { nwt2024 } from './nwt';
import { nunavut2024 } from './nunavut';

export const provincial2024: Record<ProvinceCode, ProvincialConfig> = {
  ON: ontario2024,
  BC: bc2024,
  AB: alberta2024,
  QC: quebec2024,
  MB: manitoba2024,
  SK: saskatchewan2024,
  NB: newBrunswick2024,
  NS: novaScotia2024,
  PE: pei2024,
  NL: newfoundland2024,
  YT: yukon2024,
  NT: nwt2024,
  NU: nunavut2024
};

export const PROVINCES: ProvinceInfo[] = Object.entries(provincial2024).map(
  ([code, config]) => ({
    code: code as ProvinceCode,
    name: config.name
  })
);

export function getProvincialConfig(province: ProvinceCode): ProvincialConfig {
  return provincial2024[province] || provincial2024.ON;
}

export {
  ontario2024,
  bc2024,
  alberta2024,
  quebec2024,
  manitoba2024,
  saskatchewan2024,
  newBrunswick2024,
  novaScotia2024,
  pei2024,
  newfoundland2024,
  yukon2024,
  nwt2024,
  nunavut2024
};
