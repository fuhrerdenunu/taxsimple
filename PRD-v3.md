# TaxSimple PRD v3.0 - Comprehensive Canadian Tax Filing Application

## Overview
TaxSimple is a free, donation-based Canadian tax filing application modeled after Wealthsimple Tax. It supports all 13 provinces/territories, couple filing, and comprehensive CRA-compliant questionnaires.

---

## Question Flow Design (Wealthsimple Style)

All questions follow a conversational style with progressive disclosure:

### Account & Profile Setup
1. "What's your full name?"
2. "What's your date of birth?"
3. "What's your Social Insurance Number (SIN)?"
4. "What's your current address?"
5. "What's your province/territory of residence?"
6. "Are you filing for yourself only or also for a spouse/common-law partner?"

### CRA Auto-fill Setup
1. "Do you want to import information from CRA My Account?"
2. "Please authorize Auto-fill my return with your CRA login."
3. "Which slips do you want to import?" (T4, T5, T3, T5008, etc.)

### Income Questions
For each type, ask if user has it, then show entry form:
- "Did you have employment income this year?" → T4 form
- "Did you have self-employment or business income?" → T2125 form
- "Did you receive investment income (T5/T3)?" → Investment forms
- "Did you receive EI, CPP/OAS, or other benefits?" → Benefit slips

### Deductions & Credits
Walk through eligibility:
- "Did you make RRSP contributions this year?"
- "Do you have child care expenses to claim?"
- "Did you have medical expenses?"
- "Did you make charitable donations?"
- "Are you claiming tuition or education amounts?"
- "Are you eligible for Canada training credit?"

### Spouse / Shared Information
If spouse indicated:
- "Enter your spouse's income or import their slips."
- "Confirm shared credits or split amounts."

### Review & Check
- Summary of tax return
- Review each section for missing info
- Warnings and optimizations (unused credits)

---

## 1. User Onboarding & Authentication

### 1.1 Landing Page
- Hero section with refund estimate teaser
- "Start Your Free Return" CTA
- Trust indicators (NETFILE certified, bank-level encryption, privacy commitment)
- How it works (3-step visual)
- Testimonials / social proof
- FAQ section
- Footer with links to Privacy, Terms, Support

### 1.2 Authentication
- **Registration**: Email, password (8+ chars, uppercase, number), name
- **Login**: Email/password with rate limiting (5 attempts = 15 min lockout)
- **Email Verification**: Verification link sent on registration
- **Password Reset**: Token-based reset flow
- **Session Management**: Encrypted localStorage, auto-logout on 30 min inactivity

---

## 2. Dashboard

### 2.1 Tax Year Selection
- Cards for available tax years (2024, 2023, 2022)
- Status indicators: Not Started, In Progress, Ready to Review, Filed
- "Start New Return" button
- Access to previous year returns

### 2.2 Quick Actions
- Continue current return
- Import from CRA (simulated)
- Download completed returns

---

## 3. Tax Return Wizard

### 3.1 Stepper Navigation
1. Profile (Personal Information)
2. Income
3. Deductions
4. Credits
5. Review
6. Submit/Complete

### 3.2 Real-Time Refund Display
- Sticky sidebar (desktop) showing:
  - Estimated refund/balance owing
  - Total income
  - Tax withheld
  - Federal tax
  - Provincial tax
  - Health premium (ON)
  - Deductions applied
  - Taxable income
- Mobile: Fixed bottom bar with refund amount

---

## 4. Profile Page - Personal Information

**Question Style:** All questions should follow a conversational "Did you..." or "Do you..." format with Yes/No answers that reveal follow-up fields when applicable.

### 4.1 Basic Identification
- [ ] Legal first name (as on SIN card)
- [ ] Legal last name
- [ ] Social Insurance Number (SIN) - 9 digits with Luhn validation
- [ ] Date of birth
- [ ] Email address
- [ ] Phone number

### 4.2 Mailing Address
- [ ] Street address
- [ ] City
- [ ] Province/Territory (dropdown of 13)
- [ ] Postal code

### 4.3 Residency & Status Questions

#### Province of Residence
- [ ] Province/territory of residence on December 31, {year}
- [ ] Did you move to a different province/territory during the tax year?
  - If yes: Previous province, date of move
