"use client"

import { useState, useEffect, useCallback } from "react"
import { Play, Pause, RotateCcw, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { useFirestore, useUser } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TimerMode = "infinite" | "custom" | "pomodoro"

interface FocusTimerProps {
  roomContext?: string
}

export function FocusTimer({ roomContext = "Personal Session" }: FocusTimerProps) {
  const { user } = useUser()
  const db = useFirestore()
  
  const [mode, setMode] = useState<TimerMode>("pomodoro")
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  
  const [pomoDuration, setPomoDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [customDuration, setCustomDuration] = useState(40)

  const saveSession = useCallback(async (durationSeconds: number) => {
    if (!db || !user || durationSeconds < 60) return

    addDoc(collection(db, "users", user.uid, "sessions"), {
      title: roomContext,
      durationMinutes: Math.floor(durationSeconds / 60),
      type: mode,
      timestamp: serverTimestamp(),
      userId: user.uid
    })
  }, [db, user, roomContext, mode])

  useEffect(() => {
    let interval: any = null

    if (isActive) {
      if (!sessionStartTime) setSessionStartTime(Date.now())
      
      interval = setInterval(() => {
        if (mode === "infinite") {
          setTimeLeft((prev) => prev + 1)
        } else {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              setIsActive(false)
              
              if (!isBreak) {
                const totalSecs = mode === "pomodoro" ? pomoDuration * 60 : customDuration * 60
                saveSession(totalSecs)
              }

              if (mode === "pomodoro") {
                const nextIsBreak = !isBreak
                setIsBreak(nextIsBreak)
                return nextIsBreak ? breakDuration * 60 : pomoDuration * 60
              }
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)
    } else {
      if (sessionStartTime && mode === "infinite") {
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000)
        saveSession(duration)
        setSessionStartTime(null)
      }
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [isActive, mode, isBreak, saveSession, sessionStartTime, pomoDuration, breakDuration, customDuration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60)
    const secs = Math.abs(seconds) % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const resetTimer = () => {
    setIsActive(false)
    setSessionStartTime(null)
    if (mode === "infinite") setTimeLeft(0)
    else if (mode === "custom") setTimeLeft(customDuration * 60)
    else setTimeLeft(isBreak ? breakDuration * 60 : pomoDuration * 60)
  }

  const handleModeChange = (val: string) => {
    const newMode = val as TimerMode
    setMode(newMode)
    setIsActive(false)
    setSessionStartTime(null)
    if (newMode === "infinite") setTimeLeft(0)
    else if (newMode === "custom") setTimeLeft(customDuration * 60)
    else setTimeLeft(pomoDuration * 60)
  }

  return (
    <Card className="p-8 border-2 border-primary/10 shadow-xl flex flex-col items-center gap-6 bg-card">
      <Tabs value={mode} onValueChange={handleModeChange} className="w-full max-w-xs">
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="infinite" className="text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-foreground">Free</TabsTrigger>
          <TabsTrigger value="custom" className="text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-foreground">Fixed</TabsTrigger>
          <TabsTrigger value="pomodoro" className="text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-foreground">Pomo</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col items-center gap-2">
        <span className="text-8xl font-black tracking-tighter font-mono text-primary">
          {formatTime(timeLeft)}
        </span>
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {mode === "infinite" ? "Flowing Time" : isBreak ? "Short Break" : "Deep Work"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-12 w-12 border-2 border-primary/20" 
          onClick={resetTimer}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button 
          variant="default" 
          size="lg" 
          className="h-16 w-16 rounded-full bg-primary text-background hover:scale-105 transition-transform"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-12 w-12 border-2 border-primary/20"
            >
              <Settings2 className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-4 bg-card border-primary/20">
            <h4 className="text-xs font-bold uppercase tracking-widest">Timer Settings</h4>
            <div className="grid gap-2">
              <Label htmlFor="pomo" className="text-[10px] uppercase font-bold">Pomo (min)</Label>
              <Input 
                id="pomo" 
                type="number" 
                value={pomoDuration} 
                onChange={(e) => setPomoDuration(Number(e.target.value))} 
                className="h-8 text-xs bg-background"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="break" className="text-[10px] uppercase font-bold">Break (min)</Label>
              <Input 
                id="break" 
                type="number" 
                value={breakDuration} 
                onChange={(e) => setBreakDuration(Number(e.target.value))} 
                className="h-8 text-xs bg-background"
              />
            </div>
            <Button className="w-full text-[10px] uppercase font-bold" onClick={resetTimer}>Apply & Reset</Button>
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  )
}