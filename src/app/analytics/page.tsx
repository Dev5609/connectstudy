
"use client"

import { Navbar } from "@/components/layout/Navbar"
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar as CalendarIcon, Clock, Target, Zap, Loader2 } from "lucide-react"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { useMemo } from "react"

export default function AnalyticsPage() {
  const { user } = useUser()
  const db = useFirestore()

  const sessionsQuery = useMemo(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "sessions"),
      orderBy("timestamp", "desc"),
      limit(20)
    )
  }, [db, user])

  const { data: sessions, loading } = useCollection(sessionsQuery)

  const stats = useMemo(() => {
    if (!sessions) return { totalMinutes: 0, count: 0 }
    return sessions.reduce((acc, s) => ({
      totalMinutes: acc.totalMinutes + (s.durationMinutes || 0),
      count: acc.count + 1
    }), { totalMinutes: 0, count: 0 })
  }, [sessions])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-12 space-y-12 max-w-6xl">
        <header className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Focus Analytics</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Insights into your deep work patterns</p>
        </header>

        {!user ? (
          <div className="text-center py-24 border-2 border-dashed">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] opacity-40">Please login to view analytics</h2>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin opacity-20" />
          </div>
        ) : (
          <>
            <section className="grid md:grid-cols-4 gap-6">
              <StatCard icon={<Clock className="w-4 h-4" />} label="Lifetime Focus" value={`${Math.floor(stats.totalMinutes / 60)}h`} detail={`${stats.totalMinutes % 60}m recorded`} />
              <StatCard icon={<Target className="w-4 h-4" />} label="Total Sessions" value={stats.count.toString()} detail="Active records" />
              <StatCard icon={<Zap className="w-4 h-4" />} label="Avg. Session" value={`${stats.count > 0 ? Math.round(stats.totalMinutes / stats.count) : 0}m`} detail="Focus efficiency" />
              <StatCard icon={<CalendarIcon className="w-4 h-4" />} label="Recent Activity" value={sessions?.length?.toString() || "0"} detail="Past 20 entries" />
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between border-b-2 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Temporal Activity</h2>
              </div>
              <AnalyticsCharts sessions={sessions || []} />
            </section>

            <section className="grid lg:grid-cols-1 gap-12">
              <div className="space-y-6">
                 <h3 className="text-sm font-bold uppercase tracking-[0.3em] border-b pb-4">Study Session Log</h3>
                 <div className="space-y-4">
                    {sessions && sessions.length > 0 ? (
                      sessions.map((session) => (
                        <SessionLog 
                          key={session.id}
                          title={session.title || "Study Session"} 
                          date={session.timestamp?.toDate()?.toLocaleDateString() || "..."} 
                          duration={`${session.durationMinutes} min`} 
                          type={session.type} 
                        />
                      ))
                    ) : (
                      <p className="text-[10px] font-bold uppercase opacity-40">No sessions recorded yet.</p>
                    )}
                 </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode, label: string, value: string, detail: string }) {
  return (
    <Card className="border-2 shadow-none">
      <CardContent className="p-6 space-y-4">
        <div className="p-2 bg-secondary w-fit rounded-sm">{icon}</div>
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="text-3xl font-black tracking-tighter">{value}</p>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-tight text-accent/60">{detail}</p>
      </CardContent>
    </Card>
  )
}

function SessionLog({ title, date, duration, type }: { title: string, date: string, duration: string, type: string }) {
  return (
    <div className="flex items-center justify-between py-2 group cursor-default">
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-tight group-hover:underline">{title}</span>
        <span className="text-[10px] text-muted-foreground uppercase">{date} • {type}</span>
      </div>
      <span className="text-xs font-black bg-secondary px-2 py-1">{duration}</span>
    </div>
  )
}
