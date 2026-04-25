import { useState } from 'react'
import Button from '../ui/Button'

interface AlertFormProps {
  onSubmit: (payload: { symbol: string; alertType: string; triggerValue: number }) => void
}

function AlertForm({ onSubmit }: AlertFormProps) {
  const [symbol, setSymbol] = useState('RELIANCE')
  const [alertType, setAlertType] = useState('price_above')
  const [triggerValue, setTriggerValue] = useState(3000)

  return (
    <section className="card-shell p-4">
      <h3 className="mb-3 text-sm font-semibold">Set New Alert</h3>
      <form
        className="grid gap-2 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit({ symbol, alertType, triggerValue })
        }}
      >
        <input
          value={symbol}
          onChange={(event) => setSymbol(event.target.value.toUpperCase())}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-sm"
          placeholder="Ticker"
        />
        <select
          value={alertType}
          onChange={(event) => setAlertType(event.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-sm"
        >
          <option value="price_above">Price Above</option>
          <option value="price_below">Price Below</option>
          <option value="volume_spike">Volume Spike</option>
          <option value="week_52_high">52W High Breach</option>
          <option value="week_52_low">52W Low Breach</option>
          <option value="rsi">RSI Overbought/Oversold</option>
        </select>
        <input
          type="number"
          value={triggerValue}
          onChange={(event) => setTriggerValue(Number(event.target.value))}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-2 text-sm"
          placeholder="Trigger"
        />
        <Button type="submit">Create Alert</Button>
      </form>
    </section>
  )
}

export default AlertForm
