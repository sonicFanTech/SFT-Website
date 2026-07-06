// UNDERTALE Debug Menu Port v1.2 for UndertaleModTool
// Ported from sonicFanTech's DELTARUNE Debug Menu v2.
// Run this script in UMT after opening UNDERTALE's data.win, then save a modded copy.
// This version removes / downgrades DELTARUNE and GMS2-only systems so it can run on classic UNDERTALE.
//
// In-game controls:
//   F3              Open / close the debug menu
//   Controller      Back + Start opens / closes the debug menu
//   Esc / B         Back / close
//   Backspace / X   Back, or delete a search character on searchable pages
//   Up / Down       Move through menu rows
//   D-pad / L-stick Move through menu rows on controller
//   Enter / A       Select menu row / run action
//   LB / RB         Page jump inside long lists
//
// v2 Labs R8 release-candidate cleanupaging update:
// - Toned-down default UI. Removed the old optional image-skin toggle to keep the UI clean.
// - Adds practical advanced debug lab pages for code index, flags/globals, runtime logs, save preview, script call, and object spawning.
// - Removes the over-aggressive menu-open safety block so F3/Back+Start opens again.
// - Keeps only no-clip safety pausing during battles/dialogue/menu states.
// - Cleans up the main menu scrolling/footer layout and adds persistent SFT_UTDM_SETTINGS.ini settings.
// - Adds external real-flag metadata import, per-game GML source snippet import, and runtime logger side overlay.
// - GML source snippets can be placed in SFT_UTDM_GML_Source/UNDERTALE next to this CSX.
// - R8 fixes Flag Viewer content_h crash, improves GML detail view, and adds logger overlay pages/positions.
//
// v2 public release notes:
// - First v2 lab/public candidate build.
// - Includes the readable UI font/alignment fix for rooms where UNDERTALE draw state
//   can make debug text appear garbled.
//
// Feature base:
// - No separate feature hotkeys anymore. Features are controlled from categories inside the menu.
// - Adds category menu: Room Select, Player/Movement, Visual/Collision, Sound Test,
//   Sprite Viewer, Battle/Test Rooms, Runtime Info, and Object Browser.
// - Adds more overlay/debug drawing options.
//
// Notes:
// - This is a generic game-safe debug mod. True battle launching is left as safe room-warp only; direct battle launching is too game-specific for this port.
// - Object/background hiding is name-based and may need tuning for some rooms.

using System;
using System.Linq;
using System.Text;
using System.IO;
using System.Runtime.CompilerServices;
using System.Collections.Generic;
using ImageMagick;
using UndertaleModLib.Util;

EnsureDataLoaded();

bool sftTargetIsGms2 = Data.IsGameMaker2();
if (sftTargetIsGms2)
{
    ScriptWarning("This is the UNDERTALE/classic GameMaker port. It can patch this opened file, but the original DELTARUNE script is better for DELTARUNE/GMS2 data.");
}

string GmlString(string value)
{
    value ??= "";
    value = value.Replace("\r", " ").Replace("\n", " ").Replace("\t", " ");
    value = value.Replace("\\", "/").Replace("\"", "'");
    return "\"" + value + "\"";
}

string ReflectedNameContent(object value)
{
    if (value is null)
        return null;
    var nameObj = value.GetType().GetProperty("Name")?.GetValue(value);
    if (nameObj is null)
        return null;
    var contentObj = nameObj.GetType().GetProperty("Content")?.GetValue(nameObj);
    return contentObj as string;
}

bool HasAny(string text, params string[] needles)
{
    if (string.IsNullOrWhiteSpace(text))
        return false;
    string lower = text.ToLowerInvariant();
    return needles.Any(n => lower.Contains(n));
}

string AddListItems(string listName, IEnumerable<string> items)
{
    StringBuilder sb = new();
    foreach (var item in items.Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().OrderBy(s => s, StringComparer.OrdinalIgnoreCase))
        sb.AppendLine($"ds_list_add({listName}, {GmlString(item)});");
    return sb.ToString();
}

string AddMapItems(string mapName, IDictionary<string, string> items)
{
    StringBuilder sb = new();
    foreach (var pair in items.Where(p => !string.IsNullOrWhiteSpace(p.Key)).OrderBy(p => p.Key, StringComparer.OrdinalIgnoreCase))
        sb.AppendLine($"ds_map_replace({mapName}, {GmlString(pair.Key)}, {GmlString(pair.Value)});");
    return sb.ToString();
}

string FindSiblingFile(params string[] names)
{
    string scriptPath = GetThisScriptPath();
    string scriptDir = string.IsNullOrWhiteSpace(scriptPath) ? Directory.GetCurrentDirectory() : Path.GetDirectoryName(scriptPath);
    foreach (string name in names)
    {
        string candidate = Path.Combine(scriptDir, name);
        if (File.Exists(candidate))
            return candidate;
    }
    return null;
}

string FindSiblingFolder(params string[] names)
{
    string scriptPath = GetThisScriptPath();
    string scriptDir = string.IsNullOrWhiteSpace(scriptPath) ? Directory.GetCurrentDirectory() : Path.GetDirectoryName(scriptPath);
    foreach (string name in names)
    {
        string candidate = Path.Combine(scriptDir, name);
        if (Directory.Exists(candidate))
            return candidate;
    }
    return null;
}

string CompactSnippet(string text, int maxChars = 720)
{
    if (string.IsNullOrWhiteSpace(text)) return "No preview available.";
    text = text.Replace("\r", " ").Replace("\n", " ¶ ").Replace("\t", " ");
    while (text.Contains("  ")) text = text.Replace("  ", " ");
    if (text.Length > maxChars) text = text.Substring(0, maxChars) + "...";
    return text.Trim();
}


string FriendlyRelativeFolder(string folder, string root)
{
    if (string.IsNullOrWhiteSpace(folder)) return "not found";
    try
    {
        if (!string.IsNullOrWhiteSpace(root))
        {
            string rel = Path.GetRelativePath(root, folder);
            if (!rel.StartsWith("..")) return rel.Replace('\\', '/');
        }
    }
    catch { }
    return folder.Replace('\\', '/');
}

string ChooseBestGmlSourceFolder(string rootFolder, out string profileName, out int matchCount)
{
    profileName = "root";
    matchCount = 0;
    if (string.IsNullOrWhiteSpace(rootFolder) || !Directory.Exists(rootFolder)) return null;

    HashSet<string> currentCodeNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
    foreach (var c in Data.Code)
    {
        string n = c?.Name?.Content;
        if (!string.IsNullOrWhiteSpace(n)) currentCodeNames.Add(n);
    }
    foreach (var s in Data.Scripts)
    {
        string n = s?.Name?.Content;
        if (!string.IsNullOrWhiteSpace(n)) currentCodeNames.Add(n);
    }

    string[] validExts = new[] { ".gml", ".txt", ".yy" };
    var subFolders = Directory.GetDirectories(rootFolder)
        .Where(d => new[] { "UNDERTALE", "UT", "Undertale", "Export", "Code", "CH1", "CH2", "CH3", "CH4", "CH5", "ChapSelect", "ChapterSelect" }
            .Contains(Path.GetFileName(d), StringComparer.OrdinalIgnoreCase))
        .OrderBy(d => Path.GetFileName(d), StringComparer.OrdinalIgnoreCase)
        .ToList();

    string best = null;
    int bestScore = -1;
    int bestFileCount = -1;
    foreach (string folder in subFolders)
    {
        int score = 0;
        int fileCount = 0;
        foreach (string file in Directory.GetFiles(folder, "*.*", SearchOption.AllDirectories))
        {
            if (!validExts.Contains(Path.GetExtension(file), StringComparer.OrdinalIgnoreCase)) continue;
            fileCount++;
            string baseName = Path.GetFileNameWithoutExtension(file);
            if (currentCodeNames.Contains(baseName)) score++;
        }
        // Pick the game folder whose exported code names best match the currently-opened data file.
        if (score > bestScore || (score == bestScore && fileCount > bestFileCount))
        {
            best = folder;
            bestScore = score;
            bestFileCount = fileCount;
        }
    }

    if (best is not null && bestScore > 0)
    {
        profileName = Path.GetFileName(best);
        matchCount = bestScore;
        return best;
    }

    // Fallback: allow the old R6 behavior if files were placed directly in SFT_UTDM_GML_Source.
    int rootFiles = Directory.GetFiles(rootFolder, "*.*", SearchOption.TopDirectoryOnly)
        .Count(f => validExts.Contains(Path.GetExtension(f), StringComparer.OrdinalIgnoreCase));
    if (rootFiles > 0)
    {
        profileName = "root";
        matchCount = 0;
        return rootFolder;
    }

    // Last resort: use the best populated subfolder even when there are no filename matches.
    // This lets testers force a folder by only putting one game folder beside the CSX.
    if (best is not null)
    {
        profileName = Path.GetFileName(best) + " (fallback)";
        matchCount = Math.Max(0, bestScore);
        return best;
    }

    return null;
}


string AddNamedRoomItems(string listName, IEnumerable<UndertaleRoom> rooms)
{
    StringBuilder sb = new();
    int index = 0;
    foreach (var room in rooms)
    {
        if (room?.Name?.Content is string name && !string.IsNullOrWhiteSpace(name))
            sb.AppendLine($"ds_list_add({listName}, {GmlString(name + " (" + index + ")")});");
        index++;
    }
    return sb.ToString();
}

string GetThisScriptPath([CallerFilePath] string path = "") => path;

string StripSpriteFrameSuffix(string fileNameWithoutExtension)
{
    if (fileNameWithoutExtension.EndsWith("_0", StringComparison.OrdinalIgnoreCase))
        return fileNameWithoutExtension.Substring(0, fileNameWithoutExtension.Length - 2);
    return fileNameWithoutExtension;
}

string FindDebugUiAssetSpriteFolder()
{
    string scriptPath = GetThisScriptPath();
    string scriptDir = string.IsNullOrWhiteSpace(scriptPath) ? "" : Path.GetDirectoryName(scriptPath);

    List<string> candidates = new();
    if (!string.IsNullOrWhiteSpace(scriptDir))
    {
        candidates.Add(Path.Combine(scriptDir, "SFT_DebugUI_Assets", "Sprites"));
        candidates.Add(Path.Combine(scriptDir, "Sprites"));
    }
    candidates.Add(Path.Combine(Directory.GetCurrentDirectory(), "SFT_DebugUI_Assets", "Sprites"));
    candidates.Add(Path.Combine(Directory.GetCurrentDirectory(), "Sprites"));

    foreach (string candidate in candidates)
    {
        if (Directory.Exists(candidate) && Directory.GetFiles(candidate, "*.png", SearchOption.TopDirectoryOnly).Length > 0)
            return candidate;
    }
    return null;
}

bool ImportSingleFramePngSprite(string spriteName, string pngPath, bool replaceExisting)
{
    if (string.IsNullOrWhiteSpace(spriteName) || string.IsNullOrWhiteSpace(pngPath) || !File.Exists(pngPath))
        return false;

    // Keep repeat installs safe. Set replaceExisting to true while actively redesigning assets.
    UndertaleSprite sprite = Data.Sprites.ByName(spriteName);
    if (sprite is not null && !replaceExisting)
        return false;

    using MagickImage image = TextureWorker.ReadBGRAImageFromFile(pngPath);
    int width = (int)image.Width;
    int height = (int)image.Height;
    if (width <= 0 || height <= 0 || width > ushort.MaxValue || height > ushort.MaxValue)
        return false;

    UndertaleEmbeddedTexture texture = new();
    texture.Name = new UndertaleString($"SFT Debug UI Texture {spriteName}");
    texture.TextureData.Image = GMImage.FromMagickImage(image).ConvertToPng();
    Data.EmbeddedTextures.Add(texture);

    UndertaleTexturePageItem texturePageItem = new();
    texturePageItem.Name = new UndertaleString($"SFT Debug UI PageItem {spriteName}");
    texturePageItem.SourceX = 0;
    texturePageItem.SourceY = 0;
    texturePageItem.SourceWidth = (ushort)width;
    texturePageItem.SourceHeight = (ushort)height;
    texturePageItem.TargetX = 0;
    texturePageItem.TargetY = 0;
    texturePageItem.TargetWidth = (ushort)width;
    texturePageItem.TargetHeight = (ushort)height;
    texturePageItem.BoundingWidth = (ushort)width;
    texturePageItem.BoundingHeight = (ushort)height;
    texturePageItem.TexturePage = texture;
    Data.TexturePageItems.Add(texturePageItem);

    UndertaleSprite.TextureEntry textureEntry = new();
    textureEntry.Texture = texturePageItem;

    if (sprite is null)
    {
        sprite = new UndertaleSprite();
        sprite.Name = Data.Strings.MakeString(spriteName);
        Data.Sprites.Add(sprite);
    }

    sprite.Width = (uint)width;
    sprite.Height = (uint)height;
    sprite.MarginLeft = 0;
    sprite.MarginTop = 0;
    sprite.MarginRight = width - 1;
    sprite.MarginBottom = height - 1;
    sprite.OriginX = width / 2;
    sprite.OriginY = height / 2;
    sprite.Textures.Clear();
    sprite.Textures.Add(textureEntry);
    return true;
}

(int imported, int skipped, string sourceFolder) AutoImportDebugUiSprites()
{
    string assetFolder = FindDebugUiAssetSpriteFolder();
    if (assetFolder is null)
        return (0, 0, null);

    int imported = 0;
    int skipped = 0;
    bool replaceExisting = false;

    foreach (string png in Directory.GetFiles(assetFolder, "spr_sft_dbg*.png", SearchOption.TopDirectoryOnly).OrderBy(x => x, StringComparer.OrdinalIgnoreCase))
    {
        string spriteName = StripSpriteFrameSuffix(Path.GetFileNameWithoutExtension(png));
        try
        {
            if (ImportSingleFramePngSprite(spriteName, png, replaceExisting))
                imported++;
            else
                skipped++;
        }
        catch (Exception ex)
        {
            skipped++;
            ScriptWarning($"SFT Debug UI asset import skipped {Path.GetFileName(png)}: {ex.Message}");
        }
    }

    return (imported, skipped, assetFolder);
}

// v2 R8.2: the public build uses the clean drawn UI only, so no custom UI images are auto-imported.
var sftUiImportResult = (imported: 0, skipped: 0, sourceFolder: (string)null);

// R7 helper: write a patch-time code index next to this CSX and optionally embed snippets
// from SFT_UTDM_GML_Source. Preferred layout:
//   SFT_UTDM_GML_Source/CH1
//   SFT_UTDM_GML_Source/CH2
//   SFT_UTDM_GML_Source/CH3
//   SFT_UTDM_GML_Source/CH4
//   SFT_UTDM_GML_Source/CH5
//   SFT_UTDM_GML_Source/ChapSelect
// The script chooses the folder with the most exported-code filename matches for the currently-opened data file.
string sftCodeIndexPath = null;
string sftExternalCodeFolder = null;
string sftExternalCodeRootFolder = null;
string sftExternalCodeProfile = "not found";
int sftExternalCodeMatchCount = 0;
Dictionary<string, string> sftCodeSnippets = new(StringComparer.OrdinalIgnoreCase);
try
{
    string scriptPath = GetThisScriptPath();
    string scriptDir = string.IsNullOrWhiteSpace(scriptPath) ? Directory.GetCurrentDirectory() : Path.GetDirectoryName(scriptPath);
    sftCodeIndexPath = Path.Combine(scriptDir, "SFT_UTDM_GML_CodeIndex.txt");

    sftExternalCodeRootFolder = FindSiblingFolder("SFT_UTDM_GML_Source", "SFT_DDM_GML_Source");
    if (!string.IsNullOrWhiteSpace(sftExternalCodeRootFolder))
    {
        sftExternalCodeFolder = ChooseBestGmlSourceFolder(sftExternalCodeRootFolder, out sftExternalCodeProfile, out sftExternalCodeMatchCount);
    }
    else
    {
        // Backward-compatible R6 folder names.
        sftExternalCodeFolder = FindSiblingFolder("ExportAllCode", "ExportedCode", "Exported_GML", "GML_Source", "Code");
        if (!string.IsNullOrWhiteSpace(sftExternalCodeFolder))
        {
            sftExternalCodeRootFolder = Path.GetDirectoryName(sftExternalCodeFolder);
            sftExternalCodeProfile = Path.GetFileName(sftExternalCodeFolder);
        }
    }

    if (!string.IsNullOrWhiteSpace(sftExternalCodeFolder))
    {
        foreach (string file in Directory.GetFiles(sftExternalCodeFolder, "*.*", SearchOption.AllDirectories)
            .Where(f => new[] { ".gml", ".txt", ".yy" }.Contains(Path.GetExtension(f), StringComparer.OrdinalIgnoreCase)))
        {
            try
            {
                string key = Path.GetFileNameWithoutExtension(file);
                string rel = FriendlyRelativeFolder(file, sftExternalCodeFolder);
                string[] lines = File.ReadLines(file, Encoding.UTF8)
                    .Select(l => l.Trim())
                    .Where(l => !string.IsNullOrWhiteSpace(l))
                    .Take(32)
                    .ToArray();
                if (!string.IsNullOrWhiteSpace(key) && lines.Length > 0)
                    sftCodeSnippets[key] = "[" + sftExternalCodeProfile + "] " + rel.Replace("/", " > ") + " :: " + CompactSnippet(string.Join("\n", lines));
            }
            catch { }
        }
    }

    using StreamWriter writer = new(sftCodeIndexPath, false, Encoding.UTF8);
    writer.WriteLine("SFT UNDERTALE Debug Menu Port v1.2 - GML Code Index");
    writer.WriteLine("Generated at install time from the currently opened data.win/data.win-like file.");
    writer.WriteLine("Runtime viewer uses the embedded list in the patched data.win.");
    writer.WriteLine("Preferred external source layout: SFT_UTDM_GML_Source/UNDERTALE or SFT_UTDM_GML_Source/UNDERTALE.");
    writer.WriteLine("Do not package exported UNDERTALE code with public mod downloads; let users export their own code locally.");
    writer.WriteLine("External source root: " + (sftExternalCodeRootFolder ?? "not found"));
    writer.WriteLine("External source folder used: " + (sftExternalCodeFolder ?? "not found"));
    writer.WriteLine("Detected source profile: " + sftExternalCodeProfile);
    writer.WriteLine("Filename matches for current data file: " + sftExternalCodeMatchCount);
    writer.WriteLine("Preview snippets embedded: " + sftCodeSnippets.Count);
    writer.WriteLine();
    writer.WriteLine("== Scripts ==");
    foreach (var s in Data.Scripts.Where(s => s?.Name?.Content is not null).Select(s => s.Name.Content).Distinct().OrderBy(s => s, StringComparer.OrdinalIgnoreCase))
        writer.WriteLine(s);
    writer.WriteLine();
    writer.WriteLine("== Code Entries ==");
    foreach (var c in Data.Code.Where(c => c?.Name?.Content is not null).Select(c => c.Name.Content).Distinct().OrderBy(s => s, StringComparer.OrdinalIgnoreCase))
        writer.WriteLine(c);
    writer.WriteLine();
    writer.WriteLine("== External Snippet Entries ==");
    foreach (var k in sftCodeSnippets.Keys.OrderBy(s => s, StringComparer.OrdinalIgnoreCase))
        writer.WriteLine(k + " :: " + sftCodeSnippets[k]);
}
catch (Exception ex)
{
    ScriptWarning($"SFT DDM code index/exported-source scan skipped: {ex.Message}");
}

