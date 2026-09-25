import IASRail from './IASRail'
import IASTopBar from './IASTopBar'
import styles from '../../styles/data-review/IASShell.module.css'

interface IASShellProps {
  children: React.ReactNode
  /** Firm name shown in the company switcher. */
  firmName?: string
  /** Highlights the Intelligence icon in the top bar — the panel is already open. */
  intelligenceActive?: boolean
  /** Toggles the Intelligence panel from the top bar icon. */
  onIntelligenceClick?: () => void
}

/**
 * Outer IAS chrome that persists across every return screen: the blue icon
 * rail, the global top bar, and the rounded content panel they frame.
 * Page content (including the return header) renders as children.
 */
export default function IASShell({
  children,
  firmName,
  intelligenceActive,
  onIntelligenceClick,
}: IASShellProps) {
  return (
    <div className={styles.root}>
      <div className={styles.body}>
        <IASRail />
        <div className={styles.content}>
          <IASTopBar
            firmName={firmName}
            intelligenceActive={intelligenceActive}
            onIntelligenceClick={onIntelligenceClick}
          />
          <div className={styles.pageArea}>{children}</div>
        </div>
      </div>
    </div>
  )
}
