#!/usr/bin/env python3
"""
Yandex Music Player для Arch Linux
Музыкальный плеер с использованием yandex-music API
"""

import sys
import os
import json
import threading
import time
from typing import Optional, List, Dict, Any
from pathlib import Path
import logging

# GUI библиотеки
try:
    from PyQt5.QtWidgets import *
    from PyQt5.QtCore import *
    from PyQt5.QtGui import *
    from PyQt5.QtMultimedia import *
    from PyQt5.QtMultimediaWidgets import *
except ImportError:
    print("Установите PyQt5: sudo pacman -S python-pyqt5")
    sys.exit(1)

# Yandex Music API
try:
    from yandex_music import Client, Track, Playlist
except ImportError:
    print("Установите yandex-music: pip install yandex-music")
    sys.exit(1)

# Библиотека spotipy
try:
    import spotipy
    from spotipy.oauth2 import SpotifyOAuth, SpotifyClientCredentials
    from types import SimpleNamespace
except ImportError:
    spotipy = None  # Будем проверять при попытке использования

# Настройка логирования  
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ======= Абстракция для разных музыкальных сервисов =======

class AbstractMusicAPI:
    """Базовый класс для музыкальных API. Реализует минимальный интерфейс,
    который используют остальные части программы. Дочерние классы должны
    переопределить методы и вернуть корректные данные. По-умолчанию методы
    возвращают пустые значения, чтобы приложение продолжило работать даже
    при отсутствии реализации."""

    def authenticate(self, token: str) -> bool:
        return True

    # Следующие методы должны возвращать списки объектов-треков либо плейлистов.
    # Конкретная реализация зависит от сервиса.
    def get_my_wave(self):
        return []

    def get_liked_tracks(self):
        return []

    def get_playlists(self):
        return []

    def search(self, query: str, type_: str = "track"):
        return []

    def download_track(self, track, path: str) -> bool:
        return False

class StubMusicAPI(AbstractMusicAPI):
    """Заглушка для сервисов, которые пока не реализованы."""

    def authenticate(self, token: str) -> bool:
        logger.warning("StubMusicAPI: аутентификация не требуется / не реализована")
        return True

# ======= Реализация Yandex Music (бывшая YandexMusicAPI) =======

class YandexMusicAPI(AbstractMusicAPI):
    """Обертка для работы с Yandex Music API"""
    
    def __init__(self, token: Optional[str] = None):
        self.client = None
        self.token = token
        self.current_user = None
        
    def authenticate(self, token: str) -> bool:
        """Авторизация с токеном"""
        try:
            self.token = token
            self.client = Client(token).init()
            self.current_user = self.client.me()
            logger.info(f"Авторизован как: {self.current_user.account.display_name}")
            return True
        except Exception as e:
            logger.error(f"Ошибка авторизации: {e}")
            return False
    
    def get_my_wave(self) -> List[Track]:
        """Получить треки из Моей Волны"""
        if not self.client:
            return []
        try:
            rotor_info = self.client.rotor_account_status()
            station = self.client.rotor_stations_list()[0]  # Моя Волна
            dashboard = self.client.rotor_stations_dashboard()
            return dashboard.stations[0].get_tracks()
        except Exception as e:
            logger.error(f"Ошибка получения Моей Волны: {e}")
            return []
    
    def get_liked_tracks(self) -> List[Track]:
        """Получить понравившиеся треки"""
        if not self.client:
            return []
        try:
            return self.client.users_likes_tracks()
        except Exception as e:
            logger.error(f"Ошибка получения понравившихся треков: {e}")
            return []
    
    def get_playlists(self) -> List[Playlist]:
        """Получить плейлисты пользователя"""
        if not self.client:
            return []
        try:
            return self.client.users_playlists_list()
        except Exception as e:
            logger.error(f"Ошибка получения плейлистов: {e}")
            return []
    
    def search(self, query: str, type_: str = 'track') -> List:
        """Поиск по каталогу"""
        if not self.client:
            return []
        try:
            result = self.client.search(query, type_=type_)
            if type_ == 'track':
                return result.tracks.results if result.tracks else []
            elif type_ == 'playlist':
                return result.playlists.results if result.playlists else []
            elif type_ == 'artist':
                return result.artists.results if result.artists else []
            return []
        except Exception as e:
            logger.error(f"Ошибка поиска: {e}")
            return []
    
    def download_track(self, track: Track, path: str) -> bool:
        """Скачать трек"""
        try:
            track.download(path)
            return True
        except Exception as e:
            logger.error(f"Ошибка скачивания трека: {e}")
            return False

