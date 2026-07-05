import { Skeleton } from "kernel-portal"

export function LoadRow() {
  return (
    <div style={{ width: 300, display: "flex", alignItems: "center", gap: 12 }}>
      <Skeleton style={{ width: 44, height: 44, borderRadius: "50%" }} />
      <div style={{ flex: 1, display: "grid", gap: 8 }}>
        <Skeleton style={{ height: 12, width: "60%" }} />
        <Skeleton style={{ height: 12, width: "90%" }} />
      </div>
    </div>
  )
}

export function TextBlock() {
  return (
    <div style={{ width: 300, display: "grid", gap: 10 }}>
      <Skeleton style={{ height: 12, width: "100%" }} />
      <Skeleton style={{ height: 12, width: "80%" }} />
      <Skeleton style={{ height: 12, width: "92%" }} />
    </div>
  )
}

export function CardShape() {
  return (
    <div style={{ width: 300, display: "grid", gap: 12 }}>
      <Skeleton style={{ height: 128, width: "100%", borderRadius: 12 }} />
      <Skeleton style={{ height: 14, width: "55%" }} />
      <Skeleton style={{ height: 12, width: "75%" }} />
    </div>
  )
}
