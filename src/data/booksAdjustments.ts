/** Books-to-tax rows shown when importing QuickBooks data into Tina Yuan's 1040. */

export type BooksAdjustmentRow = {
  /** Tax line number as printed on the form, e.g. "1a". */
  line: string
  label: string
  account: string
  /** Undefined for header rows that only total their children. */
  bookAmount?: number
  adjustment?: number
  /** Present when the row expands into sub-accounts. */
  children?: { account: string; bookAmount: number; adjustment: number }[]
}

export type BooksAdjustmentSection = {
  title?: string
  rows: BooksAdjustmentRow[]
}

export const BOOKS_ADJUSTMENT_SECTIONS: BooksAdjustmentSection[] = [
  {
    rows: [
      {
        line: '1a',
        label: 'Gross receipts or sales',
        account: 'Sales',
        children: [
          { account: 'Sales of product income', bookAmount: 32000, adjustment: 0 },
          { account: 'Consulting income', bookAmount: 20000, adjustment: 0 },
        ],
      },
      { line: '7', label: 'Other income (loss)', account: 'Interest earned', bookAmount: 965.18, adjustment: 0 },
      { line: '13', label: 'Rent', account: 'Office lease', bookAmount: 1203.44, adjustment: 0 },
      {
        line: '20',
        label: 'Shipping, Freight & Delivery',
        account: 'Freight out',
        bookAmount: 9600,
        adjustment: 0,
      },
      { line: '20', label: 'Travel meals', account: 'Meals & entertainment', bookAmount: 2400, adjustment: -1200 },
      { line: '26', label: 'Other deductions', account: 'Software subscriptions', bookAmount: 3899.48, adjustment: 0 },
    ],
  },
  {
    title: 'SCHEDULE L',
    rows: [
      { line: '1(d)', label: 'Cash', account: 'Business checking', bookAmount: 48250.12, adjustment: 0 },
      {
        line: '15(d)',
        label: 'Accounts payable',
        account: 'Accounts payable',
        bookAmount: 76286.1,
        adjustment: 0,
      },
    ],
  },
]

export function taxAmount(bookAmount: number, adjustment: number): number {
  return bookAmount + adjustment
}

export function formatAmount(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