# ======= Реализация Spotify =======

class SpotifyTrack:
    """Мини-обёртка для работы с треками Spotify в остальной части UI"""

    def __init__(self, track_json: dict):
        self._json = track_json
        self.id = track_json.get("id")
        self.title = track_json.get("name")
        self.duration_ms = track_json.get("duration_ms", 0)
        self.artists = [SimpleNamespace(name=a["name"]) for a in track_json.get("artists", [])]
        self.preview_url = track_json.get("preview_url")  # 30-секундный превью-файл

    # Соответствие интерфейсу yandex_music.Track
    def get_download_info(self):
        if self.preview_url:
            return [SimpleNamespace(get_direct_link=lambda: self.preview_url)]
        return []


class SpotifyMusicAPI(AbstractMusicAPI):
    """Работа со Spotify Web API через spotipy. Использует implicit flow: 
    пользователь самостоятельно получает токен (например, на https://developer.spotify.com/console) 
    и вставляет в программу, как и в случае с Яндекс.Музыкой."""

    def __init__(self):
        self.sp = None

    def authenticate(self, token: str) -> bool:
        if spotipy is None:
            logger.error("Не установлена библиотека spotipy (pip install spotipy)")
            return False
        try:
            self.sp = spotipy.Spotify(auth=token)
            me = self.sp.current_user()
            logger.info(f"Spotify: авторизован как {me['display_name']}")
            return True
        except Exception as e:
            logger.error(f"Spotify: ошибка авторизации: {e}")
            return False

    # ---- Данные ----

    def _convert_tracks(self, items):
        return [SpotifyTrack(t) for t in items]

    def get_my_wave(self):
        """Используем рекомендации на основе топ-треков пользователя"""
        try:
            top_tracks = self.sp.current_user_top_tracks(limit=5, time_range='medium_term')
            seed_tracks = [t['id'] for t in top_tracks['items']]
            rec = self.sp.recommendations(seed_tracks=seed_tracks, limit=20)
            return self._convert_tracks([t for t in rec['tracks']])
        except Exception as e:
            logger.error(f"Spotify: ошибка recommendations: {e}")
            return []

    def get_liked_tracks(self):
        try:
            results = self.sp.current_user_saved_tracks(limit=50)
            return self._convert_tracks([item['track'] for item in results['items']])
        except Exception as e:
            logger.error(f"Spotify: ошибка liked_tracks: {e}")
            return []

    def get_playlists(self):
        try:
            pls = self.sp.current_user_playlists(limit=50)['items']
            # Каждый объект-плейлист имеет метод tracks; вернём json напрямую
            return pls
        except Exception as e:
            logger.error(f"Spotify: ошибка playlists: {e}")
            return []

    def search(self, query: str, type_: str = 'track'):
        try:
            results = self.sp.search(q=query, type=type_, limit=50)
            if type_ == 'track':
                return self._convert_tracks([t for t in results['tracks']['items']])
            elif type_ == 'artist':
                return results['artists']['items']
            elif type_ == 'playlist':
                return results['playlists']['items']
            return []
        except Exception as e:
            logger.error(f"Spotify: ошибка поиска: {e}")
            return []

# ======= Реализация SoundCloud =======

try:
    import soundcloud
except ImportError:
    soundcloud = None


class SoundCloudTrack:
    def __init__(self, track_json):
        from types import SimpleNamespace
        self._json = track_json
        self.id = track_json.get('id')
        self.title = track_json.get('title')
        self.duration_ms = track_json.get('duration', 0)
        self.artists = [SimpleNamespace(name=track_json.get('user', {}).get('username', ''))]
        self.stream_url = track_json.get('stream_url')

    def get_download_info(self):
        if self.stream_url:
            # stream_url уже содержит client_id, если запрошено через /stream
            return [SimpleNamespace(get_direct_link=lambda: self.stream_url)]
        return []


