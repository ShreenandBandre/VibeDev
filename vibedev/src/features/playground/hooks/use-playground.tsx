// src/features/playground/hooks/use-playground.tsx
"use client";

import React, { createContext, useContext, useState, useTransition } from "react";

interface PlaygroundContextType {
  files: Record<string, string>;
  activeFile: string;
  openTabs: string[];
  isSaving: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setActiveFile: (fileName: string) => void;
  openFileInTab: (fileName: string) => void;
  closeTab: (fileName: string) => void;
  updateFileContent: (content: string) => void;
  importFilesFromPayload: (newFiles: Record<string, string>) => void;
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
  const fileKeys = Object.keys(initialFiles);
  
  const [activeFile, setActiveFileState] = useState<string>(fileKeys[0] || "");
  const [openTabs, setOpenTabs] = useState<string[]>(fileKeys[0] ? [fileKeys[0]] : []);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, startSaveTransition] = useTransition();

  const setActiveFile = (fileName: string) => {
    setActiveFileState(fileName);
    if (fileName && !openTabs.includes(fileName)) {
      setOpenTabs((prev) => [...prev, fileName]);
    }
  };

  const openFileInTab = (fileName: string) => {
    setActiveFile(fileName);
  };

  const closeTab = (fileName: string) => {
    const fallbackTabs = openTabs.filter((t) => t !== fileName);
    setOpenTabs(fallbackTabs);
    if (activeFile === fileName) {
      setActiveFileState(fallbackTabs[fallbackTabs.length - 1] || "");
    }
  };

  const updateFileContent = (newContent: string) => {
    if (!activeFile) return;
    setFiles((prev) => ({ ...prev, [activeFile]: newContent }));
  };

  const importFilesFromPayload = (newFiles: Record<string, string>) => {
    setFiles((prev) => {
      const merged = { ...prev, ...newFiles };
      const nonKeepKeys = Object.keys(merged).filter(k => !k.endsWith(".keep"));
      if (nonKeepKeys.length > 0) {
        setActiveFileState(nonKeepKeys[0]);
        setOpenTabs([nonKeepKeys[0]]);
      }
      return merged;
    });
  };

  const saveWorkspaceChanges = async (playgroundId: string) => {
    startSaveTransition(async () => {
      try {
        const response = await fetch(`/api/playground/${playgroundId}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files }),
        });
        if (!response.ok) throw new Error("Sync mutation rejected.");
      } catch (error) {
        console.error("STATE_SYNC_FAILURE:", error);
      }
    });
  };

  return (
    <PlaygroundContext.Provider
      value={{
        files,
        activeFile,
        openTabs,
        isSaving,
        searchQuery,
        setSearchQuery,
        setActiveFile,
        openFileInTab,
        closeTab,
        updateFileContent,
        importFilesFromPayload,
        saveWorkspaceChanges,
      }}
    >
      {children}
    </PlaygroundContext.Provider>
  );
};

export const usePlayground = () => {
  const context = useContext(PlaygroundContext);
  if (!context) throw new Error("usePlayground missing structured provider wrapper layout.");
  return context;
};