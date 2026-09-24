import { Search, Notification, Settings, CircleQuestion, ChevronDown } from '@design-systems/icons'
import iaPropeller from '../../assets/icons/intuit-intelligence-logo-small.svg'
import styles from '../../styles/data-review/IASTopBar.module.css'

interface IASTopBarProps {
  firmName?: string
  userInitial?: string
}

export default function IASTopBar({
  firmName = 'Beasley & Howe Financials',
  userInitial = 'A',
}: IASTopBarProps) {
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
        <span className={styles.avatar}>{userInitial}</span>
        <button type="button" className={styles.iconButton} aria-label="Intuit Assist">
          <img src={iaPropeller} alt="" className={styles.propeller} />
        </button>
      </div>
    </div>
  )
}
