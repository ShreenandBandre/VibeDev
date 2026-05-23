// src/app/(ide)/playground/[id]/_components/workspace-editor.tsx
"use client";

import { useRef } from "react";
import { X, Terminal, Keyboard } from "lucide-react";
import { useIDEStore } from "@/lib/store/use-ide-store";
import Editor, { Monaco } from "@monaco-editor/react";
import { useParams } from "next/navigation";

import { 
  getEditorLanguageByExtension, 
  defaultMonacoOptions, 
  handleEditorWillMount 
} from "@/lib/config-monaco";

export function WorkspaceEditor() {
  const params = useParams();
  const playgroundId = params?.id as string;

  const { 
    files, 
    activeFileId, 
    openTabs, 
    dirtyFileIds, 
    themeMode, 
    setActiveFileId, 
    closeTab, 
    updateFileContent,
    syncWithCloudAtlas
  } = useIDEStore();

  const activeFileObject = activeFileId ? files[activeFileId] : null;
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;

    // 🛰️ FEATURE 3: INLINE COGNITIVE GHOST TEXT AUTO-SUGGESTION INJECTION
    monaco.languages.registerInlineCompletionsProvider('javascript', {
      provideInlineCompletions: (model, position) => {
        const textBeforeCursor = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        if (textBeforeCursor.trim() === 'vibe') {
          return {
            items: [{
              insertText: 'DevCodespaceEngineActive = true; // Press Tab to accept simulation token',
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
            }]
          };
        }
        return { items: [] };
      },
      freeInlineCompletions: () => {}
    });

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

        // 1. Commit the live layout mutation inside your core state store structures
        updateFileContent(currentActiveId, updatedValue);

        // 2. 🛰️ FLIGHT-INJECTOR: Write updated string bytes right down onto running WebContainer disk
        try {
          // 💎 FIXED: Using pathing alias to ensure robust compiler pass completely clean!
          const { getWebContainerInstance } = await import("@/features/playground/hooks/use-webcontainer");
          const containerVM = await getWebContainerInstance();
          
          if (containerVM) {
            await containerVM.fs.writeFile(targetFile.path, updatedValue);
          }
        } catch (fsErr) {
          console.warn("VM Local Disk Flush Exception Intercept:", fsErr);
        }
      }

      // 3. Commit cloud backup transaction down to database tables
      if (playgroundId) {
        syncWithCloudAtlas(playgroundId);
      }
    });

    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.KeyW, () => {
      const currentActiveId = useIDEStore.getState().activeFileId;
      if (currentActiveId) closeTab(currentActiveId);
    });
  };

  const handleModelChangeOverride = (newValue: string | undefined) => {
    if (activeFileId && newValue !== undefined) {
      updateFileContent(activeFileId, newValue);
    }
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
            onChange={handleModelChangeOverride}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount} 
            loading={
              <div className="flex-1 h-full flex items-center justify-center font-mono text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-black/40 animate-pulse">
                // Synchronizing advanced codespace utilities...
              </div>
            }
            options={defaultMonacoOptions}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none animate-fade-in bg-zinc-50 dark:bg-transparent">
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-all duration-500" />
              <div className="w-16 h-16 rounded-2xl border border-zinc-200 dark:border-border/80 bg-white dark:bg-zinc-950 flex items-center justify-center relative shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <Terminal className="w-8 h-8 text-primary stroke-[1.5]" />
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
    </div>
  );
}