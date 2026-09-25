import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Close,
  CommentPencil,
  CircleCheckFill,
  Edit,
  ChevronDown,
  ChevronUp,
  List,
  Folder,
  Document,
  CircleQuestion,
  CirclePlus,
  OverflowWeb,
  Copy,
  Download,
  ThumbUp,
  ThumbDown,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  NewWindow,
  Send,
  Plus,
} from '@design-systems/icons'
import { Button } from '@ids-ts/button'
import '@ids-ts/button/dist/main.css'
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalActions } from '@ids-ts/modal-dialog'
import '@ids-ts/modal-dialog/dist/main.css'
import { H5, B2, B3 } from '@ids-ts/typography'
import '@ids-ts/typography/dist/main.css'
import {
  ONBOARDING_QUESTIONS,
  ONBOARDING_DOCUMENTS,
  ENGAGEMENT_LETTER_PARAGRAPHS,
} from '../data/clientOnboarding'
import prior1040 from '../assets/jessica-1040-2024-variant-1.png'
import intuitSparkle from '../assets/icons/intuit-assist-sparkle.svg'
import styles from '../styles/ClientOnboardingPage.module.css'

type Section = 'questionnaire' | 'documents' | 'engagement'

/** Chat states: the agent's greeting, then the generated client documents. */
type ChatStage = 'welcome' | 'generated'

function SectionHeader({
  icon,
  label,
  expanded,
  onToggle,
}: {
  icon: React.ReactNode
  label: string
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button type="button" className={styles.sectionHeader} aria-expanded={expanded} onClick={onToggle}>
      <span className={styles.sectionLabel}>
        {icon}
        {label}
      </span>
      {expanded ? <ChevronUp size="small" aria-hidden /> : <ChevronDown size="small" aria-hidden />}
    </button>
  )
}