class SoundCloudMusicAPI(AbstractMusicAPI):
    """Работа с SoundCloud API. Нужен client_id (можно получить на dev.soundcloud.com)."""

    def __init__(self):
        self.client = None

    def authenticate(self, client_id: str) -> bool:
        if soundcloud is None:
            logger.error("Не установлена библиотека soundcloud (pip install soundcloud)")
            return False
        try:
            self.client = soundcloud.Client(client_id=client_id)
            logger.info("SoundCloud: клиент инициализирован")
            return True
        except Exception as e:
            logger.error(f"SoundCloud: ошибка инициализации: {e}")
            return False

    def _convert_tracks(self, items):
        return [SoundCloudTrack(t) for t in items]

    def search(self, query: str, type_: str = 'track'):
        try:
            if type_ == 'track':
                res = self.client.get('/tracks', q=query, limit=50)
                return self._convert_tracks(res)
            return []
        except Exception as e:
            logger.error(f"SoundCloud: ошибка поиска: {e}")
            return []

    def get_playlists(self):
        return []  # Требует OAuth для приватных плейлистов

# ======= Реализация Last.fm =======

try:
    import pylast
except ImportError:
    pylast = None


class LastFmTrack:
    def __init__(self, track_obj):
        from types import SimpleNamespace
        self.track_obj = track_obj
        self.id = track_obj.get_mbid() or track_obj.title
        self.title = track_obj.title
        self.duration_ms = (track_obj.get_duration() or 0)
        self.artists = [SimpleNamespace(name=track_obj.artist.name)]

    def get_download_info(self):
        return []  # Last.fm не предоставляет аудио


class LastFMMusicAPI(AbstractMusicAPI):
    """Last.fm API через pylast. audio streaming не поддерживается, используется только метаданные."""

    def __init__(self):
        self.network = None

    def authenticate(self, api_key: str) -> bool:
        if pylast is None:
            logger.error("Не установлена библиотека pylast (pip install pylast)")
            return False
        try:
            self.network = pylast.LastFMNetwork(api_key=api_key)
            logger.info("Last.fm: клиент инициализирован")
            return True
        except Exception as e:
            logger.error(f"Last.fm: ошибка: {e}")
            return False

    def search(self, query: str, type_: str = 'track'):
        try:
            if type_ == 'track':
                res = self.network.search_for_track(None, query)
                tracks = res.get_next_page()
                return [LastFmTrack(t) for t in tracks]
            return []
        except Exception as e:
            logger.error(f"Last.fm: ошибка поиска: {e}")
            return []

class PlaylistWidget(QListWidget):
    """Виджет для отображения плейлистов"""
    
    playlist_selected = pyqtSignal(dict)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.api = None
        self.playlists = []
        
    def set_api(self, api: Any):
        self.api = api
        
    def load_playlists(self):
        """Загрузить плейлисты"""
        if not self.api:
            return
            
        self.clear()
        self.playlists = self.api.get_playlists()
        
        # Добавить специальные плейлисты
        special_items = [
            {"name": "🌊 Моя Волна", "type": "wave"},
            {"name": "❤️ Мне нравится", "type": "liked"}
        ]
        
        for item in special_items:
            list_item = QListWidgetItem(item["name"])
            list_item.setData(Qt.UserRole, item)
            self.addItem(list_item)
        
        # Добавить пользовательские плейлисты
        for playlist in self.playlists:
            item_text = f"📁 {playlist.title} ({playlist.track_count} треков)"
            list_item = QListWidgetItem(item_text)
            list_item.setData(Qt.UserRole, {
                "name": playlist.title,
                "type": "playlist",
                "playlist": playlist
            })
            self.addItem(list_item)
    
    def mousePressEvent(self, event):
        super().mousePressEvent(event)
        item = self.currentItem()
        if item:
            data = item.data(Qt.UserRole)
            self.playlist_selected.emit(data)

