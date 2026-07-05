import * as React from "react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  Label,
} from "kernel-portal"

export function Default() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Label>Verification code</Label>
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}

export function WithValue() {
  const [code, setCode] = React.useState("204718")
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Label>Scale ticket confirmation</Label>
      <InputOTP maxLength={6} value={code} onChange={setCode}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}

export function DriverPin() {
  const [pin, setPin] = React.useState("8034")
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <Label>Driver PIN</Label>
      <InputOTP maxLength={4} value={pin} onChange={setPin}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}
