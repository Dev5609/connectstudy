
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
  const [customDuration, setCustomDuration] = useState(20)

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
    <Card className="p-6 md:p-10 border-2 border-white/10 shadow-2xl flex flex-col items-center gap-6 md:gap-8 bg-black rounded-none">
      <Tabs value={mode} onValueChange={handleModeChange} className="w-full max-w-[280px]">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 rounded-none h-12">
          <TabsTrigger value="infinite" className="text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black rounded-none">Flow</TabsTrigger>
          <TabsTrigger value="custom" className="text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black rounded-none">Fix</TabsTrigger>
          <TabsTrigger value="pomodoro" className="text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black rounded-none">Pomo</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col items-center gap-2">
        <span className="text-6xl md:text-9xl font-black tracking-tighter font-mono leading-none">
          {formatTime(timeLeft)}
        </span>
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground mt-2">
          {mode === "infinite" ? "Unbound Session" : isBreak ? "Short Interval" : "Core Focus"}
        </span>
      </div>

      <div className="flex items-center gap-6">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 md:h-12 md:w-12 border-2 border-white/10 hover:bg-white hover:text-black transition-all rounded-none" 
          onClick={resetTimer}
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
        <Button 
          variant="default" 
          size="lg" 
          className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white text-black hover:scale-105 transition-transform"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? <Pause className="w-8 h-8 md:w-10 md:h-10" /> : <Play className="w-8 h-8 md:w-10 md:h-10 ml-1" />}
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 md:h-12 md:w-12 border-2 border-white/10 hover:bg-white hover:text-black transition-all rounded-none"
            >
              <Settings2 className="w-5 h-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 space-y-4 bg-black border-2 border-white/20 p-6 rounded-none">
            <h4 className="text-[10px] font-bold uppercase tracking-widest border-b border-white/10 pb-2">Configuration</h4>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="pomo" className="text-[10px] uppercase font-bold opacity-60">Pomo Duration (min)</Label>
                <Input 
                  id="pomo" 
                  type="number" 
                  value={pomoDuration} 
                  onChange={(e) => setPomoDuration(Number(e.target.value))} 
                  className="h-10 text-xs bg-white/5 border-white/20 rounded-none text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="custom" className="text-[10px] uppercase font-bold opacity-60">Fix Mode Duration (min)</Label>
                <Input 
                  id="custom" 
                  type="number" 
                  value={customDuration} 
                  onChange={(e) => setCustomDuration(Number(e.target.value))} 
                  className="h-10 text-xs bg-white/5 border-white/20 rounded-none text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="break" className="text-[10px] uppercase font-bold opacity-60">Break Duration (min)</Label>
                <Input 
                  id="break" 
                  type="number" 
                  value={breakDuration} 
                  onChange={(e) => setBreakDuration(Number(e.target.value))} 
                  className="h-10 text-xs bg-white/5 border-white/20 rounded-none text-white"
                />
              </div>
            </div>
            <Button className="w-full text-[10px] uppercase font-bold bg-white text-black hover:bg-white/90 rounded-none h-10" onClick={resetTimer}>
              Update & Reset
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </Card>
  )
}
