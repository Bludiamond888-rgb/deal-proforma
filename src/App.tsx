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
import { GLOSSARY, GLOSSARY_GROUPS } from './glossary'
import {
  sanitizeDraft,
  parseDraft,
  toEditDraft,
  formatGrouped,
  type NumFormat,
} from './numInput'

type Tab = 'deal' | 'saved' | 'glossary' | 'about'

function Field({
  label,
  value,
  onChange,
  locked,
  prefix,
  suffix,
  type = 'number',
  format = 'number',
}: {
  label: string
  value: string | number
  onChange?: (v: number | string) => void
  locked?: boolean
  prefix?: string
  suffix?: string
  type?: 'number' | 'text'
  format?: NumFormat
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  if (type === 'text') {
    return (
      <label className={`field${locked ? ' locked' : ''}`}>
        {label}
        <span className="fin">
          {prefix ? <span className="affix">{prefix}</span> : null}
          <input
            type="text"
            value={String(value ?? '')}
            readOnly={locked}
            onChange={(e) => {
              if (locked || !onChange) return
              onChange(e.target.value)
            }}
          />
          {suffix ? <span className="affix">{suffix}</span> : null}
        </span>
      </label>
    )
  }

  const numVal = typeof value === 'number' ? value : Number(value)
  const safe = Number.isFinite(numVal) ? numVal : 0
  const shown = editing ? draft : formatGrouped(safe, format)

  return (
    <label className={`field${locked ? ' locked' : ''}`}>
      {label}
      <span className="fin">
        {prefix ? <span className="affix">{prefix}</span> : null}
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          value={shown}
          readOnly={locked}
          onFocus={(e) => {
            if (locked) return
            setEditing(true)
            setDraft(toEditDraft(safe, true))
            requestAnimationFrame(() => e.target.select())
          }}
          onBlur={() => {
            if (locked) return
            setEditing(false)
            const n = parseDraft(draft)
            onChange?.(n)
            setDraft('')
          }}
          onChange={(e) => {
            if (locked || !onChange) return
            const next = sanitizeDraft(e.target.value, true)
            setDraft(next)
            onChange(parseDraft(next))
          }}
        />
        {suffix ? <span className="affix">{suffix}</span> : null}
      </span>
    </label>
  )
}

function AmountInput({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const safe = Number.isFinite(value) ? value : 0
  const shown = editing ? draft : formatGrouped(safe, 'money')
  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      enterKeyHint="done"
      aria-label="Amount"
      value={shown}
      onFocus={(e) => {
        setEditing(true)
        setDraft(toEditDraft(safe, true))
        requestAnimationFrame(() => e.target.select())
      }}
      onBlur={() => {
        setEditing(false)
        onChange(parseDraft(draft))
        setDraft('')
      }}
      onChange={(e) => {
        const next = sanitizeDraft(e.target.value, true)
        setDraft(next)
        onChange(parseDraft(next))
      }}
    />
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
            <div className="k">IRR</div>
            <div className="v">{Number.isFinite(r.leveredIrr) ? pct(r.leveredIrr) : '—'}</div>
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
                <Field label="Units" format="number" value={deal.units} onChange={(v) => patch('units', Number(v))} />
                <Field label="Rentable SF" format="number" value={deal.rentableSf} onChange={(v) => patch('rentableSf', Number(v))} />
              </div>
              <div className="out-row"><span className="lab">Price / unit</span><span className="val">{money(r.pricePerUnit)}</span></div>
              <div className="out-row"><span className="lab">Price / SF</span><span className="val">{money(r.pricePerSf, 2)}</span></div>
            </section>

            <section className="card">
              <h2>Capital stack</h2>
              <div className="grid one">
                <Field label="Purchase price" format="money" prefix="$" value={deal.purchasePrice} onChange={(v) => patch('purchasePrice', Number(v))} />
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
                  label={`${deal.financingBasis} %`} format="percent"
                  value={pctInput(deal.ltvLtcPct)}
                  onChange={(v) => patch('ltvLtcPct', fromPctInput(Number(v)))}
                />
                <Field
                  label="Interest rate %" format="percent"
                  value={pctInput(deal.interestRate)}
                  onChange={(v) => patch('interestRate', fromPctInput(Number(v)))}
                />
                <Field label="Amort years" format="number" value={deal.amortYears} onChange={(v) => patch('amortYears', Number(v))} />
                <Field
                  label="Loan cost %" format="percent"
                  value={pctInput(deal.loanCostPct)}
                  onChange={(v) => patch('loanCostPct', fromPctInput(Number(v)))}
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
                    <AmountInput
                      value={c.amount}
                      onChange={(n) => {
                        const next = [...deal.capex]
                        next[i] = { ...c, amount: n }
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
                <Field label="Avg rent / unit / mo" format="money" prefix="$" value={deal.avgRentMonthly} onChange={(v) => patch('avgRentMonthly', Number(v))} />
                <Field label="Rent premium / mo" format="money" value={deal.rentPremiumMonthly} onChange={(v) => patch('rentPremiumMonthly', Number(v))} />
                <Field label="Parking / unit / mo" format="money" value={deal.parkingMonthlyPerUnit} onChange={(v) => patch('parkingMonthlyPerUnit', Number(v))} />
                <Field label="Other income / unit / yr" format="money" value={deal.otherIncomeAnnualPerUnit} onChange={(v) => patch('otherIncomeAnnualPerUnit', Number(v))} />
                <Field
                  label="Vacancy %" format="percent"
                  value={pctInput(deal.vacancyPct)}
                  onChange={(v) => patch('vacancyPct', fromPctInput(Number(v)))}
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
                <Field label="Admin" format="money" value={deal.adminPerUnitYr} onChange={(v) => patch('adminPerUnitYr', Number(v))} />
                <Field label="Payroll" format="money" value={deal.payrollPerUnitYr} onChange={(v) => patch('payrollPerUnitYr', Number(v))} />
                <Field label="Utilities" format="money" value={deal.utilitiesPerUnitYr} onChange={(v) => patch('utilitiesPerUnitYr', Number(v))} />
                <Field label="Insurance" format="money" value={deal.insurancePerUnitYr} onChange={(v) => patch('insurancePerUnitYr', Number(v))} />
                <Field label="R&M" format="money" value={deal.rmPerUnitYr} onChange={(v) => patch('rmPerUnitYr', Number(v))} />
                <Field label="Marketing" format="money" value={deal.marketingPerUnitYr} onChange={(v) => patch('marketingPerUnitYr', Number(v))} />
                <Field label="Other opex" format="money" value={deal.otherOpexPerUnitYr} onChange={(v) => patch('otherOpexPerUnitYr', Number(v))} />
                <Field label="Reserves" format="money" value={deal.reservesPerUnitYr} onChange={(v) => patch('reservesPerUnitYr', Number(v))} />
                <Field
                  label="Mgmt fee % of EGI" format="percent"
                  value={pctInput(deal.managementFeePctOfEgi)}
                  onChange={(v) => patch('managementFeePctOfEgi', fromPctInput(Number(v)))}
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
                <Field label="Current assessment" format="money" prefix="$" value={deal.currentAssessment} onChange={(v) => patch('currentAssessment', Number(v))} />
                <Field label="Taxes payable today" format="money" prefix="$" value={deal.taxesPayableToday} onChange={(v) => patch('taxesPayableToday', Number(v))} />
                <Field
                  label="Reassess % of price" format="percent"
                  value={pctInput(deal.reassessToPctOfPrice)}
                  onChange={(v) => patch('reassessToPctOfPrice', fromPctInput(Number(v)))}
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
                  label="Market cap rate %" format="percent"
                  value={pctInput(deal.marketCapRate)}
                  onChange={(v) => patch('marketCapRate', fromPctInput(Number(v)))}
                />
                <Field
                  label="Historical NOI" format="money" prefix="$"
                  value={deal.historicalNoi}
                  onChange={(v) => patch('historicalNoi', Number(v))}
                />
              </div>
              <div className="out-row emph"><span className="lab">Implied exit</span><span className="val">{money(r.impliedExit)}</span></div>
              <div className="out-row"><span className="lab">Profit potential</span><span className="val">{money(r.profitPotential)}</span></div>
            </section>


            <section className="card" data-testid="hold">
              <h2>Hold period / IRR</h2>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--mute)', lineHeight: 1.4 }}>
                Simple BOE: annual BTCF held constant at Year-1 BTCF for each hold year (no rent growth / expense inflation).
              </p>
              <div className="grid">
                <Field label="Hold years" format="number" value={deal.holdYears} onChange={(v) => patch('holdYears', Math.max(0, Math.floor(Number(v))))} />
                <Field
                  label="Residual cap %" format="percent"
                  value={pctInput(deal.residualCapRate)}
                  onChange={(v) => patch('residualCapRate', fromPctInput(Number(v)))}
                />
                <Field
                  label="Sale cost %" format="percent"
                  value={pctInput(deal.saleCostPct)}
                  onChange={(v) => patch('saleCostPct', fromPctInput(Number(v)))}
                />
              </div>
              <div className="out-row"><span className="lab">Gross sale (NOI ÷ residual)</span><span className="val">{money(r.grossSale)}</span></div>
              <div className="out-row"><span className="lab">Sale costs</span><span className="val">{money(r.saleCosts)}</span></div>
              <div className="out-row"><span className="lab">Net sale</span><span className="val">{money(r.netSale)}</span></div>
              <div className="out-row"><span className="lab">Loan balance at exit</span><span className="val">{money(r.loanBalanceAtExit)}</span></div>
              <div className="out-row emph"><span className="lab">Equity reversion</span><span className="val">{money(r.equityReversion)}</span></div>
              <div className="out-row emph"><span className="lab">Levered IRR</span><span className="val">{Number.isFinite(r.leveredIrr) ? pct(r.leveredIrr) : '—'}</span></div>
              <div className="out-row"><span className="lab">Equity multiple</span><span className="val">{Number.isFinite(r.equityMultiple) ? `${r.equityMultiple.toFixed(2)}x` : '—'}</span></div>
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

        {tab === 'glossary' && (
          <section className="about" data-testid="glossary">
            <h2 className="section-title">Terms</h2>
            <p className="fine">
              Plain-English definitions for every key input, return metric, and income / cash-flow line in
              this back-of-envelope (BOE).
            </p>
            <div className="glossary">
              {GLOSSARY_GROUPS.map((g) => (
                <section key={g.id} className="glossary-group">
                  <h3>{g.title}</h3>
                  {GLOSSARY.filter((e) => e.group === g.id).map((e) => (
                    <article key={e.id} className="g-item">
                      <b>{e.term}</b>
                      <p>{e.text}</p>
                      {e.tip ? <p className="tip">{e.tip}</p> : null}
                    </article>
                  ))}
                </section>
              ))}
            </div>
          </section>
        )}

        {tab === 'about' && (
          <section className="card about" data-testid="about">
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
              Hold IRR: constant Year-1 BTCF each year; gross sale = NOI / residual cap; equity reversion = net sale − loan balance;
              levered IRR on [−equity, …BTCF…, BTCF+reversion]; equity multiple = (Σ BTCF + reversion) / equity.
            </p>
            <p>
              Open the <strong>Terms</strong> tab for plain-English definitions of every key input and metric.
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

      <nav className="tabs" data-testid="tabs">
        <button type="button" className={tab === 'deal' ? 'on' : ''} onClick={() => go('deal')}>
          <span className="ic">▦</span>Deal
        </button>
        <button type="button" className={tab === 'saved' ? 'on' : ''} onClick={() => go('saved')}>
          <span className="ic">▤</span>Saved
        </button>
        <button type="button" className={tab === 'glossary' ? 'on' : ''} onClick={() => go('glossary')}>
          <span className="ic">☰</span>Terms
        </button>
        <button type="button" className={tab === 'about' ? 'on' : ''} onClick={() => go('about')}>
          <span className="ic">ⓘ</span>About
        </button>
      </nav>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
