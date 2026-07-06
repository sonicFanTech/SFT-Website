# SFT DELTARUNE Debug Menu v2

**SFT DELTARUNE Debug Menu v2** is an unofficial fan-made UndertaleModTool `.csx` mod for DELTARUNE Chapters 1–5. It adds an in-game research/debug menu with room warping, movement tools, visual overlays, sound/sprite browsers, object tools, a safer GML code index viewer, flag metadata viewing, runtime logging, and experimental save/debug utilities.

This package is meant for modders, unused-content hunters, technical players, and people who already know how to use UndertaleModTool. It is **not** an official DELTARUNE feature and it is **not** made by, endorsed by, or connected to Toby Fox.

---

## Big safety warning

Back up everything before using this.

At minimum, back up:

1. The original chapter `data.win` / game data file you are patching.
2. Your DELTARUNE save folder.
3. Any exported GML source folders you are using for the GML Viewer.

Debug menus can break things. This mod can warp rooms, spawn objects, alter movement, call scripts, inspect flags, and touch settings. Some features are intentionally advanced and can make the game act incorrectly if used in the wrong place.

The **Object Spawner** is especially powerful. Spawned objects run their normal object Create/Step/etc. code. If you spawn a failure, quit, controller, battle, or cutscene object, it can actually run that behavior. That is useful for testing, but it can also break a room, force a crash, or close the game.

The **Save Tools** and flag systems are still safety-focused. The mod does not try to blindly live-edit every flag at runtime because earlier testing showed unsafe flag reads can crash the game.

---

## What is included

```text
DELTARUNE_Debug_Menu_v2_UI_Recode_V2Labs_R8_2_NoCustomUIAssets.csx
README.md
SFT_DDM_GML_Source/
  CH1/
  CH2/
  CH3/
  CH4/
  CH5/
  ChapSelect/
SFT_DDM_RealFlags_SAMPLE.txt
TennaFlags_To_SFT_DDM_RealFlags.py
NOTICE_NO_GAME_ASSETS.md
```

The package does **not** include DELTARUNE source code, sprites, music, sound effects, rooms, scripts, exported GML, or other copyrighted game assets.

The `SFT_DDM_GML_Source` folders are placeholders. If you want the GML Code Viewer to show source previews, you must export the code yourself from your own copy of the game using UMT.

---

## Requirements

- A legitimate copy of DELTARUNE.
- UndertaleModTool / UndertaleModTool-GUI.
- A backup of the `data.win` or chapter data file you want to patch.
- Optional: exported GML code folders for the GML Code Viewer.
- Optional: generated real flag metadata file for the Flag Viewer.

---

## Which file do I patch?

Patch the chapter data file for the chapter you want to use the debug menu in.

Examples:

- Chapter 1 data file → use the mod in Chapter 1.
- Chapter 2 data file → use the mod in Chapter 2.
- Chapter 5 data file → use the mod in Chapter 5.

Each chapter has its own resources, rooms, scripts, sprites, sounds, and objects, so patch each chapter separately if you want the menu in multiple chapters.

---

## Basic installation

1. Make a backup of the chapter data file.
2. Open the chapter data file in UndertaleModTool.
3. In UMT, choose `Scripts` → `Run other script...`.
4. Select `DELTARUNE_Debug_Menu_v2_UI_Recode_V2Labs_R8_2_NoCustomUIAssets.csx`.
5. Wait for the script to finish.
6. Save the patched data file.
7. Launch DELTARUNE.
8. Press `F3` in-game to open the debug menu.

Controller support is also included. On an Xbox-style controller, use `Back + Start` to open/close the menu.

---

## Recommended installation workflow

Use this safer workflow when testing:

```text
1. Copy the original data file somewhere safe.
2. Patch a test copy first.
3. Launch the game and test the title/menu/save screen.
4. Enter a normal room and press F3.
5. Test only basic features first: Runtime Info, Room Select, Sound Test, Sprite Viewer.
6. Only then test advanced features like Object Spawner or Script Call.
```

Do not test the first install on your only save file.

---

## Controls

### Keyboard

```text
F3                  Open / close debug menu
Up / Down           Move selection
Left / Right        Change values or page options
Enter               Select / confirm
Esc / Backspace     Back / close page
Typing              Search on supported pages
X                   Delete search text on supported pages
Page-style controls May vary by page
```

### Controller

```text
Back + Start        Open / close debug menu
D-pad / left stick  Move selection
A                   Select / confirm
B                   Back / close page
X                   Delete search text on supported pages
LB / RB             Page or category jump on some pages
```

Controller slot can be changed in the UI Settings page if your controller does not respond on slot 0.

---

## Feature list

### 1. Room Select

Room Select lets you browse and search the rooms inside the currently patched chapter. It can warp the player to a selected room.

Use it for:

