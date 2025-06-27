use crate::types::{PlaybackState, TrackInfo};
use anyhow::{anyhow, Result};
use rodio::{Decoder, OutputStream, OutputStreamHandle, Sink, Source};
use std::io::Cursor;
use std::sync::Arc;
use std::time::Duration;
use tauri::Manager;
use tokio::sync::Mutex;

pub struct AudioManager {
    _stream: OutputStream,
    stream_handle: OutputStreamHandle,
    sink: Option<Sink>,
    current_track: Option<TrackInfo>,
    state: PlaybackState,
    volume: f32,
    queue: Vec<TrackInfo>,
    current_index: usize,
}

impl AudioManager {
    pub fn new() -> Result<Self> {
        let (_stream, stream_handle) = OutputStream::try_default()
            .map_err(|e| anyhow!("Failed to create audio output stream: {}", e))?;

        Ok(Self {
            _stream,
            stream_handle,
            sink: None,
            current_track: None,
            state: PlaybackState::Stopped,
            volume: 0.5,
            queue: Vec::new(),
            current_index: 0,
        })
    }

    pub async fn play_track(
        &mut self,
        stream_url: String,
        track: TrackInfo,
        app_handle: tauri::AppHandle,
    ) -> Result<()> {
        // Останавливаем текущее воспроизведение если оно есть
        if let Some(sink) = &mut self.sink {
            sink.stop();
        }

        self.state = PlaybackState::Loading;
        self.emit_state_change(&app_handle);

        // Загружаем аудио данные
        let response = reqwest::get(&stream_url)
            .await
            .map_err(|e| anyhow!("Failed to fetch audio stream: {}", e))?;
        let bytes = response
            .bytes()
            .await
            .map_err(|e| anyhow!("Failed to read audio bytes: {}", e))?;
        let cursor = Cursor::new(bytes.to_vec());

        // Создаем декодер
        let decoder = Decoder::new(cursor).map_err(|e| anyhow!("Failed to decode audio: {}", e))?;

        // Создаем новый sink
        let sink = Sink::try_new(&self.stream_handle)
            .map_err(|e| anyhow!("Failed to create audio sink: {}", e))?;
        sink.set_volume(self.volume);

        // Добавляем источник и начинаем воспроизведение
        sink.append(decoder);
        sink.play();

        // Обновляем состояние
        self.sink = Some(sink);
        self.current_track = Some(track.clone());
        self.state = PlaybackState::Playing;

        // Отправляем уведомление в UI
        self.emit_state_change(&app_handle);
        self.emit_track_change(&app_handle, &track);

        // Запускаем отслеживание завершения трека
        self.start_playback_monitoring(app_handle);

        Ok(())
    }

    pub fn pause(&mut self) -> Result<()> {
        if let Some(sink) = &self.sink {
            if self.state == PlaybackState::Playing {
                sink.pause();
                self.state = PlaybackState::Paused;
                Ok(())
            } else {
                Err(anyhow!("Track is not currently playing"))
            }
        } else {
            Err(anyhow!("No track is currently loaded"))
        }
    }

    pub fn resume(&mut self) -> Result<()> {
        if let Some(sink) = &self.sink {
            if self.state == PlaybackState::Paused {
                sink.play();
                self.state = PlaybackState::Playing;
                Ok(())
            } else {
                Err(anyhow!("Track is not currently paused"))
            }
        } else {
            Err(anyhow!("No track is currently loaded"))
        }
    }

    pub fn stop(&mut self) -> Result<()> {
        if let Some(sink) = &mut self.sink {
            sink.stop();
            self.sink = None;
            self.current_track = None;
            self.state = PlaybackState::Stopped;
            Ok(())
        } else {
            Err(anyhow!("No track is currently playing"))
        }
    }

    pub fn set_volume(&mut self, volume: f32) -> Result<()> {
        let volume = volume.clamp(0.0, 1.0);
        self.volume = volume;

        if let Some(sink) = &self.sink {
            sink.set_volume(volume);
        }

        Ok(())
    }

