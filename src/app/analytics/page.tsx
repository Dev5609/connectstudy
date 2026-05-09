"use client"

import { Navbar } from "@/components/layout/Navbar"
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarIcon, Clock, Target, Zap } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-6 py-12 space-y-12 max-w-6xl">
        <header className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Focus Analytics</h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-medium">Insights into your deep work patterns</p>
        </header>

        <section className="grid md:grid-cols-4 gap-6">
          <StatCard icon={<Clock className="w-4 h-4" />} label="Lifetime Focus" value="482h" detail="+12h this week" />
          <StatCard icon={<Target className="w-4 h-4" />} label="Goals Met" value="85%" detail="24/28 sessions" />
          <StatCard icon={<Zap className="w-4 h-4" />} label="Deep Work Rate" value="72%" detail="Optimal focus: 9-11 AM" />
          <StatCard icon={<CalendarIcon className="w-4 h-4" />} label="Active Streak" value="12 Days" detail="Personal record: 18" />
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between border-b-2 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em]">Temporal Activity</h2>
            <div className="flex gap-4">
              <button className="text-[10px] font-bold uppercase border-b-2 border-primary">Weekly</button>
              <button className="text-[10px] font-bold uppercase border-b-2 border-transparent opacity-40 hover:opacity-100 transition-opacity">Monthly</button>
            </div>
          </div>
          <AnalyticsCharts />
        </section>

        <section className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
             <h3 className="text-sm font-bold uppercase tracking-[0.3em] border-b pb-4">Most Focused Days</h3>
             <div className="space-y-4">
                <DayRank day="Tuesday" minutes={450} color="bg-primary" width="w-[100%]" />
                <DayRank day="Friday" minutes={380} color="bg-primary" width="w-[85%]" />
                <DayRank day="Monday" minutes={320} color="bg-primary" width="w-[70%]" />
             </div>
          </div>
          
          <div className="space-y-6">
             <h3 className="text-sm font-bold uppercase tracking-[0.3em] border-b pb-4">Study Session Log</h3>
             <div className="space-y-4">
                <SessionLog title="Algorithms Deep Dive" date="Oct 24" duration="120 min" type="Pomodoro" />
                <SessionLog title="Physics Problem Set" date="Oct 23" duration="45 min" type="Infinite" />
                <SessionLog title="Group History Study" date="Oct 23" duration="90 min" type="Fixed" />
             </div>
          </div>
        </section>
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

function DayRank({ day, minutes, width, color }: { day: string, minutes: number, width: string, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-bold uppercase tracking-widest">{day}</span>
        <span className="text-[10px] font-black">{minutes} mins</span>
      </div>
      <div className="h-2 bg-secondary w-full">
        <div className={`${color} h-full ${width} transition-all duration-1000`} />
      </div>
    </div>
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