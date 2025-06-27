import { create } from 'zustand';
import { UserSettings } from '../types';

interface UIStore {
  sidebarCollapsed: boolean;
  miniPlayerMode: boolean;
  currentView: 'home' | 'search' | 'library' | 'playlists' | 'settings';
  interfaceMode: 'simple' | 'advanced';
  theme: string;
  showContextMenu: boolean;
  contextMenuPosition: { x: number; y: number };
  contextMenuItems: Array<{ label: string; action: () => void; icon?: string }>;
  
  // Settings
  userSettings: UserSettings;
  
  // Actions
  toggleSidebar: () => void;
  toggleMiniPlayer: () => void;
  setCurrentView: (view: UIStore['currentView']) => void;
  setInterfaceMode: (mode: 'simple' | 'advanced') => void;
  setTheme: (theme: string) => void;
  showContextMenuAt: (x: number, y: number, items: UIStore['contextMenuItems']) => void;
  hideContextMenu: () => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  volume: 0.8,
  playbackQuality: 'high',
  crossfade: true,
  showNotifications: true,
  language: 'en',
  interfaceMode: 'advanced',
  autoPlayNext: true,
};

export const useUIStore = create<UIStore>((set, get) => ({
  sidebarCollapsed: false,
  miniPlayerMode: false,
  currentView: 'home',
  interfaceMode: 'advanced',
  theme: 'dark',
  showContextMenu: false,
  contextMenuPosition: { x: 0, y: 0 },
  contextMenuItems: [],
  userSettings: defaultSettings,

  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),

  toggleMiniPlayer: () => set((state) => ({ 
    miniPlayerMode: !state.miniPlayerMode 
  })),

  setCurrentView: (view) => set({ currentView: view }),

  setInterfaceMode: (mode) => set({ 
    interfaceMode: mode,
    userSettings: { ...get().userSettings, interfaceMode: mode }
  }),

  setTheme: (theme) => set({ 
    theme,
    userSettings: { ...get().userSettings, theme }
  }),

  showContextMenuAt: (x, y, items) => set({
    showContextMenu: true,
    contextMenuPosition: { x, y },
    contextMenuItems: items,
  }),

  hideContextMenu: () => set({ showContextMenu: false }),

  updateUserSettings: (settings) => set((state) => ({
    userSettings: { ...state.userSettings, ...settings }
  })),
}));