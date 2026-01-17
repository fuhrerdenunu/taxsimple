import React, { createContext, useContext, useReducer, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import type { ProvinceCode } from '../domain/tax';

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
    44?: number; // Union dues
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
    28?: number; // Other income
  };
}

export interface T5Slip {
  id: string;
  type: 'T5';
  payerName: string;
  boxes: {
    24?: number; // Actual dividends
    25?: number; // Taxable dividends
    13?: number; // Interest income
  };
}

export interface T2125Data {
  id: string;
  type: 'T2125';
  businessName: string;
  grossRevenue: number;
  expenses: number;
  netIncome: number;
}

export type IncomeSlip = T4Slip | T4ASlip | T5Slip | T2125Data;

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
    medical: number;
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
    medical: 0,
    tuition: 0
  }
});

const initialState: TaxReturnState = {
  profile: initialProfile,
  currentReturn: createNewReturn(2024),
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
const ENCRYPTION_KEY = 'taxsimple_data_key';

const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};

const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
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
    } catch (error) {
      console.error('Failed to load tax return state:', error);
    }
  }, []);

  // Save to localStorage on change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const encrypted = encrypt(JSON.stringify(state));
        localStorage.setItem(STORAGE_KEY, encrypted);
      } catch (error) {
        console.error('Failed to save tax return state:', error);
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

    currentReturn.slips.forEach(slip => {
      if (slip.type === 'T4') {
        employmentIncome += slip.boxes[14] || 0;
        taxWithheld += slip.boxes[22] || 0;
        cppContributions += slip.boxes[16] || 0;
        eiPremiums += slip.boxes[18] || 0;
        unionDues += slip.boxes[44] || 0;
      } else if (slip.type === 'T4A') {
        taxWithheld += slip.boxes[22] || 0;
      }
    });

    return {
      province: profile.province,
      employmentIncome,
      selfEmploymentIncome: currentReturn.otherIncome.selfEmployment,
      rentalIncome: currentReturn.otherIncome.rental,
      interestIncome: currentReturn.otherIncome.interest,
      dividendIncome: currentReturn.otherIncome.dividends,
      capitalGains: currentReturn.otherIncome.capitalGains,
      otherIncome: currentReturn.otherIncome.other,
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
