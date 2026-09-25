import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Close,
  MenuExpand,
  CommentPencil,
  ClockCounterclockwise,
  PopOut,
} from '@design-systems/icons'
import { IconControl } from '@ids-ts/icon-control'
import '@ids-ts/icon-control/dist/main.css'
import intuitWordmark from '../assets/intuit-wordmark.svg'
import {
  INTELLIGENCE_CHAT_PLACEHOLDER,
  INTELLIGENCE_LEGAL_DISCLAIMER,
  INTELLIGENCE_CLOSE_ARIA,
  INTELLIGENCE_LOADING_TITLE,
  STARTER_PROMPT_CATCH_UP,
  STARTER_PROMPT_FULL_REVIEW,
} from './agent-review/agentIntelligenceCopy'
import AgentWelcomePane from './agent-review/AgentWelcomePane'
import { useReturnWorkflow } from '../contexts/ReturnWorkflowContext'
import { firstName } from '../lib/returnWorkflow'
import AgentReviewDiagnosticsPane from './agent-review/AgentReviewDiagnosticsPane'
import AgentCatchUpPane from './agent-review/AgentCatchUpPane'
import AgentReviewProcessingPane from './agent-review/AgentReviewProcessingPane'
import AgentReviewLayoutMenu from './agent-review/AgentReviewLayoutMenu'
import CheckReturnPage from './CheckReturnPage'
import {
  persistLayoutMode,
  resolveInitialLayoutMode,
  type AgentReviewLayoutMode,
} from './agent-review/agentReviewLayout'
import type { ProcessingMode } from './agent-review/useAgentProcessingAnimation'
import {
  clearAgentSession,
  isResumableStep,
  loadAgentHistory,
  loadAgentSession,
  saveAgentSession,
  type AgentHistoryEntry,
  type AgentStep,
} from './agent-review/agentReviewSession'
import AgentLoadingPane from './data-review/AgentLoadingPane'
import ChatInput from './automated/ChatInput'
import {
  hasAgentIntelligenceFixes,
  useSyncedReviewState,
} from '../hooks/useSyncedReviewState'
import styles from '../styles/AgentReviewPage.module.css'

const ASSESSING_MS = 3200
/** Keep in step with the sidebar slide-out transition in AgentReviewPage.module.css. */
const SIDEBAR_CLOSE_MS = 240

/**
 * Reopening the panel lands on the last conversation when there is one. An
 * explicit "get caught up" request always starts that summary fresh.
 */
function resolveInitialSession() {
  if (sessionStorage.getItem('protoc3-open-catch-up') === '1') {
    return {
      step: 'catch-up' as AgentStep,
      processingMode: 'batch' as ProcessingMode,
      resumed: false,
    }
  }
  const saved = loadAgentSession()
  if (saved) return { ...saved, resumed: true }
  return { step: 'welcome' as AgentStep, processingMode: 'batch' as ProcessingMode, resumed: false }
}

