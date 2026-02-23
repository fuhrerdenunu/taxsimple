import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import CryptoJS from 'crypto-js';
import { CURRENT_TAX_YEAR, type ProvinceCode } from '../domain/tax';
import { useAuth } from './AuthContext';

// Types
export interface T4Slip {
  id: string;
  type: 'T4';
  employerName: string;
  boxes: {
    14?: number;
    16?: number;
    18?: number;
    20?: number;
    22?: number;
    24?: number;
    26?: number;
    44?: number;
    46?: number;
    52?: number;
  };
}

export interface T4ASlip {
  id: string;
  type: 'T4A';
  payerName: string;
  boxes: {
    16?: number;
    18?: number;
    20?: number;
    22?: number;
    24?: number;
    28?: number;
    105?: number;
    135?: number;
  };
}

export interface T4ESlip {
  id: string;
  type: 'T4E';
  payerName: string;
  boxes: {
    14?: number;
    15?: number;
    17?: number;
    22?: number;
  };
}

export interface T4FHSASlip {
  id: string;
  type: 'T4FHSA';
  payerName: string;
  boxes: {
    12?: number;
    22?: number;
    24?: number;
    26?: number;
  };
}

export interface T5Slip {
  id: string;
  type: 'T5';
  payerName: string;
  boxes: {
    10?: number;
    11?: number;
    13?: number;
    18?: number;
    24?: number;
    25?: number;
    26?: number;
  };
}

export interface T3Slip {
  id: string;
  type: 'T3';
  payerName: string;
  boxes: {
    21?: number;
    23?: number;
    26?: number;
    32?: number;
    49?: number;
  };
}

export interface T5008Slip {
  id: string;
  type: 'T5008';
  payerName: string;
  boxes: {
    13?: number;
    15?: number;
    20?: number;
    21?: number;
  };
}

export interface RL1Slip {
  id: string;
  type: 'RL1';
  employerName: string;
  boxes: {
    A?: number;
    B?: number;
    C?: number;
    E?: number;
    G?: number;
  };
}

export interface T4RSPSlip {
  id: string;
  type: 'T4RSP';
  payerName: string;
  boxes: {
    16?: number;
    18?: number;
    20?: number;
    22?: number;
    26?: number;
    28?: number;
    30?: number;
    34?: number;
    36?: number;
    40?: number;
  };
}

export interface UnknownSlip {
  id: string;
  type: 'unknown';
  payerName: string;
  boxes: Record<string | number, number>;
}

export interface T2125Data {
  id: string;
  type: 'T2125';
  businessName: string;
  grossRevenue: number;
  expenses: number;
  netIncome: number;
}

export interface CapitalGainsTransaction {
  id: string;
  type: 'CapitalGains';
  description: string;
  dateAcquired: string;
  dateSold: string;
  proceeds: number;
  adjustedCostBase: number;
  outlayAndExpenses: number;
  gain: number;
}

export type IncomeSlip =
  | T4Slip
  | T4ASlip
  | T4ESlip
  | T4FHSASlip
  | T4RSPSlip
  | T5Slip
  | T3Slip
  | T5008Slip
  | RL1Slip
  | UnknownSlip
  | T2125Data
  | CapitalGainsTransaction;

export interface SpouseProfile {
  firstName: string;
  lastName: string;
  sin: string;
  dateOfBirth: string;
  netIncome: number;
  filingTogether: boolean;
}

export interface Dependant {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  relationship: 'child' | 'parent' | 'grandparent' | 'other';
  netIncome: number;
  hasDisability: boolean;
}

export interface Profile {
  firstName: string;
  lastName: string;
  sin: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: ProvinceCode;
  postalCode: string;
  maritalStatus: 'single' | 'married' | 'common-law' | 'separated' | 'divorced' | 'widowed';
  isCanadianCitizen: boolean;
  isFirstTimeFilingInCanada: boolean;
  hasAuthorizedCRAAccess: boolean;
  spouse?: SpouseProfile;
  dependants: Dependant[];
}