- [ ] Did you live outside a Census Metropolitan Area (CMA) on December 31?
  - Affects rural supplement for Climate Action Incentive

#### Residency Status
- [ ] What is your residency status in Canada?
  - Canadian citizen
  - Permanent resident
  - Protected person (refugee)
  - Temporary resident (work/study permit)
  - Non-resident
  - Deemed resident
  - Factual resident living abroad
- [ ] Is this your first time filing a Canadian tax return?
  - If yes: Date you became a resident of Canada
- [ ] Did you leave Canada or cease to be a resident during the tax year?
  - If yes: Departure date, destination country

#### Indigenous Status
- [ ] Are you a Status Indian registered under the Indian Act?
- [ ] Did you live on a reserve at any time during the year?
- [ ] Do you have income exempt under Section 87 of the Indian Act?
  - If yes: Link to Form T90 for exempt income reporting

#### Special Circumstances
- [ ] Were you confined to a prison or similar institution for 90 days or more during the year?
  - Affects GST/HST credit, Climate Action Incentive, CWB eligibility
- [ ] Were you a full-time student during the year?
- [ ] Did you file for bankruptcy during the year?
  - If yes: Bankruptcy date, trustee information
- [ ] Are you a veteran receiving disability benefits?

### 4.4 Marital Status

- [ ] Marital status on December 31, {year}:
  - Single
  - Married
  - Common-law
  - Separated (90+ days)
  - Divorced
  - Widowed
- [ ] Did your marital status change during the year?
  - If yes: Previous status, date of change

#### Spouse/Partner Information (if married/common-law)
- [ ] Would you like to prepare your spouse/partner's return together?
  - Optimizes credit splitting automatically
- [ ] Spouse's legal first name
- [ ] Spouse's legal last name
- [ ] Spouse's SIN
- [ ] Spouse's date of birth
- [ ] Spouse's net income (if not filing together)
- [ ] Was your spouse self-employed?
- [ ] Did your spouse receive Universal Child Care Benefit (UCCB)?

### 4.5 Dependants

- [ ] Do you have any dependants?
- For each dependant:
  - [ ] First name
  - [ ] Last name
  - [ ] Date of birth
  - [ ] Relationship (child, grandchild, parent, grandparent, sibling, other)
  - [ ] SIN (if applicable)
  - [ ] Net income
  - [ ] Lives with you? (full year / part year / no)
  - [ ] Has a physical or mental impairment (eligible for DTC)?
  - [ ] Is eligible for Canada Caregiver Amount?

### 4.6 Direct Deposit

- [ ] Do you want to set up or update direct deposit with CRA?
  - If yes: Bank name, transit number, institution number, account number

### 4.7 CRA Consent & Elections

#### Elections Canada
- [ ] Do you authorize the CRA to provide your name, address, and date of birth to Elections Canada?
  - Used to maintain National Register of Electors
  - Valid until next tax return filed
- [ ] Are you a Canadian citizen?
- [ ] Are you 18 or older? (or will turn 18 before next election)

#### Organ and Tissue Donation (Province-specific)
**British Columbia:**
- [ ] Do you authorize the CRA to provide your name, email address, and postal code to BC Transplant for information about organ and tissue donation?
  - Note: This is NOT consent to donate - only to receive information

**Ontario:**
- [ ] Would you like to register as an organ and tissue donor with Trillium Gift of Life Network?

**Other provinces:** Similar provincial registry questions as applicable

### 4.8 Benefits Applications

- [ ] Climate Action Incentive Payment (CAIP)
  - Available for: AB, SK, MB, ON, NB, NS, PE, NL
  - Rural supplement question linked to CMA residence
- [ ] Canada Workers Benefit (CWB)
  - Working income > $3,000 and < threshold
  - Disability supplement available
- [ ] GST/HST Credit
  - Automatic if eligible based on income
- [ ] Canada Child Benefit (CCB)
  - For families with children under 18

#### Province-Specific Benefits

**Ontario:**
- [ ] Ontario Trillium Benefit (OTB)
  - Ontario Energy and Property Tax Credit
  - Northern Ontario Energy Credit (if living in Northern Ontario)
  - Ontario Sales Tax Credit
- [ ] Ontario Senior Homeowners' Property Tax Grant
- [ ] Ontario Staycation Tax Credit

