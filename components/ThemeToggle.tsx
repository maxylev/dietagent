"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
  }

  const currentTheme = theme === "system" ? systemTheme : theme

  const toggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    console.log("[v0] Theme toggle:", { current: currentTheme, new: newTheme })
    setTheme(newTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="glass p-3 rounded-full hover:glass-strong transition-all duration-300 group"
    >
      {currentTheme === "dark" ? (
        <Sun className="h-5 w-5 text-foreground group-hover:rotate-180 transition-transform duration-300" />
      ) : (
        <Moon className="h-5 w-5 text-foreground group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  )
}
