import { Search, Notification, Settings, CircleQuestion, ChevronDown } from '@design-systems/icons'
import { useReturnWorkflow } from '../../contexts/ReturnWorkflowContext'
import iaPropeller from '../../assets/icons/intuit-intelligence-logo-small.svg'
import styles from '../../styles/data-review/IASTopBar.module.css'

interface IASTopBarProps {
  firmName?: string
}

export default function IASTopBar({ firmName = 'Beasley & Howe Financials' }: IASTopBarProps) {
  const { currentUser } = useReturnWorkflow()

  return (
    <div className={styles.topBar}>
      <button type="button" className={styles.companySwitcher}>
        <span className={styles.companyName}>{firmName}</span>
        <ChevronDown size="small" />
      </button>

      <div className={styles.searchWrap}>
        <div className={styles.search}>
          <Search size="small" className={styles.searchIcon} />
          <span className={styles.searchPlaceholder}>
            Navigate or search for transactions, contacts, reports, help, and more.
          </span>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.iconButton} aria-label="Notifications">
          <Notification size="small" />
        </button>
        <button type="button" className={styles.iconButton} aria-label="Settings">
          <Settings size="small" />
        </button>
        <button type="button" className={styles.iconButton} aria-label="Help">
          <CircleQuestion size="small" />
        </button>
        <span
          className={styles.avatar}
          style={{ background: currentUser.avatarColor }}
          title={`Signed in as ${currentUser.name}`}
          aria-label={`Signed in as ${currentUser.name}`}
        >
          {currentUser.initial}
        </span>
        <button type="button" className={styles.iconButton} aria-label="Intuit Intelligence">
          <img src={iaPropeller} alt="" className={styles.propeller} />
        </button>
      </div>
    </div>
  )
}
