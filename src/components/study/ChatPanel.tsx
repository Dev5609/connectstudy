"use client"

import { useState } from "react"
import { Send, Image as ImageIcon, FileText, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const initialMessages = [
  { id: 1, user: "Sarah K.", content: "Starting my second Pomodoro session! 🚀", time: "10:02 AM", avatar: "https://picsum.photos/seed/u2/40/40" },
  { id: 2, user: "You", content: "Nice, I'm focusing on UI design today.", time: "10:05 AM", avatar: "https://picsum.photos/seed/u1/40/40" },
  { id: 3, user: "Alex Chen", content: "Anyone want to review this logic diagram later?", time: "10:12 AM", avatar: "https://picsum.photos/seed/u3/40/40" },
]

export function ChatPanel() {
  const [messages, setMessages] = useState(initialMessages)
  const [inputValue, setInputValue] = useState("")

  const sendMessage = () => {
    if (!inputValue.trim()) return
    const newMessage = {
      id: Date.now(),
      user: "You",
      content: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: "https://picsum.photos/seed/u1/40/40"
    }
    setMessages([...messages, newMessage])
    setInputValue("")
  }

  return (
    <div className="flex flex-col h-full border-l bg-background w-80 lg:w-96">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-widest">In-Room Chat</h3>
        <span className="text-[10px] bg-secondary px-2 py-0.5 font-bold uppercase">3 Active</span>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((m) => (
            <div key={m.id} className="flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={m.avatar} />
                <AvatarFallback>{m.user[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold">{m.user}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{m.time}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/80">{m.content}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-4 border-t space-y-3 bg-secondary/30">
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <FileText className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Smile className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input 
            placeholder="Type a message..." 
            className="flex-1 text-sm bg-background border-2" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <Button size="icon" className="shrink-0" onClick={sendMessage}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}