export interface TaxReturn {
  id: string;
  year: number;
  status: 'not_started' | 'in_progress' | 'ready_to_review' | 'completed';
  lastModified: string;
  slips: IncomeSlip[];
  otherIncome: {
    selfEmployment: number;
    rental: number;
    interest: number;
    dividends: number;
    capitalGains: number;
    other: number;
  };
  deductions: {
    rrsp: number;
    fhsa: number;
    childcare: number;
    moving: number;
    union: number;
  };
  credits: {
    donations: number;
    donationCarryForward: number;
    medical: number;
    medicalTravel: number;
    medicalAccommodation: number;
    medicalMeals: number;
    tuition: number;
  };
}

export type PersonId = 'primary' | 'partner';

export interface PersonReturn {
  personId: PersonId;
  profile: Profile;
  taxData: Omit<TaxReturn, 'year' | 'status' | 'lastModified'>;
  readiness: {
    completeness: number;
    dataConfidence: number;
    optimizationCoverage: number;
  };
  pinnedForms: string[];
}

export interface FiledDocument {
  id: string;
  year: number;
  personId: PersonId;
  title: string;
  createdAt: string;
  type: 'pdf' | 'json' | 'receipt';
  downloadUrl?: string;
}

export interface FilingUnit {
  year: number;
  status: TaxReturn['status'];
  lastModified: string;
  primary: PersonReturn;
  partner?: PersonReturn;
  jointOptimization: {
    enabled: boolean;
    recommendations: Array<{ id: string; title: string; impact: number; rationale: string; applied: boolean }>;
  };
  documents: FiledDocument[];
}

export interface SaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt?: string;
  error?: string;
}

export interface TaxReturnState {
  returnsByYear: Record<number, FilingUnit>;
  activeYear: number;
  activePerson: PersonId;
  saveState: SaveState;
  hydrated: boolean;
  recoveryMessage?: string;
  // Backward-compatible fields for existing screens.
  profile: Profile;
  currentReturn: TaxReturn;
  savedReturns: TaxReturn[];
}

type Action =
  | { type: 'SET_ACTIVE_YEAR'; payload: number }
  | { type: 'SET_ACTIVE_PERSON'; payload: PersonId }
  | { type: 'UPSERT_YEAR_RETURN'; payload: FilingUnit }
  | { type: 'CREATE_YEAR_RETURN'; payload: number }
  | { type: 'UPDATE_PERSON_PROFILE'; payload: Partial<Profile> }
  | { type: 'ADD_PERSON_SLIP'; payload: IncomeSlip }
  | { type: 'UPDATE_PERSON_SLIP'; payload: { id: string; updates: Partial<IncomeSlip> } }
  | { type: 'DELETE_PERSON_SLIP'; payload: string }
  | { type: 'SET_SAVE_STATE'; payload: SaveState }
  | { type: 'ADD_FILED_DOCUMENT'; payload: FiledDocument }
  | { type: 'SET_PINNED_FORMS'; payload: string[] }
  | { type: 'SET_RECOVERY_MESSAGE'; payload?: string }
  | { type: 'MIGRATE_LEGACY_STATE'; payload: unknown }
  | { type: 'SET_HYDRATED'; payload: boolean }
  // Legacy action aliases kept for compatibility.
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> }
  | { type: 'ADD_SLIP'; payload: IncomeSlip }
  | { type: 'UPDATE_SLIP'; payload: { id: string; updates: Partial<IncomeSlip> } }
  | { type: 'DELETE_SLIP'; payload: string }
  | { type: 'UPDATE_OTHER_INCOME'; payload: Partial<TaxReturn['otherIncome']> }
  | { type: 'UPDATE_DEDUCTIONS'; payload: Partial<TaxReturn['deductions']> }
  | { type: 'UPDATE_CREDITS'; payload: Partial<TaxReturn['credits']> }
  | { type: 'SET_STATUS'; payload: TaxReturn['status'] }
  | { type: 'LOAD_RETURN'; payload: TaxReturn }
  | { type: 'NEW_RETURN'; payload: number }
  | { type: 'LOAD_STATE'; payload: unknown };

const STORAGE_KEY_BASE = 'taxsimple_returns';
const LEGACY_BACKUP_KEY_BASE = 'taxsimple_returns_legacy_backup';
const getEncryptionKey = () => process.env.REACT_APP_ENCRYPTION_KEY || 'dev_only_not_for_production';