List<string> roomNames = Data.Rooms
    .Where(r => r?.Name?.Content is not null)
    .Select(r => r.Name.Content)
    .Where(s => !string.IsNullOrWhiteSpace(s))
    .ToList();

List<string> soundNames = Data.Sounds
    .Where(s => s?.Name?.Content is not null)
    .Select(s => s.Name.Content)
    .Where(s => !string.IsNullOrWhiteSpace(s))
    .ToList();

List<string> spriteNames = Data.Sprites
    .Where(s => s?.Name?.Content is not null)
    .Select(s => s.Name.Content)
    .Where(s => !string.IsNullOrWhiteSpace(s))
    .ToList();

List<string> objectNames = Data.GameObjects
    .Where(o => o?.Name?.Content is not null)
    .Select(o => o.Name.Content)
    .Where(s => !string.IsNullOrWhiteSpace(s))
    .ToList();

List<string> codeNames = Data.Code
    .Where(c => c?.Name?.Content is not null)
    .Select(c => c.Name.Content)
    .Where(s => !string.IsNullOrWhiteSpace(s))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .OrderBy(s => s, StringComparer.OrdinalIgnoreCase)
    .ToList();

List<string> scriptNames = Data.Scripts
    .Where(s => s?.Name?.Content is not null)
    .Select(s => s.Name.Content)
    .Where(s => !string.IsNullOrWhiteSpace(s))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .OrderBy(s => s, StringComparer.OrdinalIgnoreCase)
    .ToList();

foreach (var key in sftCodeSnippets.Keys)
{
    if (!codeNames.Contains(key, StringComparer.OrdinalIgnoreCase))
        codeNames.Add(key);
}
codeNames = codeNames.Distinct(StringComparer.OrdinalIgnoreCase).OrderBy(s => s, StringComparer.OrdinalIgnoreCase).ToList();

var battleRoomNames = roomNames
    .Where(n => HasAny(n, "battle", "battletest", "testbattle", "fight", "enemy", "encounter", "arena", "flowey", "toriel", "papyrus", "undyne", "mettaton", "asgore", "sans"))
    .Select(n => n + " (battle/test)")
    .ToList();

var bgLayerNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
var floorLayerNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
var wallLayerNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
var collisionLayerNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

foreach (var room in Data.Rooms)
{
    if (room?.Layers is null)
        continue;
    foreach (var layer in room.Layers)
    {
        string layerName = layer?.LayerName?.Content;
        if (string.IsNullOrWhiteSpace(layerName))
            continue;
        if (HasAny(layerName, "bg", "back", "background", "sky", "parallax")) bgLayerNames.Add(layerName);
        if (HasAny(layerName, "floor", "ground", "tile", "tiles", "carpet", "road", "path")) floorLayerNames.Add(layerName);
        if (HasAny(layerName, "wall", "walls", "front")) wallLayerNames.Add(layerName);
        if (HasAny(layerName, "collision", "coll", "solid", "mask", "block")) collisionLayerNames.Add(layerName);
    }
}

var collisionObjectNames = objectNames.Where(n => HasAny(n, "collision", "collider", "solid", "wall", "block", "mask", "hitbox", "hurtbox")).ToList();
var characterObjectNames = objectNames.Where(n => HasAny(n, "npc", "character", "char", "kris", "susie", "ralsei", "noelle", "berdly", "enemy", "monster", "mainchara", "player", "chara", "frisk", "toriel", "sans", "papyrus", "undyne", "alphys", "asgore", "flowey", "mettaton")).ToList();
var interactObjectNames = objectNames.Where(n => HasAny(n, "interact", "talk", "event", "trigger", "warp", "door", "save", "sign", "npc", "chest", "switch", "button", "phone", "computer", "terminal", "shop", "cutscene", "device", "process", "readable", "giver", "room", "flowey", "sans", "papyrus", "toriel")).ToList();

// Flag/Global Viewer candidate list. Runtime UNDERTALE builds do not always expose variable_global_get_names(),
// so the menu uses a safe patch-time candidate list and variable_global_exists()/variable_global_get().
var globalCandidateNames = new List<string>()
{
    "flag", "plot", "plotroom", "route", "room", "roomname", "currentroom",
    "interact", "facing", "money", "gold", "level", "lv", "love", "hp", "maxhp", "playername", "name",
    "char", "chara", "frisk", "kills", "mercy", "save", "savefile", "savepoint",
    "battle", "battlemsg", "encounter", "gameover", "music", "lang", "weapon", "armor", "item", "phone"
};
// Generic numbered flag entries. Named flag descriptions can be mapped later from external save research
// runtime value reads remain off for stability.
for (int i = 0; i <= 999; i++)
    globalCandidateNames.Add($"flag[{i}]");

// Port metadata support. You can place SFT_UTDM_RealFlags.txt next to this CSX before installing.
// Each line format: global.flag[123] | Display name | type | description.
var sftRealFlagLabels = new List<string>()
{
    "global.flag[0] | Main plot flag | number | UNDERTALE's big story/progress flag family lives in global.flag[].",
    "global.plot | Plot | number | Common overall plot/progression variable.",
    "global.interact | Interaction lock | number | 0 when free; nonzero during text, menus, cutscenes, or events.",
    "global.kills | Kill count | number | Common runtime kill counter / route-related value.",
    "global.lv | LOVE/LV | number | Player LV/LOVE value.",
    "global.gold | Gold | number | Player money value.",
    "global.hp | HP | number | Player HP value.",
    "global.maxhp | Max HP | number | Player maximum HP value.",
    "global.name | Player name | string | Fallen human name / save name.",
    "global.room | Room save value | number | Common room/save location value.",
    "global.weapon | Weapon | number | Equipped weapon id/value.",
    "global.armor | Armor | number | Equipped armor id/value.",
    "global.item[0..7] | Inventory | array | Common item inventory slots.",
    "global.phone[0..7] | Phone menu | array | Common phone menu slots.",
    "global.true_reset | True reset state | number | Reset-related state used by UNDERTALE save/system data.",
    "global.osflavor | OS flavor | number/string | Runtime platform/OS helper value.",
    "global.language | Language | number/string | Runtime language-related value when present."
};
try
{
    string flagMetaFile = FindSiblingFile("SFT_UTDM_RealFlags.txt", "SFT_UTDM_Flags.txt", "SFT_DDM_RealFlags.txt", "SFT_DDM_Flags.txt");
    if (!string.IsNullOrWhiteSpace(flagMetaFile))
    {
        foreach (string rawLine in File.ReadAllLines(flagMetaFile, Encoding.UTF8))
        {
            string line = rawLine.Trim();
            if (line.Length == 0 || line.StartsWith("#")) continue;
            sftRealFlagLabels.Add(line);
        }
    }
}
catch (Exception ex)
{
    ScriptWarning($"SFT UTDM real flag metadata import skipped: {ex.Message}");
}
foreach (var flagLabel in sftRealFlagLabels)
    globalCandidateNames.Add(flagLabel);

try
{
    var variablesProp = Data.GetType().GetProperty("Variables");
    if (variablesProp?.GetValue(Data) is System.Collections.IEnumerable variables)
    {
        foreach (var variable in variables)
        {
            string name = ReflectedNameContent(variable);
            if (string.IsNullOrWhiteSpace(name))
                continue;
            if (name.StartsWith("global.", StringComparison.OrdinalIgnoreCase))
                name = name.Substring(7);
            if (HasAny(name, "flag", "plot", "route", "save", "game", "room", "state", "interact", "battle", "encounter", "party", "money", "gold", "hp", "tp", "dark", "light"))
                globalCandidateNames.Add(name);
        }
    }
}
catch
{
    // Reflection-based list building is best-effort only. The manual fallback list above is still usable.
}
globalCandidateNames = globalCandidateNames
    .Where(n => !string.IsNullOrWhiteSpace(n))
    .Select(n => n.Trim())
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .OrderBy(n => n, StringComparer.OrdinalIgnoreCase)
    .ToList();

var unsafeObjectNames = objectNames.Where(n => HasAny(n, "battle", "bullet", "heart", "soul", "fight", "enemybullet", "attackbox", "encounter")).ToList();

var obj = Data.GameObjects.ByName("obj_sft_debugmenu");
if (obj is null)
{
    obj = new UndertaleGameObject()
    {
        Name = Data.Strings.MakeString("obj_sft_debugmenu"),
        Persistent = true,
        Visible = true
    };
    Data.GameObjects.Add(obj);
}
else
{
    obj.Persistent = true;
    obj.Visible = true;
}

UndertaleModLib.Compiler.CodeImportGroup importGroup = new(Data)
{
    MainThreadAction = MainThreadAction
};

UndertaleRoom entryRoom = null;
try
{
    if (Data.GeneralInfo?.RoomOrder is not null && Data.GeneralInfo.RoomOrder.Count > 0)
        entryRoom = Data.GeneralInfo.RoomOrder[0].Resource;
}
catch { }
if (entryRoom is null)
    entryRoom = Data.Rooms.FirstOrDefault(r => r is not null);
if (entryRoom is null)
    throw new Exception("No room was found to place obj_sft_debugmenu into.");

bool addToRoom = true;
foreach (var inst in entryRoom.GameObjects)
{
    if (inst?.ObjectDefinition == obj)
    {
        addToRoom = false;
        break;
    }
}

if (addToRoom)
{
    var newRoomObject = new UndertaleRoom.GameObject()
    {
        InstanceID = Data.GeneralInfo.LastObj++,
        ObjectDefinition = obj,
        X = 0,
        Y = 0
    };
    entryRoom.GameObjects.Add(newRoomObject);

    // GMS2 rooms also keep instances inside instance layers. Classic UNDERTALE only uses GameObjects.
    if (sftTargetIsGms2)
    {
        UndertaleRoom.Layer targetLayer = null;
        foreach (var layer in entryRoom.Layers)
        {
            if (layer.LayerType != UndertaleRoom.LayerType.Instances)
                continue;
            if (targetLayer is null || targetLayer.LayerDepth > layer.LayerDepth)
                targetLayer = layer;
        }
        if (targetLayer is null)
        {
            uint maxLayerId = 0;
            foreach (var room2 in Data.Rooms)
            {
                if (room2?.Layers is null)
                    continue;
                foreach (var layer in room2.Layers)
                    if (layer.LayerId > maxLayerId)
                        maxLayerId = (uint)layer.LayerId;
            }
            targetLayer = new UndertaleRoom.Layer()
            {
                LayerName = Data.Strings.MakeString("SFT_DebugMenu_Layer"),
                Data = new UndertaleRoom.Layer.LayerInstancesData(),
                LayerType = UndertaleRoom.LayerType.Instances,
                LayerDepth = -1000000,
                LayerId = maxLayerId + 1,
                IsVisible = true
            };
            entryRoom.Layers.Add(targetLayer);
        }
        targetLayer.InstancesData.Instances.Add(newRoomObject);
    }
}

string createCode = @"
if (instance_number(object_index) > 1)
{
    instance_destroy()
    exit
}

persistent = true
visible = true
// Draw as far in front as classic GameMaker allows, so the debug GUI is less likely
// to be drawn underneath UNDERTALE room objects/text objects.
depth = -999999

// Use built-in UNDERTALE fonts instead of font_add(), because classic UNDERTALE does not ship the DELTARUNE TTF path used by the original mod.
drdbg_font = asset_get_index(""fnt_maintext"")
if (drdbg_font < 0) drdbg_font = asset_get_index(""fnt_main"")
if (drdbg_font < 0) drdbg_font = asset_get_index(""fnt_plain"")

drdbg_active = 0
drdbg_focus = 0
drdbg_category = 0
drdbg_category_count = 15
drdbg_search = """"
drdbg_selection = 0
drdbg_scroll = 0
drdbg_rebuild = 1
drdbg_max_rows = 14

// UI recode settings. Public version is now v2; these change how debug tools are displayed.
drdbg_ui_marker = 2
drdbg_use_old_ui = 0
drdbg_ui_side = 0       // 0 = center, 1 = left, 2 = right
drdbg_ui_scale = 1      // 0 = small, 1 = normal, 2 = large
drdbg_ui_layout = 1     // 0 = full, 1 = compact
drdbg_ui_theme = 0      // 0 = Ruins purple, 1 = Cyber neon, 2 = Lightner gold
drdbg_ui_assets = 0     // v2 R8.2: custom image skins disabled/removed; clean drawn UI is the default
drdbg_ui_glow = 0
drdbg_ui_dim = 1

// Controller support. Default mapping is Xbox-style: Back+Start open, A select, B back, X delete search text.
drdbg_controller_enabled = 1
drdbg_gamepad_id = 0
drdbg_gp_connected = 0
drdbg_gp_nav_cooldown = 0
drdbg_gp_prev_start = 0
drdbg_gp_prev_select = 0
drdbg_gp_prev_face1 = 0
drdbg_gp_prev_face2 = 0
drdbg_gp_prev_face3 = 0
drdbg_gp_prev_padu = 0
drdbg_gp_prev_padd = 0
drdbg_gp_prev_shoulderl = 0
drdbg_gp_prev_shoulderr = 0
// R5: removed the over-aggressive open-blocking safety system.
// The menu opens when requested; no-clip still auto-pauses during battles/dialogue/menu states.
drdbg_safety_mode = 0
drdbg_input_block_strict = 1
drdbg_freeze_scene_targets = 1
drdbg_guard_game_busy = 0
drdbg_guard_battle = 0
drdbg_auto_close_unsafe = 0
drdbg_saved_interact = 0
drdbg_was_active = 0
drdbg_freeze_x = 0
drdbg_freeze_y = 0
drdbg_open_block_reason = ""Ready. UNDERTALE port: GMS2 layer controls and DELTARUNE-only flag metadata were removed.""
drdbg_unsafe_reason = """"
drdbg_freeze_x_map = ds_map_create()
drdbg_freeze_y_map = ds_map_create()


drdbg_valid_chars = ""abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789 -.,:[]()""

drdbg_show_info = 1
drdbg_noclip = 0
drdbg_noclip_safety_pause = 1
drdbg_noclip_paused = 0
drdbg_noclip_pause_reason = """"
drdbg_hide_backgrounds = 0
drdbg_hide_floors = 0
drdbg_hide_walls = 0
drdbg_hide_collision_objects = 0
drdbg_hide_characters = 0
drdbg_show_collision_boxes = 0
drdbg_show_object_labels = 0
drdbg_show_room_bounds = 0
drdbg_show_player_marker = 1
drdbg_mouse_visible = 0
drdbg_click_inspector = 0
drdbg_show_interact_markers = 0
drdbg_show_all_object_labels = 0
drdbg_inspect_instance = noone
drdbg_inspect_name = """"
drdbg_inspect_summary = ""Click an object while inspector is enabled.""
drdbg_layer_dirty = 1
drdbg_last_room = -1

drdbg_base_speed = room_speed
drdbg_speed_scale = 1
drdbg_player = noone
drdbg_player_speed = 6

drdbg_sound_filter = 0
drdbg_sound_loop = 0
drdbg_playing_sound = -1
drdbg_object_visible_toggle = 1

drdbg_sprite_anim = 1
drdbg_sprite_frame = 0
drdbg_sprite_timer = 0

// Advanced/lab feature state. These are now part of the v2 lab build.
drdbg_v2_note = ""v2 advanced labs""
drdbg_code_selected = """"
drdbg_code_detail = ""Select code entry. R8 embeds a safe source preview from SFT_UTDM_GML_Source/UNDERTALE at install time.""
drdbg_code_source_note = ""Code snippets are embedded at install if a matching SFT_UTDM_GML_Source game folder is found beside the CSX.""
drdbg_code_filter = 0      // 0 all, 1 DEVICE, 2 PROCESS, 3 interact, 4 room, 5 obj
drdbg_flag_filter = 1      // 1 flag-like globals only, 0 all globals
drdbg_flag_selected = ""flag""
drdbg_flag_page = 0
drdbg_flag_status = ""R8 safe real flag metadata index. Live runtime value reads are disabled for stability.""
drdbg_flag_live_reads = 0      // intentionally off; value reads can crash in some UNDERTALE runtimes
drdbg_logger_enabled = 0
drdbg_logger_detail = 1
drdbg_logger_overlay = 0
drdbg_logger_overlay_pos = 1      // 0 left, 1 right, 2 top, 3 bottom
drdbg_logger_overlay_tab = 0      // 0 mixed, 1 room, 2 objects, 3 actions, 4 system
drdbg_logger_overlay_lines = 8
drdbg_log_timer = 0
drdbg_log_max = 80
drdbg_last_logged_room = room
drdbg_last_logged_instances = instance_number(all)
drdbg_save_slot = 0
drdbg_save_edit_unlocked = 0
drdbg_save_status = ""Save preview not loaded.""
drdbg_save_buffer = """"
drdbg_save_backup_status = ""No backup made yet.""
drdbg_script_selected = """"
drdbg_script_danger = 0
drdbg_script_status = ""Select a script first. Danger mode is OFF.""
drdbg_spawn_selected = """"
drdbg_spawn_at_mouse = 1
drdbg_last_spawn_status = ""Select an object, then use Spawn.""
drdbg_last_spawned = noone

