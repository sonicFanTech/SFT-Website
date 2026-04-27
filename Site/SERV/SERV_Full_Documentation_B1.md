# Source Engine Resources Viewer (SERV) — Full Documentation (Beta B1)

> **Build:** Beta (B1)  
> **Audience:** End users + power users packaging SERV  
> **Platforms:** Windows (primary)  
> **Scope:** SERV Hub + bundled tools + external tools launched by SERV (Source BSP Explorer, EveryPlay, VidPlayer)

---

## Table of Contents

1. [What is SERV?](#what-is-serv)
2. [Quick Start](#quick-start)
3. [Folder Layout](#folder-layout)
4. [SERV Hub](#serv-hub)
   - [Launching tools](#launching-tools)
   - [Search](#search)
   - [Tool metadata sidecar (.servtool.json)](#tool-metadata-sidecar-servtooljson)
   - [Working directories and paths](#working-directories-and-paths)
   - [Troubleshooting tool launch](#troubleshooting-tool-launch)
5. [Players](#players)
   - [VidPlayer (Audio Player)](#vidplayer-audio-player)
   - [EveryPlay (Video Player)](#everyplay-video-player)
6. [Viewers](#viewers)
   - [VTF Viewer](#vtf-viewer)
   - [Image/Texture Export Workflow](#imagetexture-export-workflow)
7. [Inspectors](#inspectors)
   - [VMT Inspector](#vmt-inspector)
   - [RES Inspector](#res-inspector)
   - [NUT Viewer](#nut-viewer)
   - [VCD Viewer](#vcd-viewer)
   - [LMP Viewer](#lmp-viewer)
   - [MDL Inspector](#mdl-inspector)
   - [PCF Inspector](#pcf-inspector)
   - [SND Inspector](#snd-inspector)
   - [SAV Inspector](#sav-inspector)
   - [SWATCH Inspector](#swatch-inspector)
   - [EXE/DLL Resource Viewer](#exedll-resource-viewer)
8. [Archive Tools](#archive-tools)
   - [VPK Browser / Extractor](#vpk-browser--extractor)
9. [Map Tools](#map-tools)
   - [Source BSP Explorer (External)](#source-bsp-explorer-external)
10. [Common Workflows](#common-workflows)
11. [File Format Notes](#file-format-notes)
12. [Troubleshooting](#troubleshooting)
13. [Power User: Adding Your Own Tools](#power-user-adding-your-own-tools)
14. [FAQ](#faq)
15. [Credits & Disclaimer](#credits--disclaimer)

---

## What is SERV?

SERV (**Source Engine Resources Viewer**) is a hub + tool suite for inspecting and previewing common Source Engine resource formats.  
Instead of one giant app, SERV uses a **Hub** that launches specialized mini-tools (“workers”) for different file types.

**Why this design is useful:**
- Each file format has its own UI (easier to maintain).
- Tools can be swapped/updated without changing the whole suite.
- You can add your own tools later (SERV will auto-detect them).

---

## Quick Start

1. Download SERV (Installer or Portable).
2. Run **SERV Hub**.
3. Click a tool on the left list.
4. Click **Launch**.
5. Use that tool to open your Source file (VTF/VMT/VPK/etc.)

**Tip:** If you’re not sure what a file is, start with **Inspectors** (text/structure view) or **VPK Browser** (for archives).

---

## Folder Layout

SERV expects tools to be organized into folders so everything stays clean.

Typical layout:

```
SERV/
  SERV Hub.exe   (or SERV Hub.py)
  Tools/
    Viewers/
      (viewer tools)
    Inspectors/
      (inspector tools)
    SBSPE/
      BSPSource Explorer.exe
      (other SBSPE files, but SERV will not list worker EXEs)
    BIK/
      EveryPlay.exe
      (VLC DLLs / plugins, if EveryPlay ships them)
    Other/
      vidplayer Light/
        Vidplayer_Light.exe
      (any other tools)
  Resources/
    (icons, images, shared assets)
```

### Special tool rules in SERV Hub

- **Source BSP Explorer** is launched from:  
  `Tools\SBSPE\BSPSource Explorer.exe`  
  SERV will **not list** SBSPE worker EXEs such as:
  - `VParsing.exe`
  - `DisplaceParsing.exe`

- **EveryPlay** is launched from:  
  `Tools\BIK\EveryPlay.exe`

---

## SERV Hub

The Hub is the “launcher” app. It scans your `Tools\` folder and builds a tool list.

### Launching tools

1. Select a tool in the list.
2. The right panel shows:
   - Tool Name
   - Path
   - Description
   - Args (if any)
3. Click **Launch**.

**What “Launch” does:**
- Starts the tool process.
- Uses a working directory (either from sidecar metadata or the tool’s own folder).
- Passes optional arguments from metadata.

### Search

The search box filters tools by:
- Tool name
- Category (Viewers/Inspectors/Other/SBSPE/BIK)
- File name or path
- Description text

Use search to quickly find “VTF”, “VPK”, “NUT”, etc.

### Tool metadata sidecar (.servtool.json)

For any tool file, you can create a small JSON file next to it to customize how SERV lists and launches it.

**Sidecar file name formats (both accepted):**
- `ToolName.exe.servtool.json`
- `ToolName.servtool.json`

**Example:**
```json
{
  "name": "VTF Viewer",
  "description": "Preview VTF textures and export to PNG/JPG.",
  "args": [],
  "working_dir": ".",
  "icon": "Resources\\Logo.ico"
}
```

**Fields:**
- `name` — overrides displayed name
- `description` — tool description in the Hub
- `args` — list of command-line args SERV passes to the tool
- `working_dir` — folder to run the tool from (relative to the tool’s folder is recommended)
- `icon` — optional icon path (relative to the tool’s folder recommended)

### Working directories and paths

Most tools expect their assets next to the EXE (like `Resources\` folders).  
SERV defaults `cwd` to the **tool’s folder**, which is usually correct.

If you have a tool that needs a special working folder, use the sidecar `working_dir`.

### Troubleshooting tool launch

If clicking Launch does nothing:
- Confirm the tool EXE exists where the Hub says it is.
- Try running the tool EXE directly (double-click) to see any errors.
- Some tools require extra runtime DLLs (e.g., EveryPlay/VLC plugins).
- If a tool is `.py`, Python must be installed (unless you compiled it to `.exe`).

---

## Players

SERV includes media players to preview extracted audio/video assets.

## VidPlayer (Audio Player)

**Purpose:** Play audio files used by Source games (and general audio formats, depending on build).

**Typical uses:**
- Preview music tracks
- Preview voice lines
- Check if a sound is the right one before exporting/shipping

**Common controls:**
- Open file
- Play / Pause / Stop
- Seek bar (if supported)
- Volume control (if supported)
- Playlist/library features (depending on VidPlayer build)

**Tips:**
- If you extracted audio from a VPK, open it directly in VidPlayer.
- If a sound is in an uncommon container, you may need to convert it first.

**Troubleshooting:**
- If audio won’t play, confirm the format is supported in your VidPlayer build.
- If the UI opens but no sound: check Windows default output device and volume mixer.

## EveryPlay (Video Player)

**Purpose:** Play video cutscenes and preview `.bik` (Bink) videos commonly used by Source games.

**What SERV uses it for:**
- `.BIK` playback (Bink)
- General video playback if VLC supports it

**Notes about `.BIK`:**
- VLC can play `.bik` in many cases, even if the file extension isn’t listed in UI.
- Your SERV-special build of EveryPlay includes `.bik` in supported formats.

**Common controls:**
- Open file
- Play / Pause / Stop
- Seek bar
- Volume
- Fullscreen (if implemented in your EveryPlay build)

**Troubleshooting:**
- If EveryPlay opens but video is black:
  - Confirm VLC DLLs and `plugins\` folder are next to EveryPlay.
  - Try running EveryPlay directly from its folder.
- If a `.bik` won’t play:
  - Not all Bink variants behave the same.
  - Try updating VLC DLLs used by EveryPlay.

---

## Viewers

Viewers are tools that **preview** content (textures, images, etc.) visually.

## VTF Viewer

**Purpose:** Open and preview **VTF** (Valve Texture Format) files.

**What you can do:**
- View the texture preview (supports many VTF formats)
- Inspect header info (width/height/format/mipmaps)
- Export to common image formats (PNG/JPG/BMP/etc.)
- View mipmaps (if supported by build)
- View alpha channel (if supported by build)

**Typical workflow:**
1. Launch **VTF Viewer**
2. Open a `.vtf`
3. Confirm it’s the texture you want
4. Export to PNG for editing or documentation

### Image/Texture Export Workflow

If you want to edit a Source texture:
1. Export `.vtf` → `.png`
2. Edit `.png` in Paint.NET / GIMP / Photoshop
3. Re-import/convert back to VTF with an external tool (VTFEdit Reloaded, VTFCmd, etc.)
4. Update any `.vmt` references if needed

---

## Inspectors

Inspectors are tools that show a file’s contents in a readable way (text, structure, key/value, or parsed data).

> **Important:** Some inspector tools have “V1” behavior: they focus on previewing what’s inside and exporting parts, not perfect decompilation.

## VMT Inspector

**Purpose:** Open and inspect **VMT** (Valve Material Type) files.

**What you’ll usually see:**
- Shader name (e.g., `LightmappedGeneric`, `VertexLitGeneric`)
- Key/value parameters (`$basetexture`, `$bumpmap`, `$envmap`, etc.)
- Proxies blocks (if present)

**Useful for:**
- Finding which VTF textures a material uses
- Understanding if a material is opaque vs translucent
- Checking if a material uses envmaps, detail textures, bumpmaps

**Common tasks:**
- Search for `$basetexture` to locate the main VTF
- Search for `$bumpmap` to locate normal maps

## RES Inspector

**Purpose:** Open `.res` files used by Source to list required resources for a map/UI.

**What a `.res` usually contains:**
- A list of resource file paths (materials, sounds, models, etc.)

**Useful for:**
- Quickly seeing what assets a map references
- Making sure you didn’t miss dependencies

## NUT Viewer

**Purpose:** Inspect `.nut` (Squirrel script) files.

**What it does:**
- Displays script text/contents (if plain text)
- If compiled/obfuscated, it may only show raw bytes depending on your build

**Useful for:**
- Reading map/game scripts
- Searching for logic triggers, entity names, config strings

## VCD Viewer

**Purpose:** Inspect `.vcd` (Valve Choreography Data) files used for scenes and facial animations.

**What you may see:**
- Scene structure
- Actor channels
- Event timelines
- Sound/phoneme links (depends on tool)

**Useful for:**
- Understanding how scripted scenes are built
- Locating voice lines and animation cues

## LMP Viewer

**Purpose:** Inspect `.lmp` files (commonly demo/recording-related depending on game).

**What you may see:**
- Header data
- Basic metadata
- Raw sections

**Notes:**
- `.lmp` usage differs between Source games/mods.
- If your tool shows a hexdump + parsed header, that’s expected.

## MDL Inspector

**Purpose:** Inspect Source model files (`.mdl` and related).

**What models usually include:**
- A `.mdl` header
- References to `.vvd`, `.vtx`, `.phy`
- Material references (points to VMT/VTF)

**Useful for:**
- Checking what materials a model uses
- Confirming model version
- Locating the other model files you need

## PCF Inspector

**Purpose:** Inspect `.pcf` particle system files.

**What you may see:**
- Particle definitions
- Render settings
- Material references

**Useful for:**
- Finding what textures/materials a particle effect uses
- Understanding effect names for debugging

## SND Inspector

**Purpose:** Inspect `.snd` script files (sound scripts / manifests).

**What you may see:**
- Named sound entries
- Linked audio files (wav/mp3)
- Volume/pitch settings

**Useful for:**
- Finding which audio file is used by a named sound
- Debugging missing sound errors

## SAV Inspector

**Purpose:** Inspect `.sav` save files.

**What you may see:**
- Header info
- Some parsed metadata
- Raw data blocks

**Notes:**
- Save formats can be complex and game-specific.
- Expect partial parsing depending on tool maturity.

## SWATCH Inspector

**Purpose:** Inspect palette/swatch style files (varies by Source branch/tools).

**What you may see:**
- Color lists
- Named palette entries
- Raw/decoded representation

## EXE/DLL Resource Viewer

**Purpose:** Inspect Windows executables/libraries for embedded resources (icons, bitmaps, dialogs).

**Useful for:**
- Viewing game UI assets embedded in binaries
- Extracting icons/bitmaps for modding or documentation

**Common features:**
- Tree view of resource types (Icon, Bitmap, String Table, etc.)
- Preview panel for images
- Export selected resource

---

## Archive Tools

## VPK Browser / Extractor

**Purpose:** Browse and extract **VPK** archives.

**What it does:**
- Lists the virtual file tree inside the VPK
- Lets you extract files/folders to disk
- Often provides search/filter for filenames

**Typical workflow:**
1. Launch **VPK Browser**
2. Open a `.vpk` (dir.vpk or single-file VPK depending on game)
3. Browse to `materials/`, `models/`, `sound/`, etc.
4. Extract needed files
5. Open extracted files in other SERV tools (VTF, VMT, audio/video, etc.)

**Tips:**
- Some Source games use “multi-part” VPKs with a `*_dir.vpk` file that references numbered archives.
  - Keep all parts together in the same folder.
- If extraction fails:
  - Make sure the VPK isn’t read-only.
  - Make sure you have write permissions to the output folder.

---

## Map Tools

## Source BSP Explorer (External)

**Purpose:** Open and explore `.bsp` maps using the external **Source BSP Explorer** project.

**How SERV uses it:**
- SERV Hub launches `Tools\SBSPE\BSPSource Explorer.exe`
- SERV does **not** list internal SBSPE worker executables.

**What BSP Explorer typically provides:**
- 3D view of geometry
- Entity list/inspection
- Potential texture previews
- Tools for parsing lumps (depends on SBSPE version)

**Tips:**
- BSP parsing is highly dependent on game branch/version.
- Keep SBSPE’s workers next to it as required by SBSPE itself.

---

## Common Workflows

### 1) “I have a VPK and I want the textures”
1. Open VPK in **VPK Browser**
2. Extract:
   - `materials/*.vmt`
   - `materials/*.vtf`
3. Open `.vmt` in **VMT Inspector** to find `$basetexture`
4. Open referenced `.vtf` in **VTF Viewer**
5. Export PNG

### 2) “Find what assets a map uses”
1. If you have a `.res`, open it in **RES Inspector**
2. Otherwise:
   - Extract map-related files from VPK
   - Use BSP Explorer to view entities/material usage (depending on SBSPE build)

### 3) “Preview a cutscene or intro”
1. Open `.bik` in **EveryPlay**
2. Seek to key moments
3. Adjust volume
4. If you need frames for documentation:
   - Use EveryPlay screenshot feature (if present)
   - Or use VLC screenshot hotkeys (depending on build)

### 4) “Preview sound scripts”
1. Open `.snd` in **SND Inspector**
2. Locate a sound entry name
3. Find the referenced `.wav`/`.mp3`
4. Preview in **VidPlayer**

---

## File Format Notes

SERV targets common Source ecosystem formats, but real-world behavior depends on:
- Game branch (Orange Box, L4D, Portal 2, CS:GO/CS2 era, etc.)
- Mod-specific custom formats
- Variants and compression

### VTF
- Texture container with multiple formats, mipmaps, frames
- Some VTFs have alpha, normal maps, cubemaps

### VMT
- Text-based material scripts
- References VTFs and sets shader parameters

### VPK
- Archive container
- Often split into multiple numbered chunk files

### MDL family
- `.mdl` + `.vvd` + `.vtx` + `.phy`
- Material references inside models can help locate textures

### BIK
- Bink video
- VLC can handle many `.bik` files, but some may be incompatible

---

## Troubleshooting

### Tool doesn’t show up in the Hub
- Confirm it’s inside one of:
  - `Tools\Viewers\`
  - `Tools\Inspectors\`
  - `Tools\Other\`
- Or it’s explicitly supported:
  - `Tools\SBSPE\BSPSource Explorer.exe`
  - `Tools\BIK\EveryPlay.exe`
- Confirm the file extension is one SERV recognizes: `.exe`, `.py`, `.bat`, `.cmd`

### Tool shows up but won’t launch
- Run it directly to see errors.
- If it’s a Python script, Python may not be installed (or the Hub build is frozen).
- Some tools depend on DLLs/resources beside them.

### EveryPlay opens but playback fails
- Ensure VLC dependencies are included:
  - `libvlc.dll`, `libvlccore.dll`
  - `plugins\` folder
- Ensure working directory is EveryPlay’s folder (SERV does this by default).
- Try moving the video to a simple path (no special characters) to test.

### VPK extraction issues
- If it’s a multi-part VPK, keep all files together.
- Make sure you’re opening the correct `*_dir.vpk`.

---

## Power User: Adding Your Own Tools

You can add new tools without editing SERV:

1. Drop your tool into one of:
   - `Tools\Viewers\`
   - `Tools\Inspectors\`
   - `Tools\Other\`
2. (Optional) add a `.servtool.json` sidecar for a friendly name + description.
3. Restart Hub or click **Refresh**.

### Recommended sidecar template

Create next to `MyTool.exe`:

`MyTool.exe.servtool.json`

```json
{
  "name": "My Custom Tool",
  "description": "What this tool does and what formats it supports.",
  "args": [],
  "working_dir": ".",
  "icon": ""
}
```

---

## FAQ

**Q: Is SERV affiliated with Valve?**  
A: No. SERV is a fan-made project.

**Q: Why does SERV launch separate tools instead of having everything built-in?**  
A: It keeps each file format tool simpler and makes the suite easier to expand.

**Q: Can I add support for new formats?**  
A: Yes. You can add a new tool and drop it in the correct folder, and SERV will list it.

---

## Credits & Disclaimer

- SERV is a fan-made project.
- Source Engine and Valve are trademarks of Valve Corporation.
- VLC is licensed under LGPL/GPL depending on distribution; respect VLC licensing when bundling DLLs/plugins.
- Bink (BIK) is a proprietary format; playback support depends on the underlying decoder (VLC/FFmpeg/RAD licensing).

---

## Tool Inventory Checklist (for your release)

Use this checklist when you publish a build to make sure documentation matches your shipped tools:

### Players
- [ ] VidPlayer (Audio)
- [ ] EveryPlay (Video / BIK)

### Viewers
- [ ] VTF Viewer

### Inspectors
- [ ] VMT Inspector
- [ ] RES Inspector
- [ ] NUT Viewer
- [ ] VCD Viewer
- [ ] LMP Viewer
- [ ] MDL Inspector
- [ ] PCF Inspector
- [ ] SND Inspector
- [ ] SAV Inspector
- [ ] SWATCH Inspector
- [ ] EXE/DLL Resource Viewer

### Archives
- [ ] VPK Browser/Extractor

### Maps
- [ ] Source BSP Explorer (external)