const encrypt = (data: string): string => CryptoJS.AES.encrypt(data, getEncryptionKey()).toString();

const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, getEncryptionKey());
  return bytes.toString(CryptoJS.enc.Utf8);
};

const initialProfile: Profile = {
  firstName: '',
  lastName: '',
  sin: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  province: 'ON',
  postalCode: '',
  maritalStatus: 'single',
  isCanadianCitizen: true,
  isFirstTimeFilingInCanada: false,
  hasAuthorizedCRAAccess: false,
  dependants: []
};

const createTaxData = (): Omit<TaxReturn, 'year' | 'status' | 'lastModified'> => ({
  id: crypto.randomUUID(),
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
  }
});

const createPersonReturn = (personId: PersonId, profileOverrides?: Partial<Profile>): PersonReturn => ({
  personId,
  profile: { ...initialProfile, ...profileOverrides },
  taxData: createTaxData(),
  readiness: {
    completeness: 0,
    dataConfidence: 0,
    optimizationCoverage: 0
  },
  pinnedForms: []
});

const createFilingUnit = (year: number): FilingUnit => ({
  year,
  status: 'not_started',
  lastModified: new Date().toISOString(),
  primary: createPersonReturn('primary'),
  jointOptimization: {
    enabled: false,
    recommendations: []
  },
  documents: []
});

const createLegacyReturnFromPerson = (unit: FilingUnit, person: PersonReturn): TaxReturn => ({
  id: person.taxData.id,
  year: unit.year,
  status: unit.status,
  lastModified: unit.lastModified,
  slips: person.taxData.slips,
  otherIncome: person.taxData.otherIncome,
  deductions: person.taxData.deductions,
  credits: person.taxData.credits
});

const withCompatibilityFields = (base: Omit<TaxReturnState, 'profile' | 'currentReturn' | 'savedReturns'>): TaxReturnState => {
  const unit = base.returnsByYear[base.activeYear] ?? createFilingUnit(base.activeYear);
  const person = base.activePerson === 'partner' && unit.partner ? unit.partner : unit.primary;

  const spouseFromPartner =
    unit.partner && (unit.primary.profile.maritalStatus === 'married' || unit.primary.profile.maritalStatus === 'common-law')
      ? {
          firstName: unit.partner.profile.firstName,
          lastName: unit.partner.profile.lastName,
          sin: unit.partner.profile.sin,
          dateOfBirth: unit.partner.profile.dateOfBirth,
          netIncome: unit.partner.taxData.otherIncome.other,
          filingTogether: true
        }
      : undefined;

  const profileCompat =
    person.personId === 'primary'
      ? { ...person.profile, spouse: spouseFromPartner }
      : { ...person.profile };

  const savedReturnsCompat = Object.values(base.returnsByYear).map((f) => createLegacyReturnFromPerson(f, f.primary));

  return {
    ...base,
    profile: profileCompat,
    currentReturn: createLegacyReturnFromPerson(unit, person),
    savedReturns: savedReturnsCompat
  };
};

const parsePersonId = (input: unknown): PersonId => (input === 'partner' ? 'partner' : 'primary');

const safeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  return fallback;
};

