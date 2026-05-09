"use client"

import Link from "next/link"
import { Monitor, BarChart3, Settings, BookOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
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
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <Plus className="w-4 h-4" />
            Create Room
          </Button>
          <Button variant="default" size="sm">
            Login
          </Button>
        </div>
      </div>
    </nav>
  )
}