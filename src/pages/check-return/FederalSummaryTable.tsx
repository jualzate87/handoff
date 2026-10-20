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

type Breakdown = { label: string; amount: number }

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
  const fromSources = origin.sources?.map(s => ({ label: `${s.label} · ${s.box}`, amount: s.amount }))
  const fromCalc = origin.calc?.components.map(c => ({ label: c.label, amount: c.amount }))
  const breakdown = fromSources?.length ? fromSources : fromCalc
  return { breakdown: breakdown?.length ? breakdown : undefined, note: origin.note }
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
    line('totalIncome', 'Total income', live.totalIncome, PRIOR.totalIncome, 'totalIncome', { total: true }),

    { kind: 'section', label: 'Adjustments to income' },
    line('agi', 'Adjusted gross income', live.totalIncome, PRIOR.agi, 'agi', { total: true }),

    { kind: 'section', label: 'Deductions' },
    line('standard', 'Standard deduction', live.stdDeduction, PRIOR.stdDeduction),
    line('itemized', 'Total itemized deductions', live.itemizedDeduction, 0, undefined, {
      breakdown: [
        { label: 'Mortgage interest (Schedule A)', amount: amounts.mortgageInterest },
        { label: 'State and local taxes (Schedule A)', amount: amounts.saltTaxes },
        { label: 'Charitable contributions (Schedule A)', amount: amounts.charitableContributions },
      ],
    }),
    line('deduction', 'Larger of itemized or standard deduction', live.deductionTaken, PRIOR.deductionSum, undefined, {
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
        { label: 'Self-employment tax (Schedule SE)', amount: live.seTax },
        { label: 'Net investment income tax (Form 8960)', amount: live.niitTax },
      ],
    }),
    line('totalTax', 'Total tax', live.totalTax, PRIOR.totalTax, 'totalTax', { total: true }),

    { kind: 'section', label: 'Payments' },
    line('withholding', 'Federal income tax withheld', live.totalWithholding, PRIOR.totalWithholding, 'totalWithholding'),
    line('estimated', 'Estimated tax payments', 0, PRIOR_ESTIMATED_PAYMENTS, undefined, {
      note: 'No 2025 estimated payments are on the return.',
    }),
    line('totalPayments', 'Total payments', live.totalPayments, PRIOR.totalPayments, 'totalPayments', { total: true }),

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
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const allExpanded = expandableIds.length > 0 && expandableIds.every(id => expanded.has(id))

  const toggleRow = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const formatValue = (value: number, format: 'currency' | 'rate' = 'currency') =>
    format === 'rate' ? formatEffectiveTaxRate(value) : formatAmount(value)

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.expandAll}
          onClick={() => setExpanded(allExpanded ? new Set() : new Set(expandableIds))}
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

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
              const isOpen = canExpand && expanded.has(row.id)
              const detailId = `fed-summary-${row.id}-detail`

              return (
                <Fragment key={row.id}>
                  <tr className={`${styles.dataRow} ${row.total ? styles.totalRow : ''}`}>
                    <th className={styles.colLabel} scope="row">
                      {canExpand ? (
                        <button
                          type="button"
                          className={styles.rowToggle}
                          aria-expanded={isOpen}
                          aria-controls={detailId}
                          onClick={() => toggleRow(row.id)}
                        >
                          <ChevronRight
                            size="small"
                            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                            aria-hidden
                          />
                          <span>{row.label}</span>
                        </button>
                      ) : (
                        <span className={styles.rowLabel}>{row.label}</span>
                      )}
                    </th>
                    <td className={styles.colValue}>{formatValue(row.current, format)}</td>
                    <td className={styles.colValue}>{formatValue(row.prior, format)}</td>
                    <td className={styles.colValue}>{formatChange(row.current, row.prior, format)}</td>
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
                          <td className={styles.colValue} />
                          <td className={styles.colValue} />
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
