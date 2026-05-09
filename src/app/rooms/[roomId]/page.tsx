"use client"

import { useParams } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { FocusTimer } from "@/components/study/FocusTimer"
import { VideoGrid } from "@/components/study/VideoGrid"
import { ChatPanel } from "@/components/study/ChatPanel"
import { Button } from "@/components/ui/button"
import { Share2, LogOut, Info } from "lucide-react"

export default function StudyRoomPage() {
  const params = useParams()
  const roomId = params.roomId as string

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Room Area */}
        <div className="flex-1 flex flex-col bg-muted/20 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black uppercase tracking-tighter">CS101 Final Prep</h1>
                <span className="text-[10px] border-2 px-2 py-0.5 font-bold uppercase bg-background">Public</span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                Room Code: <span className="font-bold text-foreground select-all">CS-8921-X</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Invite
              </Button>
              <Button variant="destructive" size="sm" className="gap-2">
                <LogOut className="w-4 h-4" />
                Leave
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
            {/* Focus Control Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-background border-2 p-2">
                <FocusTimer />
              </div>
              
              <div className="bg-background border-2 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Session Statistics</h4>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Total Time</p>
                    <p className="text-2xl font-black">2h 45m</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Completed</p>
                    <p className="text-2xl font-black">4 Pomo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Interaction Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Active Participants (3)</h4>
              </div>
              <VideoGrid />
            </div>
          </div>
        </div>

        {/* Messaging Sidebar */}
        <ChatPanel />
      </div>
    </div>
  )
}