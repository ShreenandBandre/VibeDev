"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, User, Copy, Check, X, Paperclip, FileText, Sparkles, MessageSquare, RefreshCw, Zap, Brain, Search, Filter, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { EnhancedCodeBlock } from "./ai-chat-code-blocks";
import {EnhancedFilePreview} from "./file-preview";

// Re-use your MessageTypeIndicator layout code block
const MessageTypeIndicator: React.FC<{ type?: string; model?: string; tokens?: number }> = ({ type, model, tokens }) => {
  const getTypeConfig = (type?: string) => {
    switch (type) {
      case "code_review": return { icon: FileText, color: "text-blue-400", label: "Code Review" };
      case "error_fix": return { icon: RefreshCw, color: "text-red-400", label: "Error Fix" };
      case "optimization": return { icon: Zap, color: "text-yellow-400", label: "Optimization" };
      default: return { icon: MessageSquare, color: "text-zinc-400", label: "Chat" };
    }
  };
  const config = getTypeConfig(type);
  const Icon = config.icon;
  return (
    <div className="flex items-center justify-between mb-2 select-none border-b border-zinc-800/60 pb-1.5">
      <div className="flex items-center gap-1.5">
        <Icon className={cn("h-3.5 w-3.5", config.color)} />
        <span className={cn("text-xs font-mono font-bold tracking-tight", config.color)}>{config.label}</span>
      </div>
      <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 font-bold">
        <span>{model}</span>
        <span>•</span>
        <span>{tokens} tokens</span>
      </div>
    </div>
  );
};

// Re-use your suggestion mapping layout components
const CodeSuggestionCard: React.FC<{ suggestion: any; onInsert: () => void; onCopy: () => void }> = ({ suggestion, onInsert, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-950/40 my-3 transition-all group hover:border-zinc-700/60">
      <div className="p-3 bg-zinc-900/40 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-sans font-bold text-zinc-200">{suggestion.title}</h4>
          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{suggestion.description}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 font-mono text-xs text-zinc-400 hover:text-zinc-200">
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span className="ml-1">Copy</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={onInsert} className="h-7 px-2 font-mono text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
            <Sparkles className="h-3 w-3" />
            <span className="ml-1">Insert</span>
          </Button>
        </div>
      </div>
      <div className="border-t border-zinc-800/60">
        <EnhancedCodeBlock
  code={suggestion.code}
  language={suggestion.language}
  onApply={onInsert}
/>
      </div>
    </div>
  );
};

export const AIChatSidePanel: React.FC<any> = ({ isOpen, onClose, onInsertCode, onRunCode, activeFileName, activeFileContent, activeFileLanguage, cursorPosition }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"chat" | "review" | "fix" | "optimize">("chat");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userPayload = input.trim();
    const messageType = chatMode === "chat" ? "chat" : chatMode === "review" ? "code_review" : chatMode === "fix" ? "error_fix" : "optimization";
    
    const userMessage = { id: String(Date.now()), role: "user", content: userPayload, timestamp: new Date(), type: messageType };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userPayload,
          mode: chatMode,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
          activeFileContext: activeFileName ? { name: activeFileName, content: activeFileContent, language: activeFileLanguage } : null
        })
      });

      if (!response.ok) throw new Error("API Route drop failure.");
      const data = await response.json();

      // Look for code fragments to auto-generate suggestions natively
      const codeFragments = data.response.match(/```[\w]*\n([\s\S]*?)```/);

      setMessages(prev => [...prev, {
        id: String(Date.now() + 1),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        type: messageType,
        model: data.model,
        tokens: data.tokens,
        suggestions: codeFragments ? [{
          id: "snippet-1",
          title: "Refactored Component Logic",
          description: `Extracted code block targeting cursor anchor position line: ${cursorPosition?.line || 1}`,
          code: codeFragments[1].trim(),
          language: activeFileLanguage || "javascript"
        }] : []
      }]);

    } catch (err) {
      setMessages(prev => [...prev, { id: String(Date.now() + 2), role: "assistant", content: "// Network error parsing local inference streams. Is Ollama active?", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={cn("fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity duration-200", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={onClose} />
      <div className={cn("fixed right-0 top-0 h-full w-full max-w-xl bg-[#030303] border-l border-zinc-900 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl", isOpen ? "translate-x-0" : "translate-x-full")}>
        
        {/* PANEL LAYER UPPER TOP COMPONENT PANEL HEADER */}
        <div className="p-4 border-b border-zinc-900 bg-zinc-950/40 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-sans font-bold text-zinc-100">AI Code Copilot</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-200 rounded-lg">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <Tabs value={chatMode} onValueChange={(v: any) => setChatMode(v)} className="w-full">
            <TabsList className="grid grid-cols-4 bg-zinc-950 border border-zinc-900 h-8 rounded-lg p-0.5">
              <TabsTrigger value="chat" className="text-xs font-mono">Chat</TabsTrigger>
              <TabsTrigger value="review" className="text-xs font-mono">Review</TabsTrigger>
              <TabsTrigger value="fix" className="text-xs font-mono">Fix</TabsTrigger>
              <TabsTrigger value="optimize" className="text-xs font-mono">Speed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* MESSAGES CORE ELEMENT CONTAINER LOOP */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#050506] space-y-4 scrollbar-none">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3 max-w-[90%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto")}>
              <Avatar className="w-7 h-7 border border-zinc-800 bg-zinc-950 shrink-0">
                <AvatarFallback className="text-[10px] font-mono bg-zinc-900 text-zinc-400">{msg.role === "user" ? "ME" : "AI"}</AvatarFallback>
              </Avatar>
              <div className={cn("p-3 rounded-xl border text-xs font-sans leading-relaxed", msg.role === "user" ? "bg-zinc-900 border-zinc-800 text-zinc-100 rounded-tr-none" : "bg-zinc-950/80 border-zinc-900 text-zinc-200 rounded-tl-none")}>
                {msg.role === "assistant" && <MessageTypeIndicator type={msg.type} model={msg.model} tokens={msg.tokens} />}
                <div className="prose prose-invert max-w-none text-[12px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>

                {msg.suggestions?.map((s: any) => (
                  <CodeSuggestionCard key={s.id} suggestion={s} onInsert={() => onInsertCode(s.code)} onCopy={() => navigator.clipboard.writeText(s.code)} />
                ))}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-zinc-500 bg-zinc-950/40 border border-zinc-900/60 p-3 rounded-xl w-fit animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              <span className="font-mono">Inference processing turn actively processing matrix parameters...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT DECK LAYER BASE FORMS ACTION FOOTER CONTAINER */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-zinc-900 bg-zinc-950/50 shrink-0 flex gap-2 items-end">
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }} placeholder="Input contextual workspace queries... (Enter to send)" className="min-h-[38px] max-h-24 resize-none bg-zinc-950 border-zinc-900 text-zinc-100 text-xs focus-visible:ring-primary/20 scrollbar-none py-2" rows={1} />
          <Button type="submit" disabled={isLoading || !input.trim()} className="h-9 px-3 bg-primary hover:bg-primary/90 text-white font-mono text-xs rounded-lg shrink-0">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>

      </div>
    </>
  );
};