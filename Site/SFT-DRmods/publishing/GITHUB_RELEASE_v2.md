# SFT DELTARUNE Debug Menu v2 — Release Notes

## Release summary

This is the first public v2 release candidate of the SFT DELTARUNE Debug Menu. v2 replaces the older v1 debug menu as the recommended download while keeping v1 available as a legacy option.

v2 focuses on a cleaner UI, controller support, persistent debug settings, safer no-clip behavior, the new V2 Labs research tools, GML Code Viewer support, real flag metadata support, and a Runtime Logger side overlay.

## Download assets

Recommended asset:

```text
DR_DDM_V2.zip
```

Inside:

```text
DR_DDM_v2.csx
README.md
NOTICE_NO_GAME_ASSETS.md
SFT_DDM_GML_Source/ placeholder folders
SFT_DDM_RealFlags_SAMPLE.txt
TennaFlags_To_SFT_DDM_RealFlags.py
```

Legacy v1 remains available separately for users who want the older menu.

## Major changes from v1

- New v2 menu branding.
- Cleaner drawn UI instead of the older custom image-heavy UI.
- Scroll-safe menu layout for the expanded feature list.
- Xbox-style controller support.
- Persistent settings saved to `SFT_DDM_SETTINGS.ini`.
- New GML Code Viewer with optional exported-code previews.
- New Flag/Global Viewer with optional real flag metadata.
- Runtime Logger with always-show side overlay.
- Logger pages/tabs for mixed, rooms, objects, actions, and system logs.
- Runtime logger overlay position settings.
- Object Spawner.
- Script Call page.
- Save Tools safety page.
- Click/mouse inspection tools.
- Safer no-clip auto-pausing during battle/dialogue/cutscene/busy states.
- Removed the confusing custom UI asset toggle.

## Important safety notes

This is a debugging mod, not a normal gameplay mod.

Before installing:

- Back up your chapter data file.
- Back up your saves.
- Test on copies first.

Object Spawner and Script Call can trigger real game behavior out of context. Some objects can close the game, crash, softlock, or start scripted states.

## GML Code Viewer notes

The public download does not include DELTARUNE code.

Users who want code previews must export GML from their own copy and place it in:

```text
SFT_DDM_GML_Source/CH1/
SFT_DDM_GML_Source/CH2/
SFT_DDM_GML_Source/CH3/
SFT_DDM_GML_Source/CH4/
SFT_DDM_GML_Source/CH5/
SFT_DDM_GML_Source/ChapSelect/
```

The installer embeds limited preview snippets during patching.

## Known limitations

- Flag Viewer is metadata-first and does not live-edit every flag.
- GML Code Viewer embeds previews only.
- Some chapter resources differ, so behavior can vary per chapter.
- Other mods that patch the same objects/scripts may conflict.

## Suggested release tags

```text
DELTARUNE
UndertaleModTool
UMT
CSX
Debug Menu
Modding
Research Tool
Unused Content
Room Select
```
