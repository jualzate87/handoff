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
  /** Short explanation shown in the tooltip card next to the pointer. */
  note: string
  /** When true, the pointer only highlights — it never waits for a click to advance. */
  infoOnly?: boolean
}

export const GUIDED_TOUR_STEPS: GuidedTourStep[] = [
  // ── Client onboarding ──
  {
    id: 'welcome-start',
    route: '/client-onboarding',
    text: 'Get started',
    note: 'Kick off a new return by starting the client intake.',
  },
  {
    id: 'create-questionnaire',
    route: '/client-onboarding',
    text: 'Create questionnaire and document checklist',
    note: 'SmartReturn builds a tailored questionnaire and document checklist from last year’s return.',
  },
  {
    id: 'send-to-client',
    route: '/client-onboarding',
    text: 'Send to client',
    note: 'Send the checklist and questionnaire to your client so they can upload documents and answer questions.',
  },
  {
    id: 'open-return',
    route: '/client-onboarding',
    text: 'Open return',
    note: 'Once the client responds, open the return to start preparing it.',
  },

  // ── SmartReturn: import documents, then books ──
  {
    id: 'pick-up-return',
    route: '/smart-return',
    text: 'SmartReturn',
    placement: 'bottom',
    note: 'This is where you pick up the return and see what the client has sent so far.',
    infoOnly: true,
  },
  {
    id: 'checklist-needed-tab',
    route: '/smart-return',
    selector: '[data-tour="checklist-needed-tab"]',
    placement: 'bottom',
    note: 'The checklist continuously reconciles what’s needed against what’s been received, so you always know what’s still outstanding.',
    infoOnly: true,
  },
  {
    id: 'import-documents',
    route: '/smart-return',
    text: 'Import ready documents',
    note: 'Once everything needed has been received, import the ready documents into the return.',
  },
  {
    id: 'review-and-import-books',
    route: '/books-found',
    text: 'Review and import',
    note: 'SmartReturn detected bookkeeping data in QuickBooks for this client. Review it, then import it straight into the return.',
  },
  {
    id: 'import-books',
    route: '/books-adjustments',
    text: 'Import',
    note: 'Confirm the books-to-tax adjustments, then import them.',
  },
  {
    id: 'review-the-return',
    route: '/import-confirmation',
    text: 'Review the return',
    note: 'Everything’s imported. Now let’s land in the return and start reconciling the details.',
  },

  // ── 1040 view: reconcile fields against source documents ──
  {
    id: 'open-field-popover',
    route: '/check-return',
    selector: '[class*="summaryInfoBtn"]',
    placement: 'right',
    note: 'Click any field’s info icon to see where its value came from and reconcile it against the source document.',
    infoOnly: true,
  },
  {
    id: 'view-document-from-popover',
    route: '/check-return',
    text: 'View document',
    note: 'Jump straight to the source document to compare it against the extracted value.',
  },

  // ── Source documents ──
  {
    id: 'open-source-documents',
    route: '/check-return',
    text: 'Source documents',
    note: 'Review every imported document side-by-side with the data SmartReturn extracted from it.',
  },
  {
    id: 'verify-next-document-field',
    route: '/data-review-popout',
    text: 'Review next issue',
    placement: 'bottom',
    note: 'Compare the highlighted field against the source document. Edit it if needed, or mark it correct, then move to the next issue.',
    infoOnly: true,
  },
  {
    id: 'next-document',
    route: '/data-review-popout',
    text: 'Next document',
    note: 'Once a document is fully verified, move to the next one — the review is only exhaustive once every document is checked.',
  },
  {
    id: 'save-and-close-documents',
    route: '/data-review-popout',
    text: 'Save and close',
    note: 'Save your verified documents and head back to the return.',
  },

  // ── Back on the return, then the AI review ──
  {
    id: 'open-ai-review',
    route: '/check-return',
    text: 'AI review',
    note: 'With the data verified, bring in AI review as a second set of eyes on the whole return.',
  },
  {
    id: 'run-full-review',
    route: '/ai-review',
    text: 'Run full review',
    note: 'Let AI review scan the full return for compliance issues, year-over-year changes, and missed opportunities.',
  },
  {
    id: 'accept-all-fixes',
    route: '/ai-review',
    text: 'Accept all fixes',
    note: 'Accept every recommended fix at once — or review and apply them one by one.',
  },
  {
    id: 'verify-ai-fix',
    route: '/ai-review',
    selector: '[class*="fixResultLinkChip"]',
    placement: 'top',
    note: 'Click any fix to see exactly what AI changed and verify it yourself.',
    infoOnly: true,
  },
  {
    id: 'get-reviewer-summary',
    route: '/ai-review',
    text: 'Get reviewer summary',
    note: 'Generate a summary of everything AI found and fixed, ready to share with a reviewer.',
  },
  {
    id: 'approve-return',
    route: '/ai-review',
    text: 'Approve return',
    note: 'The return is reconciled and reviewed — approve it to move forward.',
  },

  // ── Hand off to advisory ──
  {
    id: 'return-actions',
    route: '/check-return',
    text: 'Return actions',
    note: 'The return is ready. From here you can hand it off to someone else or send it to a tax advisor.',
  },
  {
    id: 'create-tax-plan',
    route: '/check-return',
    text: 'Create tax plan',
    note: 'Turn this return into a forward-looking tax plan for the client.',
  },
  {
    id: 'open-tax-advisor',
    route: '/check-return',
    text: 'Open Tax Advisor',
    note: 'Hand the return off to a tax advisor for strategic planning.',
  },
]

export const GUIDED_TOUR_ENABLED_KEY = 'protoc3-guided-tour'
