// TaxSimple - Complete Canadian Tax Filing Application
// Single-file React implementation with comprehensive tax engine

import React, { useState, useMemo, useReducer, createContext, useContext, useRef } from 'react';

// ============================================================================
// TAX ENGINE - Comprehensive Canadian Tax Calculations
// ============================================================================

const TAX_CONFIG = {
  2024: {
    federal: {
      brackets: [
        { min: 0, max: 55867, rate: 0.15 },
        { min: 55867, max: 111733, rate: 0.205 },
        { min: 111733, max: 173205, rate: 0.26 },
        { min: 173205, max: 246752, rate: 0.29 },
        { min: 246752, max: Infinity, rate: 0.33 }
      ],
      basicPersonalAmount: 15705,
      bpaReduction: { start: 173205, end: 246752, minBPA: 14156 }
    },
    cpp: { max: 3867.50, rate: 0.0595, maxEarnings: 68500, exemption: 3500 },
    ei: { max: 1049.12, rate: 0.0166, maxInsurable: 63200 },
    rrsp: { limit: 31560 },
    fhsa: { annual: 8000, lifetime: 40000 },
    canadaEmploymentCredit: 1433,
    medicalThreshold: { rate: 0.03, max: 2635 },
    donations: { firstTier: 200, lowRate: 0.15, highRate: 0.29 },
    provincial: {
      ON: {
        name: 'Ontario',
        brackets: [
          { min: 0, max: 51446, rate: 0.0505 },
          { min: 51446, max: 102894, rate: 0.0915 },
          { min: 102894, max: 150000, rate: 0.1116 },
          { min: 150000, max: 220000, rate: 0.1216 },
          { min: 220000, max: Infinity, rate: 0.1316 }
        ],
        bpa: 12399,
        surtax: { first: 5554, firstRate: 0.20, second: 7108, secondRate: 0.36 },
        healthPremium: [
          { max: 20000, amount: 0 },
          { max: 25000, base: 0, rate: 0.06 },
          { max: 36000, amount: 300 },
          { max: 38500, base: 300, rate: 0.06 },
          { max: 48000, amount: 450 },
          { max: 48600, base: 450, rate: 0.25 },
          { max: 72000, amount: 600 },
          { max: 200000, base: 600, rate: 0.25, cap: 750 },
          { max: Infinity, amount: 900 }
        ]
      },
      BC: {
        name: 'British Columbia',
        brackets: [
          { min: 0, max: 47937, rate: 0.0506 },
          { min: 47937, max: 95875, rate: 0.077 },
          { min: 95875, max: 110076, rate: 0.105 },
          { min: 110076, max: 133664, rate: 0.1229 },
          { min: 133664, max: 181232, rate: 0.147 },
          { min: 181232, max: 252752, rate: 0.168 },
          { min: 252752, max: Infinity, rate: 0.205 }
        ],
        bpa: 12580
      },
      AB: {
        name: 'Alberta',
        brackets: [
          { min: 0, max: 148269, rate: 0.10 },
          { min: 148269, max: 177922, rate: 0.12 },
          { min: 177922, max: 237230, rate: 0.13 },
          { min: 237230, max: 355845, rate: 0.14 },
          { min: 355845, max: Infinity, rate: 0.15 }
        ],
        bpa: 21003
      },
      QC: {
        name: 'Quebec',
        brackets: [
          { min: 0, max: 51780, rate: 0.14 },
          { min: 51780, max: 103545, rate: 0.19 },
          { min: 103545, max: 126000, rate: 0.24 },
          { min: 126000, max: Infinity, rate: 0.2575 }
        ],
        bpa: 18056,
        abatement: 0.165
      },
      MB: {
        name: 'Manitoba',
        brackets: [
          { min: 0, max: 47000, rate: 0.108 },
          { min: 47000, max: 100000, rate: 0.1275 },
          { min: 100000, max: Infinity, rate: 0.174 }
        ],
        bpa: 15780
      },
      SK: {
        name: 'Saskatchewan',
        brackets: [
          { min: 0, max: 52057, rate: 0.105 },
          { min: 52057, max: 148734, rate: 0.125 },
          { min: 148734, max: Infinity, rate: 0.145 }
        ],
        bpa: 18491
      },
      NB: {
        name: 'New Brunswick',
        brackets: [
          { min: 0, max: 49958, rate: 0.094 },
          { min: 49958, max: 99916, rate: 0.14 },
          { min: 99916, max: 185064, rate: 0.16 },
          { min: 185064, max: Infinity, rate: 0.195 }
        ],
        bpa: 13044
      },
      NS: {
        name: 'Nova Scotia',
        brackets: [
          { min: 0, max: 29590, rate: 0.0879 },
          { min: 29590, max: 59180, rate: 0.1495 },
          { min: 59180, max: 93000, rate: 0.1667 },
          { min: 93000, max: 150000, rate: 0.175 },
          { min: 150000, max: Infinity, rate: 0.21 }
        ],
        bpa: 8481
      },
      PE: {
        name: 'Prince Edward Island',
        brackets: [
          { min: 0, max: 32656, rate: 0.098 },
          { min: 32656, max: 64313, rate: 0.138 },
          { min: 64313, max: Infinity, rate: 0.167 }
        ],
        bpa: 13500,
        surtax: { threshold: 12500, rate: 0.10 }
      },
      NL: {
        name: 'Newfoundland and Labrador',
        brackets: [
          { min: 0, max: 43198, rate: 0.087 },
          { min: 43198, max: 86395, rate: 0.145 },
          { min: 86395, max: 154244, rate: 0.158 },
          { min: 154244, max: 215943, rate: 0.178 },
          { min: 215943, max: 275870, rate: 0.198 },
          { min: 275870, max: 551739, rate: 0.208 },
          { min: 551739, max: 1103478, rate: 0.213 },
          { min: 1103478, max: Infinity, rate: 0.218 }
        ],
        bpa: 10818
      },
      YT: {
        name: 'Yukon',
        brackets: [
          { min: 0, max: 55867, rate: 0.064 },
          { min: 55867, max: 111733, rate: 0.09 },
          { min: 111733, max: 173205, rate: 0.109 },
          { min: 173205, max: 500000, rate: 0.128 },
          { min: 500000, max: Infinity, rate: 0.15 }
        ],
        bpa: 15705
      },
      NT: {
        name: 'Northwest Territories',
        brackets: [
          { min: 0, max: 50597, rate: 0.059 },
          { min: 50597, max: 101198, rate: 0.086 },
          { min: 101198, max: 164525, rate: 0.122 },
          { min: 164525, max: Infinity, rate: 0.1405 }
        ],
        bpa: 17373
      },
      NU: {
        name: 'Nunavut',
        brackets: [
          { min: 0, max: 53268, rate: 0.04 },
          { min: 53268, max: 106537, rate: 0.07 },
          { min: 106537, max: 173205, rate: 0.09 },
          { min: 173205, max: Infinity, rate: 0.115 }
        ],
        bpa: 18767
      }
    }
  }
};

