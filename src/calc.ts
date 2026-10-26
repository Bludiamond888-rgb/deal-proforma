import type { DealInputs, DealResults } from './types'

/** Standard amortizing mortgage monthly payment (PMT). */
export function monthlyPayment(principal: number, annualRate: number, amortYears: number): number {
  if (principal <= 0 || amortYears <= 0) return 0
  const n = amortYears * 12
  if (annualRate <= 0) return principal / n
  const r = annualRate / 12
  const factor = Math.pow(1 + r, n)
  return (principal * r * factor) / (factor - 1)
}

export function capexTotal(deal: DealInputs): number {
  return deal.capex.reduce((s, c) => s + (Number(c.amount) || 0), 0)
}

export function compute(deal: DealInputs): DealResults {
  const P = deal.purchasePrice || 0
  const U = deal.units || 0
  const sf = deal.rentableSf || 0
  const capex = capexTotal(deal)
  const pct = deal.ltvLtcPct || 0

  const loanAmount =
    deal.financingBasis === 'LTV' ? pct * P : pct * (P + capex)
  const loanCost = (deal.loanCostPct || 0) * loanAmount
  const totalEquity = P - loanAmount + loanCost + capex
  const totalCostBasis = P + capex + loanCost

  const rentMo = (deal.avgRentMonthly || 0) + (deal.rentPremiumMonthly || 0)
  const parkingMo = deal.parkingMonthlyPerUnit || 0
  const grossMoPerUnit = rentMo + parkingMo
  const grossPotentialRentAnnual = rentMo * U * 12
  const parkingAnnual = parkingMo * U * 12
  const otherIncomeAnnual = (deal.otherIncomeAnnualPerUnit || 0) * U
  const vacancyAnnual = -(grossMoPerUnit * (deal.vacancyPct || 0) * U * 12)
  const egi = grossPotentialRentAnnual + parkingAnnual + otherIncomeAnnual + vacancyAnnual

  const taxRate =
    deal.currentAssessment > 0 ? (deal.taxesPayableToday || 0) / deal.currentAssessment : 0
  const futureAssessment = P * (deal.reassessToPctOfPrice || 0)
  const futureTax = futureAssessment * taxRate

  const opexPerUnit =
    (deal.adminPerUnitYr || 0) +
    (deal.payrollPerUnitYr || 0) +
    (deal.utilitiesPerUnitYr || 0) +
    (deal.insurancePerUnitYr || 0) +
    (deal.rmPerUnitYr || 0) +
    (deal.marketingPerUnitYr || 0) +
    (deal.otherOpexPerUnitYr || 0)
  const opexLineTotal = opexPerUnit * U
  const managementFee = (deal.managementFeePctOfEgi || 0) * egi
  const reservesTotal = (deal.reservesPerUnitYr || 0) * U
  const totalExpenses = opexLineTotal + managementFee + futureTax + reservesTotal

  const noi = egi - totalExpenses
  const monthlyDebtService = monthlyPayment(loanAmount, deal.interestRate || 0, deal.amortYears || 0)
  const annualDebtService = monthlyDebtService * 12
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0
  const btcf = noi - annualDebtService
  const expenseRatio = egi > 0 ? totalExpenses / egi : 0

  const proFormaCap = P > 0 ? noi / P : 0
  const historicalCap = P > 0 ? (deal.historicalNoi || 0) / P : 0
  const cashOnCash = totalEquity > 0 ? btcf / totalEquity : 0
  const yieldOnCost = totalCostBasis > 0 ? noi / totalCostBasis : 0
  const debtYield = loanAmount > 0 ? noi / loanAmount : 0
  const marketCap = deal.marketCapRate || 0
  const impliedExit = marketCap > 0 ? noi / marketCap : 0
  const profitPotential = impliedExit - P

  return {
    pricePerUnit: U > 0 ? P / U : 0,
    pricePerSf: sf > 0 ? P / sf : 0,
    capexTotal: capex,
    loanAmount,
    loanCost,
    totalEquity,
    totalCostBasis,
    grossPotentialRentAnnual,
    parkingAnnual,
    otherIncomeAnnual,
    vacancyAnnual,
    egi,
    taxRate,
    futureAssessment,
    futureTax,
    opexLineTotal,
    managementFee,
    reservesTotal,
    totalExpenses,
    noi,
    monthlyDebtService,
    annualDebtService,
    dscr,
    btcf,
    expenseRatio,
    proFormaCap,
    historicalCap,
    cashOnCash,
    yieldOnCost,
    debtYield,
    impliedExit,
    profitPotential,
    warnDscr: annualDebtService > 0 && dscr < 1.2,
    flagCapVsHistorical: proFormaCap < historicalCap && historicalCap > 0,
  }
}

export function money(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function pct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(digits)}%`
}

export function num(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}