- Jumping to test rooms.
- Exploring rooms without replaying the whole chapter.
- Checking unused or hidden rooms.
- Recovering from some softlocks by warping away.

Be careful when warping into rooms that expect story variables or cutscene state. Some rooms may immediately run scripts, start dialogue, start battles, or crash if entered without the expected setup.

### 2. Player / Movement

Player / Movement contains movement helpers such as no-clip, no-clip speed, teleport-style tools, and reload helpers.

The mod attempts to auto-pause no-clip when battles, dialogue, cutscenes, or busy states appear. This was added because no-clip being active during battle/text/menu states can break the camera, movement, and UI.

### 3. Visual / Collision

Visual / Collision tools help show what the room is doing visually and physically.

Examples:

- Hitbox drawing.
- Object labels.
- Room bounds.
- Player marker.
- Layer visibility tests.
- Interact/trigger style overlays.

These are useful for figuring out invisible triggers, interactable zones, and room boundaries.

### 4. Sound Test

Sound Test lets you search and play music/SFX from the currently patched chapter.

Use it for:

- Testing sound IDs.
- Previewing chapter audio.
- Finding unused or rarely heard sounds.
- Stopping/resetting audio while debugging.

### 5. Sprite / Animation Viewer

Sprite / Animation Viewer lets you search sprites and preview animation frames.

Use it for:

- Checking sprite names.
- Viewing animation frames.
- Inspecting sprite sizes.
- Finding unused or hidden graphics.

### 6. Battle / Test Rooms

Battle / Test Rooms contains safer generic warps and test helpers. This area should still be treated as experimental because battle rooms and test objects can depend on chapter state.

### 7. Runtime Info

Runtime Info shows live state such as current room, speed, object counts, and other runtime details. This is the safer place to check what the game is doing before using more dangerous tools.

### 8. Object Browser

Object Browser lists and searches game objects. It can help you find visible/invisible objects and understand what is in the current chapter.

### 9. GML Code Viewer

The GML Code Viewer is a code index and source preview system.

It has two modes:

1. **Basic mode:** shows code/script names from the currently patched data file.
2. **Source preview mode:** embeds short previews from exported GML files you provide during install.

The game does not read loose source files live. The `.csx` embeds safe snippets at patch time so the in-game viewer can show them.

See the “GML Code Viewer setup” section below for the full workflow.

### 10. Flag / Global Viewer

The Flag / Global Viewer is currently a **safe metadata/index viewer**. It can show real flag names if you provide a `SFT_DDM_RealFlags.txt` file before installing.

Live runtime flag reading/editing is intentionally limited because direct runtime flag reads previously caused crashes in testing.

### 11. Runtime Logger

Runtime Logger records useful runtime events and debug notes. R8+ adds an optional side overlay.

Logger categories include:

```text
[MIXED]   General combined log view
[ROOM]    Room changes and room-state notes
[OBJ]     Object/debug object notes
[SPAWN]   Object spawner events
[SCRIPT]  Script call events
[FLAG]    Flag/metadata notes
[MARK]    Manual markers
[SYSTEM]  Mod/system messages
```

The overlay can be set to left, right, top, or bottom in UI Settings. You can also pick the logger page/tab and row count.

### 12. Save Tools

Save Tools is a safe preview/safety area for future save inspection work. It avoids aggressive live save editing. For real save/flag editing, keep using proper save-editor workflows and backups.

### 13. Script Call

Script Call is a dangerous advanced feature for calling scripts manually.

Only use it if you understand that calling the wrong script can:

- Softlock the room.
- Start a cutscene.
- Break the camera.
- Open/close menus.
- Trigger battle or failure behavior.
- Crash the game.

### 14. Object Spawner

Object Spawner lets you spawn selected existing objects.

Important: spawned objects run their real game code. This means a spawned object can do exactly what it was programmed to do. If it is a controller, failure object, menu object, battle object, or quit object, it may control the game, break the state, or close the game.

Use Object Spawner on test saves only.

### 15. Mouse / Click Inspector

Mouse/click inspector tools are meant for selecting or inspecting things under the mouse. The mouse toggle can also be useful just to show the cursor while debugging.

### 16. UI Settings

UI Settings controls debug menu behavior and saves to:

```text
SFT_DDM_SETTINGS.ini
```

Settings include UI scale/layout choices, controller support, logger overlay position/page, no-clip preferences, visual overlay toggles, and other debug menu options.

---

## Persistent settings file

The mod stores its own debug menu settings in:

```text
SFT_DDM_SETTINGS.ini
```

This is separate from DELTARUNE’s own save/config files. It exists so debug menu toggles can persist between launches without requiring you to reconfigure everything.

If the debug menu settings get weird, close the game and delete `SFT_DDM_SETTINGS.ini`. The mod should recreate defaults.

---

## GML Code Viewer setup

The mod does not include DELTARUNE’s exported GML code. You must export the code yourself from your own copy.

