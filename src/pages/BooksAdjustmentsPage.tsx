import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Close, ChevronDown, ChevronRight, Edit, Export } from '@design-systems/icons'
import { Button } from '@ids-ts/button'
import '@ids-ts/button/dist/main.css'
import { Link } from '@ids-ts/link'
import '@ids-ts/link/dist/main.css'
import {
  BOOKS_ADJUSTMENT_SECTIONS,
  formatAmount,
  taxAmount,
  type BooksAdjustmentRow,
} from '../data/booksAdjustments'
import styles from '../styles/BooksAdjustmentsPage.module.css'

function AmountCells({ bookAmount, adjustment }: { bookAmount?: number; adjustment?: number }) {
  if (bookAmount === undefined || adjustment === undefined) {
    return (
      <>
        <td className={styles.amountCell} />
        <td className={styles.amountCell} />
        <td className={styles.amountCell} />
      </>
    )
  }
  return (
    <>
      <td className={`${styles.amountCell} ${styles.bookCell}`}>{formatAmount(bookAmount)}</td>
      <td className={styles.amountCell}>{formatAmount(adjustment)}</td>
      <td className={styles.amountCell}>{formatAmount(taxAmount(bookAmount, adjustment))}</td>
    </>
  )
}

function Row({ row }: { row: BooksAdjustmentRow }) {
  const [expanded, setExpanded] = useState(row.line === '1a')
  const hasChildren = Boolean(row.children?.length)

  const childTotal = (row.children ?? []).reduce(
    (acc, child) => ({
      bookAmount: acc.bookAmount + child.bookAmount,
      adjustment: acc.adjustment + child.adjustment,
    }),
    { bookAmount: 0, adjustment: 0 },
  )

  return (
    <>
      <tr className={styles.row}>
        <td className={styles.taxLineCell}>
          <div className={styles.taxLine}>
            {hasChildren ? (
              <button
                type="button"
                className={styles.disclosure}
                aria-expanded={expanded}
                aria-label={expanded ? `Collapse ${row.label}` : `Expand ${row.label}`}
                onClick={() => setExpanded(prev => !prev)}
              >
                {expanded ? <ChevronDown size="small" /> : <ChevronRight size="small" />}
              </button>
            ) : (
              <span className={styles.disclosureSpacer} />
            )}
            <span>
              <strong>{row.line}</strong> {row.label}
            </span>
          </div>
        </td>
        <td className={styles.accountCell}>
          <span className={styles.accountText}>{row.account}</span>
          <Edit size="small" className={styles.editIcon} aria-hidden />
        </td>
        {hasChildren ? (
          <AmountCells bookAmount={undefined} adjustment={undefined} />
        ) : (
          <AmountCells bookAmount={row.bookAmount} adjustment={row.adjustment} />
        )}
      </tr>

      {hasChildren && expanded
        ? [
            ...(row.children ?? []).map(child => (
              <tr key={child.account} className={styles.row}>
                <td className={styles.taxLineCell} />
                <td className={styles.accountCell}>
                  <span className={styles.accountText}>{child.account}</span>
                  <Edit size="small" className={styles.editIcon} aria-hidden />
                </td>
                <AmountCells bookAmount={child.bookAmount} adjustment={child.adjustment} />
              </tr>
            )),
            <tr key="total" className={styles.row}>
              <td className={styles.taxLineCell} />
              <td className={styles.accountCell}>
                <strong>Total</strong>
              </td>
              <AmountCells bookAmount={childTotal.bookAmount} adjustment={childTotal.adjustment} />
            </tr>,
          ]
        : null}
    </>
  )
}

export default function BooksAdjustmentsPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page} data-theme="intuit">
      <div className={styles.trowser} role="dialog" aria-modal="true" aria-label="Books to tax adjustments">
        <header className={styles.header}>
          <h1 className={styles.title}>Books to tax adjustments</h1>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close"
            onClick={() => navigate('/books-found')}
          >
            <Close size="small" />
          </button>
        </header>

        <div className={styles.subHeader}>
          <div className={styles.subHeaderLeft}>
            <p className={styles.clientLine}>Tina Yuan &middot; 1040</p>
            <p className={styles.note}>
              Changes made here will not affect QuickBooks.{' '}
              <Link href="#" onClick={e => e.preventDefault()}>
                Learn more about tax adjustments.
              </Link>
            </p>
          </div>
          <div className={styles.subHeaderRight}>
            <div className={styles.subHeaderActions}>
              <Button priority="secondary">Bring data from QuickBooks</Button>
              <Button priority="primary">Create tax adjustment</Button>
            </div>
            <p className={styles.savedAt}>
              Saved at 2:21 PM
              <Export size="small" aria-hidden className={styles.savedIcon} />
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col" className={styles.taxLineCell}>
                  Tax line
                </th>
                <th scope="col" className={styles.accountCell}>
                  Account
                </th>
                <th scope="col" className={`${styles.amountCell} ${styles.bookCell}`}>
                  Book amount
                </th>
                <th scope="col" className={styles.amountCell}>
                  Adjustment
                </th>
                <th scope="col" className={styles.amountCell}>
                  Tax amount
                </th>
              </tr>
            </thead>
            {BOOKS_ADJUSTMENT_SECTIONS.map((section, index) => (
              <tbody key={section.title ?? index}>
                {section.title ? (
                  <tr>
                    <td colSpan={5} className={styles.sectionHeader}>
                      {section.title}
                    </td>
                  </tr>
                ) : null}
                {section.rows.map(row => (
                  <Row key={`${row.line}-${row.label}`} row={row} />
                ))}
              </tbody>
            ))}
          </table>
        </div>

        <footer className={styles.footer}>
          <Button priority="tertiary">Cancel</Button>
          <div className={styles.footerRight}>
            <Button priority="secondary" onClick={() => navigate('/books-importing')}>
              Review form and import
            </Button>
            <Button
              priority="primary"
              onClick={() => navigate('/books-importing')}
              automationId="books-import-cta"
            >
              Import
            </Button>
          </div>
        </footer>
      </div>
    </div>
  )
}
