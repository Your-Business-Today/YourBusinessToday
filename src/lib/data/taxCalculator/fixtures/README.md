# Take-home and tax fixtures

Hand-worked cases for the take-home and tax engine, one JSON file per tax year the engine holds. They are plain data so that any engine — this one in TypeScript, or a future iOS app — can run the same file and must agree with every figure in it. `takeHomeFixtures.test.ts` runs them in CI.

| File | Tax year | Cases |
|---|---|---|
| `taxYear2025To2026.json` | 2025/26 (6 April 2025 to 5 April 2026) | 59 |
| `taxYear2026To2027.json` | 2026/27 (6 April 2026 to 5 April 2027) | 59 |

A new tax year gets a file of its own, with at least 40 cases, before the engine offers it: the test fails when the engine knows a year that has no file.

## The shape of a file

- `taxYear` — the year every case in the file is worked for.
- `defaultInputs` — the full set of inputs a case starts from: nobody employed or trading, nothing claimed, no pension, no student loan, England, Wales and Northern Ireland.
- `cases` — each with:
  - `name` — what the case shows, in a sentence.
  - `inputs` — only what differs from `defaultInputs`. `studentLoans` and `selfEmployment` are merged field by field into the defaults; every other field replaces its default.
  - `working` — the case worked by hand, a line per step, in the order a person would do it on paper.
  - `expected` — every figure the engine must give, in pounds to the penny.

## What `expected` holds

| Field | Meaning |
|---|---|
| `personalAllowance` | The allowance used, after the taper above £100,000 of adjusted net income |
| `taxableIncome` | Income after the allowance |
| `incomeTax` | Income tax for the year |
| `class1`, `class4` | National Insurance on pay and on profit |
| `studentLoans` | Each repayment, undergraduate plan first, then postgraduate |
| `pensionCost` | What the pension costs the person after relief |
| `takeHome` | Pay and profit less tax, National Insurance, student loans and pension |
| `profit`, `usesTradingAllowance` | The trade's profit (a loss is negative) and whether the £1,000 trading allowance beat the claims; `null` with no trade |
| `selfAssessment` | Income tax, Class 4 and student loan left for the return, CIS already deducted, the balance (negative is a refund) and the outcome (`taxDue`, `refund` or `loss`); `null` with no trade |
| `paymentsOnAccount` | Each of the two payments on account, or `null` when none is due (under £1,000, or 80% or more collected at source) |
| `class2` | `creditedAutomatically`, `belowSmallProfitsThreshold` or `tradingLoss`; `null` with no trade |

## What the cases cover

Every income tax band edge in England, Wales and Northern Ireland and in Scotland; the allowance taper, including the pound that keeps it and the pound that loses it; the Class 1 and Class 4 limits; each student loan plan and the postgraduate loan; workplace pensions and relief at source; the trading allowance against expenses, mileage and working from home; CIS refunds, balances and losses; payments on account at the £1,000 line and the 80% line; and a job beside a trade. Limited company marginal relief is not in the engine yet, so it has no cases.
