"use client"

import { Navbar } from "@/components/layout/Navbar"
import { FocusTimer } from "@/components/study/FocusTimer"
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import Image from "next/image"

export default function Home() {
  const db = useFirestore()
  const { user } = useUser()
  
  const roomsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "rooms"), orderBy("createdAt", "desc"), limit(6))
  }, [db])

  const { data: rooms, loading: roomsLoading } = useCollection(roomsQuery)

  const userSessionsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "sessions"),
      orderBy("timestamp", "desc"),
      limit(14)
    )
  }, [db, user])

  const { data: sessions } = useCollection(userSessionsQuery)

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12 md:space-y-16">
        <section className="grid lg:grid-cols-3 gap-8 md:gap-12 items-center">
          <div className="lg:col-span-1 space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.9] uppercase">
                DEEP WORK.<br />TOGETHER.
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto lg:mx-0">
                Join focused study rooms with friends and colleagues. 
                Synchronized timers and minimalist aesthetics.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center lg:justify-start">
              <Button 
                size="lg" 
                variant="outline"
                className="justify-between group border-2 hover:bg-white hover:text-black transition-all" 
                asChild
              >
                <a href="#active-rooms">
                  Explore Rooms
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2 w-full max-w-2xl mx-auto lg:max-w-none">
            <FocusTimer />
          </div>
        </section>

        <section id="active-rooms" className="space-y-6">
          <div className="flex items-center justify-between border-b-2 pb-4 border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Active Study Rooms</h2>
          </div>
          
          {roomsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin opacity-20" />
            </div>
          ) : rooms && rooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room: any) => (
                <RoomCard 
                  key={room.id}
                  id={room.id}
                  name={room.name} 
                  participants={room.participantCount || 0} 
                  topic={room.topic} 
                  image={room.image || `https://picsum.photos/seed/${room.id}/600/400`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-white/10 bg-white/5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-40 mb-4">No active rooms found</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Create a room to start studying.</p>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 pb-4 border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Temporal Productivity</h2>
            <Link href="/analytics" className="text-xs font-bold uppercase hover:underline">Full Report</Link>
          </div>
          <AnalyticsCharts sessions={sessions || []} />
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 mt-12 bg-black">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6">
          <div className="flex items-center gap-2 font-bold tracking-tighter">
            <BookOpen className="w-5 h-5" />
            <span className="text-xl">ConnectStudy</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">
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

function RoomCard({ id, name, participants, topic, image }: { id: string, name: string, participants: number, topic: string, image: string }) {
  return (
    <Link href={`/rooms/${id}`} className="group">
      <div className="border-2 border-white/10 hover:border-white/30 hover:bg-white/5 transition-all duration-300 overflow-hidden bg-black h-full flex flex-col">
        <div className="aspect-[16/9] relative grayscale group-hover:grayscale-0 transition-all duration-500 overflow-hidden">
          <Image 
            src={image} 
            alt={name} 
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-black/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase border border-white/20 text-white">
              {topic}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-black text-lg tracking-tight uppercase leading-none break-words flex-1">{name}</h3>
            <div className="flex items-center gap-1.5 opacity-60 shrink-0">
              <span className="text-xs font-bold">{participants}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Enter Room</span>
            <ArrowRight className="w-4 h-4 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  )
}