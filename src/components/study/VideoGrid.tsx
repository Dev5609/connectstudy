"use client"

import { useState } from "react"
import { Mic, MicOff, Video, VideoOff, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const participants = [
  { id: 1, name: "You", status: "Focusing", image: "https://picsum.photos/seed/u1/200/200" },
  { id: 2, name: "Sarah K.", status: "Deep Work", image: "https://picsum.photos/seed/u2/200/200" },
  { id: 3, name: "Alex Chen", status: "Reading", image: "https://picsum.photos/seed/u3/200/200" },
]

export function VideoGrid() {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
      {participants.map((p) => (
        <div key={p.id} className="relative aspect-video bg-muted group overflow-hidden border">
          {isVideoOn && p.id === 1 ? (
             <img 
               src={p.image} 
               alt={p.name} 
               className="w-full h-full object-cover grayscale opacity-80"
             />
          ) : p.id !== 1 ? (
             <img 
               src={p.image} 
               alt={p.name} 
               className="w-full h-full object-cover grayscale opacity-60"
             />
          ) : (
            <div className="flex items-center justify-center h-full">
               <Avatar className="w-20 h-20 border-2 border-background shadow-lg">
                <AvatarImage src={p.image} />
                <AvatarFallback>{p.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          )}
          
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col">
              <span className="text-white text-xs font-semibold">{p.name}</span>
              <span className="text-white/70 text-[10px] uppercase tracking-tighter">{p.status}</span>
            </div>
            <div className="flex gap-1">
              <div className="p-1 bg-white/20 backdrop-blur-md rounded">
                <Mic className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Controls Bar (Pinned to local video or floating) */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white border shadow-2xl px-6 py-3 flex items-center gap-6 z-50">
        <Button 
          variant={isMicOn ? "outline" : "destructive"} 
          size="icon" 
          onClick={() => setIsMicOn(!isMicOn)}
          className="rounded-full h-12 w-12 border-2"
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>
        <Button 
          variant={isVideoOn ? "outline" : "destructive"} 
          size="icon" 
          onClick={() => setIsVideoOn(!isVideoOn)}
          className="rounded-full h-12 w-12 border-2"
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>
        <div className="w-px h-8 bg-border" />
        <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-2">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}