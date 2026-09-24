import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from '@design-systems/icons'
import { Button } from '@ids-ts/button'
import '@ids-ts/button/dist/main.css'
import itaLogo from '../assets/ita-logo.png'
import styles from '../styles/ReturnActionsMenu.module.css'

export default function ReturnActionsMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

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
      <Button priority="primary" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(prev => !prev)}>
        Return actions <ChevronDown size="small" aria-hidden />
      </Button>
      {open ? (
        <ul className={styles.menu} role="menu" aria-label="Return actions">
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onClick={() => {
                setOpen(false)
                navigate('/tax-advisory')
              }}
            >
              <img src={itaLogo} alt="" className={styles.itemIcon} />
              Create tax plan
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  )
}
