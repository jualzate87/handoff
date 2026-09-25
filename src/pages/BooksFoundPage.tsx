import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from '@design-systems/icons'
import { Button } from '@ids-ts/button'
import '@ids-ts/button/dist/main.css'
import { ProgressBar } from '@ids-ts/progress-bar'
import '@ids-ts/progress-bar/dist/main.css'
import { H5, B2 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import SmartReturnHeader from './SmartReturnHeader'
import IASShell from './data-review/IASShell'
import qbSyncIcon from '../assets/icons/qb-pto-sync.svg'
import styles from '../styles/BooksFoundPage.module.css'

export default function BooksFoundPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page} data-theme="intuit">
      <IASShell>
        <SmartReturnHeader activeTab="inputreturn" />
        <div className={styles.main}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Button
              priority="tertiary"
              size="small"
              className={styles.breadcrumbBtn}
              onClick={() => navigate('/smart-return')}
            >
              <ChevronLeft size="small" aria-hidden />
              Back to SmartReturn
            </Button>
          </nav>

          <div className={styles.card} role="status" aria-live="polite">
            <img src={qbSyncIcon} alt="" className={styles.syncIcon} />

            <H5 as="h1" weight="demi" className={styles.cardTitle}>
              We found books data for your client
            </H5>
            <B2 className={styles.cardBody}>
              You can import their books to save time. Review it first, and make changes if you
              need to.
            </B2>

            <ProgressBar
              className={styles.progressBar}
              value={100}
              max={100}
              persistent
              automationId="books-found-progress"
              aria-label="Books data found"
            />

            <div className={styles.actions}>
              <Button priority="secondary" onClick={() => navigate('/import-confirmation')}>
                Don&rsquo;t import
              </Button>
              <Button
                priority="primary"
                onClick={() => navigate('/books-adjustments')}
                automationId="books-review-and-import-cta"
              >
                Review and import
              </Button>
            </div>
          </div>

        </div>
      </IASShell>
    </div>
  )
}
