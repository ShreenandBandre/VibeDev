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
  dirtyFileIds: string[];
  searchQuery: string;
  isSaving: boolean;
  themeMode: "dark" | "light"; // 🚀 Added state token
  
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
  toggleThemeMode: () => void; // 🚀 Added theme action toggle
  initializeTheme: () => void;  // 🚀 Added system theme listener
}

export const useIDEStore = create<IDEState>((set, get) => ({
  files: {},
  activeFileId: null,
  openTabs: [],
  dirtyFileIds: [],
  searchQuery: "",
  isSaving: false,
  themeMode: "dark",

  initializeTheme: () => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("vibedev-theme") as "dark" | "light";
    const mode = saved || "dark";
    document.documentElement.classList.toggle("dark", mode === "dark");
    set({ themeMode: mode });
  },

  toggleThemeMode: () => set((state) => {
    const nextMode = state.themeMode === "dark" ? "light" : "dark";
    localStorage.setItem("vibedev-theme", nextMode);
    document.documentElement.classList.toggle("dark", nextMode === "dark");
    return { themeMode: nextMode };
  }),

  initializeWorkspace: (initialFiles) => {
    const fileMap: Record<string, IDEFile> = {};
    initialFiles.forEach(f => { fileMap[f.id] = f; });
    
    const coreFirstFile = initialFiles.find(f => !f.isFolder);
    set({
      files: fileMap,
      activeFileId: coreFirstFile ? coreFirstFile.id : null,
      openTabs: coreFirstFile ? [coreFirstFile.id] : [],
      dirtyFileIds: [],
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
    const nextDirtyIds = state.dirtyFileIds.includes(id) ? state.dirtyFileIds : [...state.dirtyFileIds, id];
    return {
      files: { ...state.files, [id]: { ...state.files[id], content } },
      dirtyFileIds: nextDirtyIds
    };
  }),

  addNewItem: (name, isFolder, parentId) => set((state) => {
    const uniqueSecureId = "node_" + Math.random().toString(36).substring(2, 15);
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
    const nextDirtyIds = isFolder ? state.dirtyFileIds : [...state.dirtyFileIds, uniqueSecureId];

    return {
      files: { ...state.files, [uniqueSecureId]: newItem },
      activeFileId: isFolder ? state.activeFileId : uniqueSecureId,
      openTabs: isFolder ? state.openTabs : [...state.openTabs, uniqueSecureId],
      dirtyFileIds: nextDirtyIds
    };
  }),

  renameItem: (id, newName) => set((state) => {
    const target = state.files[id];
    if (!target) return {};

    const updatedFiles = { ...state.files };
    updatedFiles[id] = { ...target, name: newName };

    toast.info(`Renamed asset mapping to: "${newName}"`);
    const nextDirtyIds = state.dirtyFileIds.includes(id) ? state.dirtyFileIds : [...state.dirtyFileIds, id];

    return { files: updatedFiles, dirtyFileIds: nextDirtyIds };
  }),

  deleteItem: (id) => set((state) => {
    const updatedFiles = { ...state.files };
    const purgeNodeIds = new Set<string>([id]);
    let parsingQueueSize = 0;

    while (purgeNodeIds.size !== parsingQueueSize) {
      parsingQueueSize = purgeNodeIds.size;
      Object.values(updatedFiles).forEach(f => {
        if (f.parentId && purgeNodeIds.has(f.parentId)) purgeNodeIds.add(f.id);
      });
    }

    purgeNodeIds.forEach(pId => delete updatedFiles[pId]);
    const nextTabs = state.openTabs.filter(tabId => !purgeNodeIds.has(tabId));
    const nextActive = nextTabs.includes(state.activeFileId || "") ? state.activeFileId : (nextTabs[0] || null);
    const nextDirtyIds = state.dirtyFileIds.filter(dId => !purgeNodeIds.has(dId));

    toast.error("Purged structural asset records safely from tree.");
    return { files: updatedFiles, openTabs: nextTabs, activeFileId: nextActive, dirtyFileIds: nextDirtyIds };
  }),

  syncWithCloudAtlas: async (playgroundId) => {
    set({ isSaving: true });
    try {
      const response = await fetch(`/api/playground/${playgroundId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePayloadArray: Object.values(get().files) }),
      });
      if (!response.ok) throw new Error("Database transaction error.");
      set({ dirtyFileIds: [] });
      toast.success("All codespace segments synchronized to Atlas Cloud securely!");
    } catch (err) {
      toast.error("Failed to sync container variables safely down to persistent tables.");
    } finally {
      set({ isSaving: false });
    }
  }
}));