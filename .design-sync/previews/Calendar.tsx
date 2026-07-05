import * as React from "react"
import { Calendar } from "kernel-portal"

export function DeliveryDate() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 6, 12))
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      defaultMonth={new Date(2026, 6, 12)}
      style={{
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        background: "var(--card)",
      }}
    />
  )
}