class TrackListWidget(QListWidget):
    """Виджет для отображения треков"""
    
    track_selected = pyqtSignal(dict)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.tracks = []
        
    def load_tracks(self, tracks: List[Track]):
        """Загрузить треки"""
        self.clear()
        self.tracks = tracks
        
        for track in tracks:
            if hasattr(track, 'track'):
                track = track.track  # Для TrackShort объектов
                
            artist_names = ", ".join([artist.name for artist in track.artists])
            item_text = f"🎵 {track.title} - {artist_names}"
            
            list_item = QListWidgetItem(item_text)
            list_item.setData(Qt.UserRole, {
                "track": track,
                "title": track.title,
                "artist": artist_names,
                "duration": track.duration_ms // 1000 if track.duration_ms else 0
            })
            self.addItem(list_item)
    
    def mousePressEvent(self, event):
        super().mousePressEvent(event)
        item = self.currentItem()
        if item:
            data = item.data(Qt.UserRole)
            self.track_selected.emit(data)

class PlayerControls(QWidget):
    """Виджет управления плеером"""
    
    play_pause_clicked = pyqtSignal()
    prev_clicked = pyqtSignal()
    next_clicked = pyqtSignal()
    volume_changed = pyqtSignal(int)
    position_changed = pyqtSignal(int)
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.init_ui()
        
    def init_ui(self):
        layout = QHBoxLayout()
        
        # Кнопки управления
        self.prev_btn = QPushButton("⏮")
        self.play_pause_btn = QPushButton("▶")
        self.next_btn = QPushButton("⏭")
        
        self.prev_btn.clicked.connect(self.prev_clicked.emit)
        self.play_pause_btn.clicked.connect(self.play_pause_clicked.emit)
        self.next_btn.clicked.connect(self.next_clicked.emit)
        
        # Слайдер позиции
        self.position_slider = QSlider(Qt.Horizontal)
        self.position_slider.valueChanged.connect(self.position_changed.emit)
        
        # Время
        self.time_label = QLabel("00:00 / 00:00")
        
        # Громкость
        self.volume_slider = QSlider(Qt.Horizontal)
        self.volume_slider.setMaximum(100)
        self.volume_slider.setValue(50)
        self.volume_slider.valueChanged.connect(self.volume_changed.emit)
        
        # Компоновка
        layout.addWidget(self.prev_btn)
        layout.addWidget(self.play_pause_btn)
        layout.addWidget(self.next_btn)
        layout.addWidget(self.position_slider, 1)
        layout.addWidget(self.time_label)
        layout.addWidget(QLabel("🔊"))
        layout.addWidget(self.volume_slider)
        
        self.setLayout(layout)
    
    def set_playing(self, playing: bool):
        self.play_pause_btn.setText("⏸" if playing else "▶")
    
    def set_position(self, position: int, duration: int):
        self.position_slider.setMaximum(duration)
        self.position_slider.setValue(position)
        
        pos_min, pos_sec = divmod(position, 60)
        dur_min, dur_sec = divmod(duration, 60)
        self.time_label.setText(f"{pos_min:02d}:{pos_sec:02d} / {dur_min:02d}:{dur_sec:02d}")

class SystemTrayIcon(QSystemTrayIcon):
    """Иконка в системном трее"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setIcon(QIcon.fromTheme("audio-player"))
        self.setToolTip("Yandex Music Player")
        
        # Меню трея
        menu = QMenu()
        
        show_action = QAction("Показать", self)
        show_action.triggered.connect(parent.show if parent else None)
        menu.addAction(show_action)
        
        quit_action = QAction("Выход", self)
        quit_action.triggered.connect(QApplication.quit)
        menu.addAction(quit_action)
        
        self.setContextMenu(menu)
        self.activated.connect(self.on_tray_activated)
    
    def on_tray_activated(self, reason):
        if reason == QSystemTrayIcon.DoubleClick:
            parent = self.parent()
            if parent:
                parent.show()
                parent.raise_()
                parent.activateWindow()

class AuthDialog(QDialog):
    """Диалог авторизации"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Авторизация Yandex Music")
        self.setModal(True)
        self.init_ui()
        
    def init_ui(self):
        layout = QVBoxLayout()
        
        # Инструкция
        instruction = QLabel("""
        Для получения токена:
        1. Перейдите на music.yandex.ru
        2. Откройте инструменты разработчика (F12)
        3. Во вкладке Network найдите запрос с заголовком Authorization
        4. Скопируйте значение токена без "OAuth "
        """)
        instruction.setWordWrap(True)
        layout.addWidget(instruction)
        
        # Поле ввода токена
        self.token_input = QLineEdit()
        self.token_input.setPlaceholderText("Вставьте токен здесь...")
        self.token_input.setEchoMode(QLineEdit.Password)
        layout.addWidget(self.token_input)
        
        # Кнопки
        buttons = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addWidget(buttons)
        
        self.setLayout(layout)
    
    def get_token(self):
        return self.token_input.text().strip()

