"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

interface Particle {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  direction: number
}

interface FloatingParticlesProps {
  count?: number
  className?: string
}

export function FloatingParticles({ count = 20, className = "" }: FloatingParticlesProps) {
  const { theme } = useTheme()
  const [particles, setParticles] = useState<Particle[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const initialParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.5 + 0.1,
      direction: Math.random() * Math.PI * 2,
    }))

    setParticles(initialParticles)
  }, [count])

  useEffect(() => {
    if (!mounted) return

    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          x: (particle.x + Math.cos(particle.direction) * particle.speed + 100) % 100,
          y: (particle.y + Math.sin(particle.direction) * particle.speed + 100) % 100,
          direction: particle.direction + (Math.random() - 0.5) * 0.1,
        })),
      )
    }, 50)

    return () => clearInterval(interval)
  }, [mounted])

  if (!mounted) return null

  const getParticleColor = () => {
    return theme === "dark" ? "rgba(249, 115, 22, 0.3)" : "rgba(234, 88, 12, 0.4)"
  }

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full transition-all duration-1000 ease-out"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: getParticleColor(),
            opacity: particle.opacity,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </div>
  )
}
