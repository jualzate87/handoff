import { useEffect, useRef, useState } from 'react'
import { OverflowWeb } from '@design-systems/icons'
import type { HeaderSelectOption } from './HeaderSelectMenu'
import styles from '../styles/HeaderOverflowMenu.module.css'

export type HeaderOverflowGroup = {
  id: string
  label: string
  value: string
  options: HeaderSelectOption[]
  onChange: (id: string) => void
}

interface HeaderOverflowMenuProps {
  groups: HeaderOverflowGroup[]
}

/** Compact header: assignee + status collapse in here when the row runs out of room. */
export default function HeaderOverflowMenu({ groups }: HeaderOverflowMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

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

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="More return options"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(prev => !prev)}
      >
        <OverflowWeb size="small" aria-hidden />
      </button>
      {open ? (
        <div className={styles.menu} role="menu" aria-label="More return options">
          {groups.map(group => (
            <div key={group.id} className={styles.group}>
              <p className={styles.groupLabel}>{group.label}</p>
              {group.options.map(option => (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={option.id === group.value}
                  className={`${styles.menuItem} ${
                    option.id === group.value ? styles.menuItemSelected : ''
                  }`}
                  onClick={() => {
                    group.onChange(option.id)
                    setOpen(false)
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
