import * as React from "react"

export type Theme = "light" | "dark"

const ThemeContext = React.createContext<{ theme: Theme; setTheme: (t: Theme) => void } | null>(null)

const initial = (): Theme => (document.documentElement.classList.contains("dark") ? "dark" : "light")

/* Tiny class-based theme store. The map needs the resolved theme as React
   state (it swaps basemap styles and re-reads token colours), so this owns it
   directly rather than going through next-themes. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(initial)
  const setTheme = React.useCallback((t: Theme) => {
    document.documentElement.classList.toggle("dark", t === "dark")
    try {
      localStorage.setItem("theme", t)
    } catch {
      /* private mode — theme just won't persist */
    }
    setThemeState(t)
  }, [])
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme outside ThemeProvider")
  return ctx
}
