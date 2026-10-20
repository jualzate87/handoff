import { Fragment, useMemo, useState } from 'react'
import { ChevronRight } from '@design-systems/icons'
import { useSyncedReviewState } from '../../hooks/useSyncedReviewState'
import {
  computeEffectiveTaxRate,
  computeLiveReturn,
  formatEffectiveTaxRate,
  MARGINAL_RATE,
  type LiveAmounts,
  type LiveReturnTotals,
} from '../../data/liveReturn'
import { getFieldOrigin } from '../../data/fieldOrigins'
import { PRIOR_YEAR_1040_VALUES } from '../data-review/priorYear1040Data'
import styles from '../../styles/check-return/FederalSummaryTable.module.css'

const CURRENT_YEAR = '2025'
const PRIOR_YEAR = '2024'

const PRIOR = PRIOR_YEAR_1040_VALUES
/** 2024 total tax less line 16 tax: the NIIT and other taxes on last year's return. */
const PRIOR_OTHER_TAXES = PRIOR.totalTax - PRIOR.incomeTax
const PRIOR_ESTIMATED_PAYMENTS = PRIOR.estimatedPayments

type Breakdown = { label: string; amount: number; prior: number }

/**
 * Prior-year amounts for the components behind each line, so an expanded row
 * compares year over year the same way its parent does. Keyed by the component
 * label the breakdown renders; each set sums to that line's 2024 total in
 * PRIOR_YEAR_1040_VALUES.
 */
const PRIOR_COMPONENTS: Record<string, number> = {
  // Line 1a — only Tech Circle flowed to the return last year too.
  'Tech Circle Inc (W-2) · Box 1': PRIOR.wages,
  'Bing Equipment Co. (W-2) · Box 1': 0,
  // Line 2b — 2,740 across the same three payers.
  'Unwavering Financial (1099-INT) · Box 1': 1_180,
  'Harborline Credit Union (1099-INT) · Box 1': 980,
  'Cascade Federal Savings (1099-INT) · Box 1': 580,
  // Line 3b — 219,850 across the same three payers.
  'Token Financial (1099-DIV) · Box 1a': 203_400,
  'Northmark Index Funds (1099-DIV) · Box 1a': 10_800,
  'Beacon Dividend Trust (1099-DIV) · Box 1a': 5_650,
  // Line 3a — 142,300 qualified.
  'Token Financial (1099-DIV) · Box 1b': 131_250,
  'Northmark Index Funds (1099-DIV) · Box 1b': 7_200,
  'Beacon Dividend Trust (1099-DIV) · Box 1b': 3_850,
  // Line 4b / line 8 — neither was on last year's return.
  'Meridian Retirement Trust (1099-R) · Box 2a': 0,
  'Summit Advisory Partners (1099-NEC) · Box 1': 0,
  // Line 25a / 25b.
  'Tech Circle Inc (W-2) · Box 2': PRIOR.w2Withholding,
  'Token Financial (1099-DIV) · Box 4': 18_740,
  'Meridian Retirement Trust (1099-R) · Box 4': 0,
  // Schedule A — last year took the standard deduction.
  'Mortgage interest (Schedule A)': 0,
  'State and local taxes (Schedule A)': 0,
  'Charitable contributions (Schedule A)': 0,
  // Other taxes — last year's total tax less line 16 was all NIIT.
  'Self-employment tax (Schedule SE)': 0,
  'Net investment income tax (Form 8960)': PRIOR_OTHER_TAXES,
}

/** Components of a calculated line map to the prior-year value of the line they reference. */
const PRIOR_CALC_COMPONENTS: Record<string, number> = {
  'Line 1z - Wages': PRIOR.wagesTotal,
  'Line 2b - Taxable interest': PRIOR.taxableInterest,
  'Line 3b - Ordinary dividends': PRIOR.ordinaryDivs,
  'Line 4b - IRA distributions': 0,
  'Line 7 - Capital gain (loss)': PRIOR.capitalGain,
  'Line 8 - Other income': 0,
  'Line 9 - Total income': PRIOR.totalIncome,
  'Line 11 - Adjusted gross income': PRIOR.agi,
  'Line 14 - Deductions': PRIOR.deductionSum,
  'Line 15 - Taxable income': PRIOR.taxableIncome,
  'Tax from rate schedules': PRIOR.incomeTax,
  'Line 16 - Tax': PRIOR.incomeTax,
  'Line 24 - Total tax': PRIOR.totalTax,
  'Line 25a - W-2 withholding': PRIOR.w2Withholding,
  'Line 25b - 1099 withholding': PRIOR.withholding,
  'Line 25d - Total withholding': PRIOR.totalWithholding,
  'Line 33 - Total payments': PRIOR.totalPayments,
}

