"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface VoiceVisualizerProps {
  isListening: boolean
  className?: string
}

export function VoiceVisualizer({ isListening, className }: VoiceVisualizerProps) {
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(12).fill(0))

  useEffect(() => {
    if (!isListening) {
      setAudioLevels(new Array(12).fill(0))
      return
    }

    const interval = setInterval(() => {
      setAudioLevels((prev) => prev.map(() => Math.random() * 100))
    }, 100)

    return () => clearInterval(interval)
  }, [isListening])

  return (
    <div className={cn("flex items-end justify-center gap-1 h-12", className)}>
      {audioLevels.map((level, index) => (
        <div
          key={index}
          className="bg-white/80 rounded-full transition-all duration-100 ease-out"
          style={{
            width: "3px",
            height: isListening ? `${Math.max(4, level * 0.4)}px` : "4px",
            opacity: isListening ? 0.7 + level * 0.003 : 0.3,
          }}
        />
      ))}
    </div>
  )
}
