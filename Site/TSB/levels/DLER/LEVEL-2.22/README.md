# Level 2.22 Archive Explorer — Darkness-Balanced Lighting Pass

This is the darker, render-calibrated browser-based first-person prototype for Level 2.22.

## Start the local test server on Windows

1. Extract the ZIP into a new folder.
2. Double-click `serve-local.bat`.
3. Keep the Command Prompt window open while testing.
4. Use the browser tab that opens automatically at `http://127.0.0.1:8000/`.

Do not open `index.html` directly from File Explorer. The viewer uses JavaScript modules and `.glb` files, so it must run through a web server.

## Controls

- `W`, `A`, `S`, `D`: move
- Mouse: look around
- `Space`: jump
- `F`: toggle the optional visibility light
- `G`: open Graphics Settings
- `R`: respawn
- `Esc`: release mouse / pause

## Main lighting changes in this version

- Recalibrates every explorable zone against its supplied final render image instead of applying one generic brightness profile.
- Greatly reduces ambient and hemisphere fill light so intentionally dark corners remain dark.
- Reduces fluorescent fixture spill and limits the number of additional point lights used to approximate bounced light.
- Removes the previous brightness increase from the Ultra preset. Graphics-quality presets now change rendering cost, not the intended mood.
- Starts the optional player visibility light **OFF**. Press `F` when temporary extra visibility is needed.
- Adds a persistent Scene Brightness slider under Graphics Settings. `100%` is the render-matched default.
- Uses much stricter lighting profiles for Area 06, Area 12, and Area 21 because their supplied renders contain large near-black regions.
- Narrows and reduces special red, green, blue, and amber effect lights so they stay localized.

## Render-reference notes

The supplied renders show several intentionally different lighting groups:

- Areas 01, 03, 07, 10, and 11: readable fluorescent garage lighting.
- Areas 02, 05, 13, and 20: dimmer transitional lighting with deeper shadows.
- Area 04: warm older service-elevator lighting.
- Area 06: very dark maintenance region with a concentrated amber work-light pool.
- Area 08: front fluorescent fixtures with a localized red emergency landing.
- Area 12: mostly dark garage entrance with distant cold-green exterior haze.
- Area 21: mostly black unfinished installation with localized amber work light.

## Important limitation

The supplied `.glb` files do not include Cycles-baked lightmaps. This build approximates the Blender render lighting with real-time WebGL effects. A later Blender lightmap bake would improve the match further by preserving exact static light gradients, indirect bounced lighting, and soft shadows.

## Hosting

Upload the extracted files to a static web host while preserving the folder structure. The viewer bundles its required Three.js module files locally under `assets/vendor/three`, so the WebGL runtime does not depend on CDN-hosted JavaScript.
