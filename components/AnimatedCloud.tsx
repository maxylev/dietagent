"use client"

import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface AnimatedCloudProps {
  state: "idle" | "listening" | "processing" | "responding"
  onClick: () => void
  recognizedText: string
  isListening: boolean
}

export function AnimatedCloud({ state, onClick, recognizedText, isListening }: AnimatedCloudProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const cloudRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      if (cloudRef.current) {
        const rect = cloudRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2
        const x = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)))
        const y = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)))
        setMousePosition({ x, y })
      }
    })
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [handleMouseMove])

  const cloudStyle = useMemo(() => {
    const { x, y } = mousePosition
    const isDark = theme === "dark"

    const backgroundImage = isDark
        ? `radial-gradient(circle at ${50 + x * 10}% ${50 + y * 10}%, 
          rgba(72, 198, 239, 0.8) 0%, 
          rgba(111, 134, 214, 0.7) 100%
        )`
      : `radial-gradient(circle at ${50 + x * 10}% ${50 + y * 10}%, 
          rgba(137, 247, 254, 0.8) 0%, 
          rgba(102, 166, 255, 0.7) 100%
        )`

    return {
      backgroundImage,
      transform: `translate(${x * 2}px, ${y * 2}px)`,
      borderRadius: `${45 + Math.sin(Date.now() * 0.001) * 5}% ${55 + Math.cos(Date.now() * 0.0012) * 5}% ${50 + Math.sin(Date.now() * 0.0008) * 5}% ${50 + Math.cos(Date.now() * 0.0015) * 5}%`,
    }
  }, [mousePosition, theme])

  const getStateClasses = () => {
    switch (state) {
      case "listening":
        return "scale-110 shadow-2xl shadow-primary/50"
      case "processing":
        return "scale-105 shadow-xl shadow-accent/40"
      case "responding":
        return "scale-102 shadow-lg shadow-primary/30"
      default:
        return isHovered ? "scale-101 shadow-xl shadow-primary/25" : "scale-100 shadow-lg shadow-primary/20"
    }
  }

  if (!mounted) {
    return <div className="w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-muted animate-pulse" />
  }

  return (
    <div
      ref={cloudRef}
      className={cn(
        "w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 cursor-pointer transition-all duration-500 ease-out relative overflow-hidden backdrop-blur-sm pointer-events-auto",
        getStateClasses(),
        isListening && "animate-pulse",
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={cloudStyle}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              left: `${20 + ((i * 60) % 60)}%`,
              top: `${25 + ((i * 50) % 50)}%`,
              animation: `float ${3 + (i % 2)}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {recognizedText && (
        <div className="absolute inset-0 flex items-center justify-center p-6 z-20">
          <div className="text-white text-base md:text-lg font-medium text-center leading-relaxed drop-shadow-lg max-w-xs">
            {recognizedText.split(" ").map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="inline-block mr-2 animate-bounce opacity-0"
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animationFillMode: "forwards",
                  animationDuration: "0.5s",
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center z-10">
        {state === "listening" && <div className="w-4 h-4 bg-white/90 rounded-full animate-ping" />}
        {state === "processing" && (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white/80 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.6s",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}