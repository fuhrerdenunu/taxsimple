const fs = require('fs');

let content = fs.readFileSync('src/components/ui/AddressInput.tsx', 'utf8');

// 1. Fix interface AddressSuggestion merge conflict
content = content.replace(
  `  provider?: 'free-api' | 'canada-post' | 'nominatim';\n  raw?: NominatimResult | FreeAddressSuggestion;\n  provider?: 'canada-post' | 'nominatim';\n  raw?: NominatimResult;\n}`,
  `  provider?: 'free-api' | 'canada-post' | 'nominatim';\n  raw?: NominatimResult | any;\n}`
);

// 2. Fix duplicated PROVINCE_CODE_MAP block
const dupBlock = `const PROVINCE_CODE_MAP: Record<string, string> = {
  'Ontario': 'ON',
  'Quebec': 'QC',
  'British Columbia': 'BC',
  'Alberta': 'AB',
  'Manitoba': 'MB',
  'Saskatchewan': 'SK',
  'Nova Scotia': 'NS',
  'New Brunswick': 'NB',
  'Newfoundland and Labrador': 'NL',
  'Prince Edward Island': 'PE',
  'Northwest Territories': 'NT',
  'Nunavut': 'NU',
  'Yukon': 'YT'
};

function toProvinceCode(province?: string): string {
  if (!province) return '';
  if (province.length === 2) return province.toUpperCase();
  return PROVINCE_CODE_MAP[province] || province.slice(0, 2).toUpperCase();
}

function normalizePostalCode(postalCode?: string): string {
  if (!postalCode) return '';
  const cleaned = postalCode.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  return cleaned.length > 3 ? \`\${cleaned.slice(0, 3)} \${cleaned.slice(3)}\` : cleaned;
}`;

content = content.replace(dupBlock + '\nconst CANADA_POST_API_KEY = process.env.REACT_APP_CANADA_POST_API_KEY || \'\';\n\n' + dupBlock, 'const CANADA_POST_API_KEY = process.env.REACT_APP_CANADA_POST_API_KEY || \'\';\n\n' + dupBlock);

// 3. Fix activeProvider duplicate
content = content.replace(
  `  const [activeProvider, setActiveProvider] = useState<'free-api' | 'canada-post' | 'nominatim' | null>(null);\n  const [activeProvider, setActiveProvider] = useState<'canada-post' | 'nominatim' | null>(null);`,
  `  const [activeProvider, setActiveProvider] = useState<'free-api' | 'canada-post' | 'nominatim' | null>(null);`
);

// 4. Fix duplicate attemptNominatimFallback in handleSelect/fetchSuggestions
// We just remove the second occurrence which is right before a catch block without try.
// Wait, the merge conflict left a huge chunk. Let me just git checkout the file to its pre-merge state, 
// or re-generate it properly.
fs.writeFileSync('src/components/ui/AddressInput.tsx', content);
