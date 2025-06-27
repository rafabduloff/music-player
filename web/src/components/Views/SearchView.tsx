import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { TrackCard } from '../Common/TrackCard';
import { AlbumCard } from '../Common/AlbumCard';
import { PlaylistCard } from '../Common/PlaylistCard';
import { useLibraryStore } from '../../stores/libraryStore';
import { useMusicSourceStore } from '../../stores/musicSourceStore';
import { useDebounce } from '../../hooks/useDebounce';

export const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  
  const { searchLibrary, searchResults } = useLibraryStore();
  const { sources, activeSource } = useMusicSourceStore();
  
  const debouncedQuery = useDebounce(query, 300);

  const activeSourceObj = sources.find(s => s.id === activeSource);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setIsSearching(true);
      searchLibrary(debouncedQuery);
      // Simulate async search delay
      setTimeout(() => setIsSearching(false), 300);
    }
  }, [debouncedQuery, searchLibrary]);

  const filters = [
    { id: 'all', label: 'All', count: searchResults.tracks.length + searchResults.albums.length + searchResults.playlists.length },
    { id: 'tracks', label: 'Songs', count: searchResults.tracks.length },
    { id: 'albums', label: 'Albums', count: searchResults.albums.length },
    { id: 'playlists', label: 'Playlists', count: searchResults.playlists.length },
  ];

  const filteredResults = useMemo(() => {
    switch (selectedFilter) {
      case 'tracks':
        return { tracks: searchResults.tracks, albums: [], playlists: [] };
      case 'albums':
        return { tracks: [], albums: searchResults.albums, playlists: [] };
      case 'playlists':
        return { tracks: [], albums: [], playlists: searchResults.playlists };
      default:
        return searchResults;
    }
  }, [searchResults, selectedFilter]);

  const hasResults = query.trim() && (
    filteredResults.tracks.length > 0 || 
    filteredResults.albums.length > 0 || 
    filteredResults.playlists.length > 0
  );

  const recentSearches = ['chill electronic', 'indie rock', 'workout music', 'lo-fi hip hop'];
  const trendingSearches = ['synthwave', 'ambient', 'jazz fusion', 'post-rock'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Search</h1>
        <div className="flex items-center gap-2 text-sm text-dark-400">
          <span>Searching in:</span>
          <span className="px-2 py-1 bg-dark-800 rounded-full font-medium" style={{ color: activeSourceObj?.color }}>
            {activeSourceObj?.name}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400" size={20} />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-dark-800 border border-dark-700 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {isSearching && (
          <div className="absolute inset-0 bg-dark-800/50 rounded-xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Filters */}
      {query.trim() && (
        <div className="flex items-center gap-4">
          <Filter size={20} className="text-dark-400" />
          <div className="flex gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === filter.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                {filter.label} {filter.count > 0 && `(${filter.count})`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasResults ? (
        <div className="space-y-8">
          {/* Top Result */}
          {filteredResults.tracks.length > 0 && selectedFilter === 'all' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Top result</h2>
              <div className="bg-dark-800 rounded-xl p-6 hover:bg-dark-700 transition-colors cursor-pointer">
                <TrackCard track={filteredResults.tracks[0]} showIndex={false} />
              </div>
            </div>
          )}

          {/* Tracks */}
          {filteredResults.tracks.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Songs</h2>
              <div className="space-y-2">
                {filteredResults.tracks.slice(0, selectedFilter === 'tracks' ? 50 : 5).map((track, index) => (
                  <TrackCard key={track.id} track={track} index={index + 1} />
                ))}
              </div>
              {filteredResults.tracks.length > 5 && selectedFilter === 'all' && (
                <button
                  onClick={() => setSelectedFilter('tracks')}
                  className="mt-4 text-primary-400 hover:text-primary-300 font-medium"
                >
                  Show all {filteredResults.tracks.length} songs
                </button>
              )}
            </div>
          )}

          {/* Albums */}
          {filteredResults.albums.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Albums</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredResults.albums.slice(0, selectedFilter === 'albums' ? 50 : 6).map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
              {filteredResults.albums.length > 6 && selectedFilter === 'all' && (
                <button
                  onClick={() => setSelectedFilter('albums')}
                  className="mt-4 text-primary-400 hover:text-primary-300 font-medium"
                >
                  Show all {filteredResults.albums.length} albums
                </button>
              )}
            </div>
          )}

          {/* Playlists */}
          {filteredResults.playlists.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Playlists</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredResults.playlists.slice(0, selectedFilter === 'playlists' ? 50 : 6).map((playlist) => (
                  <PlaylistCard key={playlist.id} playlist={playlist} />
                ))}
              </div>
              {filteredResults.playlists.length > 6 && selectedFilter === 'all' && (
                <button
                  onClick={() => setSelectedFilter('playlists')}
                  className="mt-4 text-primary-400 hover:text-primary-300 font-medium"
                >
                  Show all {filteredResults.playlists.length} playlists
                </button>
              )}
            </div>
          )}
        </div>
      ) : query.trim() && !isSearching ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-dark-400 mb-6">
            Try searching for something else or check your spelling.
          </p>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setQuery('electronic')}
              className="px-4 py-2 bg-dark-800 rounded-full text-sm hover:bg-dark-700 transition-colors"
            >
              Try "electronic"
            </button>
            <button
              onClick={() => setQuery('rock')}
              className="px-4 py-2 bg-dark-800 rounded-full text-sm hover:bg-dark-700 transition-colors"
            >
              Try "rock"
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Recent Searches */}
          <div>
            <h2 className="text-xl font-bold mb-4">Recent searches</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="bg-dark-800 rounded-xl p-4 text-left hover:bg-dark-700 transition-colors"
                >
                  <h3 className="font-medium capitalize">{search}</h3>
                  <p className="text-sm text-dark-400">Recent search</p>
                </button>
              ))}
            </div>
          </div>

          {/* Trending Searches */}
          <div>
            <h2 className="text-xl font-bold mb-4">Trending searches</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(search)}
                  className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-xl p-4 text-left hover:from-primary-500/30 hover:to-secondary-500/30 transition-all"
                >
                  <h3 className="font-medium capitalize">{search}</h3>
                  <p className="text-sm text-dark-400">Trending now</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};