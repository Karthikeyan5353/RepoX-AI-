import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
import { chatWithCode } from "@/lib/ai-review";
import { clearRepoChatHistory, getRepoChatHistory, saveRepoChatHistory } from "@/lib/storage";

export function RepoChat({ repoFullName, fileContext }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        setMessages(getRepoChatHistory(repoFullName));
        setInput("");
        setLoading(false);
    }, [repoFullName]);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading)
            return;

        const userMsg = { role: "user", content: input.trim() };
        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        saveRepoChatHistory(repoFullName, nextMessages);
        setInput("");
        setLoading(true);

        try {
            const repoContext = `Repository: ${repoFullName}\n${fileContext ? `Current file content:\n${fileContext}` : ""}`;
            const reply = await chatWithCode(nextMessages, repoContext);
            const messagesWithReply = [...nextMessages, { role: "assistant", content: reply }];
            setMessages(messagesWithReply);
            saveRepoChatHistory(repoFullName, messagesWithReply);
        }
        catch (e) {
            const message = e instanceof Error ? e.message : "Unable to send message.";
            const messagesWithError = [...nextMessages, { role: "assistant", content: `Error: ${message}` }];
            setMessages(messagesWithError);
            saveRepoChatHistory(repoFullName, messagesWithError);
        }
        finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setMessages([]);
        clearRepoChatHistory(repoFullName);
    };

    return (<div className="glass-panel animate-glass-in flex h-full flex-col overflow-hidden rounded-[20px]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/12 bg-white/10 shadow-[0_0_24px_rgb(34_197_94_/_0.14)]">
            <Bot className="h-4 w-4 text-primary"/>
          </div>
          <div>
            <span className="block text-sm font-semibold text-white">AI Chat</span>
            <span className="text-xs text-muted-foreground">{repoFullName}</span>
          </div>
        </div>
        {messages.length > 0 && (<button onClick={handleClear} aria-label="Clear AI chat history" className="glass-interactive rounded-xl border border-transparent p-2 text-muted-foreground hover:border-red-300/14 hover:bg-red-400/10 hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5"/>
          </button>)}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-auto p-5 scrollbar-thin">
        {messages.length === 0 && (<div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] border border-white/10 bg-white/8 shadow-[0_12px_40px_rgb(15_23_42_/_0.25)]">
              <Bot className="h-8 w-8 opacity-70"/>
            </div>
            <p className="text-sm font-semibold text-white">Chat with your repository</p>
            <p className="mt-1 max-w-xs text-xs">
              Ask questions like "Explain this file", "Find bugs", or "How can I optimize this function?"
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {["Explain the project structure", "Find potential bugs", "Suggest improvements"].map((q) => (<button key={q} onClick={() => setInput(q)} className="glass-chip glass-interactive rounded-full px-3 py-2 text-xs text-foreground hover:text-white">
                  {q}
                </button>))}
            </div>
          </div>)}

        {messages.map((msg, i) => (<div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                <Bot className="h-4 w-4 text-primary"/>
              </div>)}

            <div className={`max-w-[80%] rounded-[18px] px-4 py-3 text-sm shadow-[0_14px_40px_rgb(15_23_42_/_0.2)] ${msg.role === "user"
                ? "border border-emerald-300/18 bg-linear-to-r from-emerald-500/78 to-cyan-500/70 text-primary-foreground"
                : "glass-chip text-foreground"}`}>
              <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
            </div>

            {msg.role === "user" && (<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                <User className="h-4 w-4 text-muted-foreground"/>
              </div>)}
          </div>))}

        {loading && (<div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
              <Bot className="h-4 w-4 text-primary"/>
            </div>
            <div className="glass-chip rounded-[18px] px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary"/>
            </div>
          </div>)}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()} placeholder="Ask about the code..." className="glass-input flex-1 rounded-2xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/70"/>
          <button onClick={handleSend} disabled={!input.trim() || loading} className="glass-interactive inline-flex items-center justify-center rounded-2xl border border-white/14 bg-linear-to-r from-emerald-500/78 to-cyan-500/70 px-4 py-2 text-primary-foreground shadow-[0_16px_40px_rgb(34_197_94_/_0.26)] disabled:opacity-50">
            <Send className="h-4 w-4"/>
          </button>
        </div>
      </div>
    </div>);
}