drdbg_results = ds_list_create()
drdbg_rooms = ds_list_create()
drdbg_sounds = ds_list_create()
drdbg_sprites = ds_list_create()
drdbg_battle_rooms = ds_list_create()
drdbg_objects = ds_list_create()
drdbg_code = ds_list_create()
drdbg_code_info = ds_map_create()
drdbg_call_scripts = ds_list_create()
drdbg_globals = ds_list_create()
drdbg_unsafe_objects = ds_list_create()
drdbg_interact_objects = ds_list_create()
drdbg_save_files = ds_list_create()
drdbg_log = ds_list_create()
drdbg_layers_bg = ds_list_create()
drdbg_layers_floor = ds_list_create()
drdbg_layers_wall = ds_list_create()
drdbg_layers_collision = ds_list_create()
drdbg_objects_collision = ds_list_create()
drdbg_objects_character = ds_list_create()
" +
AddNamedRoomItems("drdbg_rooms", Data.Rooms) +
AddListItems("drdbg_sounds", soundNames) +
AddListItems("drdbg_sprites", spriteNames) +
AddListItems("drdbg_battle_rooms", battleRoomNames) +
AddListItems("drdbg_objects", objectNames) +
AddListItems("drdbg_code", codeNames) +
AddMapItems("drdbg_code_info", sftCodeSnippets) +
AddListItems("drdbg_call_scripts", scriptNames) +
AddListItems("drdbg_globals", globalCandidateNames) +
AddListItems("drdbg_unsafe_objects", unsafeObjectNames) +
AddListItems("drdbg_interact_objects", interactObjectNames) +
AddListItems("drdbg_save_files", new[] { "file0", "file8", "file9", "undertale.ini", "system_information_962", "system_information_963" }) +
AddListItems("drdbg_layers_bg", bgLayerNames) +
AddListItems("drdbg_layers_floor", floorLayerNames) +
AddListItems("drdbg_layers_wall", wallLayerNames) +
AddListItems("drdbg_layers_collision", collisionLayerNames) +
AddListItems("drdbg_objects_collision", collisionObjectNames) +
AddListItems("drdbg_objects_character", characterObjectNames) +
@"

// Persistent debug-menu settings. Relative INI files in UNDERTALE/GameMaker normally resolve to the game's save/appdata path.
drdbg_settings_file = ""SFT_UTDM_SETTINGS.ini""
drdbg_settings_save_timer = 0
drdbg_settings_status = ""Settings INI ready: SFT_UTDM_SETTINGS.ini""

if (file_exists(drdbg_settings_file))
{
    ini_open(drdbg_settings_file)
    drdbg_use_old_ui = ini_read_real(""UI"", ""use_old_ui"", drdbg_use_old_ui)
    drdbg_ui_side = ini_read_real(""UI"", ""side"", drdbg_ui_side)
    drdbg_ui_scale = ini_read_real(""UI"", ""scale"", drdbg_ui_scale)
    drdbg_ui_layout = ini_read_real(""UI"", ""layout"", drdbg_ui_layout)
    drdbg_ui_theme = ini_read_real(""UI"", ""theme"", drdbg_ui_theme)
    drdbg_ui_assets = 0
    drdbg_ui_glow = ini_read_real(""UI"", ""glow"", drdbg_ui_glow)
    drdbg_ui_dim = ini_read_real(""UI"", ""dim"", drdbg_ui_dim)
    drdbg_show_info = ini_read_real(""Overlay"", ""show_info"", drdbg_show_info)
    drdbg_noclip = ini_read_real(""Player"", ""noclip"", drdbg_noclip)
    drdbg_player_speed = ini_read_real(""Player"", ""noclip_speed"", drdbg_player_speed)
    drdbg_noclip_safety_pause = ini_read_real(""Player"", ""noclip_safety_pause"", drdbg_noclip_safety_pause)
    drdbg_hide_backgrounds = ini_read_real(""Visual"", ""hide_backgrounds"", drdbg_hide_backgrounds)
    drdbg_hide_floors = ini_read_real(""Visual"", ""hide_floors"", drdbg_hide_floors)
    drdbg_hide_walls = ini_read_real(""Visual"", ""hide_walls"", drdbg_hide_walls)
    drdbg_hide_collision_objects = ini_read_real(""Visual"", ""hide_collision_objects"", drdbg_hide_collision_objects)
    drdbg_hide_characters = ini_read_real(""Visual"", ""hide_characters"", drdbg_hide_characters)
    drdbg_show_collision_boxes = ini_read_real(""Visual"", ""show_collision_boxes"", drdbg_show_collision_boxes)
    drdbg_show_object_labels = ini_read_real(""Visual"", ""show_object_labels"", drdbg_show_object_labels)
    drdbg_show_room_bounds = ini_read_real(""Visual"", ""show_room_bounds"", drdbg_show_room_bounds)
    drdbg_show_player_marker = ini_read_real(""Visual"", ""show_player_marker"", drdbg_show_player_marker)
    drdbg_mouse_visible = ini_read_real(""Mouse"", ""mouse_visible"", drdbg_mouse_visible)
    drdbg_click_inspector = ini_read_real(""Mouse"", ""click_inspector"", drdbg_click_inspector)
    drdbg_show_interact_markers = ini_read_real(""Mouse"", ""show_interact_markers"", drdbg_show_interact_markers)
    drdbg_show_all_object_labels = ini_read_real(""Mouse"", ""show_all_object_labels"", drdbg_show_all_object_labels)
    drdbg_controller_enabled = ini_read_real(""Controller"", ""enabled"", drdbg_controller_enabled)
    drdbg_gamepad_id = ini_read_real(""Controller"", ""slot"", drdbg_gamepad_id)
    drdbg_sound_filter = ini_read_real(""Sound"", ""filter"", drdbg_sound_filter)
    drdbg_sound_loop = ini_read_real(""Sound"", ""loop"", drdbg_sound_loop)
    drdbg_sprite_anim = ini_read_real(""Sprite"", ""animate_preview"", drdbg_sprite_anim)
    drdbg_logger_enabled = ini_read_real(""Logger"", ""enabled"", drdbg_logger_enabled)
    drdbg_logger_detail = ini_read_real(""Logger"", ""detail"", drdbg_logger_detail)
    drdbg_logger_overlay = ini_read_real(""Logger"", ""overlay_always_show"", drdbg_logger_overlay)
    drdbg_logger_overlay_pos = ini_read_real(""Logger"", ""overlay_pos"", drdbg_logger_overlay_pos)
    drdbg_logger_overlay_tab = ini_read_real(""Logger"", ""overlay_tab"", drdbg_logger_overlay_tab)
    drdbg_logger_overlay_lines = ini_read_real(""Logger"", ""overlay_lines"", drdbg_logger_overlay_lines)
    ini_close()
    drdbg_settings_status = ""Loaded SFT_UTDM_SETTINGS.ini""
}
";

string stepCode = @"
// Keep this object drawing last/front-most after room changes or object depth changes.
depth = -999999

// Input state. F3 is still the keyboard shortcut, and Xbox-style controllers use Back + Start.
drdbg_gp_connected = 0
var drdbg_gp_open = 0
var drdbg_gp_accept = 0
var drdbg_gp_back = 0
var drdbg_gp_delete = 0
var drdbg_gp_nav_up = 0
var drdbg_gp_nav_down = 0
var drdbg_gp_page_up = 0
var drdbg_gp_page_down = 0

if (drdbg_controller_enabled)
{
    if (!gamepad_is_connected(drdbg_gamepad_id))
    {
        for (var gi = 0; gi < 4; gi++)
        {
            if (gamepad_is_connected(gi))
            {
                drdbg_gamepad_id = gi
                break
            }
        }
    }

    drdbg_gp_connected = gamepad_is_connected(drdbg_gamepad_id)
    if (drdbg_gp_connected)
    {
        var gp_start_now = gamepad_button_check(drdbg_gamepad_id, gp_start)
        var gp_select_now = gamepad_button_check(drdbg_gamepad_id, gp_select)
        var gp_face1_now = gamepad_button_check(drdbg_gamepad_id, gp_face1)
        var gp_face2_now = gamepad_button_check(drdbg_gamepad_id, gp_face2)
        var gp_face3_now = gamepad_button_check(drdbg_gamepad_id, gp_face3)
        var gp_padu_now = gamepad_button_check(drdbg_gamepad_id, gp_padu)
        var gp_padd_now = gamepad_button_check(drdbg_gamepad_id, gp_padd)
        var gp_shoulderl_now = gamepad_button_check(drdbg_gamepad_id, gp_shoulderl)
        var gp_shoulderr_now = gamepad_button_check(drdbg_gamepad_id, gp_shoulderr)

        var gp_start_pressed = gp_start_now && !drdbg_gp_prev_start
        var gp_select_pressed = gp_select_now && !drdbg_gp_prev_select
        var gp_face1_pressed = gp_face1_now && !drdbg_gp_prev_face1
        var gp_face2_pressed = gp_face2_now && !drdbg_gp_prev_face2
        var gp_face3_pressed = gp_face3_now && !drdbg_gp_prev_face3
        var gp_padu_pressed = gp_padu_now && !drdbg_gp_prev_padu
        var gp_padd_pressed = gp_padd_now && !drdbg_gp_prev_padd
        var gp_shoulderl_pressed = gp_shoulderl_now && !drdbg_gp_prev_shoulderl
        var gp_shoulderr_pressed = gp_shoulderr_now && !drdbg_gp_prev_shoulderr

        drdbg_gp_open = (gp_select_now && gp_start_pressed) || (gp_start_now && gp_select_pressed)
        drdbg_gp_accept = gp_face1_pressed
        drdbg_gp_back = gp_face2_pressed
        drdbg_gp_delete = gp_face3_pressed
        drdbg_gp_page_up = gp_shoulderl_pressed
        drdbg_gp_page_down = gp_shoulderr_pressed

        var stick_y = gamepad_axis_value(drdbg_gamepad_id, gp_axislv)
        var held_up = gp_padu_now || stick_y < -0.55
        var held_down = gp_padd_now || stick_y > 0.55

        if (gp_padu_pressed)
        {
            drdbg_gp_nav_up = 1
            drdbg_gp_nav_cooldown = 13
        }
        else if (gp_padd_pressed)
        {
            drdbg_gp_nav_down = 1
            drdbg_gp_nav_cooldown = 13
        }
        else if (held_up || held_down)
        {
            if (drdbg_gp_nav_cooldown <= 0)
            {
                if (held_up) drdbg_gp_nav_up = 1
                if (held_down) drdbg_gp_nav_down = 1
                drdbg_gp_nav_cooldown = 7
            }
            else drdbg_gp_nav_cooldown -= 1
        }
        else drdbg_gp_nav_cooldown = 0

        drdbg_gp_prev_start = gp_start_now
        drdbg_gp_prev_select = gp_select_now
        drdbg_gp_prev_face1 = gp_face1_now
        drdbg_gp_prev_face2 = gp_face2_now
        drdbg_gp_prev_face3 = gp_face3_now
        drdbg_gp_prev_padu = gp_padu_now
        drdbg_gp_prev_padd = gp_padd_now
        drdbg_gp_prev_shoulderl = gp_shoulderl_now
        drdbg_gp_prev_shoulderr = gp_shoulderr_now
    }
    else
    {
        drdbg_gp_prev_start = 0
        drdbg_gp_prev_select = 0
        drdbg_gp_prev_face1 = 0
        drdbg_gp_prev_face2 = 0
        drdbg_gp_prev_face3 = 0
        drdbg_gp_prev_padu = 0
        drdbg_gp_prev_padd = 0
        drdbg_gp_prev_shoulderl = 0
        drdbg_gp_prev_shoulderr = 0
    }
}

// Open / close the debug menu. R5 intentionally removes the soft safety/open-block system
// because it could false-positive and stop the menu from opening in normal rooms.
var drdbg_key_open = keyboard_check_pressed(vk_f3)
if (drdbg_key_open || drdbg_gp_open)
{
    if (!drdbg_active)
    {
        if (variable_global_exists(""interact"")) drdbg_saved_interact = variable_global_get(""interact"")
        else drdbg_saved_interact = 0
        ds_map_clear(drdbg_freeze_x_map)
        ds_map_clear(drdbg_freeze_y_map)
        drdbg_active = 1
        drdbg_open_block_reason = ""R5 safety open-block removed. No-clip still pauses during battles/dialogue.""
    }
    else
    {
        drdbg_active = 0
        if (variable_global_exists(""interact"")) variable_global_set(""interact"", drdbg_saved_interact)
        ds_map_clear(drdbg_freeze_x_map)
        ds_map_clear(drdbg_freeze_y_map)
    }

    drdbg_focus = 0
    drdbg_search = """"
    drdbg_selection = 0
    drdbg_scroll = 0
    drdbg_rebuild = 1
    if (drdbg_key_open) keyboard_clear(vk_f3)
}

// Find a likely player object every step so info/teleport/no-clip can work on most games.
drdbg_player = noone
var po = asset_get_index(""obj_mainchara"")
if (po >= 0 && instance_number(po) > 0) drdbg_player = instance_find(po, 0)
if (!instance_exists(drdbg_player))
{
    po = asset_get_index(""obj_player"")
    if (po >= 0 && instance_number(po) > 0) drdbg_player = instance_find(po, 0)
}
if (!instance_exists(drdbg_player))
{
    po = asset_get_index(""obj_kris"")
    if (po >= 0 && instance_number(po) > 0) drdbg_player = instance_find(po, 0)
}
if (!instance_exists(drdbg_player))
{
    po = asset_get_index(""obj_mainchara_ch1"")
    if (po >= 0 && instance_number(po) > 0) drdbg_player = instance_find(po, 0)
}

// If the menu just opened, remember the player position and hard-freeze it while the menu is active.
if (drdbg_active && !drdbg_was_active && instance_exists(drdbg_player))
{
    drdbg_freeze_x = drdbg_player.x
    drdbg_freeze_y = drdbg_player.y
}

if (drdbg_active && drdbg_input_block_strict && instance_exists(drdbg_player))
{
    drdbg_player.x = drdbg_freeze_x
    drdbg_player.y = drdbg_freeze_y
    drdbg_player.speed = 0
    drdbg_player.hspeed = 0
    drdbg_player.vspeed = 0
}

// If a battle-like state appears while the debug menu is open, close immediately.
// This avoids the battle/camera/input corruption seen when entering fights with the menu open.
if (0 && drdbg_active && drdbg_auto_close_unsafe && drdbg_guard_battle && drdbg_safety_mode > 0)
{
    var drdbg_force_close = 0
    drdbg_unsafe_reason = """"
    var drdbg_room_lower2 = string_lower(room_get_name(room))
    if (string_pos(""battle"", drdbg_room_lower2) > 0 || string_pos(""fight"", drdbg_room_lower2) > 0)
    {
        drdbg_force_close = 1
        drdbg_unsafe_reason = ""battle room""
    }
    if (!drdbg_force_close && drdbg_safety_mode > 0)
    {
        for (var bo2 = 0; bo2 < ds_list_size(drdbg_unsafe_objects); bo2++)
        {
            var bobj2 = asset_get_index(ds_list_find_value(drdbg_unsafe_objects, bo2))
            if (bobj2 >= 0 && instance_number(bobj2) > 0)
            {
                drdbg_force_close = 1
                drdbg_unsafe_reason = ""battle-like object: "" + ds_list_find_value(drdbg_unsafe_objects, bo2)
                break
            }
        }
    }
    if (drdbg_force_close)
    {
        drdbg_active = 0
        if (variable_global_exists(""interact"")) variable_global_set(""interact"", drdbg_saved_interact)
        ds_map_clear(drdbg_freeze_x_map)
        ds_map_clear(drdbg_freeze_y_map)
        drdbg_open_block_reason = ""Auto-closed debug menu: "" + drdbg_unsafe_reason
        if (ds_exists(drdbg_log, ds_type_list))
        {
            ds_list_add(drdbg_log, ""[SYSTEM] "" + drdbg_open_block_reason + "" @ "" + string(current_time))
            while (ds_list_size(drdbg_log) > drdbg_log_max) ds_list_delete(drdbg_log, 0)
        }
    }
}

drdbg_was_active = drdbg_active

