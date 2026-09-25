/**
 * The demo path, as a list of things to click. Each step names the route it
 * belongs to and a way to find its target; the pointer waits on that target
 * until it is clicked, so the presenter sets the pace.
 */
export type GuidedTourStep = {
  id: string
  /** Hash route (without the leading #) this step belongs to. */
  route: string
  /** CSS selector for the element to point at. */
  selector?: string
  /** Falls back to matching a button by its visible text. */
  text?: string
  /** Where the pointer sits relative to the target. */
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export const GUIDED_TOUR_STEPS: GuidedTourStep[] = [
  // ── Client onboarding ──
  { id: 'welcome-start', route: '/client-onboarding', text: 'Get started' },
  {
    id: 'create-questionnaire',
    route: '/client-onboarding',
    text: 'Create questionnaire and document checklist',
  },
  { id: 'send-to-client', route: '/client-onboarding', text: 'Send to client' },
  { id: 'open-return', route: '/client-onboarding', text: 'Open return' },

  // ── SmartReturn: import documents, then books ──
  { id: 'pick-up-return', route: '/smart-return', text: 'Pick up the return' },
  { id: 'import-documents', route: '/smart-return', text: 'Import ready documents' },
  { id: 'review-and-import-books', route: '/books-found', text: 'Review and import' },
  { id: 'import-books', route: '/books-adjustments', text: 'Import' },
  { id: 'review-the-return', route: '/import-confirmation', text: 'Review the return' },

  // ── Source documents ──
  { id: 'open-source-documents', route: '/check-return', text: 'Source documents' },

  // ── Back on the return, then the AI review ──
  { id: 'open-ai-review', route: '/check-return', text: 'AI review' },
  { id: 'run-full-review', route: '/ai-review', text: 'Run full review' },
  { id: 'accept-all-fixes', route: '/ai-review', text: 'Accept all fixes' },
  { id: 'get-reviewer-summary', route: '/ai-review', text: 'Get reviewer summary' },
  { id: 'approve-return', route: '/ai-review', text: 'Approve return' },

  // ── Hand off to advisory ──
  { id: 'return-actions', route: '/check-return', text: 'Return actions' },
  { id: 'create-tax-plan', route: '/check-return', text: 'Create tax plan' },
  { id: 'open-tax-advisor', route: '/check-return', text: 'Open Tax Advisor' },
]

export const GUIDED_TOUR_ENABLED_KEY = 'protoc3-guided-tour'
