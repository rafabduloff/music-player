import React from 'react';
import { HomeView } from '../Views/HomeView';
import { SearchView } from '../Views/SearchView';
import { LibraryView } from '../Views/LibraryView';
import { PlaylistsView } from '../Views/PlaylistsView';
import { SettingsView } from '../Views/SettingsView';
import { useUIStore } from '../../stores/uiStore';

export const MainContent: React.FC = () => {
  const { currentView } = useUIStore();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'search':
        return <SearchView />;
      case 'library':
        return <LibraryView />;
      case 'playlists':
        return <PlaylistsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="flex-1 bg-dark-950 overflow-y-auto">
      <div className="min-h-full">
        {renderCurrentView()}
      </div>
    </div>
  );
};