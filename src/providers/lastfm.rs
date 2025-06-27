use super::MusicProvider;
use crate::types::{PlaylistInfo, ProviderType, TrackInfo};
use anyhow::Result;

pub struct LastFmProvider {
    api_key: Option<String>,
}

impl LastFmProvider {
    pub fn new() -> Self {
        Self { api_key: None }
    }
}

#[async_trait::async_trait]
impl MusicProvider for LastFmProvider {
    async fn authenticate(&mut self, token: String) -> Result<bool> {
        self.api_key = Some(token);
        Ok(true)
    }

    async fn get_playlists(&self) -> Result<Vec<PlaylistInfo>> {
        // Last.fm doesn't have playlists, return empty.
        Ok(Vec::new())
    }

    async fn get_playlist_tracks(&self, _playlist_id: String) -> Result<Vec<TrackInfo>> {
        Ok(Vec::new())
    }

    async fn get_liked_tracks(&self) -> Result<Vec<TrackInfo>> {
        Ok(Vec::new())
    }

    async fn get_my_wave(&self) -> Result<Vec<TrackInfo>> {
        Ok(Vec::new())
    }

    async fn search_tracks(&self, _query: String) -> Result<Vec<TrackInfo>> {
        Ok(Vec::new())
    }

    async fn get_track_url(&self, _track_id: String) -> Result<String> {
        Ok("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3".to_string())
    }
} 