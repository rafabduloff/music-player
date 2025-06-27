use super::MusicProvider;
use crate::types::{PlaylistInfo, ProviderType, TrackInfo};
use anyhow::Result;
use std::time::Duration;

pub struct SpotifyProvider {
    token: Option<String>,
}

impl SpotifyProvider {
    pub fn new() -> Self {
        Self { token: None }
    }
}

#[async_trait::async_trait]
impl MusicProvider for SpotifyProvider {
    async fn authenticate(&mut self, token: String) -> Result<bool> {
        self.token = Some(token);
        Ok(true)
    }

    async fn get_playlists(&self) -> Result<Vec<PlaylistInfo>> {
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
        Ok("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3".to_string())
    }
} 