import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Lightning, Undo } from '@design-systems/icons'
import { Badge } from '@ids-ts/badge'
import '@ids-ts/badge/dist/main.css'
import {
  resetAgentDemoReviewState,
  resetPersistedReviewState,
} from '../../hooks/useSyncedReviewState'
import {
  AGENT_MODE_SESSION_KEY,
  buildHashRouteUrl,
  PREPARER_AGENT_DIAGNOSTICS_PATH,
  PREPARER_DIAGNOSTICS_PATH,
  setStoredDemoRole,
} from '../../lib/prototypeRoutes'
import {
  announceJoinedAs,
  getCurrentUser,
  preparePreparerHandoffLaunch,
  prepareReviewerHandoffLaunch,
  resetReturnWorkflow,
} from '../../lib/returnWorkflow'
import { Switch } from '@ids-ts/switch'
import '@ids-ts/switch/dist/main.css'
import { isGuidedTourEnabled, setGuidedTourEnabled } from '../GuidedTour/GuidedTour'
import { ROLE_SWITCH_POINTS, type LaunchPoint } from './launchPointsData'
import styles from './LaunchPointsFab.module.css'

const REVIEWER_HANDOFF_PATH = '/check-return?handoff=reviewer'
const PREPARER_HANDOFF_PATH = '/check-return?handoff=preparer'

function statusBadge(status: LaunchPoint['status']) {
  if (status === 'live') {
    return <Badge status="success" label="LIVE" capitalization="caps" priority="secondary" />
  }
  return <Badge status="draft" label="STUB" capitalization="caps" priority="secondary" />
}

function prepareDiagnosticsLaunch(): void {
  sessionStorage.removeItem(AGENT_MODE_SESSION_KEY)
  sessionStorage.setItem('protoc3-session-started', '1')
  sessionStorage.setItem('protoc3-imports-started', '1')
  sessionStorage.setItem('protoc3-phase', 'diagnostics')
  sessionStorage.setItem('agentLoaded', '1')
  setStoredDemoRole('preparer')
}

function prepareAgentLaunch(): void {
  resetAgentDemoReviewState()
  sessionStorage.setItem(AGENT_MODE_SESSION_KEY, '1')
  sessionStorage.setItem('protoc3-session-started', '1')
  sessionStorage.setItem('protoc3-imports-started', '1')
  sessionStorage.removeItem('protoc3-phase')
  sessionStorage.removeItem('protoc3-agent-visit-active')
  sessionStorage.setItem('agentLoaded', '1')
  setStoredDemoRole('preparer')
}

interface LaunchPointsFabProps {
  /** Notifies the app so the pointer can mount or unmount immediately. */
  onGuidedTourChange?: (enabled: boolean) => void
}

