import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@ids-ts/button'
import '@ids-ts/button/dist/main.css'
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalActions } from '@ids-ts/modal-dialog'
import '@ids-ts/modal-dialog/dist/main.css'
import { B2 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import SmartReturnHeader from './SmartReturnHeader'
import SmartReturnDocumentHub from './SmartReturnDocumentHub'
import IASShell from './data-review/IASShell'
import welcomeIllustration from '../assets/welcome-illustration.png'
import styles from '../styles/SmartReturnPage.module.css'
import { OUTPUT_REVIEW_PATH, setStoredDemoRole } from '../lib/prototypeRoutes'

export default function SmartReturnPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')
  const skipBooksFlow = searchParams.get('skipBooks') === '1'
  const [reviewRole, setReviewRole] = useState<'preparer' | 'reviewer'>(() =>
    roleParam === 'reviewer' ? 'reviewer' : 'preparer',
  )
  const [welcomeOpen, setWelcomeOpen] = useState(false)

  useEffect(() => {
    setStoredDemoRole(reviewRole)
  }, [reviewRole])

  useEffect(() => {
    setReviewRole(roleParam === 'reviewer' ? 'reviewer' : 'preparer')
  }, [roleParam])

  useEffect(() => {
    if (searchParams.get('welcome') !== '1') return
    const timer = setTimeout(() => setWelcomeOpen(true), 50)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

        <SmartReturnDocumentHub readOnly={isReviewer} skipBooksFlow={skipBooksFlow} />
      </IASShell>

      {/* Demo shortcut — starts straight on SmartReturn, skipping the 1040 import flow. */}
      <Modal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} size="medium" dismissible>
        <ModalHeader alignment="center" transparentBackground onClose={() => setWelcomeOpen(false)} />
        <ModalContent alignment="center">
          <img src={welcomeIllustration} alt="" className={styles.welcomeModalIllustration} />
          <ModalTitle title="Welcome to our tax demo" />
          <B2 className={styles.welcomeModalBody}>
            You&rsquo;re Amanda at Beasley &amp; Howe. Today you&rsquo;ll work on Tina&rsquo;s taxes
            using a new experience designed for tax prep and strategy.
          </B2>
        </ModalContent>
        <ModalActions alignment="center">
          <Button priority="primary" onClick={() => setWelcomeOpen(false)}>
            Get started
          </Button>
        </ModalActions>
      </Modal>
    </div>
  )
}
