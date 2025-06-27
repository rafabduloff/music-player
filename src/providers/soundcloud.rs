use super::MusicProvider;
use crate::types::{PlaylistInfo, ProviderType, TrackInfo};
use anyhow::Result;

pub struct SoundCloudProvider {
    client_id: Option<String>,
}

impl SoundCloudProvider {
    pub fn new() -> Self {
        Self { client_id: None }
    }
}

#[async_trait::async_trait]
impl MusicProvider for SoundCloudProvider {
    async fn authenticate(&mut self, token: String) -> Result<bool> {
        // For SoundCloud we store client_id as token
        self.client_id = Some(token);
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
        Ok("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3".to_string())
    }
} 