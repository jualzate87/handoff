import type { ProcessingMode } from './useAgentProcessingAnimation'

export type AgentStep = 'welcome' | 'diagnostics' | 'processing' | 'catch-up' | 'workspace'

export type AgentSession = {
  step: AgentStep
  processingMode: ProcessingMode
}

const SESSION_KEY = 'protoc3-agent-session'

/**
 * Steps that hold generated content. Reopening the panel returns to one of
 * these; 'welcome' and 'workspace' have nothing to come back to.
 */
const RESUMABLE_STEPS: AgentStep[] = ['diagnostics', 'processing', 'catch-up']

export function isResumableStep(step: AgentStep): boolean {
  return RESUMABLE_STEPS.includes(step)
}

export function loadAgentSession(): AgentSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AgentSession>
    if (!parsed.step || !isResumableStep(parsed.step)) return null
    return {
      step: parsed.step,
      processingMode: parsed.processingMode === 'sequential' ? 'sequential' : 'batch',
    }
  } catch {
    return null
  }
}

export function saveAgentSession(session: AgentSession): void {
  if (!isResumableStep(session.step)) return
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    recordHistoryEntry(session.step)
  } catch {
    // ignore prototype storage errors
  }
}

/* ── Conversation history ── */

export type AgentHistoryEntry = {
  step: AgentStep
  /** Display label for the history list. */
  label: string
  /** Human-readable time the conversation was last open. */
  at: string
}

const HISTORY_KEY = 'protoc3-agent-history'

const HISTORY_LABELS: Partial<Record<AgentStep, string>> = {
  diagnostics: 'Return review by Intuit Intelligence',
  processing: 'Return review by Intuit Intelligence',
  'catch-up': 'Reviewer summary',
}

function formatHistoryTime(): string {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

/** Conversations from this session only — what actually gets persisted. */
function loadSessionHistory(): AgentHistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY)
    const parsed = raw ? (JSON.parse(raw) as AgentHistoryEntry[]) : []
    return Array.isArray(parsed) ? parsed.filter(entry => isResumableStep(entry.step)) : []
  } catch {
    return []
  }
}

/** Keeps one entry per conversation kind, most recent first. */
function recordHistoryEntry(step: AgentStep): void {
  const label = HISTORY_LABELS[step]
  if (!label) return
  const entries = loadSessionHistory().filter(entry => entry.label !== label)
  entries.unshift({ step, label, at: formatHistoryTime() })
  try {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 5)))
  } catch {
    // ignore prototype storage errors
  }
}

/**
 * Earlier AI reviews on this same return. A return is reviewed more than once
 * over its life, so the history rail shows those prior passes alongside this
 * session's conversations — each one reopens the reviewer summary.
 */
const PRIOR_REVIEW_ENTRIES: AgentHistoryEntry[] = [
  { step: 'catch-up', label: 'Return review · after books import', at: 'Mar 8' },
  { step: 'catch-up', label: 'Return review · initial import check', at: 'Mar 5' },
]

export function loadAgentHistory(): AgentHistoryEntry[] {
  return [...loadSessionHistory(), ...PRIOR_REVIEW_ENTRIES]
}

/** Starting a new chat drops the conversation so the panel opens on the welcome screen. */
export function clearAgentSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}
