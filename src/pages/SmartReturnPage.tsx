import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import SmartReturnHeader from './SmartReturnHeader'
import SmartReturnDocumentHub from './SmartReturnDocumentHub'
import IASShell from './data-review/IASShell'
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalActions } from '@ids-ts/modal-dialog'
import '@ids-ts/modal-dialog/dist/main.css'
import { Button } from '@ids-ts/button'
import '@ids-ts/button/dist/main.css'
import { B2 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import { CLIENT_DOCS_ARRIVED_KEY } from '../data/clientOnboarding'
import styles from '../styles/SmartReturnPage.module.css'
import { OUTPUT_REVIEW_PATH, setStoredDemoRole } from '../lib/prototypeRoutes'

/**
 * The flag is one-shot, but StrictMode invokes state initializers twice — so
 * the answer is latched here rather than re-read, or the second call would
 * find the key already consumed and report no arrival.
 */
let docsArrivedLatch: boolean | null = null

function readDocsArrivedFlag(): boolean {
  if (docsArrivedLatch !== null) return docsArrivedLatch
  try {
    docsArrivedLatch = sessionStorage.getItem(CLIENT_DOCS_ARRIVED_KEY) === '1'
    if (docsArrivedLatch) sessionStorage.removeItem(CLIENT_DOCS_ARRIVED_KEY)
  } catch {
    docsArrivedLatch = false
  }
  return docsArrivedLatch
}

export default function SmartReturnPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')
  const [reviewRole, setReviewRole] = useState<'preparer' | 'reviewer'>(() =>
    roleParam === 'reviewer' ? 'reviewer' : 'preparer',
  )

  useEffect(() => {
    setStoredDemoRole(reviewRole)
  }, [reviewRole])

  useEffect(() => {
    setReviewRole(roleParam === 'reviewer' ? 'reviewer' : 'preparer')
  }, [roleParam])

  useEffect(() => {
    const el = document.documentElement
    const prevTheme = el.getAttribute('data-theme')
    el.setAttribute('data-theme', 'intuit')
    el.style.setProperty('--color-action-standard', '#205ea3')
    el.style.setProperty('--color-action-standard-hover', '#174d87')
    el.style.setProperty('--color-action-standard-active', '#174d87')
    return () => {
      if (prevTheme) el.setAttribute('data-theme', prevTheme)
      el.style.removeProperty('--color-action-standard')
      el.style.removeProperty('--color-action-standard-hover')
      el.style.removeProperty('--color-action-standard-active')
    }
  }, [])

  /**
   * Arriving from onboarding jumps the clock forward: the modal announces that
   * Tina's documents landed while the preparer was away.
   */
  const [docsArrived] = useState(readDocsArrivedFlag)
  const [docsArrivedOpen, setDocsArrivedOpen] = useState(false)

  useEffect(() => {
    if (!docsArrived) return
    // IDS modals animate in from a closed state, so open on the next tick.
    const timer = setTimeout(() => setDocsArrivedOpen(true), 50)
    return () => clearTimeout(timer)
  }, [docsArrived])

  const handleReviewReturn = () => {
    navigate(OUTPUT_REVIEW_PATH)
  }

  const isReviewer = reviewRole === 'reviewer'

  return (
    <div className={styles.page} data-theme="intuit">
      <IASShell>
        <SmartReturnHeader
          activeTab="smartreturn"
          showReviewReturn={isReviewer}
          onReviewReturn={handleReviewReturn}
        />

        <SmartReturnDocumentHub readOnly={isReviewer} />
      </IASShell>

      <Modal
        open={docsArrivedOpen}
        onClose={() => setDocsArrivedOpen(false)}
        size="small"
        dismissible
      >
        <ModalHeader
          alignment="center"
          transparentBackground
          onClose={() => setDocsArrivedOpen(false)}
        >
          <ModalTitle title="Tina sent her documents" />
        </ModalHeader>
        <ModalContent alignment="center">
          <B2 className={styles.docsArrivedBody}>
            A few days later — she answered the questionnaire, signed the engagement letter, and
            uploaded everything on the checklist through her client portal.
          </B2>
        </ModalContent>
        <ModalActions alignment="center">
          <Button priority="primary" onClick={() => setDocsArrivedOpen(false)}>
            Pick up the return
          </Button>
        </ModalActions>
      </Modal>
    </div>
  )
}
