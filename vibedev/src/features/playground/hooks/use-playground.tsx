// src/features/playground/hooks/use-playground.tsx
"use client";

import React, { createContext, useContext, useState, useTransition } from "react";

interface PlaygroundContextType {
  files: Record<string, string>;
  activeFile: string;
  isSaving: boolean;
  setActiveFile: (fileName: string) => void;
  updateFileContent: (content: string) => void;
  saveWorkspaceChanges: (playgroundId: string) => Promise<void>;
}

const PlaygroundContext = createContext<PlaygroundContextType | undefined>(undefined);

export const PlaygroundProvider = ({
  children,
  initialFiles,
}: {
  children: React.ReactNode;
  initialFiles: Record<string, string>;
}) => {
  const [files, setFiles] = useState<Record<string, string>>(initialFiles);
  
  // Track active module file selected in the code tree explorer deck
  const fileKeys = Object.keys(initialFiles);
  const [activeFile, setActiveFile] = useState<string>(fileKeys[0] || "");
  const [isSaving, startSaveTransition] = useTransition();

  // Modifies active document buffers on-the-fly as keystrokes land in Monaco
  const updateFileContent = (newContent: string) => {
    if (!activeFile) return;
    setFiles((prev) => ({
      ...prev,
      [activeFile]: newContent,
    }));
  };

  // Dispatches an atomic save payload down to your next server endpoint loop
  const saveWorkspaceChanges = async (playgroundId: string) => {
    startSaveTransition(async () => {
      try {
        const response = await fetch(`/api/playground/${playgroundId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files }),
        });
        
        if (!response.ok) throw new Error("Database transaction rejected.");
      } catch (error) {
        console.error("IDE_STATE_SYNC_EXCEPTION:", error);
      }
    });
  };

  return (
    <PlaygroundContext.Provider
      value={{
        files,
        activeFile,
        isSaving,
        setActiveFile,
        updateFileContent,
        saveWorkspaceChanges,
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
};

// Unified Consumer Hook hook surface engine
export const usePlayground = () => {
  const context = useContext(PlaygroundContext);
  if (!context) {
    throw new Error("usePlayground must be executed within an active structural <PlaygroundProvider /> block wrapper.");
  }
  return context;
};