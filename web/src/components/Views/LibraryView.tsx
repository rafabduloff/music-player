import React, { useState } from 'react';
import { Grid, List, Filter, SortAsc, Plus } from 'lucide-react';
import { TrackCard } from '../Common/TrackCard';
import { AlbumCard } from '../Common/AlbumCard';
import { PlaylistCard } from '../Common/PlaylistCard';
import { useLibraryStore } from '../../stores/libraryStore';

export const LibraryView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { tracks, albums, playlists, likedTracks, recentlyPlayed, createPlaylist } = useLibraryStore();

  const sortOptions = [
    { id: 'recent', label: 'Recently Added' },
    { id: 'alphabetical', label: 'Alphabetical' },
    { id: 'artist', label: 'Artist' },
    { id: 'plays', label: 'Most Played' },
  ];

  const filterOptions = [
    { id: 'all', label: 'All', count: tracks.length + albums.length + playlists.length },
    { id: 'tracks', label: 'Songs', count: tracks.length },
    { id: 'albums', label: 'Albums', count: albums.length },
    { id: 'playlists', label: 'Playlists', count: playlists.length },
    { id: 'liked', label: 'Liked Songs', count: likedTracks.length },
  ];

  const getSortedItems = (items: any[], type: string) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return (a.title || a.name).localeCompare(b.title || b.name);
        case 'artist':
          return a.artist?.localeCompare(b.artist) || 0;
        case 'plays':
          return (b.playCount || 0) - (a.playCount || 0);
        case 'recent':
        default:
          return new Date(b.addedAt || b.createdAt || 0).getTime() - new Date(a.addedAt || a.createdAt || 0).getTime();
      }
    });
  };

  const getFilteredItems = () => {
    switch (filterBy) {
      case 'tracks':
        return { tracks: getSortedItems(tracks, 'tracks'), albums: [], playlists: [] };
      case 'albums':
        return { tracks: [], albums: getSortedItems(albums, 'albums'), playlists: [] };
      case 'playlists':
        return { tracks: [], albums: [], playlists: getSortedItems(playlists, 'playlists') };
      case 'liked':
        return { tracks: getSortedItems(likedTracks, 'tracks'), albums: [], playlists: [] };
      default:
        return {
          tracks: getSortedItems(tracks.slice(0, 20), 'tracks'),
          albums: getSortedItems(albums, 'albums'),
          playlists: getSortedItems(playlists, 'playlists'),
        };
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your Library</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
        >
          <Plus size={20} />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFilterBy(option.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterBy === option.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                {option.label} ({option.count})
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-dark-800 border border-dark-700 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:border-primary-500"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
            <SortAsc className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 pointer-events-none" size={16} />
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-dark-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'
              }`}
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-primary-500 text-white' : 'text-dark-400 hover:text-white'
              }`}
            >
              <Grid size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Tracks */}
        {filteredItems.tracks.length > 0 && (
          <div>
            {filterBy === 'all' && <h2 className="text-xl font-bold mb-4">Songs</h2>}
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {filteredItems.tracks.map((track, index) => (
                  <TrackCard key={track.id} track={track} index={index + 1} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredItems.tracks.map((track) => (
                  <div key={track.id} className="bg-dark-800 p-4 rounded-xl hover:bg-dark-700 transition-colors cursor-pointer">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full aspect-square rounded-lg mb-3 object-cover"
                    />
                    <h3 className="font-medium truncate">{track.title}</h3>
                    <p className="text-sm text-dark-400 truncate">{track.artist}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Albums */}
        {filteredItems.albums.length > 0 && (
          <div>
            {filterBy === 'all' && <h2 className="text-xl font-bold mb-4">Albums</h2>}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredItems.albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>
        )}

        {/* Playlists */}
        {filteredItems.playlists.length > 0 && (
          <div>
            {filterBy === 'all' && <h2 className="text-xl font-bold mb-4">Playlists</h2>}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredItems.playlists.map((playlist) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {Object.values(filteredItems).every(arr => arr.length === 0) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No items found</h3>
          <p className="text-dark-400">
            {filterBy === 'all' 
              ? "Your library is empty. Start adding some music!" 
              : `No ${filterBy} found. Try a different filter.`}
          </p>
        </div>
      )}
    </div>
  );
};