import { useNavigate } from 'react-router-dom'
import { CircleCheckFill, ChevronRight } from '@design-systems/icons'
import { Button } from '@ids-ts/button'
import '@ids-ts/button/dist/main.css'
import { H4, B2, B4 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import { ONBOARDING_DOCUMENTS } from '../data/clientOnboarding'
import styles from '../styles/ClientPortalHandoffPage.module.css'

export default function ClientPortalHandoffPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page} data-theme="intuit">
      <div className={styles.card}>
        <CircleCheckFill size="xlarge" className={styles.icon} aria-hidden />

        <B4 weight="demi" className={styles.eyebrow}>
          Two weeks later
        </B4>

        <H4 as="h1" weight="demi" className={styles.title}>
          Tina sent her documents
        </H4>

        <B2 className={styles.body}>
          She answered the questionnaire, signed the engagement letter, and uploaded everything on
          the checklist through the client portal. It&rsquo;s all waiting in her return.
        </B2>

        <ul className={styles.docs}>
          {ONBOARDING_DOCUMENTS.map(doc => (
            <li key={doc.name} className={styles.doc}>
              <CircleCheckFill size="small" className={styles.docIcon} aria-hidden />
              {doc.name}
            </li>
          ))}
        </ul>

        <Button
          priority="primary"
          onClick={() => navigate('/smart-return')}
          automationId="client-portal-continue-cta"
        >
          Pick up the return
          <ChevronRight size="small" aria-hidden />
        </Button>
      </div>
    </div>
  )
}
