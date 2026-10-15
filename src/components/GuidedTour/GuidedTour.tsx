import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  GUIDED_TOUR_STEPS,
  GUIDED_TOUR_ENABLED_KEY,
  type GuidedTourStep,
} from './guidedTourSteps'
import styles from './GuidedTour.module.css'

/** Polls for the target, since steps often appear after an animation. */
const LOOKUP_INTERVAL_MS = 400

function currentRoute(hash: string): string {
  const path = hash.replace(/^#/, '')
  const [route] = path.split('?')
  return route || '/'
}

/** Finds a step's element by selector, or by the visible text of a control. */
function findTarget(step: GuidedTourStep): HTMLElement | null {
  if (step.selector) {
    const el = document.querySelector<HTMLElement>(step.selector)
    if (el) return el
  }
  if (step.text) {
    const wanted = step.text.toLowerCase()
    const visible = [
      ...document.querySelectorAll<HTMLElement>('button, [role="menuitem"], a'),
    ].filter(el => el.offsetParent !== null)

    // Exact label first: "Import" must not match "Review form and import".
    const labels = visible.map(el => el.textContent?.trim().toLowerCase() ?? '')
    const exact = visible.find((_, i) => labels[i] === wanted)
    if (exact) return exact

    const partial = visible.find((_, i) => labels[i].includes(wanted))
    if (partial) return partial
  }
  return null
}

export function isGuidedTourEnabled(): boolean {
  try {
    return sessionStorage.getItem(GUIDED_TOUR_ENABLED_KEY) === '1'
  } catch {
    return false
  }
}

export function setGuidedTourEnabled(enabled: boolean): void {
  try {
    if (enabled) sessionStorage.setItem(GUIDED_TOUR_ENABLED_KEY, '1')
    else sessionStorage.removeItem(GUIDED_TOUR_ENABLED_KEY)
  } catch {
    // ignore prototype storage errors
  }
}

interface GuidedTourProps {
  enabled: boolean
}

export default function GuidedTour({ enabled }: GuidedTourProps) {
  const location = useLocation()
  const [stepIndex, setStepIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const targetRef = useRef<HTMLElement | null>(null)

  const route = currentRoute(location.hash || `#${location.pathname}`)

  /** The next step whose route matches where we are — the demo may skip ahead. */
  const step = (() => {
    for (let i = stepIndex; i < GUIDED_TOUR_STEPS.length; i += 1) {
      if (GUIDED_TOUR_STEPS[i].route === route) return GUIDED_TOUR_STEPS[i]
    }
    return null
  })()

  const advance = useCallback(() => {
    if (!step) return
    const index = GUIDED_TOUR_STEPS.findIndex(s => s.id === step.id)
    setStepIndex(index + 1)
    setRect(null)
    targetRef.current = null
  }, [step])

  // Track the target: it may mount late, move, or disappear entirely.
  useEffect(() => {
    if (!enabled || !step) {
      setRect(null)
      return
    }

    let frame = 0
    const measure = () => {
      const el = findTarget(step)
      targetRef.current = el
      setRect(el ? el.getBoundingClientRect() : null)
    }

    measure()
    const interval = setInterval(measure, LOOKUP_INTERVAL_MS)
    const onScrollOrResize = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)

    return () => {
      clearInterval(interval)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [enabled, step])

  // Advance when the target is clicked. The click itself is never intercepted.
  useEffect(() => {
    if (!enabled || !step) return
    const onClick = (event: MouseEvent) => {
      const el = targetRef.current
      if (el && event.target instanceof Node && el.contains(event.target)) {
        advance()
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [advance, enabled, step])

  if (!enabled || !rect || !step) return null

  const placement = step.placement ?? 'right'
  const style: React.CSSProperties =
    placement === 'right'
      ? { top: rect.top + rect.height / 2, left: rect.right + 8 }
      : placement === 'left'
        ? { top: rect.top + rect.height / 2, left: rect.left - 8 }
        : placement === 'top'
          ? { top: rect.top - 8, left: rect.left + rect.width / 2 }
          : { top: rect.bottom + 8, left: rect.left + rect.width / 2 }

  const cardStyle: React.CSSProperties =
    placement === 'right'
      ? { top: rect.top + rect.height / 2, left: rect.right + 26, transform: 'translateY(-50%)' }
      : placement === 'left'
        ? { top: rect.top + rect.height / 2, left: rect.left - 26, transform: 'translate(-100%, -50%)' }
        : placement === 'top'
          ? { top: rect.top - 26, left: rect.left + rect.width / 2, transform: 'translate(-50%, -100%)' }
          : { top: rect.bottom + 26, left: rect.left + rect.width / 2, transform: 'translateX(-50%)' }

  return (
    <>
      <div
        className={styles.halo}
        style={{
          top: rect.top - 6,
          left: rect.left - 6,
          width: rect.width + 12,
          height: rect.height + 12,
        }}
        aria-hidden
      />
      <div className={`${styles.pointer} ${styles[placement]}`} style={style} aria-hidden />
      <div className={styles.card} style={cardStyle} role="status">
        <p className={styles.cardNote}>{step.note}</p>
        {step.infoOnly && (
          <button type="button" className={styles.cardDismiss} onClick={advance}>
            Got it
          </button>
        )}
      </div>
    </>
  )
}