// No-clip movement only runs while the menu is closed, so the menu does not fight player input.
// R4 also pauses no-clip automatically during battles, dialogue/text boxes, cutscenes, and busy menu states.
drdbg_noclip_paused = 0
drdbg_noclip_pause_reason = """"
if (drdbg_noclip && drdbg_noclip_safety_pause)
{
    var pause_room = string_lower(room_get_name(room))
    if (string_pos(""battle"", pause_room) > 0 || string_pos(""fight"", pause_room) > 0)
    {
        drdbg_noclip_paused = 1
        drdbg_noclip_pause_reason = ""battle room""
    }
    if (!drdbg_noclip_paused && variable_global_exists(""interact""))
    {
        if (variable_global_get(""interact"") != 0)
        {
            drdbg_noclip_paused = 1
            drdbg_noclip_pause_reason = ""interact/menu/dialogue busy""
        }
    }
    if (!drdbg_noclip_paused)
    {
        for (var nbo = 0; nbo < ds_list_size(drdbg_unsafe_objects); nbo++)
        {
            var nbobj = asset_get_index(ds_list_find_value(drdbg_unsafe_objects, nbo))
            if (nbobj >= 0 && instance_number(nbobj) > 0)
            {
                drdbg_noclip_paused = 1
                drdbg_noclip_pause_reason = ds_list_find_value(drdbg_unsafe_objects, nbo)
                break
            }
        }
    }
    if (!drdbg_noclip_paused)
    {
        with (all)
        {
            if (id != other.id)
            {
                var nclip_name = string_lower(object_get_name(object_index))
                if (string_pos(""sft_debug"", nclip_name) <= 0 && string_pos(""debugmenu"", nclip_name) <= 0)
                {
                    if (string_pos(""textbox"", nclip_name) > 0 || string_pos(""dialog"", nclip_name) > 0 || string_pos(""dialogue"", nclip_name) > 0 || string_pos(""cutscene"", nclip_name) > 0 || string_pos(""choice"", nclip_name) > 0)
                    {
                        other.drdbg_noclip_paused = 1
                        other.drdbg_noclip_pause_reason = nclip_name
                    }
                }
            }
        }
    }
}

if (drdbg_noclip && !drdbg_noclip_paused && !drdbg_active && instance_exists(drdbg_player))
{
    var move_speed = drdbg_player_speed
    if (keyboard_check(vk_shift)) move_speed *= 3
    var move_x = keyboard_check(vk_right) - keyboard_check(vk_left)
    var move_y = keyboard_check(vk_down) - keyboard_check(vk_up)
    if (keyboard_check(ord(""D""))) move_x += 1
    if (keyboard_check(ord(""A""))) move_x -= 1
    if (keyboard_check(ord(""S""))) move_y += 1
    if (keyboard_check(ord(""W""))) move_y -= 1

    if (drdbg_gp_connected)
    {
        var ax = gamepad_axis_value(drdbg_gamepad_id, gp_axislh)
        var ay = gamepad_axis_value(drdbg_gamepad_id, gp_axislv)
        if (abs(ax) > 0.20) move_x += ax
        if (abs(ay) > 0.20) move_y += ay
        if (gamepad_button_check(drdbg_gamepad_id, gp_padr)) move_x += 1
        if (gamepad_button_check(drdbg_gamepad_id, gp_padl)) move_x -= 1
        if (gamepad_button_check(drdbg_gamepad_id, gp_padd)) move_y += 1
        if (gamepad_button_check(drdbg_gamepad_id, gp_padu)) move_y -= 1
        if (gamepad_button_check(drdbg_gamepad_id, gp_shoulderr)) move_speed *= 3
    }

    drdbg_player.x += move_x * move_speed
    drdbg_player.y += move_y * move_speed
}

// Re-apply classic GM object/background visibility when entering a new room or changing a toggle.
// UNDERTALE is not a GMS2 layer-based game, so the old UNDERTALE layer hide calls were removed.
if (room != drdbg_last_room || drdbg_layer_dirty)
{
    drdbg_last_room = room
    drdbg_layer_dirty = 0

    for (var bi = 0; bi < 8; bi++)
    {
        background_visible[bi] = !drdbg_hide_backgrounds
    }

    for (var i = 0; i < ds_list_size(drdbg_objects_collision); i++)
    {
        var oi = asset_get_index(ds_list_find_value(drdbg_objects_collision, i))
        if (oi >= 0)
        {
            with (oi)
            {
                visible = !other.drdbg_hide_collision_objects
            }
        }
    }

    for (var i = 0; i < ds_list_size(drdbg_objects_character); i++)
    {
        var oi = asset_get_index(ds_list_find_value(drdbg_objects_character, i))
        if (oi >= 0)
        {
            with (oi)
            {
                if (id != other.id) visible = !other.drdbg_hide_characters
            }
        }
    }
}


// Runtime Logger Lite: room transitions and instance-count changes.
if (drdbg_logger_enabled)
{
    if (room != drdbg_last_logged_room)
    {
        ds_list_add(drdbg_log, ""[ROOM] "" + room_get_name(drdbg_last_logged_room) + "" -> "" + room_get_name(room) + "" @ "" + string(current_time))
        while (ds_list_size(drdbg_log) > drdbg_log_max) ds_list_delete(drdbg_log, 0)
        drdbg_last_logged_room = room
    }
    drdbg_log_timer += 1
    if (drdbg_log_timer >= 30)
    {
        drdbg_log_timer = 0
        var live_count = instance_number(all)
        if (live_count != drdbg_last_logged_instances)
        {
            ds_list_add(drdbg_log, ""[OBJ] instances "" + string(drdbg_last_logged_instances) + "" -> "" + string(live_count) + "" in "" + room_get_name(room))
            while (ds_list_size(drdbg_log) > drdbg_log_max) ds_list_delete(drdbg_log, 0)
            drdbg_last_logged_instances = live_count
        }
    }
}

// Click Object Inspector. Use while the menu is closed.
if (drdbg_click_inspector && !drdbg_active && mouse_check_button_pressed(mb_left))
{
    var hit = instance_position(mouse_x, mouse_y, all)
    if (instance_exists(hit))
    {
        drdbg_inspect_instance = hit
        drdbg_inspect_name = object_get_name(hit.object_index)
        var sprn = ""<none>""
        if (sprite_exists(hit.sprite_index)) sprn = sprite_get_name(hit.sprite_index)
        drdbg_inspect_summary = drdbg_inspect_name + "" id="" + string(hit.id) + "" x="" + string(round(hit.x)) + "" y="" + string(round(hit.y)) + "" sprite="" + sprn
        if (drdbg_logger_enabled)
        {
            ds_list_add(drdbg_log, ""[OBJ] inspect "" + drdbg_inspect_summary)
            while (ds_list_size(drdbg_log) > drdbg_log_max) ds_list_delete(drdbg_log, 0)
        }
    }
    else
    {
        drdbg_inspect_instance = noone
        drdbg_inspect_name = """"
        drdbg_inspect_summary = ""No instance under mouse at "" + string(round(mouse_x)) + "", "" + string(round(mouse_y))
    }
}

if (!drdbg_active)
{
    exit
}

global.interact = 1

// Back / close.
var drdbg_key_back = keyboard_check_pressed(vk_escape)
if (drdbg_key_back || drdbg_gp_back)
{
    if (drdbg_focus == 1)
    {
        drdbg_focus = 0
        drdbg_selection = drdbg_category
        drdbg_scroll = 0
        drdbg_search = """"
        drdbg_rebuild = 1
    }
    else
    {
        drdbg_active = 0
        if (variable_global_exists(""interact"")) variable_global_set(""interact"", drdbg_saved_interact)
        ds_map_clear(drdbg_freeze_x_map)
        ds_map_clear(drdbg_freeze_y_map)
    }
    if (drdbg_key_back) keyboard_clear(vk_escape)
    exit
}

// Search typing only on searchable categories.
var searchable_page = (drdbg_focus == 1 && (drdbg_category == 0 || drdbg_category == 3 || drdbg_category == 4 || drdbg_category == 5 || drdbg_category == 7 || drdbg_category == 8 || drdbg_category == 9 || drdbg_category == 12 || drdbg_category == 13))
if (searchable_page)
{
    if (keyboard_lastchar != """")
    {
        if (string_pos(keyboard_lastchar, drdbg_valid_chars) > 0)
        {
            drdbg_search += keyboard_lastchar
            drdbg_rebuild = 1
        }
        keyboard_lastchar = """"
    }
}

var drdbg_key_delete = keyboard_check_pressed(vk_backspace)
if (drdbg_key_delete || drdbg_gp_delete)
{
    if (searchable_page && string_length(drdbg_search) > 0)
    {
        if (keyboard_check(vk_control)) drdbg_search = """"
        else drdbg_search = string_copy(drdbg_search, 1, string_length(drdbg_search) - 1)
        drdbg_rebuild = 1
    }
    else if (drdbg_focus == 1)
    {
        drdbg_focus = 0
        drdbg_selection = drdbg_category
        drdbg_scroll = 0
        drdbg_search = """"
        drdbg_rebuild = 1
    }
    if (drdbg_key_delete) keyboard_clear(vk_backspace)
}

// Rebuild search results.
if (drdbg_rebuild)
{
    ds_list_clear(drdbg_results)
    if (drdbg_focus == 1 && searchable_page)
    {
        var source_list = drdbg_rooms
        if (drdbg_category == 3) source_list = drdbg_sounds
        if (drdbg_category == 4) source_list = drdbg_sprites
        if (drdbg_category == 5) source_list = drdbg_battle_rooms
        if (drdbg_category == 7) source_list = drdbg_objects
        if (drdbg_category == 8) source_list = drdbg_code
        if (drdbg_category == 9) source_list = drdbg_globals
        if (drdbg_category == 12) source_list = drdbg_call_scripts
        if (drdbg_category == 13) source_list = drdbg_objects

        var q = string_lower(drdbg_search)
        for (var i = 0; i < ds_list_size(source_list); i++)
        {
            var item = ds_list_find_value(source_list, i)
            var lower_item = string_lower(item)
            var add_item = 1

            if (drdbg_category == 3)
            {
                if (drdbg_sound_filter == 1 && string_pos(""mus_"", lower_item) != 1) add_item = 0
                if (drdbg_sound_filter == 2 && !(string_pos(""snd_"", lower_item) == 1 || string_pos(""sfx_"", lower_item) == 1)) add_item = 0
            }
            if (drdbg_category == 8)
            {
                if (drdbg_code_filter == 1 && string_pos(""device"", lower_item) <= 0) add_item = 0
                if (drdbg_code_filter == 2 && string_pos(""process"", lower_item) <= 0) add_item = 0
                if (drdbg_code_filter == 3 && string_pos(""interact"", lower_item) <= 0) add_item = 0
                if (drdbg_code_filter == 4 && string_pos(""room"", lower_item) <= 0) add_item = 0
                if (drdbg_code_filter == 5 && !(string_pos(""obj"", lower_item) > 0 || string_pos(""object"", lower_item) > 0)) add_item = 0
            }
            if (drdbg_category == 9 && drdbg_flag_filter)
            {
                if (!(string_pos(""flag"", lower_item) > 0 || string_pos(""plot"", lower_item) > 0 || string_pos(""route"", lower_item) > 0 || string_pos(""save"", lower_item) > 0 || string_pos(""game"", lower_item) > 0 || string_pos(""state"", lower_item) > 0 || string_pos(""room"", lower_item) > 0 || string_pos(""interact"", lower_item) > 0)) add_item = 0
            }

            if (q != """" && string_pos(q, lower_item) <= 0) add_item = 0
            if (add_item) ds_list_add(drdbg_results, item)
        }
    }
    drdbg_rebuild = 0
}


// Dynamic menu row count for the UI recode. This keeps scrolling usable at different scales/layouts.
var drdbg_row_h_step = 22
if (drdbg_ui_scale == 0) drdbg_row_h_step = 18
if (drdbg_ui_scale == 2) drdbg_row_h_step = 26
if (drdbg_ui_layout == 1) drdbg_row_h_step = max(16, drdbg_row_h_step - 3)
// Match row count to the actual window/GUI size, not only the 640x480 world view.
// This keeps the menu from using tiny/top-left sizing when UNDERTALE is stretched or fullscreen.
var drdbg_gui_h_step = window_get_height()
if (drdbg_gui_h_step <= 0)
{
    drdbg_gui_h_step = 480
    if (view_enabled) drdbg_gui_h_step = view_hview[0]
}
if (drdbg_gui_h_step <= 0) drdbg_gui_h_step = 480
drdbg_max_rows = max(6, floor((drdbg_gui_h_step - 285) / max(1, drdbg_row_h_step)))
if (drdbg_ui_layout == 1) drdbg_max_rows += 1
if (drdbg_max_rows > 16) drdbg_max_rows = 16

// Count rows for current menu.
var item_count = drdbg_category_count
if (drdbg_focus == 1)
{
    item_count = ds_list_size(drdbg_results)
    if (drdbg_category == 1) item_count = 5
    if (drdbg_category == 2) item_count = 13
    if (drdbg_category == 3) item_count = 3 + ds_list_size(drdbg_results)
    if (drdbg_category == 4) item_count = 4 + ds_list_size(drdbg_results)
    if (drdbg_category == 6) item_count = 6
    if (drdbg_category == 8) item_count = 1 + ds_list_size(drdbg_results)
    if (drdbg_category == 9) item_count = 3 + ds_list_size(drdbg_results)
    if (drdbg_category == 10) item_count = 10
    if (drdbg_category == 11) item_count = 6
    if (drdbg_category == 12) item_count = 2 + ds_list_size(drdbg_results)
    if (drdbg_category == 13) item_count = 3 + ds_list_size(drdbg_results)
    if (drdbg_category == 14) item_count = 11
}

// Navigation.
var drdbg_key_down = keyboard_check_pressed(vk_down)
var drdbg_key_up = keyboard_check_pressed(vk_up)
if (drdbg_key_down || drdbg_gp_nav_down)
{
    drdbg_selection += 1
    if (drdbg_key_down) keyboard_clear(vk_down)
}
if (drdbg_key_up || drdbg_gp_nav_up)
{
    drdbg_selection -= 1
    if (drdbg_key_up) keyboard_clear(vk_up)
}
if (drdbg_gp_page_down) drdbg_selection += max(1, drdbg_max_rows)
if (drdbg_gp_page_up) drdbg_selection -= max(1, drdbg_max_rows)
if (drdbg_selection >= item_count) drdbg_selection = item_count - 1
if (drdbg_selection < 0) drdbg_selection = 0
if (drdbg_selection < drdbg_scroll) drdbg_scroll = drdbg_selection
if (drdbg_selection >= drdbg_scroll + drdbg_max_rows) drdbg_scroll = drdbg_selection - drdbg_max_rows + 1
if (drdbg_scroll < 0) drdbg_scroll = 0

