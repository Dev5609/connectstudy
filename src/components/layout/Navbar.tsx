
"use client"

import Link from "next/link"
import { Monitor, BarChart3, Settings, BookOpen, Plus, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth, useUser } from "@/firebase"
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const { user } = useUser()
  const auth = useAuth()

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
            <Link href="/rooms" className="text-sm font-medium hover:text-accent transition-colors">Rooms</Link>
            <Link href="/analytics" className="text-sm font-medium hover:text-accent transition-colors">Analytics</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                <Plus className="w-4 h-4" />
                Create Room
              </Button>
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
