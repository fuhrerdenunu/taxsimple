export interface NavItem {
  id: string;
  label: string;
  path: 'profile' | 'income' | 'deductions' | 'review' | 'complete';
  section?: string;
  children?: NavItem[];
}

export const navSections: NavItem[] = [
  { id: 'autofill', label: 'Auto-fill & add forms', path: 'profile', section: 'autofill' },
  { id: 'personal', label: 'Personal information', path: 'profile', section: 'personal' },
  {
    id: 'forms',
    label: 'Manage tax forms',
    path: 'income',
    children: [
      { id: 'partner', label: 'Your Partner', path: 'profile', section: 'partner' },
      { id: 'trillium', label: 'Trillium Benefit', path: 'profile', section: 'trillium' },
      { id: 'employment', label: 'Employment Expenses', path: 'deductions', section: 'employment' },
      { id: 'rrsp', label: 'RRSP Deduction', path: 'deductions', section: 'rrsp' },
      { id: 't4', label: 'T4 Slips', path: 'income', section: 't4' },
      { id: 't4fhsa', label: 'T4FHSA Slips', path: 'income', section: 't4fhsa' },
      { id: 'tuition', label: 'Tuition Amount', path: 'deductions', section: 'tuition' },
      { id: 'unused', label: 'Unused Losses', path: 'income', section: 'capital-gains' },
      { id: 'carryforwards', label: 'Carryforwards', path: 'deductions', section: 'carryforwards' },
      { id: 'capital', label: 'Capital Gains', path: 'income', section: 'capital-gains' },
      { id: 't5', label: 'T5 Slips', path: 'income', section: 't5' }
    ]
  },
  { id: 'review', label: 'Review & optimize', path: 'review' },
  { id: 'submit', label: 'Submit', path: 'complete' }
];

export function getNavPath(taxYear: number, item: NavItem): string {
  const basePath = `/return/${taxYear}/${item.path}`;
  if (!item.section) return basePath;
  return `${basePath}?section=${encodeURIComponent(item.section)}`;
}