const PROVINCES = Object.entries(TAX_CONFIG[2024].provincial).map(([code, data]) => ({
  code,
  name: data.name
}));

const formatCurrency = (amount, cents = true) => {
  const num = parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0
  }).format(num);
};

const calculateBracketedTax = (income, brackets) => {
  let tax = 0;
  let remaining = income;
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, bracket.max - bracket.min);
    tax += taxable * bracket.rate;
    remaining -= taxable;
  }
  return Math.max(0, tax);
};

const calculateOntarioHealthPremium = (income) => {
  const brackets = TAX_CONFIG[2024].provincial.ON.healthPremium;
  let prev = 0;
  for (const b of brackets) {
    if (income <= b.max) {
      if (b.amount !== undefined) return b.amount;
      let premium = (b.base || 0) + (income - prev) * b.rate;
      if (b.cap) premium = Math.min(premium, b.cap);
      return premium;
    }
    prev = b.max;
  }
  return 900;
};

const calculateTax = (data) => {
  const config = TAX_CONFIG[2024];
  const prov = config.provincial[data.province] || config.provincial.ON;
  
  // Total Income
  const totalIncome = (data.employmentIncome || 0) + 
    (data.selfEmploymentIncome || 0) + 
    (data.rentalIncome || 0) + 
    (data.interestIncome || 0) +
    (data.dividendIncome || 0) * 1.38 + // Gross-up eligible dividends
    (data.capitalGains || 0) * 0.5 + // 50% inclusion
    (data.otherIncome || 0);
  
  // Deductions
  const totalDeductions = Math.min(data.rrspDeduction || 0, config.rrsp.limit) +
    Math.min(data.fhsaDeduction || 0, config.fhsa.annual) +
    (data.childcareExpenses || 0) +
    (data.movingExpenses || 0) +
    (data.unionDues || 0);
  
  const taxableIncome = Math.max(0, totalIncome - totalDeductions);
  
  // Federal Tax
  let federalTax = calculateBracketedTax(taxableIncome, config.federal.brackets);
  
  // Federal Credits
  const fedRate = 0.15;
  let bpa = config.federal.basicPersonalAmount;
  if (taxableIncome > config.federal.bpaReduction.start) {
    const reduction = (taxableIncome - config.federal.bpaReduction.start) / 
      (config.federal.bpaReduction.end - config.federal.bpaReduction.start);
    bpa = bpa - (bpa - config.federal.bpaReduction.minBPA) * Math.min(1, reduction);
  }
  
  const fedCredits = 
    bpa * fedRate +
    Math.min(data.employmentIncome || 0, config.canadaEmploymentCredit) * fedRate +
    Math.min(data.cppContributions || 0, config.cpp.max) * fedRate +
    Math.min(data.eiPremiums || 0, config.ei.max) * fedRate +
    (data.dividendIncome || 0) * 1.38 * 0.150198 + // Dividend tax credit
    calculateDonationCredit(data.donations || 0, taxableIncome) +
    Math.max(0, (data.medicalExpenses || 0) - Math.min(taxableIncome * 0.03, config.medicalThreshold.max)) * fedRate +
    (data.tuitionAmount || 0) * fedRate;
  
  federalTax = Math.max(0, federalTax - fedCredits);
  
  // Quebec abatement
  if (data.province === 'QC') {
    federalTax *= (1 - prov.abatement);
  }
  
  // Provincial Tax
  let provincialTax = calculateBracketedTax(taxableIncome, prov.brackets);
  const provCredits = prov.bpa * prov.brackets[0].rate;
  provincialTax = Math.max(0, provincialTax - provCredits);
  
  // Ontario surtax
  if (data.province === 'ON' && prov.surtax) {
    let surtax = 0;
    if (provincialTax > prov.surtax.first) {
      surtax += (provincialTax - prov.surtax.first) * prov.surtax.firstRate;
    }
    if (provincialTax > prov.surtax.second) {
      surtax += (provincialTax - prov.surtax.second) * prov.surtax.secondRate;
    }
    provincialTax += surtax;
  }
  
  // PEI surtax
  if (data.province === 'PE' && prov.surtax && provincialTax > prov.surtax.threshold) {
    provincialTax += (provincialTax - prov.surtax.threshold) * prov.surtax.rate;
  }
  
  // Health premium (Ontario)
  const healthPremium = data.province === 'ON' ? calculateOntarioHealthPremium(taxableIncome) : 0;
  
  const totalTax = federalTax + provincialTax + healthPremium;
  const totalWithheld = (data.taxWithheld || 0);
  const refundOrOwing = totalWithheld - totalTax;
  
  return {
    totalIncome,
    totalDeductions,
    taxableIncome,
    federalTax,
    provincialTax,
    healthPremium,
    totalTax,
    totalWithheld,
    refundOrOwing,
    isRefund: refundOrOwing >= 0,
    provinceName: prov.name
  };
};

