// src/features/playground/components/webcontainer-preview.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import type { TemplateFolder } from "@/features/playground/libs/path-to-json";
import { transformToWebContainerFormat } from "../hooks/transformer";
import { CheckCircle, Loader2, XCircle, Globe, Terminal as TerminalIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import TerminalComponent from "./terminal";
import { WebContainer } from "@webcontainer/api";

interface WebContainerPreviewProps {
  templateData: TemplateFolder;
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

  useEffect(() => {
    async function setupContainer() {
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);
        
        // 1. Safety check for active shell recovery matching tokens
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
          // Proceed with normal clean initialization if file doesn't exist
        }
        
        // Step 1: Transform Template
        setCurrentStep(1);
        terminalRef.current?.writeToTerminal("🔄 Parsing system folder template schemas...\r\n");
        const files = transformToWebContainerFormat(templateData);

        // Step 2: Mount filesystem object map
        setCurrentStep(2);
        terminalRef.current?.writeToTerminal("📁 Initializing workspace directory structure mounts...\r\n");
        await instance.mount(files);
        terminalRef.current?.writeToTerminal("✅ Workspace file mounting complete.\r\n");

        // Step 3: Install modules
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

        // Step 4: Boot dev scripts
        setCurrentStep(4);
        terminalRef.current?.writeToTerminal("🚀 Booting development core runner: npm start...\r\n");
        const startProcess = await instance.spawn("npm", ["run", "dev"]);

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

    // A tiny 200ms delay ensures the Xterm terminal canvas instance is fully mounted and listening
    const syncTimeout = setTimeout(() => {
      setupContainer();
    }, 200);

    return () => clearTimeout(syncTimeout);
  }, [instance, templateData, isSetupComplete, isSetupInProgress]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950 font-mono text-xs text-zinc-400">
        <div className="text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p>// Allocating secure microkernel sandbox instance...</p>
        </div>
      </div>
    );
  }

  if (error || setupError) {
    return (
      <div className="h-full flex items-center justify-center bg-zinc-950 p-6 font-mono text-xs">
        <div className="border border-red-900/40 bg-red-950/10 p-5 rounded-xl max-w-md text-red-400 space-y-2">
          <div className="flex items-center gap-2 font-bold"><XCircle className="h-4 w-4" /><span>System Exception</span></div>
          <p>{error || setupError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col min-h-0 bg-zinc-950 text-zinc-200">
      {!previewUrl ? (
        <div className="h-full flex flex-col min-h-0">
          <div className="w-full max-w-sm px-6 py-4 mt-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 mx-auto space-y-4">
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
          <div className="flex-1 p-4 min-h-0"><TerminalComponent ref={terminalRef} webContainerInstance={instance} className="h-full" /></div>
        </div>
      ) : (
        <div className="h-full flex flex-col min-h-0">
          <div className="h-10 px-4 border-b border-zinc-800 bg-zinc-900/30 flex items-center text-xs font-mono text-zinc-500 gap-2 font-semibold select-none shrink-0">
            <Globe className="w-3.5 h-3.5 text-primary" /><span className="truncate text-zinc-400">{previewUrl}</span>
          </div>
          <div className="flex-1 bg-white min-h-0">
            <iframe src={previewUrl} className="w-full h-full border-none bg-white" title="WebContainer Engine App Preview" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />
          </div>
          <div className="h-52 border-t border-zinc-800 flex flex-col min-h-0 shrink-0">
            <div className="h-8 px-3 border-b border-zinc-800/60 bg-zinc-900/20 flex items-center font-mono text-[10px] uppercase font-black tracking-wider text-zinc-500 gap-1.5 shrink-0"><TerminalIcon className="w-3 h-3" /><span>Runtime Debug Output Log</span></div>
            <div className="flex-1 min-h-0"><TerminalComponent ref={terminalRef} webContainerInstance={instance} className="h-full rounded-none border-0" /></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebContainerPreview;