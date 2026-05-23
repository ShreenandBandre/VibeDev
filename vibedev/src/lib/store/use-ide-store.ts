// src/lib/store/use-ide-store.ts
import { create } from "zustand";
import { toast } from "sonner";

export interface IDEFile {
  id: string;
  name: string;
  path: string;
  content: string;
  isFolder: boolean;
  parentId: string | null;
}

interface IDEState {
  files: Record<string, IDEFile>;
  activeFileId: string | null;
  openTabs: string[];
  searchQuery: string;
  isSaving: boolean;
  
  // CORE DISPATCH ACTIONS
  initializeWorkspace: (initialFiles: IDEFile[]) => void;
  setActiveFileId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  closeTab: (id: string) => void;
  updateFileContent: (id: string, content: string) => void;
  addNewItem: (name: string, isFolder: boolean, parentId: string | null) => void;
  renameItem: (id: string, newName: string) => void;
  deleteItem: (id: string) => void;
  syncWithCloudAtlas: (playgroundId: string) => Promise<void>;
}

export const useIDEStore = create<IDEState>((set, get) => ({
  files: {},
  activeFileId: null,
  openTabs: [],
  searchQuery: "",
  isSaving: false,

  initializeWorkspace: (initialFiles) => {
    const fileMap: Record<string, IDEFile> = {};
    initialFiles.forEach(f => { fileMap[f.id] = f; });
    
    // Auto-open the first available code file in workspace tabs
    const coreFirstFile = initialFiles.find(f => !f.isFolder);
    set({
      files: fileMap,
      activeFileId: coreFirstFile ? coreFirstFile.id : null,
      openTabs: coreFirstFile ? [coreFirstFile.id] : [],
      searchQuery: ""
    });
  },

  setActiveFileId: (id) => set((state) => {
    if (!id) return { activeFileId: null };
    const nextTabs = state.openTabs.includes(id) ? state.openTabs : [...state.openTabs, id];
    return { activeFileId: id, openTabs: nextTabs };
  }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  closeTab: (id) => set((state) => {
    const nextTabs = state.openTabs.filter(t => t !== id);
    let nextActive = state.activeFileId;
    if (state.activeFileId === id) {
      nextActive = nextTabs[nextTabs.length - 1] || null;
    }
    return { openTabs: nextTabs, activeFileId: nextActive };
  }),

  updateFileContent: (id, content) => set((state) => {
    if (!state.files[id]) return {};
    return {
      files: {
        ...state.files,
        [id]: { ...state.files[id], content }
      }
    };
  }),

  addNewItem: (name, isFolder, parentId) => set((state) => {
    const uniqueSecureId = "node_" + Math.random().toString(36).substring(2, 15);
    
    // Resolve relative virtual tracking path
    const parentNode = parentId ? state.files[parentId] : null;
    const computedPath = parentNode ? `${parentNode.path}/${name}` : name;

    const newItem: IDEFile = {
      id: uniqueSecureId,
      name,
      path: computedPath,
      content: isFolder ? "" : `// Initialized workspace unit: ${name}`,
      isFolder,
      parentId
    };

    toast.success(`Successfully provisioned ${isFolder ? "folder" : "file"} container node.`);
    
    return {
      files: { ...state.files, [uniqueSecureId]: newItem },
      activeFileId: isFolder ? state.activeFileId : uniqueSecureId,
      openTabs: isFolder ? state.openTabs : [...state.openTabs, uniqueSecureId]
    };
  }),

  renameItem: (id, newName) => set((state) => {
    const target = state.files[id];
    if (!target) return {};

    const updatedFiles = { ...state.files };
    updatedFiles[id] = { ...target, name: newName };

    toast.info(`Renamed asset mapping to: "${newName}"`);
    return { files: updatedFiles };
  }),

  deleteItem: (id) => set((state) => {
    const updatedFiles = { ...state.files };
    
    // Secure cascade algorithm: wipes targeted item alongside any child inside it
    const purgeNodeIds = new Set<string>([id]);
    let parsingQueueSize = 0;

    while (purgeNodeIds.size !== parsingQueueSize) {
      parsingQueueSize = purgeNodeIds.size;
      Object.values(updatedFiles).forEach(f => {
        if (f.parentId && purgeNodeIds.has(f.parentId)) {
          purgeNodeIds.add(f.id);
        }
      });
    }

    purgeNodeIds.forEach(pId => delete updatedFiles[pId]);
    const nextTabs = state.openTabs.filter(tabId => !purgeNodeIds.has(tabId));
    const nextActive = nextTabs.includes(state.activeFileId || "") ? state.activeFileId : (nextTabs[0] || null);

    toast.error("Purged structural asset records safely from tree.");
    return { files: updatedFiles, openTabs: nextTabs, activeFileId: nextActive };
  }),

  syncWithCloudAtlas: async (playgroundId) => {
    set({ isSaving: true });
    try {
      const response = await fetch(`/api/playground/${playgroundId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePayloadArray: Object.values(get().files) }),
      });
      
      if (!response.ok) throw new Error("Database rejected sync.");
      toast.success("All codespace segments synchronized to Atlas Cloud securely!", {
        description: `${new Date().toLocaleTimeString()} // SECURITY LOCK VERIFIED`
      });
    } catch (err) {
      toast.error("Failed to sync container variables safely down to persistent tables.");
    } finally {
      set({ isSaving: false });
    }
  }
}));