import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { chatWithCode } from "@/lib/ai-review";
export function RepoChat({ repoFullName, fileContext }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);
    const handleSend = async () => {
        if (!input.trim() || loading)
            return;
        const userMsg = { role: "user", content: input.trim() };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        try {
            const repoContext = `Repository: ${repoFullName}\n${fileContext ? `Current file content:\n${fileContext}` : ""}`;
            const reply = await chatWithCode([...messages, userMsg], repoContext);
            setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        }
        catch (e) {
            const message = e instanceof Error ? e.message : "Unable to send message.";
            setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${message}` }]);
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary"/>
          <span className="text-sm font-semibold">AI Chat</span>
          <span className="text-xs text-muted-foreground">· {repoFullName}</span>
        </div>
        {messages.length > 0 && (<button onClick={() => setMessages([])} className="rounded-md p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-3.5 w-3.5"/>
          </button>)}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-thin p-4 space-y-4">
        {messages.length === 0 && (<div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="h-12 w-12 mb-3 opacity-30"/>
            <p className="text-sm font-medium">Chat with your repository</p>
            <p className="text-xs mt-1 max-w-xs">
              Ask questions like "Explain this file", "Find bugs", or "How can I optimize this function?"
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {["Explain the project structure", "Find potential bugs", "Suggest improvements"].map((q) => (<button key={q} onClick={() => setInput(q)} className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-foreground hover:bg-accent transition-colors">
                  {q}
                </button>))}
            </div>
          </div>)}
        {messages.map((msg, i) => (<div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary"/>
              </div>)}
            <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground"}`}>
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>
            {msg.role === "user" && (<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground"/>
              </div>)}
          </div>))}
        {loading && (<div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary"/>
            </div>
            <div className="rounded-lg bg-card border border-border px-3 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary"/>
            </div>
          </div>)}
      </div>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} placeholder="Ask about the code..." className="flex-1 rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
          <button onClick={handleSend} disabled={!input.trim() || loading} className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            <Send className="h-4 w-4"/>
          </button>
        </div>
      </div>
    </div>);
}