export default function LaunchPointsFab({ onGuidedTourChange }: LaunchPointsFabProps = {}) {
  const navigate = useNavigate()
  const [tourOn, setTourOn] = useState(isGuidedTourEnabled)
  const location = useLocation()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const hideOnPopout = location.pathname.endsWith('-popout')

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const handleLaunchPoint = useCallback(
    (point: LaunchPoint) => {
      if (!point.route) return
      setOpen(false)
      if (point.route === PREPARER_DIAGNOSTICS_PATH) {
        prepareDiagnosticsLaunch()
      } else if (point.route === PREPARER_AGENT_DIAGNOSTICS_PATH) {
        prepareAgentLaunch()
      } else if (point.route === REVIEWER_HANDOFF_PATH) {
        prepareReviewerHandoffLaunch()
        setStoredDemoRole('reviewer')
        announceJoinedAs('jake')
        navigate(REVIEWER_HANDOFF_PATH)
        return
      } else if (point.route === PREPARER_HANDOFF_PATH) {
        preparePreparerHandoffLaunch()
        setStoredDemoRole('preparer')
        announceJoinedAs('sarah')
        navigate(PREPARER_HANDOFF_PATH)
        return
      }
      navigate(point.route)
    },
    [navigate],
  )

  const handleResetDemo = useCallback(() => {
    resetPersistedReviewState()
    resetReturnWorkflow()
    // Belt-and-suspenders sweep: every prototype key, in both storages, by
    // prefix rather than by name. The explicit removals below double as a
    // readable record of what's being cleared and don't depend on this sweep,
    // but the sweep is what actually prevents a key added later (or an old
    // one a past edit missed) from quietly surviving "Reset demo" and
    // reappearing as stale checkmarks/verifications in a new session.
    try {
      for (const storage of [localStorage, sessionStorage]) {
        const staleKeys: string[] = []
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i)
          if (key && (key.startsWith('protoc3-') || key.startsWith('smartReviewProtoC:'))) {
            staleKeys.push(key)
          }
        }
        staleKeys.forEach(key => storage.removeItem(key))
      }
    } catch {
      // ignore quota / private mode
    }
    sessionStorage.removeItem('protoc3-session-started')
    sessionStorage.removeItem('protoc3-imports-started')
    sessionStorage.removeItem('protoc3-phase')
    sessionStorage.removeItem('agentLoaded')
    sessionStorage.removeItem(AGENT_MODE_SESSION_KEY)
    setStoredDemoRole('preparer')
    setOpen(false)
    // Back to the very start of the demo, not mid-flow.
    window.location.assign(buildHashRouteUrl('/client-onboarding'))
  }, [])

  if (hideOnPopout) {
    return null
  }

  const currentUserId = open ? getCurrentUser().id : null
  const roleSwitch = ROLE_SWITCH_POINTS.find(point => point.joinAs !== currentUserId)

  const renderPoint = (point: LaunchPoint, index: number) => {
    const navigable = Boolean(point.route)
    return (
      <li key={point.id} className={styles.listItem}>
        <button
          type="button"
          className={styles.itemBtn}
          disabled={!navigable}
          onClick={() => handleLaunchPoint(point)}
        >
          <span className={styles.itemNumber}>{index + 1}</span>
          <span className={styles.itemBody}>
            <span className={styles.itemTitleRow}>
              <span className={styles.itemTitle}>{point.title}</span>
              {statusBadge(point.status)}
            </span>
            <p className={styles.itemDescription}>{point.description}</p>
          </span>
          {navigable && (
            <span className={styles.itemChevron} aria-hidden>
              <ChevronRight size="small" />
            </span>
          )}
        </button>
      </li>
    )
  }

  return (
    <div className={styles.fabRoot} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(prev => !prev)}
      >
        <span className={styles.triggerIcon} aria-hidden>
          <Lightning size="small" />
        </span>
        Prototype settings
      </button>

      {open && (
        <div className={styles.menuCluster}>
          <div className={styles.panel} role="dialog" aria-label="Prototype settings">
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>Prototype settings</h2>
              <p className={styles.panelSubtitle}>Guide the walkthrough, switch roles, or open another flow</p>
            </div>

            <div className={styles.settingRow}>
              <span className={styles.settingBody}>
                <span className={styles.settingTitle}>Guided pointer</span>
                <span className={styles.settingDescription}>
                  Highlights the next thing to click, all the way through the demo
                </span>
              </span>
              <Switch
                checked={tourOn}
                aria-label="Guided pointer"
                onChange={() => {
                  const next = !tourOn
                  setTourOn(next)
                  setGuidedTourEnabled(next)
                  onGuidedTourChange?.(next)
                }}
              />
            </div>

            <ul className={styles.list}>
              {roleSwitch ? renderPoint(roleSwitch, 0) : null}
            </ul>

            <div className={styles.panelFooter}>
              <button type="button" className={styles.resetBtn} onClick={handleResetDemo}>
                <span className={styles.resetIcon} aria-hidden>
                  <Undo size="small" />
                </span>
                <span>
                  <p className={styles.resetTitle}>Reset demo</p>
                  <p className={styles.resetSubtitle}>back to &apos;Welcome&apos;</p>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
