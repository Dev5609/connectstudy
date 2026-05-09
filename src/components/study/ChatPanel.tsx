
"use client"

import { useState, useMemo } from "react"
import { Send, Image as ImageIcon, FileText, Smile, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCollection, useFirestore, useUser } from "@/firebase"
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore"

export function ChatPanel({ roomId }: { roomId: string }) {
  const { user } = useUser()
  const db = useFirestore()
  const [inputValue, setInputValue] = useState("")

  const messagesQuery = useMemo(() => {
    if (!db || !roomId) return null
    return query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "asc"),
      limit(50)
    )
  }, [db, roomId])

  const { data: messages, loading } = useCollection(messagesQuery)

  const sendMessage = async () => {
    if (!inputValue.trim() || !db || !user || !roomId) return
    
    const messageData = {
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userAvatar: user.photoURL || "",
      content: inputValue,
      timestamp: serverTimestamp()
    }

    addDoc(collection(db, "rooms", roomId, "messages"), messageData)
    setInputValue("")
  }

  return (
    <div className="flex flex-col h-full border-l bg-background w-80 lg:w-96">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm uppercase tracking-widest">In-Room Chat</h3>
        <span className="text-[10px] bg-secondary px-2 py-0.5 font-bold uppercase">Live</span>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin opacity-20" />
          </div>
        ) : (
          <div className="space-y-6">
            {messages?.map((m) => (
              <div key={m.id} className="flex gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={m.userAvatar} />
                  <AvatarFallback>{m.userName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold">{m.userName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">{m.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t space-y-3 bg-secondary/30">
        {!user ? (
          <div className="text-center p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Login to chat</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
