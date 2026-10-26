# Deal Pro Forma v1.1 — Report (hold-period IRR)

**Status:** IRR added + tested + screenshots. **NOT published.** Awaiting Chairman Publish widget.

**Path:** `/workspace/deal-proforma`  
**Later (do not start yet):** Earnings Flow–styled second app — reference at `/workspace/earnings-flow`

## Hold-period IRR (simple BOE)

| Input | Default |
|-------|---------|
| Hold years | 5 |
| Residual cap rate | 5.25% (= market cap) |
| Sale cost % | 3% |

**Assumptions documented in UI:** annual BTCF held constant at Year-1 BTCF (no rent growth / expense inflation).

| Step | Formula |
|------|---------|
| Gross sale | `NOI / residual_cap_rate` |
| Net sale | `gross_sale × (1 − sale_cost_pct)` |
| Loan payoff | remaining amortizing balance after `hold_years × 12` months |
| Equity reversion | `net_sale − loan_balance` |
| Cash flows | `[-equity, BTCF, …, BTCF + reversion]` |
| Levered IRR | Newton + bisection root of NPV = 0 |
| Equity multiple | `(BTCF × hold + reversion) / total_equity` |

## Demo deal sample (111 First Street)

- BTCF (Y1, constant): **~$948,827**
- Gross sale: **~$41,439,709** · Sale costs: **~$1,243,191** · Net sale: **~$40,196,517**
- Loan balance @ yr 5: **~$14,560,916**
- Equity reversion: **~$25,635,601**
- **Levered IRR: ~29.98%**
- **Equity multiple: ~3.29x**
- CFs: `[-9,222,500, 948,827 ×4, 26,584,429]`

## Screenshots (WebKit 440×956 @3)

- `/workspace/deal-proforma/screens/01-deal-top.png` — dash shows IRR
- `/workspace/deal-proforma/screens/02-results.png`
- `/workspace/deal-proforma/screens/03-hold-irr.png` — hold inputs + IRR / EM
- `/workspace/deal-proforma/screens/04-sensitivity.png`
- `/workspace/deal-proforma/screens/05-capital-ltc.png`
- `/workspace/deal-proforma/screens/06-saved-empty.png`
- `/workspace/deal-proforma/screens/07-saved-list.png`
- `/workspace/deal-proforma/screens/08-about.png`

## Tests

`npm test` — **16/16** passed (incl. remaining balance iterative match, classic IRR, demo hold IRR/EM).

## Git

Local commits only — **no push / no publish.**
