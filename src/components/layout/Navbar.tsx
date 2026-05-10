
"use client"

import Link from "next/link"
import { BookOpen, Plus, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { collection, doc, setDoc, serverTimestamp, query, where, getDocs, limit } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export function Navbar() {
  const { user } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  
  // Create Room State
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomTopic, setNewRoomTopic] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Join Room State
  const [joinCode, setJoinCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)

  // Auth State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return
    setIsAuthLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setIsAuthDialogOpen(false)
      toast({ title: "Session Resumed", description: "Welcome back." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Access Denied", description: error.message })
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return
    setIsAuthLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: name })
      setIsAuthDialogOpen(false)
      toast({ title: "Account Initialized", description: "Your study profile is ready." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Registration Failed", description: error.message })
    } finally {
      setIsAuthLoading(false)
    }
  }

  const handleLogout = async () => {
    if (!auth) return
    await signOut(auth)
    router.push("/")
  }

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

    setIsRoomDialogOpen(false)
    setIsCreating(false)
    setNewRoomName("")
    setNewRoomTopic("")
    toast({
      title: "Room Created",
      description: `Room code: ${code}. Redirecting...`,
    })
    router.push(`/rooms/${roomId}`)
  }

  const handleJoinRoom = async () => {
    if (!db || !joinCode) return
    setIsJoining(true)

    try {
      const q = query(collection(db, "rooms"), where("joinCode", "==", joinCode.trim()), limit(1))
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Invalid Code",
          description: "No room found with this join code.",
        })
        setIsJoining(false)
      } else {
        const roomDoc = querySnapshot.docs[0]
        setIsJoinDialogOpen(false)
        setIsJoining(false)
        setJoinCode("")
        router.push(`/rooms/${roomDoc.id}`)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Joining",
        description: error.message || "Could not join room.",
      })
      setIsJoining(false)
    }
  }

  return (
    <nav className="border-b border-white/10 bg-black sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <span>ConnectStudy</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors opacity-60 hover:opacity-100">Dashboard</Link>
            <Link href="/analytics" className="text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors opacity-60 hover:opacity-100">Analytics</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-2 border-white/10 hover:border-white/30 uppercase text-[10px] font-bold tracking-widest bg-black">
                    <LogIn className="w-4 h-4" />
                    Join Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-2 border-white/20">
                  <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tighter">Enter Room Code</DialogTitle>
                    <DialogDescription className="text-[10px] uppercase tracking-widest opacity-60">
                      Enter the 6-digit code shared by the room owner.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-8">
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="border-2 border-white/10 bg-black text-center text-2xl h-16 font-black tracking-[0.5em]"
                      maxLength={6}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleJoinRoom} 
                      disabled={isJoining || joinCode.length < 6}
                      className="w-full bg-black text-white border-2 border-white/20 hover:bg-white hover:text-black font-bold uppercase tracking-widest"
                    >
                      {isJoining ? "Connecting..." : "Join Workspace"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2 border-2 border-white/10 hover:border-white/30 uppercase text-[10px] font-bold tracking-widest bg-black">
                    <Plus className="w-4 h-4" />
                    Create Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black border-2 border-white/20">
                  <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tighter">Launch Study Room</DialogTitle>
                    <DialogDescription className="text-[10px] uppercase tracking-widest opacity-60">
                      Set the focus for your new collaborative session.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Room Identity</Label>
                      <Input
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="e.g. Deep Focus Architecture"
                        className="border-2 border-white/10 bg-black"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Core Topic</Label>
                      <Input
                        value={newRoomTopic}
                        onChange={(e) => setNewRoomTopic(e.target.value)}
                        placeholder="e.g. UI Design"
                        className="border-2 border-white/10 bg-black"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleCreateRoom} 
                      disabled={isCreating || !newRoomName || !newRoomTopic}
                      className="w-full bg-black text-white border-2 border-white/20 hover:bg-white hover:text-black font-bold uppercase tracking-widest"
                    >
                      {isCreating ? "Initializing..." : "Activate Workspace"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border border-white/10">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback className="bg-white text-black font-black text-[10px]">{user.displayName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-[10px] uppercase font-bold tracking-widest opacity-60 hover:opacity-100 text-white">
                  <LogOut className="w-4 h-4 mr-2" />
                  Exit
                </Button>
              </div>
            </>
          ) : (
            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-2 border-white/10 hover:border-white/30 uppercase text-[10px] font-bold tracking-widest text-white bg-black">
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] bg-black border-2 border-white/20">
                <DialogHeader>
                  <DialogTitle className="font-black uppercase tracking-tighter text-2xl">ConnectStudy</DialogTitle>
                  <DialogDescription className="text-[10px] uppercase tracking-widest opacity-60">
                    Access the study collective.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-white/5 border border-white/10">
                    <TabsTrigger value="login" className="text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">Login</TabsTrigger>
                    <TabsTrigger value="register" className="text-[10px] uppercase font-bold tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">Register</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Email</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black border-2 border-white/10" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Password</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black border-2 border-white/10" required />
                      </div>
                      <Button type="submit" disabled={isAuthLoading} className="w-full font-bold uppercase tracking-widest bg-black text-white border-2 border-white/20 hover:bg-white hover:text-black">
                        {isAuthLoading ? "Authenticating..." : "Enter Workspace"}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Full Name</Label>
                        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-black border-2 border-white/10" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Email</Label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black border-2 border-white/10" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Password</Label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black border-2 border-white/10" required />
                      </div>
                      <Button type="submit" disabled={isAuthLoading} className="w-full font-bold uppercase tracking-widest bg-black text-white border-2 border-white/20 hover:bg-white hover:text-black">
                        {isAuthLoading ? "Initialising..." : "Create Profile"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </nav>
  )
}
