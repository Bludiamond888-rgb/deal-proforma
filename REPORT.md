# Deal Pro Forma — Report (money input formatting)

**Status:** Implemented + tested + screenshots. **NOT published.** Awaiting Chairman Publish widget.

**Path:** `/workspace/deal-proforma`  
**Live (confirm only — this change not pushed):** https://bludiamond888-rgb.github.io/deal-proforma/

## Fix: money / large number inputs (same bug as Deal Flow)

| Behavior | Detail |
|---|---|
| No leading zeros | While typing / editing |
| Commas on blur | Purchase price `$25,000,000`, rents, opex, taxes, NOI, capex amounts, rentable SF |
| Edit UX | Strip commas on focus; reformat on blur; parse for calc |
| Percentages | Plain (e.g. `5.75`) — no forced grouping |
| Layout | Grid uses `minmax(0,1fr)` so long formatted values don’t clip on iPhone Home Screen |

Helpers: `src/numInput.ts`. Capex amount column uses shared `AmountInput`.

## Screenshots (WebKit 440×956 @3)

- `screens/05a-price-formatted.png` — purchase price after leading-zero type + blur → `$2,000`
- plus existing deal / results / hold / sensitivity / capital / saved / terms / about

## Tests

`npm test` — **17/17** passed.

## Git

Local commit only. **Do not push / do not publish** until Chairman Publish widget.
