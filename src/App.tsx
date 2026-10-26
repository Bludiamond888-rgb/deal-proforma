import { useEffect, useMemo, useState } from 'react'
import { compute, money, pct, num } from './calc'
import { DEMO_DEAL, uid } from './demo'
import {
  deleteSaved,
  listSaved,
  loadLast,
  resetDemo,
  saveLast,
  saveNamed,
  type SavedDeal,
} from './storage'
import type { CapexItem, DealInputs, FinancingBasis } from './types'

type Tab = 'deal' | 'saved' | 'more'

function Field({
  label,
  value,
  onChange,
  step,
  locked,
  prefix,
  suffix,
  type = 'number',
}: {
  label: string
  value: string | number
  onChange?: (v: number | string) => void
  step?: string
  locked?: boolean
  prefix?: string
  suffix?: string
  type?: 'number' | 'text'
}) {
  return (
    <label className={`field${locked ? ' locked' : ''}`}>
      {label}
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {prefix ? <span style={{ color: 'var(--mute)', fontWeight: 700 }}>{prefix}</span> : null}
        <input
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          step={step ?? (type === 'number' ? 'any' : undefined)}
          value={value}
          readOnly={locked}
          onChange={(e) => {
            if (locked || !onChange) return
            if (type === 'text') onChange(e.target.value)
            else {
              const n = e.target.value === '' ? 0 : Number(e.target.value)
              if (!Number.isNaN(n)) onChange(n)
            }
          }}
        />
        {suffix ? <span style={{ color: 'var(--mute)', fontWeight: 700 }}>{suffix}</span> : null}
      </span>
    </label>
  )
}

function pctInput(raw: number): number {
  return Math.round(raw * 10000) / 100
}
function fromPctInput(v: number): number {
  return v / 100
}

