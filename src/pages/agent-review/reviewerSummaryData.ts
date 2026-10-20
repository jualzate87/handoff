/**
 * Reviewer summary content, derived from the live return so every tie-out,
 * correction and dollar effect matches what the 1040 shows right now.
 *
 * Each item states what was done, the evidence behind it and what is still
 * unconfirmed — reviewers distrust "ties out" unless they can see what it
 * ties to, and they need to know whether a diagnostic was fixed or overridden.
 */
import type { CatchUpDocLink } from './agentIntelligenceCopy'
import type { ActivityEntry } from '../../hooks/useSyncedReviewState'
import {
  computeLiveReturn,
  computeQualifiedDivOverstatement,
  computeSepIraCeiling,
  getBlankBox12Rows,
  MARGINAL_RATE,
  NIIT_AGI_THRESHOLD,
  projectItemizedDeduction,
  SAFE_HARBOR_2210,
  SCH_C_COMBINED_RATE,
  SEED_AMOUNTS,
  STD_DEDUCTION_SINGLE,
  type LiveAmounts,
} from '../../data/liveReturn'
import { SOURCE_AMOUNTS } from '../data-review/phase2FlagSync'
import { PRIOR_YEAR_1040_VALUES } from '../data-review/priorYear1040Data'
import {
  getVerifiedDocEntry,
  isVerifiedInSet,
  navigationForVerifiedDocKey,
  PACKET_VERIFY_DOC_KEYS,
  VERIFY_DOC_LABELS,
} from '../../data/verifiedDocKeys'
import { DEMO_EMPLOYER_EIN } from '../../lib/applyAgentIntelligenceFixes'

export type SummaryTone = 'positive' | 'info' | 'attention' | 'neutral'

export type SummaryTag = { label: string; tone: SummaryTone }

export type LedgerLine = { label: string; amount: number }

export type DocumentRow = {
  key: string
  label: string
  checkedBy: string | null
  link: CatchUpDocLink
}

export type ReconciliationItem = {
  id: string
  line: string
  label: string
  amount: number
  tag: SummaryTag
  sources: LedgerLine[]
  change?: { before: number; after: number; explanation: string }
  confirmed: string
  notConfirmed?: string
  links: CatchUpDocLink[]
}

export type DiagnosticItem = {
  id: string
  severity: string
  title: string
  tag: SummaryTag
  how: string
  impact?: string
  links: CatchUpDocLink[]
}

export type DecisionGroupId = 'positions' | 'changes' | 'planning'

export type DecisionItem = {
  id: string
  group: DecisionGroupId
  title: string
  summary: string
  /** Signed size of the call, for ordering; the label is what's shown. */
  effect: number
  effectLabel: string
  onReturn: string
  alternative: string
  notConfirmed: string
  links: CatchUpDocLink[]
}

export type ReviewerSummary = {
  documents: DocumentRow[]
  documentsChecked: number
  reconciliation: ReconciliationItem[]
  correctedCount: number
  diagnostics: DiagnosticItem[]
  overriddenCount: number
  readyToEfile: boolean
  efileBlocker?: string
  decisions: DecisionItem[]
}

export const DECISION_GROUP_LABELS: Record<DecisionGroupId, string> = {
  positions: 'Positions taken on the return',
  changes: 'Changes from last year',
  planning: 'Exposure and planning',
}

export const DECISION_GROUP_ORDER: DecisionGroupId[] = ['positions', 'changes', 'planning']

const TAG = {
  tiesOut: { label: 'Ties out', tone: 'positive' },
  corrected: { label: 'Corrected', tone: 'info' },
  added: { label: 'Added', tone: 'info' },
  mismatch: { label: 'Doesn’t match source', tone: 'attention' },
  addedData: { label: 'Fixed with missing data', tone: 'positive' },
  overridden: { label: 'Overridden', tone: 'attention' },
  open: { label: 'Open', tone: 'neutral' },
} as const satisfies Record<string, SummaryTag>