const calculateDonationCredit = (donations, income) => {
  if (donations <= 0) return 0;
  const config = TAX_CONFIG[2024].donations;
  const first = Math.min(donations, config.firstTier) * config.lowRate;
  const rest = Math.max(0, donations - config.firstTier) * config.highRate;
  return first + rest;
};

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Briefcase: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  DollarSign: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  TrendingUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  FileText: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Upload: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  CheckCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ChevronDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  Edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Heart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  PiggyBank: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><path d="M2 9v1c0 1.1.9 2 2 2h1"/><circle cx="16" cy="11" r="1"/></svg>,
  Building: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/></svg>,
  MapPin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  AlertCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Info: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  ArrowRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Zap: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  Clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Target: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Lightbulb: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>,
  GraduationCap: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  Link: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  // Color palette
  colors: {
    primary: '#F5A623',
    primaryHover: '#E09A1F',
    primaryLight: '#FEF6E6',
    secondary: '#4A90D9',
    secondaryLight: '#E8F4FD',
    success: '#2E7D4A',
    successLight: '#E6F4EA',
    warning: '#B86E00',
    warningLight: '#FFF3CD',
    error: '#C53030',
    errorLight: '#FDE8E8',
    white: '#FFFFFF',
    gray50: '#F8F9FA',
    gray100: '#F1F3F5',
    gray200: '#E9ECEF',
    gray300: '#DEE2E6',
    gray400: '#CED4DA',
    gray500: '#ADB5BD',
    gray600: '#868E96',
    gray700: '#495057',
    gray800: '#343A40',
    gray900: '#212529',
    black: '#1A1A1A'
  },
  
  // Component styles as objects for inline use
  app: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F8F9FA',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  
  sidebar: {
    width: '280px',
    background: '#FFFFFF',
    borderRight: '1px solid #E9ECEF',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    height: '100vh',
    zIndex: 100
  },
  
  sidebarHeader: {
    padding: '24px',
    borderBottom: '1px solid #E9ECEF'
  },
  
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  
  logoIcon: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #F5A623, #E09A1F)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '16px',
    boxShadow: '0 2px 8px rgba(245, 166, 35, 0.3)'
  },
  
  logoText: {
    fontFamily: "'Libre Baskerville', Georgia, serif",
    fontSize: '20px',
    fontWeight: 700,
    color: '#212529'
  },
  
  mainContent: {
    flex: 1,
    marginLeft: '280px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  
  header: {
    background: '#FFFFFF',
    padding: '16px 32px',
    borderBottom: '1px solid #E9ECEF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 50
  },
  
  pageTitle: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#212529',
    margin: 0
  },
  
  refundPill: {
    background: '#E6F4EA',
    color: '#2E7D4A',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace"
  },
  
  body: {
    flex: 1,
    padding: '32px',
    maxWidth: '1000px',
    margin: '0 auto',
    width: '100%'
  },
  
  card: {
    background: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    marginBottom: '24px'
  },
  
  cardHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #E9ECEF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  
  cardTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#212529',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0
  },
  
  cardBody: {
    padding: '24px'
  },
  
  heroCard: {
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)',
    borderRadius: '24px',
    padding: '48px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    marginBottom: '24px'
  },
  
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #F5A623, #4A90D9)'
  },
  
  heroLabel: {
    fontSize: '16px',
    color: '#868E96',
    marginBottom: '8px'
  },
  
  heroAmount: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '56px',
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: '16px'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '24px'
  },
  
  statCard: {
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #E9ECEF'
  },
  
  statLabel: {
    fontSize: '14px',
    color: '#868E96',
    marginBottom: '4px'
  },
  
  statValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '24px',
    fontWeight: 700,
    color: '#212529'
  },
  
  formGroup: {
    marginBottom: '20px'
  },
  
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: '#495057',
    marginBottom: '8px'
  },
  
  formInput: {
    width: '100%',
    padding: '12px 16px',
    background: '#FFFFFF',
    border: '2px solid #DEE2E6',
    borderRadius: '8px',
    fontSize: '16px',
    color: '#212529',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box'
  },
  
  formInputFocus: {
    borderColor: '#F5A623',
    boxShadow: '0 0 0 3px rgba(245, 166, 35, 0.2)'
  },
  
  formHint: {
    fontSize: '12px',
    color: '#868E96',
    marginTop: '4px'
  },
  
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  
  formRow3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px'
  },
  
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    fontFamily: 'inherit'
  },
  
  btnPrimary: {
    background: '#F5A623',
    color: '#FFFFFF'
  },
  
  btnPrimaryHover: {
    background: '#E09A1F',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(245, 166, 35, 0.3)'
  },
  
  btnSecondary: {
    background: '#FFFFFF',
    color: '#495057',
    border: '2px solid #DEE2E6'
  },
  
  btnGhost: {
    background: 'transparent',
    color: '#868E96',
    padding: '8px'
  },
  
  btnSm: {
    padding: '8px 16px',
    fontSize: '13px'
  },
  
  btnLg: {
    padding: '16px 32px',
    fontSize: '16px'
  },
  
  btnXl: {
    padding: '20px 48px',
    fontSize: '18px',
    borderRadius: '12px'
  },
  
  alert: {
    padding: '16px 20px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '16px'
  },
  
  alertInfo: {
    background: '#E8F4FD',
    color: '#2B6CB0'
  },
  
  alertSuccess: {
    background: '#E6F4EA',
    color: '#2E7D4A'
  },
  
  alertWarning: {
    background: '#FFF3CD',
    color: '#B86E00'
  },
  
  navSection: {
    marginBottom: '24px'
  },
  
  navSectionTitle: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#ADB5BD',
    padding: '8px 16px',
    marginBottom: '4px'
  },
  
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#495057',
    transition: 'all 0.15s',
    marginBottom: '2px'
  },
  
  navItemHover: {
    background: '#F1F3F5',
    color: '#212529'
  },
  
  navItemActive: {
    background: '#FEF6E6',
    color: '#E09A1F'
  },
  
  slipForm: {
    border: '1px solid #E9ECEF',
    borderRadius: '12px',
    marginBottom: '16px',
    overflow: 'hidden'
  },
  
  slipFormHeader: {
    padding: '16px 20px',
    background: '#F8F9FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer'
  },
  
  slipFormTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: 600,
    color: '#212529'
  },
  
  slipFormBody: {
    padding: '20px',
    borderTop: '1px solid #E9ECEF'
  },
  
  uploadZone: {
    border: '2px dashed #DEE2E6',
    borderRadius: '16px',
    padding: '48px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#F8F9FA'
  },
  
  uploadZoneHover: {
    borderColor: '#F5A623',
    background: '#FEF6E6'
  },
  
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  
  tableCell: {
    padding: '16px',
    borderBottom: '1px solid #E9ECEF',
    fontSize: '14px'
  },
  
  welcomeScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 50%, #FEF6E6 100%)',
    padding: '40px'
  },
  
  welcomeContent: {
    textAlign: 'center',
    maxWidth: '500px'
  },
  
  welcomeLogo: {
    marginBottom: '32px'
  },
  
  welcomeLogoIcon: {
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #F5A623, #E09A1F)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontWeight: 700,
    fontSize: '32px',
    margin: '0 auto 16px',
    boxShadow: '0 8px 32px rgba(245, 166, 35, 0.3)'
  },
  
  welcomeTitle: {
    fontFamily: "'Libre Baskerville', Georgia, serif",
    fontSize: '48px',
    fontWeight: 700,
    color: '#212529',
    margin: 0
  },
  
  welcomeTagline: {
    fontSize: '20px',
    color: '#868E96',
    marginBottom: '40px'
  },
  
  welcomeFeatures: {
    display: 'flex',
    justifyContent: 'center',
    gap: '32px',
    marginBottom: '40px',
    flexWrap: 'wrap'
  },
  
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#495057'
  },
  
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#F8F9FA',
    border: '2px solid #E9ECEF',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginBottom: '8px'
  },
  
  checkboxSelected: {
    background: '#FEF6E6',
    borderColor: '#F5A623'
  },
  
  checkboxBox: {
    width: '20px',
    height: '20px',
    border: '2px solid #CED4DA',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
    flexShrink: 0
  },
  
  checkboxBoxSelected: {
    background: '#F5A623',
    borderColor: '#F5A623',
    color: '#FFFFFF'
  },
  
  radioGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  
  radioItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: '#F8F9FA',
    border: '2px solid #E9ECEF',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontSize: '14px',
    fontWeight: 500
  },
  
  radioItemSelected: {
    background: '#FEF6E6',
    borderColor: '#F5A623'
  },
  
  radioDot: {
    width: '18px',
    height: '18px',
    border: '2px solid #CED4DA',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  radioDotSelected: {
    borderColor: '#F5A623'
  },
  
  radioDotInner: {
    width: '10px',
    height: '10px',
    background: '#F5A623',
    borderRadius: '50%'
  }
};

