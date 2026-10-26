# Deal Pro Forma v1.2 — Report (Terms glossary tab)

**Status:** Terms tab added + tested + screenshots. **NOT published.** Awaiting Chairman Publish widget.

**Path:** `/workspace/deal-proforma`  
**Live (confirm only — this change not pushed):** https://bludiamond888-rgb.github.io/deal-proforma/

## Terms tab (Definitions / glossary)

Matches sibling **Deal Flow** naming/UX:

| | |
|---|---|
| Tab id | `glossary` |
| Tab label | **Terms** (☰) |
| Bottom nav | Deal · Saved · Terms · About (More renamed About) |
| Data | `src/glossary.ts` — same `GlossaryEntry` / `GLOSSARY_GROUPS` shape as Deal Flow |
| Groups | Key inputs · Metrics · Income & cash flow |
| Style | `.glossary` / `.g-item` / `.tip` cards (plain English + optional tip callouts) |

Covers every key form input and return metric (Tactica BOE style): LTV/LTC, vacancy, EGI, NOI, DSCR, CoC, YoC, debt yield, hold IRR, equity multiple, tax reassessment, etc.

## Screenshots (WebKit 440×956 @3)

- `/workspace/deal-proforma/screens/01-deal-top.png` — 4-tab bar visible
- `/workspace/deal-proforma/screens/02-results.png`
- `/workspace/deal-proforma/screens/03-hold-irr.png`
- `/workspace/deal-proforma/screens/04-sensitivity.png`
- `/workspace/deal-proforma/screens/05-capital-ltc.png`
- `/workspace/deal-proforma/screens/06-saved-empty.png`
- `/workspace/deal-proforma/screens/07-saved-list.png`
- `/workspace/deal-proforma/screens/08-terms-top.png` — Terms / Key inputs
- `/workspace/deal-proforma/screens/09-terms-metrics.png` — scrolled glossary
- `/workspace/deal-proforma/screens/10-about.png` — About points to Terms

## Tests

`npm test` — **16/16** passed.

## Git

Local commit only — **no push / no publish.**