export default function AgentReviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useReturnWorkflow()
  const [searchParams] = useSearchParams()
  const [initialSession] = useState(resolveInitialSession)
  const [historyOpen, setHistoryOpen] = useState(false)
  // Read on open so the list reflects conversations saved during this session.
  const historyEntries = useMemo(
    () => (historyOpen ? loadAgentHistory() : []),
    [historyOpen],
  )
  const [step, setStep] = useState<AgentStep>(initialSession.step)
  /** The step restored from a past session — it renders finished instead of replaying. */
  const [resumedStep, setResumedStep] = useState<AgentStep | null>(
    initialSession.resumed ? initialSession.step : null,
  )
  const [layoutMode, setLayoutMode] = useState<AgentReviewLayoutMode>(() =>
    resolveInitialLayoutMode({
      navigationState: location.state,
      searchParams,
    }),
  )
  const [processingMode, setProcessingMode] = useState<ProcessingMode>(
    initialSession.processingMode,
  )
  const [isAssessing, setIsAssessing] = useState(false)
  const [closing, setClosing] = useState(false)
  const [footerChips, setFooterChips] = useState<ReactNode>(null)
  const assessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const agentFixesAppliedRef = useRef(false)
  const { applyAgentIntelligenceFixes, reviewedFields } = useSyncedReviewState()

  const isSidebar = layoutMode === 'sidebar'
  /** The review is only worth reopening once its fixes have landed on the return. */
  const hasCompletedAiReview = hasAgentIntelligenceFixes(reviewedFields)

  useEffect(() => {
    persistLayoutMode(layoutMode)
  }, [layoutMode])

  useEffect(() => {
    const el = document.documentElement
    const prev = el.getAttribute('data-theme')
    el.setAttribute('data-theme', 'intuit')
    el.style.setProperty('--color-action-standard', '#205ea3')
    el.style.setProperty('--color-action-standard-hover', '#174d87')
    el.style.setProperty('--color-action-standard-active', '#174d87')
    return () => {
      if (prev) el.setAttribute('data-theme', prev)
      el.style.removeProperty('--color-action-standard')
      el.style.removeProperty('--color-action-standard-hover')
      el.style.removeProperty('--color-action-standard-active')
      if (assessTimerRef.current) clearTimeout(assessTimerRef.current)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem('protoc3-open-catch-up') === '1') {
      sessionStorage.removeItem('protoc3-open-catch-up')
    }
  }, [])

  useEffect(() => {
    if (step !== 'processing') {
      setFooterChips(null)
    }
  }, [step])

  useEffect(() => {
    if (isResumableStep(step)) saveAgentSession({ step, processingMode })
  }, [processingMode, step])

  /** Sidebar slides out before the route changes; other layouts close at once. */
  const handleClose = () => {
    if (!isSidebar) {
      navigate('/check-return')
      return
    }
    if (closing) return
    setClosing(true)
    closeTimerRef.current = setTimeout(() => navigate('/check-return'), SIDEBAR_CLOSE_MS)
  }

  const handleLayoutChange = (mode: AgentReviewLayoutMode) => {
    if (mode === 'floating') return
    setLayoutMode(mode)
  }

  const startAssessing = () => {
    setIsAssessing(true)
    if (assessTimerRef.current) clearTimeout(assessTimerRef.current)
    assessTimerRef.current = setTimeout(() => {
      setIsAssessing(false)
      assessTimerRef.current = null
    }, ASSESSING_MS)
  }

  /** Any step the user starts here is generated live, so it is never a resumed one. */
  const goToStep = (next: AgentStep) => {
    setResumedStep(null)
    setStep(next)
  }

  const beginDiagnostics = () => {
    goToStep('diagnostics')
    startAssessing()
  }

  const beginProcessing = (mode: ProcessingMode = 'batch') => {
    agentFixesAppliedRef.current = false
    setProcessingMode(mode)
    goToStep('processing')
  }

  const handleNewChat = () => {
    clearAgentSession()
    if (assessTimerRef.current) {
      clearTimeout(assessTimerRef.current)
      assessTimerRef.current = null
    }
    setIsAssessing(false)
    setFooterChips(null)
    setHistoryOpen(false)
    goToStep('welcome')
  }

  /** Reopening a past conversation shows its finished state, without replaying. */
  const handleOpenHistoryEntry = (entry: AgentHistoryEntry) => {
    if (assessTimerRef.current) {
      clearTimeout(assessTimerRef.current)
      assessTimerRef.current = null
    }
    setIsAssessing(false)
    setFooterChips(null)
    setHistoryOpen(false)
    setResumedStep(entry.step)
    goToStep(entry.step)
  }

  const persistAgentFixes = () => {
    if (agentFixesAppliedRef.current) return
    agentFixesAppliedRef.current = true
    applyAgentIntelligenceFixes()
  }

  const openWorkspace = () => {
    persistAgentFixes()
    navigate('/data-review?entry=review-return&startReview=true')
  }

  const handlePromptClick = (prompt: string) => {
    if (prompt === STARTER_PROMPT_FULL_REVIEW) {
      beginDiagnostics()
      return
    }
    if (prompt === STARTER_PROMPT_CATCH_UP) {
      goToStep('catch-up')
    }
  }

  const showChatInput = step !== 'workspace' && !(step === 'diagnostics' && isAssessing)

  return (
    <>
      {isSidebar ? (
        <>
          <div className={styles.sidebarBackdrop} aria-hidden />
          <div
            className={`${styles.proConnectUnderlay} ${
              closing ? styles.proConnectUnderlayClosing : ''
            }`}
          >
            <CheckReturnPage
              embeddedUnderlay
              onCloseIntelligence={handleClose}
              intelligenceClosing={closing}
            />
          </div>
        </>
      ) : null}

      <div
        className={`${styles.shell} ${isSidebar ? styles.shellSidebar : styles.shellFullscreen} ${
          closing ? styles.shellSidebarClosing : ''
        }`}
        data-layout={layoutMode}
        data-theme="intuit"
      >
        <header className={isSidebar ? styles.headerSidebar : styles.header}>
          {isSidebar ? (
            <>
              <div className={styles.headerSidebarStart}>
                <IconControl
                  aria-label="Menu"
                  size="medium"
                  shape="square"
                  onClick={() => undefined}
                >
                  <MenuExpand size="medium" />
                </IconControl>
              </div>
              <div className={styles.headerSidebarEnd}>
                <IconControl
                  aria-label="Open full screen"
                  size="medium"
                  shape="square"
                  onClick={() => setLayoutMode('fullscreen')}
                >
                  <PopOut size="medium" />
                </IconControl>
                <AgentReviewLayoutMenu mode={layoutMode} onChange={handleLayoutChange} />
                <IconControl
                  aria-label={INTELLIGENCE_CLOSE_ARIA}
                  size="medium"
                  shape="square"
                  onClick={handleClose}
                >
                  <Close size="medium" />
                </IconControl>
              </div>
            </>
          ) : (
            <>
              <img src={intuitWordmark} alt="Intuit" className={styles.wordmark} />
              <div className={styles.headerFullscreenEnd}>
                <AgentReviewLayoutMenu mode={layoutMode} onChange={handleLayoutChange} />
                <IconControl
                  aria-label={INTELLIGENCE_CLOSE_ARIA}
                  size="medium"
                  shape="square"
                  onClick={handleClose}
                >
                  <Close size="medium" />
                </IconControl>
              </div>
            </>
          )}
        </header>

        <div className={styles.body}>
          {!isSidebar ? (
            <aside className={styles.threadRail} aria-label="Chat navigation">
              <button type="button" className={styles.railBtn} aria-label="Hide chat history">
                <MenuExpand size="medium" />
              </button>
              <button
                type="button"
                className={styles.railBtn}
                aria-label="New chat"
                onClick={handleNewChat}
              >
                <CommentPencil size="medium" />
              </button>
              <div className={styles.historyAnchor}>
                <button
                  type="button"
                  className={styles.railBtn}
                  aria-label="Recent chats"
                  aria-expanded={historyOpen}
                  onClick={() => setHistoryOpen(open => !open)}
                >
                  <ClockCounterclockwise size="medium" />
                </button>

                {historyOpen ? (
                  <div className={styles.historyMenu} role="menu" aria-label="Recent chats">
                    <p className={styles.historyHeading}>Recent chats</p>
                    {historyEntries.length ? (
                      historyEntries.map(entry => (
                        <button
                          key={entry.label}
                          type="button"
                          role="menuitem"
                          className={styles.historyItem}
                          onClick={() => handleOpenHistoryEntry(entry)}
                        >
                          <span className={styles.historyItemLabel}>{entry.label}</span>
                          <span className={styles.historyItemTime}>{entry.at}</span>
                        </button>
                      ))
                    ) : (
                      <p className={styles.historyEmpty}>No past conversations yet.</p>
                    )}
                  </div>
                ) : null}
              </div>
            </aside>
          ) : null}

          <div className={styles.main}>
            <div className={styles.pane}>
              {step === 'welcome' && (
                <AgentWelcomePane
                  preparerName={firstName(currentUser)}
                  onPromptClick={handlePromptClick}
                  compact={isSidebar}
                />
              )}
              {step === 'diagnostics' && (
                <AgentLoadingPane
                  embedded
                  loadingTitle={INTELLIGENCE_LOADING_TITLE}
                  isLoading={isAssessing}
                  showReport={!isAssessing}
                  reportContent={
                    <AgentReviewDiagnosticsPane
                      onAcceptAllFixes={() => beginProcessing('batch')}
                      onFixOneByOne={() => beginProcessing('sequential')}
                    />
                  }
                />
              )}
              {step === 'catch-up' && (
                <AgentCatchUpPane
                  onApproveReturn={() => openWorkspace()}
                  onClose={handleClose}
                  onViewAiReview={
                    hasCompletedAiReview
                      ? () => {
                          setResumedStep('processing')
                          setStep('processing')
                        }
                      : undefined
                  }
                  resumed={resumedStep === 'catch-up'}
                />
              )}
              {step === 'processing' && (
                <AgentReviewProcessingPane
                  mode={processingMode}
                  compact={isSidebar}
                  onGetCaughtUp={() => goToStep('catch-up')}
                  onFooterChipsChange={setFooterChips}
                  onFixesComplete={persistAgentFixes}
                  resumed={resumedStep === 'processing'}
                />
              )}
            </div>

            {showChatInput && (
              <div
                className={`${styles.pageFooter} ${footerChips ? styles.pageFooterWithChips : ''}`}
              >
                {footerChips ? <div className={styles.footerChips}>{footerChips}</div> : null}
                <ChatInput
                  variant="mini"
                  placeholder={INTELLIGENCE_CHAT_PLACEHOLDER}
                  legalDisclaimer={INTELLIGENCE_LEGAL_DISCLAIMER}
                  onSend={() => {
                    if (step === 'welcome') beginDiagnostics()
                    else if (step === 'diagnostics' && !isAssessing) beginProcessing()
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