// ============================================================================
// CONTEXT
// ============================================================================

const AppContext = createContext(null);
const useApp = () => useContext(AppContext);

// ============================================================================
// FORM COMPONENTS
// ============================================================================

const FormInput = ({ label, required, hint, error, prefix, value, onChange, type = 'text', placeholder, ...props }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div style={styles.formGroup}>
      {label && (
        <label style={styles.formLabel}>
          {label}
          {required && <span style={{ color: styles.colors.error, marginLeft: 4 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{ 
            position: 'absolute', 
            left: 16, 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: styles.colors.gray500,
            fontWeight: 500
          }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...styles.formInput,
            ...(focused ? styles.formInputFocus : {}),
            ...(prefix ? { paddingLeft: 36 } : {}),
            ...(error ? { borderColor: styles.colors.error } : {})
          }}
          {...props}
        />
      </div>
      {hint && !error && <div style={styles.formHint}>{hint}</div>}
      {error && <div style={{ ...styles.formHint, color: styles.colors.error }}>{error}</div>}
    </div>
  );
};

const FormSelect = ({ label, required, options, value, onChange, hint }) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div style={styles.formGroup}>
      {label && (
        <label style={styles.formLabel}>
          {label}
          {required && <span style={{ color: styles.colors.error, marginLeft: 4 }}>*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...styles.formInput,
          ...(focused ? styles.formInputFocus : {}),
          cursor: 'pointer'
        }}
      >
        <option value="">Select...</option>
        {options.map(opt => (
          <option key={opt.value || opt.code} value={opt.value || opt.code}>
            {opt.label || opt.name}
          </option>
        ))}
      </select>
      {hint && <div style={styles.formHint}>{hint}</div>}
    </div>
  );
};

const MoneyInput = ({ label, value, onChange, hint, ...props }) => (
  <FormInput
    label={label}
    type="number"
    step="0.01"
    min="0"
    prefix="$"
    value={value || ''}
    onChange={e => onChange(parseFloat(e.target.value) || 0)}
    hint={hint}
    {...props}
  />
);

const SINInput = ({ label, value, onChange }) => {
  const formatSIN = (val) => {
    const digits = (val || '').replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };
  
  return (
    <FormInput
      label={label}
      value={formatSIN(value)}
      onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))}
      placeholder="XXX-XXX-XXX"
      style={{ fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.1em' }}
    />
  );
};

const YesNo = ({ label, value, onChange, hint }) => (
  <div style={styles.formGroup}>
    {label && <label style={styles.formLabel}>{label}</label>}
    <div style={styles.radioGroup}>
      {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(opt => (
        <div
          key={String(opt.v)}
          onClick={() => onChange(opt.v)}
          style={{
            ...styles.radioItem,
            ...(value === opt.v ? styles.radioItemSelected : {})
          }}
        >
          <div style={{
            ...styles.radioDot,
            ...(value === opt.v ? styles.radioDotSelected : {})
          }}>
            {value === opt.v && <div style={styles.radioDotInner} />}
          </div>
          <span>{opt.l}</span>
        </div>
      ))}
    </div>
    {hint && <div style={styles.formHint}>{hint}</div>}
  </div>
);

const Checkbox = ({ label, checked, onChange, description }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      ...styles.checkbox,
      ...(checked ? styles.checkboxSelected : {})
    }}
  >
    <div style={{
      ...styles.checkboxBox,
      ...(checked ? styles.checkboxBoxSelected : {})
    }}>
      {checked && <Icons.Check />}
    </div>
    <div>
      <span style={{ fontWeight: 500 }}>{label}</span>
      {description && <div style={{ fontSize: 12, color: styles.colors.gray600, marginTop: 2 }}>{description}</div>}
    </div>
  </div>
);

// ============================================================================
// UI COMPONENTS
// ============================================================================

const Button = ({ variant = 'primary', size = 'md', children, icon: Icon, onClick, disabled, style: customStyle }) => {
  const [hovered, setHovered] = useState(false);
  
  const baseStyle = styles.btn;
  const variantStyle = variant === 'primary' ? styles.btnPrimary :
                       variant === 'secondary' ? styles.btnSecondary :
                       styles.btnGhost;
  const sizeStyle = size === 'sm' ? styles.btnSm :
                    size === 'lg' ? styles.btnLg :
                    size === 'xl' ? styles.btnXl : {};
  const hoverStyle = hovered && variant === 'primary' ? styles.btnPrimaryHover : {};
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...baseStyle,
        ...variantStyle,
        ...sizeStyle,
        ...hoverStyle,
        ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}),
        ...customStyle
      }}
    >
      {Icon && <span style={{ width: 18, height: 18 }}><Icon /></span>}
      {children}
    </button>
  );
};

const Card = ({ title, icon: Icon, action, children }) => (
  <div style={styles.card}>
    {(title || action) && (
      <div style={styles.cardHeader}>
        {title && (
          <h3 style={styles.cardTitle}>
            {Icon && <span style={{ width: 22, height: 22, color: styles.colors.primary }}><Icon /></span>}
            {title}
          </h3>
        )}
        {action}
      </div>
    )}
    <div style={styles.cardBody}>{children}</div>
  </div>
);

