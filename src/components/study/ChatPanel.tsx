
"use client"

import { useState, useRef } from "react"
import { Send, Smile, Loader2, Download, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCollection, useFirestore, useUser, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function ChatPanel({ roomId }: { roomId: string }) {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [inputValue, setInputValue] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const messagesQuery = useMemoFirebase(() => {
    if (!db || !roomId) return null
    return query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp", "asc"),
      limit(50)
    )
  }, [db, roomId])

  const { data: messages, loading } = useCollection(messagesQuery)

  const sendMessage = async (content: string, fileData?: { name: string, type: string, data: string }) => {
    if ((!content.trim() && !fileData) || !db || !user || !roomId) return
    
    const messageData = {
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userAvatar: user.photoURL || "",
      content: content,
      timestamp: serverTimestamp(),
      type: fileData ? 'file' : 'text',
      fileName: fileData?.name || null,
      fileType: fileData?.type || null,
      fileUrl: fileData?.data || null
    }

    addDoc(collection(db, "rooms", roomId, "messages"), messageData)
    setInputValue("")
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1048576) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Max 1MB allowed.",
      })
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      sendMessage("", {
        name: file.name,
        type: file.type,
        data: base64
      })
      setIsUploading(false)
      toast({ title: "File Shared", description: file.name })
    }
    reader.readAsDataURL(file)
  }

  const sendEmoji = (emoji: string) => {
    sendMessage(emoji)
  }

  return (
    <div className="flex flex-col h-full border-l border-white/10 bg-black w-80 lg:w-96">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="font-black text-[10px] uppercase tracking-[0.4em]">Room Chat</h3>
        <span className="text-[8px] bg-white text-black px-2 py-0.5 font-bold uppercase tracking-widest">Live</span>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin opacity-20" />
          </div>
        ) : (
          <div className="space-y-6">
            {messages?.map((m: any) => (
              <div key={m.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Avatar className="w-8 h-8 shrink-0 border border-white/10 rounded-none">
                  <AvatarImage src={m.userAvatar} />
                  <AvatarFallback className="text-[10px] font-bold bg-white/5">{m.userName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-black uppercase tracking-tight">{m.userName}</span>
                    <span className="text-[8px] text-muted-foreground uppercase font-bold opacity-40">
                      {m.timestamp?.toDate ? m.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                    </span>
                  </div>
                  
                  {m.type === 'file' ? (
                    <div className="mt-1 p-3 bg-white/5 border border-white/10 flex items-center justify-between group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Paperclip className="w-4 h-4 opacity-40 shrink-0" />
                        <span className="text-[10px] font-bold uppercase truncate tracking-widest">{m.fileName}</span>
                      </div>
                      <a 
                        href={m.fileUrl} 
                        download={m.fileName}
                        className="p-1 hover:bg-white/10 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-white/70">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {messages && messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-20">No messages yet</p>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t border-white/10 space-y-3 bg-black">
        {!user ? (
          <div className="text-center p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Please Login</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={isUploading}
                className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5 rounded-none"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5 rounded-none">
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent side="top" className="w-full p-2 flex gap-2 bg-black border border-white/20 rounded-none">
                  {['🔥', '👏', '💯', '👋', '✅'].map(emoji => (
                    <Button key={emoji} variant="ghost" size="sm" className="hover:bg-white/10" onClick={() => sendEmoji(emoji)}>
                      {emoji}
                    </Button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Message..." 
                className="flex-1 text-xs bg-black border-2 border-white/10 rounded-none h-10 focus-visible:border-white/40 transition-all" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(inputValue)}
              />
              <Button size="icon" className="shrink-0 rounded-none h-10 w-10 bg-white text-black hover:bg-white/90" onClick={() => sendMessage(inputValue)}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
