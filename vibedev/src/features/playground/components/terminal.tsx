// src/features/playground/components/terminal.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import "@xterm/xterm/css/xterm.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalProps {
  webcontainerUrl?: string;
  className?: string;
  theme?: "dark" | "light";
  webContainerInstance?: any;
}

export interface TerminalRef {
  writeToTerminal: (data: string) => void;
  clearTerminal: () => void;
  focusTerminal: () => void;
}

const TerminalComponent = forwardRef<TerminalRef, TerminalProps>(({ 
  className,
  theme = "dark",
  webContainerInstance
}, ref) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const searchAddon = useRef<SearchAddon | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  
  const currentLine = useRef<string>("");
  const cursorPosition = useRef<number>(0);
  const commandHistory = useRef<string[]>([]);
  const historyIndex = useRef<number>(-1);
  const currentProcess = useRef<any>(null);

  const terminalThemes = {
    dark: { background: "#09090B", foreground: "#FAFAFA", cursor: "#FAFAFA", cursorAccent: "#09090B", selection: "#27272A" },
    light: { background: "#FFFFFF", foreground: "#18181B", cursor: "#18181B", cursorAccent: "#FFFFFF", selection: "#E4E4E7" },
  };

  const writePrompt = useCallback(() => {
    if (term.current) {
      term.current.write("\r\n$ ");
      currentLine.current = "";
      cursorPosition.current = 0;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    writeToTerminal: (data: string) => {
      if (term.current) term.current.write(data);
    },
    clearTerminal: () => {
      if (term.current) {
        term.current.clear();
        writePrompt();
      }
    },
    focusTerminal: () => {
      if (term.current) term.current.focus();
    },
  }));

  const executeCommand = useCallback(async (command: string) => {
    if (!webContainerInstance || !term.current) return;

    if (command.trim() && commandHistory.current[commandHistory.current.length - 1] !== command) {
      commandHistory.current.push(command);
    }
    historyIndex.current = -1;

    try {
      if (command.trim() === "clear") {
        term.current.clear();
        writePrompt();
        return;
      }

      if (command.trim() === "") {
        writePrompt();
        return;
      }

      const parts = command.trim().split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      term.current.writeln("");
      const process = await webContainerInstance.spawn(cmd, args, {
        terminal: { cols: term.current.cols, rows: term.current.rows },
      });

      currentProcess.current = process;
      process.output.pipeTo(new WritableStream({
        write(data) { term.current?.write(data); },
      }));

      await process.exit;
      currentProcess.current = null;
      writePrompt();
    } catch (error) {
      if (term.current) {
        term.current.writeln(`\r\nCommand not found: ${command}`);
        writePrompt();
      }
      currentProcess.current = null;
    }
  }, [webContainerInstance, writePrompt]);

  const handleTerminalInput = useCallback((data: string) => {
    if (!term.current) return;

    switch (data) {
      case '\r':
        executeCommand(currentLine.current);
        break;
      case '\u007F':
        if (cursorPosition.current > 0) {
          currentLine.current = currentLine.current.slice(0, cursorPosition.current - 1) + currentLine.current.slice(cursorPosition.current);
          cursorPosition.current--;
          term.current.write('\b \b');
        }
        break;
      case '\u0003':
        if (currentProcess.current) {
          currentProcess.current.kill();
          currentProcess.current = null;
        }
        term.current.writeln("^C");
        writePrompt();
        break;
      default:
        if (data >= ' ' || data === '\t') {
          currentLine.current = currentLine.current.slice(0, cursorPosition.current) + data + currentLine.current.slice(cursorPosition.current);
          cursorPosition.current++;
          term.current.write(data);
        }
        break;
    }
  }, [executeCommand, writePrompt]);

  useEffect(() => {
    if (!terminalRef.current || term.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontFamily: '"Fira Code", "JetBrains Mono", monospace',
      fontSize: 13,
      theme: terminalThemes[theme],
      convertEol: true,
    });

    const fitAddonInstance = new FitAddon();
    terminal.loadAddon(fitAddonInstance);
    terminal.loadAddon(new WebLinksAddon());
    
    const searchAddonInstance = new SearchAddon();
    terminal.loadAddon(searchAddonInstance);

    terminal.open(terminalRef.current);
    fitAddon.current = fitAddonInstance;
    searchAddon.current = searchAddonInstance;
    term.current = terminal;

    terminal.onData(handleTerminalInput);
    setTimeout(() => fitAddonInstance.fit(), 100);

    terminal.writeln("🚀 WebContainer Sandbox Ready.");
    writePrompt();
  }, [theme, handleTerminalInput, writePrompt]);

  useEffect(() => {
    if (webContainerInstance && term.current && !isConnected) {
      setIsConnected(true);
      term.current.writeln("✅ Terminal attached successfully.");
      writePrompt();
    }
  }, [webContainerInstance, isConnected, writePrompt]);

  return (
    <div className={cn("flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900/50 select-none">
        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
          <span className="font-semibold">WebContainer Terminal</span>
          {isConnected && <span className="text-emerald-500">● Connected</span>}
        </div>
        <div className="flex items-center gap-1">
          {showSearch && (
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchAddon.current?.findNext(e.target.value);
              }}
              className="h-6 w-32 text-xs bg-zinc-900 border-zinc-800 text-zinc-200"
            />
          )}
          <Button variant="ghost" size="sm" onClick={() => setShowSearch(!showSearch)} className="h-6 w-6 p-0 text-zinc-400"><Search className="h-3 w-3" /></Button>
          <Button variant="ghost" size="sm" onClick={() => term.current?.clear()} className="h-6 w-6 p-0 text-zinc-400"><Trash2 className="h-3 w-3" /></Button>
        </div>
      </div>
      <div className="flex-1 relative">
        <div ref={terminalRef} className="absolute inset-0 p-2" />
      </div>
    </div>
  );
});

TerminalComponent.displayName = "TerminalComponent";
export default TerminalComponent;