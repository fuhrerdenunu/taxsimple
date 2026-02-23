export type FormCategory =
  | 'Employment'
  | 'Self-Employment'
  | 'Investment'
  | 'Retirement'
  | 'Education'
  | 'Credits'
  | 'Quebec'
  | 'Other';

export type FormSupportStatus = 'supported' | 'partial' | 'planned';
export type PersonScope = 'primary' | 'partner' | 'both';
export type FormRouteTarget = 'workspace' | 'deductions' | 'review';

export interface FormRegistryItem {
  id: string;
  code: string;
  name: string;
  category: FormCategory;
  description: string;
  supportedStatus: FormSupportStatus;
  personScope: PersonScope;
  routeTarget: FormRouteTarget;
  parserMappings: string[];
  uiEditor: string;
}

export const FORM_REGISTRY: FormRegistryItem[] = [
  {
    id: 't4',
    code: 'T4',
    name: 'Statement of Remuneration Paid',
    category: 'Employment',
    description: 'Employment income and payroll deductions.',
    supportedStatus: 'supported',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['T4', 'RL1'],
    uiEditor: 't4'
  },
  {
    id: 't4a',
    code: 'T4A',
    name: 'Pension, Retirement, Annuity, and Other Income',
    category: 'Employment',
    description: 'Pension and miscellaneous income.',
    supportedStatus: 'supported',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['T4A'],
    uiEditor: 't4a'
  },
  {
    id: 't4e',
    code: 'T4E',
    name: 'Statement of Employment Insurance Benefits',
    category: 'Employment',
    description: 'EI benefits and tax deducted.',
    supportedStatus: 'partial',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['T4E'],
    uiEditor: 't4e'
  },
  {
    id: 't2125',
    code: 'T2125',
    name: 'Business or Professional Activities',
    category: 'Self-Employment',
    description: 'Business income and expenses.',
    supportedStatus: 'supported',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['T2125'],
    uiEditor: 't2125'
  },
  {
    id: 't5',
    code: 'T5',
    name: 'Statement of Investment Income',
    category: 'Investment',
    description: 'Interest and dividend income.',
    supportedStatus: 'supported',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['T5'],
    uiEditor: 't5'
  },
  {
    id: 't3',
    code: 'T3',
    name: 'Statement of Trust Income Allocations',
    category: 'Investment',
    description: 'Trust allocations and income tax withheld.',
    supportedStatus: 'partial',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['T3'],
    uiEditor: 't3'
  },
  {
    id: 't5008',
    code: 'T5008',
    name: 'Statement of Securities Transactions',
    category: 'Investment',
    description: 'Proceeds from securities dispositions.',
    supportedStatus: 'partial',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['T5008'],
    uiEditor: 't5008'
  },
  {
    id: 'rrsp',
    code: 'RRSP',
    name: 'RRSP Contributions',
    category: 'Retirement',
    description: 'Contribution receipts and deduction claim.',
    supportedStatus: 'supported',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['T4RSP'],
    uiEditor: 'rrsp'
  },
  {
    id: 'fhsa',
    code: 'FHSA',
    name: 'First Home Savings Account',
    category: 'Retirement',
    description: 'FHSA contributions and withdrawals.',
    supportedStatus: 'partial',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['T4FHSA'],
    uiEditor: 'fhsa'
  },
  {
    id: 't2202',
    code: 'T2202',
    name: 'Tuition and Enrolment Certificate',
    category: 'Education',
    description: 'Eligible tuition amounts and months enrolled.',
    supportedStatus: 'supported',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['T2202'],
    uiEditor: 't2202'
  },
  {
    id: 'medical',
    code: 'Medical',
    name: 'Medical Expenses',
    category: 'Credits',
    description: 'Eligible unreimbursed medical claims.',
    supportedStatus: 'supported',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: [],
    uiEditor: 'medical'
  },
  {
    id: 'donations',
    code: 'Donations',
    name: 'Charitable Donations',
    category: 'Credits',
    description: 'Current-year and carry-forward donations.',
    supportedStatus: 'supported',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: [],
    uiEditor: 'donations'
  },
  {
    id: 'rl1',
    code: 'RL-1',
    name: 'Quebec Employment Income',
    category: 'Quebec',
    description: 'Quebec Releve 1 employment slip.',
    supportedStatus: 'partial',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: ['RL1'],
    uiEditor: 'rl1'
  },
  {
    id: 'capitalGains',
    code: 'Schedule 3',
    name: 'Capital Gains and Losses',
    category: 'Investment',
    description: 'Track dispositions and adjusted cost base.',
    supportedStatus: 'planned',
    personScope: 'both',
    routeTarget: 'workspace',
    parserMappings: [],
    uiEditor: 'capitalGains'
  }
];

export function getFormById(id: string): FormRegistryItem | undefined {
  return FORM_REGISTRY.find((item) => item.id === id);
}

