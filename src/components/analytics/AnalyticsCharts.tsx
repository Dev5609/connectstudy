
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
      const date = session.timestamp?.toDate()
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-2 border-2">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest">Weekly Activity</CardTitle>
          <CardDescription>Focus time per day of the week (minutes)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10, fontWeight: 700 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="focus" 
                fill="var(--color-focus)" 
                radius={[0, 0, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 col-span-2">
        <Card className="border-2 flex flex-col justify-center p-6 bg-primary text-primary-foreground">
          <span className="text-xs uppercase tracking-[0.2em] opacity-80">Total Tracked</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-6xl font-black tracking-tighter">{sessions.length}</span>
            <span className="text-sm font-bold uppercase">Sessions</span>
          </div>
        </Card>
        
        <Card className="border-2 p-6 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Weekly Total</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black tracking-tighter">{totalFocusHours}</span>
            <span className="text-sm font-bold uppercase">Hours</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
