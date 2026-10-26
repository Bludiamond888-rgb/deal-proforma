# Deal Pro Forma v1 — Report

**Status:** Built + tested + screenshots. **NOT published.** Stopped for Chairman Publish widget.

**Path:** `/workspace/deal-proforma`  
**App name:** Deal Pro Forma  
**Credit (More/About):** Methodology inspired by public Tactica RES tutorials (Ike Hoffman).

## How to use

1. Open the Deal tab (default loads the video sample: 111 First Street, St Paul, MN).
2. Edit Property → Capital stack (LTV/LTC toggle) → Capex lines → Revenue → Expenses → Tax reassess.
3. Sticky navy dashboard shows live NOI, DSCR, CoC, Cap.
4. Results card: BTCF, YoC, debt yield, implied exit @ market cap, profit potential.
5. Sensitivity: slide price (±20%) or vacancy (0–15%); optionally Apply to deal.
6. Save deal locally; open/delete from Saved tab. Reset (↺) restores sample.
7. Add to iPhone Home Screen for standalone PWA (offline via service worker).

## Formulas (exact)

| Metric | Formula |
|--------|---------|
| Loan | LTV: `pct × P` · LTC: `pct × (P + CapexTotal)` |
| Loan cost | `loan_cost_pct × loan_amount` |
| Total equity | `P − loan + loan_cost + CapexTotal` |
| Total cost basis | `P + Capex + loan_cost` |
| ADS | `PMT(r/12, years×12, loan) × 12` |
| Vacancy | `−(rent+premium+parking) × vacancy% × units × 12` |
| EGI | `annualize(rent+premium+parking) + other_income_annual + vacancy` |
| Tax rate | `taxes_payable / current_assessment` |
| Future tax | `P × reassess% × tax_rate` |
| NOI | `EGI − (line opex + mgmt%×EGI + future tax + reserves)` |
| DSCR | `NOI / ADS` · BTCF = `NOI − ADS` |
| Cap / CoC / YoC | `NOI/P` · `BTCF/equity` · `NOI/cost_basis` |
| Exit / profit | `NOI / market_cap` · `exit − P` |

**Alerts:** DSCR &lt; 1.20 warn; pro forma cap &lt; historical cap flag.

## Demo deal computed (video defaults)

With listed defaults (most per-unit opex lines = 0 as specified):

- Capex total: **$310,000**
- Loan (65% LTV): **$16,250,000** · Loan cost: **$162,500** · Equity: **$9,222,500**
- EGI: **$2,879,020** · Future tax: **~$493,274**
- **NOI: ~$2,175,585** · ADS: **~$1,226,757** · DSCR: **~1.77x** · BTCF: **~$948,827**
- Cap: **~8.70%** · CoC: **~10.29%** · YoC: **~8.54%**
- Implied exit @ 5.25%: **~$41.44M** · Profit potential: **~$16.44M**

Note: Analyst “sanity ~1.7M NOI / ~6.8% cap” assumes fuller opex fill than the listed defaults (payroll/utilities/insurance/R&M/marketing/other = 0). Formulas and inputs match the authoritative brief exactly; fill expense lines to target a lower NOI.

## Screenshots (WebKit 440×956 @3)

- `/workspace/deal-proforma/screens/01-deal-top.png` — Property + capital + sticky dash
- `/workspace/deal-proforma/screens/02-results.png` — Results metrics
- `/workspace/deal-proforma/screens/03-sensitivity.png` — Sensitivity
- `/workspace/deal-proforma/screens/04-capital-ltc.png` — LTC toggle
- `/workspace/deal-proforma/screens/05-saved-empty.png` — Saved empty
- `/workspace/deal-proforma/screens/06-saved-list.png` — Saved list
- `/workspace/deal-proforma/screens/07-about.png` — About / credit

## Tests

`npm test` — 10/10 passed (PMT, LTV/LTC, EGI/vacancy, tax reassess, returns, alerts).

## Local commit

See git log in repo. **No push** — awaiting Chairman screenshots + Publish widget.
