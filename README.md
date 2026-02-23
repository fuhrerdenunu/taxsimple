# TaxSimple 🇨🇦

**Smart, simple tax filing for Canadians**

A modern Canadian T1 personal tax filing application that works as both a web app and a native macOS desktop application.

![TaxSimple Screenshot](./docs/screenshot.png)

## Features

### For Filers
- **Simple & Complex Returns**: Support for T4 employment income, self-employment, rental income, investments, and more
- **Real-time Tax Calculation**: See your refund or amount owing update as you enter information
- **CRA Auto-fill Integration**: Connect to your CRA My Account to automatically import tax slips
- **Document Upload & OCR**: Upload PDFs of tax slips and receipts for automatic data extraction
- **Comprehensive Provincial Support**: Proper provincial tax brackets for all 13 provinces and territories
- **Optimization Suggestions**: Get personalized tips to maximize your refund

### Tax Engine
- **2024 Tax Year**: Full support for federal tax brackets and rates
- **Provincial Tax**: Complete bracket structures for ON, BC, AB, QC, MB, SK, NB, NS, PE, NL, YT, NT, NU
- **Ontario Surtax**: Automatic calculation of Ontario's additional surtax
- **Ontario Health Premium**: Income-based health premium calculation
- **Credits**: CPP, EI, Canada Employment Credit, donations, medical expenses, tuition
- **Deductions**: RRSP, FHSA, childcare, moving expenses, union dues

## Tech Stack

- **Frontend**: React 18 with Hooks
- **Desktop**: Electron 28 for native macOS/Windows/Linux apps
- **Styling**: Custom CSS-in-JS design system
- **Build**: Create React App + Electron Builder
- **Package**: DMG for macOS, NSIS for Windows, AppImage for Linux

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- macOS 12+ for desktop development (or Windows/Linux)

### Installation

```bash
# Clone the repository
git clone https://github.com/taxsimple/taxsimple-app.git
cd taxsimple-app

# Install dependencies
npm install
```

### Development

```bash
# Run web app only
npm start

# Run Electron app in development mode
npm run electron:dev
```

The web app will be available at `http://localhost:3000`

### Building

```bash
# Build web app for production
npm run build

# Build macOS .dmg
npm run dist

# Build Windows installer
npm run dist:win

# Build Linux AppImage
npm run dist:linux
```

## Project Structure

```
taxsimple-app/
├── src/
│   ├── taxsimple-app.jsx    # Main React application
│   └── index.js             # Entry point
├── electron/
│   ├── main.js              # Electron main process
│   └── preload.js           # Security bridge
├── assets/
│   ├── icon.icns            # macOS icon
│   ├── icon.ico             # Windows icon
│   └── entitlements.mac.plist
├── package.json
└── README.md
```

## Tax Calculation Details

### Federal Tax Brackets (2024)

| Income Range | Rate |
|--------------|------|
| $0 - $55,867 | 15% |
| $55,867 - $111,733 | 20.5% |
| $111,733 - $173,205 | 26% |
| $173,205 - $246,752 | 29% |
| Over $246,752 | 33% |

### Provincial Tax (Ontario Example)

| Income Range | Rate |
|--------------|------|
| $0 - $51,446 | 5.05% |
| $51,446 - $102,894 | 9.15% |
| $102,894 - $150,000 | 11.16% |
| $150,000 - $220,000 | 12.16% |
| Over $220,000 | 13.16% |

Plus Ontario Surtax:
- 20% on provincial tax over $5,554
- Additional 36% on provincial tax over $7,108

### Key 2024 Limits

- Basic Personal Amount: $15,705 (income-tested)
- RRSP Contribution Limit: $31,560
- FHSA Annual Limit: $8,000
- CPP Maximum Contribution: $3,867.50
- EI Maximum Premium: $1,049.12
- Canada Employment Credit: $1,433

## macOS Code Signing & Notarization

To distribute the app outside the Mac App Store:

### 1. Create App ID

```bash
# In Apple Developer Portal, create an App ID
# Bundle ID: com.taxsimple.app
```

### 2. Create Signing Certificates

- Developer ID Application certificate
- Developer ID Installer certificate

### 3. Create entitlements.mac.plist

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
</dict>
</plist>
```

### 4. Sign and Notarize

```bash
# Set environment variables
export APPLE_ID="your@email.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="YOUR_TEAM_ID"

# Build with signing
npm run dist -- --mac --publish=never

# The app will be automatically notarized if credentials are set
```

## API Reference

### Tax Engine Functions

```javascript
// Calculate complete tax summary
const result = calculateTax({
  province: 'ON',
  employmentIncome: 75000,
  selfEmploymentIncome: 0,
  rentalIncome: 0,
  interestIncome: 500,
  dividendIncome: 1000,
  capitalGains: 5000,
  taxWithheld: 15000,
  cppContributions: 3500,
  eiPremiums: 1000,
  rrspDeduction: 10000,
  fhsaDeduction: 8000,
  donations: 500,
  medicalExpenses: 2000
});

// Returns:
{
  totalIncome: 82190,
  totalDeductions: 18000,
  taxableIncome: 64190,
  federalTax: 5234.50,
  provincialTax: 3421.20,
  healthPremium: 450,
  totalTax: 9105.70,
  totalWithheld: 15000,
  refundOrOwing: 5894.30,
  isRefund: true,
  provinceName: 'Ontario'
}
```

## Product Readiness Roadmap

See detailed recommendations in [`docs/READINESS_RECOMMENDATIONS.md`](./docs/READINESS_RECOMMENDATIONS.md).

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Disclaimer

TaxSimple is a tax preparation tool provided for informational purposes only. It is not certified by the CRA for NETFILE submission. Always verify your tax calculations with a certified tax professional or official CRA-certified software before filing. Tax laws change frequently; while we strive for accuracy, we cannot guarantee the calculations are current or applicable to your specific situation.

## Support

- **Documentation**: [docs.taxsimple.ca](https://docs.taxsimple.ca)
- **Email**: support@taxsimple.ca
- **GitHub Issues**: [Report a bug](https://github.com/taxsimple/taxsimple-app/issues)

---

Made with ❤️ for Canadians
