import { useNavigate } from 'react-router-dom'
import { ChevronLeft, NewWindow, AiSparkles, ChartLine, Lightbulb } from '@design-systems/icons'
import { Button } from '@ids-ts/button'
import '@ids-ts/button/dist/main.css'
import { H4, H6, B2, B3, B4 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import IASShell from './data-review/IASShell'
import SmartReturnHeader from './SmartReturnHeader'
import itaLogo from '../assets/ita-logo.svg'
import styles from '../styles/TaxAdvisoryInterstitialPage.module.css'

const POINTS = [
  {
    Icon: AiSparkles,
    title: 'Strategies from the return',
    body: "Tina's filed numbers carry straight over — no re-entry to start planning.",
  },
  {
    Icon: ChartLine,
    title: 'Savings you can quantify',
    body: 'Model each strategy side by side and see the projected tax impact.',
  },
  {
    Icon: Lightbulb,
    title: 'A plan worth presenting',
    body: 'Turn the analysis into a client-ready plan you can walk through together.',
  },
]

/** Alex's Tax Plan Studio walkthrough — a separate prototype, opened alongside this one. */
const TAX_PLAN_STUDIO_URL = 'https://github.intuit.com/pages/abelmonte/taxplanstudio-walkthrough/'

function openTaxPlanStudio() {
  window.open(TAX_PLAN_STUDIO_URL, '_blank', 'noopener')
}

export default function TaxAdvisoryInterstitialPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page} data-theme="intuit">
      <IASShell>
        <SmartReturnHeader activeTab="checkreturns" />
        <div className={styles.main}>
          <div className={styles.card}>
            <img src={itaLogo} alt="" className={styles.logo} />

            <B4 weight="demi" className={styles.eyebrow}>
              Introducing ITA 2.0
            </B4>

            <H4 as="h1" weight="demi" className={styles.title}>
              Ready for tax advisory
            </H4>

            <B2 className={styles.body}>
              The return is accurate and reviewed. Intuit Tax Advisor picks up from here — turning
              what you just verified into planning strategies for Tina.
            </B2>

            <div className={styles.actions}>
              <Button priority="secondary" onClick={() => navigate('/check-return')}>
                <ChevronLeft size="small" aria-hidden />
                Back to the return
              </Button>
              <Button priority="primary" onClick={openTaxPlanStudio}>
                Create tax plan
                <NewWindow size="small" aria-hidden />
              </Button>
            </div>

            <div className={styles.points}>
              {POINTS.map(({ Icon, title, body }) => (
                <div key={title} className={styles.point}>
                  <Icon size="medium" className={styles.pointIcon} aria-hidden />
                  <H6 as="h2" weight="demi" className={styles.pointTitle}>
                    {title}
                  </H6>
                  <B3 className={styles.pointBody}>{body}</B3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </IASShell>
    </div>
  )
}