type SummaryRow =
  | { kind: 'section'; label: string }
  | {
      kind: 'data'
      id: string
      label: string
      current: number
      prior: number
      total?: boolean
      format?: 'currency' | 'rate'
      breakdown?: Breakdown[]
      note?: string
    }

function formatAmount(value: number): string {
  return Math.round(value).toLocaleString('en-US')
}

function formatChange(current: number, prior: number, format: 'currency' | 'rate'): string {
  const diff = current - prior
  if (format === 'rate') {
    if (Math.abs(diff) < 0.05) return '0.0 pts'
    return `${diff > 0 ? '+' : '−'}${Math.abs(diff).toFixed(1)} pts`
  }
  if (Math.round(diff) === 0) return '0'
  return `${diff > 0 ? '+' : '−'}${formatAmount(Math.abs(diff))}`
}

/** Components behind a 1040 line, from the same origin data the field popovers use. */
function originBreakdown(
  fieldId: string,
  live: LiveReturnTotals,
  amounts: LiveAmounts,
): { breakdown?: Breakdown[]; note?: string } {
  const origin = getFieldOrigin(fieldId, live, amounts)
  if (!origin) return {}
  const fromSources = origin.sources?.map(s => {
    const label = `${s.label} · ${s.box}`
    return {
      // The form type is already clear from the parent line, so drop it from
      // the payer name to keep these on one row.
      label: label.replace(/ \((?:W-2|1099-[A-Z]+)\)/, '').replace(/ Co\./, ''),
      amount: s.amount,
      prior: PRIOR_COMPONENTS[label] ?? 0,
    }
  })
  const fromCalc = origin.calc?.components.map(c => ({
    label: c.label,
    amount: c.amount,
    prior: PRIOR_CALC_COMPONENTS[c.label] ?? 0,
  }))
  const breakdown = fromSources?.length ? fromSources : fromCalc
  return { breakdown: breakdown?.length ? breakdown : undefined, note: origin.note }
}

/** Keeps line 7 in the total-income breakdown even at $0, so the prior year reconciles. */
function withCapitalGainLine(
  breakdown: Breakdown[] | undefined,
  capitalGain: number,
): Breakdown[] | undefined {
  if (!breakdown || capitalGain !== 0) return breakdown
  const label = 'Line 7 - Capital gain (loss)'
  const insertAt = breakdown.findIndex(part => part.label.startsWith('Line 8'))
  const row: Breakdown = { label, amount: 0, prior: PRIOR_CALC_COMPONENTS[label] ?? 0 }
  const next = [...breakdown]
  next.splice(insertAt === -1 ? next.length : insertAt, 0, row)
  return next
}

