
"use client"

import { Bar, BarChart, XAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useMemo } from "react"

interface AnalyticsChartsProps {
  sessions?: any[]
}

const chartConfig = {
  focus: {
    label: "Focus (min)",
    color: "#ffffff",
  },
} satisfies ChartConfig

export function AnalyticsCharts({ sessions = [] }: AnalyticsChartsProps) {
  const chartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const data = days.map(day => ({ day, focus: 0 }))
    
    sessions.forEach(session => {
      const date = session.timestamp?.toDate ? session.timestamp.toDate() : null
      if (date) {
        const dayName = days[date.getDay()]
        const entry = data.find(d => d.day === dayName)
        if (entry) entry.focus += session.durationMinutes || 0
      }
    })
    
    return data
  }, [sessions])

  const totalFocusHours = useMemo(() => {
    const totalMins = chartData.reduce((acc, d) => acc + d.focus, 0)
    return (totalMins / 60).toFixed(1)
  }, [chartData])

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <Card className="col-span-1 lg:col-span-2 border-2 border-white/10 bg-black rounded-none shadow-none">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em]">Weekly Deep Work</CardTitle>
          <CardDescription className="text-[8px] uppercase opacity-40">Focus distribution per day (minutes)</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" opacity={0.05} stroke="#ffffff" />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 9, fontWeight: 900, fill: '#ffffff', opacity: 0.4 }}
              />
              <ChartTooltip content={<ChartTooltipContent className="bg-black border-white/20 rounded-none" />} />
              <Bar 
                dataKey="focus" 
                fill="#ffffff" 
                radius={[0, 0, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 col-span-1 lg:col-span-2">
        <Card className="border-2 border-white/10 flex flex-col justify-center p-8 bg-black rounded-none shadow-none">
          <span className="text-[10px] uppercase font-black tracking-[0.4em] opacity-30">Total Sessions</span>
          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-6xl font-black tracking-tighter">{sessions.length}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Units</span>
          </div>
        </Card>
        
        <Card className="border-2 border-white/10 p-8 flex flex-col justify-center bg-black rounded-none shadow-none">
          <span className="text-[10px] uppercase font-black tracking-[0.4em] opacity-30">Weekly Accumulation</span>
          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-6xl font-black tracking-tighter">{totalFocusHours}</span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Hours</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
