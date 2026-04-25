export function formatPercent(value: number, withSign = true): string {
  const prefix = withSign && value > 0 ? '+' : ''
  return `${prefix}${value.toFixed(2)}%`
}
