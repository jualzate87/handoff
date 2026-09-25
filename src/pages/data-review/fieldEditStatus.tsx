import Tooltip from './Tooltip'
import { AGENT_INTELLIGENCE_ACTOR } from '../../lib/applyAgentIntelligenceFixes'
import styles from '../../styles/data-review/DetailFields.module.css'

export function isFieldUnsaved(fieldKey: string, unsavedFields?: Set<string>) {
  return unsavedFields?.has(fieldKey) ?? false
}

type FieldEditStatusBadgesProps = {
  fieldKey: string
  unsavedFields?: Set<string>
  recalculatedFields?: Set<string>
  /** When true, show "1040 recalculated" instead of "Saved" */
  flowsTo1040?: boolean
  editTooltip?: string
  /** Who made the edit — swaps the badge to "AI fixed" for Intuit Intelligence. */
  editedBy?: string
}

/** Unsaved → "Edited" (or "AI fixed" when Intuit Intelligence made the change); after save & recalculate → brief "1040 recalculated" flash */
export function FieldEditStatusBadges({
  fieldKey,
  unsavedFields,
  recalculatedFields,
  flowsTo1040 = false,
  editTooltip,
  editedBy,
}: FieldEditStatusBadgesProps) {
  const showRecalc = recalculatedFields?.has(fieldKey)
  const isAiFixed = editedBy === AGENT_INTELLIGENCE_ACTOR
  // AI fixes commit straight to editedFieldsMeta (no unsaved→save step), so they
  // stay visible even though isFieldUnsaved would say false.
  const showEdited = (isFieldUnsaved(fieldKey, unsavedFields) || isAiFixed) && !showRecalc
  const badgeCls = isAiFixed ? styles.aiFixedBadge : styles.editedBadge
  const badgeLabel = isAiFixed ? 'AI fixed' : 'Edited'

  if (!showRecalc && !showEdited) return null

  return (
    <>
      {showRecalc && (
        <span className={styles.recalcBadge}>
          {flowsTo1040 ? '1040 recalculated' : 'Saved'}
        </span>
      )}
      {showEdited && (
        editTooltip ? (
          <Tooltip text={editTooltip} placement="top">
            <span className={badgeCls}>{badgeLabel}</span>
          </Tooltip>
        ) : (
          <span className={badgeCls}>{badgeLabel}</span>
        )
      )}
    </>
  )
}
