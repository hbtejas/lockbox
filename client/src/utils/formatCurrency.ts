export function formatCurrency(value: number | null | undefined, currency = 'INR'): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0.00'
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}
