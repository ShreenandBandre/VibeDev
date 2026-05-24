"use client";

import React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

interface EnhancedCodeBlockProps {
  code: string;
  language: string;
  onApply: () => void;
}

export const EnhancedCodeBlock: React.FC<EnhancedCodeBlockProps> = ({ code, language, onApply }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 my-2 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
        <span className="text-[10px] font-mono text-zinc-400 uppercase">{language}</span>
        <div className="flex gap-2">
          <button onClick={onApply} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded hover:bg-primary/20">Apply</button>
          <button onClick={handleCopy} className="text-zinc-400 hover:text-white">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
      <pre className="p-3 overflow-x-auto text-xs font-mono text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  );
};