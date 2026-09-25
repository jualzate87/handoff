import PageMessage from '@ids-ts/page-message'
import '@ids-ts/page-message/dist/main.css'
import { B3 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import intuitIntelligenceLogo from '../assets/icons/intuit-intelligence-logo-small.svg'
import styles from '../styles/ReturnReadyMessage.module.css'

/**
 * Shown on the output forms once Intuit Intelligence has cleared the
 * diagnostics — the closing beat that the return is in a filable state.
 */
export default function ReturnReadyMessage() {
  return (
    <div className={styles.wrap}>
      <PageMessage type="success" title="No open diagnostics" open dismissible={false}>
        <div className={styles.body}>
          <img src={intuitIntelligenceLogo} alt="" className={styles.mark} />
          <B3 className={styles.text}>
            Intuit Intelligence cleared the fatal, EF critical, and critical diagnostics, and the
            return calculates clean. It&rsquo;s ready to share with Tina.
          </B3>
        </div>
      </PageMessage>
    </div>
  )
}
