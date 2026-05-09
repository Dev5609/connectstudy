"use client"

import Link from "next/link"
import { BookOpen, Plus, LogOut } from "lucide-react"
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
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function Navbar() {
  const { user } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  
  // Room State
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomTopic, setNewRoomTopic] = useState("")
  const [isCreating, setIsCreating] = useState(false)

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
      toast({ title: "Session Resumed", description: "Welcome back to your workspace." })
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

  const handleCreateRoom = async () => {
    if (!db || !user || !newRoomName || !newRoomTopic) return
    setIsCreating(true)

    const roomData = {
      name: newRoomName,
      topic: newRoomTopic,
      type: "public",
      participantCount: 1,
      createdAt: serverTimestamp(),
      ownerId: user.uid,
      image: `https://picsum.photos/seed/${Math.random()}/800/600`
    }

    try {
      const docRef = await addDoc(collection(db, "rooms"), roomData)
      setIsRoomDialogOpen(false)
      setNewRoomName("")
      setNewRoomTopic("")
      router.push(`/rooms/${docRef.id}`)
      toast({
        title: "Room Created",
        description: `Successfully launched ${newRoomName}.`,
      })
    } catch (error: any) {
      const permissionError = new FirestorePermissionError({
        path: "rooms",
        operation: "create",
        requestResourceData: roomData,
      })
      errorEmitter.emit("permission-error", permissionError)
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Could not create the room.",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl tracking-tighter flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <span>ConnectStudy</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-accent transition-colors">Dashboard</Link>
            <Link href="/analytics" className="text-sm font-medium hover:text-accent transition-colors">Analytics</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <Plus className="w-4 h-4" />
                    Create Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tighter">Launch Study Room</DialogTitle>
                    <DialogDescription className="text-xs uppercase tracking-widest">
                      Set the focus for your new collaborative session.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest">Room Identity</Label>
                      <Input
                        id="name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="e.g., Deep Focus Architecture"
                        className="border-2"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="topic" className="text-[10px] font-bold uppercase tracking-widest">Core Topic</Label>
                      <Input
                        id="topic"
                        value={newRoomTopic}
                        onChange={(e) => setNewRoomTopic(e.target.value)}
                        placeholder="e.g., UI Design / React Patterns"
                        className="border-2"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      onClick={handleCreateRoom} 
                      disabled={isCreating || !newRoomName || !newRoomTopic}
                      className="w-full uppercase font-bold tracking-widest"
                    >
                      {isCreating ? "Initializing..." : "Activate Workspace"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-tight leading-none">{user.displayName || "Scholar"}</span>
                  <span className="text-[9px] text-muted-foreground uppercase">{user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs uppercase font-bold tracking-widest opacity-60 hover:opacity-100">
                  <LogOut className="w-4 h-4 mr-2" />
                  Exit
                </Button>
              </div>
            </>
          ) : (
            <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  Sign In / Register
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="font-black uppercase tracking-tighter text-2xl">ConnectStudy</DialogTitle>
                  <DialogDescription className="text-[10px] uppercase tracking-widest">
                    Enter your credentials to access the study collective.
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login" className="text-[10px] uppercase font-bold tracking-widest">Login</TabsTrigger>
                    <TabsTrigger value="register" className="text-[10px] uppercase font-bold tracking-widest">Register</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="email-login" className="text-[10px] font-bold uppercase tracking-widest">Email</Label>
                        <Input 
                          id="email-login" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="scholar@example.com" 
                          required 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="password-login" className="text-[10px] font-bold uppercase tracking-widest">Password</Label>
                        <Input 
                          id="password-login" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                        />
                      </div>
                      <Button type="submit" disabled={isAuthLoading} className="w-full font-bold uppercase tracking-widest">
                        {isAuthLoading ? "Authenticating..." : "Enter Workspace"}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-1">
                        <Label htmlFor="name-reg" className="text-[10px] font-bold uppercase tracking-widest">Full Name</Label>
                        <Input 
                          id="name-reg" 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          placeholder="John Doe" 
                          required 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email-reg" className="text-[10px] font-bold uppercase tracking-widest">Email</Label>
                        <Input 
                          id="email-reg" 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="scholar@example.com" 
                          required 
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="password-reg" className="text-[10px] font-bold uppercase tracking-widest">Password</Label>
                        <Input 
                          id="password-reg" 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                        />
                      </div>
                      <Button type="submit" disabled={isAuthLoading} className="w-full font-bold uppercase tracking-widest">
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