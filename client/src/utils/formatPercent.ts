export function formatPercent(value: number | null | undefined, withSign = true): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%'
  }
  const prefix = withSign && value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}
