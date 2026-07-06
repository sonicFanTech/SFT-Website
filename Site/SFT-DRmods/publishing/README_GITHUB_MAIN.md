# SFT DELTARUNE Debug Menu v2

> Unofficial fan-made UndertaleModTool `.csx` debugging/research menu for DELTARUNE Chapters 1–5.

![Status](https://img.shields.io/badge/status-release_candidate-yellow)
![Mod Type](https://img.shields.io/badge/type-UMT%20CSX-cyan)
![Game](https://img.shields.io/badge/game-DELTARUNE-blue)
![Version](https://img.shields.io/badge/version-v2-purple)

## About

**SFT DELTARUNE Debug Menu v2** is a fan-made debugging and research mod for DELTARUNE. It adds an in-game menu with room warping, no-clip, visual/collision overlays, sound testing, sprite/animation viewing, object browsing, a GML code index viewer, flag metadata viewing, runtime logging, save tools, script calling, object spawning, mouse/click inspection, controller support, and persistent UI settings.

This project is made for modding, testing, unused-content research, and learning how the game is structured. It is not made for normal playthroughs.

## Important warning

Back up your `data.win` and save files before using this mod.

Some features are intentionally powerful and can break the game state. Object Spawner can run real object code. Script Call can trigger scripts out of context. No-clip can break camera/menu/battle states if used at the wrong time. Use test saves.

## Features

- Room Select with search.
- Player/movement tools, including no-clip and speed helpers.
- Visual/collision overlays.
- Sound Test for chapter music/SFX.
- Sprite and Animation Viewer.
- Battle/Test Room helpers.
- Runtime Info.
- Object Browser.
- GML Code Viewer with optional exported-code previews.
- Flag/Global Viewer with optional real flag metadata.
- Runtime Logger with optional side overlay and log pages.
- Save Tools safety/preview area.
- Script Call for advanced testing.
- Object Spawner for existing game objects.
- Mouse show/click inspector tools.
- Xbox-style controller support.
- Persistent settings saved to `SFT_DDM_SETTINGS.ini`.

## Installation

1. Back up your DELTARUNE chapter data file.
2. Open the data file in UndertaleModTool.
3. Run `DR_DDM_v2.csx` through `Scripts -> Run other script...`.
4. Save the patched data file.
5. Launch the game.
6. Press `F3` to open the debug menu.

Controller: `Back + Start` opens/closes the menu.

## GML Code Viewer setup

The public mod package does not include DELTARUNE source code.

To enable code previews:

```text
SFT_DDM_GML_Source/
  CH1/
  CH2/
  CH3/
  CH4/
  CH5/
  ChapSelect/
```

Export code from your own copy using UMT and place it into the matching folder before running the `.csx` installer. The installer embeds safe previews, not full unlimited source.

## Real flag metadata

Optional real flag metadata can be supplied with:

```text
SFT_DDM_RealFlags.txt
```

Format:

```text
index|name|type|description
```

A converter helper is included for user-provided Tenna Editor `flags.ts` data.

## What is not included

This repository/download should not contain:

- DELTARUNE game data files.
- Exported DELTARUNE GML source.
- DELTARUNE sprites/music/SFX.
- Modified full `data.win` files.
- Save files.

Users patch their own copy.

## Credits

- Mod: sonicFanTech / SFT.
- DELTARUNE: Toby Fox / DELTARUNE team.
- Tool target: UndertaleModTool.

## Disclaimer

This is an unofficial fan-made mod. It is not affiliated with Toby Fox or the DELTARUNE team.
