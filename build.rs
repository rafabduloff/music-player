fn main() {
    // Skip icon validation to prevent build-time errors when icons are missing in dev mode
    std::env::set_var("TAURI_SKIP_ICON_CHECK", "true");
    tauri_build::build();
}
