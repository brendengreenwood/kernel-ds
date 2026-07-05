import { Progress, ProgressLabel, ProgressValue } from "kernel-portal"

export function Canonical() {
  return (
    <div style={{ width: 280 }}>
      <Progress value={62} />
    </div>
  )
}

export function WithLabelAndValue() {
  return (
    <div style={{ width: 280 }}>
      <Progress value={78}>
        <ProgressLabel>Contract fill</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  )
}

export function Levels() {
  return (
    <div style={{ width: 280, display: "grid", gap: 18 }}>
      <Progress value={12}>
        <ProgressLabel>Wheat — SRW basis pool</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={54}>
        <ProgressLabel>Soybeans — Nov delivery</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={100}>
        <ProgressLabel>Corn — CZ26 delivered</ProgressLabel>
        <ProgressValue />
      </Progress>
    </div>
  )
}