**British Columbia:**
- [ ] BC Climate Action Tax Credit
- [ ] BC Renter's Tax Credit

**Quebec:**
- [ ] Solidarity Tax Credit
- [ ] Tax Shield

**Alberta:**
- [ ] Alberta Child and Family Benefit

---

## 5. Income Page

### 5.1 Document Upload
- Drag-and-drop PDF upload
- Auto-detection of slip type (T4, T4A, T5, etc.)
- OCR text extraction with field mapping
- Manual verification/correction of extracted data

### 5.2 CRA Auto-fill (Simulated)
- "Connect to CRA My Account" button
- Mock import of T4, T5, RRSP receipts

### 5.3 Employment Income

#### T4 - Statement of Remuneration Paid
- [ ] Employer name
- [ ] Box 14 - Employment income
- [ ] Box 16 - Employee's CPP contributions
- [ ] Box 17 - Employee's QPP contributions (Quebec)
- [ ] Box 18 - Employee's EI premiums
- [ ] Box 20 - RPP contributions
- [ ] Box 22 - Income tax deducted
- [ ] Box 24 - EI insurable earnings
- [ ] Box 26 - CPP/QPP pensionable earnings
- [ ] Box 44 - Union dues
- [ ] Box 46 - Charitable donations (deducted at source)
- [ ] Box 52 - Pension adjustment
- [ ] Box 55 - Employee's PPIP premiums (Quebec)

#### T4A - Statement of Pension, Retirement, Annuity, and Other Income
- [ ] Payer name
- [ ] Box 016 - Pension or superannuation
- [ ] Box 018 - Lump-sum payments
- [ ] Box 020 - Self-employed commissions
- [ ] Box 022 - Income tax deducted
- [ ] Box 024 - Annuities
- [ ] Box 028 - Other income
- [ ] Box 048 - Fees for services

### 5.4 Self-Employment Income

#### T2125 - Statement of Business or Professional Activities
- [ ] Business name (or operating under own name)
- [ ] Business number (if applicable)
- [ ] Industry code (NAICS)
- [ ] Gross business income
- [ ] Business expenses (categorized):
  - Advertising
  - Bad debts
  - Business tax, fees, licenses
  - Delivery, freight
  - Fuel costs
  - Insurance
  - Interest and bank charges
  - Legal, accounting, professional fees
  - Maintenance and repairs
  - Management and administration fees
  - Meals and entertainment (50%)
  - Motor vehicle expenses
  - Office expenses
  - Supplies
  - Rent
  - Salaries, wages, benefits
  - Telephone and utilities
  - Travel
  - Other expenses
- [ ] Net income/loss
- [ ] Home office percentage (if applicable)
- [ ] Capital cost allowance (CCA)

### 5.5 Investment Income

#### T5 - Statement of Investment Income
- [ ] Payer/institution name
- [ ] Box 013 - Interest from Canadian sources
- [ ] Box 014 - Other income from Canadian sources
- [ ] Box 018 - Capital gains dividends
- [ ] Box 024 - Actual amount of eligible dividends
- [ ] Box 025 - Taxable amount of eligible dividends (138% gross-up)
- [ ] Box 026 - Dividend tax credit for eligible dividends

#### T3 - Statement of Trust Income
- [ ] Trust name
- [ ] Box 021 - Capital gains
- [ ] Box 023 - Actual eligible dividends
- [ ] Box 026 - Other income
- [ ] Box 032 - Other tax credits
- [ ] Box 049 - Taxable eligible dividends

#### T5008 - Statement of Securities Transactions
- [ ] Security description
- [ ] Number of units
- [ ] Proceeds of disposition
- [ ] Cost/book value
- [ ] Capital gain/loss

### 5.6 Other Income

- [ ] Rental income (net)
- [ ] Foreign income (with T2209 for foreign tax credit)
- [ ] Employment Insurance (EI) benefits - T4E
- [ ] Social assistance payments - T5007
- [ ] Workers' compensation benefits
- [ ] Scholarships, fellowships, bursaries - T4A
- [ ] Research grants
- [ ] CERB/CRB/CRCB/CRSB repayments
- [ ] Tips and gratuities (not on T4)
- [ ] Retiring allowances
- [ ] RRSP/RRIF income - T4RSP/T4RIF
- [ ] Spousal support received
- [ ] Taxable capital gains (50% inclusion rate)

