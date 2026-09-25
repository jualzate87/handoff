import { B2, B3 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import intuitIntelligenceLogo from '../assets/icons/intuit-intelligence-logo-small.svg'
import styles from '../styles/ReturnReadyMessage.module.css'

/**
 * Shown on the output forms once Intuit Intelligence has cleared the
 * diagnostics — the closing beat that the return is in a filable state.
 */
export default function ReturnReadyMessage() {
  return (
    <div className={styles.card} role="status">
      <span className={styles.titleRow}>
        <img src={intuitIntelligenceLogo} alt="" className={styles.mark} />
        <B2 weight="demi" className={styles.title}>
          Return review complete
        </B2>
      </span>
      <B3 className={styles.body}>
        All critical issues are cleared and calculations are accurate. It&rsquo;s ready to share
        with Tina.
      </B3>
    </div>
  )
}
