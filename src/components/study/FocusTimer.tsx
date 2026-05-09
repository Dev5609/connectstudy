"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Pause, RotateCcw, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"

type TimerMode = "infinite" | "custom" | "pomodoro"

export function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>("pomodoro")
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  const playBeep = useCallback(() => {
    // 1-second soft beep placeholder
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime)
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 1)
  }, [])

  useEffect(() => {
    let interval: any = null

    if (isActive) {
      interval = setInterval(() => {
        if (mode === "infinite") {
          setTimeLeft((prev) => prev + 1)
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              setIsActive(false)
              playBeep()
              if (mode === "pomodoro") {
                setIsBreak(!isBreak)
                return isBreak ? 25 * 60 : 5 * 60
              }
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isActive, mode, isBreak, playBeep])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.abs(seconds) % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const resetTimer = () => {
    setIsActive(false)
    if (mode === "infinite") setTimeLeft(0)
    else if (mode === "custom") setTimeLeft(40 * 60)
    else setTimeLeft(25 * 60)
  }

  const handleModeChange = (val: string) => {
    const newMode = val as TimerMode
    setMode(newMode)
    setIsActive(false)
    if (newMode === "infinite") setTimeLeft(0)
    else if (newMode === "custom") setTimeLeft(40 * 60)
    else setTimeLeft(25 * 60)
  }

  return (
    <Card className="p-8 border-none shadow-none flex flex-col items-center gap-6">
      <Tabs value={mode} onValueChange={handleModeChange} className="w-full max-w-xs">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="infinite" className="text-xs uppercase tracking-widest">Free</TabsTrigger>
          <TabsTrigger value="custom" className="text-xs uppercase tracking-widest">Fixed</TabsTrigger>
          <TabsTrigger value="pomodoro" className="text-xs uppercase tracking-widest">Pomo</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col items-center gap-2">
        <span className="text-8xl font-bold tracking-tighter font-mono">
          {formatTime(timeLeft)}
        </span>
        <span className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {mode === "infinite" ? "Flowing Time" : isBreak ? "Short Break" : "Deep Work"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12 border-2" 
          onClick={resetTimer}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button 
          variant="default" 
          size="lg" 
          className="h-16 w-16 rounded-full"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12 border-2"
        >
          <Settings2 className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  )
}