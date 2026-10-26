/** Plain-English BOE glossary for Deal Pro Forma (Tactica-style multifamily terms).
 *  Same shape as Deal Flow’s glossary — expanded to cover every key form input & metric.
 */
export type GlossaryEntry = {
  id: string
  term: string
  text: string
  tip?: string
  group: 'inputs' | 'metrics' | 'flow'
}

export const GLOSSARY: GlossaryEntry[] = [
  // —— Key inputs (property / capital / ops / hold) ——
  {
    id: 'dealName',
    group: 'inputs',
    term: 'Deal name',
    text: 'Your label for this underwriting. Saved deals are listed by this name.',
  },
  {
    id: 'address',
    group: 'inputs',
    term: 'Address / City / State / ZIP',
    text: 'Property location fields for your notes. They do not change the math.',
  },
  {
    id: 'units',
    group: 'inputs',
    term: 'Units',
    text: 'Number of rentable apartments (doors). Scales rent, many per-unit expenses, and price-per-unit.',
  },
  {
    id: 'rentableSf',
    group: 'inputs',
    term: 'Rentable SF',
    text: 'Total rentable square feet. Used only for price-per-SF; income still keys off units and rents.',
  },
  {
    id: 'purchasePrice',
    group: 'inputs',
    term: 'Purchase price',
    text: 'What you expect to pay for the property. Cap rate, equity, loan size, and tax reassessment all start from this number.',
  },
  {
    id: 'ltvLtc',
    group: 'inputs',
    term: 'LTV / LTC',
    text: 'How the loan is sized. LTV (loan-to-value) = % × purchase price. LTC (loan-to-cost) = % × (price + capex) — common for bridge / value-add that funds renovations.',
    tip: 'On LTV, capex is equity-funded. On LTC, the lender can fund part of capex via a larger loan.',
  },
  {
    id: 'ltvPct',
    group: 'inputs',
    term: 'LTV / LTC %',
    text: 'The loan as a percent of the chosen basis (price, or price + capex). Higher % means less cash down and more debt service.',
  },
  {
    id: 'interestRate',
    group: 'inputs',
    term: 'Interest rate %',
    text: 'Annual interest rate on the loan. Together with amortization it sets monthly debt service (fully amortizing PMT).',
  },
  {
    id: 'amortYears',
    group: 'inputs',
    term: 'Amort years',
    text: 'Amortization schedule length in years (e.g. 25 or 30). Longer amort lowers monthly payment and raises DSCR, all else equal.',
  },
  {
    id: 'loanCostPct',
    group: 'inputs',
    term: 'Loan cost %',
    text: 'Origination / lender fees as a percent of the loan amount. Added to equity required at close in this BOE.',
  },
  {
    id: 'capexInput',
    group: 'inputs',
    term: 'Capex lines',
    text: 'Upfront capital items (working capital, carpet, paint, signage, etc.). Summed into total capex, cost basis, and equity.',
  },
  {
    id: 'avgRent',
    group: 'inputs',
    term: 'Avg rent / unit / mo',
    text: 'Average in-place (or underwritten) monthly rent per unit. Annual GPR uses rent + rent premium.',
  },
  {
    id: 'rentPremium',
    group: 'inputs',
    term: 'Rent premium / mo',
    text: 'Extra monthly rent you believe you can get (mark-to-market, renovations, etc.) on top of average rent.',
    tip: 'Only underwrite premium you can support with comps.',
  },
  {
    id: 'parkingMo',
    group: 'inputs',
    term: 'Parking / unit / mo',
    text: 'Monthly parking income per unit, annualized across all units.',
  },
  {
    id: 'otherIncYr',
    group: 'inputs',
    term: 'Other income / unit / yr',
    text: 'Annual per-unit fees and misc income (laundry, pets, storage, and so on).',
  },
  {
    id: 'vacancy',
    group: 'inputs',
    term: 'Vacancy %',
    text: 'Allowance for empty units and uncollected rent (credit loss). Applied to rent + premium + parking before EGI.',
  },
  {
    id: 'opexPerUnit',
    group: 'inputs',
    term: 'Expenses ($ / unit / yr)',
    text: 'Per-unit annual operating lines: admin, payroll, utilities, insurance, R&M, marketing, other opex. Replace placeholders with T-12 actuals.',
  },
  {
    id: 'reserves',
    group: 'inputs',
    term: 'Reserves / unit / yr',
    text: 'Replacement reserves set aside each year for capital items (roof, HVAC, etc.). Counted in OpEx in this BOE.',
  },
  {
    id: 'mgmtFee',
    group: 'inputs',
    term: 'Mgmt fee % of EGI',
    text: 'Property management fee as a percent of effective gross income. Dollar fee flexes when EGI changes.',
  },
  {
    id: 'currentAssessment',
    group: 'inputs',
    term: 'Current assessment',
    text: 'County assessed value used today. With taxes payable, it implies the effective tax rate.',
  },
  {
    id: 'taxesToday',
    group: 'inputs',
    term: 'Taxes payable today',
    text: 'Current annual property tax bill. Implied tax rate = taxes ÷ current assessment.',
  },
  {
    id: 'reassessPct',
    group: 'inputs',
    term: 'Reassess % of price',
    text: 'How much of purchase price the assessor is assumed to use after sale (often 100%). Future tax = (price × this %) × implied tax rate.',
    tip: 'Some states do not reassess on sale — set this to match local practice.',
  },
  {
    id: 'marketCap',
    group: 'inputs',
    term: 'Market cap rate %',
    text: 'Going-in / market capitalization rate from comps. Used for implied exit value (NOI ÷ market cap) as a gut check.',
  },
  {
    id: 'historicalNoi',
    group: 'inputs',
    term: 'Historical NOI',
    text: 'Trailing or in-place NOI used as a reference. Historical cap = historical NOI ÷ price; compared to pro forma cap.',
  },
  {
    id: 'holdYears',
    group: 'inputs',
    term: 'Hold years',
    text: 'How many years you keep the deal in this BOE. IRR and equity multiple assume Year-1 BTCF each year, then an exit.',
  },
  {
    id: 'residualCap',
    group: 'inputs',
    term: 'Residual cap %',
    text: 'Exit capitalization rate: gross sale ≈ NOI ÷ residual cap. Defaults to market cap in the sample.',
    tip: 'A higher residual cap means a lower sale price.',
  },
  {
    id: 'saleCostPct',
    group: 'inputs',
    term: 'Sale cost %',
    text: 'Brokerage and closing costs as a percent of gross sale. Net sale = gross sale × (1 − this %).',
  },

  // —— Metrics / results ——
  {
    id: 'pricePerUnit',
    group: 'metrics',
    term: 'Price / unit',
    text: 'Purchase price ÷ units. Quick comps screen for multifamily deals.',
  },
  {
    id: 'pricePerSf',
    group: 'metrics',
    term: 'Price / SF',
    text: 'Purchase price ÷ rentable SF.',
  },
  {
    id: 'loanAmount',
    group: 'metrics',
    term: 'Loan amount',
    text: 'Sized loan: LTV% × price, or LTC% × (price + capex).',
  },
  {
    id: 'loanCost',
    group: 'metrics',
    term: 'Loan cost $',
    text: 'Loan amount × loan cost %. Cash fee at close.',
  },
  {
    id: 'totalEquity',
    group: 'metrics',
    term: 'Total equity',
    text: 'Cash the buyer must bring: price − loan + loan cost + capex. Denominator for cash-on-cash and equity multiple.',
  },
  {
    id: 'totalCostBasis',
    group: 'metrics',
    term: 'Total cost basis',
    text: 'Price + capex + loan cost. What you invested in the asset before looking at income (yield on cost uses this).',
  },
  {
    id: 'ads',
    group: 'metrics',
    term: 'Annual debt service',
    text: '12 × monthly fully amortizing P&I payment on the loan.',
  },
  {
    id: 'capRate',
    group: 'metrics',
    term: 'Pro forma cap rate',
    text: 'NOI ÷ purchase price. Unlevered yield if you bought all-cash at this price on the underwritten NOI.',
  },
  {
    id: 'historicalCap',
    group: 'metrics',
    term: 'Historical cap',
    text: 'Historical NOI ÷ purchase price. Compared to pro forma cap as a sanity check.',
  },
  {
    id: 'coc',
    group: 'metrics',
    term: 'CoC (Cash-on-Cash)',
    text: 'Before-tax cash flow ÷ total equity. How much cash the deal throws off each year relative to cash in.',
  },
  {
    id: 'yoc',
    group: 'metrics',
    term: 'Yield on Cost (YoC)',
    text: 'NOI ÷ total cost basis (price + capex + loan costs). Compares income to what you actually spent to own the asset.',
  },
  {
    id: 'dscr',
    group: 'metrics',
    term: 'DSCR',
    text: 'Debt service coverage ratio: NOI ÷ annual debt service. Lenders often want ~1.20x or higher; below that the loan is tight.',
    tip: 'This app warns when DSCR falls under 1.20x.',
  },
  {
    id: 'debtYield',
    group: 'metrics',
    term: 'Debt yield',
    text: 'NOI ÷ loan amount. A lender screen that ignores interest rate: higher means more income supporting the loan.',
  },
  {
    id: 'expenseRatio',
    group: 'metrics',
    term: 'Expense ratio',
    text: 'Total operating expenses ÷ EGI. Shows how much of collected income is eaten by OpEx (often ~35–50% on multifamily).',
  },
  {
    id: 'impliedExit',
    group: 'metrics',
    term: 'Implied exit',
    text: 'Estimated value at the market cap: NOI ÷ market cap rate (before sale costs). A BOE gut check, not a full appraisal.',
  },
  {
    id: 'profitPotential',
    group: 'metrics',
    term: 'Profit potential',
    text: 'Implied exit − purchase price. Rough upside if the market prices your pro forma NOI at the market cap.',
  },
  {
    id: 'irr',
    group: 'metrics',
    term: 'IRR (levered)',
    text: 'Internal rate of return on equity cash flows over the hold: cash in at close, annual BTCF, then BTCF plus equity reversion at sale.',
    tip: 'This BOE holds Year-1 BTCF flat (no rent growth or expense inflation).',
  },
  {
    id: 'em',
    group: 'metrics',
    term: 'Equity Multiple',
    text: 'Total cash returned to equity (Σ BTCF over the hold + equity reversion) ÷ equity invested. 2.0x means you doubled your cash.',
  },
  {
    id: 'grossSale',
    group: 'metrics',
    term: 'Gross sale',
    text: 'Exit sale price before costs: NOI ÷ residual cap.',
  },
  {
    id: 'netSale',
    group: 'metrics',
    term: 'Net sale',
    text: 'Gross sale minus sale costs.',
  },
  {
    id: 'loanBalanceExit',
    group: 'metrics',
    term: 'Loan balance at exit',
    text: 'Remaining principal after holdYears × 12 amortizing payments. Paid off from sale proceeds.',
  },
  {
    id: 'reversion',
    group: 'metrics',
    term: 'Equity reversion',
    text: 'What equity receives at sale: net sale − loan balance. Added to the final year’s cash flow for IRR.',
  },
  {
    id: 'taxRate',
    group: 'metrics',
    term: 'Implied tax rate',
    text: 'Taxes payable today ÷ current assessment. Applied to the future (reassessed) assessment.',
  },
  {
    id: 'futureTax',
    group: 'metrics',
    term: 'Future tax',
    text: 'Pro forma property tax after reassessment: future assessment × implied tax rate. Used in OpEx instead of today’s bill.',
  },

  // —— Income & cash flow lines ——
  {
    id: 'gpr',
    group: 'flow',
    term: 'Gross Potential Rent (GPR)',
    text: 'Rent if every unit were occupied at underwritten rents for a full year: (avg rent + premium) × units × 12. Top of the income stack.',
  },
  {
    id: 'parking',
    group: 'flow',
    term: 'Parking income',
    text: 'Parking / unit / mo × units × 12.',
  },
  {
    id: 'otherInc',
    group: 'flow',
    term: 'Other income',
    text: 'Other income / unit / yr × units.',
  },
  {
    id: 'vacancyLoss',
    group: 'flow',
    term: 'Vacancy / loss',
    text: 'Dollar haircut for empty units and bad debt on rent + premium + parking.',
  },
  {
    id: 'egi',
    group: 'flow',
    term: 'Effective Gross Income (EGI)',
    text: 'Collected income after vacancy: GPR + parking + other − vacancy loss.',
  },
  {
    id: 'opex',
    group: 'flow',
    term: 'Operating expenses (OpEx)',
    text: 'Cost to run the asset: per-unit lines + management fee + future property tax + reserves.',
  },
  {
    id: 'noi',
    group: 'flow',
    term: 'NOI (Net Operating Income)',
    text: 'EGI minus operating expenses. Property income before debt. Cap rate and many lender metrics hang off NOI.',
  },
  {
    id: 'debt',
    group: 'flow',
    term: 'Debt service',
    text: 'Annual principal and interest (ADS). Subtracted from NOI to get cash flow.',
  },
  {
    id: 'btcf',
    group: 'flow',
    term: 'BTCF / CFADS',
    text: 'Before-tax cash flow (cash flow after debt service): NOI − annual debt service. Cash left for equity before income taxes.',
  },
  {
    id: 'capex',
    group: 'flow',
    term: 'Capex (total)',
    text: 'Sum of capex lines. Added to cost basis and equity at close; on LTC it also enlarges the loan basis.',
  },
]

export const GLOSSARY_GROUPS: { id: GlossaryEntry['group']; title: string }[] = [
  { id: 'inputs', title: 'Key inputs' },
  { id: 'metrics', title: 'Metrics' },
  { id: 'flow', title: 'Income & cash flow' },
]
