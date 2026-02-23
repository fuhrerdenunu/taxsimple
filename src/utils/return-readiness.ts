import type { Profile, TaxReturn } from '../context/TaxReturnContext';

export interface ReadinessScores {
  completeness: number;
  dataConfidence: number;
  optimizationCoverage: number;
}

const REQUIRED_PROFILE_FIELDS: (keyof Profile)[] = [
  'firstName',
  'lastName',
  'sin',
  'dateOfBirth',
  'address',
  'city',
  'province',
  'postalCode'
];

export function calculateReadinessScores(profile: Profile, taxReturn: TaxReturn): ReadinessScores {
  const filledRequired = REQUIRED_PROFILE_FIELDS.filter((key) => {
    const value = profile[key];
    return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
  }).length;

  const hasIncomeData =
    taxReturn.slips.length > 0 ||
    taxReturn.otherIncome.selfEmployment > 0 ||
    taxReturn.otherIncome.rental > 0 ||
    taxReturn.otherIncome.interest > 0 ||
    taxReturn.otherIncome.dividends > 0 ||
    taxReturn.otherIncome.capitalGains > 0 ||
    taxReturn.otherIncome.other > 0;

  const profileCompleteness = filledRequired / REQUIRED_PROFILE_FIELDS.length;
  const completeness = Math.round(((profileCompleteness * 0.8) + (hasIncomeData ? 0.2 : 0)) * 100);

  const unknownSlips = taxReturn.slips.filter((slip) => slip.type === 'unknown').length;
  const structuredSlipRatio = taxReturn.slips.length === 0
    ? 0
    : (taxReturn.slips.length - unknownSlips) / taxReturn.slips.length;

  const manualIncomeFields = [
    taxReturn.otherIncome.selfEmployment,
    taxReturn.otherIncome.rental,
    taxReturn.otherIncome.interest,
    taxReturn.otherIncome.dividends,
    taxReturn.otherIncome.capitalGains,
    taxReturn.otherIncome.other
  ];

  const manualIncomeUsed = manualIncomeFields.filter((n) => n > 0).length;
  const manualComplexityPenalty = Math.min(0.35, manualIncomeUsed * 0.06);

  const baseConfidence = taxReturn.slips.length > 0 ? 0.65 : 0.45;
  const dataConfidence = Math.max(0, Math.min(100, Math.round((baseConfidence + (structuredSlipRatio * 0.35) - manualComplexityPenalty) * 100)));

  const optimizationSignals = [
    taxReturn.deductions.rrsp > 0 || taxReturn.deductions.fhsa > 0,
    taxReturn.credits.donations > 0,
    taxReturn.credits.medical > 0,
    taxReturn.credits.tuition > 0
  ];
  const optimizationCoverage = Math.round((optimizationSignals.filter(Boolean).length / optimizationSignals.length) * 100);

  return {
    completeness,
    dataConfidence,
    optimizationCoverage
  };
}
