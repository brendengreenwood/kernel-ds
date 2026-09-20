import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/* App-local, not consumed from the portal. The prototype is a second consumer
   of the DESIGN SYSTEM (`packages/ui`), not of the portal application — these
   two shell pieces live in the portal's own `src/components/`, so reaching for
   them coupled the app to a sibling app. Both are thin enough to own. */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
