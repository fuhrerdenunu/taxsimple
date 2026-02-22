import React, { createContext, useContext, useReducer, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { CURRENT_TAX_YEAR, type ProvinceCode } from '../domain/tax';

// Types
export interface T4Slip {
  id: string;
  type: 'T4';
  employerName: string;
  boxes: {
    14?: number; // Employment income
    16?: number; // CPP contributions
    18?: number; // EI premiums
    20?: number; // RPP contributions
    22?: number; // Tax deducted
    24?: number; // EI insurable earnings
    26?: number; // CPP pensionable earnings
    44?: number; // Union dues
    46?: number; // Charitable donations
    52?: number; // Pension adjustment
  };
}

export interface T4ASlip {
  id: string;
  type: 'T4A';
  payerName: string;
  boxes: {
    16?: number; // Pension
    18?: number; // Lump-sum payments
    20?: number; // Self-employed commissions
    22?: number; // Tax deducted
    24?: number; // Annuities
    28?: number; // Other income
    105?: number; // Scholarships/bursaries
    135?: number; // Recipient-paid premiums
  };
}

export interface T4ESlip {
  id: string;
  type: 'T4E';
  payerName: string;
  boxes: {
    14?: number; // Total EI benefits
    15?: number; // Regular benefits
    17?: number; // Fishing benefits
    22?: number; // Income tax deducted
  };
}

export interface T4FHSASlip {
  id: string;
  type: 'T4FHSA';
  payerName: string;
  boxes: {
    12?: number; // Contributions
    22?: number; // Income tax deducted
    24?: number; // Transfers in
    26?: number; // Withdrawals
  };
}

export interface T5Slip {
  id: string;
  type: 'T5';
  payerName: string;
  boxes: {
    10?: number; // Actual amount of eligible dividends
    11?: number; // Taxable amount of eligible dividends
    13?: number; // Interest from Canadian sources
    18?: number; // Capital gains dividends
    24?: number; // Actual amount of dividends other than eligible
    25?: number; // Taxable amount of dividends other than eligible
    26?: number; // Dividend tax credit for other than eligible
  };
}

export interface T3Slip {
  id: string;
  type: 'T3';
  payerName: string;
  boxes: {
    21?: number; // Capital gains
    23?: number; // Eligible dividends
    26?: number; // Other income
    32?: number; // Income tax deducted
    49?: number; // Interest from Canadian sources
  };
}

export interface T5008Slip {
  id: string;
  type: 'T5008';
  payerName: string;
  boxes: {
    13?: number; // Type of security
    15?: number; // Number of shares
    20?: number; // Proceeds
    21?: number; // Book value/ACB
  };
}

export interface RL1Slip {
  id: string;
  type: 'RL1';
  employerName: string;
  boxes: {
    A?: number; // Employment income
    B?: number; // QPP contributions
    C?: number; // EI premiums
    E?: number; // Quebec income tax
    G?: number; // Pensionable salary
  };
}

export interface T4RSPSlip {
  id: string;
  type: 'T4RSP';
  payerName: string;
  boxes: {
    16?: number; // Annuity payments
    18?: number; // Refund of premiums
    20?: number; // HBP withdrawal
    22?: number; // Income tax deducted
    26?: number; // LLP withdrawal
    28?: number; // Other income or deductions
    30?: number; // Deemed receipt
    34?: number; // Excess amount
    36?: number; // Number of months
    40?: number; // Amount taxable
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
  gain: number; // Calculated: proceeds - ACB - expenses
}

export type IncomeSlip = T4Slip | T4ASlip | T4ESlip | T4FHSASlip | T4RSPSlip | T5Slip | T3Slip | T5008Slip | RL1Slip | UnknownSlip | T2125Data | CapitalGainsTransaction;

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

export interface TaxReturnState {
  profile: Profile;
  currentReturn: TaxReturn;
  savedReturns: TaxReturn[];
}

type Action =
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
  | { type: 'LOAD_STATE'; payload: TaxReturnState };

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

const createNewReturn = (year: number): TaxReturn => ({
  id: crypto.randomUUID(),
  year,
  status: 'not_started',
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
  }
});

const initialState: TaxReturnState = {
  profile: initialProfile,
  currentReturn: createNewReturn(CURRENT_TAX_YEAR),
  savedReturns: []
};

function reducer(state: TaxReturnState, action: Action): TaxReturnState {
  const updateReturn = (updates: Partial<TaxReturn>): TaxReturnState => ({
    ...state,
    currentReturn: {
      ...state.currentReturn,
      ...updates,
      status: state.currentReturn.status === 'not_started' ? 'in_progress' : state.currentReturn.status,
      lastModified: new Date().toISOString()
    }
  });

  switch (action.type) {
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: { ...state.profile, ...action.payload }
      };

    case 'ADD_SLIP':
      return updateReturn({
        slips: [...state.currentReturn.slips, action.payload]
      });

    case 'UPDATE_SLIP':
      return updateReturn({
        slips: state.currentReturn.slips.map(slip =>
          slip.id === action.payload.id
            ? { ...slip, ...action.payload.updates } as IncomeSlip
            : slip
        )
      });

    case 'DELETE_SLIP':
      return updateReturn({
        slips: state.currentReturn.slips.filter(slip => slip.id !== action.payload)
      });

    case 'UPDATE_OTHER_INCOME':
      return updateReturn({
        otherIncome: { ...state.currentReturn.otherIncome, ...action.payload }
      });

    case 'UPDATE_DEDUCTIONS':
      return updateReturn({
        deductions: { ...state.currentReturn.deductions, ...action.payload }
      });

    case 'UPDATE_CREDITS':
      return updateReturn({
        credits: { ...state.currentReturn.credits, ...action.payload }
      });

    case 'SET_STATUS':
      return updateReturn({ status: action.payload });

    case 'LOAD_RETURN':
      return {
        ...state,
        currentReturn: action.payload
      };

    case 'NEW_RETURN':
      return {
        ...state,
        currentReturn: createNewReturn(action.payload)
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

// Storage helpers
const STORAGE_KEY = 'taxsimple_returns';
const getEncryptionKey = () => process.env.REACT_APP_ENCRYPTION_KEY || 'dev_only_not_for_production';

const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, getEncryptionKey()).toString();
};

const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, getEncryptionKey());
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Context
interface TaxReturnContextType {
  state: TaxReturnState;
  dispatch: React.Dispatch<Action>;
  getTaxInput: () => {
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
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const decrypted = decrypt(stored);
        const loadedState = JSON.parse(decrypted);
        dispatch({ type: 'LOAD_STATE', payload: loadedState });
      }
    } catch {
      // State corrupted or key changed - start fresh
    }
  }, []);

  // Save to localStorage on change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const encrypted = encrypt(JSON.stringify(state));
        localStorage.setItem(STORAGE_KEY, encrypted);
      } catch {
        // Silently fail - data will be re-entered
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state]);

  // Calculate tax input from current state
  const getTaxInput = () => {
    const { profile, currentReturn } = state;

    // Sum up income from T4 slips
    let employmentIncome = 0;
    let taxWithheld = 0;
    let cppContributions = 0;
    let eiPremiums = 0;
    let unionDues = 0;

    let interestFromSlips = 0;
    let dividendFromSlips = 0;
    let otherSlipIncome = 0;

    currentReturn.slips.forEach(slip => {
      if (slip.type === 'T4') {
        employmentIncome += slip.boxes[14] || 0;
        taxWithheld += slip.boxes[22] || 0;
        cppContributions += slip.boxes[16] || 0;
        eiPremiums += slip.boxes[18] || 0;
        unionDues += slip.boxes[44] || 0;
      } else if (slip.type === 'T4A') {
        otherSlipIncome += (slip.boxes[16] || 0) + (slip.boxes[18] || 0) +
                           (slip.boxes[20] || 0) + (slip.boxes[28] || 0);
        taxWithheld += slip.boxes[22] || 0;
      } else if (slip.type === 'T4RSP') {
        otherSlipIncome += (slip.boxes[16] || 0) + (slip.boxes[18] || 0) +
                           (slip.boxes[34] || 0);
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
        employmentIncome += slip.boxes['A'] || 0;
        taxWithheld += slip.boxes['E'] || 0;
      }
    });

    return {
      province: profile.province,
      employmentIncome,
      selfEmploymentIncome: currentReturn.otherIncome.selfEmployment,
      rentalIncome: currentReturn.otherIncome.rental,
      interestIncome: currentReturn.otherIncome.interest + interestFromSlips,
      dividendIncome: currentReturn.otherIncome.dividends + dividendFromSlips,
      capitalGains: currentReturn.otherIncome.capitalGains,
      otherIncome: currentReturn.otherIncome.other + otherSlipIncome,
      taxWithheld,
      cppContributions,
      eiPremiums,
      rrspDeduction: currentReturn.deductions.rrsp,
      fhsaDeduction: currentReturn.deductions.fhsa,
      childcareExpenses: currentReturn.deductions.childcare,
      movingExpenses: currentReturn.deductions.moving,
      unionDues: unionDues + currentReturn.deductions.union,
      donations: currentReturn.credits.donations,
      medicalExpenses: currentReturn.credits.medical,
      tuitionAmount: currentReturn.credits.tuition
    };
  };

  return (
    <TaxReturnContext.Provider value={{ state, dispatch, getTaxInput }}>
      {children}
    </TaxReturnContext.Provider>
  );
}

export function useTaxReturn() {
  const context = useContext(TaxReturnContext);
  if (context === undefined) {
    throw new Error('useTaxReturn must be used within a TaxReturnProvider');
  }
  return context;
}
