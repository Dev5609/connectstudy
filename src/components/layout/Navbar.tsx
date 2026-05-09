"use client"

import Link from "next/link"
import { Monitor, BarChart3, Settings, BookOpen, Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth, useUser, useFirestore } from "@/firebase"
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
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
import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export function Navbar() {
  const { user } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomTopic, setNewRoomTopic] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleLogin = async () => {
    if (!auth) return
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Login failed", error)
    }
  }

  const handleLogout = async () => {
    if (!auth) return
    await signOut(auth)
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

    addDoc(collection(db, "rooms"), roomData)
      .then(() => {
        setIsDialogOpen(false)
        setNewRoomName("")
        setNewRoomTopic("")
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: "rooms",
          operation: "create",
          requestResourceData: roomData,
        })
        errorEmitter.emit("permission-error", permissionError)
      })
      .finally(() => {
        setIsCreating(false)
      })
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
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                    <Plus className="w-4 h-4" />
                    Create Room
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="font-black uppercase tracking-tighter">Create Study Room</DialogTitle>
                    <DialogDescription className="text-xs uppercase tracking-widest">
                      Start a new session and invite others to join.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest">Room Name</Label>
                      <Input
                        id="name"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="Deep Focus Session"
                        className="border-2"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="topic" className="text-[10px] font-bold uppercase tracking-widest">Focus Topic</Label>
                      <Input
                        id="topic"
                        value={newRoomTopic}
                        onChange={(e) => setNewRoomTopic(e.target.value)}
                        placeholder="UI Design / Coding / Reading"
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
                      {isCreating ? "Creating..." : "Launch Room"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={user.photoURL || ""} />
                  <AvatarFallback>{user.displayName?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs uppercase font-bold tracking-widest opacity-60 hover:opacity-100">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={handleLogin}>
              Login with Google
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
