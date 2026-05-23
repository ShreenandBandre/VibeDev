// src/features/playground/components/multi-tab-preview.tsx
"use client";

import React, { useState } from "react";
import { Globe, Database, Cpu, RefreshCw, ExternalLink } from "lucide-react";

interface MultiTabPreviewProps {
  webcontainerUrl: string; // The active .url token returned by the instance server event hooks
  databaseSchemaMock?: any; 
}

type PreviewViewMode = "browser" | "database" | "logs";

export function MultiTabPreview({ webcontainerUrl, databaseSchemaMock }: MultiTabPreviewProps) {
  const [activeMode, setActiveMode] = useState<PreviewViewMode>("browser");
  const [iframeKey, setIframeKey] = useState<number>(0);

  const handleHardRefreshIframe = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="w-full h-[480px] border border-neutral-800 bg-neutral-950 rounded-xl overflow-hidden flex flex-col font-sans shadow-2xl">
      
      {/* 🎛️ VIEW ENGINE UTILITIES TAB SELECTOR HEADER */}
      <div className="h-11 border-b border-neutral-800 bg-neutral-900/80 flex items-center justify-between px-4 shrink-0 select-none">
        
        {/* Left Side: Segment Controllers */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800/80">
          <button
            onClick={() => setActiveMode("browser")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeMode === "browser"
                ? "bg-neutral-800 text-neutral-50 shadow-xs"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Live Preview
          </button>
          
          <button
            onClick={() => setActiveMode("database")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              activeMode === "database"
                ? "bg-neutral-800 text-neutral-50 shadow-xs"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Database Inspector
          </button>
        </div>

        {/* Right Side: Core Control Utilities */}
        {activeMode === "browser" && webcontainerUrl && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleHardRefreshIframe}
              className="p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 rounded-lg transition-colors cursor-pointer"
              title="Force Hot-Reload Viewport"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <a
              href={webcontainerUrl}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
              title="Open Live App in Fresh Tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* 📺 ACTIVE VIEW FRAME PORTAL CONTAINER */}
      <div className="flex-1 bg-neutral-900/20 relative">
        
        {/* MODE A: SYSTEM BROWSER IFRAME */}
        {activeMode === "browser" && (
          webcontainerUrl ? (
            <iframe
              key={iframeKey}
              src={webcontainerUrl}
              className="w-full h-full border-none bg-white bg-radial"
              title="WebContainer Framework Deployment Render Viewport"
              sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 font-mono text-xs">
              <Loader2 className="w-5 h-5 animate-spin mb-2 text-primary" />
              Waiting for orchestration server hook stream allocation details...
            </div>
          )
        )}

        {/* MODE B: DATABASE ROW DATA INSPECTOR TABLE VIEW */}
        {activeMode === "database" && (
          <div className="w-full h-full p-6 overflow-y-auto font-mono text-xs text-neutral-300 space-y-4 select-text">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-emerald-400 font-bold">// Collection Tracker Instance: MongoDB Atlas M0</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Status: Connected</span>
            </div>
            
            {/* Simple Dynamic Visual Model Layout Mock Box */}
            <div className="rounded-xl border border-neutral-800 overflow-hidden bg-neutral-950/60">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-neutral-900 border-b border-neutral-800 text-neutral-400 text-[10px] uppercase tracking-wider">
                    <th className="p-2.5 pl-4">Document Object ID</th>
                    <th className="p-2.5">File System Code Target</th>
                    <th className="p-2.5">Folder State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-300">
                  <tr className="hover:bg-neutral-900/40">
                    <td className="p-2.5 pl-4 text-neutral-500">_id: "clx9183af0001..."</td>
                    <td className="p-2.5 font-medium text-primary">src/main.ts</td>
                    <td className="p-2.5 text-neutral-400">false</td>
                  </tr>
                  <tr className="hover:bg-neutral-900/40">
                    <td className="p-2.5 pl-4 text-neutral-500">_id: "clx9188bf0002..."</td>
                    <td className="p-2.5 font-medium text-primary">src/components</td>
                    <td className="p-2.5 text-emerald-400">true</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

// Internal standard helper fallback icon loader tracker
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}