// Enter / controller A action.
var drdbg_key_accept = keyboard_check_pressed(vk_enter)
if (drdbg_key_accept || drdbg_gp_accept)
{
    if (drdbg_focus == 0)
    {
        drdbg_category = drdbg_selection
        drdbg_focus = 1
        drdbg_selection = 0
        drdbg_scroll = 0
        drdbg_search = """"
        drdbg_rebuild = 1
    }
    else
    {
        // Room Select.
        if (drdbg_category == 0 && ds_list_size(drdbg_results) > 0)
        {
            var item = ds_list_find_value(drdbg_results, drdbg_selection)
            var space_pos = string_pos("" "", item)
            var room_name = item
            if (space_pos > 0) room_name = string_copy(item, 1, space_pos - 1)
            var rid = asset_get_index(room_name)
            if (rid >= 0)
            {
                audio_stop_all()
                global.interact = drdbg_saved_interact
                drdbg_active = 0
                drdbg_was_active = 0
                ds_map_clear(drdbg_freeze_x_map)
                ds_map_clear(drdbg_freeze_y_map)
                room_goto(rid)
            }
        }

        // Player / Movement.
        if (drdbg_category == 1)
        {
            if (drdbg_selection == 0) drdbg_noclip = 1 - drdbg_noclip
            if (drdbg_selection == 1) { drdbg_player_speed += 1; if (drdbg_player_speed > 32) drdbg_player_speed = 32 }
            if (drdbg_selection == 2) { drdbg_player_speed -= 1; if (drdbg_player_speed < 1) drdbg_player_speed = 1 }
            if (drdbg_selection == 3 && instance_exists(drdbg_player)) { drdbg_player.x = mouse_x; drdbg_player.y = mouse_y }
            if (drdbg_selection == 4) room_goto(room)
        }

        // Visual / Collision. Classic UNDERTALE has no GMS2 tile/layer system, so layer-only floor/wall toggles were removed.
        if (drdbg_category == 2)
        {
            if (drdbg_selection == 0) drdbg_show_info = 1 - drdbg_show_info
            if (drdbg_selection == 1) { drdbg_hide_backgrounds = 1 - drdbg_hide_backgrounds; drdbg_layer_dirty = 1 }
            if (drdbg_selection == 2) { drdbg_hide_collision_objects = 1 - drdbg_hide_collision_objects; drdbg_layer_dirty = 1 }
            if (drdbg_selection == 3) { drdbg_hide_characters = 1 - drdbg_hide_characters; drdbg_layer_dirty = 1 }
            if (drdbg_selection == 4) drdbg_show_collision_boxes = 1 - drdbg_show_collision_boxes
            if (drdbg_selection == 5) drdbg_show_object_labels = 1 - drdbg_show_object_labels
            if (drdbg_selection == 6) drdbg_show_room_bounds = 1 - drdbg_show_room_bounds
            if (drdbg_selection == 7) drdbg_show_player_marker = 1 - drdbg_show_player_marker
            if (drdbg_selection == 8) drdbg_mouse_visible = 1 - drdbg_mouse_visible
            if (drdbg_selection == 9) drdbg_click_inspector = 1 - drdbg_click_inspector
            if (drdbg_selection == 10) drdbg_show_interact_markers = 1 - drdbg_show_interact_markers
            if (drdbg_selection == 11) drdbg_show_all_object_labels = 1 - drdbg_show_all_object_labels
            if (drdbg_selection == 12)
            {
                drdbg_hide_backgrounds = 0
                drdbg_hide_floors = 0
                drdbg_hide_walls = 0
                drdbg_hide_collision_objects = 0
                drdbg_hide_characters = 0
                drdbg_show_collision_boxes = 0
                drdbg_show_object_labels = 0
                drdbg_show_room_bounds = 0
                drdbg_show_player_marker = 1
                drdbg_mouse_visible = 0
                drdbg_click_inspector = 0
                drdbg_show_interact_markers = 0
                drdbg_show_all_object_labels = 0
                drdbg_layer_dirty = 1
            }
        }

        // Sound Test.
        if (drdbg_category == 3)
        {
            if (drdbg_selection == 0)
            {
                drdbg_sound_filter += 1
                if (drdbg_sound_filter > 2) drdbg_sound_filter = 0
                drdbg_selection = 0
                drdbg_scroll = 0
                drdbg_rebuild = 1
            }
            else if (drdbg_selection == 1) drdbg_sound_loop = 1 - drdbg_sound_loop
            else if (drdbg_selection == 2) { audio_stop_all(); drdbg_playing_sound = -1 }
            else
            {
                var sound_index_in_list = drdbg_selection - 3
                if (sound_index_in_list >= 0 && sound_index_in_list < ds_list_size(drdbg_results))
                {
                    var item = ds_list_find_value(drdbg_results, sound_index_in_list)
                    var sid = asset_get_index(item)
                    if (sid >= 0)
                    {
                        audio_stop_all()
                        audio_play_sound(sid, 1, drdbg_sound_loop)
                        drdbg_playing_sound = sid
                    }
                }
            }
        }

        // Sprite Viewer.
        if (drdbg_category == 4)
        {
            if (drdbg_selection == 0) drdbg_sprite_anim = 1 - drdbg_sprite_anim
            else if (drdbg_selection == 1) { drdbg_sprite_frame -= 1; if (drdbg_sprite_frame < 0) drdbg_sprite_frame = 0 }
            else if (drdbg_selection == 2) drdbg_sprite_frame += 1
            else if (drdbg_selection == 3) drdbg_sprite_frame = 0
            else
            {
                drdbg_sprite_frame = 0
                drdbg_sprite_anim = 1
            }
        }

        // Battle / Test rooms. Safe generic warp only.
        if (drdbg_category == 5 && ds_list_size(drdbg_results) > 0)
        {
            var item = ds_list_find_value(drdbg_results, drdbg_selection)
            var space_pos = string_pos("" "", item)
            var room_name = item
            if (space_pos > 0) room_name = string_copy(item, 1, space_pos - 1)
            var rid = asset_get_index(room_name)
            if (rid >= 0)
            {
                audio_stop_all()
                global.interact = drdbg_saved_interact
                drdbg_active = 0
                drdbg_was_active = 0
                ds_map_clear(drdbg_freeze_x_map)
                ds_map_clear(drdbg_freeze_y_map)
                room_goto(rid)
            }
        }

        // Runtime Info / global quick actions.
        if (drdbg_category == 6)
        {
            if (drdbg_selection == 0) { drdbg_speed_scale = 0.5; room_speed = max(5, round(drdbg_base_speed * drdbg_speed_scale)) }
            if (drdbg_selection == 1) { drdbg_speed_scale = 1; room_speed = drdbg_base_speed }
            if (drdbg_selection == 2) { drdbg_speed_scale = 2; room_speed = max(5, round(drdbg_base_speed * drdbg_speed_scale)) }
            if (drdbg_selection == 3) { drdbg_speed_scale = 4; room_speed = max(5, round(drdbg_base_speed * drdbg_speed_scale)) }
            if (drdbg_selection == 4) { audio_stop_all(); drdbg_playing_sound = -1 }
            if (drdbg_selection == 5)
            {
                drdbg_noclip = 0
                drdbg_speed_scale = 1
                room_speed = drdbg_base_speed
                audio_stop_all()
                drdbg_playing_sound = -1
            }
        }



        // GML Code Viewer / Code Index. Select an entry to show details in the viewer.
        if (drdbg_category == 8)
        {
            if (drdbg_selection == 0)
            {
                drdbg_code_filter += 1
                if (drdbg_code_filter > 5) drdbg_code_filter = 0
                drdbg_selection = 0
                drdbg_scroll = 0
                drdbg_rebuild = 1
            }
            else if (ds_list_size(drdbg_results) > 0)
            {
                var code_index_in_list = drdbg_selection - 1
                if (code_index_in_list >= 0 && code_index_in_list < ds_list_size(drdbg_results))
                {
                    drdbg_code_selected = ds_list_find_value(drdbg_results, code_index_in_list)
                    if (ds_map_exists(drdbg_code_info, drdbg_code_selected)) drdbg_code_detail = ds_map_find_value(drdbg_code_info, drdbg_code_selected)
                    else drdbg_code_detail = ""No embedded source preview. Re-run the CSX with exported code files in SFT_UTDM_GML_Source/UNDERTALE.""
                }
            }
        }

        // Flag / Global Viewer. Uses a safe patch-time candidate list, not variable_global_get_names().
        if (drdbg_category == 9)
        {
            if (drdbg_selection == 0) { drdbg_flag_filter = 1 - drdbg_flag_filter; drdbg_rebuild = 1; drdbg_scroll = 0 }
            if (drdbg_selection == 1)
            {
                drdbg_rebuild = 1
                drdbg_flag_status = ""Refreshed flag/global candidate list view.""
                ds_list_add(drdbg_log, ""[FLAG] manual flag/global refresh @ "" + string(current_time))
                while (ds_list_size(drdbg_log) > drdbg_log_max) ds_list_delete(drdbg_log, 0)
            }
            if (drdbg_selection == 2)
            {
                var marker = ""[FLAG] flag viewer marker in "" + room_get_name(room) + "" selected="" + drdbg_flag_selected + "" @ "" + string(current_time)
                ds_list_add(drdbg_log, marker)
                drdbg_flag_status = ""Added marker to Runtime Logger.""
                while (ds_list_size(drdbg_log) > drdbg_log_max) ds_list_delete(drdbg_log, 0)
            }
            if (drdbg_selection >= 3)
            {
                var global_index_in_list = drdbg_selection - 3
                if (global_index_in_list >= 0 && global_index_in_list < ds_list_size(drdbg_results))
                {
                    drdbg_flag_selected = ds_list_find_value(drdbg_results, global_index_in_list)
                    drdbg_flag_status = ""Selected: "" + drdbg_flag_selected + "". Live runtime value reads are disabled for stability.""
                }
            }
        }

        // Runtime Logger Lite.
        if (drdbg_category == 10)
        {
            if (drdbg_selection == 0) drdbg_logger_enabled = 1 - drdbg_logger_enabled
            if (drdbg_selection == 1) drdbg_logger_detail = 1 - drdbg_logger_detail
            if (drdbg_selection == 2) drdbg_logger_overlay = 1 - drdbg_logger_overlay
            if (drdbg_selection == 3) { drdbg_logger_overlay_pos += 1; if (drdbg_logger_overlay_pos > 3) drdbg_logger_overlay_pos = 0 }
            if (drdbg_selection == 4) { drdbg_logger_overlay_tab += 1; if (drdbg_logger_overlay_tab > 4) drdbg_logger_overlay_tab = 0 }
            if (drdbg_selection == 5) { drdbg_logger_overlay_lines += 2; if (drdbg_logger_overlay_lines > 16) drdbg_logger_overlay_lines = 4 }
            if (drdbg_selection == 6) ds_list_clear(drdbg_log)
            if (drdbg_selection == 7)
            {
                var lf = file_text_open_write(""sft_debug_runtime_log.txt"")
                for (var li = 0; li < ds_list_size(drdbg_log); li++)
                {
                    file_text_write_string(lf, ds_list_find_value(drdbg_log, li))
                    file_text_writeln(lf)
                }
                file_text_close(lf)
            }
            if (drdbg_selection == 8)
            {
                ds_list_add(drdbg_log, ""[MARK] room="" + room_get_name(room) + "" mouse="" + string(round(mouse_x)) + "","" + string(round(mouse_y)) + "" @ "" + string(current_time))
                while (ds_list_size(drdbg_log) > drdbg_log_max) ds_list_delete(drdbg_log, 0)
            }
            if (drdbg_selection == 9)
            {
                ds_list_add(drdbg_log, ""[ROOM] snapshot room="" + room_get_name(room) + "" id="" + string(room) + "" instances="" + string(instance_number(all)) + "" fps="" + string(fps))
                while (ds_list_size(drdbg_log) > drdbg_log_max) ds_list_delete(drdbg_log, 0)
            }
        }

        // Save Tools. Preview only by default; editing is a guarded placeholder until UNDERTALE-specific save mapping is added.
        if (drdbg_category == 11)
        {
            if (drdbg_selection == 0)
            {
                var fname = ds_list_find_value(drdbg_save_files, drdbg_save_slot)
                drdbg_save_buffer = """"
                if (file_exists(fname))
                {
                    var sf = file_text_open_read(fname)
                    var lines = 0
                    while (!file_text_eof(sf) && lines < 10)
                    {
                        drdbg_save_buffer += file_text_read_string(sf) + ""#""
                        file_text_readln(sf)
                        lines += 1
                    }
                    file_text_close(sf)
                    drdbg_save_status = ""Loaded preview from "" + fname
                }
                else drdbg_save_status = ""Not found in working directory: "" + fname
            }
            if (drdbg_selection == 1)
            {
                drdbg_save_slot += 1
                if (drdbg_save_slot >= ds_list_size(drdbg_save_files)) drdbg_save_slot = 0
                drdbg_save_status = ""Selected "" + ds_list_find_value(drdbg_save_files, drdbg_save_slot)
            }
            if (drdbg_selection == 2) drdbg_save_edit_unlocked = 1 - drdbg_save_edit_unlocked
            if (drdbg_selection == 3)
            {
                var fname2 = ds_list_find_value(drdbg_save_files, drdbg_save_slot)
                if (file_exists(fname2))
                {
                    var backup_name = fname2 + "".sftbak""
                    file_copy(fname2, backup_name)
                    drdbg_save_backup_status = ""Backed up to "" + backup_name
                    drdbg_save_status = drdbg_save_backup_status
                }
                else drdbg_save_status = ""Cannot back up; file not found: "" + fname2
            }
            if (drdbg_selection == 4) drdbg_save_status = ""Editor is locked to safe preview mode. Use UNDERTALE save tools-style maps for real flag editing later.""
            if (drdbg_selection == 5) drdbg_save_status = ""Tip: back up your save folder before enabling real save writes.""
        }

        // Script Call / Execute. Danger mode must be enabled, and only named script assets are attempted.
        if (drdbg_category == 12)
        {
            if (drdbg_selection == 0) drdbg_script_danger = 1 - drdbg_script_danger
            else if (drdbg_selection == 1)
            {
                if (!drdbg_script_danger) drdbg_script_status = ""Blocked: danger mode is OFF.""
                else if (drdbg_script_selected == """") drdbg_script_status = ""No script selected.""
                else
                {
                    var si = asset_get_index(drdbg_script_selected)
                    if (si >= 0)
                    {
                        script_execute(si)
                        drdbg_script_status = ""Executed script with no args: "" + drdbg_script_selected
                        ds_list_add(drdbg_log, ""[SCRIPT] "" + drdbg_script_status)
                        while (ds_list_size(drdbg_log) > drdbg_log_max) ds_list_delete(drdbg_log, 0)
                    }
                    else drdbg_script_status = ""Not callable by asset_get_index: "" + drdbg_script_selected
                }
            }
            else
            {
                var script_index_in_list = drdbg_selection - 2
                if (script_index_in_list >= 0 && script_index_in_list < ds_list_size(drdbg_results))
                {
                    drdbg_script_selected = ds_list_find_value(drdbg_results, script_index_in_list)
                    drdbg_script_status = ""Selected: "" + drdbg_script_selected
                }
            }
        }

        // Object Spawner. Creates an existing object at mouse or player position.
        if (drdbg_category == 13)
        {
            if (drdbg_selection == 0)
            {
                if (drdbg_spawn_selected == """") drdbg_last_spawn_status = ""No object selected.""
                else
                {
                    var oi = asset_get_index(drdbg_spawn_selected)
                    if (oi >= 0)
                    {
                        var sx = mouse_x
                        var sy = mouse_y
                        if (!drdbg_spawn_at_mouse && instance_exists(drdbg_player)) { sx = drdbg_player.x; sy = drdbg_player.y }
                        drdbg_last_spawned = instance_create(sx, sy, oi)
                        if (instance_exists(drdbg_last_spawned)) { with (drdbg_last_spawned) depth = -100 }
                        drdbg_last_spawn_status = ""Spawned "" + drdbg_spawn_selected + "" at "" + string(round(sx)) + "","" + string(round(sy))
                        ds_list_add(drdbg_log, ""[SPAWN] "" + drdbg_last_spawn_status)
                        while (ds_list_size(drdbg_log) > drdbg_log_max) ds_list_delete(drdbg_log, 0)
                    }
                    else drdbg_last_spawn_status = ""Object asset not found: "" + drdbg_spawn_selected
                }
            }
            else if (drdbg_selection == 1) drdbg_spawn_at_mouse = 1 - drdbg_spawn_at_mouse
            else if (drdbg_selection == 2)
            {
                if (instance_exists(drdbg_last_spawned)) { with (drdbg_last_spawned) instance_destroy() ; drdbg_last_spawn_status = ""Destroyed last spawned instance."" }
                else drdbg_last_spawn_status = ""No last spawned instance alive.""
            }
            else
            {
                var object_index_in_list = drdbg_selection - 3
                if (object_index_in_list >= 0 && object_index_in_list < ds_list_size(drdbg_results))
                {
                    drdbg_spawn_selected = ds_list_find_value(drdbg_results, object_index_in_list)
                    drdbg_last_spawn_status = ""Selected spawn object: "" + drdbg_spawn_selected
                }
            }
        }

        // UI Settings. Visual-only settings for the debug UI recode.
        if (drdbg_category == 14)
        {
            if (drdbg_selection == 0) drdbg_use_old_ui = 1 - drdbg_use_old_ui
            if (drdbg_selection == 1) { drdbg_ui_side += 1; if (drdbg_ui_side > 2) drdbg_ui_side = 0 }
            if (drdbg_selection == 2) { drdbg_ui_scale += 1; if (drdbg_ui_scale > 2) drdbg_ui_scale = 0 }
            if (drdbg_selection == 3) drdbg_ui_layout = 1 - drdbg_ui_layout
            if (drdbg_selection == 4) { drdbg_ui_theme += 1; if (drdbg_ui_theme > 2) drdbg_ui_theme = 0 }
            if (drdbg_selection == 5) drdbg_ui_glow = 1 - drdbg_ui_glow
            if (drdbg_selection == 6) drdbg_ui_dim = 1 - drdbg_ui_dim
            if (drdbg_selection == 7) drdbg_controller_enabled = 1 - drdbg_controller_enabled
            if (drdbg_selection == 8) { drdbg_gamepad_id += 1; if (drdbg_gamepad_id > 3) drdbg_gamepad_id = 0 }
            if (drdbg_selection == 9) drdbg_show_info = 1 - drdbg_show_info
            if (drdbg_selection == 10)
            {
                drdbg_use_old_ui = 0
                drdbg_ui_side = 0
                drdbg_ui_scale = 1
                drdbg_ui_layout = 1
                drdbg_ui_theme = 0
                drdbg_ui_assets = 0
                drdbg_ui_glow = 0
                drdbg_ui_dim = 1
                drdbg_controller_enabled = 1
                drdbg_gamepad_id = 0
                drdbg_show_info = 1
            }
        }


        // Object Browser. Enter toggles visibility for all live instances of the selected object.
        if (drdbg_category == 7 && ds_list_size(drdbg_results) > 0)
        {
            var item = ds_list_find_value(drdbg_results, drdbg_selection)
            var oi = asset_get_index(item)
            if (oi >= 0 && instance_number(oi) > 0)
            {
                var first_inst = instance_find(oi, 0)
                drdbg_object_visible_toggle = 1
                if (instance_exists(first_inst)) drdbg_object_visible_toggle = !first_inst.visible
                with (oi)
                {
                    visible = other.drdbg_object_visible_toggle
                }
            }
        }
    }
    if (drdbg_key_accept) keyboard_clear(vk_enter)
}

// Animation timer for sprite preview.
if (drdbg_focus == 1 && drdbg_category == 4 && ds_list_size(drdbg_results) > 0 && drdbg_sprite_anim)
{
    drdbg_sprite_timer += 1
    if (drdbg_sprite_timer >= 5)
    {
        drdbg_sprite_timer = 0
        drdbg_sprite_frame += 1
    }
}

// Absorb normal movement/menu keys after the debug menu has read them. This helps stop
// game-select/save-select/gameplay controls from also receiving the same input.
if (drdbg_active && drdbg_input_block_strict)
{
    keyboard_clear(vk_left)
    keyboard_clear(vk_right)
    keyboard_clear(vk_up)
    keyboard_clear(vk_down)
    keyboard_clear(ord(""W""))
    keyboard_clear(ord(""A""))
    keyboard_clear(ord(""S""))
    keyboard_clear(ord(""D""))
    keyboard_clear(vk_space)
    keyboard_clear(vk_shift)
    keyboard_clear(vk_control)
}
";


string beginStepCode = @"
// Strict interaction block as early as possible in the frame. This helps stop normal player movement
// and UNDERTALE's own input logic from running while the debug menu is open.
if (drdbg_active)
{
    global.interact = 1
    if (drdbg_input_block_strict && instance_exists(drdbg_player))
    {
        drdbg_player.x = drdbg_freeze_x
        drdbg_player.y = drdbg_freeze_y
        drdbg_player.speed = 0
        drdbg_player.hspeed = 0
        drdbg_player.vspeed = 0
    }
    if (drdbg_input_block_strict && drdbg_freeze_scene_targets)
    {
        with (all)
        {
            if (id != other.id)
            {
                var freeze_key = string(id)
                if (ds_map_exists(other.drdbg_freeze_x_map, freeze_key))
                {
                    x = ds_map_find_value(other.drdbg_freeze_x_map, freeze_key)
                    y = ds_map_find_value(other.drdbg_freeze_y_map, freeze_key)
                    speed = 0
                    hspeed = 0
                    vspeed = 0
                }
            }
        }
    }
 }
";