const migrateLegacyState = (legacyRaw: unknown): Omit<TaxReturnState, 'profile' | 'currentReturn' | 'savedReturns'> => {
  const defaultCore: Omit<TaxReturnState, 'profile' | 'currentReturn' | 'savedReturns'> = {
    returnsByYear: { [CURRENT_TAX_YEAR]: createFilingUnit(CURRENT_TAX_YEAR) },
    activeYear: CURRENT_TAX_YEAR,
    activePerson: 'primary',
    saveState: { status: 'idle' },
    hydrated: true,
    recoveryMessage: undefined
  };

  if (!legacyRaw || typeof legacyRaw !== 'object') {
    return defaultCore;
  }

  const legacy = legacyRaw as any;

  if (legacy.returnsByYear && typeof legacy.returnsByYear === 'object') {
    const activeYear = safeNumber(legacy.activeYear, CURRENT_TAX_YEAR);
    const activePerson = parsePersonId(legacy.activePerson);
    const returnsByYear: Record<number, FilingUnit> = {};

    Object.entries(legacy.returnsByYear).forEach(([yearKey, value]) => {
      const yearNum = safeNumber(Number(yearKey), CURRENT_TAX_YEAR);
      const fallbackUnit = createFilingUnit(yearNum);
      if (!value || typeof value !== 'object') {
        returnsByYear[yearNum] = fallbackUnit;
        return;
      }
      const unit = value as any;
      returnsByYear[yearNum] = {
        ...fallbackUnit,
        ...unit,
        year: yearNum,
        primary: unit.primary ?? fallbackUnit.primary,
        partner: unit.partner,
        jointOptimization: unit.jointOptimization ?? fallbackUnit.jointOptimization,
        documents: Array.isArray(unit.documents) ? unit.documents : []
      };
    });

    if (!returnsByYear[activeYear]) {
      returnsByYear[activeYear] = createFilingUnit(activeYear);
    }

    return {
      returnsByYear,
      activeYear,
      activePerson,
      saveState: { status: 'idle' },
      hydrated: true,
      recoveryMessage: undefined
    };
  }

  const legacyProfile = (legacy.profile ?? {}) as Partial<Profile>;
  const legacyReturn = (legacy.currentReturn ?? {}) as Partial<TaxReturn>;
  const year = safeNumber(legacyReturn.year, CURRENT_TAX_YEAR);

  const baseUnit = createFilingUnit(year);
  const primaryProfile: Profile = {
    ...initialProfile,
    ...legacyProfile,
    spouse: undefined
  };

  const primaryTaxData = {
    ...baseUnit.primary.taxData,
    id: typeof legacyReturn.id === 'string' ? legacyReturn.id : baseUnit.primary.taxData.id,
    slips: Array.isArray(legacyReturn.slips) ? legacyReturn.slips : baseUnit.primary.taxData.slips,
    otherIncome: { ...baseUnit.primary.taxData.otherIncome, ...(legacyReturn.otherIncome ?? {}) },
    deductions: { ...baseUnit.primary.taxData.deductions, ...(legacyReturn.deductions ?? {}) },
    credits: { ...baseUnit.primary.taxData.credits, ...(legacyReturn.credits ?? {}) }
  };

  const migratedUnit: FilingUnit = {
    ...baseUnit,
    status: legacyReturn.status ?? baseUnit.status,
    lastModified: typeof legacyReturn.lastModified === 'string' ? legacyReturn.lastModified : baseUnit.lastModified,
    primary: {
      ...baseUnit.primary,
      profile: primaryProfile,
      taxData: primaryTaxData
    }
  };

  const spouse = legacyProfile.spouse;
  if (spouse?.filingTogether) {
    migratedUnit.partner = {
      ...createPersonReturn('partner'),
      profile: {
        ...initialProfile,
        firstName: spouse.firstName || '',
        lastName: spouse.lastName || '',
        sin: spouse.sin || '',
        dateOfBirth: spouse.dateOfBirth || '',
        province: primaryProfile.province,
        maritalStatus: primaryProfile.maritalStatus
      },
      taxData: {
        ...createTaxData(),
        otherIncome: {
          ...createTaxData().otherIncome,
          other: safeNumber(spouse.netIncome, 0)
        }
      },
      pinnedForms: []
    };
    migratedUnit.jointOptimization.enabled = true;
  }

  return {
    returnsByYear: { [year]: migratedUnit },
    activeYear: year,
    activePerson: 'primary',
    saveState: { status: 'idle' },
    hydrated: true,
    recoveryMessage: undefined
  };
};

const initialCoreState: Omit<TaxReturnState, 'profile' | 'currentReturn' | 'savedReturns'> = {
  returnsByYear: { [CURRENT_TAX_YEAR]: createFilingUnit(CURRENT_TAX_YEAR) },
  activeYear: CURRENT_TAX_YEAR,
  activePerson: 'primary',
  saveState: { status: 'idle' },
  hydrated: false,
  recoveryMessage: undefined
};

const initialState = withCompatibilityFields(initialCoreState);

