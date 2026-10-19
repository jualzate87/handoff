export type LaunchPointStatus = 'live' | 'stub'

export type LaunchPoint = {
  id: string
  title: string
  status: LaunchPointStatus
  description: string
  /** Hash route without # — navigates when set and status is live */
  route?: string
  /** Team member this point joins as — shown only when you are not that person. */
  joinAs?: string
}

export const DEMO_ENTRY_POINTS: LaunchPoint[] = [
  {
    id: 'start-smart-return',
    title: 'Start at SmartReturn',
    status: 'live',
    description: 'Skip the 1040 import flow and start on the SmartReturn screen, with the welcome intro',
    route: '/smart-return?welcome=1',
  },
  {
    id: 'skip-to-return-ready',
    title: 'Skip straight to return ready',
    status: 'live',
    description: 'Import from SmartReturn and land directly on "The return is ready for review" — no QuickBooks books screens',
    route: '/import-confirmation',
  },
]

export const ROLE_SWITCH_POINTS: LaunchPoint[] = [
  {
    id: 'join-jake',
    title: 'Switch to Jing',
    status: 'live',
    description: 'Join the return as Jing after Amanda hands it off',
    route: '/check-return?handoff=reviewer',
    joinAs: 'jake',
  },
  {
    id: 'join-sarah',
    title: 'Switch to Amanda',
    status: 'live',
    description: 'Join the return as Amanda after Jing sends it back',
    route: '/check-return?handoff=preparer',
    joinAs: 'sarah',
  },
]
