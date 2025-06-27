use crate::types::{PlaylistInfo, ProviderType, TrackInfo};
use anyhow::Result;

pub mod lastfm;
pub mod soundcloud;
pub mod spotify;
pub mod yandex;

use lastfm::LastFmProvider;
use soundcloud::SoundCloudProvider;
use spotify::SpotifyProvider;
use yandex::YandexProvider;

#[async_trait::async_trait]
pub trait MusicProvider: Send + Sync {
    async fn authenticate(&mut self, token: String) -> Result<bool>;
    async fn get_playlists(&self) -> Result<Vec<PlaylistInfo>>;
    async fn get_playlist_tracks(&self, playlist_id: String) -> Result<Vec<TrackInfo>>;
    async fn get_liked_tracks(&self) -> Result<Vec<TrackInfo>>;
    async fn get_my_wave(&self) -> Result<Vec<TrackInfo>>;
    async fn search_tracks(&self, query: String) -> Result<Vec<TrackInfo>>;
    async fn get_track_url(&self, track_id: String) -> Result<String>;
}

pub struct ProviderManager {
    yandex: YandexProvider,
    spotify: SpotifyProvider,
    soundcloud: SoundCloudProvider,
    lastfm: LastFmProvider,
}

impl ProviderManager {
    pub fn new() -> Self {
        Self {
            yandex: YandexProvider::new(),
            spotify: SpotifyProvider::new(),
            soundcloud: SoundCloudProvider::new(),
            lastfm: LastFmProvider::new(),
        }
    }

    pub async fn authenticate(&mut self, provider: ProviderType, token: String) -> Result<bool> {
        match provider {
            ProviderType::Yandex => self.yandex.authenticate(token).await,
            ProviderType::Spotify => self.spotify.authenticate(token).await,
            ProviderType::SoundCloud => self.soundcloud.authenticate(token).await,
            ProviderType::LastFm => self.lastfm.authenticate(token).await,
        }
    }

    pub async fn get_playlists(&self, provider: ProviderType) -> Result<Vec<PlaylistInfo>> {
        match provider {
            ProviderType::Yandex => self.yandex.get_playlists().await,
            ProviderType::Spotify => self.spotify.get_playlists().await,
            ProviderType::SoundCloud => self.soundcloud.get_playlists().await,
            ProviderType::LastFm => self.lastfm.get_playlists().await,
        }
    }

    pub async fn get_playlist_tracks(
        &self,
        provider: ProviderType,
        playlist_id: String,
    ) -> Result<Vec<TrackInfo>> {
        match provider {
            ProviderType::Yandex => self.yandex.get_playlist_tracks(playlist_id).await,
            ProviderType::Spotify => self.spotify.get_playlist_tracks(playlist_id).await,
            ProviderType::SoundCloud => self.soundcloud.get_playlist_tracks(playlist_id).await,
            ProviderType::LastFm => self.lastfm.get_playlist_tracks(playlist_id).await,
        }
    }

    pub async fn get_liked_tracks(&self, provider: ProviderType) -> Result<Vec<TrackInfo>> {
        match provider {
            ProviderType::Yandex => self.yandex.get_liked_tracks().await,
            ProviderType::Spotify => self.spotify.get_liked_tracks().await,
            ProviderType::SoundCloud => self.soundcloud.get_liked_tracks().await,
            ProviderType::LastFm => self.lastfm.get_liked_tracks().await,
        }
    }

    pub async fn get_my_wave(&self, provider: ProviderType) -> Result<Vec<TrackInfo>> {
        match provider {
            ProviderType::Yandex => self.yandex.get_my_wave().await,
            ProviderType::Spotify => self.spotify.get_my_wave().await,
            ProviderType::SoundCloud => self.soundcloud.get_my_wave().await,
            ProviderType::LastFm => self.lastfm.get_my_wave().await,
        }
    }

    pub async fn search_tracks(
        &self,
        provider: ProviderType,
        query: String,
    ) -> Result<Vec<TrackInfo>> {
        match provider {
            ProviderType::Yandex => self.yandex.search_tracks(query).await,
            ProviderType::Spotify => self.spotify.search_tracks(query).await,
            ProviderType::SoundCloud => self.soundcloud.search_tracks(query).await,
            ProviderType::LastFm => self.lastfm.search_tracks(query).await,
        }
    }

    pub async fn get_track_url(&self, provider: ProviderType, track_id: String) -> Result<String> {
        match provider {
            ProviderType::Yandex => self.yandex.get_track_url(track_id).await,
            ProviderType::Spotify => self.spotify.get_track_url(track_id).await,
            ProviderType::SoundCloud => self.soundcloud.get_track_url(track_id).await,
            ProviderType::LastFm => self.lastfm.get_track_url(track_id).await,
        }
    }
}
