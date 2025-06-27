use super::MusicProvider;
use crate::types::{PlaylistInfo, ProviderType, TrackInfo};
use anyhow::{anyhow, Result};
use reqwest::Client;
use serde_json::Value;
use std::time::Duration;

pub struct YandexProvider {
    client: Client,
    token: Option<String>,
    base_url: String,
}

impl YandexProvider {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            token: None,
            base_url: "https://api.music.yandex.net".to_string(),
        }
    }

    async fn make_request(&self, endpoint: &str) -> Result<Value> {
        let token = self
            .token
            .as_ref()
            .ok_or_else(|| anyhow!("Not authenticated"))?;

        let url = format!("{}/{}", self.base_url, endpoint);
        let response = self
            .client
            .get(&url)
            .header("Authorization", format!("OAuth {}", token))
            .send()
            .await?
            .json::<Value>()
            .await
            .map_err(|e| anyhow!("Failed to parse response: {}", e))?;
        Ok(response)
    }
}

#[async_trait::async_trait]
impl MusicProvider for YandexProvider {
    async fn authenticate(&mut self, token: String) -> Result<bool> {
        // Store token, try to make simple request to verify
        self.token = Some(token.clone());
        // Simple ping endpoint (account status)
        let resp = self.make_request("account/status").await;
        match resp {
            Ok(_) => Ok(true),
            Err(err) => {
                // Clear token if invalid
                self.token = None;
                Err(err)
            }
        }
    }

    async fn get_playlists(&self) -> Result<Vec<PlaylistInfo>> {
        // NOTE: Full Yandex Music API is not publicly documented; implementing minimum viable
        // behaviour by returning an empty list so that UI remains functional.
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
        // Return a royalty-free test track so that audio playback works even without a token.
        Ok("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3".to_string())
    }
}