export default function App() {
  const [tab, setTab] = useState<Tab>('deal')
  const [deal, setDeal] = useState<DealInputs>(() =>
    typeof localStorage !== 'undefined' ? loadLast() : structuredClone(DEMO_DEAL),
  )
  const [saved, setSaved] = useState<SavedDeal[]>(() =>
    typeof localStorage !== 'undefined' ? listSaved() : [],
  )
  const [toast, setToast] = useState<string | null>(null)
  const [sensPrice, setSensPrice] = useState<number | null>(null)
  const [sensVac, setSensVac] = useState<number | null>(null)
  const [saveId, setSaveId] = useState<string | undefined>()

  useEffect(() => {
    saveLast(deal)
  }, [deal])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const working: DealInputs = useMemo(() => {
    const d = { ...deal }
    if (sensPrice != null) d.purchasePrice = sensPrice
    if (sensVac != null) d.vacancyPct = sensVac
    return d
  }, [deal, sensPrice, sensVac])

  const r = useMemo(() => compute(working), [working])

  const patch = <K extends keyof DealInputs>(key: K, value: DealInputs[K]) => {
    setDeal((d) => ({ ...d, [key]: value }))
    if (key === 'purchasePrice') setSensPrice(null)
    if (key === 'vacancyPct') setSensVac(null)
  }

  const setCapex = (items: CapexItem[]) => patch('capex', items.slice(0, 10))

  const go = (t: Tab) => {
    setTab(t)
    window.scrollTo(0, 0)
  }

  return (
    <div className="app">
      <header className="top">
        <div className="top-in">
          <div className="icon-btn" aria-hidden>▦</div>
          <h1>{deal.name || 'Deal Pro Forma'}</h1>
          <button
            className="icon-btn"
            title="Reset sample"
            onClick={() => {
              setDeal(resetDemo())
              setSensPrice(null)
              setSensVac(null)
              setSaveId(undefined)
              setToast('Sample deal restored')
              go('deal')
            }}
          >
            ↺
          </button>
        </div>
      </header>

      {tab === 'deal' && (
        <div className="dash" data-testid="dash">
          <div>
            <div className="k">NOI</div>
            <div className="v">{money(r.noi)}</div>
          </div>
          <div>
            <div className="k">DSCR</div>
            <div className={`v${r.warnDscr ? ' warn' : ' ok'}`}>{r.dscr ? r.dscr.toFixed(2) + 'x' : '—'}</div>
          </div>
          <div>
            <div className="k">CoC</div>
            <div className="v">{pct(r.cashOnCash)}</div>
          </div>
          <div>
            <div className="k">Cap</div>
            <div className="v">{pct(r.proFormaCap)}</div>
          </div>
        </div>
      )}

      <main className="content" style={tab !== 'deal' ? { paddingTop: 'calc(env(safe-area-inset-top) + var(--head) + 14px)' } : undefined}>
        {tab === 'deal' && (
          <>
            {r.warnDscr && (
              <div className="alert warn">DSCR below 1.20x — lender coverage looks thin at these terms.</div>
            )}
            {r.flagCapVsHistorical && (
              <div className="alert flag">
                Pro forma cap ({pct(r.proFormaCap)}) is below historical cap ({pct(r.historicalCap)}).
              </div>
            )}

            <section className="card">
              <h2>Property</h2>
              <div className="grid one">
                <Field label="Deal name" type="text" value={deal.name} onChange={(v) => patch('name', String(v))} />
                <Field label="Address" type="text" value={deal.address} onChange={(v) => patch('address', String(v))} />
              </div>
              <div className="grid three" style={{ marginTop: 10 }}>
                <Field label="City" type="text" value={deal.city} onChange={(v) => patch('city', String(v))} />
                <Field label="State" type="text" value={deal.state} onChange={(v) => patch('state', String(v))} />
                <Field label="ZIP" type="text" value={deal.zip} onChange={(v) => patch('zip', String(v))} />
              </div>
              <div className="grid" style={{ marginTop: 10 }}>
                <Field label="Units" value={deal.units} onChange={(v) => patch('units', Number(v))} />
                <Field label="Rentable SF" value={deal.rentableSf} onChange={(v) => patch('rentableSf', Number(v))} />
              </div>
              <div className="out-row"><span className="lab">Price / unit</span><span className="val">{money(r.pricePerUnit)}</span></div>
              <div className="out-row"><span className="lab">Price / SF</span><span className="val">{money(r.pricePerSf, 2)}</span></div>
            </section>

            <section className="card">
              <h2>Capital stack</h2>
              <div className="grid one">
                <Field label="Purchase price" value={deal.purchasePrice} onChange={(v) => patch('purchasePrice', Number(v))} />
              </div>
              <div style={{ margin: '12px 0 8px' }}>
                <div className="seg" role="group" aria-label="Financing basis">
                  {(['LTV', 'LTC'] as FinancingBasis[]).map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={deal.financingBasis === b ? 'on' : ''}
                      onClick={() => patch('financingBasis', b)}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid">
                <Field
                  label={`${deal.financingBasis} %`}
                  value={pctInput(deal.ltvLtcPct)}
                  onChange={(v) => patch('ltvLtcPct', fromPctInput(Number(v)))}
                  step="0.1"
                />
                <Field
                  label="Interest rate %"
                  value={pctInput(deal.interestRate)}
                  onChange={(v) => patch('interestRate', fromPctInput(Number(v)))}
                  step="0.01"
                />
                <Field label="Amort years" value={deal.amortYears} onChange={(v) => patch('amortYears', Number(v))} />
                <Field
                  label="Loan cost %"
                  value={pctInput(deal.loanCostPct)}
                  onChange={(v) => patch('loanCostPct', fromPctInput(Number(v)))}
                  step="0.01"
                />
              </div>
              <div className="out-row"><span className="lab">Loan amount</span><span className="val">{money(r.loanAmount)}</span></div>
              <div className="out-row"><span className="lab">Loan cost</span><span className="val">{money(r.loanCost)}</span></div>
              <div className="out-row emph"><span className="lab">Total equity</span><span className="val">{money(r.totalEquity)}</span></div>
              <div className="out-row"><span className="lab">Total cost basis</span><span className="val">{money(r.totalCostBasis)}</span></div>
              <div className="out-row"><span className="lab">Annual debt service</span><span className="val">{money(r.annualDebtService)}</span></div>
            </section>

            <section className="card">
              <h2>
                Capex
                <span className="chip">{money(r.capexTotal)}</span>
              </h2>
              <div className="capex-list">
                {deal.capex.map((c, i) => (
                  <div className="capex-row" key={c.id}>
                    <input
                      value={c.label}
                      placeholder="Item"
                      onChange={(e) => {
                        const next = [...deal.capex]
                        next[i] = { ...c, label: e.target.value }
                        setCapex(next)
                      }}
                    />
                    <input
                      type="number"
                      inputMode="decimal"
                      value={c.amount}
                      onChange={(e) => {
                        const next = [...deal.capex]
                        next[i] = { ...c, amount: Number(e.target.value) || 0 }
                        setCapex(next)
                      }}
                    />
                    <button
                      type="button"
                      className="x"
                      aria-label="Remove"
                      onClick={() => setCapex(deal.capex.filter((x) => x.id !== c.id))}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="add-line"
                disabled={deal.capex.length >= 10}
                onClick={() => setCapex([...deal.capex, { id: uid(), label: '', amount: 0 }])}
              >
                + Add capex line
              </button>
              <p style={{ margin: '10px 0 0', fontSize: 13, color: 'var(--mute)' }}>
                {deal.financingBasis === 'LTC'
                  ? 'LTC: loan sized on price + capex.'
                  : 'LTV: loan sized on price only — capex is equity-funded.'}
              </p>
            </section>

            <section className="card">
              <h2>Revenue</h2>
              <div className="grid">
                <Field label="Avg rent / unit / mo" value={deal.avgRentMonthly} onChange={(v) => patch('avgRentMonthly', Number(v))} />
                <Field label="Rent premium / mo" value={deal.rentPremiumMonthly} onChange={(v) => patch('rentPremiumMonthly', Number(v))} />
                <Field label="Parking / unit / mo" value={deal.parkingMonthlyPerUnit} onChange={(v) => patch('parkingMonthlyPerUnit', Number(v))} />
                <Field label="Other income / unit / yr" value={deal.otherIncomeAnnualPerUnit} onChange={(v) => patch('otherIncomeAnnualPerUnit', Number(v))} />
                <Field
                  label="Vacancy %"
                  value={pctInput(deal.vacancyPct)}
                  onChange={(v) => patch('vacancyPct', fromPctInput(Number(v)))}
                  step="0.1"
                />
              </div>
              <div className="out-row"><span className="lab">Gross potential rent</span><span className="val">{money(r.grossPotentialRentAnnual)}</span></div>
              <div className="out-row"><span className="lab">Parking income</span><span className="val">{money(r.parkingAnnual)}</span></div>
              <div className="out-row"><span className="lab">Other income</span><span className="val">{money(r.otherIncomeAnnual)}</span></div>
              <div className="out-row"><span className="lab">Vacancy / loss</span><span className="val">{money(r.vacancyAnnual)}</span></div>
              <div className="out-row emph"><span className="lab">EGI</span><span className="val">{money(r.egi)}</span></div>
            </section>

            <section className="card">
              <h2>Expenses ($ / unit / yr)</h2>
              <div className="grid">
                <Field label="Admin" value={deal.adminPerUnitYr} onChange={(v) => patch('adminPerUnitYr', Number(v))} />
                <Field label="Payroll" value={deal.payrollPerUnitYr} onChange={(v) => patch('payrollPerUnitYr', Number(v))} />
                <Field label="Utilities" value={deal.utilitiesPerUnitYr} onChange={(v) => patch('utilitiesPerUnitYr', Number(v))} />
                <Field label="Insurance" value={deal.insurancePerUnitYr} onChange={(v) => patch('insurancePerUnitYr', Number(v))} />
                <Field label="R&M" value={deal.rmPerUnitYr} onChange={(v) => patch('rmPerUnitYr', Number(v))} />
                <Field label="Marketing" value={deal.marketingPerUnitYr} onChange={(v) => patch('marketingPerUnitYr', Number(v))} />
                <Field label="Other opex" value={deal.otherOpexPerUnitYr} onChange={(v) => patch('otherOpexPerUnitYr', Number(v))} />
                <Field label="Reserves" value={deal.reservesPerUnitYr} onChange={(v) => patch('reservesPerUnitYr', Number(v))} />
                <Field
                  label="Mgmt fee % of EGI"
                  value={pctInput(deal.managementFeePctOfEgi)}
                  onChange={(v) => patch('managementFeePctOfEgi', fromPctInput(Number(v)))}
                  step="0.1"
                />
              </div>
              <div className="out-row"><span className="lab">Line-item opex</span><span className="val">{money(r.opexLineTotal)}</span></div>
              <div className="out-row"><span className="lab">Management fee</span><span className="val">{money(r.managementFee)}</span></div>
              <div className="out-row"><span className="lab">Reserves</span><span className="val">{money(r.reservesTotal)}</span></div>
              <div className="out-row"><span className="lab">Property tax (pro forma)</span><span className="val">{money(r.futureTax)}</span></div>
              <div className="out-row emph"><span className="lab">Total expenses</span><span className="val">{money(r.totalExpenses)}</span></div>
            </section>

            <section className="card">
              <h2>Property tax reassess</h2>
              <div className="grid">
                <Field label="Current assessment" value={deal.currentAssessment} onChange={(v) => patch('currentAssessment', Number(v))} />
                <Field label="Taxes payable today" value={deal.taxesPayableToday} onChange={(v) => patch('taxesPayableToday', Number(v))} />
                <Field
                  label="Reassess % of price"
                  value={pctInput(deal.reassessToPctOfPrice)}
                  onChange={(v) => patch('reassessToPctOfPrice', fromPctInput(Number(v)))}
                  step="1"
                />
              </div>
              <div className="out-row"><span className="lab">Implied tax rate</span><span className="val">{pct(r.taxRate, 3)}</span></div>
              <div className="out-row"><span className="lab">Future assessment</span><span className="val">{money(r.futureAssessment)}</span></div>
              <div className="out-row emph"><span className="lab">Future tax</span><span className="val">{money(r.futureTax)}</span></div>
              <div className="out-row"><span className="lab">Future tax / unit</span><span className="val">{money(deal.units ? r.futureTax / deal.units : 0)}</span></div>
            </section>

            <section className="card" data-testid="results">
              <h2>Results</h2>
              <div className="out-row emph"><span className="lab">NOI</span><span className="val">{money(r.noi)}</span></div>
              <div className={`out-row${r.warnDscr ? ' warn' : ''}`}><span className="lab">DSCR</span><span className="val">{r.dscr ? `${r.dscr.toFixed(2)}x` : '—'}</span></div>
              <div className="out-row"><span className="lab">BTCF (CFADS)</span><span className="val">{money(r.btcf)}</span></div>
              <div className="out-row"><span className="lab">Expense ratio</span><span className="val">{pct(r.expenseRatio)}</span></div>
              <div className="out-row"><span className="lab">Pro forma cap rate</span><span className="val">{pct(r.proFormaCap)}</span></div>
              <div className="out-row"><span className="lab">Historical NOI (ref)</span><span className="val">{money(deal.historicalNoi)}</span></div>
              <div className="out-row"><span className="lab">Historical cap</span><span className="val">{pct(r.historicalCap)}</span></div>
              <div className="out-row emph"><span className="lab">Cash-on-cash</span><span className="val">{pct(r.cashOnCash)}</span></div>
              <div className="out-row"><span className="lab">Yield on cost</span><span className="val">{pct(r.yieldOnCost)}</span></div>
              <div className="out-row"><span className="lab">Debt yield</span><span className="val">{pct(r.debtYield)}</span></div>
              <div className="grid" style={{ marginTop: 10 }}>
                <Field
                  label="Market cap rate %"
                  value={pctInput(deal.marketCapRate)}
                  onChange={(v) => patch('marketCapRate', fromPctInput(Number(v)))}
                  step="0.05"
                />
                <Field
                  label="Historical NOI"
                  value={deal.historicalNoi}
                  onChange={(v) => patch('historicalNoi', Number(v))}
                />
              </div>
              <div className="out-row emph"><span className="lab">Implied exit</span><span className="val">{money(r.impliedExit)}</span></div>
              <div className="out-row"><span className="lab">Profit potential</span><span className="val">{money(r.profitPotential)}</span></div>
            </section>

            <section className="card">
              <h2>Sensitivity</h2>
              <div className="slider-row">
                <label className="field">
                  Purchase price
                  <input
                    type="range"
                    min={Math.round(deal.purchasePrice * 0.8)}
                    max={Math.round(deal.purchasePrice * 1.2 || 1)}
                    step={50_000}
                    value={sensPrice ?? deal.purchasePrice}
                    onChange={(e) => setSensPrice(Number(e.target.value))}
                  />
                </label>
                <div className="slider-meta">
                  <span>{money(Math.round(deal.purchasePrice * 0.8))}</span>
                  <strong>{money(sensPrice ?? deal.purchasePrice)}</strong>
                  <span>{money(Math.round(deal.purchasePrice * 1.2))}</span>
                </div>
              </div>
              <div className="slider-row" style={{ marginTop: 14 }}>
                <label className="field">
                  Vacancy %
                  <input
                    type="range"
                    min={0}
                    max={15}
                    step={0.5}
                    value={pctInput(sensVac ?? deal.vacancyPct)}
                    onChange={(e) => setSensVac(fromPctInput(Number(e.target.value)))}
                  />
                </label>
                <div className="slider-meta">
                  <span>0%</span>
                  <strong>{pct(sensVac ?? deal.vacancyPct, 1)}</strong>
                  <span>15%</span>
                </div>
              </div>
              <div className="out-row" style={{ marginTop: 8 }}><span className="lab">Live CoC</span><span className="val">{pct(r.cashOnCash)}</span></div>
              <div className="out-row"><span className="lab">Live cap</span><span className="val">{pct(r.proFormaCap)}</span></div>
              <div className="out-row"><span className="lab">Live DSCR</span><span className="val">{r.dscr ? `${r.dscr.toFixed(2)}x` : '—'}</span></div>
              {(sensPrice != null || sensVac != null) && (
                <button
                  type="button"
                  className="btn"
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    if (sensPrice != null) patch('purchasePrice', sensPrice)
                    if (sensVac != null) patch('vacancyPct', sensVac)
                    setSensPrice(null)
                    setSensVac(null)
                    setToast('Sensitivity applied to deal')
                  }}
                >
                  Apply to deal inputs
                </button>
              )}
            </section>

            <div className="actions">
              <button
                type="button"
                className="btn primary"
                onClick={() => {
                  const entry = saveNamed(deal, saveId)
                  setSaveId(entry.id)
                  setSaved(listSaved())
                  setToast('Deal saved locally')
                }}
              >
                Save deal
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setDeal(resetDemo())
                  setSensPrice(null)
                  setSensVac(null)
                  setSaveId(undefined)
                  setToast('Reset to sample')
                }}
              >
                Reset to sample
              </button>
            </div>
          </>
        )}

        {tab === 'saved' && (
          <section className="card">
            <h2>Saved deals</h2>
            {saved.length === 0 ? (
              <p style={{ color: 'var(--mute)', margin: 0 }}>No saved deals yet. Save from the Deal tab.</p>
            ) : (
              <ul className="saved">
                {saved.map((s) => (
                  <li key={s.id}>
                    <div className="grow">
                      <b>{s.deal.name || 'Untitled'}</b>
                      <small>
                        {s.deal.address || '—'} · {num(s.deal.units)} units · {money(s.deal.purchasePrice)}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="open"
                      onClick={() => {
                        setDeal(structuredClone(s.deal))
                        setSaveId(s.id)
                        setSensPrice(null)
                        setSensVac(null)
                        go('deal')
                      }}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="del"
                      onClick={() => {
                        deleteSaved(s.id)
                        setSaved(listSaved())
                        if (saveId === s.id) setSaveId(undefined)
                      }}
                    >
                      Del
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'more' && (
          <section className="card about">
            <h2>About</h2>
            <p>
              <strong>Deal Pro Forma</strong> is a one-page multifamily back-of-the-envelope underwriting
              screener for Chairman. Enter property, capital stack, capex, revenue, expenses, and tax
              reassessment — returns update live.
            </p>
            <p>
              Methodology inspired by public Tactica RES tutorials (Ike Hoffman). This app is an original
              UI and formula implementation of that investor workflow — not a copy of Tactica Excel files
              or branding.
            </p>
            <p>
              Data stays on this device (localStorage). Offline-capable PWA for Home Screen use.
            </p>
            <p>
              Formulas: loan = LTV%×Price or LTC%×(Price+Capex); equity = Price − Loan + LoanCost + Capex;
              ADS = PMT×12; EGI = rents − vacancy + other; NOI = EGI − expenses (incl. mgmt%×EGI + future tax + reserves);
              CoC = BTCF / equity; Cap = NOI / Price; YoC = NOI / cost basis; Exit = NOI / market cap.
            </p>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setDeal(resetDemo())
                setToast('Sample loaded')
                go('deal')
              }}
            >
              Load sample deal
            </button>
          </section>
        )}
      </main>

      <nav className="tabs">
        <button type="button" className={tab === 'deal' ? 'on' : ''} onClick={() => go('deal')}>
          <span className="ic">☰</span>Deal
        </button>
        <button type="button" className={tab === 'saved' ? 'on' : ''} onClick={() => go('saved')}>
          <span className="ic">▤</span>Saved
        </button>
        <button type="button" className={tab === 'more' ? 'on' : ''} onClick={() => go('more')}>
          <span className="ic">⋯</span>More
        </button>
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
