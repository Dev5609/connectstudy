
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Mic, MicOff, Video, VideoOff, MoreVertical, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useParams } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function VideoGrid() {
  const { user } = useUser()
  const db = useFirestore()
  const params = useParams()
  const roomId = params.roomId as string
  const { toast } = useToast()

  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const participantsQuery = useMemoFirebase(() => {
    if (!db || !roomId) return null
    return collection(db, "rooms", roomId, "participants")
  }, [db, roomId])

  const { data: participants, loading } = useCollection(participantsQuery)

  const setupMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setLocalStream(stream)
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Camera and microphone access is required for real-time study.",
      })
    }
  }, [toast])

  useEffect(() => {
    setupMedia()
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [setupMedia])

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = isVideoOn ? localStream : null
    }
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = isVideoOn)
      localStream.getAudioTracks().forEach(track => track.enabled = isMicOn)
    }
  }, [localStream, isVideoOn, isMicOn])

  useEffect(() => {
    if (!db || !user || !roomId) return

    const participantRef = doc(db, "rooms", roomId, "participants", user.uid)
    
    setDoc(participantRef, {
      name: user.displayName || "User",
      photoURL: user.photoURL || "",
      joinedAt: serverTimestamp(),
      isMicOn: isMicOn,
      isVideoOn: isVideoOn,
      status: isVideoOn ? "Live Focus" : "Private",
      lastActive: serverTimestamp()
    }, { merge: true })

    const heartbeat = setInterval(() => {
      updateDoc(participantRef, { lastActive: serverTimestamp() }).catch(() => {})
    }, 30000)

    return () => {
      clearInterval(heartbeat)
      deleteDoc(participantRef).catch(() => {})
    }
  }, [db, user, roomId, isMicOn, isVideoOn])

  const toggleMic = () => setIsMicOn(!isMicOn)
  const toggleVideo = () => setIsVideoOn(!isVideoOn)

  const changeStatus = (newStatus: string) => {
    if (!db || !user || !roomId) return
    const participantRef = doc(db, "rooms", roomId, "participants", user.uid)
    updateDoc(participantRef, { status: newStatus })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-white/5 bg-black">
        <Loader2 className="w-8 h-8 animate-spin opacity-20" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants?.map((p: any) => (
          <div key={p.id} className="relative aspect-video bg-black group border-2 border-white/10 transition-all hover:border-white/30 rounded-none">
            {p.id === user?.uid ? (
              <div className="relative w-full h-full bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover saturate-100 ${!isVideoOn ? 'hidden' : ''}`}
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <Avatar className="w-20 h-20 border-2 border-white/10 rounded-none">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback className="font-black text-2xl text-white">{user?.displayName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full h-full">
                {p.isVideoOn ? (
                   <div className="w-full h-full relative">
                     <img 
                       src={p.photoURL || `https://picsum.photos/seed/${p.id}/400/300`} 
                       alt={p.name} 
                       className="w-full h-full object-cover opacity-100 saturate-100"
                     />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                       <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Live Focus</span>
                     </div>
                   </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-black">
                     <Avatar className="w-20 h-20 border-2 border-white/10 rounded-none">
                      <AvatarImage src={p.photoURL} />
                      <AvatarFallback className="font-black text-2xl text-white">{p.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            )}
            
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black to-transparent flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-white text-[10px] font-black uppercase tracking-tight">{p.name} {p.id === user?.uid && "(You)"}</span>
                <span className="text-white/60 text-[8px] uppercase tracking-[0.3em] font-bold">{p.status}</span>
              </div>
              <div className="flex gap-2">
                {!p.isMicOn && <MicOff className="w-3.5 h-3.5 text-red-500" />}
                {p.isMicOn && <Mic className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-6 py-8 bg-black border-2 border-white/10 rounded-none">
        <Button 
          variant={isMicOn ? "outline" : "destructive"} 
          size="icon" 
          onClick={toggleMic}
          className="rounded-none h-14 w-14 border-2 border-white/10 hover:border-white/40 bg-black text-white"
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </Button>
        <Button 
          variant={isVideoOn ? "outline" : "destructive"} 
          size="icon" 
          onClick={toggleVideo}
          className="rounded-none h-14 w-14 border-2 border-white/10 hover:border-white/40 bg-black text-white"
        >
          {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-none h-14 w-14 border-2 border-white/10 hover:border-white/40 bg-black text-white">
              <MoreVertical className="w-6 h-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-black border-2 border-white/20 rounded-none min-w-[160px]">
            <DropdownMenuItem onClick={() => changeStatus("Deep Work")} className="text-[10px] uppercase font-black tracking-widest p-4 cursor-pointer hover:bg-white hover:text-black text-white">Deep Work</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeStatus("Focus")} className="text-[10px] uppercase font-black tracking-widest p-4 cursor-pointer hover:bg-white hover:text-black text-white">Focus</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeStatus("Break")} className="text-[10px] uppercase font-black tracking-widest p-4 cursor-pointer hover:bg-white hover:text-black text-white">Break</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
