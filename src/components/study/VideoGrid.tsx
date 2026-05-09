"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Video, VideoOff, MoreVertical, Loader2, Info } from "lucide-react"
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

  useEffect(() => {
    let stream: MediaStream | null = null

    async function setupMedia() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
        setLocalStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Error accessing media devices:", err)
        toast({
          variant: "destructive",
          title: "Media Error",
          description: "Could not access camera or microphone.",
        })
      }
    }

    setupMedia()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => (track.enabled = isVideoOn))
      localStream.getAudioTracks().forEach((track) => (track.enabled = isMicOn))
    }
  }, [isVideoOn, isMicOn, localStream])

  useEffect(() => {
    if (!db || !user || !roomId) return

    const participantRef = doc(db, "rooms", roomId, "participants", user.uid)
    
    setDoc(participantRef, {
      name: user.displayName || "Anonymous",
      photoURL: user.photoURL || "",
      joinedAt: serverTimestamp(),
      isMicOn: isMicOn,
      isVideoOn: isVideoOn,
      status: "Focusing"
    }, { merge: true })

    return () => {
      deleteDoc(participantRef).catch(() => {})
    }
  }, [db, user, roomId, isMicOn, isVideoOn])

  const toggleMic = () => {
    setIsMicOn(!isMicOn)
  }

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn)
  }

  const changeStatus = (newStatus: string) => {
    if (!db || !user || !roomId) return
    const participantRef = doc(db, "rooms", roomId, "participants", user.uid)
    updateDoc(participantRef, { status: newStatus })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 border-2 border-dashed border-primary/20">
        <Loader2 className="w-6 h-6 animate-spin opacity-20" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants?.map((p: any) => (
          <div key={p.id} className="relative aspect-video bg-muted group overflow-hidden border-2 border-primary/10">
            {p.id === user?.uid ? (
              <div className="relative w-full h-full bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-all duration-500 ${!isVideoOn ? 'hidden' : ''}`}
                />
                {!isVideoOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-card">
                    <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-lg">
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback className="font-bold text-xl">{user.displayName?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full h-full">
                {p.isVideoOn ? (
                   <img 
                     src={p.photoURL || `https://picsum.photos/seed/${p.id}/400/300`} 
                     alt={p.name} 
                     className="w-full h-full object-cover grayscale opacity-50"
                   />
                ) : (
                  <div className="flex items-center justify-center h-full bg-card">
                     <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-lg">
                      <AvatarImage src={p.photoURL} />
                      <AvatarFallback className="font-bold text-xl">{p.name?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            )}
            
            <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex flex-col">
                <span className="text-white text-xs font-bold uppercase tracking-tight">{p.name} {p.id === user?.uid && "(You)"}</span>
                <span className="text-white/70 text-[10px] uppercase tracking-[0.2em] font-medium">{p.status}</span>
              </div>
              <div className="flex gap-2">
                {!p.isMicOn && <MicOff className="w-3.5 h-3.5 text-destructive" />}
                {p.isMicOn && <Mic className="w-3.5 h-3.5 text-white" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-8 py-6 bg-card border-2 border-primary/10 mt-4 shadow-xl">
        <Button 
          variant={isMicOn ? "outline" : "destructive"} 
          size="icon" 
          onClick={toggleMic}
          className="rounded-none h-12 w-12 border-2 border-primary/20"
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>
        <Button 
          variant={isVideoOn ? "outline" : "destructive"} 
          size="icon" 
          onClick={toggleVideo}
          className="rounded-none h-12 w-12 border-2 border-primary/20"
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>
        <div className="w-px h-8 bg-primary/20" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-none h-12 w-12 border-2 border-primary/20">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-primary/20">
            <DropdownMenuItem onClick={() => changeStatus("Deep Work")} className="text-xs uppercase font-bold">Deep Work</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeStatus("Reading")} className="text-xs uppercase font-bold">Reading</DropdownMenuItem>
            <DropdownMenuItem onClick={() => changeStatus("Coffee Break")} className="text-xs uppercase font-bold">Coffee Break</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}