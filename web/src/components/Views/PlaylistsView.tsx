import React from 'react';
import { PlaylistCard } from '../Common/PlaylistCard';
import { useLibraryStore } from '../../stores/libraryStore';

export const PlaylistsView: React.FC = () => {
  const { playlists } = useLibraryStore();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Playlists</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {playlists.map((playlist) => (
          <PlaylistCard key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
};