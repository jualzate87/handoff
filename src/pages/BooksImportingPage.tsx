import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProgressBar } from '@ids-ts/progress-bar'
import '@ids-ts/progress-bar/dist/main.css'
import { H5, B2 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import SmartReturnHeader from './SmartReturnHeader'
import IASShell from './data-review/IASShell'
import qbSyncIcon from '../assets/icons/qb-pto-sync.svg'
import styles from '../styles/BooksFoundPage.module.css'

export default function BooksImportingPage() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(4)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(current => {
        if (current >= 100) {
          clearInterval(interval)
          return 100
        }
        return current + 4
      })
    }, 70)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress < 100) return
    const timer = setTimeout(() => navigate('/import-confirmation'), 500)
    return () => clearTimeout(timer)
  }, [progress, navigate])

  return (
    <div className={styles.page} data-theme="intuit">
      <IASShell>
        <SmartReturnHeader activeTab="inputreturn" />
        <div className={styles.main}>
          <div className={styles.card} role="status" aria-live="polite">
            <img src={qbSyncIcon} alt="" className={styles.syncIcon} />

            <H5 as="h1" weight="demi" className={styles.cardTitle}>
              Importing books data
            </H5>
            <B2 className={styles.cardBody}>
              We&rsquo;re bringing the adjusted amounts into Tina&rsquo;s return.
            </B2>

            <ProgressBar
              className={styles.progressBar}
              value={progress}
              max={100}
              persistent
              automationId="books-importing-progress"
              aria-label="Importing books data"
            />
          </div>
        </div>
      </IASShell>
    </div>
  )
}
