# Noxen File Explorer: Razer Native — v2.0.1 R1.1

GitHub tag: [`RN-R1.1`](https://github.com/sonicFanTech/Noxen-File-explorer/releases/tag/RN-R1.1)

This release updates NFE from the base native rebuild into the first updater-ready version.

## Quick Summary

**v2.0.1 R1.1** adds the updater foundation for Noxen File Explorer. The main app is still the Razer Native C++ / Qt file explorer line, but this release adds update package downloads, SHA-256 checksum validation, updater settings, rollback/log/cache folders, built-in themes, SaveData storage, Backspace-as-Up behavior, and a Win32 fallback repair mode.

## Recommended Download

Use the **Normal folder build** unless you specifically need the one-file wrapper.

| Build | File | Recommended for |
|---|---|---|
| Normal folder build | `NoxenFE_RazerNative_v2_0_1_R1_1_NormalBuild.zip` | Most users, update testing, repair testing, and troubleshooting. |
| One-file build | `NoxenFE_RazerNative_v2_0_1_R1_1_OneFileBuild.zip` | Users who want a single EXE-style wrapper. |

## New in v2.0.1 R1.1

- Added `resources/update/NFEUpdate.exe` as the external updater launcher.
- Added `resources/update/NFEUpdateQt.dll` for the Qt updater UI.
- Added Win32 fallback / repair mode so the updater can repair `resources/Qt/` without loading Qt.
- Added server-side SHA-256 checksum validation for update packages.
- Added updater folders:
  - `Logs/`
  - `RoleBacks/`
  - `cashes/`
  - `Checksums/`
  - `DownloadedUpdatePackage/`
- Added updater settings under `resources/SaveData/`.
- Added built-in themes under `resources/Themes/built-in/`.
- Added future custom theme folder under `resources/Themes/custom/`.
- Added Backspace-as-Up folder navigation behavior.
- Moved settings/save data into `resources/SaveData/`.

## Update Package Paths

The updater expects the website update folder to use this layout:

```txt
update/
├─ latest.zip
├─ latest.7z
├─ latest.tar
├─ update.wim
├─ Checksums/
│  ├─ latest.zip.sha256.txt
│  ├─ latest.7z.sha256.txt
│  ├─ latest.tar.sha256.txt
│  └─ update.wim.sha256.txt
└─ OF/
   ├─ update.zip
   ├─ update.7z
   ├─ update.tar
   ├─ update.wim
   └─ Checksums/
      ├─ update.zip.sha256.txt
      ├─ update.7z.sha256.txt
      ├─ update.tar.sha256.txt
      └─ update.wim.sha256.txt
```

## Install Notes

1. Download the build ZIP.
2. Extract it to its own folder.
3. Run NFE.
4. Open **Settings → Updater** to configure update behavior.
5. Use **Tools → Check for Updates** to open the updater from inside NFE.

## One-File Build Note

The one-file build is still a wrapper around an extracted runtime. That is expected because Qt plugins, feature DLLs, updater files, and helper tools need to exist on disk.

When testing a new one-file build, delete the old extracted runtime first:

```txt
%LOCALAPPDATA%\Noxen File Explorer\OneFileRuntime
```

## Known Notes

- Normal folder build is the safest/recommended release package.
- The updater uses bundled NFE 7-Zip files, not the system-installed 7-Zip context menu.
- Normal update mode skips `resources/Qt/`; Repair mode uses the Win32 fallback when Qt files need to be replaced.
- If an update fails, check `resources/update/Logs/`.

## Release History Context

This is the first updater-ready Razer Native release. The previous public GitHub releases are:

- `RNR1` — v2.0 R1, the first Razer Native C++ rebuild.
- `R3.1` — final Python-era bug-fix / quality release.
- `R3` — Python-era big update.
- `R2` — Python-era feature update.
- `R1` — first public Python-era release.

## Website

- NFE Download Center: https://sonicfantech.org/Site/DownloadNFE/
- Repository: https://github.com/sonicFanTech/Noxen-File-explorer
- All releases: https://github.com/sonicFanTech/Noxen-File-explorer/releases
