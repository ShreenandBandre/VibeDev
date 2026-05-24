"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Terminal as TermIcon, Copy, Trash2 } from "lucide-react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

interface TerminalTab {
  id: string;
  name: string;
  process: unknown;
  inputWriter: WritableStreamDefaultWriter<string> | null;
  terminalInstance: Terminal | null;
  fitAddonInstance: FitAddon | null;
}

interface MultiTabTerminalProps {
  webcontainerInstance: any | null;
}

export function MultiTabTerminal({ webcontainerInstance }: MultiTabTerminalProps) {
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabsRef = useRef<TerminalTab[]>([]);
  const isInitializedRef = useRef(false); // 🚀 FIXED: Double render gate boundary flag

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  // CORE SPARK: INSTANTIATE XTERM ENGINE MOUNT
  const createTerminalInstance = async (tabId: string, name: string) => {
    if (!webcontainerInstance) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 12,
      fontFamily: "var(--font-mono), monospace",
      theme: {
        background: "#0a0a0a",
        foreground: "#d4d4d4",
        cursor: "#f8f8f2",
        selectionBackground: "rgba(255, 255, 255, 0.15)",
      },
      allowProposedApi: true
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    const shellProcess = await webcontainerInstance.spawn("jsh", {
      terminal: { cols: 80, rows: 24 }
    });

    shellProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          term.write(data);
        }
      })
    );

    // Grab our single exclusive write access instance channel
    const inputWriter = shellProcess.input.getWriter();
    
    term.onData((data) => {
      inputWriter.write(data);
    });

    const newTab: TerminalTab = {
      id: tabId,
      name,
      process: shellProcess,
      inputWriter: inputWriter, // Retained inside state records cleanly
      terminalInstance: term,
      fitAddonInstance: fitAddon
    };

    setTabs((prev) => {
      // De-duplicate guard right at state commit boundaries
      if (prev.some(t => t.id === tabId)) return prev;
      return [...prev, newTab];
    });
    setActiveTabId(tabId);

    setTimeout(() => {
      const el = containerRefs.current[tabId];
      if (el) {
        term.open(el);
        fitAddon.fit();
      }
    }, 60);
  };

  useEffect(() => {
    if (webcontainerInstance && !isInitializedRef.current) {
      isInitializedRef.current = true;
      createTerminalInstance("term-baseline-init", "bash"); // 🚀 Unique identifier stamp key
    }
    
    return () => {
      if (!webcontainerInstance) {
        tabsRef.current.forEach(t => {
          t.inputWriter?.releaseLock();
          t.process?.kill();
          t.terminalInstance?.dispose();
        });
      }
    };
  }, [webcontainerInstance]);

  // TRIGGER POSITION RESPONSIVENESS UPDATES
  useEffect(() => {
    const handleGlobalResize = () => {
      const activeTab = tabsRef.current.find(t => t.id === activeTabId);
      if (activeTab?.fitAddonInstance && activeTab?.terminalInstance) {
        try {
          activeTab.fitAddonInstance.fit();
        } catch (e) {
          // Suppress dimensional overflow triggers smoothly
        }
      }
    };

    window.addEventListener("resize", handleGlobalResize);
    const splitResizeObserver = setTimeout(handleGlobalResize, 100);
    
    return () => {
      window.removeEventListener("resize", handleGlobalResize);
      clearTimeout(splitResizeObserver);
    };
  }, [activeTabId, tabs.length]); // Listens tightly on workspace dimensional changes

  const handleAddNewTab = () => {
    const nextIndex = tabs.length + 1;
    const newId = `term-${Date.now()}`;
    createTerminalInstance(newId, `bash (${nextIndex})`);
  };

  const handleKillTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;

    const activeTabIndex = tabs.findIndex(t => t.id === activeTabId);
    const targetTab = tabs.find(t => t.id === tabId);

    if (targetTab) {
      targetTab.inputWriter?.releaseLock();
      targetTab.process?.kill();
      targetTab.terminalInstance?.dispose();
    }

    const filteredTabs = tabs.filter(t => t.id !== tabId);
    setTabs(filteredTabs);

    if (activeTabId === tabId) {
      const nextActiveIndex = activeTabIndex === 0 ? 0 : activeTabIndex - 1;
      setActiveTabId(filteredTabs[nextActiveIndex]?.id ?? filteredTabs[0].id);
    }
  };

  const handleCopySelection = () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab?.terminalInstance) {
      const currentSelection = activeTab.terminalInstance.getSelection();
      if (currentSelection) {
        navigator.clipboard.writeText(currentSelection);
      } else {
        activeTab.terminalInstance.selectAll();
        navigator.clipboard.writeText(activeTab.terminalInstance.getSelection());
        activeTab.terminalInstance.clearSelection();
      }
    }
  };

  const handleClearTerminal = () => {
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (activeTab?.terminalInstance) {
      activeTab.terminalInstance.clear();
      // 🚀 FIXED: Directly write to our persistent stored writer without calling getWriter() again!
      activeTab.inputWriter?.write("\r");
    }
  };

  return (
    <div className="w-full h-full border border-neutral-800 bg-[#0a0a0a] rounded-xl overflow-hidden flex flex-col font-mono shadow-2xl relative z-10">
      
      {/* HEADER TABS STRIP */}
      <div className="h-9 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between px-3 shrink-0 select-none">
        <div className="flex items-center gap-1 overflow-x-auto pr-4 scrollbar-none">
          {tabs.map((tab) => {
            const isSelected = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`group h-8 px-3 rounded-t-lg border-t border-x flex items-center gap-2 text-xs font-medium cursor-pointer transition-all ${
                  isSelected 
                    ? "bg-[#0a0a0a] border-neutral-800 text-neutral-100 font-bold" 
                    : "bg-transparent border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/30"
                }`}
              >
                <TermIcon className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-neutral-500"}`} />
                <span className="truncate max-w-[85px]">{tab.name}</span>
                {tabs.length > 1 && (
                  <X 
                    onClick={(e) => handleKillTab(tab.id, e)}
                    className="w-3 h-3 text-neutral-500 hover:text-red-400 rounded-sm hover:bg-neutral-800 transition-colors p-0.5 ml-1" 
                  />
                )}
              </div>
            );
          })}

          <button
            onClick={handleAddNewTab}
            className="p-1 rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 transition-colors cursor-pointer"
            title="Open New Parallel Shell"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 border-l border-neutral-800 pl-3 text-neutral-400">
          <button 
            onClick={handleCopySelection}
            className="p-1.5 rounded-md hover:bg-neutral-800 hover:text-neutral-100 transition-all cursor-pointer" 
            title="Copy Terminal Selection"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleClearTerminal}
            className="p-1.5 rounded-md hover:bg-neutral-800 hover:text-red-400 transition-all cursor-pointer" 
            title="Clear Console Screen Buffer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* RENDER VIEWPORT VIEW */}
      <div className="flex-1 min-h-0 bg-[#0a0a0a] relative p-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            ref={(el) => { containerRefs.current[tab.id] = el; }}
            className={`w-full h-full overflow-hidden select-text terminal-instance-node ${
              tab.id === activeTabId ? "block" : "hidden"
            }`}
          />
        ))}
      </div>

    </div>
  );
}