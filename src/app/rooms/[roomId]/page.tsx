
"use client"

import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { FocusTimer } from "@/components/study/FocusTimer"
import { VideoGrid } from "@/components/study/VideoGrid"
import { ChatPanel } from "@/components/study/ChatPanel"
import { Button } from "@/components/ui/button"
import { Share2, LogOut, Info, Loader2 } from "lucide-react"
import { useDoc, useFirestore } from "@/firebase"
import { doc } from "firebase/firestore"
import { useMemo } from "react"
import { useToast } from "@/hooks/use-toast"

export default function StudyRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const roomId = params.roomId as string
  const db = useFirestore()

  const roomDocRef = useMemo(() => {
    if (!db || !roomId) return null
    return doc(db, "rooms", roomId)
  }, [db, roomId])

  const { data: room, loading } = useDoc(roomDocRef)

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Invite others by sharing this URL.",
      })
    }
  }

  const handleLeave = () => {
    router.push("/")
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-black uppercase">Room Not Found</h1>
            <Button onClick={() => router.push("/")}>Return Dashboard</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col bg-muted/20 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black uppercase tracking-tighter">{room.name}</h1>
                <span className="text-[10px] border-2 px-2 py-0.5 font-bold uppercase bg-background">
                  {room.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                Room ID: <span className="font-bold text-foreground select-all">{roomId}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Invite
              </Button>
              <Button variant="destructive" size="sm" className="gap-2" onClick={handleLeave}>
                <LogOut className="w-4 h-4" />
                Leave
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-background border-2 p-2">
                <FocusTimer roomContext={room.name} />
              </div>
              
              <div className="bg-background border-2 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Session Statistics</h4>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Topic</p>
                    <p className="text-xl font-black">{room.topic}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Participants</p>
                    <p className="text-xl font-black">{room.participantCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Live Interaction</h4>
              </div>
              <VideoGrid />
            </div>
          </div>
        </div>

        <ChatPanel roomId={roomId} />
      </div>
    </div>
  )
}
