// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod audio;
mod config;
mod providers;
mod types;

use std::sync::Arc;
use tauri::WindowEvent;

#[cfg(feature = "system-tray")]
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use tokio::sync::Mutex;

use crate::config::AppConfig;
use crate::types::ProviderType;
use audio::AudioManager;
use providers::ProviderManager;
use types::*;

// Глобальное состояние приложения
pub struct AppState {
    pub audio_manager: Arc<Mutex<AudioManager>>,
    pub provider_manager: Arc<Mutex<ProviderManager>>,
    pub config: Arc<Mutex<AppConfig>>,
}

// Tauri команды
#[tauri::command]
async fn authenticate_provider(
    state: tauri::State<'_, AppState>,
    provider: ProviderType,
    token: String,
) -> Result<bool, String> {
    let mut manager = state.provider_manager.lock().await;
    manager
        .authenticate(provider, token)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_playlists(
    state: tauri::State<'_, AppState>,
    provider: ProviderType,
) -> Result<Vec<PlaylistInfo>, String> {
    let manager = state.provider_manager.lock().await;
    manager
        .get_playlists(provider)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_playlist_tracks(
    state: tauri::State<'_, AppState>,
    provider: ProviderType,
    playlist_id: String,
) -> Result<Vec<TrackInfo>, String> {
    let manager = state.provider_manager.lock().await;
    manager
        .get_playlist_tracks(provider, playlist_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_liked_tracks(
    state: tauri::State<'_, AppState>,
    provider: ProviderType,
) -> Result<Vec<TrackInfo>, String> {
    let manager = state.provider_manager.lock().await;
    manager
        .get_liked_tracks(provider)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_my_wave(
    state: tauri::State<'_, AppState>,
    provider: ProviderType,
) -> Result<Vec<TrackInfo>, String> {
    let manager = state.provider_manager.lock().await;
    manager
        .get_my_wave(provider)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn search_tracks(
    state: tauri::State<'_, AppState>,
    provider: ProviderType,
    query: String,
) -> Result<Vec<TrackInfo>, String> {
    let manager = state.provider_manager.lock().await;
    manager
        .search_tracks(provider, query)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn play_track(
    state: tauri::State<'_, AppState>,
    track: TrackInfo,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let mut audio_manager = state.audio_manager.lock().await;
    let provider_manager = state.provider_manager.lock().await;

    // Получаем URL трека
    let stream_url = provider_manager
        .get_track_url(track.provider, track.id.clone())
        .await
        .map_err(|e| e.to_string())?;

    audio_manager
        .play_track(stream_url, track, app_handle)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn pause_playback(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut audio_manager = state.audio_manager.lock().await;
    audio_manager.pause().map_err(|e| e.to_string())
}

#[tauri::command]
async fn resume_playback(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut audio_manager = state.audio_manager.lock().await;
    audio_manager.resume().map_err(|e| e.to_string())
}

#[tauri::command]
async fn stop_playback(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let mut audio_manager = state.audio_manager.lock().await;
    audio_manager.stop().map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_volume(state: tauri::State<'_, AppState>, volume: f32) -> Result<(), String> {
    let mut audio_manager = state.audio_manager.lock().await;
    audio_manager.set_volume(volume).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_current_track(state: tauri::State<'_, AppState>) -> Result<Option<TrackInfo>, String> {
    let audio_manager = state.audio_manager.lock().await;
    Ok(audio_manager.get_current_track())
}

#[tauri::command]
async fn get_playback_state(state: tauri::State<'_, AppState>) -> Result<PlaybackState, String> {
    let audio_manager = state.audio_manager.lock().await;
    Ok(audio_manager.get_playback_state())
}

#[tauri::command]
async fn get_volume(state: tauri::State<'_, AppState>) -> Result<f32, String> {
    let audio_manager = state.audio_manager.lock().await;
    Ok(audio_manager.get_volume())
}

#[tauri::command]
async fn set_queue(
    state: tauri::State<'_, AppState>,
    queue: Vec<TrackInfo>,
    start_index: usize,
) -> Result<(), String> {
    let mut audio_manager = state.audio_manager.lock().await;
    audio_manager.set_queue(queue, start_index);
    Ok(())
}

#[tauri::command]
async fn next_track(state: tauri::State<'_, AppState>) -> Result<Option<TrackInfo>, String> {
    let mut audio_manager = state.audio_manager.lock().await;
    Ok(audio_manager.next_track().cloned())
}

#[tauri::command]
async fn previous_track(state: tauri::State<'_, AppState>) -> Result<Option<TrackInfo>, String> {
    let mut audio_manager = state.audio_manager.lock().await;
    Ok(audio_manager.previous_track().cloned())
}

#[tauri::command]
async fn save_config(state: tauri::State<'_, AppState>) -> Result<(), String> {
    let config = state.config.lock().await;
    config.save().map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_config(state: tauri::State<'_, AppState>) -> Result<AppConfig, String> {
    let config = state.config.lock().await;
    Ok(config.clone())
}

#[cfg(feature = "system-tray")]
fn create_system_tray() -> SystemTray {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

#[cfg(feature = "system-tray")]
fn handle_system_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            if let Some(window) = app.get_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "quit" => {
                app.exit(0);
            }
            "hide" => {
                if let Some(window) = app.get_window("main") {
                    let _ = window.hide();
                }
            }
            "show" => {
                if let Some(window) = app.get_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
            _ => {}
        },
        _ => {}
    }
}

fn main() {
    let audio_manager = Arc::new(Mutex::new(
        AudioManager::new().expect("Failed to create AudioManager"),
    ));
    let provider_manager = Arc::new(Mutex::new(ProviderManager::new()));
    let config = Arc::new(Mutex::new(AppConfig::load().unwrap_or_default()));

    let app_state = AppState {
        audio_manager,
        provider_manager,
        config,
    };

    let mut builder = tauri::Builder::default().manage(app_state);

    #[cfg(feature = "system-tray")]
    {
        builder = builder
            .system_tray(create_system_tray())
            .on_system_tray_event(handle_system_tray_event);
    }

    builder
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                let _ = event.window().hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            authenticate_provider,
            get_playlists,
            get_playlist_tracks,
            get_liked_tracks,
            get_my_wave,
            search_tracks,
            play_track,
            pause_playback,
            resume_playback,
            stop_playback,
            set_volume,
            get_current_track,
            get_playback_state,
            get_volume,
            set_queue,
            next_track,
            previous_track,
            save_config,
            load_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
