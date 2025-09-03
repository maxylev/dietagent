"use client"

import { AnimatedCloud } from "@/components/AnimatedCloud"
import { ChatInterface } from "@/components/ChatInterface"
import { FloatingParticles } from "@/components/FloatingParticles"
import { InfoDialog } from "@/components/InfoDialog"
import { SocialLinks } from "@/components/SocialLinks"
import { ThemeToggle } from "@/components/ThemeToggle"
import { VoiceVisualizer } from "@/components/VoiceVisualizer"
import { useSpeechRecognition } from "@/hooks/use-speech-recognition"
import { Info, UserCircle2 } from "lucide-react"
import Link from "next/link"
import React, { useState } from "react"

export default function HomePage() {
  const [showChat, setShowChat] = useState(false)
  const [recognizedText, setRecognizedText] = useState("")
  const [cloudState, setCloudState] = useState<"idle" | "listening" | "processing" | "responding">("idle")

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported,
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
  })

  const handleCloudClick = async () => {
    if (isListening) {
      stopListening()
      return
    }

    // Always show chat interface when cloud is clicked
    setShowChat(true)

    try {
      await startListening()
      setCloudState("listening")
    } catch (error) {
      // Handle microphone errors gracefully - chat is already shown
      console.log("Microphone access error, but chat interface is shown:", error)
      setCloudState("idle")
    }
  }

  React.useEffect(() => {
    if (transcript && !isListening) {
      setRecognizedText(transcript)
      setCloudState("processing")

      // Show the chat interface with the recognized text
      setShowChat(true)

      // Clear text after showing
      setTimeout(() => {
        setRecognizedText("")
        setCloudState("idle")
        resetTranscript()
      }, 3000)
    }
  }, [transcript, isListening, resetTranscript])

  // Keyboard shortcut to open chat
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        setShowChat(true)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  React.useEffect(() => {
    if (isListening) {
      setCloudState("listening")
    }
  }, [isListening])

  const handleTextRecognized = (text: string) => {
    setRecognizedText(text)
    setCloudState("processing")

    // Clear text after animation
    setTimeout(() => {
      setRecognizedText("")
      setCloudState("responding")
    }, 2000)
  }



  return (
    <main className="min-h-screen bg-background relative overflow-hidden animate-in fade-in duration-500">
      <FloatingParticles count={6} />

      {!showChat && (
        <nav className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <InfoDialog>
            <button className="glass p-2 sm:p-3 rounded-full hover:glass-strong transition-all duration-300 group">
              <Info className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:scale-110 transition-transform" />
            </button>
          </InfoDialog>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/profile">
               <button className="glass p-2 sm:p-3 rounded-full hover:glass-strong transition-all duration-300 group">
                <UserCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:scale-110 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </nav>
      )}

      {!showChat && (
        <div className="fixed inset-0 flex items-center justify-center z-10 p-4">
        <div className="relative flex items-center justify-center w-full h-full max-w-4xl max-h-4xl">
          {/* Cloud component - always centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              onClick={() => setShowChat(true)}
              className="cursor-pointer"
            >
              <AnimatedCloud
                state={cloudState}
                onClick={handleCloudClick}
                recognizedText={recognizedText || interimTranscript}
                isListening={isListening}
              />
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white drop-shadow-2xl font-heading tracking-wide px-4">
                <span className="text-blue-600 dark:text-blue-200 absolute -top-30 left-1/2 -translate-x-1/2 text-[100px] opacity-10">diet</span>
                <span className="text-white text-[120px] opacity-50">🍽️</span>
                <span className="text-cyan-600 dark:text-cyan-200 absolute -bottom-25 left-1/2 -translate-x-1/2 text-[100px] opacity-10">agent</span>
              </h1>
            </div>
          </div>

          {/* Voice visualizer overlay */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <VoiceVisualizer isListening={isListening} />
            </div>
          )}
        </div>
      </div>
      )}

      {showChat && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-0 bg-black/20 backdrop-blur-sm animate-fade-in">
          <div className="w-[90%] sm:w-[80%] h-[90vh] sm:h-[80vh] max-h-[90vh] sm:max-h-[80vh] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-in slide-in-from-bottom-2 duration-300">
            <ChatInterface
              onClose={() => setShowChat(false)}
              onStateChange={setCloudState}
              onTextRecognized={handleTextRecognized}
            />
          </div>
        </div>
      )}

      {!showChat && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 max-w-7xl mx-auto">
          <div className="glass px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
            <p className="text-xs sm:text-sm text-muted-foreground">© 2024 Cloud Diet Agent</p>
          </div>

          <SocialLinks />
        </div>
      </footer>
      )}
    </main>
  )
}