string endStepCode = @"
// Final freeze pass after normal Step events. This keeps the player/camera from drifting while
// the debug menu is open, even if another object tried to move the player during the frame.
if (drdbg_active)
{
    global.interact = 1
    if (drdbg_input_block_strict && instance_exists(drdbg_player))
    {
        drdbg_player.x = drdbg_freeze_x
        drdbg_player.y = drdbg_freeze_y
        drdbg_player.speed = 0
        drdbg_player.hspeed = 0
        drdbg_player.vspeed = 0
    }
    if (drdbg_input_block_strict && drdbg_freeze_scene_targets)
    {
        with (all)
        {
            if (id != other.id)
            {
                var freeze_key = string(id)
                if (ds_map_exists(other.drdbg_freeze_x_map, freeze_key))
                {
                    x = ds_map_find_value(other.drdbg_freeze_x_map, freeze_key)
                    y = ds_map_find_value(other.drdbg_freeze_y_map, freeze_key)
                    speed = 0
                    hspeed = 0
                    vspeed = 0
                }
            }
        }
    }

// Periodically save all important debug toggles to SFT_UTDM_SETTINGS.ini.
drdbg_settings_save_timer += 1
if (drdbg_settings_save_timer >= 60)
{
    drdbg_settings_save_timer = 0
    ini_open(drdbg_settings_file)
    ini_write_real(""UI"", ""use_old_ui"", drdbg_use_old_ui)
    ini_write_real(""UI"", ""side"", drdbg_ui_side)
    ini_write_real(""UI"", ""scale"", drdbg_ui_scale)
    ini_write_real(""UI"", ""layout"", drdbg_ui_layout)
    ini_write_real(""UI"", ""theme"", drdbg_ui_theme)
    ini_write_real(""UI"", ""assets"", 0)
    ini_write_real(""UI"", ""glow"", drdbg_ui_glow)
    ini_write_real(""UI"", ""dim"", drdbg_ui_dim)
    ini_write_real(""Overlay"", ""show_info"", drdbg_show_info)
    ini_write_real(""Player"", ""noclip"", drdbg_noclip)
    ini_write_real(""Player"", ""noclip_speed"", drdbg_player_speed)
    ini_write_real(""Player"", ""noclip_safety_pause"", drdbg_noclip_safety_pause)
    ini_write_real(""Visual"", ""hide_backgrounds"", drdbg_hide_backgrounds)
    ini_write_real(""Visual"", ""hide_floors"", drdbg_hide_floors)
    ini_write_real(""Visual"", ""hide_walls"", drdbg_hide_walls)
    ini_write_real(""Visual"", ""hide_collision_objects"", drdbg_hide_collision_objects)
    ini_write_real(""Visual"", ""hide_characters"", drdbg_hide_characters)
    ini_write_real(""Visual"", ""show_collision_boxes"", drdbg_show_collision_boxes)
    ini_write_real(""Visual"", ""show_object_labels"", drdbg_show_object_labels)
    ini_write_real(""Visual"", ""show_room_bounds"", drdbg_show_room_bounds)
    ini_write_real(""Visual"", ""show_player_marker"", drdbg_show_player_marker)
    ini_write_real(""Mouse"", ""mouse_visible"", drdbg_mouse_visible)
    ini_write_real(""Mouse"", ""click_inspector"", drdbg_click_inspector)
    ini_write_real(""Mouse"", ""show_interact_markers"", drdbg_show_interact_markers)
    ini_write_real(""Mouse"", ""show_all_object_labels"", drdbg_show_all_object_labels)
    ini_write_real(""Controller"", ""enabled"", drdbg_controller_enabled)
    ini_write_real(""Controller"", ""slot"", drdbg_gamepad_id)
    ini_write_real(""Sound"", ""filter"", drdbg_sound_filter)
    ini_write_real(""Sound"", ""loop"", drdbg_sound_loop)
    ini_write_real(""Sprite"", ""animate_preview"", drdbg_sprite_anim)
    ini_write_real(""Logger"", ""enabled"", drdbg_logger_enabled)
    ini_write_real(""Logger"", ""detail"", drdbg_logger_detail)
    ini_write_real(""Logger"", ""overlay_always_show"", drdbg_logger_overlay)
    ini_write_real(""Logger"", ""overlay_pos"", drdbg_logger_overlay_pos)
    ini_write_real(""Logger"", ""overlay_tab"", drdbg_logger_overlay_tab)
    ini_write_real(""Logger"", ""overlay_lines"", drdbg_logger_overlay_lines)
    ini_close()
    drdbg_settings_status = ""Saved SFT_UTDM_SETTINGS.ini""
}

 }
";

string drawCode = @"
if (drdbg_font >= 0) draw_set_font(drdbg_font)
draw_set_halign(fa_left)
draw_set_valign(fa_top)

// Stability fix: when the menu is open, do not draw world-space labels/hitboxes/crosshairs
// in the normal Draw event. In UNDERTALE these overlays can sit behind or bleed through the
// GUI and make the menu look scrambled. The actual menu is drawn in Draw GUI below.
if (drdbg_active)
{
    draw_set_alpha(1)
    draw_set_color(c_white)
    exit
}

if (drdbg_show_room_bounds)
{
    draw_set_alpha(0.6)
    draw_set_color(c_lime)
    draw_rectangle(0, 0, room_width, room_height, true)
    draw_set_alpha(1)
}

if (drdbg_show_collision_boxes)
{
    draw_set_alpha(0.55)
    draw_set_color(c_aqua)
    for (var i = 0; i < ds_list_size(drdbg_objects_collision); i++)
    {
        var oi = asset_get_index(ds_list_find_value(drdbg_objects_collision, i))
        if (oi >= 0)
        {
            var count = instance_number(oi)
            for (var k = 0; k < count; k++)
            {
                var inst = instance_find(oi, k)
                if (instance_exists(inst))
                    draw_rectangle(inst.bbox_left, inst.bbox_top, inst.bbox_right, inst.bbox_bottom, true)
            }
        }
    }
    draw_set_alpha(1)
}

if (drdbg_show_object_labels)
{
    draw_set_alpha(0.85)
    draw_set_color(c_yellow)
    for (var i = 0; i < ds_list_size(drdbg_objects_collision); i++)
    {
        var oi = asset_get_index(ds_list_find_value(drdbg_objects_collision, i))
        if (oi >= 0)
        {
            var count = instance_number(oi)
            for (var k = 0; k < count; k++)
            {
                var inst = instance_find(oi, k)
                if (instance_exists(inst)) draw_text(inst.x, inst.y - 12, object_get_name(inst.object_index))
            }
        }
    }
    draw_set_alpha(1)
}

if (drdbg_show_player_marker && instance_exists(drdbg_player))
{
    draw_set_alpha(0.8)
    draw_set_color(c_red)
    draw_circle(drdbg_player.x, drdbg_player.y, 10, true)
    draw_line(drdbg_player.x - 16, drdbg_player.y, drdbg_player.x + 16, drdbg_player.y)
    draw_line(drdbg_player.x, drdbg_player.y - 16, drdbg_player.x, drdbg_player.y + 16)
    draw_set_alpha(1)
}


if (drdbg_mouse_visible)
{
    draw_set_alpha(0.92)
    draw_set_color(c_yellow)
    draw_line(mouse_x - 10, mouse_y, mouse_x + 10, mouse_y)
    draw_line(mouse_x, mouse_y - 10, mouse_x, mouse_y + 10)
    draw_text(mouse_x + 12, mouse_y + 10, string(round(mouse_x)) + "","" + string(round(mouse_y)))
    draw_set_alpha(1)
}

if (drdbg_show_interact_markers)
{
    draw_set_alpha(0.75)
    draw_set_color(c_lime)
    for (var ii = 0; ii < ds_list_size(drdbg_interact_objects); ii++)
    {
        var oi = asset_get_index(ds_list_find_value(drdbg_interact_objects, ii))
        if (oi >= 0)
        {
            var c = instance_number(oi)
            for (var kk = 0; kk < c; kk++)
            {
                var inst = instance_find(oi, kk)
                if (instance_exists(inst))
                {
                    draw_circle(inst.x, inst.y, 8, true)
                    draw_text(inst.x + 10, inst.y - 10, object_get_name(inst.object_index))
                }
            }
        }
    }
    draw_set_alpha(1)
}

if (drdbg_show_all_object_labels)
{
    draw_set_alpha(0.70)
    draw_set_color(c_white)
    with (all)
    {
        if (id != other.id) draw_text(x, y - 10, object_get_name(object_index))
    }
    draw_set_alpha(1)
}

if (drdbg_click_inspector && instance_exists(drdbg_inspect_instance))
{
    draw_set_alpha(0.92)
    draw_set_color(c_fuchsia)
    draw_rectangle(drdbg_inspect_instance.bbox_left, drdbg_inspect_instance.bbox_top, drdbg_inspect_instance.bbox_right, drdbg_inspect_instance.bbox_bottom, true)
    draw_text(drdbg_inspect_instance.x + 10, drdbg_inspect_instance.y - 24, drdbg_inspect_summary)
    draw_set_alpha(1)
}
";

string drawGuiCode = @"

// UNDERTALE can be stretched/fullscreen while the actual room view stays 640x480.
// Use the real window size for Draw GUI so the panel does not jump to a tiny top-left box.
var gw = window_get_width()
var gh = window_get_height()
if (gw <= 0 || gh <= 0)
{
    gw = 640
    gh = 480
    if (view_enabled)
    {
        gw = view_wview[0]
        gh = view_hview[0]
    }
}
if (gw <= 0) gw = 640
if (gh <= 0) gh = 480

// Do not rely on whatever font/alignment the game was using before this Draw GUI event.
if (drdbg_font >= 0) draw_set_font(drdbg_font)
draw_set_halign(fa_left)
draw_set_valign(fa_top)

var ui_old = drdbg_use_old_ui
var ui_scale = 1
if (drdbg_ui_scale == 0) ui_scale = 0.85
if (drdbg_ui_scale == 2) ui_scale = 1.18

var row_h = round(22 * ui_scale)
if (drdbg_ui_layout == 1) row_h = max(17, round(row_h * 0.86))
var pad = round(18 * ui_scale)
var header_h = round(78 * ui_scale)

var col_back = make_color_rgb(10, 8, 20)
var col_panel = make_color_rgb(18, 14, 34)
var col_panel_2 = make_color_rgb(30, 16, 54)
var col_edge = make_color_rgb(86, 64, 142)
var col_accent = make_color_rgb(120, 88, 255)
var col_accent_2 = make_color_rgb(55, 255, 230)
var col_text = c_white
var col_muted = make_color_rgb(185, 180, 210)
var col_warn = c_yellow
var col_good = c_lime

if (drdbg_ui_theme == 1 && !ui_old)
{
    col_back = make_color_rgb(4, 6, 18)
    col_panel = make_color_rgb(8, 18, 34)
    col_panel_2 = make_color_rgb(5, 32, 48)
    col_edge = make_color_rgb(40, 190, 255)
    col_accent = make_color_rgb(40, 255, 235)
    col_accent_2 = make_color_rgb(255, 80, 220)
    col_muted = make_color_rgb(170, 225, 240)
}
if (drdbg_ui_theme == 2 && !ui_old)
{
    col_back = make_color_rgb(22, 18, 8)
    col_panel = make_color_rgb(38, 25, 12)
    col_panel_2 = make_color_rgb(62, 42, 18)
    col_edge = make_color_rgb(210, 160, 64)
    col_accent = make_color_rgb(255, 205, 82)
    col_accent_2 = make_color_rgb(255, 120, 80)
    col_muted = make_color_rgb(228, 206, 170)
}

if (ui_old)
{
    col_back = c_black
    col_panel = c_black
    col_panel_2 = c_black
    col_edge = c_gray
    col_accent = c_yellow
    col_accent_2 = c_aqua
    col_muted = c_gray
}

if (drdbg_show_info && !drdbg_active)
{
    var infow = 470
    if (ui_old) infow = 405
    draw_set_alpha(0.82)
    draw_set_color(c_black)
    draw_rectangle(8, 8, infow, 86, false)
    draw_set_alpha(1)
    draw_set_color(c_white)
    draw_text(16, 14, ""SFT Debug | room: "" + room_get_name(room) + "" ("" + string(room) + "")"")
    draw_set_color(col_muted)
    draw_text(16, 34, ""No-clip: "" + string(drdbg_noclip) + "" | speed: "" + string(drdbg_player_speed) + "" | game speed: "" + string(drdbg_speed_scale) + ""x"")
    draw_text(16, 54, ""F3 / Back+Start menu | UI old="" + string(ui_old) + "" | side="" + string(drdbg_ui_side) + "" | scale="" + string(drdbg_ui_scale) + "" | pad="" + string(drdbg_gamepad_id) + ""/"" + string(drdbg_gp_connected))
}


// R8 runtime logger overlay. Position and tab can be changed from Runtime Logger.
if (drdbg_logger_overlay && !drdbg_active)
{
    var log_tab_name = ""Mixed""
    if (drdbg_logger_overlay_tab == 1) log_tab_name = ""Rooms""
    if (drdbg_logger_overlay_tab == 2) log_tab_name = ""Objects""
    if (drdbg_logger_overlay_tab == 3) log_tab_name = ""Actions""
    if (drdbg_logger_overlay_tab == 4) log_tab_name = ""System""

    var log_w = min(390, gw - 40)
    var log_rows = min(drdbg_logger_overlay_lines, ds_list_size(drdbg_log))
    var log_h = 42 + max(1, log_rows) * 18
    var log_x = gw - log_w - 14
    var log_y = 96
    if (drdbg_logger_overlay_pos == 0) { log_x = 14; log_y = 96 }
    if (drdbg_logger_overlay_pos == 2) { log_x = round((gw - log_w) / 2); log_y = 14 }
    if (drdbg_logger_overlay_pos == 3) { log_x = round((gw - log_w) / 2); log_y = gh - log_h - 14 }

    draw_set_alpha(0.88)
    draw_set_color(c_black)
    draw_rectangle(log_x, log_y, log_x + log_w, log_y + log_h, false)
    draw_set_alpha(1)
    draw_set_color(col_accent_2)
    draw_rectangle(log_x, log_y, log_x + log_w, log_y + log_h, true)
    draw_set_color(c_yellow)
    draw_text(log_x + 8, log_y + 6, ""SFT Runtime Log - "" + log_tab_name)
    draw_set_color(col_muted)
    draw_text(log_x + 8, log_y + 24, ""room="" + room_get_name(room) + "" | inst="" + string(instance_number(all)) + "" | fps="" + string(fps))

    var drawn = 0
    var yy = log_y + 42
    for (var li = ds_list_size(drdbg_log) - 1; li >= 0; li--)
    {
        if (drawn >= log_rows) break
        var entry = ds_list_find_value(drdbg_log, li)
        var show_entry = 1
        if (drdbg_logger_overlay_tab == 1 && string_pos(""[ROOM]"", entry) != 1) show_entry = 0
        if (drdbg_logger_overlay_tab == 2 && !(string_pos(""[OBJ]"", entry) == 1 || string_pos(""[SPAWN]"", entry) == 1)) show_entry = 0
        if (drdbg_logger_overlay_tab == 3 && !(string_pos(""[ACTION]"", entry) == 1 || string_pos(""[FLAG]"", entry) == 1 || string_pos(""[SCRIPT]"", entry) == 1 || string_pos(""[MARK]"", entry) == 1)) show_entry = 0
        if (drdbg_logger_overlay_tab == 4 && string_pos(""[SYSTEM]"", entry) != 1) show_entry = 0
        if (show_entry)
        {
            draw_text(log_x + 8, yy, string_copy(entry, 1, 56))
            yy += 18
            drawn += 1
        }
    }
    if (drawn == 0)
    {
        draw_set_color(col_muted)
        draw_text(log_x + 8, yy, ""No entries for this tab yet."" )
    }
}

if (!drdbg_active)
{
    draw_set_alpha(1)
    exit
}

var title = ""Main Categories""
if (drdbg_focus == 1)
{
    if (drdbg_category == 0) title = ""Room Select""
    if (drdbg_category == 1) title = ""Player / Movement""
    if (drdbg_category == 2) title = ""Visual / Collision""
    if (drdbg_category == 3) title = ""Sound Test""
    if (drdbg_category == 4) title = ""Sprite / Animation Viewer""
    if (drdbg_category == 5) title = ""Battle / Test Rooms""
    if (drdbg_category == 6) title = ""Runtime Info""
    if (drdbg_category == 7) title = ""Object Browser""
    if (drdbg_category == 8) title = ""GML Code Viewer""
    if (drdbg_category == 9) title = ""Flag / Global Viewer""
    if (drdbg_category == 10) title = ""Runtime Logger""
    if (drdbg_category == 11) title = ""Save Tools""
    if (drdbg_category == 12) title = ""Script Call""
    if (drdbg_category == 13) title = ""Object Spawner""
    if (drdbg_category == 14) title = ""UI Settings""
}

var panel_w = min(gw - 32, round(820 * ui_scale))
var panel_h = gh - 32
if (drdbg_ui_layout == 1 && !ui_old) panel_h = min(gh - 32, round(620 * ui_scale))
if (ui_old)
{
    panel_w = min(gw - 24, 700)
    panel_h = min(gh - 32, 560)
}

var panel_x = round((gw - panel_w) / 2)
if (!ui_old)
{
    if (drdbg_ui_side == 1) panel_x = 24
    if (drdbg_ui_side == 2) panel_x = gw - panel_w - 24
}
if (panel_x < 12) panel_x = 12

var panel_y = round((gh - panel_h) / 2)
if (ui_old) panel_y = 24
if (panel_y < 12) panel_y = 12

var spr_panel = asset_get_index(""spr_sft_dbg_panel"")
var spr_header = asset_get_index(""spr_sft_dbg_header"")
var spr_row = asset_get_index(""spr_sft_dbg_row"")
var spr_select = asset_get_index(""spr_sft_dbg_row_select"")
var spr_footer = asset_get_index(""spr_sft_dbg_footer"")
var spr_brand = asset_get_index(""spr_sft_dbg_brand"")

// Stable overlay backing. Even when the user disables UI dimming, keep a minimum
// dark backing while the menu is open so world-space labels, hitboxes, and room effects
// cannot make the menu look scrambled or unreadable.
var drdbg_dim_alpha = 0.40
if (!ui_old) drdbg_dim_alpha = 0.55
if (drdbg_ui_dim) drdbg_dim_alpha += 0.14
draw_set_alpha(drdbg_dim_alpha)
draw_set_color(c_black)
draw_rectangle(0, 0, gw, gh, false)
draw_set_alpha(1)

if (!ui_old && drdbg_ui_glow)
{
    draw_set_alpha(0.10)
    draw_set_color(col_accent)
    draw_rectangle(panel_x - 6, panel_y - 6, panel_x + panel_w + 6, panel_y + panel_h + 6, false)
    draw_set_alpha(0.06)
    draw_set_color(col_accent_2)
    draw_rectangle(panel_x - 12, panel_y - 12, panel_x + panel_w + 12, panel_y + panel_h + 12, true)
    draw_set_alpha(1)
}

if (!ui_old && drdbg_ui_assets && sprite_exists(spr_panel))
{
    draw_sprite_stretched(spr_panel, 0, panel_x, panel_y, panel_w, panel_h)
}
else
{
    draw_set_alpha(1)
    draw_set_color(col_panel)
    draw_rectangle(panel_x, panel_y, panel_x + panel_w, panel_y + panel_h, false)
    draw_set_alpha(1)
    draw_set_color(col_edge)
    draw_rectangle(panel_x, panel_y, panel_x + panel_w, panel_y + panel_h, true)
    if (!ui_old)
    {
        draw_set_color(col_panel_2)
        draw_rectangle(panel_x + 4, panel_y + 4, panel_x + panel_w - 4, panel_y + header_h, false)
    }
}

