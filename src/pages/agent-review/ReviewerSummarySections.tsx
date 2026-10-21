import { useId, useState, type ReactNode } from 'react'
import {
  ChevronDown,
  CircleCheck,
  CircleCheckFill,
  NewWindow,
  TriangleExclamationFill,
} from '@design-systems/icons'
import { openDocOrFormLink } from '../../lib/prototypeRoutes'
import type { CatchUpDocLink } from './agentIntelligenceCopy'
import {
  DECISION_GROUP_LABELS,
  DECISION_GROUP_ORDER,
  formatMoney,
  type DecisionItem,
  type DiagnosticItem,
  type LedgerLine,
  type ReconciliationItem,
  type ReviewerSummary,
  type SummaryTag,
} from './reviewerSummaryData'
import styles from '../../styles/agent-review/ReviewerSummarySections.module.css'

/* ── Primitives ── */

function Tag({ tag }: { tag: SummaryTag }) {
  return <span className={`${styles.tag} ${styles[`tag_${tag.tone}`]}`}>{tag.label}</span>
}

function EvidenceLinks({ links }: { links: readonly CatchUpDocLink[] }) {
  if (!links.length) return null
  return (
    <div className={styles.links}>
      {links.map(link => (
        <button
          key={`${link.docLabel}-${link.field ?? ''}`}
          type="button"
          className={styles.docLink}
          aria-label={`${link.docLabel} (opens in a new window)`}
          onClick={() =>
            openDocOrFormLink({
              tab: link.popoutTab,
              subTab: link.popoutSubTab,
              divPayer: link.divPayer,
              intPayer: link.intPayer,
              field: link.field,
              formId: link.formId,
            })
          }
        >
          {link.docLabel}
          <NewWindow size="small" className={styles.docLinkIcon} aria-hidden />
        </button>
      ))}
    </div>
  )
}

/** One labelled block inside an expanded item, e.g. "How it ties out". */
function Field({
  label,
  tone,
  children,
}: {
  label: string
  tone?: 'attention'
  children: ReactNode
}) {
  return (
    <div className={`${styles.field} ${tone === 'attention' ? styles.fieldAttention : ''}`}>
      <p className={styles.fieldLabel}>{label}</p>
      <div className={styles.fieldBody}>{children}</div>
    </div>
  )
}

function Ledger({ lines, totalLabel, total }: { lines: LedgerLine[]; totalLabel: string; total: number }) {
  return (
    <dl className={styles.ledger}>
      {lines.map(line => (
        <div key={line.label} className={styles.ledgerRow}>
          <dt>{line.label}</dt>
          <dd>{formatMoney(line.amount)}</dd>
        </div>
      ))}
      <div className={`${styles.ledgerRow} ${styles.ledgerTotal}`}>
        <dt>{totalLabel}</dt>
        <dd>{formatMoney(total)}</dd>
      </div>
    </dl>
  )
}

/**
 * Expandable summary item — same card language as the AI review's issue cards:
 * a one-line outcome at rest, the evidence once opened.
 */
function SummaryAccordion({
  title,
  description,
  aside,
  children,
  open: controlledOpen,
  onToggle,
}: {
  title: ReactNode
  description?: ReactNode
  aside?: ReactNode
  children: ReactNode
  /** Controlled by a parent list so only one card in the list opens at a time. */
  open?: boolean
  onToggle?: () => void
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const toggle = onToggle ?? (() => setUncontrolledOpen(value => !value))
  const bodyId = useId()
  return (
    <div className={`${styles.card} ${open ? styles.cardOpen : ''}`}>
      <button
        type="button"
        className={styles.cardHeader}
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={toggle}
      >
        <span className={styles.cardHeaderMain}>
          <span className={styles.cardTitle}>{title}</span>
          {description ? <span className={styles.cardDescription}>{description}</span> : null}
        </span>
        {aside ? <span className={styles.cardAside}>{aside}</span> : null}
        <ChevronDown
          size="small"
          className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={bodyId} className={styles.cardBody}>
          {children}
        </div>
      ) : null}
    </div>
  )
}

/**
 * One id open at a time within a list of accordion cards, so expanding one
 * closes whichever other card in the same section was open.
 */
function useSingleOpenAccordion<Id extends string>() {
  const [openId, setOpenId] = useState<Id | null>(null)
  const toggle = (id: Id) => setOpenId(current => (current === id ? null : id))
  return { openId, toggle }
}

