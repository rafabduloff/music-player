import React, { useState } from 'react';
import { Settings, Palette, Volume2, Bell, Globe, Zap, Download, Shield } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export const SettingsView: React.FC = () => {
  const { userSettings, updateUserSettings, setTheme, setInterfaceMode } = useUIStore();
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'playback', label: 'Playback', icon: Volume2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Zap },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  const themes = [
    { id: 'dark', name: 'Dark', preview: 'from-dark-900 to-dark-800' },
    { id: 'light', name: 'Light', preview: 'from-gray-100 to-white' },
    { id: 'neon', name: 'Neon', preview: 'from-purple-900 to-pink-900' },
    { id: 'minimal', name: 'Minimal', preview: 'from-gray-50 to-gray-100' },
    { id: 'pro', name: 'Pro', preview: 'from-blue-900 to-indigo-900' },
  ];

  const qualities = [
    { id: 'low', name: 'Low (96 kbps)', description: 'Uses less data' },
    { id: 'medium', name: 'Medium (160 kbps)', description: 'Balanced quality and data usage' },
    { id: 'high', name: 'High (320 kbps)', description: 'Best quality' },
  ];

  const languages = [
    { id: 'en', name: 'English' },
    { id: 'es', name: 'Español' },
    { id: 'fr', name: 'Français' },
    { id: 'de', name: 'Deutsch' },
    { id: 'ja', name: '日本語' },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Interface Mode</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setInterfaceMode('simple')}
            className={`p-4 rounded-xl border-2 transition-colors ${
              userSettings.interfaceMode === 'simple'
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-700 hover:border-dark-600'
            }`}
          >
            <h4 className="font-medium mb-2">Simple Mode</h4>
            <p className="text-sm text-dark-400">Clean, minimal interface with essential features only</p>
          </button>
          <button
            onClick={() => setInterfaceMode('advanced')}
            className={`p-4 rounded-xl border-2 transition-colors ${
              userSettings.interfaceMode === 'advanced'
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-dark-700 hover:border-dark-600'
            }`}
          >
            <h4 className="font-medium mb-2">Advanced Mode</h4>
            <p className="text-sm text-dark-400">Full feature set with detailed controls and options</p>
          </button>
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between">
          <div>
            <span className="font-medium">Auto-play next track</span>
            <p className="text-sm text-dark-400">Automatically play the next song when current ends</p>
          </div>
          <input
            type="checkbox"
            checked={userSettings.autoPlayNext}
            onChange={(e) => updateUserSettings({ autoPlayNext: e.target.checked })}
            className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
          />
        </label>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Theme</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`p-4 rounded-xl border-2 transition-colors ${
                userSettings.theme === theme.id
                  ? 'border-primary-500'
                  : 'border-dark-700 hover:border-dark-600'
              }`}
            >
              <div className={`w-full h-16 rounded-lg bg-gradient-to-r ${theme.preview} mb-3`}></div>
              <span className="font-medium">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPlaybackSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Playback Quality</h3>
        <div className="space-y-3">
          {qualities.map((quality) => (
            <label key={quality.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="quality"
                value={quality.id}
                checked={userSettings.playbackQuality === quality.id}
                onChange={(e) => updateUserSettings({ playbackQuality: e.target.value as any })}
                className="w-5 h-5 text-primary-500"
              />
              <div>
                <div className="font-medium">{quality.name}</div>
                <div className="text-sm text-dark-400">{quality.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center justify-between">
          <div>
            <span className="font-medium">Crossfade</span>
            <p className="text-sm text-dark-400">Smooth transitions between tracks</p>
          </div>
          <input
            type="checkbox"
            checked={userSettings.crossfade}
            onChange={(e) => updateUserSettings({ crossfade: e.target.checked })}
            className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
          />
        </label>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Volume</h3>
        <div className="flex items-center gap-4">
          <Volume2 size={20} className="text-dark-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={userSettings.volume}
            onChange={(e) => updateUserSettings({ volume: parseFloat(e.target.value) })}
            className="flex-1 h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-medium w-12 text-right">
            {Math.round(userSettings.volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center justify-between">
          <div>
            <span className="font-medium">Show notifications</span>
            <p className="text-sm text-dark-400">Display system notifications for track changes</p>
          </div>
          <input
            type="checkbox"
            checked={userSettings.showNotifications}
            onChange={(e) => updateUserSettings({ showNotifications: e.target.checked })}
            className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
          />
        </label>
      </div>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Language</h3>
        <select
          value={userSettings.language}
          onChange={(e) => updateUserSettings({ language: e.target.value })}
          className="w-full bg-dark-800 border border-dark-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500"
        >
          {languages.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderAdvancedSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-yellow-500" size={20} />
          <span className="font-medium text-yellow-500">Advanced Settings</span>
        </div>
        <p className="text-sm text-dark-300">
          These settings are for advanced users only. Changing these may affect app performance.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Performance</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="font-medium">Hardware acceleration</span>
              <p className="text-sm text-dark-400">Use GPU for audio processing when available</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="font-medium">Pre-load next track</span>
              <p className="text-sm text-dark-400">Buffer upcoming songs for smoother playback</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={true}
              className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
            />
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <div>
              <span className="font-medium">Share listening data</span>
              <p className="text-sm text-dark-400">Help improve recommendations by sharing anonymous usage data</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={false}
              className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <div>
              <span className="font-medium">Analytics</span>
              <p className="text-sm text-dark-400">Send anonymous usage statistics to help improve the app</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={false}
              className="w-5 h-5 text-primary-500 rounded focus:ring-primary-500"
            />
          </label>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
        <h4 className="font-medium text-red-400 mb-2">Danger Zone</h4>
        <div className="space-y-3">
          <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded-lg transition-colors">
            Clear All Data
          </button>
          <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-4 rounded-lg transition-colors">
            Reset to Factory Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'playback':
        return renderPlaybackSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'language':
        return renderLanguageSettings();
      case 'advanced':
        return renderAdvancedSettings();
      case 'privacy':
        return renderPrivacySettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-64 space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                activeSection === section.id
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'hover:bg-dark-800 text-dark-300'
              }`}
            >
              <section.icon size={20} />
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};