import { calculateReadinessScores } from '../return-readiness';
import type { Profile, TaxReturn } from '../../context/TaxReturnContext';

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    firstName: 'Jane',
    lastName: 'Doe',
    sin: '046454286',
    dateOfBirth: '1990-01-01',
    email: 'jane@example.com',
    phone: '555-123-1234',
    address: '1 Main St',
    city: 'Toronto',
    province: 'ON',
    postalCode: 'M5V1A1',
    maritalStatus: 'single',
    isCanadianCitizen: true,
    isFirstTimeFilingInCanada: false,
    hasAuthorizedCRAAccess: false,
    dependants: [],
    ...overrides
  };
}

function makeReturn(overrides: Partial<TaxReturn> = {}): TaxReturn {
  return {
    id: '1',
    year: 2025,
    status: 'in_progress',
    lastModified: new Date().toISOString(),
    slips: [],
    otherIncome: {
      selfEmployment: 0,
      rental: 0,
      interest: 0,
      dividends: 0,
      capitalGains: 0,
      other: 0
    },
    deductions: {
      rrsp: 0,
      fhsa: 0,
      childcare: 0,
      moving: 0,
      union: 0
    },
    credits: {
      donations: 0,
      donationCarryForward: 0,
      medical: 0,
      medicalTravel: 0,
      medicalAccommodation: 0,
      medicalMeals: 0,
      tuition: 0
    },
    ...overrides
  };
}

describe('calculateReadinessScores', () => {
  it('returns high completeness for well-filled return with income', () => {
    const result = calculateReadinessScores(
      makeProfile(),
      makeReturn({
        slips: [{ id: 't4-1', type: 'T4', employerName: 'Employer', boxes: { 14: 80000 } }]
      })
    );

    expect(result.completeness).toBeGreaterThanOrEqual(95);
    expect(result.dataConfidence).toBeGreaterThan(80);
  });

  it('reduces confidence when only unknown slips and many manual fields are used', () => {
    const result = calculateReadinessScores(
      makeProfile(),
      makeReturn({
        slips: [{ id: 'x', type: 'unknown', payerName: 'Unknown', boxes: {} }],
        otherIncome: {
          selfEmployment: 100,
          rental: 100,
          interest: 100,
          dividends: 100,
          capitalGains: 100,
          other: 100
        }
      })
    );

    expect(result.dataConfidence).toBeLessThan(60);
  });
});
