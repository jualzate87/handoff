import { Modal, ModalHeader, ModalContent, ModalActions } from '@ids-ts/modal-dialog'
import '@ids-ts/modal-dialog/dist/main.css'
import { Button } from '@ids-ts/button'
import '@ids-ts/button/dist/main.css'
import { NewWindow } from '@design-systems/icons'
import { H4, B2, B4 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import itaLogo from '../assets/ita-logo.svg'
import styles from '../styles/TaxAdvisoryModal.module.css'

/** Alex's Tax Plan Studio walkthrough — a separate prototype, opened alongside this one. */
const TAX_PLAN_STUDIO_URL = 'https://github.intuit.com/pages/abelmonte/taxplanstudio-walkthrough/'

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
    <Modal open={open} onClose={onClose} size="medium" dismissible>
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
