
"use client"

import { Navbar } from "@/components/layout/Navbar"
import { FocusTimer } from "@/components/study/FocusTimer"
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, LogIn } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, limit, orderBy, doc, setDoc } from "firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { serverTimestamp, getDocs, where } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function Home() {
  const db = useFirestore()
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomTopic, setNewRoomTopic] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const [joinCode, setJoinCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  const userSessionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "sessions"),
      orderBy("timestamp", "desc"),
      limit(14)
    )
  }, [db, user])

  const { data: sessions } = useCollection(userSessionsQuery)

  const handleCreateRoom = () => {
    if (!db || !user || !newRoomName || !newRoomTopic) return
    setIsCreating(true)

    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const roomRef = doc(collection(db, "rooms"))
    const roomId = roomRef.id
    
    const roomData = {
      name: newRoomName,
      topic: newRoomTopic,
      type: "public",
      participantCount: 1,
      createdAt: serverTimestamp(),
      ownerId: user.uid,
      joinCode: code,
      image: `https://picsum.photos/seed/${Math.random()}/800/600`
    }

    // Initiate write without await for instant UX
    setDoc(roomRef, roomData)
      .catch(async (error) => {
        setIsCreating(false)
        const permissionError = new FirestorePermissionError({
          path: roomRef.path,
          operation: 'create',
          requestResourceData: roomData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    // Close and navigate immediately
    setIsRoomDialogOpen(false)
    setIsCreating(false)
    setNewRoomName("")
    setNewRoomTopic("")
    toast({ title: "Room Created", description: `Join Code: ${code}` })
    router.push(`/rooms/${roomId}`)
  }

  const handleJoinRoom = async () => {
    if (!db || !joinCode) return
    setIsJoining(true)

    try {
      const q = query(collection(db, "rooms"), where("joinCode", "==", joinCode.trim()), limit(1))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        toast({ variant: "destructive", title: "Invalid Code", description: "No room found with this code." })
        setIsJoining(false)
      } else {
        const roomDoc = querySnapshot.docs[0]
        setIsJoinDialogOpen(false)
        setIsJoining(false)
        setJoinCode("")
        router.push(`/rooms/${roomDoc.id}`)
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 md:space-y-16 max-w-7xl">
        <section className="grid lg:grid-cols-3 gap-8 md:gap-12 items-center">
          <div className="lg:col-span-1 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] uppercase text-white">
                SILENT.<br />FOCUS.
              </h1>
              <p className="text-muted-foreground text-[10px] leading-relaxed max-w-sm mx-auto lg:mx-0 uppercase tracking-[0.4em] font-black opacity-40">
                Architectural productivity collective.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 max-w-xs mx-auto lg:mx-0">
              <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full justify-between group border-2 border-white/10 bg-black text-white hover:bg-white hover:text-black transition-all rounded-none font-black uppercase tracking-widest h-16"
                  >
                    Create Room
                    <Plus className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-2 border-white/10 rounded-none max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tighter text-2xl text-white">Create Room</DialogTitle>
                    <DialogDescription className="text-[10px] uppercase tracking-widest opacity-40">Define your study workspace.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-8">
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest opacity-40 text-white">Room Name</Label>
                      <Input 
                        value={newRoomName} 
                        onChange={(e) => setNewRoomName(e.target.value)} 
                        className="bg-black border-2 border-white/10 rounded-none h-12 focus-visible:border-white/40 text-white" 
                        placeholder="e.g. Design Lab"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-black tracking-widest opacity-40 text-white">Focus Topic</Label>
                      <Input 
                        value={newRoomTopic} 
                        onChange={(e) => setNewRoomTopic(e.target.value)} 
                        className="bg-black border-2 border-white/10 rounded-none h-12 focus-visible:border-white/40 text-white" 
                        placeholder="e.g. Mathematics"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateRoom} 
                      disabled={isCreating || !newRoomName || !newRoomTopic}
                      className="w-full bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest h-14 rounded-none"
                    >
                      {isCreating ? "Creating..." : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full justify-between group border-2 border-white/10 bg-black text-white hover:bg-white hover:text-black transition-all rounded-none font-black uppercase tracking-widest h-16"
                  >
                    Join Room
                    <LogIn className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-2 border-white/10 rounded-none max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tighter text-2xl text-white">Join Room</DialogTitle>
                    <DialogDescription className="text-[10px] uppercase tracking-widest opacity-40">Enter the 6-digit room code.</DialogDescription>
                  </DialogHeader>
                  <div className="py-12">
                    <Input 
                      value={joinCode} 
                      onChange={(e) => setJoinCode(e.target.value)} 
                      placeholder="000000" 
                      className="bg-black border-2 border-white/10 text-center text-4xl h-24 font-black tracking-[0.5em] rounded-none focus-visible:border-white/40 text-white" 
                      maxLength={6}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleJoinRoom} 
                      disabled={isJoining || joinCode.length < 6}
                      className="w-full bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest h-14 rounded-none"
                    >
                      {isJoining ? "Joining..." : "Join"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="lg:col-span-2 w-full max-w-2xl mx-auto lg:max-w-none">
            <FocusTimer />
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.6em] opacity-30">Activity Overview</h2>
            <Link href="/analytics" className="text-[10px] font-black uppercase tracking-widest hover:text-white/60 transition-colors">View Details</Link>
          </div>
          <AnalyticsCharts sessions={sessions || []} />
        </section>
      </main>

      <footer className="border-t border-white/5 py-16 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 font-black tracking-tighter text-2xl">
            <BookOpen className="w-8 h-8" />
            <span>CONNECTSTUDY</span>
          </div>
          <p className="text-[10px] uppercase font-black tracking-[0.4em] opacity-20">
            © 2024 CONNECTSTUDY. DEEP WORK ONLY.
          </p>
        </div>
      </footer>
    </div>
  )
}