function buildRows(live: LiveReturnTotals, amounts: LiveAmounts): SummaryRow[] {
  const line = (
    id: string,
    label: string,
    current: number,
    prior: number,
    fieldId?: string,
    extra: Partial<Extract<SummaryRow, { kind: 'data' }>> = {},
  ): SummaryRow => ({
    kind: 'data',
    id,
    label,
    current,
    prior,
    ...(fieldId ? originBreakdown(fieldId, live, amounts) : {}),
    ...extra,
  })

  const rate = computeEffectiveTaxRate(live.totalTax, live.taxableIncome) ?? 0
  const priorRate = computeEffectiveTaxRate(PRIOR.totalTax, PRIOR.taxableIncome) ?? 0

  return [
    { kind: 'section', label: 'Income' },
    line('wages', 'Wages, salaries, tips, etc', live.wages, PRIOR.wages, 'wages'),
    line('interest', 'Interest income', live.taxableInterest, PRIOR.taxableInterest, 'taxableInterest'),
    line('dividends', 'Dividend income', live.ordinaryDivs, PRIOR.ordinaryDivs, 'ordinaryDivs'),
    line('pensions', 'Taxable pensions', live.taxablePension, 0, 'iraDistrib'),
    line('capitalGain', 'Capital gain or loss', live.capitalGain, PRIOR.capitalGain, 'capitalGain'),
    line('business', 'Business income (Schedule C)', live.otherIncome, 0, 'otherIncome'),
    line('totalIncome', 'Total income', live.totalIncome, PRIOR.totalIncome, 'totalIncome', {
      total: true,
      // The origin omits zero lines, but a line that was zeroed out this year is
      // exactly what the year-over-year comparison needs to show.
      breakdown: withCapitalGainLine(
        originBreakdown('totalIncome', live, amounts).breakdown,
        live.capitalGain,
      ),
    }),

    { kind: 'section', label: 'Adjustments to income' },
    line('agi', 'Adjusted gross income', live.totalIncome, PRIOR.agi, 'agi', { total: true }),

    { kind: 'section', label: 'Deductions' },
    line('standard', 'Standard deduction', live.stdDeduction, PRIOR.stdDeduction),
    line('itemized', 'Total itemized deductions', live.itemizedDeduction, 0, undefined, {
      breakdown: [
        { label: 'Mortgage interest (Schedule A)', amount: amounts.mortgageInterest, prior: 0 },
        { label: 'State and local taxes (Schedule A)', amount: amounts.saltTaxes, prior: 0 },
        {
          label: 'Charitable contributions (Schedule A)',
          amount: amounts.charitableContributions,
          prior: 0,
        },
      ],
    }),
    line('deduction', 'Deduction taken', live.deductionTaken, PRIOR.deductionSum, undefined, {
      note:
        live.deductionMethod === 'itemized'
          ? 'Itemized deductions are larger, so the return itemizes.'
          : 'The standard deduction is larger, so the return takes it.',
    }),
    line('taxableIncome', 'Taxable income', live.taxableIncome, PRIOR.taxableIncome, 'taxableIncome', { total: true }),

    { kind: 'section', label: 'Tax computation' },
    line('incomeTax', 'Tax before credits', live.incomeTax, PRIOR.incomeTax, 'incomeTax'),
    line('otherTaxes', 'Other taxes', live.seTax + live.niitTax, PRIOR_OTHER_TAXES, undefined, {
      breakdown: [
        { label: 'Self-employment tax (Schedule SE)', amount: live.seTax, prior: 0 },
        {
          label: 'Net investment income tax (Form 8960)',
          amount: live.niitTax,
          prior: PRIOR_OTHER_TAXES,
        },
      ],
    }),
    line('totalTax', 'Total tax', live.totalTax, PRIOR.totalTax, 'totalTax', {
      total: true,
      breakdown: [
        { label: 'Line 16 - Tax', amount: live.incomeTax, prior: PRIOR.incomeTax },
        {
          label: 'Line 23 - Other taxes',
          amount: live.seTax + live.niitTax,
          prior: PRIOR_OTHER_TAXES,
        },
      ],
    }),

    { kind: 'section', label: 'Payments' },
    line('withholding', 'Federal income tax withheld', live.totalWithholding, PRIOR.totalWithholding, 'totalWithholding'),
    line('totalPayments', 'Total payments', live.totalPayments, PRIOR.totalPayments, undefined, {
      total: true,
      breakdown: [
        {
          label: 'Line 25d - Total withholding',
          amount: live.totalWithholding,
          prior: PRIOR.totalWithholding,
        },
        {
          label: 'Line 26 - Estimated tax payments',
          amount: 0,
          prior: PRIOR_ESTIMATED_PAYMENTS,
        },
      ],
    }),

    { kind: 'section', label: 'Refund or amount due' },
    line('owe', 'Amount you owe', live.oweAmount, PRIOR.amountOwed, 'amountOwed', { total: true }),

    { kind: 'section', label: 'Tax rates' },
    line('bracket', 'Ordinary income tax bracket', MARGINAL_RATE * 100, MARGINAL_RATE * 100, undefined, {
      format: 'rate',
    }),
    line('effectiveRate', 'Effective tax rate', rate, priorRate, undefined, {
      format: 'rate',
      note: 'Total tax divided by taxable income.',
    }),
  ]
}

