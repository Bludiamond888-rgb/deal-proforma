import { describe, expect, it } from 'vitest'
import { compute, monthlyPayment, capexTotal } from './calc'
import { DEMO_DEAL } from './demo'
import type { DealInputs } from './types'

describe('monthlyPayment', () => {
  it('amortizes standard mortgage', () => {
    // 16.25M @ 5.75% / 25yr
    const m = monthlyPayment(16_250_000, 0.0575, 25)
    expect(m).toBeCloseTo(102_229.79, 0)
    expect(m * 12).toBeCloseTo(1_226_757.48, 0)
  })
  it('handles zero rate', () => {
    expect(monthlyPayment(1200, 0, 1)).toBe(100)
  })
})

describe('demo deal BOE', () => {
  const r = compute(DEMO_DEAL)

  it('sums capex list', () => {
    expect(capexTotal(DEMO_DEAL)).toBe(310_000)
    expect(r.capexTotal).toBe(310_000)
  })

  it('prices / unit and / SF', () => {
    expect(r.pricePerUnit).toBe(125_000)
    expect(r.pricePerSf).toBeCloseTo(142.857, 2)
  })

  it('LTV loan, fees, equity, cost basis', () => {
    expect(r.loanAmount).toBe(16_250_000)
    expect(r.loanCost).toBe(162_500)
    // equity = P - loan + loan_cost + capex
    expect(r.totalEquity).toBe(25_000_000 - 16_250_000 + 162_500 + 310_000)
    expect(r.totalEquity).toBe(9_222_500)
    expect(r.totalCostBasis).toBe(25_000_000 + 310_000 + 162_500)
  })

  it('LTC finances price + capex', () => {
    const ltc: DealInputs = { ...DEMO_DEAL, financingBasis: 'LTC' }
    const x = compute(ltc)
    expect(x.loanAmount).toBeCloseTo(0.65 * (25_000_000 + 310_000), 4)
  })

  it('builds EGI with vacancy as negative', () => {
    // rent+premium = 1225; +parking 40 = 1265/u/mo
    expect(r.grossPotentialRentAnnual).toBe(1225 * 200 * 12)
    expect(r.parkingAnnual).toBe(40 * 200 * 12)
    expect(r.otherIncomeAnnual).toBe(50 * 200)
    expect(r.vacancyAnnual).toBeCloseTo(-(1265 * 0.055 * 200 * 12), 4)
    expect(r.egi).toBeCloseTo(2_879_020, 0)
  })

  it('reassesses property tax into ops', () => {
    expect(r.taxRate).toBeCloseTo(465_000 / 23_567_000, 8)
    expect(r.futureAssessment).toBe(25_000_000)
    expect(r.futureTax).toBeCloseTo(25_000_000 * (465_000 / 23_567_000), 2)
  })

  it('NOI, DSCR, BTCF, returns', () => {
    expect(r.noi).toBeCloseTo(2_175_584.71, 0)
    expect(r.annualDebtService).toBeCloseTo(1_226_757.48, 0)
    expect(r.dscr).toBeGreaterThan(1.7)
    expect(r.btcf).toBeCloseTo(r.noi - r.annualDebtService, 2)
    expect(r.proFormaCap).toBeCloseTo(r.noi / 25_000_000, 6)
    expect(r.cashOnCash).toBeCloseTo(r.btcf / 9_222_500, 6)
    expect(r.yieldOnCost).toBeCloseTo(r.noi / 25_472_500, 6)
    expect(r.impliedExit).toBeCloseTo(r.noi / 0.0525, 0)
    expect(r.profitPotential).toBeCloseTo(r.impliedExit - 25_000_000, 0)
  })

  it('alerts', () => {
    expect(r.warnDscr).toBe(false)
    expect(r.flagCapVsHistorical).toBe(false) // pro forma cap > historical 1.3M/25M
    const weak = compute({ ...DEMO_DEAL, interestRate: 0.12, ltvLtcPct: 0.8, avgRentMonthly: 400, rentPremiumMonthly: 0, parkingMonthlyPerUnit: 0 })
    expect(weak.warnDscr).toBe(true)
  })
})