if (!ui_old && drdbg_ui_assets && sprite_exists(spr_header))
{
    draw_sprite_stretched(spr_header, 0, panel_x + 4, panel_y + 4, panel_w - 8, header_h - 4)
}
else
{
    draw_set_alpha(1)
    draw_set_color(col_panel_2)
    draw_rectangle(panel_x + 4, panel_y + 4, panel_x + panel_w - 4, panel_y + header_h, false)
    draw_set_alpha(1)
}

if (!ui_old)
{
    draw_set_color(col_accent_2)
    draw_rectangle(panel_x + 8, panel_y + header_h - 4, panel_x + panel_w - 8, panel_y + header_h - 2, false)
    draw_set_color(col_accent)
    draw_rectangle(panel_x + 8, panel_y + header_h - 2, panel_x + panel_w - 8, panel_y + header_h, false)
}

var tx = panel_x + pad
var ty = panel_y + round(12 * ui_scale)
if (!ui_old && drdbg_ui_assets && sprite_exists(spr_brand))
{
    draw_sprite_ext(spr_brand, 0, tx + 10, ty + 16, ui_scale, ui_scale, 0, c_white, 1)
    tx += round(48 * ui_scale)
}

draw_set_color(c_white)
draw_text(tx, ty, ""SFT UNDERTALE Debug Menu Port v1.2"")
draw_set_color(col_muted)
draw_text(tx, ty + round(22 * ui_scale), title + "" | Up/Down/D-pad | Enter/A | Esc/B | F3 or Back+Start"")

var badge = ""NEW UI""
if (ui_old) badge = ""OLD UI""
draw_set_color(col_accent)
draw_rectangle(panel_x + panel_w - round(116 * ui_scale), panel_y + round(14 * ui_scale), panel_x + panel_w - round(24 * ui_scale), panel_y + round(40 * ui_scale), true)
draw_set_color(col_warn)
draw_text(panel_x + panel_w - round(106 * ui_scale), panel_y + round(18 * ui_scale), badge)

var content_x = panel_x + pad
var content_y = panel_y + header_h + pad
var content_w = panel_w - (pad * 2)
var content_h = max(96, panel_h - header_h - round(52 * ui_scale) - pad)
var menu_y = content_y
var line_h = row_h

