"use client"

import { useCallback, useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface SpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  finalTranscript: string
  startListening: () => Promise<void>
  stopListening: () => void
  resetTranscript: () => void
  isSupported: boolean
  error: string | null
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): UseSpeechRecognitionReturn {
  const { continuous = false, interimResults = true, language = "en-US" } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [finalTranscript, setFinalTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<any | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isListeningRef = useRef(false)

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null

    // Check if speech recognition is supported
    setIsSupported(!!SpeechRecognition)

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser")
      return
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      isListeningRef.current = true
      setError(null)
    }

    recognition.onresult = (event: any) => {
      let interim = ""
      let final = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      setInterimTranscript(interim)
      if (final) {
        setFinalTranscript((prev) => prev + final)
        setTranscript((prev) => prev + final)
      }

      // Auto-stop after 2 seconds of silence if continuous is false
      if (!continuous) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isListeningRef.current) {
            try {
              recognition.stop()
            } catch (err) {
              console.warn("Failed to stop recognition:", err)
            }
          }
        }, 2000)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      setError(`Speech recognition error: ${event.error}`)
      setIsListening(false)
      isListeningRef.current = false
    }

    recognition.onend = () => {
      setIsListening(false)
      isListeningRef.current = false
      setInterimTranscript("")
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (err) {
          console.warn("Failed to stop recognition on cleanup:", err)
        }
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [continuous, interimResults, language])

  const startListening = useCallback(async (): Promise<void> => {
    if (!recognitionRef.current || !isSupported) {
      setError("Speech recognition not available")
      return
    }

    // Prevent starting if already listening
    if (isListeningRef.current) {
      return
    }

    try {
      // Request microphone permission if not already granted
      await navigator.mediaDevices.getUserMedia({ audio: true })

      setError(null)
      setInterimTranscript("")
      setTranscript("")
      setFinalTranscript("")

      // Start recognition
      recognitionRef.current.start()

      // Set listening state immediately
      setIsListening(true)
      isListeningRef.current = true

    } catch (err: any) {
      console.warn("Microphone error:", err.message)
      setIsListening(false)
      isListeningRef.current = false

      if (err.name === "NotAllowedError") {
        setError("Microphone access denied. Speech recognition is disabled.")
      } else if (err.name === "NotFoundError") {
        setError("No microphone found. Speech recognition is disabled.")
      } else {
        setError(`Microphone error: ${err.message}`)
      }
      // Don't throw the error - just set the error state and let the UI handle it gracefully
      return
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setFinalTranscript("")
    setInterimTranscript("")
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    finalTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  }
}