const updateActivePerson = (
  state: Omit<TaxReturnState, 'profile' | 'currentReturn' | 'savedReturns'>,
  updater: (person: PersonReturn, unit: FilingUnit) => PersonReturn,
  options?: { forcePrimary?: boolean }
): Omit<TaxReturnState, 'profile' | 'currentReturn' | 'savedReturns'> => {
  const activeYear = state.activeYear;
  const activePerson = options?.forcePrimary ? 'primary' : state.activePerson;
  const existingUnit = state.returnsByYear[activeYear] ?? createFilingUnit(activeYear);
  const unit: FilingUnit = {
    ...existingUnit,
    primary: existingUnit.primary,
    partner: existingUnit.partner,
    documents: existingUnit.documents,
    jointOptimization: existingUnit.jointOptimization
  };

  const target = activePerson === 'partner' ? unit.partner ?? createPersonReturn('partner') : unit.primary;
  const updatedPerson = updater(target, unit);

  if (activePerson === 'partner') {
    unit.partner = updatedPerson;
    unit.jointOptimization.enabled = true;
  } else {
    unit.primary = updatedPerson;
  }

  const status =
    unit.status === 'not_started' &&
    (updatedPerson.taxData.slips.length > 0 ||
      updatedPerson.taxData.deductions.rrsp > 0 ||
      updatedPerson.taxData.credits.donations > 0 ||
      updatedPerson.profile.firstName !== '')
      ? 'in_progress'
      : unit.status;

  unit.status = status;
  unit.lastModified = new Date().toISOString();

  return {
    ...state,
    activePerson,
    returnsByYear: {
      ...state.returnsByYear,
      [activeYear]: unit
    }
  };
};

