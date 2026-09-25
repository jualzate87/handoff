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