---

## 6. Deductions Page

### 6.1 RRSP and Retirement

- [ ] RRSP contributions (March 2-Dec 31 of tax year)
- [ ] RRSP contributions (Jan 1 - March 1 of following year)
- [ ] RRSP contribution limit (from Notice of Assessment)
- [ ] Contributions to spousal RRSP
- [ ] RPP contributions (past service)
- [ ] PRPP contributions

### 6.2 FHSA (First Home Savings Account)

- [ ] FHSA contributions (max $8,000/year, $40,000 lifetime)
- [ ] First-time home buyer status verification

### 6.3 Child Care Expenses

- [ ] Child care provider name
- [ ] Provider SIN or business number
- [ ] Amount paid
- [ ] Child's name and age
- [ ] Type of care (daycare, camp, boarding school, etc.)
- [ ] Lower-income spouse claim (unless exception applies)

### 6.4 Moving Expenses

- [ ] Did you move at least 40 km closer to work/school?
- [ ] Date of move
- [ ] Old address
- [ ] New address
- [ ] Transportation costs
- [ ] Storage costs
- [ ] Temporary lodging
- [ ] Travel expenses
- [ ] Real estate commissions (on old home)
- [ ] Legal fees

### 6.5 Employment Expenses

- [ ] Did you receive a signed T2200/T2200S from your employer?
- [ ] Home office expenses
- [ ] Vehicle expenses (if required for work)
- [ ] Supplies
- [ ] Tradesperson tools deduction

### 6.6 Other Deductions

- [ ] Union, professional dues (if not on T4)
- [ ] Support payments made (spousal/child)
- [ ] Carrying charges and interest expenses
- [ ] Legal fees to collect salary, pension
- [ ] Clergy residence deduction
- [ ] Northern residents deductions
- [ ] Canadian Armed Forces personnel deductions

---

## 7. Credits Page

### 7.1 Charitable Donations

- [ ] Donation receipts (total)
- [ ] 15% credit on first $200
- [ ] 29% credit on amounts over $200
- [ ] 33% credit on portion subject to highest tax bracket
- [ ] Carry forward from previous 5 years
- [ ] First-time donor super credit (if applicable)
- [ ] Ecogifts and cultural property

### 7.2 Medical Expenses

- [ ] Total eligible medical expenses
- [ ] For self, spouse, dependent children
- [ ] Threshold: lesser of 3% of net income or $2,635 (2024)
- [ ] Categories:
  - Prescription drugs
  - Dental care
  - Vision care (glasses, contacts, laser surgery)
  - Medical devices
  - Travel for medical care (40+ km)
  - Attendant care
  - Nursing home fees
  - Service animals

### 7.3 Tuition and Education

- [ ] T2202 - Tuition and Enrolment Certificate
- [ ] Tuition amount (Box 24)
- [ ] Months enrolled full-time (Box 26)
- [ ] Months enrolled part-time (Box 27)
- [ ] Transfer to spouse/parent/grandparent (max $5,000)
- [ ] Carry forward unused amounts

### 7.4 Disability Tax Credit

- [ ] Do you have a severe and prolonged impairment?
- [ ] T2201 - Disability Tax Credit Certificate approved by CRA?
- [ ] Transfer from spouse
- [ ] Transfer from dependant

### 7.5 Home Accessibility Expenses

- [ ] Renovations for senior or disabled person
- [ ] Maximum claim $20,000

### 7.6 Home Buyers' Amount

- [ ] First-time home buyer?
- [ ] Purchased qualifying home this year?
- [ ] Maximum credit: $10,000

### 7.7 Climate Action Incentive

- [ ] Province of residence on December 31
- [ ] Number of children under 19
- [ ] Rural supplement (if outside CMA)

### 7.8 Canada Workers Benefit (CWB)

- [ ] Working income
- [ ] Adjusted family net income
- [ ] Disability supplement eligibility

### 7.9 Other Credits

- [ ] Canada Employment Amount (automatic from T4)
- [ ] Public transit pass (some provinces)
- [ ] Adoption expenses
- [ ] Volunteer firefighter/search and rescue (if 200+ hours)
- [ ] Teacher/educator school supply credit
- [ ] Digital news subscription credit
- [ ] Canada training credit

---

## 8. Review Page