export default function FederalSummaryTable() {
  const { amounts } = useSyncedReviewState()
  const rows = useMemo(() => buildRows(computeLiveReturn(amounts), amounts), [amounts])
  const expandableIds = useMemo(
    () =>
      rows.flatMap(row =>
        row.kind === 'data' && (row.breakdown?.length || row.note) ? [row.id] : [],
      ),
    [rows],
  )
  /** One line opens at a time, so the table stays readable while comparing. */
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedId(current => (current === id ? null : id))
  }

  const formatValue = (value: number, format: 'currency' | 'rate' = 'currency') =>
    format === 'rate' ? formatEffectiveTaxRate(value) : formatAmount(value)

  return (
    <div className={styles.root}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.colLabel} scope="col">
                <span className={styles.visuallyHidden}>Line</span>
              </th>
              <th className={styles.colValue} scope="col">{CURRENT_YEAR}</th>
              <th className={styles.colValue} scope="col">{PRIOR_YEAR}</th>
              <th className={styles.colValue} scope="col">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              if (row.kind === 'section') {
                return (
                  <tr key={row.label} className={styles.sectionRow}>
                    <th colSpan={4} scope="rowgroup">{row.label}</th>
                  </tr>
                )
              }

              const format = row.format ?? 'currency'
              const canExpand = expandableIds.includes(row.id)
              const isOpen = canExpand && expandedId === row.id
              const detailId = `fed-summary-${row.id}-detail`

              return (
                <Fragment key={row.id}>
                  <tr
                    className={[
                      styles.dataRow,
                      row.total ? styles.totalRow : '',
                      isOpen ? styles.dataRowOpen : '',
                      canExpand ? styles.dataRowExpandable : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    // The whole row is the target: the label and the chevron sit
                    // in different cells, so a button around either one alone
                    // leaves most of the row dead to a click.
                    onClick={canExpand ? () => toggleRow(row.id) : undefined}
                  >
                    <th className={styles.colLabel} scope="row">
                      {canExpand ? (
                        <button
                          type="button"
                          className={styles.rowToggle}
                          aria-expanded={isOpen}
                          aria-controls={detailId}
                          onClick={event => {
                            event.stopPropagation()
                            toggleRow(row.id)
                          }}
                        >
                          {row.label}
                        </button>
                      ) : (
                        <span className={styles.rowLabel}>{row.label}</span>
                      )}
                    </th>
                    <td className={styles.colValue}>{formatValue(row.current, format)}</td>
                    <td className={styles.colValue}>{formatValue(row.prior, format)}</td>
                    <td className={styles.colChange}>
                      <span className={styles.changeInner}>
                        {formatChange(row.current, row.prior, format)}
                        {canExpand ? (
                          <ChevronRight
                            size="small"
                            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                            aria-hidden
                          />
                        ) : null}
                      </span>
                    </td>
                  </tr>

                  {isOpen
                    ? row.breakdown?.map((part, index) => (
                        <tr
                          key={part.label}
                          id={index === 0 ? detailId : undefined}
                          className={styles.breakdownRow}
                        >
                          <th className={styles.colLabel} scope="row">
                            <span className={styles.breakdownLabel}>{part.label}</span>
                          </th>
                          <td className={styles.colValue}>{formatAmount(part.amount)}</td>
                          <td className={styles.colValue}>{formatAmount(part.prior)}</td>
                          <td className={styles.colChange}>
                            <span className={styles.changeInner}>
                              {formatChange(part.amount, part.prior, 'currency')}
                            </span>
                          </td>
                        </tr>
                      ))
                    : null}

                  {isOpen && row.note ? (
                    <tr
                      id={row.breakdown?.length ? undefined : detailId}
                      className={styles.noteRow}
                    >
                      <td colSpan={4}>
                        <p className={styles.detailNote}>{row.note}</p>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