export default function ClientOnboardingPage() {
  const navigate = useNavigate()
  // IDS Modal animates in from a closed state, so it must flip to open after mount.
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [stage, setStage] = useState<ChatStage>('welcome')
  const [generating, setGenerating] = useState(false)
  const [expanded, setExpanded] = useState<Section | null>('questionnaire')
  const [sent, setSent] = useState(false)
  const [handoffOpen, setHandoffOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setWelcomeOpen(true), 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!generating) return
    const timer = setTimeout(() => {
      setGenerating(false)
      setStage('generated')
    }, 2200)
    return () => clearTimeout(timer)
  }, [generating])

  const toggle = (section: Section) =>
    setExpanded(current => (current === section ? null : section))

  return (
    <div className={styles.page} data-theme="intuit">
      <div className={styles.trowser}>
        <header className={styles.header}>
          <h1 className={styles.title}>Automated client onboarding</h1>
          <div className={styles.headerRight}>
            <button type="button" className={styles.headerBtn}>
              <CommentPencil size="small" aria-hidden />
              Feedback
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Close"
              onClick={() => navigate('/smart-return')}
            >
              <Close size="small" />
            </button>
          </div>
        </header>

        <div className={styles.body}>
          {/* Left: prior-year return */}
          <section className={styles.docPane} aria-label="Prior year return">
            <div className={styles.docHeader}>
              <div>
                <p className={styles.docName}>Tina Yuan 1040.pdf</p>
                <p className={styles.docMeta}>Form 1040 · Tax year 2024</p>
              </div>
              <button type="button" className={styles.iconBtn} aria-label="Document options">
                <OverflowWeb size="small" />
              </button>
            </div>

            <div className={styles.docViewer}>
              <img src={prior1040} alt="Tina Yuan's 2024 Form 1040" className={styles.docImage} />
            </div>

            <div className={styles.docFooter}>
              <span className={styles.zoomLevel}>100%</span>
              <button type="button" className={styles.iconBtn} aria-label="Zoom out">
                <ZoomOut size="small" />
              </button>
              <button type="button" className={styles.iconBtn} aria-label="Zoom in">
                <ZoomIn size="small" />
              </button>
              <button type="button" className={styles.iconBtn} aria-label="Open in new window">
                <NewWindow size="small" />
              </button>
              <span className={styles.pageControl}>
                Page <span className={styles.pageBox}>1</span> / 2
              </span>
              <button type="button" className={styles.iconBtn} aria-label="Previous page">
                <ArrowUp size="small" />
              </button>
              <button type="button" className={styles.iconBtn} aria-label="Next page">
                <ArrowDown size="small" />
              </button>
            </div>
          </section>

          {/* Right: agent chat */}
          <section className={styles.chatPane} aria-label="Intuit Assist">
            <div className={styles.chatScroll}>
              {stage === 'welcome' && !generating ? (
                <div className={styles.welcome}>
                  <img src={intuitSparkle} alt="" className={styles.sparkle} />
                  <H5 as="h2" weight="demi" className={styles.welcomeTitle}>
                    Hi, Amanda
                  </H5>
                  <B2 className={styles.welcomeBody}>How can I help you?</B2>

                  <div className={styles.chips}>
                    <button
                      type="button"
                      className={styles.chip}
                      onClick={() => setGenerating(true)}
                    >
                      Create questionnaire and document checklist
                    </button>
                    <button type="button" className={styles.chip}>
                      Summarize last year&rsquo;s 1040
                    </button>
                    <button type="button" className={styles.chip}>
                      Create billing estimate
                    </button>
                  </div>
                </div>
              ) : null}

              {generating ? (
                <div className={styles.generating} role="status" aria-live="polite">
                  <img src={intuitSparkle} alt="" className={styles.sparkleSmall} />
                  <B2 className={styles.generatingText}>
                    Reading Tina Yuan&rsquo;s prior-year 1040 and drafting her questionnaire and
                    document checklist&hellip;
                  </B2>
                </div>
              ) : null}

              {stage === 'generated' ? (
                <div className={styles.thread}>
                  <div className={styles.userMessage}>Create client questionnaire &amp; checklist</div>

                  <B3 className={styles.agentText}>
                    Your client documents are ready. You can add, edit, or remove items directly in
                    the documents or request changes through the chat.
                  </B3>
                  <B3 className={styles.agentText}>
                    <strong>Note:</strong> You can <strong>Send to client</strong> now, or click{' '}
                    <strong>Save for later</strong> to keep this draft. Once saved, your request
                    will be waiting for you in the Tax Organizer and Intuit Link.
                  </B3>

                  <div className={styles.card}>
                    <SectionHeader
                      icon={<List size="small" aria-hidden />}
                      label="Questionnaire"
                      expanded={expanded === 'questionnaire'}
                      onToggle={() => toggle('questionnaire')}
                    />
                    {expanded === 'questionnaire' ? (
                      <div className={styles.sectionBody}>
                        {ONBOARDING_QUESTIONS.map(question => (
                          <div key={question} className={styles.listRow}>
                            <span className={styles.listText}>{question}</span>
                            <span className={styles.rowActions}>
                              <CircleQuestion size="small" aria-hidden className={styles.rowIcon} />
                              <OverflowWeb size="small" aria-hidden className={styles.rowIcon} />
                            </span>
                          </div>
                        ))}
                        <button type="button" className={styles.addRow}>
                          <CirclePlus size="small" aria-hidden />
                          Add question
                        </button>
                      </div>
                    ) : null}

                    <SectionHeader
                      icon={<Folder size="small" aria-hidden />}
                      label="Document checklist"
                      expanded={expanded === 'documents'}
                      onToggle={() => toggle('documents')}
                    />
                    {expanded === 'documents' ? (
                      <div className={styles.sectionBody}>
                        {ONBOARDING_DOCUMENTS.map(doc => (
                          <div key={doc.name} className={styles.listRow}>
                            <span className={styles.listText}>
                              <span className={styles.docTitle}>{doc.name}</span>
                              <span className={styles.docDetail}>{doc.detail}</span>
                            </span>
                            <span className={styles.rowActions}>
                              <OverflowWeb size="small" aria-hidden className={styles.rowIcon} />
                            </span>
                          </div>
                        ))}
                        <button type="button" className={styles.addRow}>
                          <CirclePlus size="small" aria-hidden />
                          Add document
                        </button>
                      </div>
                    ) : null}

                    <SectionHeader
                      icon={<Document size="small" aria-hidden />}
                      label="Engagement letter"
                      expanded={expanded === 'engagement'}
                      onToggle={() => toggle('engagement')}
                    />
                    {expanded === 'engagement' ? (
                      <div className={styles.sectionBody}>
                        <div className={styles.letterToolbar}>
                          <button type="button" className={styles.letterEdit}>
                            <Edit size="small" aria-hidden />
                            Edit
                          </button>
                        </div>
                        <div className={styles.letterBody}>
                          {ENGAGEMENT_LETTER_PARAGRAPHS.map(paragraph => (
                            <p key={paragraph.slice(0, 40)} className={styles.letterParagraph}>
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className={styles.cardControls}>
                    <Copy size="small" aria-hidden />
                    <Download size="small" aria-hidden />
                    <ThumbUp size="small" aria-hidden />
                    <ThumbDown size="small" aria-hidden />
                  </div>

                  {sent ? null : (
                    <div className={styles.quickActions}>
                      <button type="button" className={styles.quickAction}>
                        Draft email to client
                      </button>
                      <button
                        type="button"
                        className={`${styles.quickAction} ${styles.quickActionPrimary}`}
                        onClick={() => setSent(true)}
                      >
                        <Send size="small" aria-hidden />
                        Send to client
                      </button>
                    </div>
                  )}

                  {sent ? (
                    <>
                      <div className={styles.userMessage}>Send to client</div>

                      <div className={styles.sentRow} role="status" aria-live="polite">
                        <CircleCheckFill size="small" className={styles.sentIcon} aria-hidden />
                        <B3 className={styles.agentText}>
                          I sent the request to Tina. She&rsquo;ll get a link to her client portal
                          to answer the questionnaire, sign the engagement letter, and upload her
                          documents. What would you like to do next?
                        </B3>
                      </div>

                      <div className={styles.quickActions}>
                        <button type="button" className={styles.quickAction}>
                          Create billing estimate
                        </button>
                        <button type="button" className={styles.quickAction}>
                          Summarize last year&rsquo;s 1040
                        </button>
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className={styles.inputBar}>
              <span className={styles.inputPlaceholder}>Ask Intuit Assist</span>
              <span className={styles.inputIcons}>
                <Plus size="small" aria-hidden />
                <Send size="small" aria-hidden />
              </span>
            </div>
            <p className={styles.aiNote}>Important information about how we use generative AI</p>
          </section>
        </div>

        <footer className={styles.footer}>
          <Button priority="tertiary" onClick={() => navigate('/smart-return')}>
            Cancel
          </Button>
          <Button
            priority="primary"
            onClick={() => (sent ? setHandoffOpen(true) : navigate('/smart-return'))}
          >
            Open return
          </Button>
        </footer>
      </div>

      {/* Demo welcome — first thing the audience sees. */}
      <Modal open={welcomeOpen} onClose={() => setWelcomeOpen(false)} size="small" dismissible>
        <ModalHeader alignment="center" transparentBackground onClose={() => setWelcomeOpen(false)}>
          <ModalTitle title="Welcome to our tax demo" />
        </ModalHeader>
        <ModalContent alignment="center">
          <B2 className={styles.welcomeModalBody}>
            As Beasley &amp; Howe, you&rsquo;ll work on Tina&rsquo;s taxes today.
          </B2>
        </ModalContent>
        <ModalActions alignment="center">
          <Button priority="primary" onClick={() => setWelcomeOpen(false)}>
            Get started
          </Button>
        </ModalActions>
      </Modal>

      {/* Opening the return jumps the clock forward to Tina's reply. */}
      <Modal open={handoffOpen} onClose={() => setHandoffOpen(false)} size="small" dismissible>
        <ModalHeader alignment="center" transparentBackground onClose={() => setHandoffOpen(false)}>
          <ModalTitle title="Tina sent her documents" />
        </ModalHeader>
        <ModalContent alignment="center">
          <B2 className={styles.welcomeModalBody}>
            A few days later — she answered the questionnaire, signed the engagement letter, and
            uploaded everything on the checklist through her client portal.
          </B2>
        </ModalContent>
        <ModalActions alignment="center">
          <Button priority="primary" onClick={() => navigate('/smart-return')}>
            Pick up the return
          </Button>
        </ModalActions>
      </Modal>
    </div>
  )
}