function SectionHeader({ title, intro }: { title: string; intro: ReactNode }) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionHeading}>{title}</h2>
      <p className={styles.sectionIntro}>{intro}</p>
    </div>
  )
}

/* ── At a glance ── */

export function SummaryOverview({ summary }: { summary: ReviewerSummary }) {
  const docTotal = summary.documents.length
  const stats = [
    {
      label: 'Data entry',
      value: `${summary.documentsChecked} of ${docTotal}`,
      detail: 'documents checked',
    },
    {
      label: 'Reconciliation',
      value: `${summary.reconciliation.length} lines`,
      detail: `${summary.correctedCount} corrected on import`,
    },
    {
      label: 'Diagnostics',
      value: summary.overriddenCount ? `${summary.overriddenCount} overridden` : 'All cleared',
      detail: summary.readyToEfile ? 'Ready to e-file' : `Not ready to e-file`,
      attention: !summary.readyToEfile,
    },
    {
      label: 'Decisions',
      value: `${summary.decisions.length} to review`,
      detail: 'positions and changes',
    },
  ]
  return (
    <dl className={styles.overview} aria-label="Return at a glance">
      {stats.map(stat => (
        <div key={stat.label} className={styles.overviewStat}>
          <dt className={styles.overviewLabel}>{stat.label}</dt>
          <dd className={styles.overviewValue}>{stat.value}</dd>
          <dd className={`${styles.overviewDetail} ${stat.attention ? styles.overviewDetailAttention : ''}`}>
            {stat.detail}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* ── 1. Data entry ── */

export function DataEntrySection({ summary }: { summary: ReviewerSummary }) {
  const unchecked = summary.documents.length - summary.documentsChecked
  return (
    <section className={styles.section}>
      <SectionHeader
        title="1. Data entry"
        intro={
          <>
            {summary.documents.length} source documents and the Tax Organizer were imported.{' '}
            {unchecked
              ? `${unchecked} haven’t been checked against their PDFs yet.`
              : 'All have been checked against their PDFs.'}
          </>
        }
      />
      <SummaryAccordion
        title="Source documents"
        description={`${summary.documentsChecked} of ${summary.documents.length} checked by Amanda`}
        aside={
          <Tag
            tag={
              unchecked
                ? { label: `${unchecked} not checked`, tone: 'neutral' }
                : { label: 'All checked', tone: 'positive' }
            }
          />
        }
      >
        <ul className={styles.docList}>
          {summary.documents.map(doc => (
            <li key={doc.key} className={styles.docRow}>
              {doc.checkedBy ? (
                <CircleCheckFill size="small" className={styles.docIconChecked} aria-hidden />
              ) : (
                <CircleCheck size="small" className={styles.docIconUnchecked} aria-hidden />
              )}
              <span className={styles.docName}>{doc.label}</span>
              <span className={doc.checkedBy ? styles.docStatus : styles.docStatusMuted}>
                {doc.checkedBy ? `Checked by ${doc.checkedBy}` : 'Not checked'}
              </span>
              <EvidenceLinks links={[{ ...doc.link, docLabel: 'View' }]} />
            </li>
          ))}
        </ul>
      </SummaryAccordion>
    </section>
  )
}

/* ── 2. Reconciliation ── */

function ReconciliationCard({
  item,
  open,
  onToggle,
}: {
  item: ReconciliationItem
  open: boolean
  onToggle: () => void
}) {
  return (
    <SummaryAccordion
      open={open}
      onToggle={onToggle}
      title={
        <>
          <span className={styles.lineRef}>{item.line}</span>
          {item.label}
        </>
      }
      aside={
        <>
          <span className={styles.asideAmount}>{formatMoney(item.amount)}</span>
          <Tag tag={item.tag} />
        </>
      }
    >
      <Field label="How it ties out">
        <Ledger lines={item.sources} totalLabel={`${item.line} on the return`} total={item.amount} />
      </Field>
      {item.change && item.tag.label !== 'Ties out' ? (
        <Field label="What changed">
          <p className={styles.change}>
            <span className={styles.changeBefore}>{formatMoney(item.change.before)}</span>
            <span className={styles.changeArrow} aria-hidden>
              →
            </span>
            <span className={styles.changeAfter}>{formatMoney(item.change.after)}</span>
          </p>
          <p className={styles.text}>{item.change.explanation}</p>
        </Field>
      ) : null}
      <Field label="Confirmed">
        <p className={styles.text}>{item.confirmed}</p>
      </Field>
      {item.notConfirmed ? (
        <Field label="Not confirmed" tone="attention">
          <p className={styles.text}>{item.notConfirmed}</p>
        </Field>
      ) : null}
      <EvidenceLinks links={item.links} />
    </SummaryAccordion>
  )
}

export function ReconciliationSection({ summary }: { summary: ReviewerSummary }) {
  const { openId, toggle } = useSingleOpenAccordion<string>()
  return (
    <section className={styles.section}>
      <SectionHeader
        title="2. Reconciliation"
        intro={
          <>
            Each line below equals the source-document boxes listed under it.{' '}
            {summary.correctedCount} were corrected from the import to match the source documents.
          </>
        }
      />
      <div className={styles.cardList}>
        {summary.reconciliation.map(item => (
          <ReconciliationCard
            key={item.id}
            item={item}
            open={openId === item.id}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>
    </section>
  )
}

/* ── 3. Return status ── */

function DiagnosticCard({
  item,
  open,
  onToggle,
}: {
  item: DiagnosticItem
  open: boolean
  onToggle: () => void
}) {
  return (
    <SummaryAccordion
      open={open}
      onToggle={onToggle}
      title={item.title}
      description={item.severity}
      aside={<Tag tag={item.tag} />}
    >
      <Field label="How it was cleared">
        <p className={styles.text}>{item.how}</p>
      </Field>
      {item.impact ? (
        <Field label="Why it matters" tone="attention">
          <p className={styles.text}>{item.impact}</p>
        </Field>
      ) : null}
      <EvidenceLinks links={item.links} />
    </SummaryAccordion>
  )
}

export function ReturnStatusSection({ summary }: { summary: ReviewerSummary }) {
  const { openId, toggle } = useSingleOpenAccordion<string>()
  const raised = summary.diagnostics.filter(item => item.severity !== 'Informational').length
  return (
    <section className={styles.section}>
      <SectionHeader
        title="3. Return status"
        intro={
          <>
            {raised} diagnostics were raised during preparation.{' '}
            {summary.overriddenCount
              ? `${summary.overriddenCount} was overridden rather than fixed, so it’s listed first.`
              : 'Each was fixed by adding the missing information.'}
          </>
        }
      />
      <p
        className={`${styles.readiness} ${summary.readyToEfile ? styles.readinessReady : styles.readinessBlocked}`}
        role="status"
      >
        {summary.readyToEfile ? (
          <CircleCheckFill size="small" className={styles.readinessIcon} aria-hidden />
        ) : (
          <TriangleExclamationFill size="small" className={styles.readinessIcon} aria-hidden />
        )}
        {summary.readyToEfile
          ? 'Ready to e-file'
          : `Not ready to e-file: ${summary.efileBlocker}`}
      </p>
      <div className={styles.cardList}>
        {summary.diagnostics.map(item => (
          <DiagnosticCard
            key={item.id}
            item={item}
            open={openId === item.id}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>
    </section>
  )
}

/* ── 4. Decisions to review ── */

function DecisionCard({
  item,
  open,
  onToggle,
}: {
  item: DecisionItem
  open: boolean
  onToggle: () => void
}) {
  return (
    <SummaryAccordion
      open={open}
      onToggle={onToggle}
      title={item.title}
      description={item.summary}
      aside={<span className={styles.effect}>{item.effectLabel}</span>}
    >
      <Field label="On the return">
        <p className={styles.text}>{item.onReturn}</p>
      </Field>
      <Field label="Alternative">
        <p className={styles.text}>{item.alternative}</p>
      </Field>
      <Field label="Not confirmed" tone="attention">
        <p className={styles.text}>{item.notConfirmed}</p>
      </Field>
      <EvidenceLinks links={item.links} />
    </SummaryAccordion>
  )
}

export function DecisionsSection({ summary }: { summary: ReviewerSummary }) {
  const { openId, toggle } = useSingleOpenAccordion<string>()
  return (
    <section className={styles.section}>
      <SectionHeader
        title="4. Decisions to review"
        intro="Positions and year-over-year changes on this return, with the support behind each one. Within each group, items are ordered by tax effect."
      />
      {DECISION_GROUP_ORDER.map(group => {
        const items = summary.decisions.filter(item => item.group === group)
        if (!items.length) return null
        return (
          <div key={group} className={styles.group}>
            <h3 className={styles.groupHeading}>{DECISION_GROUP_LABELS[group]}</h3>
            <div className={styles.cardList}>
              {items.map(item => (
                <DecisionCard
                  key={item.id}
                  item={item}
                  open={openId === item.id}
                  onToggle={() => toggle(item.id)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
