import * as React from "react"

// Prototype stand-in for sign-in. In the real system the role comes from RBAC.
export type Persona = "merchant" | "originator"

export const PERSONAS: { id: Persona; label: string }[] = [
  { id: "merchant", label: "Merchant" },
  { id: "originator", label: "Originator" },
]

const Ctx = React.createContext<{ persona: Persona; setPersona: (p: Persona) => void } | null>(null)

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersona] = React.useState<Persona>("merchant")
  return <Ctx.Provider value={{ persona, setPersona }}>{children}</Ctx.Provider>
}

export function usePersona() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("usePersona outside PersonaProvider")
  return ctx
}

export function personaLabel(p: Persona) {
  return PERSONAS.find((x) => x.id === p)!.label
}
