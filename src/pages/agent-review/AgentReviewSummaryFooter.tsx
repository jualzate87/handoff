import { Copy, Download, ThumbDown, ThumbUp } from '@design-systems/icons'
import { IconControl } from '@ids-ts/icon-control'
import '@ids-ts/icon-control/dist/main.css'
import AgentReviewSuggestionChips, { SuggestionChip } from './AgentReviewSuggestionChips'
import { CTA_REVIEWER_SUMMARY, INTELLIGENCE_COMPLETION_FOOTER } from './agentIntelligenceCopy'
import styles from '../../styles/agent-review/AgentReviewSummaryFooter.module.css'

interface AgentReviewSummaryFooterProps {
  onPrimaryAction: () => void
  primaryLabel?: string
  showPrompt?: boolean
  /** Optional follow-up chip shown beside the primary action. */
  secondaryLabel?: string
  onSecondaryAction?: () => void
}

export default function AgentReviewSummaryFooter({
  onPrimaryAction,
  primaryLabel = CTA_REVIEWER_SUMMARY,
  showPrompt = true,
  secondaryLabel,
  onSecondaryAction,
}: AgentReviewSummaryFooterProps) {
  const secondary =
    secondaryLabel && onSecondaryAction ? (
      <SuggestionChip onClick={onSecondaryAction}>{secondaryLabel}</SuggestionChip>
    ) : null
  return (
    <div className={styles.footer}>
      {showPrompt ? (
        <p className={styles.footerPrompt}>{INTELLIGENCE_COMPLETION_FOOTER}</p>
      ) : null}

      <div className={styles.controlBar}>
        <IconControl aria-label="Copy" size="small" shape="square">
          <Copy size="small" />
        </IconControl>
        <IconControl aria-label="Download" size="small" shape="square">
          <Download size="small" />
        </IconControl>
        <IconControl aria-label="Like" size="small" shape="square">
          <ThumbUp size="small" />
        </IconControl>
        <IconControl aria-label="Dislike" size="small" shape="square">
          <ThumbDown size="small" />
        </IconControl>
      </div>

      <AgentReviewSuggestionChips layout="column">
        <SuggestionChip onClick={onPrimaryAction}>{primaryLabel}</SuggestionChip>
        {secondary}
      </AgentReviewSuggestionChips>
    </div>
  )
}
