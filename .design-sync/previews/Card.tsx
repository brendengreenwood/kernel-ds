import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "kernel-portal"

export function Canonical() {
  return (
    <Card style={{ width: 360 }}>
      <CardHeader>
        <CardTitle>Corn — CZ26 forward contract</CardTitle>
        <CardDescription>
          5,000 bu @ $4.62 · Ridgeway River Terminal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--muted-foreground)" }}>Delivered</span>
          <span style={{ fontWeight: 500 }}>3,120 bu</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ color: "var(--muted-foreground)" }}>Remaining</span>
          <span style={{ fontWeight: 500 }}>1,880 bu</span>
        </div>
      </CardContent>
      <CardFooter style={{ gap: 10 }}>
        <Button size="sm">Schedule load</Button>
        <Button size="sm" variant="ghost">
          View contract
        </Button>
      </CardFooter>
    </Card>
  )
}

export function WithAction() {
  return (
    <Card style={{ width: 360 }}>
      <CardHeader>
        <CardTitle>Load #4471</CardTitle>
        <CardDescription>Corn · 980 bu · driver Ellis Morgan</CardDescription>
        <CardAction>
          <Badge variant="info">In transit</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p style={{ color: "var(--muted-foreground)" }}>
          Departed Hartley elevator 10:42 AM — ETA at river terminal 1:15 PM.
        </p>
      </CardContent>
    </Card>
  )
}

export function SmallStat() {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Card size="sm" style={{ width: 170 }}>
        <CardHeader>
          <CardDescription>Bushels this week</CardDescription>
          <CardTitle style={{ fontSize: 22 }}>42,180</CardTitle>
        </CardHeader>
      </Card>
      <Card size="sm" style={{ width: 170 }}>
        <CardHeader>
          <CardDescription>Avg basis</CardDescription>
          <CardTitle style={{ fontSize: 22 }}>-22¢</CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}
