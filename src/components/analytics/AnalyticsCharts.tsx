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
    label: "Focus Time (min)",
    color: "hsl(var(--primary))",
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
      <Card className="col-span-1 lg:col-span-2 border-2 border-white/10 bg-black">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest">Weekly Activity</CardTitle>
          <CardDescription className="text-[10px] uppercase opacity-60">Focus time per day (minutes)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px] md:h-[250px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} stroke="#ffffff" />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#ffffff' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="focus" 
                fill="#ffffff" 
                radius={[0, 0, 0, 0]} 
                barSize={30}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 col-span-1 lg:col-span-2">
        <Card className="border-2 border-white/10 flex flex-col justify-center p-6 md:p-8 bg-black">
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Total Tracked</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl md:text-6xl font-black tracking-tighter">{sessions.length}</span>
            <span className="text-xs font-bold uppercase opacity-60">Sessions</span>
          </div>
        </Card>
        
        <Card className="border-2 border-white/10 p-6 md:p-8 flex flex-col justify-center bg-black">
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-40">Weekly Total</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl md:text-6xl font-black tracking-tighter">{totalFocusHours}</span>
            <span className="text-xs font-bold uppercase opacity-60">Hours</span>
          </div>
        </Card>
      </div>
    </div>
  )
}