# VidPlayer Changelog

A running log of VidPlayer changes across builds.

---

## v2.0.9.3 Release X64

### Version / app info
- Version string updated to `v2.0.9.3 Release X64`
- Continues the portable VLC-based VidPlayer branch
- Continues the external updater workflow
- This release mainly focuses on a major UI / artwork / icon / File Info refresh

### Main UI / icon refresh
- Added custom `.ico`-based UI icon support across the player
- VidPlayer now loads custom icons from:
  - `bin\icons\buttons\`
  - `bin\icons\menubar\`
  - `bin\icons\VPLogo.ico`
- Main playback controls now use the custom icon set
- Menu bar actions now use custom icons for supported actions
- Added VPLogo placeholder support into the main player UI
- Built-in fallback transport icons used in the older updated areas were replaced by the new custom icon workflow

### Full Screen Artwork
- Reworked Full Screen Artwork mode to behave more like a true full-screen takeover view
- Full-screen artwork controls now use the custom button icon set
- Full-screen artwork now updates automatically when the current track changes
- Full-screen artwork now refreshes the shown artwork instead of only keeping the image from when the window first opened
- Full-screen artwork now shows `VPLogo.ico` when the current track has no embedded artwork
- Full-screen placeholder behavior now better matches the main window artwork display

### Artwork / placeholder handling
- Main window artwork placeholder behavior was reworked
- `VPLogo.ico` is now used directly in the artwork display area when:
  - no file is loaded
  - the current file has no embedded artwork
- Full-screen artwork placeholder behavior was aligned with the main window artwork behavior
- General artwork refresh / placeholder logic was improved during track changes and UI refreshes

### File Info window
- Reworked the built-in File Info window using logic based on the EveryPlay-style MediaInfo tool workflow
- Added deeper `ffprobe`-based media inspection support
- Added a more detailed multi-tab File Info layout
- Added a Basic info tab with expanded media / container / stream details
- Added a Codecs tab for stream / codec information
- Added an Extra / Raw tab for raw probe-style information
- Added better artwork handling in the File Info window
- Added support for showing a loaded-file list in File Info when more than one track is loaded in VidPlayer
- File Info now better matches the EveryPlay MediaInfo workflow while staying built into VidPlayer

### ffprobe / ffmpeg path handling
- Reworked `ffprobe` / `ffmpeg` lookup behavior for the built-in File Info system
- VidPlayer now prefers these locations first:
  - `bin\ffprobe.exe`
  - `bin\ffmpeg.exe`
- Compatibility fallback locations are still supported for older / alternate folder layouts

### VLC loading / startup handling
- `VPLogo.ico` now replaces the older green VP badge in the VLC DLL loading window
- Improved startup error handling while the VLC loading window is active
- Fatal / startup error message boxes are now forced to appear over the VLC DLL loading window instead of behind it
- Startup polish / stability was improved while integrating the new logo / icon behavior

### Mini Mode / playlist / carried-forward systems
- Mini Mode now uses the custom control icon set too
- Added custom menu icons for dock / view actions
- Corrected Dock Left / Dock Right icon assignment in the updated icon workflow
- Visualizer, subtitle / lyrics, updater, docking, and Audio CD systems from the newer branch continue in this release

### General fixes / polish
- Fixed multiple startup / UI integration issues introduced while reworking the icon system
- Fixed helper / placeholder issues caused during logo / artwork integration
- Fixed artwork placeholders so they show in the intended locations
- Fixed full-screen artwork refresh / placeholder sync issues
- Fixed File Info behavior so it works better with multiple loaded files
- General polish / cleanup to the UI refresh work across multiple windows and view modes

---

## v2.0.9.1.2 Pre-Release X64

### Version / app info
- Version string updated to `v2.0.9.1.2 Pre-Release X64`
- Updated Discord App ID
- Continues the portable VLC-based VidPlayer branch
- Continues the external updater workflow
- Updated portable VLC DLLs from **3.0.21** to **3.0.23**

### Updater system
- Reworked the external updater into a Python-based updater
- Added shared updater settings file: `update\updater_settings.json`
- VidPlayer and updater now both read / write updater settings through the shared file
- Replaced hardcoded updater behavior with settings-based behavior
- VidPlayer can launch either `VidPlayerUpdater.exe` or `VidPlayerUpdater.py`
- Added safer hash-based partial updates
- Added preserve rules for local files
- Added rollback snapshots with manifests
- Added updater-folder exclusion
- Added uninstaller-file exclusion
- Improved update / rollback progress reporting
- Added 7z extraction fallback support for packages py7zr cannot fully extract

### VidPlayer updater integration
- Added updater settings support in VidPlayer settings
- Auto-check behavior now respects updater settings
- Launch counter behavior now works through updater settings
- VidPlayer can close itself when configured to launch the updater

### Mini Mode / UI
- Reworked Mini Mode styling
- Improved artwork scaling and background presentation
- Improved controls, spacing, overlays, and seek bar styling
- Fixed restore sizing and resize behavior
- Prevented maximize behavior while Mini Mode is enabled
- Fixed hidden subtitle / lyrics behavior in Mini Mode

### Playlist / docking
- Improved docked playlist polish and stability
- Dock location menu items are now checkable
- Current dock location remains visibly selected
- Fixed recursive playlist refresh issues
- Dock With Visualizer now disables correctly when the visualizer is off

### Visualizer
- Reworked experimental live VLC data handling
- Analyzer player now recreates itself per track
- Improved reset / watchdog behavior
- Reduced cases where live VLC mode disables itself during track switching

### VLC loading / diagnostics
- Loading window now shows more startup details
- Added more detailed DLL and plugin logging for troubleshooting

### Audio CD changes
- Removed old `Use VLC for Audio CD playback` setting
- Audio CD playback now goes through the main player flow
- Removed the old rip-first playback path
- Audio CD uses the selected drive instead of assuming one drive
- Audio CD tracks now appear in the playlist
- Built-in Audio CD ripping path was removed in favor of the external rip tool

### External Audio CD ripper tool
- Added / kept support for external Audio CD ripper launch from the Tools menu
- Preferred ripper filename is `VPACDRipper.exe`
- Fixed ripper launch path / working directory behavior

### General fixes / polish
- Improved display names in playlist entries
- General polish for Mini Mode, playlist docking, updater workflow, and Audio CD support

---

## v2.0.9.1.1 Experimental

### Experimental / UI work
- Added dockable playlist mode setting
- Playlist can dock to top, right, left, bottom, or with the visualizer as a tab
- Docked playlist can undock itself when docking is disabled
- Added Mini Mode in the View menu
- Added `Ctrl+M` shortcut for Mini Mode
- Mini Mode introduced smaller resizable window behavior, artwork-focused layout, mini controls, and menu auto-hide behavior
- Dockable playlist mode is disabled while in Mini Mode
- Subtitles / lyrics settings are disabled while in Mini Mode
- Added View menu options for dock playlist placement
- Fixed `Ctrl+L` behavior so it opens Playlist instead of loading a playlist
- Added first pass of Mini Mode and playlist docking work

---

## v2.0.9.1 Pre-Release

### Updater changes
- Removed the built-in updater
- Replaced it with an external updater
- External updater originally used a C++ build and supported:
  - custom UI / title bar
  - hash matching
  - rollback support
  - auto-closing / reopening VidPlayer after update

### VidPlayer changes
- Auto-runs the external updater based on launch-count logic
- Audio playback engine moved fully to VLC-based playback in this newer branch
- Added subtitle / lyrics support
- Added subtitle / lyrics settings including color, background, position, timing offset, and manual load support

---

## v2.0.9 Release

- Added playlist search box
- Added FFT-based visualizer under the main timeline
- Added visualizer settings for style, quality, FPS, size, and color
- Fixed autoplay-next behavior
- Removed the experimental Aero Glass theme / effect
- This was described as the first build that was no longer a beta build

---

## v2.0.9 BETA 4.2

- Added Audio CD ripping support using `cdda2wav` / `cdparanoia`
- Added optional VLC-based Audio CD playback
- Added File → Play Audio CD
- Added playlist button for Audio CD playback
- Added ffmpeg transcoding support for ripped output formats
- Added progress dialogs for ripping and conversion
- Added option to add ripped tracks to the playlist
- Added cleanup for temporary `.inf` files

---

## v2.0.9 BETA 4.1

- Fixed updater freeze / crash at 100%
- Updater can download any asset type from GitHub releases
- JSON data files are saved next to the EXE when bundled
- Drag-and-drop / multi-open now uses a threaded progress dialog
- First VidPlayer release to ship both x64 and x86 builds

---

## v2.0.9 BETA 4

- Polished the newer PySide6 UI
- Re-added updater downloader with progress dialog
- Fixed unsupported Qt stylesheet crashes
- Fixed save / load QAction triggers
- Corrected Aero Glass-related enable / disable behavior for that older branch

---

## v2.0.9 BETA 2-3

- No public detailed log was recorded for these builds

---

## v2.0.9 BETA 1

- Replaced the old Tkinter GUI with a PySide6 / Qt GUI
- Added File Info window
- Moved Full Screen Artwork to the View menu
- Added Windows 7 Aero-inspired theme in that branch

---

## v2.0.8.1

- External artwork paths are now persisted in `artmap.json`
- Added previous / next buttons in fullscreen overlay
- Overlay auto-hides and restores on mouse movement
- Improved artwork persistence workflow

---

## v2.0.8

- Added Discord Rich Presence toggle in Settings
- Added Always on Top setting
- Added Full Screen Artwork mode
- Shared RPC connection with playlist window
- Saved new settings into `config.json`

---

## v2.0.7

- Added Discord Rich Presence integration
- Changed default volume to 50.0

---

## v2.0.6.1

- Updated License Agreement
- License and Features / Update Log tabs now load text from external files
- Added auto-check for updates on startup
- Added a Check for Updates button to the About menu

---

## v2.0.6

- Added a new About window

---

## v2.0.5

- Added batch-loading progress window for opening more than 10 files

---

## v2.0.4

- Fixed autoplay-next behavior
- Added more settings options

---

## v2.0.3

- First attempt at autoplay-next
- Broken / unreleased build

---

## v2.0.2

- Added embedded artwork display
- Added Settings window
- Reworked volume slider
- Added playlist support

---

## v2.0.1

- Player UI redesigned again
- Added Light / Dark mode
- Added Recent Files list

---

## v2.0.0

- Program rewritten for Python 3.12+
- Major internal rework of the player