function reducer(state: TaxReturnState, action: Action): TaxReturnState {
  const coreState: Omit<TaxReturnState, 'profile' | 'currentReturn' | 'savedReturns'> = {
    returnsByYear: state.returnsByYear,
    activeYear: state.activeYear,
    activePerson: state.activePerson,
    saveState: state.saveState,
    hydrated: state.hydrated,
    recoveryMessage: state.recoveryMessage
  };

  let next = coreState;

  switch (action.type) {
    case 'SET_ACTIVE_YEAR': {
      const year = action.payload;
      next = {
        ...coreState,
        activeYear: year,
        returnsByYear: {
          ...coreState.returnsByYear,
          [year]: coreState.returnsByYear[year] ?? createFilingUnit(year)
        }
      };
      break;
    }

    case 'SET_ACTIVE_PERSON':
      next = { ...coreState, activePerson: action.payload };
      break;

    case 'UPSERT_YEAR_RETURN':
      next = {
        ...coreState,
        returnsByYear: {
          ...coreState.returnsByYear,
          [action.payload.year]: action.payload
        }
      };
      break;

    case 'CREATE_YEAR_RETURN':
    case 'NEW_RETURN': {
      const year = action.payload;
      next = {
        ...coreState,
        activeYear: year,
        activePerson: 'primary',
        returnsByYear: {
          ...coreState.returnsByYear,
          [year]: coreState.returnsByYear[year] ?? createFilingUnit(year)
        }
      };
      break;
    }

    case 'UPDATE_PERSON_PROFILE':
    case 'UPDATE_PROFILE':
      next = updateActivePerson(coreState, (person) => {
        const mergedProfile = { ...person.profile, ...action.payload } as Profile;

        if (person.personId === 'primary' && action.payload.spouse && action.payload.spouse.filingTogether) {
          const spouse = action.payload.spouse;
          const existingUnit = coreState.returnsByYear[coreState.activeYear] ?? createFilingUnit(coreState.activeYear);
          const existingPartner = existingUnit.partner ?? createPersonReturn('partner');
          existingUnit.partner = {
            ...existingPartner,
            profile: {
              ...existingPartner.profile,
              firstName: spouse.firstName || existingPartner.profile.firstName,
              lastName: spouse.lastName || existingPartner.profile.lastName,
              sin: spouse.sin || existingPartner.profile.sin,
              dateOfBirth: spouse.dateOfBirth || existingPartner.profile.dateOfBirth,
              province: mergedProfile.province,
              maritalStatus: mergedProfile.maritalStatus
            },
            taxData: {
              ...existingPartner.taxData,
              otherIncome: {
                ...existingPartner.taxData.otherIncome,
                other: safeNumber(spouse.netIncome, existingPartner.taxData.otherIncome.other)
              }
            }
          };
          existingUnit.jointOptimization.enabled = true;
          next = {
            ...coreState,
            returnsByYear: {
              ...coreState.returnsByYear,
              [coreState.activeYear]: existingUnit
            }
          };
        }

        return {
          ...person,
          profile: {
            ...mergedProfile,
            spouse: undefined
          }
        };
      });
      break;

    case 'ADD_PERSON_SLIP':
    case 'ADD_SLIP':
      next = updateActivePerson(coreState, (person) => ({
        ...person,
        taxData: {
          ...person.taxData,
          slips: [...person.taxData.slips, action.payload]
        }
      }));
      break;

    case 'UPDATE_PERSON_SLIP':
    case 'UPDATE_SLIP':
      next = updateActivePerson(coreState, (person) => ({
        ...person,
        taxData: {
          ...person.taxData,
          slips: person.taxData.slips.map((slip) =>
            slip.id === action.payload.id ? ({ ...slip, ...action.payload.updates } as IncomeSlip) : slip
          )
        }
      }));
      break;

    case 'DELETE_PERSON_SLIP':
    case 'DELETE_SLIP':
      next = updateActivePerson(coreState, (person) => ({
        ...person,
        taxData: {
          ...person.taxData,
          slips: person.taxData.slips.filter((slip) => slip.id !== action.payload)
        }
      }));
      break;

    case 'UPDATE_OTHER_INCOME':
      next = updateActivePerson(coreState, (person) => ({
        ...person,
        taxData: {
          ...person.taxData,
          otherIncome: { ...person.taxData.otherIncome, ...action.payload }
        }
      }));
      break;

    case 'UPDATE_DEDUCTIONS':
      next = updateActivePerson(coreState, (person) => ({
        ...person,
        taxData: {
          ...person.taxData,
          deductions: { ...person.taxData.deductions, ...action.payload }
        }
      }));
      break;

    case 'UPDATE_CREDITS':
      next = updateActivePerson(coreState, (person) => ({
        ...person,
        taxData: {
          ...person.taxData,
          credits: { ...person.taxData.credits, ...action.payload }
        }
      }));
      break;

    case 'SET_STATUS': {
      const unit = coreState.returnsByYear[coreState.activeYear] ?? createFilingUnit(coreState.activeYear);
      next = {
        ...coreState,
        returnsByYear: {
          ...coreState.returnsByYear,
          [coreState.activeYear]: {
            ...unit,
            status: action.payload,
            lastModified: new Date().toISOString()
          }
        }
      };
      break;
    }

    case 'LOAD_RETURN':
      next = {
        ...coreState,
        returnsByYear: {
          ...coreState.returnsByYear,
          [action.payload.year]: {
            ...(coreState.returnsByYear[action.payload.year] ?? createFilingUnit(action.payload.year)),
            year: action.payload.year,
            status: action.payload.status,
            lastModified: action.payload.lastModified,
            primary: {
              ...(coreState.returnsByYear[action.payload.year]?.primary ?? createPersonReturn('primary')),
              taxData: {
                id: action.payload.id,
                slips: action.payload.slips,
                otherIncome: action.payload.otherIncome,
                deductions: action.payload.deductions,
                credits: action.payload.credits
              }
            }
          }
        },
        activeYear: action.payload.year,
        activePerson: 'primary'
      };
      break;

    case 'MIGRATE_LEGACY_STATE':
    case 'LOAD_STATE':
      next = migrateLegacyState(action.payload);
      break;

    case 'SET_SAVE_STATE':
      next = { ...coreState, saveState: action.payload };
      break;

    case 'ADD_FILED_DOCUMENT': {
      const unit = coreState.returnsByYear[action.payload.year] ?? createFilingUnit(action.payload.year);
      next = {
        ...coreState,
        returnsByYear: {
          ...coreState.returnsByYear,
          [action.payload.year]: {
            ...unit,
            documents: [...unit.documents, action.payload],
            lastModified: new Date().toISOString()
          }
        }
      };
      break;
    }

    case 'SET_PINNED_FORMS':
      next = updateActivePerson(coreState, (person) => ({
        ...person,
        pinnedForms: action.payload
      }));
      break;

    case 'SET_HYDRATED':
      next = { ...coreState, hydrated: action.payload };
      break;

    case 'SET_RECOVERY_MESSAGE':
      next = { ...coreState, recoveryMessage: action.payload };
      break;

    default:
      next = coreState;
      break;
  }

  return withCompatibilityFields(next);
}

