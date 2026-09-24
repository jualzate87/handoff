/** Tina Yuan - client/recipient address (Loop 2 Build Spec). */
export const CLIENT_FIRST_NAME = 'Tina'

export const CLIENT_ADDRESS = {
  name: 'Tina Yuan',
  street: '333 Easy Street',
  city: 'Austin',
  state: 'TX',
  zip: '78704',
} as const

export function formatClientCityStateZip(): string {
  const { city, state, zip } = CLIENT_ADDRESS
  return `${city}, ${state} ${zip}`
}
