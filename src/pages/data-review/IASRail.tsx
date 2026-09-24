import { Map as MapIcon, Document, PersonTwo, List, News, CirclesCluster, GridTile, Card, SlidersH } from '@design-systems/icons'
import ptgLogo from '../../assets/icons/ptg-logo.svg'
import navTaxAdvisor from '../../assets/icons/nav/nav-tax-advisor.svg'
import styles from '../../styles/data-review/IASRail.module.css'

type RailItemId =
  | 'welcome'
  | 'tax-returns'
  | 'clients'
  | 'efile-status'
  | 'reporting'
  | 'tax-advisor'
  | 'ias'
  | 'integration'
  | 'purchase'

interface IASRailProps {
  activeItem?: RailItemId
}

/** Rail groups mirror the live IAS shell: primary apps, firm tools, then Purchase. */
const GROUPS: { id: RailItemId; label: string; icon: React.ReactNode }[][] = [
  [
    { id: 'welcome', label: 'Welcome', icon: <MapIcon size="small" /> },
    { id: 'tax-returns', label: 'Tax returns', icon: <Document size="small" /> },
    { id: 'clients', label: 'Clients', icon: <PersonTwo size="small" /> },
    { id: 'efile-status', label: 'E-file status', icon: <List size="small" /> },
    { id: 'reporting', label: 'Reporting', icon: <News size="small" /> },
  ],
  [
    {
      id: 'tax-advisor',
      label: 'Tax advisor',
      icon: <img src={navTaxAdvisor} alt="" className={styles.iconImg} />,
    },
    { id: 'ias', label: 'IAS', icon: <CirclesCluster size="small" /> },
    { id: 'integration', label: 'Integration', icon: <GridTile size="small" /> },
  ],
  [{ id: 'purchase', label: 'Purchase', icon: <Card size="small" /> }],
]

export default function IASRail({ activeItem = 'tax-returns' }: IASRailProps) {
  return (
    <div className={styles.rail}>
      <div className={styles.logo}>
        <img src={ptgLogo} alt="Intuit Accountant Suite" className={styles.logoImg} />
      </div>

      <div className={styles.nav}>
        {GROUPS.map((group, i) => (
          <div key={i} className={styles.group}>
            {i > 0 && <div className={styles.divider} />}
            {group.map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                className={`${styles.button} ${activeItem === id ? styles.buttonActive : ''}`}
              >
                <span className={styles.buttonIcon}>{icon}</span>
                <span className={styles.buttonText}>{label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.divider} />
        <button type="button" className={styles.button}>
          <span className={styles.buttonIcon}>
            <SlidersH size="small" />
          </span>
          <span className={styles.buttonText}>Customize</span>
        </button>
      </div>
    </div>
  )
}