const stripRuntimeState = (state: TaxReturnState) => ({
  returnsByYear: state.returnsByYear,
  activeYear: state.activeYear,
  activePerson: state.activePerson
});

interface TaxReturnContextType {
  state: TaxReturnState;
  dispatch: React.Dispatch<Action>;
  getTaxInput: (year?: number, personId?: PersonId) => {
    province: ProvinceCode;
    employmentIncome: number;
    selfEmploymentIncome: number;
    rentalIncome: number;
    interestIncome: number;
    dividendIncome: number;
    capitalGains: number;
    otherIncome: number;
    taxWithheld: number;
    cppContributions: number;
    eiPremiums: number;
    rrspDeduction: number;
    fhsaDeduction: number;
    childcareExpenses: number;
    movingExpenses: number;
    unionDues: number;
    donations: number;
    medicalExpenses: number;
    tuitionAmount: number;
  };
}

const TaxReturnContext = createContext<TaxReturnContextType | undefined>(undefined);

export function TaxReturnProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const lastPersistedPayloadRef = useRef<string>('');
  const userStorageSuffix = (user?.email || 'anonymous').toLowerCase();
  const storageKey = `${STORAGE_KEY_BASE}_${userStorageSuffix}`;
  const legacyBackupKey = `${LEGACY_BACKUP_KEY_BASE}_${userStorageSuffix}`;

  useEffect(() => {
    lastPersistedPayloadRef.current = '';
    dispatch({ type: 'SET_HYDRATED', payload: false });
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        dispatch({ type: 'MIGRATE_LEGACY_STATE', payload: null });
        return;
      }

      try {
        const decrypted = decrypt(stored);
        const loadedState = JSON.parse(decrypted);
        dispatch({ type: 'LOAD_STATE', payload: loadedState });
      } catch {
        const backup = localStorage.getItem(legacyBackupKey);
        if (backup) {
          try {
            const recovered = JSON.parse(decrypt(backup));
            dispatch({ type: 'LOAD_STATE', payload: recovered });
            dispatch({
              type: 'SET_RECOVERY_MESSAGE',
              payload: 'We restored your draft from a recovery backup after a storage issue.'
            });
          } catch {
            dispatch({ type: 'MIGRATE_LEGACY_STATE', payload: null });
            dispatch({
              type: 'SET_RECOVERY_MESSAGE',
              payload: 'Draft data was corrupted. A partial safe restore was applied.'
            });
          }
        } else {
          dispatch({ type: 'MIGRATE_LEGACY_STATE', payload: null });
          dispatch({
            type: 'SET_RECOVERY_MESSAGE',
            payload: 'Draft data was corrupted. A partial safe restore was applied.'
          });
        }
      }
    } catch {
      dispatch({ type: 'SET_HYDRATED', payload: true });
    }
  }, [legacyBackupKey, storageKey]);

  const persistPayload = useMemo(() => JSON.stringify(stripRuntimeState(state)), [state]);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }

    if (persistPayload === lastPersistedPayloadRef.current) {
      return;
    }

    if (state.saveState.status !== 'saving') {
      dispatch({ type: 'SET_SAVE_STATE', payload: { status: 'saving', lastSavedAt: state.saveState.lastSavedAt } });
    }

    const timeoutId = setTimeout(() => {
      try {
        const encrypted = encrypt(persistPayload);
        localStorage.setItem(storageKey, encrypted);
        lastPersistedPayloadRef.current = persistPayload;
        dispatch({ type: 'SET_SAVE_STATE', payload: { status: 'saved', lastSavedAt: new Date().toISOString() } });
      } catch {
        dispatch({ type: 'SET_SAVE_STATE', payload: { status: 'error', error: 'Unable to save changes locally.' } });
      }
    }, 450);

    return () => clearTimeout(timeoutId);
  }, [persistPayload, state.hydrated, state.saveState.lastSavedAt, state.saveState.status, storageKey]);

  useEffect(() => {
    if (!state.profile.spouse?.filingTogether) {
      return;
    }
    try {
      const encrypted = encrypt(JSON.stringify({ profile: state.profile, currentReturn: state.currentReturn }));
      localStorage.setItem(legacyBackupKey, encrypted);
    } catch {
      // Best effort.
    }
  }, [legacyBackupKey, state.profile, state.currentReturn]);

  const getTaxInput = (year?: number, personId?: PersonId) => {
    const targetYear = year ?? state.activeYear;
    const unit = state.returnsByYear[targetYear] ?? createFilingUnit(targetYear);
    const requestedPerson = personId ?? state.activePerson;
    const person = requestedPerson === 'partner' && unit.partner ? unit.partner : unit.primary;

    let employmentIncome = 0;
    let taxWithheld = 0;
    let cppContributions = 0;
    let eiPremiums = 0;
    let unionDues = 0;
    let interestFromSlips = 0;
    let dividendFromSlips = 0;
    let otherSlipIncome = 0;

    person.taxData.slips.forEach((slip) => {
      if (slip.type === 'T4') {
        employmentIncome += slip.boxes[14] || 0;
        taxWithheld += slip.boxes[22] || 0;
        cppContributions += slip.boxes[16] || 0;
        eiPremiums += slip.boxes[18] || 0;
        unionDues += slip.boxes[44] || 0;
      } else if (slip.type === 'T4A') {
        otherSlipIncome += (slip.boxes[16] || 0) + (slip.boxes[18] || 0) + (slip.boxes[20] || 0) + (slip.boxes[28] || 0);
        taxWithheld += slip.boxes[22] || 0;
      } else if (slip.type === 'T4RSP') {
        otherSlipIncome += (slip.boxes[16] || 0) + (slip.boxes[18] || 0) + (slip.boxes[34] || 0);
        taxWithheld += slip.boxes[22] || 0;
      } else if (slip.type === 'T4E') {
        otherSlipIncome += slip.boxes[14] || 0;
        taxWithheld += slip.boxes[22] || 0;
      } else if (slip.type === 'T5') {
        interestFromSlips += slip.boxes[13] || 0;
        dividendFromSlips += slip.boxes[24] || 0;
      } else if (slip.type === 'T3') {
        interestFromSlips += slip.boxes[49] || 0;
        dividendFromSlips += slip.boxes[23] || 0;
        taxWithheld += slip.boxes[32] || 0;
      } else if (slip.type === 'RL1') {
        employmentIncome += slip.boxes.A || 0;
        taxWithheld += slip.boxes.E || 0;
      }
    });

    return {
      province: person.profile.province,
      employmentIncome,
      selfEmploymentIncome: person.taxData.otherIncome.selfEmployment,
      rentalIncome: person.taxData.otherIncome.rental,
      interestIncome: person.taxData.otherIncome.interest + interestFromSlips,
      dividendIncome: person.taxData.otherIncome.dividends + dividendFromSlips,
      capitalGains: person.taxData.otherIncome.capitalGains,
      otherIncome: person.taxData.otherIncome.other + otherSlipIncome,
      taxWithheld,
      cppContributions,
      eiPremiums,
      rrspDeduction: person.taxData.deductions.rrsp,
      fhsaDeduction: person.taxData.deductions.fhsa,
      childcareExpenses: person.taxData.deductions.childcare,
      movingExpenses: person.taxData.deductions.moving,
      unionDues: unionDues + person.taxData.deductions.union,
      donations: person.taxData.credits.donations,
      medicalExpenses: person.taxData.credits.medical,
      tuitionAmount: person.taxData.credits.tuition
    };
  };

  return <TaxReturnContext.Provider value={{ state, dispatch, getTaxInput }}>{state.hydrated ? children : null}</TaxReturnContext.Provider>;
}

export function useTaxReturn() {
  const context = useContext(TaxReturnContext);
  if (context === undefined) {
    throw new Error('useTaxReturn must be used within a TaxReturnProvider');
  }
  return context;
}