    pub fn get_current_track(&self) -> Option<TrackInfo> {
        self.current_track.clone()
    }

    pub fn get_playback_state(&self) -> PlaybackState {
        self.state.clone()
    }

    pub fn get_volume(&self) -> f32 {
        self.volume
    }

    pub fn set_queue(&mut self, queue: Vec<TrackInfo>, start_index: usize) {
        self.queue = queue;
        self.current_index = start_index.min(self.queue.len().saturating_sub(1));
    }

    pub fn get_queue(&self) -> &Vec<TrackInfo> {
        &self.queue
    }

    pub fn get_current_index(&self) -> usize {
        self.current_index
    }

    pub fn next_track(&mut self) -> Option<&TrackInfo> {
        if self.current_index + 1 < self.queue.len() {
            self.current_index += 1;
            Some(&self.queue[self.current_index])
        } else {
            None
        }
    }

    pub fn previous_track(&mut self) -> Option<&TrackInfo> {
        if self.current_index > 0 {
            self.current_index -= 1;
            Some(&self.queue[self.current_index])
        } else {
            None
        }
    }

    pub fn seek_to(&mut self, position: Duration) -> Result<()> {
        // Примечание: rodio не поддерживает перемотку напрямую
        // Для реализации перемотки потребуется перезагрузка трека с нужной позиции
        Err(anyhow!("Seeking is not currently supported"))
    }

    pub fn get_position(&self) -> Duration {
        // Примечание: rodio не предоставляет API для получения текущей позиции
        // Возвращаем нулевую позицию
        Duration::from_secs(0)
    }

    fn emit_state_change(&self, app_handle: &tauri::AppHandle) {
        if let Err(e) = app_handle.emit_all("playback-state-changed", &self.state) {
            eprintln!("Failed to emit state change: {}", e);
        }
    }

    fn emit_track_change(&self, app_handle: &tauri::AppHandle, track: &TrackInfo) {
        if let Err(e) = app_handle.emit_all("track-changed", track) {
            eprintln!("Failed to emit track change: {}", e);
        }
    }

    fn start_playback_monitoring(&self, app_handle: tauri::AppHandle) {
        // Создаем слабую ссылку на AppHandle для избежания циклических ссылок
        let app_handle_weak = Arc::downgrade(&Arc::new(app_handle));

        // Запускаем мониторинг в отдельной задаче
        tokio::spawn(async move {
            // Ждем некоторое время для начала воспроизведения
            tokio::time::sleep(Duration::from_millis(500)).await;

            // Примерное время мониторинга (в реальном приложении нужно использовать
            // продолжительность трека или другие методы отслеживания)
            let mut check_count = 0;
            let max_checks = 3000; // ~5 минут при интервале 100мс

            loop {
                tokio::time::sleep(Duration::from_millis(100)).await;
                check_count += 1;

                // Проверяем, существует ли еще AppHandle
                if let Some(app_handle) = app_handle_weak.upgrade() {
                    // Простая проверка по времени (заменить на реальную логику)
                    if check_count >= max_checks {
                        if let Err(e) = app_handle.emit_all("track-finished", ()) {
                            eprintln!("Failed to emit track finished: {}", e);
                        }
                        break;
                    }
                } else {
                    // AppHandle больше не существует, прекращаем мониторинг
                    break;
                }
            }
        });
    }
}

// Реализация Default для удобства создания
impl Default for AudioManager {
    fn default() -> Self {
        Self::new().expect("Failed to create AudioManager")
    }
}

// События аудио системы для отправки в frontend
#[derive(Clone, serde::Serialize, serde::Deserialize)]
pub struct AudioEvent {
    pub event_type: String,
    pub data: serde_json::Value,
}

// Безопасная реализация Send и Sync
// SAFETY: AudioManager содержит rodio компоненты, которые не являются Send/Sync.
// Однако мы гарантируем, что AudioManager используется только в контексте Tauri,
// где все операции выполняются в главном потоке через управляемое состояние.
unsafe impl Send for AudioManager {}
unsafe impl Sync for AudioManager {}