if (drdbg_focus == 0)
{
    for (var row = drdbg_scroll; row < min(drdbg_category_count, drdbg_scroll + drdbg_max_rows); row++)
    {
        var label = ""Room Select""
        var desc = ""Warp to any room in this game with search.""
        var icon_name = ""spr_sft_dbg_icon_room""
        if (row == 1) { label = ""Player / Movement""; desc = ""No-clip, speed, teleport.""; icon_name = ""spr_sft_dbg_icon_player"" }
        if (row == 2) { label = ""Visual / Collision""; desc = ""Objects, hitboxes, labels.""; icon_name = ""spr_sft_dbg_icon_visual"" }
        if (row == 3) { label = ""Sound Test""; desc = ""Play music/SFX.""; icon_name = ""spr_sft_dbg_icon_sound"" }
        if (row == 4) { label = ""Sprite / Animation Viewer""; desc = ""Preview sprites.""; icon_name = ""spr_sft_dbg_icon_sprite"" }
        if (row == 5) { label = ""Battle / Test Rooms""; desc = ""Battle/test warps.""; icon_name = ""spr_sft_dbg_icon_battle"" }
        if (row == 6) { label = ""Runtime Info""; desc = ""Speed/info/reset.""; icon_name = ""spr_sft_dbg_icon_runtime"" }
        if (row == 7) { label = ""Object Browser""; desc = ""Search/toggle visible objects.""; icon_name = ""spr_sft_dbg_icon_object"" }
        if (row == 8) { label = ""GML Code Viewer""; desc = ""Code index + filters.""; icon_name = ""spr_sft_dbg_icon_runtime"" }
        if (row == 9) { label = ""Flag / Global Viewer""; desc = ""View flag-like globals.""; icon_name = ""spr_sft_dbg_icon_runtime"" }
        if (row == 10) { label = ""Runtime Logger""; desc = ""Room/instance/action log.""; icon_name = ""spr_sft_dbg_icon_runtime"" }
        if (row == 11) { label = ""Save Tools""; desc = ""Safe save preview/editor lock.""; icon_name = ""spr_sft_dbg_icon_object"" }
        if (row == 12) { label = ""Script Call""; desc = ""Danger-script execute.""; icon_name = ""spr_sft_dbg_icon_battle"" }
        if (row == 13) { label = ""Object Spawner""; desc = ""Spawn existing objects.""; icon_name = ""spr_sft_dbg_icon_object"" }
        if (row == 14) { label = ""UI Settings""; desc = ""Side/scale/theme/controller.""; icon_name = ""spr_sft_dbg_icon_ui"" }

        var row_x = content_x
        var row_w = content_w
        var icon = asset_get_index(icon_name)

        if (!ui_old && drdbg_ui_assets && sprite_exists(spr_row)) draw_sprite_stretched(spr_row, 0, row_x, menu_y - 2, row_w, line_h)
        else
        {
            draw_set_alpha(0.55)
            draw_set_color(col_panel_2)
            draw_rectangle(row_x, menu_y - 2, row_x + row_w, menu_y + line_h - 2, false)
            draw_set_alpha(1)
        }

        if (row == drdbg_selection)
        {
            if (!ui_old && drdbg_ui_assets && sprite_exists(spr_select)) draw_sprite_stretched(spr_select, 0, row_x, menu_y - 2, row_w, line_h)
            else
            {
                draw_set_alpha(0.70)
                draw_set_color(col_accent)
                draw_rectangle(row_x, menu_y - 2, row_x + row_w, menu_y + line_h - 2, false)
                draw_set_alpha(1)
                draw_set_color(col_warn)
                draw_rectangle(row_x, menu_y - 2, row_x + row_w, menu_y + line_h - 2, true)
            }
            draw_set_color(col_warn)
            draw_text(row_x + 8, menu_y, "">"")
        }

        var text_x = row_x + 24
        if (!ui_old && drdbg_ui_assets && sprite_exists(icon))
        {
            draw_sprite_ext(icon, 0, row_x + 18, menu_y + round(line_h / 2), ui_scale, ui_scale, 0, c_white, 1)
            text_x = row_x + round(46 * ui_scale)
        }

        if (row == drdbg_selection)
        {
            draw_set_color(c_white)
        }
        else draw_set_color(col_text)
        draw_text(text_x, menu_y, label)
        draw_set_color(col_muted)
        draw_text(text_x + round(210 * ui_scale), menu_y, string_copy(desc, 1, 34))

        menu_y += line_h + 4
    }

    menu_y += 8
    draw_set_color(col_accent_2)
    draw_text(content_x, menu_y, ""Status: no-clip="" + string(drdbg_noclip) + "", paused="" + string(drdbg_noclip_paused) + "", game speed="" + string(drdbg_speed_scale) + ""x, room="" + room_get_name(room))
    if (drdbg_category_count > drdbg_max_rows)
    {
        draw_set_color(col_muted)
        draw_text(content_x + content_w - 170, menu_y, ""Rows "" + string(drdbg_scroll + 1) + ""-"" + string(min(drdbg_category_count, drdbg_scroll + drdbg_max_rows)) + ""/"" + string(drdbg_category_count))
    }
}
else
{
    var searchable_page = (drdbg_category == 0 || drdbg_category == 3 || drdbg_category == 4 || drdbg_category == 5 || drdbg_category == 7 || drdbg_category == 8 || drdbg_category == 9 || drdbg_category == 12 || drdbg_category == 13)
    if (searchable_page)
    {
        draw_set_alpha(0.92)
        draw_set_color(c_black)
        draw_rectangle(content_x, menu_y - 4, content_x + content_w, menu_y + line_h + 4, false)
        draw_set_alpha(1)
        draw_set_color(col_accent_2)
        draw_rectangle(content_x, menu_y - 4, content_x + content_w, menu_y + line_h + 4, true)
        draw_set_color(c_white)
        draw_text(content_x + 8, menu_y, ""Search: "" + drdbg_search + ""    Results: "" + string(ds_list_size(drdbg_results)))
        menu_y += line_h + 12
    }

    if (drdbg_category == 1)
    {
        for (var row = 0; row < 5; row++)
        {
            var label = ""Toggle no-clip: "" + string(drdbg_noclip)
            if (row == 1) label = ""Increase no-clip speed: "" + string(drdbg_player_speed)
            if (row == 2) label = ""Decrease no-clip speed: "" + string(drdbg_player_speed)
            if (row == 3) label = ""Teleport player to mouse position""
            if (row == 4) label = ""Reload current room""

            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }
        menu_y += 10
        draw_set_color(col_accent_2)
        if (instance_exists(drdbg_player)) draw_text(content_x, menu_y, ""Player: "" + object_get_name(drdbg_player.object_index) + "" at "" + string(drdbg_player.x) + "", "" + string(drdbg_player.y))
        else draw_text(content_x, menu_y, ""Player candidate not found in this room."")
    }
    else if (drdbg_category == 2)
    {
        for (var row = 0; row < 13; row++)
        {
            var label = ""Toggle info overlay: "" + string(drdbg_show_info)
            if (row == 1) label = ""Hide room backgrounds: "" + string(drdbg_hide_backgrounds)
            if (row == 2) label = ""Hide collision/solid/block objects: "" + string(drdbg_hide_collision_objects)
            if (row == 3) label = ""Hide characters/NPC-like objects: "" + string(drdbg_hide_characters)
            if (row == 4) label = ""Draw collision boxes: "" + string(drdbg_show_collision_boxes)
            if (row == 5) label = ""Draw object labels on collision objects: "" + string(drdbg_show_object_labels)
            if (row == 6) label = ""Draw room bounds: "" + string(drdbg_show_room_bounds)
            if (row == 7) label = ""Draw player marker: "" + string(drdbg_show_player_marker)
            if (row == 8) label = ""Show mouse/crosshair: "" + string(drdbg_mouse_visible)
            if (row == 9) label = ""Click Object Inspector: "" + string(drdbg_click_inspector)
            if (row == 10) label = ""Show interact/trigger markers: "" + string(drdbg_show_interact_markers)
            if (row == 11) label = ""Show all live object labels: "" + string(drdbg_show_all_object_labels)
            if (row == 12) label = ""Reset all visual toggles""

            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }
        draw_set_color(col_accent_2)
        draw_text(content_x, menu_y + 8, ""Detected classic lists: backgrounds 8, collision objects "" + string(ds_list_size(drdbg_objects_collision)) + "", character objects "" + string(ds_list_size(drdbg_objects_character)))
    }
    else if (drdbg_category == 3)
    {
        var filter_name = ""All audio""
        if (drdbg_sound_filter == 1) filter_name = ""Music only / mus_*""
        if (drdbg_sound_filter == 2) filter_name = ""SFX only / snd_* or sfx_*""
        for (var row = 0; row < 3; row++)
        {
            var label = ""Filter: "" + filter_name
            if (row == 1) label = ""Loop selected audio: "" + string(drdbg_sound_loop)
            if (row == 2) label = ""Stop all audio""
            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }
        menu_y += 4
        var shown = 0
        for (var i = drdbg_scroll; i < ds_list_size(drdbg_results); i++)
        {
            var row_index = i + 3
            if (shown >= drdbg_max_rows) break
            var item = ds_list_find_value(drdbg_results, i)
            if (row_index == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, item)
            menu_y += line_h + 2
            shown += 1
        }
    }
    else if (drdbg_category == 4)
    {
        var list_w = round(content_w * 0.55)
        if (ui_old) list_w = round(content_w * 0.52)
        for (var row = 0; row < 4; row++)
        {
            var label = ""Play/pause preview animation: "" + string(drdbg_sprite_anim)
            if (row == 1) label = ""Previous frame""
            if (row == 2) label = ""Next frame""
            if (row == 3) label = ""Reset frame to 0""
            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + list_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + list_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }
        menu_y += 4
        var shown = 0
        for (var i = drdbg_scroll; i < ds_list_size(drdbg_results); i++)
        {
            var row_index = i + 4
            if (shown >= drdbg_max_rows) break
            var item = ds_list_find_value(drdbg_results, i)
            if (row_index == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + list_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + list_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, item)
            menu_y += line_h + 2
            shown += 1
        }

        var selected_sprite_index = drdbg_selection - 4
        if (selected_sprite_index < 0) selected_sprite_index = 0
        if (selected_sprite_index >= ds_list_size(drdbg_results)) selected_sprite_index = ds_list_size(drdbg_results) - 1
        if (selected_sprite_index >= 0)
        {
            var item = ds_list_find_value(drdbg_results, selected_sprite_index)
            var sid = asset_get_index(item)
            if (sprite_exists(sid))
            {
                var frames = sprite_get_number(sid)
                if (frames <= 0) frames = 1
                while (drdbg_sprite_frame >= frames) drdbg_sprite_frame -= frames
                var sw = sprite_get_width(sid)
                var sh = sprite_get_height(sid)
                var prev_x = content_x + list_w + round(18 * ui_scale)
                var prev_w = content_w - list_w - round(18 * ui_scale)
                if (prev_w < 160)
                {
                    prev_x = content_x
                    prev_w = content_w
                }
                var sc = min(3.5, min((prev_w * 0.70) / max(1, sw), (panel_h * 0.24) / max(1, sh)))
                draw_set_alpha(0.25)
                draw_set_color(c_black)
                draw_rectangle(prev_x, content_y + round(40 * ui_scale), prev_x + prev_w, panel_y + panel_h - pad - 36, false)
                draw_set_alpha(1)
                draw_set_color(col_accent_2)
                draw_rectangle(prev_x, content_y + round(40 * ui_scale), prev_x + prev_w, panel_y + panel_h - pad - 36, true)
                draw_set_color(c_white)
                draw_text(prev_x + 12, content_y + round(50 * ui_scale), ""Preview: "" + item)
                draw_set_color(col_muted)
                draw_text(prev_x + 12, content_y + round(72 * ui_scale), ""Frame "" + string(drdbg_sprite_frame) + "" / "" + string(frames - 1) + "" | size "" + string(sw) + ""x"" + string(sh))
                draw_sprite_ext(sid, drdbg_sprite_frame, prev_x + round(prev_w / 2), content_y + round(panel_h * 0.38), sc, sc, 0, c_white, 1)
            }
        }
    }
    else if (drdbg_category == 6)
    {
        draw_set_color(c_white)
        draw_text(content_x, menu_y, ""Room: "" + room_get_name(room) + "" / id "" + string(room) + "" | size "" + string(room_width) + ""x"" + string(room_height)); menu_y += line_h
        draw_text(content_x, menu_y, ""Mouse room pos: "" + string(mouse_x) + "", "" + string(mouse_y)); menu_y += line_h
        draw_text(content_x, menu_y, ""FPS: "" + string(fps)); menu_y += line_h
        draw_text(content_x, menu_y, ""Asset counts: rooms "" + string(ds_list_size(drdbg_rooms)) + "", sounds "" + string(ds_list_size(drdbg_sounds)) + "", sprites "" + string(ds_list_size(drdbg_sprites)) + "", objects "" + string(ds_list_size(drdbg_objects))); menu_y += line_h
        if (instance_exists(drdbg_player))
        {
            draw_text(content_x, menu_y, ""Player: "" + object_get_name(drdbg_player.object_index) + "" at "" + string(drdbg_player.x) + "", "" + string(drdbg_player.y))
        }
        else draw_text(content_x, menu_y, ""Player: not found"")
        menu_y += line_h + 12

        for (var row = 0; row < 6; row++)
        {
            var label = ""Set game speed to 0.5x""
            if (row == 1) label = ""Set game speed to 1x / normal""
            if (row == 2) label = ""Set game speed to 2x""
            if (row == 3) label = ""Set game speed to 4x""
            if (row == 4) label = ""Stop all audio""
            if (row == 5) label = ""Panic reset: no-clip OFF, speed normal, stop audio""
            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }
    }

    else if (drdbg_category == 8)
    {
        var filter_name = ""All""
        if (drdbg_code_filter == 1) filter_name = ""DEVICE""
        if (drdbg_code_filter == 2) filter_name = ""PROCESS""
        if (drdbg_code_filter == 3) filter_name = ""interact""
        if (drdbg_code_filter == 4) filter_name = ""room""
        if (drdbg_code_filter == 5) filter_name = ""object""
        var filter_row_label = ""Cycle filter: "" + filter_name
        if (drdbg_selection == 0)
        {
            draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
            draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
            draw_set_color(c_white)
        }
        else draw_set_color(col_text)
        draw_text(content_x + 28, menu_y, filter_row_label)
        menu_y += line_h + 4
        draw_set_color(col_accent_2)
        draw_text(content_x, menu_y, ""Selected: "" + drdbg_code_selected)
        menu_y += line_h + 6
        draw_set_color(col_muted)
        draw_text(content_x, menu_y, ""R8: Export code into SFT_UTDM_GML_Source/UNDERTALE, then reinstall to embed previews."" )
        menu_y += line_h + 8

        var code_list_left = content_x
        var code_details_left = content_x + round(content_w * 0.52)
        var code_list_w = code_details_left - code_list_left - 14
        var code_detail_w = content_x + content_w - code_details_left
        var shown = 0
        var start_i = max(0, drdbg_scroll - 1)
        for (var i = start_i; i < ds_list_size(drdbg_results); i++)
        {
            var row_index = i + 1
            if (shown >= max(5, drdbg_max_rows - 3)) break
            var item = ds_list_find_value(drdbg_results, i)
            if (row_index == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(code_list_left, menu_y - 2, code_list_left + code_list_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(code_list_left, menu_y - 2, code_list_left + code_list_w, menu_y + line_h - 2, true); draw_text(code_list_left + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(code_list_left + 28, menu_y, string_copy(item, 1, 48))
            menu_y += line_h + 2
            shown += 1
        }

        draw_set_color(col_edge)
        draw_rectangle(code_details_left - 8, content_y + 88, content_x + content_w, content_y + content_h - 20, true)
        draw_set_color(col_accent_2)
        draw_text(code_details_left, content_y + 96, ""Embedded Source Preview"")
        draw_set_color(col_text)
        draw_text(code_details_left, content_y + 96 + line_h, string_copy(drdbg_code_selected, 1, 54))
        draw_set_color(col_muted)
        draw_text_ext(code_details_left, content_y + 96 + line_h * 2, drdbg_code_detail, line_h, code_detail_w - 12)
    }
    else if (drdbg_category == 9)
    {
        for (var row = 0; row < 3; row++)
        {
            var label = ""Only flag-like globals: "" + string(drdbg_flag_filter)
            if (row == 1) label = ""Refresh candidate list view""
            if (row == 2) label = ""Add selected marker to Runtime Logger""
            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }
        menu_y += 6
        draw_set_color(col_accent_2)
        draw_text(content_x, menu_y, ""Search: "" + drdbg_search + ""   Results: "" + string(ds_list_size(drdbg_results)) + ""   Selected: "" + drdbg_flag_selected)
        menu_y += line_h
        draw_set_color(col_muted)
        draw_text(content_x, menu_y, drdbg_flag_status)
        menu_y += line_h + 4

        var list_left = content_x
        var details_left = content_x + round(content_w * 0.48)
        var list_w = details_left - content_x - 14
        var detail_w = content_x + content_w - details_left
        var shown = 0
        var start_i = max(0, drdbg_scroll - 3)
        for (var i = start_i; i < ds_list_size(drdbg_results); i++)
        {
            if (shown >= max(4, drdbg_max_rows - 5)) break
            var row_index = i + 3
            var nm = ds_list_find_value(drdbg_results, i)
            if (row_index == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(list_left, menu_y - 2, list_left + list_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(list_left, menu_y - 2, list_left + list_w, menu_y + line_h - 2, true); draw_text(list_left + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(list_left + 28, menu_y, string_copy(nm, 1, 45))
            menu_y += line_h + 1
            shown += 1
        }

        draw_set_color(col_edge)
        draw_rectangle(details_left - 8, content_y + 80, content_x + content_w, content_y + content_h - 24, true)
        draw_set_color(col_accent_2)
        draw_text(details_left, content_y + 88, ""Selected Global Details"")
        var dy = content_y + 88 + line_h + 4
        if (drdbg_flag_selected == """")
        {
            draw_set_color(col_muted)
            draw_text(details_left, dy, ""Pick a flag/global candidate from the list."")
        }
        else
        {
            draw_set_color(col_text)
            draw_text(details_left, dy, ""Name: "" + drdbg_flag_selected)
            dy += line_h
            draw_set_color(col_warn)
            draw_text(details_left, dy, ""Runtime value reading is disabled in R8."")
            dy += line_h
            draw_set_color(col_muted)
            draw_text(details_left, dy, ""This avoids crashes from engine/runtime globals."")
            dy += line_h
            draw_text(details_left, dy, ""Use Save Tools or UNDERTALE save tools for save-file flags."")
        }
    }
    else if (drdbg_category == 10)
    {
        var pos_name = ""Right""
        if (drdbg_logger_overlay_pos == 0) pos_name = ""Left""
        if (drdbg_logger_overlay_pos == 2) pos_name = ""Top""
        if (drdbg_logger_overlay_pos == 3) pos_name = ""Bottom""
        var tab_name = ""Mixed""
        if (drdbg_logger_overlay_tab == 1) tab_name = ""Rooms""
        if (drdbg_logger_overlay_tab == 2) tab_name = ""Objects""
        if (drdbg_logger_overlay_tab == 3) tab_name = ""Actions""
        if (drdbg_logger_overlay_tab == 4) tab_name = ""System""
        for (var row = 0; row < 10; row++)
        {
            var label = ""Runtime Logger enabled: "" + string(drdbg_logger_enabled)
            if (row == 1) label = ""Detailed logging: "" + string(drdbg_logger_detail)
            if (row == 2) label = ""Always-show overlay: "" + string(drdbg_logger_overlay)
            if (row == 3) label = ""Overlay position: "" + pos_name
            if (row == 4) label = ""Overlay tab/page: "" + tab_name
            if (row == 5) label = ""Overlay rows: "" + string(drdbg_logger_overlay_lines)
            if (row == 6) label = ""Clear log""
            if (row == 7) label = ""Export log to sft_debug_runtime_log.txt""
            if (row == 8) label = ""Add manual marker""
            if (row == 9) label = ""Add room snapshot""
            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }
        menu_y += 6
        draw_set_color(col_accent_2)
        draw_text(content_x, menu_y, ""Recent log entries: "" + string(ds_list_size(drdbg_log)) + "" / "" + string(drdbg_log_max) + "" | overlay tabs keep logs separated."" )
        menu_y += line_h
        var start = max(0, ds_list_size(drdbg_log) - max(5, drdbg_max_rows - 8))
        for (var li = start; li < ds_list_size(drdbg_log); li++)
        {
            draw_set_color(col_muted)
            draw_text(content_x + 8, menu_y, string_copy(ds_list_find_value(drdbg_log, li), 1, 90))
            menu_y += line_h
        }
    }
    else if (drdbg_category == 11)
    {
        var fname = ds_list_find_value(drdbg_save_files, drdbg_save_slot)
        for (var row = 0; row < 6; row++)
        {
            var label = ""Load safe preview for: "" + fname
            if (row == 1) label = ""Cycle candidate save file""
            if (row == 2) label = ""Unlock save editing: "" + string(drdbg_save_edit_unlocked)
            if (row == 3) label = ""Make .sftbak backup of selected save""
            if (row == 4) label = ""Editor status / safety note""
            if (row == 5) label = ""Backup warning""
            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }
        menu_y += 6
        draw_set_color(col_accent_2)
        draw_text(content_x, menu_y, drdbg_save_status)
        menu_y += line_h
        draw_set_color(col_muted)
        draw_text(content_x, menu_y, drdbg_save_backup_status)
        menu_y += line_h
        draw_text(content_x, menu_y, ""Preview uses common file names. Real flag editing should use mapped save data, not live globals."")
        menu_y += line_h
        var remain = drdbg_save_buffer
        var shown = 0
        while (string_length(remain) > 0 && shown < 8)
        {
            var p = string_pos(""#"", remain)
            var line = remain
            if (p > 0) line = string_copy(remain, 1, p - 1)
            draw_text(content_x + 8, menu_y, string_copy(line, 1, 90))
            menu_y += line_h
            shown += 1
            if (p > 0) remain = string_delete(remain, 1, p)
            else remain = """"
        }
    }
    else if (drdbg_category == 12)
    {
        for (var row = 0; row < 2; row++)
        {
            var label = ""Danger mode: "" + string(drdbg_script_danger)
            if (row == 1) label = ""Execute selected script with no args: "" + drdbg_script_selected
            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }
        draw_set_color(col_accent_2)
        draw_text(content_x, menu_y, string_copy(drdbg_script_status, 1, 95))
        menu_y += line_h + 6
        var shown = 0
        for (var i = drdbg_scroll; i < ds_list_size(drdbg_results); i++)
        {
            var row_index = i + 2
            if (shown >= drdbg_max_rows) break
            var item = ds_list_find_value(drdbg_results, i)
            if (row_index == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, item)
            menu_y += line_h + 2
            shown += 1
        }
    }
    else if (drdbg_category == 13)
    {
        for (var row = 0; row < 3; row++)
        {
            var label = ""Spawn selected object: "" + drdbg_spawn_selected
            if (row == 1) label = ""Spawn at mouse instead of player: "" + string(drdbg_spawn_at_mouse)
            if (row == 2) label = ""Destroy last spawned instance""
            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }
        draw_set_color(col_accent_2)
        draw_text(content_x, menu_y, string_copy(drdbg_last_spawn_status, 1, 95))
        menu_y += line_h + 6
        var shown = 0
        for (var i = drdbg_scroll; i < ds_list_size(drdbg_results); i++)
        {
            var row_index = i + 3
            if (shown >= drdbg_max_rows) break
            var item = ds_list_find_value(drdbg_results, i)
            if (row_index == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, item)
            menu_y += line_h + 2
            shown += 1
        }
    }
    else if (drdbg_category == 14)
    {
        var side_name = ""Center""
        if (drdbg_ui_side == 1) side_name = ""Left""
        if (drdbg_ui_side == 2) side_name = ""Right""
        var scale_name = ""Normal""
        if (drdbg_ui_scale == 0) scale_name = ""Small""
        if (drdbg_ui_scale == 2) scale_name = ""Large""
        var layout_name = ""Full""
        if (drdbg_ui_layout == 1) layout_name = ""Compact""
        var theme_name = ""UNDERTALE Purple""
        if (drdbg_ui_theme == 1) theme_name = ""Cyber Neon""
        if (drdbg_ui_theme == 2) theme_name = ""Lightner Gold""

        draw_set_color(col_accent_2)
        draw_text(content_x, menu_y, ""R8.2 UI Settings. Clean drawn UI only. Settings save to SFT_UTDM_SETTINGS.ini."")
        menu_y += line_h + 8

        for (var row = 0; row < 11; row++)
        {
            var label = ""Use Old Debug UI: "" + string(drdbg_use_old_ui)
            if (row == 1) label = ""UI side: "" + side_name
            if (row == 2) label = ""UI scale: "" + scale_name
            if (row == 3) label = ""Layout: "" + layout_name
            if (row == 4) label = ""Theme: "" + theme_name
            if (row == 5) label = ""Glow / extra effects: "" + string(drdbg_ui_glow)
            if (row == 6) label = ""Dim background behind menu: "" + string(drdbg_ui_dim)
            if (row == 7) label = ""Controller input: "" + string(drdbg_controller_enabled) + "" | connected: "" + string(drdbg_gp_connected)
            if (row == 8) label = ""Controller slot: "" + string(drdbg_gamepad_id) + "" / 0-3""
            if (row == 9) label = ""Top-left status overlay: "" + string(drdbg_show_info)
            if (row == 10) label = ""Reset UI settings""

            if (row == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, label)
            menu_y += line_h + 2
        }

        menu_y += 10
        draw_set_color(col_muted)
        draw_text(content_x, menu_y, ""Controller: Xbox 360 uses Back+Start, D-pad/L-stick, A, B, X, and LB/RB."")
        menu_y += line_h
        draw_text(content_x, menu_y, drdbg_settings_status)
        menu_y += line_h
        draw_text(content_x, menu_y, ""No-clip still auto-pauses during battles/dialogue/text boxes even with safety removed."")
    }
    else
    {
        if (drdbg_category == 5)
        {
            draw_set_color(col_warn)
            draw_text(content_x, menu_y, ""Safe mode: this only warps to battle/test-like rooms. Real battle launcher needs UNDERTALE-specific scripts."")
            menu_y += line_h + 6
        }

        var shown = 0
        for (var i = drdbg_scroll; i < ds_list_size(drdbg_results); i++)
        {
            if (shown >= drdbg_max_rows) break
            var item = ds_list_find_value(drdbg_results, i)
            if (i == drdbg_selection)
            {
                draw_set_alpha(0.70); draw_set_color(col_accent); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, false); draw_set_alpha(1)
                draw_set_color(col_warn); draw_rectangle(content_x, menu_y - 2, content_x + content_w, menu_y + line_h - 2, true); draw_text(content_x + 8, menu_y, "">"")
                draw_set_color(c_white)
            }
            else draw_set_color(col_text)
            draw_text(content_x + 28, menu_y, item)
            menu_y += line_h + 2
            shown += 1
        }

        if (drdbg_category == 7 && ds_list_size(drdbg_results) > 0)
        {
            var item = ds_list_find_value(drdbg_results, drdbg_selection)
            var oi = asset_get_index(item)
            draw_set_color(col_accent_2)
            if (oi >= 0) draw_text(content_x, menu_y + 8, ""Selected object live instances: "" + string(instance_number(oi)) + "". Enter toggles visible for live instances."")
        }
    }
}

if (!ui_old && drdbg_ui_assets && sprite_exists(spr_footer))
{
    draw_sprite_stretched(spr_footer, 0, panel_x + 4, panel_y + panel_h - round(34 * ui_scale), panel_w - 8, round(30 * ui_scale))
}
else
{
    draw_set_alpha(0.95)
    draw_set_color(c_black)
    draw_rectangle(panel_x + 4, panel_y + panel_h - round(34 * ui_scale), panel_x + panel_w - 4, panel_y + panel_h - 4, false)
    draw_set_alpha(1)
}

draw_set_color(col_muted)
draw_text(panel_x + pad, panel_y + panel_h - round(28 * ui_scale), ""F3/Back+Start close | Enter/A select | Esc/B back | X delete/search | LB/RB page"")

draw_set_alpha(1)
draw_set_color(c_white)
draw_set_halign(fa_left)
draw_set_valign(fa_top)

";

string destroyCode = @"
// drdbg_font is a built-in UNDERTALE font, not a font_add() font. Do not delete it.
if (ds_exists(drdbg_results, ds_type_list)) ds_list_destroy(drdbg_results)
if (ds_exists(drdbg_rooms, ds_type_list)) ds_list_destroy(drdbg_rooms)
if (ds_exists(drdbg_sounds, ds_type_list)) ds_list_destroy(drdbg_sounds)
if (ds_exists(drdbg_sprites, ds_type_list)) ds_list_destroy(drdbg_sprites)
if (ds_exists(drdbg_battle_rooms, ds_type_list)) ds_list_destroy(drdbg_battle_rooms)
if (ds_exists(drdbg_objects, ds_type_list)) ds_list_destroy(drdbg_objects)
if (ds_exists(drdbg_code, ds_type_list)) ds_list_destroy(drdbg_code)
if (ds_exists(drdbg_code_info, ds_type_map)) ds_map_destroy(drdbg_code_info)
if (ds_exists(drdbg_call_scripts, ds_type_list)) ds_list_destroy(drdbg_call_scripts)
if (ds_exists(drdbg_globals, ds_type_list)) ds_list_destroy(drdbg_globals)
if (ds_exists(drdbg_unsafe_objects, ds_type_list)) ds_list_destroy(drdbg_unsafe_objects)
if (ds_exists(drdbg_interact_objects, ds_type_list)) ds_list_destroy(drdbg_interact_objects)
if (ds_exists(drdbg_save_files, ds_type_list)) ds_list_destroy(drdbg_save_files)
if (ds_exists(drdbg_log, ds_type_list)) ds_list_destroy(drdbg_log)
if (ds_exists(drdbg_freeze_x_map, ds_type_map)) ds_map_destroy(drdbg_freeze_x_map)
if (ds_exists(drdbg_freeze_y_map, ds_type_map)) ds_map_destroy(drdbg_freeze_y_map)
if (ds_exists(drdbg_layers_bg, ds_type_list)) ds_list_destroy(drdbg_layers_bg)
if (ds_exists(drdbg_layers_floor, ds_type_list)) ds_list_destroy(drdbg_layers_floor)
if (ds_exists(drdbg_layers_wall, ds_type_list)) ds_list_destroy(drdbg_layers_wall)
if (ds_exists(drdbg_layers_collision, ds_type_list)) ds_list_destroy(drdbg_layers_collision)
if (ds_exists(drdbg_objects_collision, ds_type_list)) ds_list_destroy(drdbg_objects_collision)
if (ds_exists(drdbg_objects_character, ds_type_list)) ds_list_destroy(drdbg_objects_character)
";

importGroup.QueueReplace(obj.EventHandlerFor(EventType.Create, Data), createCode);
importGroup.QueueReplace(obj.EventHandlerFor(EventType.Step, (uint)1, Data), beginStepCode);
importGroup.QueueReplace(obj.EventHandlerFor(EventType.Step, Data), stepCode);
importGroup.QueueReplace(obj.EventHandlerFor(EventType.Step, (uint)2, Data), endStepCode);
importGroup.QueueReplace(obj.EventHandlerFor(EventType.Draw, Data), drawCode);
importGroup.QueueReplace(obj.EventHandlerFor(EventType.Draw, (uint)64, Data), drawGuiCode);
importGroup.QueueReplace(obj.EventHandlerFor(EventType.Destroy, Data), destroyCode);

importGroup.Import();

ScriptMessage(@$"SFT UNDERTALE Debug Menu Port v1.2 installed!

Patched object: obj_sft_debugmenu
Patched game/game: {Data.GeneralInfo.Name.Content}

Controls:
- F3: Open / close debug menu
- Esc: Back / close
- Backspace: Back, or delete search text
- Up / Down: Navigate
- Enter: Select / run the highlighted action

Included categories:
- Room Select
- Player / Movement
- Visual / Collision
- Sound Test
- Sprite / Animation Viewer
- Battle / Test Rooms
- Runtime Info
- Object Browser
- GML Code Viewer
- Flag / Global Viewer
- Runtime Logger
- Save Tools
- Script Call
- Object Spawner
- UI Settings

Important notes:
- Run this script separately on each UNDERTALE data.win's data file.
- External shortcuts are F3 on keyboard or Back + Start on controller. Feature toggles still live inside menu categories.
- v2 R8.2 includes readable UI fixes, controller support, toned-down UI defaults, persistent SFT_UTDM_SETTINGS.ini, scroll cleanup, no-clip safety pause, Flag Viewer crash fix, real-flag metadata import, per-game GML source preview import, runtime logger overlay positions/tabs, and advanced lab pages.
- Battle/Test page is intentionally safe/generic. A true battle launcher needs UNDERTALE-specific script names and arguments.
- UMT's bundled ExportAllCode.csx is still the correct way to export full decompiled GML source. Put exported files in SFT_UTDM_GML_Source/CH1, CH2, CH3, CH4, CH5, or ChapSelect beside this CSX before installing to embed snippets. This script writes SFT_UTDM_GML_CodeIndex.txt beside the CSX and reports which source folder was used.
- Layer/object hiding is name-based, so it may need keyword tuning for some games.
- Custom image UI assets were removed from the public v2 path because the drawn UI is cleaner and easier to read.
- GML source import result: profile {sftExternalCodeProfile}, matches {sftExternalCodeMatchCount}, snippets {sftCodeSnippets.Count}. Folder: {(sftExternalCodeFolder ?? "not found")}
- If a custom image skin returns later, it should be a separate optional skin pack, not a default UI setting.");
