import { Modal, ModalHeader, ModalContent, ModalActions } from '@ids-ts/modal-dialog'
import '@ids-ts/modal-dialog/dist/main.css'
import { Button } from '@ids-ts/button'
import '@ids-ts/button/dist/main.css'
import { NewWindow, AiSparkles, ChartLine, Lightbulb } from '@design-systems/icons'
import { H4, H6, B2, B3, B4 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import itaLogo from '../assets/ita-logo.svg'
import styles from '../styles/TaxAdvisoryModal.module.css'

/** Alex's Tax Plan Studio walkthrough — a separate prototype, opened alongside this one. */
const TAX_PLAN_STUDIO_URL = 'https://github.intuit.com/pages/abelmonte/taxplanstudio-walkthrough/'

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

interface TaxAdvisoryModalProps {
  open: boolean
  onClose: () => void
}

export default function TaxAdvisoryModal({ open, onClose }: TaxAdvisoryModalProps) {
  const handleOpenStudio = () => {
    window.open(TAX_PLAN_STUDIO_URL, '_blank', 'noopener')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} size="large" dismissible>
      <ModalHeader alignment="center" transparentBackground onClose={onClose} />
      <ModalContent alignment="center">
        <div className={styles.body}>
          <img src={itaLogo} alt="" className={styles.logo} />

          <B4 weight="demi" className={styles.eyebrow}>
            Introducing ITA 2.0
          </B4>

          <H4 as="h2" weight="demi" className={styles.title}>
            Ready for tax advisory
          </H4>

          <B2 className={styles.intro}>
            The return is accurate and reviewed. Intuit Tax Advisor picks up from here — turning
            what you just verified into planning strategies for Tina.
          </B2>

          <div className={styles.points}>
            {POINTS.map(({ Icon, title, body }) => (
              <div key={title} className={styles.point}>
                <Icon size="medium" className={styles.pointIcon} aria-hidden />
                <H6 as="h3" weight="demi" className={styles.pointTitle}>
                  {title}
                </H6>
                <B3 className={styles.pointBody}>{body}</B3>
              </div>
            ))}
          </div>
        </div>
      </ModalContent>
      <ModalActions alignment="right">
        <Button priority="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button priority="primary" onClick={handleOpenStudio} automationId="open-tax-advisor-cta">
          Open Tax Advisor
          <NewWindow size="small" aria-hidden />
        </Button>
      </ModalActions>
    </Modal>
  )
}
