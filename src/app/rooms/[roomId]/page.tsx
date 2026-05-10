
"use client"

import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { FocusTimer } from "@/components/study/FocusTimer"
import { VideoGrid } from "@/components/study/VideoGrid"
import { ChatPanel } from "@/components/study/ChatPanel"
import { Button } from "@/components/ui/button"
import { LogOut, Info, Loader2, Copy, Trash2 } from "lucide-react"
import { useDoc, useFirestore, useUser } from "@/firebase"
import { doc, deleteDoc } from "firebase/firestore"
import { useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function StudyRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()
  const roomId = params.roomId as string
  const db = useFirestore()

  const roomDocRef = useMemo(() => {
    if (!db || !roomId) return null
    return doc(db, "rooms", roomId)
  }, [db, roomId])

  const { data: room, loading } = useDoc(roomDocRef)

  const copyCode = () => {
    if (room?.joinCode) {
      navigator.clipboard.writeText(room.joinCode)
      toast({
        title: "Copied",
        description: "Room code copied to clipboard.",
      })
    }
  }

  const handleLeave = () => {
    router.push("/")
  }

  const handleDeleteRoom = () => {
    if (!db || !roomId || !user || !room) return
    if (confirm("Are you sure you want to delete this room?")) {
      const roomRef = doc(db, "rooms", roomId)
      deleteDoc(roomRef)
        .catch(async (error) => {
          const permissionError = new FirestorePermissionError({
            path: roomRef.path,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      
      toast({ title: "Room Deleted", description: "The workspace has been closed." })
      router.push("/")
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 animate-spin text-white opacity-20" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="h-screen flex flex-col bg-black">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Not Found</h1>
            <Button onClick={() => router.push("/")} className="bg-white text-black font-bold uppercase tracking-widest rounded-none px-8">Home</Button>
          </div>
        </div>
      </div>
    )
  }

  const isOwner = user?.uid === room.ownerId

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black uppercase tracking-tighter">{room.name}</h1>
                <div 
                  onClick={copyCode}
                  className="group flex items-center gap-2 border-2 border-white/10 px-3 py-1 cursor-pointer hover:border-white/40 transition-all bg-white/5"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Code: {room.joinCode}</span>
                  <Copy className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold opacity-60">
                {room.topic}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {isOwner && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 rounded-none border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white uppercase font-bold tracking-widest h-10 px-6 transition-all" 
                  onClick={handleDeleteRoom}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Room
                </Button>
              )}
              <Button variant="destructive" size="sm" className="gap-2 rounded-none uppercase font-bold tracking-widest h-10 px-6" onClick={handleLeave}>
                <LogOut className="w-4 h-4" />
                Leave
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-black border-2 border-white/10 p-2 shadow-2xl">
                <FocusTimer roomContext={room.name} />
              </div>
              
              <div className="bg-black border-2 border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Stats</h4>
                  <Info className="w-3.5 h-3.5 opacity-20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black opacity-40">Topic</p>
                    <p className="text-xl font-black tracking-tight">{room.topic}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-black opacity-40">Users</p>
                    <p className="text-xl font-black tracking-tight">{room.participantCount || 1}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <VideoGrid />
            </div>
          </div>
        </div>

        <ChatPanel roomId={roomId} />
      </div>
    </div>
  )
}
