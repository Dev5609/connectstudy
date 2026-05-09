"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { day: "Mon", focus: 320 },
  { day: "Tue", focus: 450 },
  { day: "Wed", focus: 210 },
  { day: "Thu", focus: 380 },
  { day: "Fri", focus: 510 },
  { day: "Sat", focus: 150 },
  { day: "Sun", focus: 120 },
]

const chartConfig = {
  focus: {
    label: "Focus Time (min)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function AnalyticsCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-2 border-2">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-widest">Weekly Activity</CardTitle>
          <CardDescription>Total focus time per day (minutes)</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={data}>
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
          <span className="text-xs uppercase tracking-[0.2em] opacity-80">Current Streak</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-6xl font-black tracking-tighter">12</span>
            <span className="text-sm font-bold uppercase">Days</span>
          </div>
        </Card>
        
        <Card className="border-2 p-6 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Avg. Daily Focus</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black tracking-tighter">5.4</span>
            <span className="text-sm font-bold uppercase">Hours</span>
          </div>
        </Card>
      </div>
    </div>
  )
}