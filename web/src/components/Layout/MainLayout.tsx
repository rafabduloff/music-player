import React from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { PlayerBar } from '../Player/PlayerBar';
import { ContextMenu } from '../Common/ContextMenu';
import { useUIStore } from '../../stores/uiStore';

export const MainLayout: React.FC = () => {
  const { miniPlayerMode } = useUIStore();

  if (miniPlayerMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <PlayerBar />
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark-950 text-white flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
      <PlayerBar />
      <ContextMenu />
    </div>
  );
};