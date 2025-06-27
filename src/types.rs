use serde::{Deserialize, Serialize};
use std::time::Duration;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackInfo {
    pub id: String,
    pub title: String,
    pub artist: String,
    pub album: Option<String>,
    pub duration: Option<Duration>,
    pub provider: ProviderType,
    pub stream_url: Option<String>,
    pub artwork_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistInfo {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub track_count: u32,
    pub provider: ProviderType,
    pub artwork_url: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, Eq, Hash, PartialEq)]
pub enum ProviderType {
    Yandex,
    Spotify,
    SoundCloud,
    LastFm,
}

impl std::fmt::Display for ProviderType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ProviderType::Yandex => write!(f, "Yandex"),
            ProviderType::Spotify => write!(f, "Spotify"),
            ProviderType::SoundCloud => write!(f, "SoundCloud"),
            ProviderType::LastFm => write!(f, "Last.fm"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum PlaybackState {
    Stopped,
    Playing,
    Paused,
    Loading,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerState {
    pub current_track: Option<TrackInfo>,
    pub state: PlaybackState,
    pub position: Duration,
    pub volume: f32,
    pub queue: Vec<TrackInfo>,
    pub current_index: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthInfo {
    pub provider: ProviderType,
    pub token: String,
    pub expires_at: Option<chrono::DateTime<chrono::Utc>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub tracks: Vec<TrackInfo>,
    pub playlists: Vec<PlaylistInfo>,
    pub total_results: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiError {
    pub code: u32,
    pub message: String,
}

impl std::fmt::Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "API Error {}: {}", self.code, self.message)
    }
}

impl std::error::Error for ApiError {}