Expected folder layout beside the `.csx`:

```text
SFT_DDM_GML_Source/
  CH1/
  CH2/
  CH3/
  CH4/
  CH5/
  ChapSelect/
```

Put the exported GML files for each target into the matching folder.

Example:

```text
SFT_DDM_GML_Source/CH5/gml_GlobalScript_scr_example.gml
SFT_DDM_GML_Source/CH5/gml_Object_obj_example_Step_0.gml
```

Then open the matching chapter data file in UMT and run the `.csx`.

During install, the script looks for matching exported files and embeds a limited preview into the mod. This avoids shipping or loading the game’s code separately.

### Why are previews capped?

Full exported GML can be huge. Embedding everything into the patched data file can make UMT slow, make the data file larger, or cause crashes. The mod intentionally embeds safe previews instead of unlimited full source.

### Why not include exported code in the download?

DELTARUNE’s code belongs to Toby Fox / the DELTARUNE team. This mod package intentionally does not redistribute exported game code or assets.

---

## Real flag metadata setup

The mod can optionally use a file named:

```text
SFT_DDM_RealFlags.txt
```

Put it beside the `.csx` before running the installer script.

Format:

```text
index|name|type|description
```

Example:

```text
250|FLAGS.AUTO_RUN_ENABLED|setting|Auto-run toggle used by config/settings.
251|FLAGS.SIMPLIFIED_VFX_ENABLED|setting|Simplify VFX toggle used by config/settings.
```

A sample file is included:

```text
SFT_DDM_RealFlags_SAMPLE.txt
```

### Using Tenna Editor research

A helper script is included:

```text
TennaFlags_To_SFT_DDM_RealFlags.py
```

This is intended to convert a user-provided Tenna Editor `flags.ts` file into `SFT_DDM_RealFlags.txt`.

Basic idea:

```text
python TennaFlags_To_SFT_DDM_RealFlags.py path/to/flags.ts SFT_DDM_RealFlags.txt
```

The package does not include Tenna Editor’s full data files. If you use third-party flag metadata, make sure you follow that project’s license and attribution requirements.

---

## Troubleshooting

### UMT says there is a C# syntax error

Make sure you are using the newest `.csx` from this package. Older test builds had a few embedded quote issues that were fixed by R8.1/R8.2.

### The menu does not open

Try:

- Make sure the patched data file was actually saved.
- Try `F3` in a normal gameplay room.
- Try `Back + Start` on controller.
- Check whether another mod patched the same object/scripts.
- Repatch a fresh backup with only this mod installed.

### No-clip breaks battles/dialogue

Turn no-clip off before entering battles, cutscenes, dialogue, or save/menu states. The mod tries to auto-pause it, but the safest option is still to disable no-clip before scripted sequences.

### Object Spawner closes the game

That can happen if you spawn an object whose normal code closes the game or triggers failure behavior. This is expected for some objects. Use a test save.

### GML Viewer only shows names, not code previews

That means no exported GML source folder was found, the wrong subfolder was used, or the preview limit did not include that file.

Check:

```text
SFT_DDM_GML_Source/CH1/
SFT_DDM_GML_Source/CH2/
SFT_DDM_GML_Source/CH3/
SFT_DDM_GML_Source/CH4/
SFT_DDM_GML_Source/CH5/
SFT_DDM_GML_Source/ChapSelect/
```

Then rerun the `.csx` installer on a fresh backup.

### Flag Viewer still does not show live values

That is intentional in this release candidate. It prioritizes stability. Real flag names/metadata can be shown, but live editing/unsafe reads are limited.

---

## Known limitations

- GML Code Viewer embeds previews, not full unlimited source.
- Flag Viewer is metadata-first, not a full live flag editor.
- Object Spawner can run dangerous object code.
- Script Call can break rooms or crash the game.
- Not every chapter has the same objects/scripts/resources.
- Other mods that patch the same resources may conflict.

---

## Publishing / redistribution notes

This mod package may include the mod `.csx`, documentation, placeholders, and helper scripts.

Do not upload packages containing:

- DELTARUNE exported GML code.
- DELTARUNE sprites.
- DELTARUNE music or sound effects.
- DELTARUNE `data.win` files.
- Modified full game data files.
- Any copyrighted game assets that are not yours to distribute.

Users should patch their own legally obtained copy.

---

## Credits

- Mod / package: sonicFanTech / SFT.
- Tooling target: UndertaleModTool.
- DELTARUNE belongs to Toby Fox / the DELTARUNE team.
- Optional flag metadata research can be generated from user-provided external projects such as Tenna Editor, but those files are not bundled here.

---

## Final reminder

This is a debugging/research mod. It is meant to help you explore how the game works, find unused content, test rooms, and inspect resources. It is not designed for normal playthroughs.

Back up your saves. Back up your data files. Test on copies first.
