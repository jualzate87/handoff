import OutputReviewPanel from './OutputReviewPanel'
import AiDiagnosticsPanel, { type AiDiagnosticsView } from './AiDiagnosticsPanel'
import AgentDiagnosticsPanel from './AgentDiagnosticsPanel'
import { checkReturnFormToOutputId } from './outputFormNav'
import type { ContentView } from './CheckReturnNav'
import type { OutputFormId } from '../data-review/outputForms'
import type { Phase2IssueKey } from '../data-review/phase2FlagSync'
import FederalSummaryTable from './FederalSummaryTable'
import { CLIENT_ADDRESS } from '../../data/clientAddress'
import styles from '../../styles/CheckReturnPage.module.css'
import panel from '../../styles/shared/ReturnMainPanel.module.css'

interface CheckReturnMainContentProps {
  contentView: ContentView
  selectedForm: string | null
  outputFormId: OutputFormId
  aiDiagnosticsView?: AiDiagnosticsView
  selectedDiagnosticKey?: Phase2IssueKey | null
  onAiDiagnosticsViewChange?: (
    view: AiDiagnosticsView,
    issueKey?: Phase2IssueKey | null,
  ) => void
  diagnosticHighlightKey?: Phase2IssueKey | null
  /** Agent mode — only set from /check-return/agent launch point. */
  diagnosticsMode?: 'manual' | 'agent'
}

export default function CheckReturnMainContent({
  contentView,
  selectedForm,
  outputFormId,
  aiDiagnosticsView = 'overview',
  selectedDiagnosticKey = null,
  onAiDiagnosticsViewChange,
  diagnosticHighlightKey = null,
  diagnosticsMode = 'manual',
}: CheckReturnMainContentProps) {
  return (
    <main
      className={
        contentView === 'form-output'
          ? `${panel.pageScroll} ${styles.outputMain}`
          : panel.pageScroll
      }
    >
      {contentView === 'federal-summary' && (
        <div className={panel.contentBody}>
          <h1 className={panel.pageTitle}>
            Federal Income Tax Summary: {CLIENT_ADDRESS.name}
          </h1>
          <FederalSummaryTable />
        </div>
      )}

      {contentView === 'california-summary' && (
        <div className={panel.contentBody}>
          <h1 className={panel.pageTitle}>California Tax Summary: Barry and Mary Wilson</h1>
          <p className={panel.bodyText}>California summary details are not available in this prototype.</p>
        </div>
      )}

      {contentView === 'ai-diagnostics' && diagnosticsMode === 'agent' && (
        <AgentDiagnosticsPanel />
      )}

      {contentView === 'ai-diagnostics' && diagnosticsMode === 'manual' && onAiDiagnosticsViewChange && (
        <AiDiagnosticsPanel
          view={aiDiagnosticsView}
          selectedIssueKey={selectedDiagnosticKey}
          onViewChange={onAiDiagnosticsViewChange}
        />
      )}

      {contentView === 'form-output' && (
        <>
          {checkReturnFormToOutputId(selectedForm ?? '1040') ? (
            <OutputReviewPanel
              outputFormId={outputFormId}
              activeDiagnosticKey={diagnosticHighlightKey}
            />
          ) : (
            <div className={panel.contentBody}>
              <h1 className={panel.pageTitle}>
                {selectedForm ?? 'Form'} preview
              </h1>
              <p className={panel.bodyText}>
                This form is not interactive in the prototype yet. Select 1040, Sch 1, Sch C, or Sch D from the Forms list.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  )
}
