import { useState } from 'react'
import { SEED_AMOUNTS, type LiveAmounts } from '../../data/liveReturn'
import { useSyncedReviewState } from '../../hooks/useSyncedReviewState'
import { getCurrentUser } from '../../lib/returnWorkflow'

/**
 * The return an AI review run evaluates, captured once when the run starts.
 * The preparer demo always opens on the seeded import errors; a reviewer runs
 * it on the return as handed off, so only what's genuinely left is raised.
 */
export function useReviewIssueContext(): {
  amounts: LiveAmounts
  reviewedFields?: Map<string, unknown>
} {
  const synced = useSyncedReviewState()
  const [context] = useState(() =>
    getCurrentUser().role === 'reviewer'
      ? { amounts: synced.amounts, reviewedFields: synced.reviewedFields as Map<string, unknown> }
      : { amounts: SEED_AMOUNTS },
  )
  return context
}
