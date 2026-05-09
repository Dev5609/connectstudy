
"use client"

import { Navbar } from "@/components/layout/Navbar"
import { FocusTimer } from "@/components/study/FocusTimer"
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts"
import { Button } from "@/components/ui/button"
import { Plus, Users, ArrowRight, Lock, Globe, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { useMemo } from "react"

export default function Home() {
  const db = useFirestore()
  
  const roomsQuery = useMemo(() => {
    if (!db) return null
    return query(collection(db, "rooms"), orderBy("createdAt", "desc"), limit(6))
  }, [db])

  const { data: rooms, loading } = useCollection(roomsQuery)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-12 space-y-16">
        <section className="grid lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter leading-none">
                DEEP WORK.<br />TOGETHER.
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Join focused study rooms with friends and colleagues. 
                Synchronized timers, low-latency video, and minimalist aesthetics.
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button size="lg" className="justify-between group">
                Join a Room
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="justify-between">
                Create Private Room
                <Lock className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <FocusTimer />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Active Study Rooms</h2>
            <Link href="/rooms" className="text-xs font-bold uppercase hover:underline">View All</Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin opacity-20" />
            </div>
          ) : rooms && rooms.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard 
                  key={room.id}
                  id={room.id}
                  name={room.name} 
                  participants={room.participantCount || 0} 
                  type={room.type} 
                  topic={room.topic} 
                  image={room.image || `https://picsum.photos/seed/${room.id}/600/400`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed bg-muted/20">
              <p className="text-sm font-bold uppercase tracking-widest opacity-40">No active rooms found. Start one to begin.</p>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Your Productivity</h2>
            <Link href="/analytics" className="text-xs font-bold uppercase hover:underline">Full Report</Link>
          </div>
          <AnalyticsCharts />
        </section>
      </main>

      <footer className="border-t py-12 mt-12 bg-secondary/20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold tracking-tighter">
            <span className="text-xl">ConnectStudy</span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Support</a>
            <a href="#" className="hover:text-foreground">About</a>
          </div>
          <p className="text-[10px] uppercase font-medium tracking-widest opacity-40">
            © 2024 ConnectStudy. Focus first.
          </p>
        </div>
      </footer>
    </div>
  )
}

function RoomCard({ id, name, participants, type, topic, image }: { id: string, name: string, participants: number, type: 'public' | 'private', topic: string, image: string }) {
  return (
    <Link href={`/rooms/${id}`} className="group">
      <div className="border-2 hover:bg-secondary/30 transition-smooth overflow-hidden">
        <div className="aspect-[16/9] relative grayscale group-hover:grayscale-0 transition-all duration-500 overflow-hidden">
          <img 
            src={image} 
            alt={name} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase border">
              {topic}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            {type === 'private' ? <Lock className="w-4 h-4 text-white drop-shadow-lg" /> : <Globe className="w-4 h-4 text-white drop-shadow-lg" />}
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-black text-lg tracking-tight uppercase leading-none">{name}</h3>
            <div className="flex items-center gap-1.5 opacity-60">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{participants}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-dashed">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Join Session</span>
            <ArrowRight className="w-4 h-4 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  )
}