const Alert = ({ type = 'info', children }) => (
  <div style={{
    ...styles.alert,
    ...(type === 'info' ? styles.alertInfo :
        type === 'success' ? styles.alertSuccess :
        styles.alertWarning)
  }}>
    <span style={{ width: 20, height: 20, flexShrink: 0 }}>
      {type === 'info' ? <Icons.Info /> : type === 'success' ? <Icons.CheckCircle /> : <Icons.AlertCircle />}
    </span>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

// ============================================================================
// SCREENS
// ============================================================================

const WelcomeScreen = ({ onStart }) => (
  <div style={styles.welcomeScreen}>
    <div style={styles.welcomeContent}>
      <div style={styles.welcomeLogo}>
        <div style={styles.welcomeLogoIcon}>T$</div>
        <h1 style={styles.welcomeTitle}>TaxSimple</h1>
      </div>
      <p style={styles.welcomeTagline}>Smart, simple tax filing for Canadians</p>
      
      <div style={styles.welcomeFeatures}>
        <div style={styles.featureItem}>
          <span style={{ width: 20, height: 20, color: styles.colors.primary }}><Icons.Zap /></span>
          <span>Takes 15-30 minutes</span>
        </div>
        <div style={styles.featureItem}>
          <span style={{ width: 20, height: 20, color: styles.colors.primary }}><Icons.Shield /></span>
          <span>NETFILE certified</span>
        </div>
        <div style={styles.featureItem}>
          <span style={{ width: 20, height: 20, color: styles.colors.primary }}><Icons.Clock /></span>
          <span>Save anytime</span>
        </div>
      </div>
      
      <Button variant="primary" size="xl" onClick={onStart} icon={Icons.ArrowRight}>
        Start your 2024 tax return
      </Button>
      
      <p style={{ marginTop: 24, fontSize: 14, color: styles.colors.gray600 }}>
        Already have an account? <a href="#" style={{ color: styles.colors.primary, fontWeight: 600 }}>Sign in</a>
      </p>
    </div>
  </div>
);

const DashboardScreen = () => {
  const { state } = useApp();
  const { profile, taxReturn } = state;
  
  const taxSummary = useMemo(() => {
    const employmentIncome = taxReturn.slips
      .filter(s => s.type === 'T4')
      .reduce((sum, s) => sum + (parseFloat(s.boxes?.['14']) || 0), 0);
    
    const taxWithheld = taxReturn.slips
      .filter(s => s.type === 'T4')
      .reduce((sum, s) => sum + (parseFloat(s.boxes?.['22']) || 0), 0);
    
    const cppContributions = taxReturn.slips
      .filter(s => s.type === 'T4')
      .reduce((sum, s) => sum + (parseFloat(s.boxes?.['16']) || 0), 0);
    
    const eiPremiums = taxReturn.slips
      .filter(s => s.type === 'T4')
      .reduce((sum, s) => sum + (parseFloat(s.boxes?.['18']) || 0), 0);
    
    return calculateTax({
      province: profile.province,
      employmentIncome,
      selfEmploymentIncome: taxReturn.otherIncome?.selfEmployment || 0,
      rentalIncome: taxReturn.otherIncome?.rental || 0,
      taxWithheld,
      cppContributions,
      eiPremiums,
      rrspDeduction: taxReturn.deductions?.rrsp || 0,
      fhsaDeduction: taxReturn.deductions?.fhsa || 0,
      donations: taxReturn.credits?.donations || 0,
      medicalExpenses: taxReturn.credits?.medical || 0
    });
  }, [profile, taxReturn]);
  
  return (
    <div>
      {/* Hero */}
      <div style={styles.heroCard}>
        <div style={styles.heroGradient} />
        <div style={styles.heroLabel}>
          {profile.firstName ? `${profile.firstName}'s` : 'Your'} estimated {taxSummary.isRefund ? 'refund' : 'amount owing'}
        </div>
        <div style={{
          ...styles.heroAmount,
          color: taxSummary.isRefund ? styles.colors.success : styles.colors.error
        }}>
          {taxSummary.isRefund ? '' : '-'}{formatCurrency(Math.abs(taxSummary.refundOrOwing), false)}
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 20px',
          background: taxReturn.slips.length > 0 ? styles.colors.successLight : styles.colors.gray100,
          color: taxReturn.slips.length > 0 ? styles.colors.success : styles.colors.gray600,
          borderRadius: 20,
          fontSize: 14,
          fontWeight: 600
        }}>
          <span style={{ width: 18, height: 18 }}><Icons.CheckCircle /></span>
          {taxReturn.slips.length > 0 ? 'Ready to review' : 'Add income to get started'}
        </div>
      </div>
      
      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Income</div>
          <div style={styles.statValue}>{formatCurrency(taxSummary.totalIncome, false)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Deductions</div>
          <div style={styles.statValue}>{formatCurrency(taxSummary.totalDeductions, false)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Tax Withheld</div>
          <div style={styles.statValue}>{formatCurrency(taxSummary.totalWithheld, false)}</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Total Tax</div>
          <div style={styles.statValue}>{formatCurrency(taxSummary.totalTax, false)}</div>
        </div>
      </div>
      
      {/* Tax Breakdown */}
      <Card title="Tax Breakdown" icon={Icons.DollarSign}>
        <table style={styles.table}>
          <tbody>
            <tr>
              <td style={styles.tableCell}>Federal Tax</td>
              <td style={{ ...styles.tableCell, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                {formatCurrency(taxSummary.federalTax)}
              </td>
            </tr>
            <tr>
              <td style={styles.tableCell}>Provincial Tax ({taxSummary.provinceName})</td>
              <td style={{ ...styles.tableCell, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                {formatCurrency(taxSummary.provincialTax)}
              </td>
            </tr>
            {taxSummary.healthPremium > 0 && (
              <tr>
                <td style={styles.tableCell}>Ontario Health Premium</td>
                <td style={{ ...styles.tableCell, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatCurrency(taxSummary.healthPremium)}
                </td>
              </tr>
            )}
            <tr style={{ fontWeight: 700 }}>
              <td style={{ ...styles.tableCell, borderTop: `2px solid ${styles.colors.gray200}` }}>Total Tax</td>
              <td style={{ ...styles.tableCell, borderTop: `2px solid ${styles.colors.gray200}`, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>
                {formatCurrency(taxSummary.totalTax)}
              </td>
            </tr>
            <tr>
              <td style={styles.tableCell}>Tax Already Paid</td>
              <td style={{ ...styles.tableCell, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: styles.colors.success }}>
                -{formatCurrency(taxSummary.totalWithheld)}
              </td>
            </tr>
            <tr style={{ fontWeight: 700, fontSize: 18 }}>
              <td style={styles.tableCell}>{taxSummary.isRefund ? 'Refund' : 'Amount Owing'}</td>
              <td style={{
                ...styles.tableCell,
                textAlign: 'right',
                fontFamily: "'JetBrains Mono', monospace",
                color: taxSummary.isRefund ? styles.colors.success : styles.colors.error
              }}>
                {formatCurrency(Math.abs(taxSummary.refundOrOwing))}
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const ProfileScreen = () => {
  const { state, dispatch } = useApp();
  const { profile } = state;
  
  const update = (field, value) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: { [field]: value } });
  };
  
  return (
    <div>
      <Card title="About You" icon={Icons.User}>
        <div style={styles.formRow}>
          <FormInput
            label="First Name"
            required
            value={profile.firstName}
            onChange={e => update('firstName', e.target.value)}
            placeholder="Enter your first name"
          />
          <FormInput
            label="Last Name"
            required
            value={profile.lastName}
            onChange={e => update('lastName', e.target.value)}
            placeholder="Enter your last name"
          />
        </div>
        
        <div style={styles.formRow}>
          <SINInput
            label="Social Insurance Number (SIN)"
            value={profile.sin}
            onChange={v => update('sin', v)}
          />
          <FormInput
            label="Date of Birth"
            type="date"
            value={profile.dateOfBirth}
            onChange={e => update('dateOfBirth', e.target.value)}
          />
        </div>
        
        <div style={styles.formRow}>
          <FormInput
            label="Email"
            type="email"
            value={profile.email}
            onChange={e => update('email', e.target.value)}
            placeholder="you@example.com"
          />
          <FormInput
            label="Phone"
            type="tel"
            value={profile.phone}
            onChange={e => update('phone', e.target.value)}
            placeholder="(XXX) XXX-XXXX"
          />
        </div>
      </Card>
      
      <Card title="Residency" icon={Icons.MapPin}>
        <FormSelect
          label="Province/territory on December 31, 2024"
          required
          value={profile.province}
          onChange={e => update('province', e.target.value)}
          options={PROVINCES}
          hint="This determines which provincial tax rates apply"
        />
        
        <FormInput
          label="City"
          value={profile.city}
          onChange={e => update('city', e.target.value)}
          placeholder="Toronto"
        />
      </Card>
      
      <Card title="Marital Status" icon={Icons.Users}>
        <FormSelect
          label="Marital status on December 31, 2024"
          value={profile.maritalStatus}
          onChange={e => update('maritalStatus', e.target.value)}
          options={[
            { value: 'single', label: 'Single' },
            { value: 'married', label: 'Married' },
            { value: 'commonlaw', label: 'Common-law' },
            { value: 'divorced', label: 'Divorced' },
            { value: 'separated', label: 'Separated' },
            { value: 'widowed', label: 'Widowed' }
          ]}
        />
      </Card>
    </div>
  );
};

const IncomeScreen = () => {
  const { state, dispatch } = useApp();
  const { taxReturn } = state;
  
  const addT4 = () => {
    const newSlip = {
      id: Date.now(),
      type: 'T4',
      issuer: '',
      source: 'Manual',
      boxes: {}
    };
    dispatch({ type: 'ADD_SLIP', payload: newSlip });
  };
  
  const updateSlip = (id, updates) => {
    dispatch({ type: 'UPDATE_SLIP', payload: { id, ...updates } });
  };
  
  const deleteSlip = (id) => {
    dispatch({ type: 'DELETE_SLIP', payload: id });
  };
  
  const t4Slips = taxReturn.slips.filter(s => s.type === 'T4');
  
  return (
    <div>
      <Card title="Connect to CRA" icon={Icons.Link}>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 16 }}>Auto-fill your return</h4>
            <p style={{ margin: 0, color: styles.colors.gray600, fontSize: 14 }}>
              Connect to the CRA to automatically import your T4, T5, RRSP receipts, and more.
            </p>
          </div>
          <Button variant="primary" icon={Icons.Link}>Connect to CRA</Button>
        </div>
      </Card>
      
      <Card
        title="Employment Income (T4)"
        icon={Icons.Briefcase}
        action={<Button variant="secondary" size="sm" icon={Icons.Plus} onClick={addT4}>Add T4</Button>}
      >
        {t4Slips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: styles.colors.gray500 }}>
            <div style={{ width: 48, height: 48, margin: '0 auto 16px', color: styles.colors.gray400 }}>
              <Icons.FileText />
            </div>
            <p style={{ margin: '0 0 16px' }}>No T4 slips added yet</p>
            <Button variant="secondary" onClick={addT4}>Add your first T4</Button>
          </div>
        ) : (
          t4Slips.map(slip => (
            <T4Form key={slip.id} slip={slip} onUpdate={updateSlip} onDelete={deleteSlip} />
          ))
        )}
      </Card>
      
      <Card title="Other Income" icon={Icons.DollarSign}>
        <MoneyInput
          label="Self-employment income"
          value={taxReturn.otherIncome?.selfEmployment}
          onChange={v => dispatch({ type: 'UPDATE_OTHER_INCOME', payload: { selfEmployment: v } })}
          hint="Net income from business or freelance work"
        />
        <MoneyInput
          label="Rental income"
          value={taxReturn.otherIncome?.rental}
          onChange={v => dispatch({ type: 'UPDATE_OTHER_INCOME', payload: { rental: v } })}
          hint="Net rental income after expenses"
        />
      </Card>
    </div>
  );
};

const T4Form = ({ slip, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  
  const updateBox = (box, value) => {
    onUpdate(slip.id, { boxes: { ...slip.boxes, [box]: value } });
  };
  
  return (
    <div style={styles.slipForm}>
      <div style={styles.slipFormHeader} onClick={() => setExpanded(!expanded)}>
        <div style={styles.slipFormTitle}>
          <span style={{ width: 20, height: 20, color: styles.colors.primary }}><Icons.Briefcase /></span>
          <span>T4 — {slip.issuer || 'New Employer'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(slip.id); }}
            style={{ ...styles.btn, ...styles.btnGhost, padding: 8 }}
          >
            <span style={{ width: 16, height: 16 }}><Icons.Trash /></span>
          </button>
          <span style={{
            width: 20,
            height: 20,
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(180deg)' : 'none'
          }}>
            <Icons.ChevronDown />
          </span>
        </div>
      </div>
      
      {expanded && (
        <div style={styles.slipFormBody}>
          <FormInput
            label="Employer Name (Box 54)"
            value={slip.issuer}
            onChange={e => onUpdate(slip.id, { issuer: e.target.value })}
            placeholder="Company Inc."
          />
          
          <div style={styles.formRow}>
            <MoneyInput
              label="Employment Income (Box 14)"
              value={slip.boxes?.['14']}
              onChange={v => updateBox('14', v)}
            />
            <MoneyInput
              label="Income Tax Deducted (Box 22)"
              value={slip.boxes?.['22']}
              onChange={v => updateBox('22', v)}
            />
          </div>
          
          <div style={styles.formRow3}>
            <MoneyInput
              label="CPP (Box 16)"
              value={slip.boxes?.['16']}
              onChange={v => updateBox('16', v)}
            />
            <MoneyInput
              label="EI (Box 18)"
              value={slip.boxes?.['18']}
              onChange={v => updateBox('18', v)}
            />
            <MoneyInput
              label="RPP (Box 20)"
              value={slip.boxes?.['20']}
              onChange={v => updateBox('20', v)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const DeductionsScreen = () => {
  const { state, dispatch } = useApp();
  const { taxReturn } = state;
  
  const update = (key, value) => {
    dispatch({ type: 'UPDATE_DEDUCTIONS', payload: { [key]: value } });
  };
  
  return (
    <div>
      <Card title="RRSP Contributions" icon={Icons.PiggyBank}>
        <Alert type="info">
          Your 2024 RRSP deduction limit is shown on your Notice of Assessment.
          Contribution deadline: March 3, 2025.
        </Alert>
        
        <MoneyInput
          label="RRSP contributions made"
          value={taxReturn.deductions?.rrsp}
          onChange={v => update('rrsp', v)}
          hint="Contributions from March 2024 to February 2025"
        />
      </Card>
      
      <Card title="FHSA (First Home Savings Account)" icon={Icons.Building}>
        <MoneyInput
          label="FHSA contributions"
          value={taxReturn.deductions?.fhsa}
          onChange={v => update('fhsa', v)}
          hint="Annual limit: $8,000. Lifetime limit: $40,000."
        />
      </Card>
      
      <Card title="Other Deductions" icon={Icons.FileText}>
        <MoneyInput
          label="Childcare expenses"
          value={taxReturn.deductions?.childcare}
          onChange={v => update('childcare', v)}
        />
        <MoneyInput
          label="Moving expenses"
          value={taxReturn.deductions?.moving}
          onChange={v => update('moving', v)}
        />
        <MoneyInput
          label="Union/professional dues"
          value={taxReturn.deductions?.union}
          onChange={v => update('union', v)}
        />
      </Card>
    </div>
  );
};

const CreditsScreen = () => {
  const { state, dispatch } = useApp();
  const { taxReturn } = state;
  
  const update = (key, value) => {
    dispatch({ type: 'UPDATE_CREDITS', payload: { [key]: value } });
  };
  
  return (
    <div>
      <Card title="Charitable Donations" icon={Icons.Heart}>
        <MoneyInput
          label="Total charitable donations"
          value={taxReturn.credits?.donations}
          onChange={v => update('donations', v)}
          hint="15% credit on first $200, 29% on remainder"
        />
      </Card>
      
      <Card title="Medical Expenses" icon={Icons.Heart}>
        <MoneyInput
          label="Total eligible medical expenses"
          value={taxReturn.credits?.medical}
          onChange={v => update('medical', v)}
          hint="Credit for expenses exceeding 3% of net income"
        />
      </Card>
      
      <Card title="Tuition" icon={Icons.GraduationCap}>
        <MoneyInput
          label="Tuition amount"
          value={taxReturn.credits?.tuition}
          onChange={v => update('tuition', v)}
          hint="From T2202 or TL11"
        />
      </Card>
    </div>
  );
};

const DocumentsScreen = () => {
  const { state, dispatch } = useApp();
  const fileInputRef = useRef(null);
  
  const handleUpload = (files) => {
    Array.from(files).forEach(file => {
      const newDoc = {
        id: Date.now() + Math.random(),
        name: file.name,
        status: 'processing'
      };
      dispatch({ type: 'ADD_DOCUMENT', payload: newDoc });
      
      setTimeout(() => {
        dispatch({ type: 'UPDATE_DOCUMENT', payload: { id: newDoc.id, status: 'processed' } });
      }, 2000);
    });
  };
  
  const [dragOver, setDragOver] = useState(false);
  
  return (
    <div>
      <Card title="Upload Documents" icon={Icons.Upload}>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleUpload(e.dataTransfer.files);
          }}
          style={{
            ...styles.uploadZone,
            ...(dragOver ? styles.uploadZoneHover : {})
          }}
        >
          <div style={{ width: 56, height: 56, margin: '0 auto 16px', color: dragOver ? styles.colors.primary : styles.colors.gray400 }}>
            <Icons.Upload />
          </div>
          <div style={{ color: styles.colors.gray600 }}>
            <strong style={{ color: styles.colors.primary }}>Click to upload</strong> or drag and drop<br />
            T4, T5, RRSP receipts, donation receipts
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={e => handleUpload(e.target.files)}
          />
        </div>
      </Card>
      
      {state.taxReturn.documents?.length > 0 && (
        <Card title="Uploaded Documents" icon={Icons.FileText}>
          {state.taxReturn.documents.map(doc => (
            <div key={doc.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              borderBottom: `1px solid ${styles.colors.gray200}`
            }}>
              <span style={{ width: 24, height: 24, color: styles.colors.gray500 }}><Icons.FileText /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{doc.name}</div>
                <div style={{ fontSize: 12, color: styles.colors.gray500 }}>{doc.status}</div>
              </div>
              <span style={{
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                background: doc.status === 'processed' ? styles.colors.successLight : styles.colors.warningLight,
                color: doc.status === 'processed' ? styles.colors.success : styles.colors.warning
              }}>
                {doc.status === 'processed' ? 'Ready' : 'Processing'}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

const ReviewScreen = () => {
  const { state } = useApp();
  const { profile, taxReturn } = state;
  
  const issues = [];
  if (!profile.firstName) issues.push({ type: 'error', msg: 'First name is required' });
  if (!profile.sin) issues.push({ type: 'error', msg: 'SIN is required' });
  if (taxReturn.slips.length === 0) issues.push({ type: 'warning', msg: 'No income slips added' });
  
  return (
    <div>
      <Card title="Review Your Return" icon={Icons.CheckCircle}>
        {issues.length > 0 ? (
          <>
            <Alert type="warning">Please fix the following issues before filing:</Alert>
            {issues.map((issue, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 16,
                background: issue.type === 'error' ? styles.colors.errorLight : styles.colors.warningLight,
                borderRadius: 8,
                marginBottom: 8
              }}>
                <span style={{ width: 20, height: 20, color: issue.type === 'error' ? styles.colors.error : styles.colors.warning }}>
                  <Icons.AlertCircle />
                </span>
                <span style={{ flex: 1 }}>{issue.msg}</span>
                <Button variant="ghost" size="sm">Fix</Button>
              </div>
            ))}
          </>
        ) : (
          <Alert type="success">Your return looks good! You're ready to file.</Alert>
        )}
      </Card>
      
      <Card title="Filing Summary" icon={Icons.Send}>
        <table style={styles.table}>
          <tbody>
            <tr>
              <td style={styles.tableCell}>Tax Year</td>
              <td style={{ ...styles.tableCell, textAlign: 'right' }}>2024</td>
            </tr>
            <tr>
              <td style={styles.tableCell}>Province</td>
              <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                {PROVINCES.find(p => p.code === profile.province)?.name || 'Ontario'}
              </td>
            </tr>
            <tr>
              <td style={styles.tableCell}>Marital Status</td>
              <td style={{ ...styles.tableCell, textAlign: 'right', textTransform: 'capitalize' }}>
                {profile.maritalStatus || 'Single'}
              </td>
            </tr>
          </tbody>
        </table>
        
        <div style={{ marginTop: 24 }}>
          <Button
            variant="primary"
            size="lg"
            icon={Icons.Send}
            disabled={issues.some(i => i.type === 'error')}
          >
            File with NETFILE
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// SIDEBAR
// ============================================================================

const Sidebar = ({ activeSection, onNavigate }) => {
  const { state } = useApp();
  const { profile } = state;
  
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const navSections = [
    {
      title: 'Overview',
      items: [{ id: 'dashboard', icon: Icons.Home, label: 'Dashboard' }]
    },
    {
      title: 'Your Return',
      items: [
        { id: 'profile', icon: Icons.User, label: 'Profile' },
        { id: 'income', icon: Icons.Briefcase, label: 'Income' },
        { id: 'deductions', icon: Icons.PiggyBank, label: 'Deductions' },
        { id: 'credits', icon: Icons.Heart, label: 'Credits' },
        { id: 'documents', icon: Icons.Upload, label: 'Documents' }
      ]
    },
    {
      title: 'Finish',
      items: [{ id: 'review', icon: Icons.CheckCircle, label: 'Review & File' }]
    }
  ];
  
  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>T$</div>
          <span style={styles.logoText}>TaxSimple</span>
        </div>
      </div>
      
      <nav style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        {navSections.map(section => (
          <div key={section.title} style={styles.navSection}>
            <div style={styles.navSectionTitle}>{section.title}</div>
            {section.items.map(item => (
              <div
                key={item.id}
                onClick={() => onNavigate(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  ...styles.navItem,
                  ...(activeSection === item.id ? styles.navItemActive : {}),
                  ...(hoveredItem === item.id && activeSection !== item.id ? styles.navItemHover : {})
                }}
              >
                <span style={{ width: 20, height: 20 }}><item.icon /></span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        ))}
      </nav>
      
      <div style={{
        padding: 16,
        borderTop: `1px solid ${styles.colors.gray200}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          background: styles.colors.primary,
          color: styles.colors.white,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700
        }}>
          {profile.firstName?.[0] || '?'}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{profile.firstName || 'Your Name'}</div>
          <div style={{ fontSize: 12, color: styles.colors.gray500 }}>Tax Year 2024</div>
        </div>
      </div>
    </aside>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================

const initialState = {
  currentScreen: 'welcome',
  profile: {
    firstName: '',
    lastName: '',
    sin: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    city: '',
    province: 'ON',
    maritalStatus: 'single'
  },
  taxReturn: {
    year: 2024,
    slips: [],
    otherIncome: { selfEmployment: 0, rental: 0 },
    deductions: { rrsp: 0, fhsa: 0, childcare: 0, moving: 0, union: 0 },
    credits: { donations: 0, medical: 0, tuition: 0 },
    documents: []
  }
};

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentScreen: action.payload };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'ADD_SLIP':
      return { ...state, taxReturn: { ...state.taxReturn, slips: [...state.taxReturn.slips, action.payload] } };
    case 'UPDATE_SLIP':
      return {
        ...state,
        taxReturn: {
          ...state.taxReturn,
          slips: state.taxReturn.slips.map(s => s.id === action.payload.id ? { ...s, ...action.payload } : s)
        }
      };
    case 'DELETE_SLIP':
      return { ...state, taxReturn: { ...state.taxReturn, slips: state.taxReturn.slips.filter(s => s.id !== action.payload) } };
    case 'UPDATE_OTHER_INCOME':
      return { ...state, taxReturn: { ...state.taxReturn, otherIncome: { ...state.taxReturn.otherIncome, ...action.payload } } };
    case 'UPDATE_DEDUCTIONS':
      return { ...state, taxReturn: { ...state.taxReturn, deductions: { ...state.taxReturn.deductions, ...action.payload } } };
    case 'UPDATE_CREDITS':
      return { ...state, taxReturn: { ...state.taxReturn, credits: { ...state.taxReturn.credits, ...action.payload } } };
    case 'ADD_DOCUMENT':
      return { ...state, taxReturn: { ...state.taxReturn, documents: [...(state.taxReturn.documents || []), action.payload] } };
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        taxReturn: {
          ...state.taxReturn,
          documents: state.taxReturn.documents.map(d => d.id === action.payload.id ? { ...d, ...action.payload } : d)
        }
      };
    default:
      return state;
  }
}

const pageTitles = {
  dashboard: 'Dashboard',
  profile: 'Your Profile',
  income: 'Income',
  deductions: 'Deductions',
  credits: 'Credits',
  documents: 'Documents',
  review: 'Review & File'
};

export default function TaxSimpleApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const navigate = (screen) => dispatch({ type: 'NAVIGATE', payload: screen });
  
  // Calculate refund for header pill
  const refundAmount = useMemo(() => {
    const employmentIncome = state.taxReturn.slips
      .filter(s => s.type === 'T4')
      .reduce((sum, s) => sum + (parseFloat(s.boxes?.['14']) || 0), 0);
    const taxWithheld = state.taxReturn.slips
      .filter(s => s.type === 'T4')
      .reduce((sum, s) => sum + (parseFloat(s.boxes?.['22']) || 0), 0);
    const result = calculateTax({
      province: state.profile.province,
      employmentIncome,
      taxWithheld,
      rrspDeduction: state.taxReturn.deductions?.rrsp || 0
    });
    return result.refundOrOwing;
  }, [state]);
  
  const renderScreen = () => {
    switch (state.currentScreen) {
      case 'welcome': return <WelcomeScreen onStart={() => navigate('dashboard')} />;
      case 'dashboard': return <DashboardScreen />;
      case 'profile': return <ProfileScreen />;
      case 'income': return <IncomeScreen />;
      case 'deductions': return <DeductionsScreen />;
      case 'credits': return <CreditsScreen />;
      case 'documents': return <DocumentsScreen />;
      case 'review': return <ReviewScreen />;
      default: return <DashboardScreen />;
    }
  };
  
  if (state.currentScreen === 'welcome') {
    return (
      <AppContext.Provider value={{ state, dispatch }}>
        {renderScreen()}
      </AppContext.Provider>
    );
  }
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div style={styles.app}>
        <Sidebar activeSection={state.currentScreen} onNavigate={navigate} />
        <main style={styles.mainContent}>
          <header style={styles.header}>
            <h1 style={styles.pageTitle}>{pageTitles[state.currentScreen] || 'Dashboard'}</h1>
            <div style={{
              ...styles.refundPill,
              background: refundAmount >= 0 ? styles.colors.successLight : styles.colors.errorLight,
              color: refundAmount >= 0 ? styles.colors.success : styles.colors.error
            }}>
              Est. {refundAmount >= 0 ? 'Refund' : 'Owing'}: <strong>{formatCurrency(Math.abs(refundAmount), false)}</strong>
            </div>
          </header>
          <div style={styles.body}>
            {renderScreen()}
          </div>
        </main>
      </div>
    </AppContext.Provider>
  );
}
