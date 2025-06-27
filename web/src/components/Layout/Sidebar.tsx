import React from 'react';
import { Home, Search, Library, Heart, Clock, Settings, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useLibraryStore } from '../../stores/libraryStore';
import { useMusicSourceStore } from '../../stores/musicSourceStore';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, currentView, setCurrentView } = useUIStore();
  const { playlists } = useLibraryStore();
  const { sources, activeSource, setActiveSource } = useMusicSourceStore();

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Your Library', icon: Library },
  ] as const;

  const libraryItems = [
    { id: 'liked', label: 'Liked Songs', icon: Heart },
    { id: 'recent', label: 'Recently Played', icon: Clock },
  ];

  return (
    <div className={`bg-dark-900 border-r border-dark-700 transition-all duration-300 flex flex-col ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-dark-700 flex items-center justify-between">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold text-primary-400">MusicFlow</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Music Sources */}
      <div className="p-4 border-b border-dark-700">
        {!sidebarCollapsed && (
          <h3 className="text-sm font-medium text-dark-400 mb-2">Sources</h3>
        )}
        <div className="space-y-1">
          {sources.map((source) => {
            const IconComponent = source.icon === 'Music' ? Search : 
                                source.icon === 'Radio' ? Search : 
                                source.icon === 'Play' ? Search : Library;
            
            return (
              <button
                key={source.id}
                onClick={() => setActiveSource(source.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  activeSource === source.id 
                    ? 'bg-primary-500/20 text-primary-400' 
                    : 'hover:bg-dark-800 text-dark-300'
                }`}
              >
                <div className={`p-1 rounded-sm`} style={{ backgroundColor: source.color + '20' }}>
                  <IconComponent size={16} style={{ color: source.color }} />
                </div>
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{source.name}</span>
                )}
                {!source.isAuthenticated && !sidebarCollapsed && (
                  <span className="text-xs text-dark-500">●</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-dark-700">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                currentView === item.id 
                  ? 'bg-primary-500/20 text-primary-400' 
                  : 'hover:bg-dark-800 text-dark-300'
              }`}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Library Items */}
      <div className="p-4 border-b border-dark-700">
        {!sidebarCollapsed && (
          <h3 className="text-sm font-medium text-dark-400 mb-2">Library</h3>
        )}
        <div className="space-y-1">
          {libraryItems.map((item) => (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800 text-dark-300 transition-colors"
            >
              <item.icon size={18} />
              {!sidebarCollapsed && (
                <span className="text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Playlists */}
      <div className="flex-1 p-4 overflow-y-auto">
        {!sidebarCollapsed && (
          <h3 className="text-sm font-medium text-dark-400 mb-2">Playlists</h3>
        )}
        <div className="space-y-1">
          {playlists.slice(0, sidebarCollapsed ? 5 : 20).map((playlist) => (
            <button
              key={playlist.id}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-dark-800 text-dark-300 transition-colors"
            >
              <img
                src={playlist.coverUrl}
                alt={playlist.name}
                className="w-8 h-8 rounded object-cover"
              />
              {!sidebarCollapsed && (
                <div className="text-left">
                  <div className="text-sm font-medium truncate">{playlist.name}</div>
                  <div className="text-xs text-dark-500">{playlist.tracks.length} songs</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-dark-700">
        <button
          onClick={() => setCurrentView('settings')}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
            currentView === 'settings' 
              ? 'bg-primary-500/20 text-primary-400' 
              : 'hover:bg-dark-800 text-dark-300'
          }`}
        >
          <Settings size={20} />
          {!sidebarCollapsed && (
            <span className="font-medium">Settings</span>
          )}
        </button>
      </div>
    </div>
  );
};