/** Questionnaire and checklist the agent generates from Tina Yuan's prior-year 1040. */

export const ONBOARDING_QUESTIONS = [
  'Did your marital status change in 2025?',
  'In 2025, did you receive or sell any digital assets (like crypto or NFTs)?',
  'Do you want to review your 2026 estimated tax payments to help adjust your tax refund or amount due next year?',
  'Did you donate cash or non-cash items to charities in 2025?',
]

export const ONBOARDING_DOCUMENTS = [
  { name: 'W2s', detail: 'Form W-2 from Bing Equipment and Tech Circle' },
  { name: '1099-INT', detail: 'Form 1099-INT from Megabank' },
  { name: '1099-DIV', detail: 'Form 1099-DIV from Citi Group' },
  { name: 'Schedule K-1s', detail: 'Schedule K-1 from Easy Money' },
]

/**
 * Set when the onboarding request is sent, so the return can open with the
 * time-jump modal announcing that Tina's documents arrived.
 */
export const CLIENT_DOCS_ARRIVED_KEY = 'protoc3-client-docs-arrived'

/** Reasoning stream shown while the agent drafts the questionnaire and checklist. */
export const ONBOARDING_LOADING_TITLE = 'Creating client questionnaire & checklist…'

export const ONBOARDING_LOADING_STEPS = [
  {
    title: "Reading Tina Yuan's prior-year 1040",
    body: 'Pulling filing status, income sources, and dependents from her 2024 return.',
  },
  {
    title: 'Drafting the client questionnaire',
    body: 'Writing year-over-year questions on filing status, digital assets, estimated payments, and charitable giving.',
  },
  {
    title: 'Building the document checklist',
    body: 'Matching last year’s W-2s, 1099s, and Schedule K-1s to what to request again this year.',
  },
  {
    title: 'Preparing the engagement letter',
    body: 'Filling in the standard 1040 engagement letter for Tina Yuan and Beasley & Howe Financials.',
  },
]

/** Reasoning stream shown while the request is delivered to the client portal. */
export const SENDING_TITLE = 'Sending to Tina Yuan…'

export const SENDING_STEPS = [
  {
    title: 'Publishing to the client portal',
    body: 'Posting the questionnaire, checklist, and engagement letter to Tina’s Intuit Link account and emailing her a secure link.',
  },
]

/** Standard 1040 engagement letter, prefilled for the demo client and firm. */
export const ENGAGEMENT_LETTER_PARAGRAPHS = [
  'Dear Tina Yuan:',
  'Thank you for choosing Beasley & Howe Financials to assist you with your taxes. This letter confirms the terms of our engagement with you and outlines the nature and extent of the services we will provide.',
  'We will review your current federal and state income tax returns. We will depend on you to provide the information we need to complete an accurate assessment and provide recommendations. We may ask you to clarify some items but will not audit or otherwise verify the data you submit. Review or revision of prior year(s) returns is also available at an additional charge.',
  'We will perform services only as needed to review, revise or prepare your tax returns. Our work will not include procedures to find misappropriated funds or other irregularities. Accordingly, our engagement should not be relied upon to disclose errors, fraud, or other illegal acts, though it may be necessary for you to clarify some of the information you submit. We will, of course, inform you of any material errors, fraud, or other illegal acts we discover.',
  'The law imposes penalties when taxpayers underestimate their tax liability. Please call us if you have concerns about such penalties.',
  'Should we encounter instances of unclear tax law, or of potential conflicts in the interpretation of the law, we will outline the reasonable courses of action and the risks and consequences of each. We will ultimately adopt, on your behalf, the alternative you select.',
  'Our fee will be based on the time required at the standard hourly billing rate plus any out-of-pocket expenses. Invoices are due and payable upon presentation. To the extent permitted by state law, an interest charge may be added to all accounts not paid within thirty (30) days.',
  'We will return your original records to you at the end of this engagement. You should securely store these records, along with all supporting documents, canceled checks, etc., as these items may later be needed to prove accuracy and completeness of a return. We will retain copies of your records and our work papers for your engagement for seven years, after which these documents will be destroyed.',
]
