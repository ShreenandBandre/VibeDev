// src/app/(ide)/playground/[id]/_components/workspace-editor.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Terminal, Keyboard, Folder, ChevronRight, FileCode, Cpu, ShieldCheck } from "lucide-react";
import { useIDEStore } from "@/lib/store/use-ide-store";
import Editor, { Monaco } from "@monaco-editor/react";
import { useParams } from "next/navigation";

import { 
  getEditorLanguageByExtension, 
  defaultMonacoOptions, 
  handleEditorWillMount 
} from "@/lib/config-monaco";

interface WorkspaceEditorProps {
  webcontainerInstance?: any;
}

export function WorkspaceEditor({ webcontainerInstance }: WorkspaceEditorProps) {
  const params = useParams();
  const playgroundId = params?.id as string;

  const { 
    files, 
    activeFileId, 
    openTabs, 
    dirtyFileIds, 
    themeMode, 
    cursorLine,
    cursorColumn,
    setActiveFileId, 
    closeTab, 
    updateFileContent,
    syncWithCloudAtlas,
    setCursorPosition
  } = useIDEStore();

  const activeFileObject = activeFileId ? files[activeFileId] : null;
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [localSavingStatus, setLocalSavingStatus] = useState<"idle" | "typing" | "saving" | "saved">("idle");

  // 🚀 FEATURE 1: DEBOUNCED AUTOMATIC FILESYSTEM AUTOSAVE
  const triggerAutosaveSequence = (updatedValue: string) => {
    if (!activeFileId || !activeFileObject) return;

    updateFileContent(activeFileId, updatedValue);
    setLocalSavingStatus("typing");

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setLocalSavingStatus("saving");
      try {
        if (webcontainerInstance) {
          await webcontainerInstance.fs.writeFile(activeFileObject.path, updatedValue);
          setLocalSavingStatus("saved");
          setTimeout(() => setLocalSavingStatus("idle"), 1200);
        } else {
          setLocalSavingStatus("idle");
        }
      } catch (fsErr) {
        console.warn("VM Background Disk Sync Exception Intercept:", fsErr);
        setLocalSavingStatus("idle");
      }
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [activeFileId]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // 🚀 FEATURE 2: CAPTURE MONACO CURSOR COORDINATES
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition(e.position.lineNumber, e.position.column);
    });

    let debounceAutocompleteTimer: NodeJS.Timeout;

    // 🛰️ FEATURE 3: LOCAL OLLAMA INLINE GHOST TEXT GENERATOR WITH DEBOUNCE PROTECTION
    monaco.languages.registerInlineCompletionsProvider(
      ['javascript', 'typescript', 'javascriptreact', 'typescriptreact', 'html', 'css'], 
      {
        provideInlineCompletions: (model, position, context, token) => {
          return new Promise((resolve) => {
            if (debounceAutocompleteTimer) clearTimeout(debounceAutocompleteTimer);

            debounceAutocompleteTimer = setTimeout(async () => {
              if (token.isCancellationRequested) return resolve({ items: [] });

              const textBeforeCursor = model.getValueInRange({
                startLineNumber: Math.max(1, position.lineNumber - 35), 
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
              });

              const textAfterCursor = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: Math.min(model.getLineCount(), position.lineNumber + 35),
                endColumn: model.getLineMaxColumn(Math.min(model.getLineCount(), position.lineNumber + 35))
              });

              if (!textBeforeCursor.trim() || token.isCancellationRequested) {
                return resolve({ items: [] });
              }

              try {
                const response = await fetch("/api/ai/autocomplete", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ textBeforeCursor, textAfterCursor, filename: model.uri.path.split("/").pop() }),
                });

                if (!response.ok || token.isCancellationRequested) return resolve({ items: [] });
                const { completion } = await response.json();

                if (!completion) return resolve({ items: [] });

                return resolve({
                  items: [{
                    insertText: completion,
                    range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
                  }]
                });
              } catch (err) {
                return resolve({ items: [] });
              }
            }, 400); // Wait for a natural 400ms pause in user typing
          });
        },
        freeInlineCompletions: () => {}
      }
    );

    // 🎹 SHORTCUT MATRIX: AUTOMATED FORMATTING & WEBCONTAINER FILE SYNC
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      if (editorRef.current) {
        await editorRef.current.getAction('editor.action.formatDocument').run();
      }
      
      const updatedValue = editorRef.current?.getValue() || "";
      const currentActiveId = useIDEStore.getState().activeFileId;
      const currentFilesMap = useIDEStore.getState().files;

      if (currentActiveId && currentFilesMap[currentActiveId]) {
        const targetFile = currentFilesMap[currentActiveId];
        updateFileContent(currentActiveId, updatedValue);

        try {
          if (webcontainerInstance) {
            await webcontainerInstance.fs.writeFile(targetFile.path, updatedValue);
          }
        } catch (fsErr) {
          console.warn("VM Local Disk Flush Exception Intercept:", fsErr);
        }
      }

      if (playgroundId) {
        syncWithCloudAtlas(playgroundId);
      }
    });

    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyW, () => {
      const currentActiveId = useIDEStore.getState().activeFileId;
      if (currentActiveId) closeTab(currentActiveId);
    });
  };

  // 🚀 LISTEN TO MANUAL DROPDOWN TRIGGERS
  useEffect(() => {
    const handleManualAiTrigger = async (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!editorRef.current || !monacoRef.current || !activeFileObject) return;
      
      // Forces Monaco to manually open standard completion lists or invoke actions based on type
      editorRef.current.trigger("manual-ai", "editor.action.inlineSuggest.trigger", null);
    };

    window.addEventListener("vibe-manual-ai-trigger", handleManualAiTrigger);
    return () => window.removeEventListener("vibe-manual-ai-trigger", handleManualAiTrigger);
  }, [activeFileObject]);

  // 🚀 FEATURE 4: HORIZONTAL BREADCRUMB FOLDER FLOW SCHEMATIC
  const renderHorizontalFolderFlow = () => {
    if (!activeFileObject) return null;
    const pathSegments = activeFileObject.path.split("/");
    
    return (
      <div className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 font-medium overflow-x-auto pr-4 scrollbar-none select-none">
        <Folder className="w-3.5 h-3.5 text-primary/70 shrink-0" />
        <span className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer">root</span>
        
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          return (
            <React.Fragment key={index}>
              <ChevronRight className="w-3 h-3 text-zinc-300 dark:text-zinc-700 shrink-0" />
              {isLast ? (
                <div className="flex items-center gap-1 text-zinc-800 dark:text-zinc-200 font-semibold bg-zinc-200/50 dark:bg-neutral-900 border border-zinc-300/40 dark:border-neutral-800/80 px-2 py-0.5 rounded-md shadow-3xs">
                  <FileCode className="w-3 h-3 text-primary" />
                  <span className="truncate max-w-[120px]">{segment}</span>
                </div>
              ) : (
                <span className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer truncate max-w-[100px]">{segment}</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-white dark:bg-[#000000] flex flex-col min-h-0 relative border-r border-zinc-200 dark:border-zinc-900 box-border">
      
      {/* SEAMLESS TAB WRAPPER TRACK */}
      <div className="h-10 w-full flex border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#050506] overflow-x-auto select-none shrink-0 scrollbar-none items-center box-border">
        {openTabs.map((tabId) => {
          const fileObj = files[tabId];
          if (!fileObj) return null;
          
          const isCurrent = tabId === activeFileId;
          const isDirty = dirtyFileIds.includes(tabId);

          return (
            <div
              key={tabId}
              onClick={() => setActiveFileId(tabId)}
              className={`group/tab h-full px-4 text-xs font-mono flex items-center gap-3 border-r border-zinc-200 dark:border-zinc-900/40 cursor-pointer transition-all shrink-0 relative box-border
                ${isCurrent 
                  ? "bg-white dark:bg-[#000000] text-zinc-900 dark:text-foreground font-bold border-t-2 border-t-primary" 
                  : "text-zinc-400 hover:bg-zinc-200/40 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-foreground"
                }
              `}
            >
              <span className="truncate max-w-[120px] text-[13px]">{fileObj.name}</span>
              
              <div className="w-3.5 h-3.5 flex items-center justify-center relative">
                {isDirty ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 scale-100 opacity-100 transition-all duration-150 group-hover/tab:scale-0 group-hover/tab:opacity-0" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
                      className="p-0.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-destructive absolute inset-0 opacity-0 group-hover/tab:opacity-100 scale-0 group-hover/tab:scale-100 transition-all duration-150 cursor-pointer flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={(e) => { e.stopPropagation(); closeTab(tabId); }}
                    className="p-0.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-destructive opacity-0 group-hover/tab:opacity-100 transition-opacity duration-150 cursor-pointer flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {openTabs.length === 0 && <span className="text-xs font-mono pl-3 text-zinc-400/60 dark:text-zinc-600/40 italic select-none">// Canvas Staging Matrix Empty</span>}
      </div>

      {/* 🧭 PATH FLOW SUB-STRIP */}
      {activeFileId && activeFileObject && (
        <div className="h-8 w-full border-b border-zinc-200/60 dark:border-neutral-900 bg-zinc-100/40 dark:bg-neutral-950/40 flex items-center justify-between px-4 shrink-0">
          {renderHorizontalFolderFlow()}
          
          <div className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 text-zinc-400 dark:text-zinc-600 font-bold">
            {localSavingStatus === "typing" && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />}
            {localSavingStatus === "saving" && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />}
            {localSavingStatus === "saved" && <span className="text-emerald-500 font-extrabold font-sans">✓ Disk Synced</span>}
            {localSavingStatus === "idle" && <span className="opacity-40">Ready</span>}
            {localSavingStatus !== "saved" && localSavingStatus}
          </div>
        </div>
      )}

      {/* CORE INTEL_COMPILATION COCKPIT CONTAINER */}
      <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden box-border">
        {activeFileId && activeFileObject ? (
          <Editor
            height="100%"
            width="100%"
            theme={themeMode === "dark" ? "vibedev-midnight" : "vibedev-clean-light"}
            path={activeFileObject.path} 
            language={getEditorLanguageByExtension(activeFileObject.name)}
            value={activeFileObject.content || ""}
            onChange={(val) => triggerAutosaveSequence(val || "")}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount} 
            loading={
              <div className="flex-1 h-full flex items-center justify-center font-mono text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-black/40 animate-pulse">
                // Synchronizing advanced codespace utilities...
              </div>
            }
            options={{
              ...defaultMonacoOptions,
              // 🚀 CRITICAL FOR INLINE GHOST-TEXT GRAPHICS RENDERING
              inlineSuggest: {
                enabled: true,
                mode: "prefix",
                showToolbar: "always",
              },
              suggest: {
                preview: true,
              },
              quickSuggestions: {
                other: true,
                comments: false,
                strings: false
              }
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none animate-fade-in bg-zinc-50 dark:bg-transparent">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl border border-zinc-200 dark:border-border/80 bg-white dark:bg-zinc-950 flex items-center justify-center relative shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <X className="w-8 h-8 text-primary stroke-[1.5]" />
              </div>
            </div>

            <h2 className="text-base font-black tracking-tight text-zinc-800 dark:text-zinc-200 font-sans mb-1">
              VibeDev Interactive Codespace
            </h2>
            <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 max-w-xs leading-relaxed mb-8">
              No active compilation token selected. Open a file from the explorer matrix or trigger a new source component segment.
            </p>

            <div className="border border-zinc-200 dark:border-border/40 bg-white dark:bg-zinc-950/40 backdrop-blur-xs rounded-xl p-4 w-full max-w-xs space-y-2.5 text-left font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="text-[10px] uppercase font-black tracking-widest text-zinc-400 dark:text-zinc-600 border-b border-zinc-200 dark:border-border/30 pb-1.5 flex items-center gap-1.5">
                <Keyboard className="w-3 h-3" />
                <span>Quick Actions Matrix</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 dark:text-zinc-500">Create New Token</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-border/60 rounded text-[10px] text-primary font-bold">Hover Explorer +</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 dark:text-zinc-500">Commit Cloud Sync</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-border/60 rounded text-[10px]">Ctrl + S Shortcut</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 dark:text-zinc-500">Global Close Tab</span>
                <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-border/60 rounded text-[10px]">Alt + W Shortcut</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 FEATURE 5: HIGH-DENSITY COORDINATE STATUS BAR */}
      <div className="h-6 w-full border-t border-zinc-200 dark:border-neutral-900 bg-zinc-50 dark:bg-neutral-950 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] flex items-center justify-between px-4 shrink-0 select-none z-20 box-border">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-primary/80 font-bold uppercase tracking-wider text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            VibeDev Live V1
          </span>
          {activeFileObject && (
            <span className="text-zinc-400 dark:text-zinc-600 uppercase tracking-tight font-medium">
              LF // Language: <span className="text-zinc-600 dark:text-zinc-300 font-bold">{activeFileObject.name.split(".").pop()}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 font-medium">
          <div className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors">
            Ln <span className="text-zinc-900 dark:text-zinc-100 font-bold">{cursorLine || 1}</span>, Col <span className="text-zinc-900 dark:text-zinc-100 font-bold">{cursorColumn || 1}</span>
          </div>
          <div className="text-zinc-300 dark:text-neutral-800 border-l border-zinc-300 dark:border-neutral-800 pl-3 uppercase text-[10px] tracking-wider font-bold">
            UTF-8
          </div>
        </div>
      </div>

    </div>
  );
}