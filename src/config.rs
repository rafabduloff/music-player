use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};

use crate::types::ProviderType;

/// Path (relative to the executable directory) where configuration is stored
fn config_file_path() -> PathBuf {
    let mut dir = dirs::config_dir().unwrap_or_else(|| PathBuf::from("."));
    dir.push("yandex-music-player");
    fs::create_dir_all(&dir).ok();
    dir.push("config.toml");
    dir
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// Default output volume in range **0.0 – 1.0**
    pub default_volume: f32,
    /// OAuth or API tokens for different services. The key is provider name (lower-case).
    pub provider_tokens: HashMap<String, String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            default_volume: 0.5,
            provider_tokens: HashMap::new(),
        }
    }
}

impl AppConfig {
    /// Load configuration from `config.toml`. If the file does not exist, returns default config.
    pub fn load() -> Result<Self> {
        let path = config_file_path();
        if !path.exists() {
            return Ok(Self::default());
        }
        let contents = fs::read_to_string(&path)?;
        let cfg: AppConfig = toml::from_str(&contents)?;
        Ok(cfg)
    }

    /// Persist configuration on disk in `config.toml`.
    pub fn save(&self) -> Result<()> {
        let path = config_file_path();
        let toml_str = toml::to_string_pretty(self)?;
        fs::write(&path, toml_str)?;
        Ok(())
    }

    /// Helper to get token for provider (if exists)
    pub fn get_token(&self, provider: ProviderType) -> Option<String> {
        self.provider_tokens
            .get(&provider.to_string().to_lowercase())
            .cloned()
    }

    /// Set / overwrite token for a provider and immediately save config
    pub fn set_token(&mut self, provider: ProviderType, token: String) -> Result<()> {
        self.provider_tokens
            .insert(provider.to_string().to_lowercase(), token);
        self.save()
    }
} 