export function formatMoney(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`
}

const PREPARER = 'Amanda'

const LINK = {
  techCircleW2: (field?: string): CatchUpDocLink => ({
    docLabel: 'W-2 · Tech Circle',
    popoutTab: 'w2s',
    popoutSubTab: 'techCircle',
    field,
  }),
  tokenDiv: (field?: string): CatchUpDocLink => ({
    docLabel: '1099-DIV · Token Financial',
    popoutTab: '1099-divs',
    divPayer: 'tokenFinancial',
    field,
  }),
  meridianR: (field?: string): CatchUpDocLink => ({
    docLabel: '1099-R · Meridian',
    popoutTab: '1099-rs',
    field,
  }),
  summitNec: (): CatchUpDocLink => ({
    docLabel: '1099-NEC · Summit Advisory',
    popoutTab: '1099-necs',
    field: 'nec-box1',
  }),
  questionnaire: (): CatchUpDocLink => ({ docLabel: 'Tax Organizer', popoutTab: 'questionnaire' }),
  form: (formId: string, docLabel: string): CatchUpDocLink => ({ docLabel, formId }),
}

function docLink(key: string): CatchUpDocLink {
  const nav = navigationForVerifiedDocKey(key)
  return {
    docLabel: VERIFY_DOC_LABELS[key] ?? key,
    popoutTab: nav?.tab,
    popoutSubTab: nav?.subTab,
    divPayer: nav?.divPayer,
    intPayer: nav?.intPayer,
  }
}

/** Corrected when the value moved from the import to the source; flagged if it doesn't match now. */
function correctionTag(current: number, imported: number, source: number, added = false): SummaryTag {
  if (current !== source) return TAG.mismatch
  if (imported === source) return TAG.tiesOut
  return added ? TAG.added : TAG.corrected
}

export function buildReviewerSummary({
  amounts,
  verifiedDocs,
  verifiedDocsMeta,
}: {
  amounts: LiveAmounts
  verifiedDocs: Set<string>
  verifiedDocsMeta: Map<string, ActivityEntry>
}): ReviewerSummary {
  const live = computeLiveReturn(amounts)
  const isChecked = (key: string) => isVerifiedInSet(verifiedDocs, key)
  const uncheckedLabels = (keys: string[]) =>
    keys.filter(key => !isChecked(key)).map(key => VERIFY_DOC_LABELS[key] ?? key)

  /* ── 1. Data entry ── */
  const documents: DocumentRow[] = PACKET_VERIFY_DOC_KEYS.map(key => ({
    key,
    label: VERIFY_DOC_LABELS[key] ?? key,
    checkedBy: isChecked(key) ? getVerifiedDocEntry(verifiedDocsMeta, key)?.by ?? PREPARER : null,
    link: docLink(key),
  }))
  const documentsChecked = documents.filter(doc => doc.checkedBy).length

  /* ── 2. Reconciliation ── */
  const priorWages = PRIOR_YEAR_1040_VALUES.wages
  const wageGrowth = live.wages - priorWages
  const qualified = computeQualifiedDivOverstatement({
    ...amounts,
    qualifiedDivsToken: SEED_AMOUNTS.qualifiedDivsToken,
  })
  const importedWithholding1099 = SEED_AMOUNTS.divWithholding + SEED_AMOUNTS.rWithholding
  const sourceWithholding1099 = SOURCE_AMOUNTS.divWithholding + SOURCE_AMOUNTS.rWithholding

  const interestUnchecked = uncheckedLabels([
    '1099-int-unwaverIngFinancial',
    '1099-int-harborlineCredit',
    '1099-int-cascadeFederal',
  ])

  const reconciliation: ReconciliationItem[] = [
    {
      id: 'wages',
      line: 'Line 1a',
      label: 'Wages',
      amount: live.wages,
      tag: correctionTag(amounts.wages, SEED_AMOUNTS.wages, SOURCE_AMOUNTS.wages),
      sources: [{ label: 'Tech Circle Inc W-2 · Box 1', amount: amounts.wages }],
      change: {
        before: SEED_AMOUNTS.wages,
        after: SOURCE_AMOUNTS.wages,
        explanation:
          'The import read Box 1 as $118,940. The W-2 shows $148,940, which also matches Box 3 and Box 5.',
      },
      confirmed:
        `Corrected in ${PREPARER}’s AI review and accepted by ${PREPARER}. ` +
        `Up ${formatMoney(wageGrowth)} (${Math.round((wageGrowth / priorWages) * 100)}%) from 2024, ` +
        `which ${PREPARER} attributes to a mid-year raise.`,
      notConfirmed:
        'The raise itself. A W-2 reports the annual total, not pay history. A final 2025 pay stub would confirm it.',
      links: [LINK.techCircleW2('wages')],
    },
    {
      id: 'interest',
      line: 'Line 2b',
      label: 'Taxable interest',
      amount: live.taxableInterest,
      tag: TAG.tiesOut,
      sources: [
        { label: 'Unwavering Financial 1099-INT · Box 1', amount: amounts.interestUnwavering },
        { label: 'Harborline Credit Union 1099-INT · Box 1', amount: amounts.interestHarborline },
        { label: 'Cascade Federal Savings 1099-INT · Box 1', amount: amounts.interestCascade },
      ],
      confirmed: 'Each 1099-INT Box 1 matches the amount on the return.',
      notConfirmed: interestUnchecked.length
        ? `${interestUnchecked.join(', ')} hasn’t been checked against its PDF.`
        : undefined,
      links: [docLink('1099-int-cascadeFederal')],
    },
    {
      id: 'qualifiedDivs',
      line: 'Line 3a',
      label: 'Qualified dividends',
      amount: live.qualifiedDivs,
      tag: correctionTag(
        amounts.qualifiedDivsToken,
        SEED_AMOUNTS.qualifiedDivsToken,
        SOURCE_AMOUNTS.qualifiedDivsToken,
      ),
      sources: [
        { label: 'Token Financial 1099-DIV · Box 1b', amount: amounts.qualifiedDivsToken },
        { label: 'Northmark Index Funds 1099-DIV · Box 1b', amount: amounts.qualifiedDivsNorthmark },
        { label: 'Beacon Dividend Trust 1099-DIV · Box 1b', amount: amounts.qualifiedDivsBeacon },
      ],
      change: {
        before: SEED_AMOUNTS.qualifiedDivsToken,
        after: SOURCE_AMOUNTS.qualifiedDivsToken,
        explanation:
          `The import used Token Financial’s full Box 1a ($331,250) as qualified. Box 1b on the form is $187,500. ` +
          `Left as imported, it would have understated tax by ${formatMoney(qualified.taxDelta)}.`,
      },
      confirmed: `Corrected in ${PREPARER}’s AI review and accepted by ${PREPARER}.`,
      notConfirmed:
        `${PREPARER} noted the broker’s formatting was unusual. The split hasn’t been compared to the full broker statement.`,
      links: [LINK.tokenDiv('qualifiedDivs')],
    },
    {
      id: 'ordinaryDivs',
      line: 'Line 3b',
      label: 'Ordinary dividends',
      amount: live.ordinaryDivs,
      tag: TAG.tiesOut,
      sources: [
        { label: 'Token Financial 1099-DIV · Box 1a', amount: amounts.ordinaryDivsToken },
        { label: 'Northmark Index Funds 1099-DIV · Box 1a', amount: amounts.ordinaryDivsNorthmark },
        { label: 'Beacon Dividend Trust 1099-DIV · Box 1a', amount: amounts.ordinaryDivsBeacon },
      ],
      confirmed: 'All three 1099-DIV Box 1a amounts match the return.',
      links: [LINK.tokenDiv()],
    },
    {
      id: 'pension',
      line: 'Line 4b',
      label: 'Pensions and annuities',
      amount: live.taxablePension,
      tag: correctionTag(amounts.taxablePension, SEED_AMOUNTS.taxablePension, SOURCE_AMOUNTS.taxablePension),
      sources: [{ label: 'Meridian Retirement Trust 1099-R · Box 2a', amount: amounts.taxablePension }],
      change: {
        before: SEED_AMOUNTS.taxablePension,
        after: SOURCE_AMOUNTS.taxablePension,
        explanation: 'The import read the taxable amount as $100,000. Box 2a on the 1099-R is $150,000.',
      },
      confirmed: `Corrected in ${PREPARER}’s AI review and accepted by ${PREPARER}.`,
      notConfirmed: 'The distribution code and whether any part was rolled over. See Decisions to review.',
      links: [LINK.meridianR('r-taxableAmt')],
    },
    {
      id: 'business',
      line: 'Line 8',
      label: 'Business income (Schedule C)',
      amount: live.otherIncome,
      tag: correctionTag(
        amounts.necOnReturn ? amounts.necIncome : 0,
        0,
        SOURCE_AMOUNTS.necIncome,
        true,
      ),
      sources: [{ label: 'Summit Advisory Partners 1099-NEC · Box 1', amount: live.schCGross }],
      change: {
        before: 0,
        after: SOURCE_AMOUNTS.necIncome,
        explanation: 'The 1099-NEC was in the packet but not on the return. Box 1 was added to Schedule C, line 1.',
      },
      confirmed: `Added in ${PREPARER}’s AI review and accepted by ${PREPARER}.`,
      notConfirmed: isChecked('1099-nec')
        ? undefined
        : `${PREPARER} hasn’t checked the 1099-NEC against its PDF.`,
      links: [LINK.summitNec()],
    },
    {
      id: 'w2Withholding',
      line: 'Line 25a',
      label: 'Federal tax withheld (W-2)',
      amount: live.w2Withholding,
      tag: TAG.tiesOut,
      sources: [{ label: 'Tech Circle Inc W-2 · Box 2', amount: amounts.w2Withholding }],
      confirmed: 'W-2 Box 2 matches the return.',
      links: [LINK.techCircleW2()],
    },
    {
      id: 'withholding1099',
      line: 'Line 25b',
      label: 'Federal tax withheld (1099s)',
      amount: live.withholding1099,
      tag: correctionTag(live.withholding1099, importedWithholding1099, sourceWithholding1099),
      sources: [
        { label: 'Token Financial 1099-DIV · Box 4', amount: amounts.divWithholding },
        { label: 'Meridian Retirement Trust 1099-R · Box 4', amount: amounts.rWithholding },
      ],
      change: {
        before: importedWithholding1099,
        after: sourceWithholding1099,
        explanation:
          'Token Financial Box 4 imported as $24,925 (the form shows $26,363), and the 1099-R Box 4 withholding of $30,000 was dropped.',
      },
      confirmed: `Corrected in ${PREPARER}’s AI review and accepted by ${PREPARER}.`,
      links: [LINK.tokenDiv('fedTaxWithheld'), LINK.meridianR('r-fedTaxWithheld')],
    },
  ]
  const correctedCount = reconciliation.filter(item => item.tag !== TAG.tiesOut).length

  /* ── 3. Return status: how each diagnostic was cleared ── */
  const einMissing = !amounts.employerEin
  const ssnPresent = Boolean(amounts.employeeSsn)
  const box12Blank = getBlankBox12Rows(amounts)

  const diagnostics: DiagnosticItem[] = [
    {
      id: 'ein',
      severity: 'EF critical',
      title: 'Employer EIN missing on the Tech Circle W-2',
      tag: einMissing ? TAG.overridden : TAG.addedData,
      how: einMissing
        ? `${PREPARER} overrode this diagnostic so the return could move to review. Box b is still blank on the return.`
        : `Box b entered from the W-2 (${amounts.employerEin}).`,
      impact: einMissing
        ? `The return can’t be e-filed until the EIN is entered. The W-2 shows ${DEMO_EMPLOYER_EIN} in Box b.`
        : undefined,
      links: [LINK.techCircleW2('ein')],
    },
    {
      id: 'ssn',
      severity: 'Fatal',
      title: 'Employee SSN missing on the Tech Circle W-2',
      tag: ssnPresent ? TAG.addedData : TAG.open,
      how: ssnPresent
        ? `Box a entered from the W-2 (•••-••-${amounts.employeeSsn.slice(-4)}) in ${PREPARER}’s AI review, then accepted by ${PREPARER}.`
        : 'Box a is still blank on the return.',
      links: [LINK.techCircleW2('ssn')],
    },
    {
      id: 'nec',
      severity: 'Critical',
      title: '1099-NEC income not reported',
      tag: amounts.necOnReturn ? TAG.addedData : TAG.open,
      how: amounts.necOnReturn
        ? `Summit Advisory Box 1 (${formatMoney(live.schCGross)}) added to Schedule C, which brings ${formatMoney(live.seTax)} of self-employment tax onto the return.`
        : 'The 1099-NEC is in the packet but not on the return.',
      links: [LINK.summitNec()],
    },
    ...(box12Blank.length
      ? [
          {
            id: 'box12',
            severity: 'Informational',
            title: 'W-2 Box 12 amounts not entered',
            tag: TAG.open,
            how:
              `Codes ${box12Blank.map(row => row.code).join(', ')} imported without amounts. ` +
              'These amounts are informational and don’t change the tax, but the return should match the W-2.',
            links: [LINK.techCircleW2('box12')],
          },
        ]
      : []),
  ]
  const toneRank: Record<SummaryTone, number> = { attention: 0, neutral: 1, info: 2, positive: 3 }
  diagnostics.sort((a, b) => toneRank[a.tag.tone] - toneRank[b.tag.tone])
  const overriddenCount = diagnostics.filter(item => item.tag === TAG.overridden).length

  /* ── 4. Decisions to review ── */
  const decisions: DecisionItem[] = []

  if (amounts.mortgageInterest > 0) {
    const itemized = projectItemizedDeduction(amounts, amounts.mortgageInterest)
    decisions.push({
      id: 'mortgage',
      group: 'positions',
      title: 'Itemizing on an estimated mortgage interest figure',
      summary: `${formatMoney(amounts.mortgageInterest)} of mortgage interest comes from Tina’s Tax Organizer answer, not a Form 1098.`,
      effect: itemized.taxSaved,
      effectLabel: `${formatMoney(itemized.taxSaved)} less tax`,
      onReturn:
        `Itemized deductions of ${formatMoney(itemized.itemizedTotal)} (mortgage interest ${formatMoney(itemized.mortgageInterest)}, ` +
        `state and local taxes ${formatMoney(itemized.saltTaxes)}, charity ${formatMoney(itemized.charitableContributions)}) ` +
        `replace the ${formatMoney(STD_DEDUCTION_SINGLE)} standard deduction.`,
      alternative: `Take the standard deduction until the Form 1098 arrives, which adds ${formatMoney(itemized.taxSaved)} of tax.`,
      notConfirmed: 'The interest actually paid, and whether the loan is over the $750,000 acquisition-debt limit.',
      links: [LINK.questionnaire(), LINK.form('schA', 'Schedule A')],
    })
  }

  if (live.necOnReturn && live.schCExpenses === 0) {
    decisions.push({
      id: 'schCExpenses',
      group: 'positions',
      title: `Schedule C reports ${formatMoney(live.schCGross)} of income and no expenses`,
      summary: 'The 1099-NEC is the only business record on the return.',
      effect: Math.round(SCH_C_COMBINED_RATE * 1000),
      effectLabel: `${formatMoney(SCH_C_COMBINED_RATE * 1000)} per $1,000 of expenses`,
      onReturn: `Net profit of ${formatMoney(live.schCNetProfit)}, with ${formatMoney(live.seTax)} of self-employment tax.`,
      alternative: 'Add documented business expenses, which reduce both income tax and self-employment tax.',
      notConfirmed: 'Whether Tina had business costs. Her Tax Organizer says she did, but no amounts were provided.',
      links: [LINK.summitNec(), LINK.questionnaire(), LINK.form('schC', 'Schedule C')],
    })
  }

  const priorEstimates = PRIOR_YEAR_1040_VALUES.estimatedPayments
  const shortfall = Math.max(0, SAFE_HARBOR_2210 - live.totalWithholding)
  if (priorEstimates > 0) {
    decisions.push({
      id: 'estimates',
      group: 'changes',
      title: 'No estimated payments this year',
      summary: `Tina paid ${formatMoney(priorEstimates)} in 2024 estimates. None are on the 2025 return.`,
      effect: shortfall,
      effectLabel: shortfall > 0 ? `${formatMoney(shortfall)} below safe harbor` : 'Safe harbor met',
      onReturn:
        `Withholding of ${formatMoney(live.totalWithholding)} against a ${formatMoney(SAFE_HARBOR_2210)} safe harbor (110% of 2024 tax)` +
        (shortfall > 0 ? ', so Form 2210 applies.' : '.'),
      alternative: 'If Tina made 2025 estimated payments, add them to line 26.',
      notConfirmed: 'Whether any 2025 estimated payments were made.',
      links: [LINK.form('f2210', 'Form 2210')],
    })
  }

  if (live.taxablePension > 0) {
    const pensionTax = Math.round(live.taxablePension * MARGINAL_RATE)
    decisions.push({
      id: 'pension',
      group: 'changes',
      title: `Pension distribution of ${formatMoney(live.taxablePension)}, none last year`,
      summary: 'Meridian Retirement Trust, taxed in full as ordinary income.',
      effect: pensionTax,
      effectLabel: `${formatMoney(pensionTax)} of tax at ${Math.round(MARGINAL_RATE * 100)}%`,
      onReturn:
        `${formatMoney(live.taxablePension)} on line 4b with ${formatMoney(amounts.rWithholding)} withheld. ` +
        'Plans withhold 20% on an eligible rollover distribution paid to the participant.',
      alternative: 'Any part rolled over within 60 days isn’t taxable.',
      notConfirmed: `The distribution code and whether any part was rolled over. ${PREPARER} has asked Tina.`,
      links: [LINK.meridianR('r-taxableAmt')],
    })
  }

  if (live.capitalGain === 0 && PRIOR_YEAR_1040_VALUES.capitalGain > 0) {
    decisions.push({
      id: 'capitalGains',
      group: 'changes',
      title: 'No capital gains this year',
      summary: `${formatMoney(PRIOR_YEAR_1040_VALUES.capitalGain)} last year. There’s no 1099-B or Schedule D in this year’s packet.`,
      effect: 0,
      effectLabel: 'No tax effect',
      onReturn: 'Line 7 is $0.',
      alternative: 'If Tina sold investments in 2025, a 1099-B is missing.',
      notConfirmed: 'Whether there were any sales this year.',
      links: [LINK.form('1040', 'Form 1040')],
    })
  }

  if (live.niitTax > 0) {
    decisions.push({
      id: 'niit',
      group: 'planning',
      title: 'Net investment income tax applies',
      summary: `Income is over the ${formatMoney(NIIT_AGI_THRESHOLD)} threshold, so 3.8% applies to ${formatMoney(live.netInvestmentIncome)} of investment income.`,
      effect: live.niitTax,
      effectLabel: `${formatMoney(live.niitTax)} of tax`,
      onReturn: `Form 8960 adds 3.8% on ${formatMoney(live.netInvestmentIncome)}.`,
      alternative: 'Investment expenses allocable to this income would reduce it.',
      notConfirmed: 'Whether Tina had investment interest or advisory fees.',
      links: [LINK.form('f8960', 'Form 8960')],
    })
  }

  if (live.schCNetProfit > 0) {
    const sep = computeSepIraCeiling(live.schCNetProfit)
    decisions.push({
      id: 'sep',
      group: 'planning',
      title: 'SEP-IRA room on Schedule C profit',
      summary: `Up to ${formatMoney(sep.contribution)} could be deducted for 2025, up to the filing deadline.`,
      effect: sep.taxSaved,
      effectLabel: `${formatMoney(sep.taxSaved)} less tax`,
      onReturn: 'No retirement contribution is claimed against business income.',
      alternative: `Contribute and deduct up to ${formatMoney(sep.contribution)}.`,
      notConfirmed: 'Whether Tina wants to contribute.',
      links: [LINK.form('schC', 'Schedule C')],
    })
  }

  decisions.sort((a, b) => {
    const group = DECISION_GROUP_ORDER.indexOf(a.group) - DECISION_GROUP_ORDER.indexOf(b.group)
    return group !== 0 ? group : b.effect - a.effect
  })

  return {
    documents,
    documentsChecked,
    reconciliation,
    correctedCount,
    diagnostics,
    overriddenCount,
    readyToEfile: !einMissing && ssnPresent,
    efileBlocker: einMissing ? 'employer EIN missing' : !ssnPresent ? 'employee SSN missing' : undefined,
    decisions,
  }
}
