import { Alert, AlertDescription, AlertTitle } from "kernel-portal"
import { AlertTriangle, CheckCircle2, Info, Wheat, XCircle } from "lucide-react"

export function Canonical() {
  return (
    <div style={{ width: 460 }}>
      <Alert>
        <Wheat />
        <AlertTitle>Scale ticket received</AlertTitle>
        <AlertDescription>
          Ticket #8812 recorded 978 bu of corn at 15.1% moisture.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export function SuccessAndInfo() {
  return (
    <div style={{ width: 460, display: "grid", gap: 14 }}>
      <Alert variant="success">
        <CheckCircle2 />
        <AlertTitle>Settlement posted</AlertTitle>
        <AlertDescription>
          Load #4471 settled at $4.62/bu — payment scheduled for Friday.
        </AlertDescription>
      </Alert>
      <Alert variant="info">
        <Info />
        <AlertTitle>Basis moved 4¢</AlertTitle>
        <AlertDescription>
          River terminal posted a new corn basis 12 minutes ago.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export function WarningAndDestructive() {
  return (
    <div style={{ width: 460, display: "grid", gap: 14 }}>
      <Alert variant="warning">
        <AlertTriangle />
        <AlertTitle>Moisture over spec</AlertTitle>
        <AlertDescription>
          This corn load tested 16.2% — a drying discount will apply at intake.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <XCircle />
        <AlertTitle>Settlement failed</AlertTitle>
        <AlertDescription>
          Bank rejected the ACH transfer. Re-enter routing details to retry.
        </AlertDescription>
      </Alert>
    </div>
  )
}
