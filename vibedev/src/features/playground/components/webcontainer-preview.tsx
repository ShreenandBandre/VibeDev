"use client";

import React, { useEffect, useState, useRef } from "react";
import { transformToWebContainerFormat } from "../hooks/transformer";
import { Loader2, XCircle, GripHorizontal } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import TerminalComponent from "./terminal";
// 💡 FIXED: Imported FileSystemTree directly to replace the missing custom type
import { WebContainer, type FileSystemTree } from "@webcontainer/api";

// NEW MULTI-TAB MATRIX UTILITIES
import { MultiTabPreview } from "./multi-tab-preview";
import { MultiTabTerminal } from "./multi-tab-terminal";

interface WebContainerPreviewProps {
  // 💡 FIXED: Swapped TemplateFolder for FileSystemTree
  templateData: FileSystemTree;
  error: string | null;
  instance: WebContainer | null;
  isLoading: boolean;
  serverUrl: string | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  forceResetup?: boolean;
}

const WebContainerPreview: React.FC<WebContainerPreviewProps> = ({
  templateData,
  error,
  instance,
  isLoading,
  forceResetup = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);
  
  // 📏 VERTICAL SPLIT PANEL RESIZER STATES
  const [terminalHeight, setTerminalHeight] = useState(280); // Default baseline height for terminal
  const [isDragging, setIsDragging] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<any>(null);

  useEffect(() => {
    if (forceResetup) {
      setIsSetupComplete(false);
      setIsSetupInProgress(false);
      setPreviewUrl("");
      setCurrentStep(0);
      setSetupError(null);
    }
  }, [forceResetup]);

  // 📐 VERTICAL RESIZER DRAG EVENTS ENGINE
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      // Calculate the difference between the bottom edge and current mouse coordinate
      const calculatedHeight = containerRect.bottom - e.clientY;
      
      // Set explicit boundaries so panels don't compress out of existence
      if (calculatedHeight > 120 && calculatedHeight < containerRect.height - 160) {
        setTerminalHeight(calculatedHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    async function setupContainer() {
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);
        
        try {
          const packageJsonExists = await instance.fs.readFile('package.json', 'utf8');
          if (packageJsonExists) {
            terminalRef.current?.writeToTerminal("🔄 Reconnecting to existing active playground thread...\r\n");
            
            instance.on("server-ready", (port: number, url: string) => {
              terminalRef.current?.writeToTerminal(`🌐 Port Forward Connected: ${url}\r\n`);
              setPreviewUrl(url);
              setIsSetupComplete(true);
              setIsSetupInProgress(false);
            });
            setCurrentStep(4);
            return;
          }
        } catch (e) {
          // Normal fallback progression
        }
        
        setCurrentStep(1);
        terminalRef.current?.writeToTerminal("🔄 Parsing system folder template schemas...\r\n");
        const files = transformToWebContainerFormat(templateData);

        setCurrentStep(2);
        terminalRef.current?.writeToTerminal("📁 Initializing workspace directory structure mounts...\r\n");
        await instance.mount(files);
        terminalRef.current?.writeToTerminal("✅ Workspace file mounting complete.\r\n");

        setCurrentStep(3);
        terminalRef.current?.writeToTerminal("📦 Running installation sequence: npm install...\r\n");
        const installProcess = await instance.spawn("npm", ["install"]);

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) { terminalRef.current?.writeToTerminal(data); },
          })
        );

        const installExitCode = await installProcess.exit;
        if (installExitCode !== 0) {
          throw new Error(`Package install aborted with exit execution code: ${installExitCode}`);
        }

        setCurrentStep(4);
        terminalRef.current?.writeToTerminal("🚀 Booting development core runner: npm start...\r\n");
        const startProcess = await instance.spawn("npm", ["run", "dev"], {
          env: {
            CHOKIDAR_USEPOLLING: "true",  // Forces file watcher polling loops inside react-scripts
            WATCHPACK_POLLING: "true",    // Forces underlying Webpack compile pooling triggers
            WDS_SOCKET_PORT: "0",         // Prevents container frame hot-reload websocket collisions
          }
        });

        instance.on("server-ready", (port: number, url: string) => {
          terminalRef.current?.writeToTerminal(`\r\n🌐 Live boundary rendered frame ready at: ${url}\r\n`);
          setPreviewUrl(url);
          setIsSetupComplete(true);
          setIsSetupInProgress(false);
        });

        startProcess.output.pipeTo(
          new WritableStream({
            write(data) { terminalRef.current?.writeToTerminal(data); },
          })
        );

      } catch (err) {
        console.error("Setup lifecycle failure:", err);
        const errMsg = err instanceof Error ? err.message : String(err);
        terminalRef.current?.writeToTerminal(`\r\n❌ Compilation Error: ${errMsg}\r\n`);
        setSetupError(errMsg);
        setIsSetupInProgress(false);
      }
    }

    const syncTimeout = setTimeout(() => {
      setupContainer();
    }, 200);

    return () => clearTimeout(syncTimeout);
  }, [instance, templateData, isSetupComplete, isSetupInProgress]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-zinc-950 font-mono text-xs text-zinc-400">
        <div className="text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p>// Allocating secure microkernel sandbox instance...</p>
        </div>
      </div>
    );
  }

  if (error || setupError) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-zinc-950 p-6 font-mono text-xs">
        <div className="border border-red-900/40 bg-red-950/10 p-5 rounded-xl max-w-md text-red-400 space-y-2">
          <div className="flex items-center gap-2 font-bold"><XCircle className="h-4 w-4" /><span>System Exception</span></div>
          <p>{error || setupError}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col min-h-0 bg-zinc-950 text-zinc-200 relative">
      {!previewUrl ? (
        /* PHASE 1: PIPELINE COMPILATION VIEW */
        <div className="h-full w-full flex flex-col min-h-0">
          <div className="w-full max-w-sm px-6 py-4 mt-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 mx-auto space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs font-mono font-bold tracking-tight text-zinc-400">Compilation Pipeline</span>
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-1.5 bg-zinc-800" />
            <div className="space-y-2.5 font-mono text-[11px]">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className={currentStep >= 1 ? "text-emerald-400" : ""}>{currentStep > 1 ? "✓" : "●"}</span>
                <span className={currentStep === 1 ? "text-zinc-100 font-bold" : ""}>Parse Environment Tree</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className={currentStep >= 2 ? "text-emerald-400" : ""}>{currentStep > 2 ? "✓" : "●"}</span>
                <span className={currentStep === 2 ? "text-zinc-100 font-bold" : ""}>Mount Virtual Filesystem</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className={currentStep >= 3 ? "text-emerald-400" : ""}>{currentStep > 3 ? "✓" : "●"}</span>
                <span className={currentStep === 3 ? "text-zinc-100 font-bold" : ""}>Resolve Dependencies</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <span className={currentStep >= 4 ? "text-emerald-400" : ""}>{currentStep > 4 ? "✓" : "●"}</span>
                <span className={currentStep === 4 ? "text-zinc-100 font-bold" : ""}>Boot Hot-Reload Server</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 min-h-0">
            <TerminalComponent ref={terminalRef} webContainerInstance={instance} className="h-full" />
          </div>
        </div>
      ) : (
        /* 🚀 PHASE 2: ACTIVE SPLIT PLATFORM WITH DRAGGABLE RESIZER BOUNDS */
        <div className="h-full w-full flex flex-col min-h-0 box-border p-3 bg-[#030303]">
          
          {/* Upper Deck Column: Live Preview Tab Suite */}
          <div className="flex-1 min-h-0">
            <MultiTabPreview webcontainerUrl={previewUrl} />
          </div>

          {/* 🎛️ VERTICAL RESIZER DRAG STRIP SEGMENT */}
          <div 
            onMouseDown={startResizing}
            className={`h-2 w-full my-1 cursor-row-resize flex items-center justify-center rounded-sm transition-all duration-150 select-none shrink-0 z-40
              ${isDragging 
                ? "bg-primary text-white scale-y-110 shadow-md" 
                : "bg-transparent hover:bg-neutral-800 text-neutral-600 dark:text-neutral-700"
              }
            `}
          >
            <GripHorizontal className="w-4 h-4 opacity-60" />
          </div>

          {/* Lower Deck Column: Parallel Shell Terminal Engine */}
          <div 
            style={{ height: `${terminalHeight}px` }} 
            className="shrink-0 min-h-[120px]"
          >
            <MultiTabTerminal webcontainerInstance={instance} />
          </div>
          
        </div>
      )}
    </div>
  );
};

export default WebContainerPreview;