### 8.1 Readiness Meter
- Red: Blocking errors (missing SIN, no income)
- Yellow: Warnings (unusual values, missing optional info)
- Green: Ready to file

### 8.2 Validation Checks
- [ ] SIN is valid (Luhn algorithm)
- [ ] Date of birth is reasonable
- [ ] Province matches postal code prefix
- [ ] Income is non-negative (or valid loss)
- [ ] Tax withheld doesn't exceed income
- [ ] RRSP contribution within limit
- [ ] Medical expense threshold calculated
- [ ] Donations don't exceed 75% of net income

### 8.3 Summary Display
- Personal information summary
- Income summary by type
- Deductions summary
- Credits summary
- Tax calculation breakdown
- Refund or balance owing

### 8.4 Optimization Suggestions
- "Did you know you can claim...?"
- Spouse credit splitting recommendations
- RRSP room remaining
- Carry forward opportunities

---

## 9. Submit/Complete Page

### 9.1 Final Confirmation
- Review summary
- Attestation checkbox
- NETFILE submission (simulated)

### 9.2 Confirmation
- Confirmation number
- Expected refund timeline
- Next steps

### 9.3 Downloads
- PDF summary of return
- T1 General summary
- All schedules

### 9.4 Quebec Reminder
- If province = QC: "Remember to file your TP-1 with Revenu Québec"
- Link to Revenu Québec

---

## 10. Technical Requirements

### 10.1 Tax Engine
- All 13 provinces/territories
- 2024 federal brackets
- Provincial brackets with surtax (ON, PE)
- Ontario Health Premium
- Quebec abatement (16.5%)
- CPP/QPP calculations (employee and self-employed)
- EI/QPIP calculations
- Dividend gross-up and tax credit
- Capital gains inclusion rate (50%)
- All non-refundable credits

### 10.2 Data Security
- AES-256 encryption for stored data
- SIN masked in UI (***-***-XXX)
- Rate limiting on auth
- HTTPS only
- No server-side SIN storage in demo

### 10.3 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

### 10.4 Deployment
- Railway hosting
- NETFILE certification pathway (future)

---

## 11. Future Enhancements

### Phase 2
- Real CRA Auto-fill integration
- Actual NETFILE submission
- T1135 Foreign Property reporting
- T1134 Foreign Affiliate reporting
- Multi-language (French)

### Phase 3
- Mobile app (iOS/Android)
- Tax expert review tier
- Audit protection
- Year-over-year comparison
- Tax planning scenarios

---

## 12. Files to Create/Update

### New Files Needed
```
src/pages/return/
├── CreditsPage.tsx          # New - dedicated credits page
src/components/tax/
├── DependantForm.tsx        # Dependant entry form
├── SpouseForm.tsx           # Spouse information form
├── T3Form.tsx               # Trust income form
├── T5008Form.tsx            # Securities transactions
├── T4EForm.tsx              # EI benefits
├── MedicalExpensesForm.tsx  # Medical expenses tracker
├── DonationsForm.tsx        # Charitable donations
├── TuitionForm.tsx          # T2202 tuition
├── MovingExpensesForm.tsx   # Moving expenses
├── HomeOfficeForm.tsx       # Home office expenses
├── ValidationChecks.tsx     # Review page validations
├── OptimizationTips.tsx     # Tax optimization suggestions
```

### Files to Update
```
src/context/TaxReturnContext.tsx  # Add all new fields
src/pages/return/ProfilePage.tsx  # Add all questions
src/pages/return/IncomePage.tsx   # Add more income types
src/pages/return/DeductionsPage.tsx  # Expand deductions
src/domain/tax/types.ts           # Add new interfaces
```

---

## Sources

- [CRA T1 General Guide](https://www.canada.ca/en/revenue-agency/services/forms-publications/tax-packages-years/general-income-tax-benefit-package/5000-g.html)
- [Wealthsimple Tax](https://www.wealthsimple.com/en-ca/tax)
- [HR Block Canada - Prison Confinement](https://support.hrblock.ca/en-ca/Content/Other/ConfinedToAPrisonFor90Days.htm)
- [CRA GST/HST Credit](https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4210/gst-hst-credit.html)
- [Climate Action Incentive](https://turbotax.intuit.ca/tips/climate-change-plan-climate-action-incentive-fuel-charges-impacts-taxes-9206)
