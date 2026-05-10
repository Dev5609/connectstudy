
"use client"

import { Navbar } from "@/components/layout/Navbar"
import { FocusTimer } from "@/components/study/FocusTimer"
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, LogIn, Loader2 } from "lucide-react"
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
  
  // Create Room State
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomTopic, setNewRoomTopic] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Join Room State
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

    setDoc(roomRef, roomData)
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: roomRef.path,
          operation: 'create',
          requestResourceData: roomData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

    // Optimistic navigation
    setIsRoomDialogOpen(false)
    setIsCreating(false)
    setNewRoomName("")
    setNewRoomTopic("")
    toast({ title: "Workspace Launching", description: `Room code: ${code}. Redirecting...` })
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
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 md:space-y-16">
        <section className="grid lg:grid-cols-3 gap-8 md:gap-12 items-center">
          <div className="lg:col-span-1 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.85] uppercase">
                DEEP WORK.<br />TOGETHER.
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto lg:mx-0 uppercase tracking-widest font-bold opacity-60">
                Synchronized focus. Minimalist aesthetics.
              </p>
            </div>
            
            <div className="flex flex-col gap-3 max-w-xs mx-auto lg:mx-0">
              <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    className="w-full justify-between group border-2 border-white/10 bg-black text-white hover:bg-white hover:text-black transition-all rounded-none font-black uppercase tracking-widest"
                  >
                    Create Room
                    <Plus className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-2 border-white/20">
                  <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tighter">Launch Workspace</DialogTitle>
                    <DialogDescription className="text-[10px] uppercase tracking-widest opacity-60">Define your focus objective.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Room Name</Label>
                      <Input 
                        value={newRoomName} 
                        onChange={(e) => setNewRoomName(e.target.value)} 
                        className="bg-black border-2 border-white/10" 
                        placeholder="e.g. Architectural Design"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] uppercase font-bold tracking-widest opacity-60">Core Topic</Label>
                      <Input 
                        value={newRoomTopic} 
                        onChange={(e) => setNewRoomTopic(e.target.value)} 
                        className="bg-black border-2 border-white/10" 
                        placeholder="e.g. Physics Revision"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateRoom} 
                      disabled={isCreating || !newRoomName || !newRoomTopic}
                      className="w-full bg-black text-white border-2 border-white/20 hover:bg-white hover:text-black font-black uppercase tracking-widest"
                    >
                      {isCreating ? "Initializing..." : "Activate"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="w-full justify-between group border-2 border-white/10 bg-black text-white hover:bg-white hover:text-black transition-all rounded-none font-black uppercase tracking-widest"
                  >
                    Join Room
                    <LogIn className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-2 border-white/20">
                  <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tighter">Enter Code</DialogTitle>
                    <DialogDescription className="text-[10px] uppercase tracking-widest opacity-60">Join an existing study group.</DialogDescription>
                  </DialogHeader>
                  <div className="py-8">
                    <Input 
                      value={joinCode} 
                      onChange={(e) => setJoinCode(e.target.value)} 
                      placeholder="6-DIGIT CODE" 
                      className="bg-black border-2 border-white/10 text-center text-3xl h-20 font-black tracking-[0.5em]" 
                      maxLength={6}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleJoinRoom} 
                      disabled={isJoining || joinCode.length < 6}
                      className="w-full bg-black text-white border-2 border-white/20 hover:bg-white hover:text-black font-black uppercase tracking-widest"
                    >
                      {isJoining ? "Connecting..." : "Connect"}
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

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 pb-4 border-white/10">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Temporal Productivity</h2>
            <Link href="/analytics" className="text-[10px] font-black uppercase tracking-widest hover:underline">Full Analytics</Link>
          </div>
          <AnalyticsCharts sessions={sessions || []} />
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-black tracking-tighter text-xl">
            <BookOpen className="w-6 h-6" />
            <span>CONNECTSTUDY</span>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40">
            © 2024 CONNECTSTUDY. DEEP WORK ONLY.
          </p>
        </div>
      </footer>
    </div>
  )
}