class MainWindow(QMainWindow):
    """Главное окно приложения"""
    
    def __init__(self):
        super().__init__()

        # --- Провайдеры ---
        self.settings = QSettings("YandexMusicPlayer", "Settings")
        self.current_provider = self.settings.value("provider", "Yandex")

        # Словарь доступных провайдеров
        self.PROVIDERS = {
            "Yandex": YandexMusicAPI,
            "Spotify": SpotifyMusicAPI,
            "Last.fm": LastFMMusicAPI,
            "SoundCloud": SoundCloudMusicAPI,
        }

        self.api = None  # будет установлен в set_provider

        self.player = QMediaPlayer()
        self.current_playlist = []
        self.current_index = 0
        self.is_playing = False
        
        # Системный трей
        self.tray_icon = SystemTrayIcon(self)
        
        self.init_ui()
        self.connect_signals()
        self.load_settings()
        
        # Проверить авторизацию
        if not self.check_auth():
            self.show_auth_dialog()
    
    def init_ui(self):
        self.setWindowTitle("Yandex Music Player")
        self.setGeometry(100, 100, 1000, 700)
        
        # Центральный виджет
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Основная компоновка
        main_layout = QHBoxLayout(central_widget)
        
        # Левая панель - плейлисты
        left_panel = QVBoxLayout()

        # Выбор источника
        left_panel.addWidget(QLabel("Источник"))
        self.provider_combo = QComboBox()
        self.provider_combo.addItems(self.PROVIDERS.keys())
        self.provider_combo.setCurrentText(self.current_provider)
        self.provider_combo.currentTextChanged.connect(self.on_provider_changed)
        left_panel.addWidget(self.provider_combo)

        left_panel.addWidget(QLabel("Плейлисты"))
        
        self.playlist_widget = PlaylistWidget()
        self.playlist_widget.set_api(self.api)
        left_panel.addWidget(self.playlist_widget)
        
        # Кнопка "Моя Волна"
        self.wave_btn = QPushButton("🌊 Моя Волна")
        self.wave_btn.setStyleSheet("QPushButton { background-color: #ffdb4d; font-weight: bold; }")
        self.wave_btn.clicked.connect(self.load_my_wave)
        left_panel.addWidget(self.wave_btn)
        
        left_widget = QWidget()
        left_widget.setLayout(left_panel)
        left_widget.setMaximumWidth(300)
        
        # Правая панель - треки
        right_panel = QVBoxLayout()
        
        # Поиск
        search_layout = QHBoxLayout()
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Поиск треков...")
        self.search_btn = QPushButton("🔍")
        self.search_btn.clicked.connect(self.search_tracks)
        self.search_input.returnPressed.connect(self.search_tracks)
        
        search_layout.addWidget(self.search_input)
        search_layout.addWidget(self.search_btn)
        right_panel.addLayout(search_layout)
        
        # Список треков
        right_panel.addWidget(QLabel("Треки"))
        self.track_list = TrackListWidget()
        right_panel.addWidget(self.track_list)
        
        # Управление плеером
        self.player_controls = PlayerControls()
        right_panel.addWidget(self.player_controls)
        
        right_widget = QWidget()
        right_widget.setLayout(right_panel)
        
        # Добавить в основную компоновку
        main_layout.addWidget(left_widget)
        main_layout.addWidget(right_widget, 1)
        
        # Меню
        self.create_menu()
        
        # Статус бар
        self.statusBar().showMessage("Готов к работе")
        
        # Показать иконку в трее
        self.tray_icon.show()

        # Установить провайдера после создания всех виджетов
        self.set_provider(self.current_provider)
    
    def create_menu(self):
        menubar = self.menuBar()
        
        # Файл
        file_menu = menubar.addMenu('Файл')
        
        auth_action = QAction('Авторизация', self)
        auth_action.triggered.connect(self.show_auth_dialog)
        file_menu.addAction(auth_action)
        
        file_menu.addSeparator()
        
        exit_action = QAction('Выход', self)
        exit_action.triggered.connect(QApplication.quit)
        file_menu.addAction(exit_action)
        
        # Справка
        help_menu = menubar.addMenu('Справка')
        
        about_action = QAction('О программе', self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)
    
    def connect_signals(self):
        # Плейлисты
        self.playlist_widget.playlist_selected.connect(self.on_playlist_selected)
        
        # Треки
        self.track_list.track_selected.connect(self.play_track)
        
        # Плеер
        self.player_controls.play_pause_clicked.connect(self.toggle_playback)
        self.player_controls.prev_clicked.connect(self.prev_track)
        self.player_controls.next_clicked.connect(self.next_track)
        self.player_controls.volume_changed.connect(self.player.setVolume)
        
        # События плеера
        self.player.stateChanged.connect(self.on_state_changed)
        self.player.positionChanged.connect(self.on_position_changed)
        self.player.durationChanged.connect(self.on_duration_changed)
    
    def check_auth(self) -> bool:
        """Проверить авторизацию"""
        token_key = f"{self.current_provider.lower()}_token"
        token = self.settings.value(token_key, "")
        if token:
            return self.api.authenticate(token)
        return False
    
    def show_auth_dialog(self):
        """Показать диалог авторизации"""
        dialog = AuthDialog(self)
        if dialog.exec_() == QDialog.Accepted:
            token = dialog.get_token()
            if token and self.api.authenticate(token):
                token_key = f"{self.current_provider.lower()}_token"
                self.settings.setValue(token_key, token)
                self.statusBar().showMessage("Авторизация успешна")
                self.playlist_widget.load_playlists()
            else:
                QMessageBox.warning(self, "Ошибка", "Неверный токен авторизации")
    
    def load_my_wave(self):
        """Загрузить Мою Волну"""
        try:
            tracks = self.api.get_my_wave()
            self.track_list.load_tracks(tracks)
            self.current_playlist = tracks
            self.statusBar().showMessage(f"Загружена Моя Волна: {len(tracks)} треков")
        except Exception as e:
            QMessageBox.warning(self, "Ошибка", f"Не удалось загрузить Мою Волну: {e}")
    
    def on_playlist_selected(self, data: dict):
        """Обработка выбора плейлиста"""
        playlist_type = data.get("type")
        
        if playlist_type == "wave":
            self.load_my_wave()
        elif playlist_type == "liked":
            try:
                tracks = self.api.get_liked_tracks()
                self.track_list.load_tracks(tracks)
                self.current_playlist = tracks
                self.statusBar().showMessage(f"Загружены понравившиеся: {len(tracks)} треков")
            except Exception as e:
                QMessageBox.warning(self, "Ошибка", f"Не удалось загрузить понравившиеся: {e}")
        elif playlist_type == "playlist":
            try:
                playlist = data["playlist"]
                tracks = playlist.fetch_tracks()
                self.track_list.load_tracks(tracks)
                self.current_playlist = tracks
                self.statusBar().showMessage(f"Загружен плейлист: {playlist.title}")
            except Exception as e:
                QMessageBox.warning(self, "Ошибка", f"Не удалось загрузить плейлист: {e}")
    
    def search_tracks(self):
        """Поиск треков"""
        query = self.search_input.text().strip()
        if not query:
            return
            
        try:
            tracks = self.api.search(query, 'track')
            self.track_list.load_tracks(tracks)
            self.current_playlist = tracks
            self.statusBar().showMessage(f"Найдено треков: {len(tracks)}")
        except Exception as e:
            QMessageBox.warning(self, "Ошибка", f"Ошибка поиска: {e}")
    
    def play_track(self, track_data: dict):
        """Воспроизвести трек"""
        try:
            track = track_data["track"]
            
            # Найти индекс в текущем плейлисте
            for i, pl_track in enumerate(self.current_playlist):
                if hasattr(pl_track, 'track'):
                    pl_track = pl_track.track
                if pl_track.id == track.id:
                    self.current_index = i
                    break
            
            # Получить URL для воспроизведения
            download_info = track.get_download_info()
            if download_info:
                url = download_info[0].get_direct_link()
                self.player.setMedia(QMediaContent(QUrl(url)))
                self.player.play()
                self.statusBar().showMessage(f"Воспроизводится: {track.title}")
            else:
                QMessageBox.warning(self, "Ошибка", "Не удалось получить ссылку на трек")
                
        except Exception as e:
            QMessageBox.warning(self, "Ошибка", f"Ошибка воспроизведения: {e}")
    
    def toggle_playback(self):
        """Переключить воспроизведение/паузу"""
        if self.player.state() == QMediaPlayer.PlayingState:
            self.player.pause()
        else:
            self.player.play()
    
    def prev_track(self):
        """Предыдущий трек"""
        if self.current_playlist and self.current_index > 0:
            self.current_index -= 1
            track = self.current_playlist[self.current_index]
            if hasattr(track, 'track'):
                track = track.track
            self.play_track({"track": track})
    
    def next_track(self):
        """Следующий трек"""
        if self.current_playlist and self.current_index < len(self.current_playlist) - 1:
            self.current_index += 1
            track = self.current_playlist[self.current_index]
            if hasattr(track, 'track'):
                track = track.track
            self.play_track({"track": track})
    
    def on_state_changed(self, state):
        """Обработка изменения состояния плеера"""
        self.is_playing = (state == QMediaPlayer.PlayingState)
        self.player_controls.set_playing(self.is_playing)
    
    def on_position_changed(self, position):
        """Обработка изменения позиции"""
        self.player_controls.set_position(position // 1000, self.player.duration() // 1000)
    
    def on_duration_changed(self, duration):
        """Обработка изменения длительности"""
        pass
    
    def load_settings(self):
        """Загрузить настройки"""
        geometry = self.settings.value("geometry")
        if geometry:
            self.restoreGeometry(geometry)
        
        volume = self.settings.value("volume", 50)
        self.player.setVolume(int(volume))
        self.player_controls.volume_slider.setValue(int(volume))
    
    def save_settings(self):
        """Сохранить настройки"""
        self.settings.setValue("geometry", self.saveGeometry())
        self.settings.setValue("volume", self.player.volume())
        self.settings.setValue("provider", self.current_provider)
    
    def show_about(self):
        """О программе"""
        QMessageBox.about(self, "О программе", 
                         "Yandex Music Player\n\n"
                         "Неофициальный клиент Яндекс.Музыки\n"
                         "для Arch Linux\n\n"
                         "Использует yandex-music API")
    
    def closeEvent(self, event):
        """Обработка закрытия окна"""
        # Сохранить настройки
        self.save_settings()
        
        # Свернуть в трей вместо закрытия
        if self.tray_icon.isVisible():
            self.hide()
            self.tray_icon.showMessage("Yandex Music Player", 
                                     "Приложение свернуто в трей",
                                     QSystemTrayIcon.Information, 2000)
            event.ignore()
        else:
            event.accept()

    # ====== Работа с провайдерами ======

    def set_provider(self, provider_name: str):
        """Сменить музыкальный сервис"""
        if provider_name not in self.PROVIDERS:
            QMessageBox.warning(self, "Ошибка", f"Неизвестный провайдер: {provider_name}")
            return

        self.current_provider = provider_name
        self.api = self.PROVIDERS[provider_name]()
        self.playlist_widget.set_api(self.api)

        # попытаться автоматически авторизоваться
        if not self.check_auth():
            self.statusBar().showMessage("Требуется авторизация для " + provider_name)
        else:
            self.playlist_widget.load_playlists()

    def on_provider_changed(self, text):
        """Обработчик изменения выбранного сервиса"""
        self.set_provider(text)

def main():
    app = QApplication(sys.argv)
    app.setQuitOnLastWindowClosed(False)
    
    # Проверить наличие системного трея
    if not QSystemTrayIcon.isSystemTrayAvailable():
        QMessageBox.critical(None, "Системный трей", 
                           "Системный трей недоступен.")
        sys.exit(1)
    
    # Создать и показать главное окно
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec_())

if __name__ == "__main__":
    main()