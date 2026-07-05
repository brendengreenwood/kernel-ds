import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "kernel-portal"

export function Sizes() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Avatar size="sm">
        <AvatarFallback>EM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>SL</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>DP</AvatarFallback>
      </Avatar>
    </div>
  )
}

export function WithBadge() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar size="lg">
        <AvatarFallback>EM</AvatarFallback>
        <AvatarBadge style={{ background: "var(--primary)" }} />
      </Avatar>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600 }}>Ellis Morgan</div>
        <div style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
          Driver · on route to Ridgeway
        </div>
      </div>
    </div>
  )
}

export function Group() {
  return (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>SL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>EM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>DP</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+5</AvatarGroupCount>
    </AvatarGroup>
  )
}
