VidPlayer Official Codec Repository Website Files
=================================================

Upload or commit the contents of this directory to:

https://sonicfantech.org/Site/vidplayer/Edition/CS/PluginCODECS/

IMPORTANT
---------

VidPlayer only displays packages listed inside index.json. Merely placing a
.vpcodec file in packages/ does not add it to the online manager.

Use Generate-Repository-Index.cmd to scan every .vpcodec/.zip package in the
packages folder and rebuild index.json automatically.

For the Hello test plugin, use Prepare-Hello-Online-Repository.cmd. It builds
the package and regenerates index.json.

To write directly into your real SFT-Website checkout:

1. Run Set-Repository-Website-Path.cmd once.
2. Select:
   SFT-Website\Site\vidplayer\Edition\CS\PluginCODECS
3. Run Prepare-Hello-Online-Repository.cmd.

The script then updates both this local template and the selected website
folder, including packages/HelloCodecTest.vpcodec and index.json.

Optional browser blocking
-------------------------

.htaccess.example contains an Apache rule that blocks index.json and package
files unless the request includes VidPlayer's client header. Rename it to
.htaccess only when the web host supports Apache overrides.

This is not authentication. Package integrity is provided by the SHA-256 value
stored in index.json.
