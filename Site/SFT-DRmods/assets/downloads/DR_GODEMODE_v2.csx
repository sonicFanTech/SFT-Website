// SFT DELTARUNE God Mode / Infinite HP Mod v2
// Targets DELTARUNE Chapters 1-5 normal chapter data files.
// Run this script separately on each CLEAN chapter data file in UndertaleModTool.
//
// v2 features:
// - F8 runtime configuration menu
// - F9 God Mode toggle
// - F10 grazing allow/disallow toggle
// - Configurable GODMODE overlay, color, and timeout
// - Optional normal take-damage effects while God Mode restores HP
// - Persistent SFT_GODMODE_CONFIG.ini settings
// - Original damage code is preserved, allowing God Mode to truly turn OFF
// - Compatibility fix: uses Underanalyzer.Decompiler.DecompileContext
//
// IMPORTANT:
// v1 permanently replaced several original damage functions. Install v2 only on a
// clean chapter data file or a restored backup, not on top of a v1-patched file.

using System;
using System.Linq;
using System.Text;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using UndertaleModLib.Util;
using UndertaleModLib.Decompiler;
using UndertaleModLib.Models;

EnsureDataLoaded();

if (!Data.IsGameMaker2())
    throw new Exception("This script targets the GameMaker Studio 2 DELTARUNE chapter data files.");

bool HasObject(string name) => Data.GameObjects.ByName(name) is not null;

string detectedChapter = "Chapter 1 / base chapter profile";
if (HasObject("obj_sneo_tiny_susie")) detectedChapter = "Chapter 2";
if (HasObject("obj_mainchara_board")) detectedChapter = "Chapter 3";
if (HasObject("obj_mike_minigame_controller")) detectedChapter = "Chapter 4";
if (HasObject("obj_plat_player")) detectedChapter = "Chapter 5";

// v2 must be installed on clean game data. A v1 controller means the original
// damage code may already be gone, which prevents a real runtime OFF toggle.
var existingController = Data.GameObjects.ByName("obj_sft_godmode_controller");
if (existingController is not null)
{
    throw new Exception(
        "obj_sft_godmode_controller already exists.\n\n" +
        "Do not install v2 on top of v1 or another God Mode build. " +
        "Restore a clean chapter data-file backup first, reopen it in UMT, and then run v2."
    );
}

var controller = new UndertaleGameObject()
{
    Name = Data.Strings.MakeString("obj_sft_godmode_controller"),
    Persistent = true,
    Visible = true
};
Data.GameObjects.Add(controller);

// Put the persistent controller in the game's actual first room.
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
    throw new Exception("No room was found for the God Mode controller.");

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
    foreach (var room in Data.Rooms)
    {
        if (room?.Layers is null)
            continue;

        foreach (var layer in room.Layers)
            if (layer.LayerId > maxLayerId)
                maxLayerId = (uint)layer.LayerId;
    }

    targetLayer = new UndertaleRoom.Layer()
    {
        LayerName = Data.Strings.MakeString("SFT_GodMode_Layer"),
        Data = new UndertaleRoom.Layer.LayerInstancesData(),
        LayerType = UndertaleRoom.LayerType.Instances,
        LayerDepth = -1000000,
        LayerId = maxLayerId + 1,
        IsVisible = true
    };
    entryRoom.Layers.Add(targetLayer);
}

var newRoomObject = new UndertaleRoom.GameObject()
{
    InstanceID = Data.GeneralInfo.LastObj++,
    ObjectDefinition = controller,
    X = 0,
    Y = 0
};

targetLayer.InstancesData.Instances.Add(newRoomObject);
entryRoom.GameObjects.Add(newRoomObject);

UndertaleModLib.Compiler.CodeImportGroup importGroup = new(Data)
{
    MainThreadAction = MainThreadAction
};

var patchedCode = new List<string>();
var missingCode = new List<string>();
var warnings = new List<string>();

UndertaleCode FindCode(string codeName)
{
    return Data.Code.FirstOrDefault(c =>
        c?.Name?.Content is string n &&
        string.Equals(n, codeName, StringComparison.OrdinalIgnoreCase));
}

string DecompileCode(UndertaleCode code)
{
    try
    {
        return new Underanalyzer.Decompiler.DecompileContext(importGroup.GlobalContext, code, importGroup.DecompileSettings).DecompileToString();
    }
    catch (Exception ex)
    {
        throw new Exception($"Failed to decompile {code?.Name?.Content}: {ex.Message}", ex);
    }
}

bool QueueRegexEdit(string codeName, string pattern, string replacement, string label, RegexOptions options = RegexOptions.IgnoreCase)
{
    var code = FindCode(codeName);
    if (code is null)
    {
        missingCode.Add(codeName);
        return false;
    }

    string source = DecompileCode(code);
    var regex = new Regex(pattern, options);
    string modified = regex.Replace(source, replacement, 1);

    if (string.Equals(source, modified, StringComparison.Ordinal))
    {
        warnings.Add($"{codeName}: could not locate the expected code pattern for {label}");
        return false;
    }

    importGroup.QueueReplace(code, modified);
    patchedCode.Add(codeName + " (" + label + ")");
    return true;
}

bool QueueFunctionGuard(string codeName, string functionName, string guardBody)
{
    string pattern = @"(function\s+" + Regex.Escape(functionName) + @"\s*\([^)]*\)\s*\{)";
    string replacement = "$1\n" + guardBody;
    return QueueRegexEdit(codeName, pattern, replacement, "runtime God Mode guard");
}

void QueueCodePrepend(string codeName, string gml, string label)
{
    var code = FindCode(codeName);
    if (code is null)
    {
        missingCode.Add(codeName);
        return;
    }

    importGroup.QueuePrepend(code, gml);
    patchedCode.Add(codeName + " (" + label + ")");
}

string damageGuard = @"    // SFT God Mode v2: block the original hit routine only when hit effects are disabled.
    if (variable_global_exists(""sft_god_mode"") && global.sft_god_mode &&
        (!variable_global_exists(""sft_take_damage_effect"") || !global.sft_take_damage_effect))
    {
        if (variable_instance_exists(id, ""damage""))
            damage = 0;
        if (variable_instance_exists(id, ""tdamage""))
            tdamage = 0;
        return 0;
    }";

// Preserve each chapter's original damage implementation. The guard returns early
// only while God Mode is ON and normal hit effects are disabled.
QueueFunctionGuard("gml_GlobalScript_scr_damage", "scr_damage", damageGuard);
QueueFunctionGuard("gml_GlobalScript_scr_damage_all", "scr_damage_all", damageGuard);
QueueFunctionGuard("gml_GlobalScript_scr_damage_all_overworld", "scr_damage_all_overworld", damageGuard);
QueueFunctionGuard("gml_GlobalScript_scr_damage_proportional", "scr_damage_proportional", damageGuard);
QueueFunctionGuard("gml_GlobalScript_scr_damage_sneo_final_attack", "scr_damage_sneo_final_attack", damageGuard);
QueueFunctionGuard("gml_GlobalScript_scr_damage_fixed", "scr_damage_fixed", damageGuard);
QueueFunctionGuard("gml_GlobalScript_scr_damage_manual", "scr_damage_manual", damageGuard);
QueueFunctionGuard("gml_GlobalScript_scr_damage_maxhp", "scr_damage_maxhp", damageGuard);
QueueFunctionGuard("gml_GlobalScript_scr_damage_all_platmode", "scr_damage_all_platmode", damageGuard);

string lethalGuard = @"    // SFT God Mode v2: stop same-frame death/game-over processing while enabled.
    if (variable_global_exists(""sft_god_mode"") && global.sft_god_mode)
        return 0;";

QueueFunctionGuard("gml_GlobalScript_scr_dead", "scr_dead", lethalGuard);
QueueFunctionGuard("gml_GlobalScript_scr_gameover", "scr_gameover", lethalGuard);

// Grazing is handled by graze-box collision events. Search by name instead of
// assuming only one bullet object, so chapter-specific graze collision variants
// are covered while their original TP logic remains untouched when grazing is allowed.
var grazeCodeEntries = Data.Code
    .Where(c =>
    {
        string n = c?.Name?.Content ?? "";
        return n.IndexOf("grazebox", StringComparison.OrdinalIgnoreCase) >= 0 &&
               n.IndexOf("Collision", StringComparison.OrdinalIgnoreCase) >= 0 &&
               n.IndexOf("bullet", StringComparison.OrdinalIgnoreCase) >= 0;
    })
    .ToList();

if (grazeCodeEntries.Count == 0)
{
    missingCode.Add("graze-box bullet collision event");
}
else
{
    foreach (var grazeCode in grazeCodeEntries)
    {
        importGroup.QueuePrepend(grazeCode, @"// SFT God Mode v2 grazing toggle.
if (variable_global_exists(""sft_graze_enabled"") && !global.sft_graze_enabled)
    exit;
");
        patchedCode.Add(grazeCode.Name.Content + " (grazing toggle)");
    }
}

// Direct chapter-specific hit paths that bypass the shared scr_damage family.
QueueCodePrepend(
    "gml_Object_o_boxingcontroller_Collision_o_boxing_hitbox",
    @"// SFT God Mode v2: block Giga Queen boxing damage when hit effects are disabled.
if (variable_global_exists(""sft_god_mode"") && global.sft_god_mode &&
    (!variable_global_exists(""sft_take_damage_effect"") || !global.sft_take_damage_effect))
{
    exit;
}
",
    "runtime boxing protection"
);

QueueCodePrepend(
    "gml_Object_obj_board_collidebullet_Other_15",
    @"// SFT God Mode v2: block board-battle damage while preserving destroy-on-hit bullets.
if (variable_global_exists(""sft_god_mode"") && global.sft_god_mode &&
    (!variable_global_exists(""sft_take_damage_effect"") || !global.sft_take_damage_effect))
{
    if (active == 1 && destroyonhit == 1)
        instance_destroy();
    exit;
}
",
    "runtime board protection"
);

// Chapter 4 Mike mode lowers its life counter and checks it in the same Step event.
// Make only the life subtraction conditional so the original behavior returns when
// God Mode is switched OFF.
QueueRegexEdit(
    "gml_Object_obj_mike_minigame_controller_Step_0",
    @"\blife\s*-\=\s*1\s*;",
    @"if (!(variable_global_exists(""sft_god_mode"") && global.sft_god_mode))
{
    life -= 1;
}",
    "runtime Mike-life protection"
);

// Build only the special-mode refill code relevant to the opened chapter.
var specialGml = new StringBuilder();

if (HasObject("o_boxingcontroller"))
{
    specialGml.AppendLine(@"
    with (o_boxingcontroller)
    {
        if (health_count_max > 0)
            health_count = health_count_max;
        dead = 0;
        dead_timer = 0;
        if (!global.sft_take_damage_effect)
        {
            invincible = 1;
            invincibility_timer = max(invincibility_timer, 2);
        }
    }");
}

if (HasObject("obj_sneo_tiny_susie"))
{
    specialGml.AppendLine(@"
    with (obj_sneo_tiny_susie)
    {
        if (hp < 50)
            hp = 50;
    }");
}

if (HasObject("obj_sneo_tiny_ralsei"))
{
    specialGml.AppendLine(@"
    with (obj_sneo_tiny_ralsei)
    {
        if (hpmax > 0 && hp < hpmax)
            hp = hpmax;
        active = 1;
    }");
}

if (HasObject("obj_mainchara_board"))
{
    specialGml.AppendLine(@"
    with (obj_mainchara_board)
    {
        if (maxhealth > 0 && myhealth < maxhealth)
            myhealth = maxhealth;
        if (!global.sft_take_damage_effect)
        {
            invincible = 1;
            iframes = max(iframes, 2);
        }
    }");
}

if (HasObject("obj_susiezilla_player"))
{
    specialGml.AppendLine(@"
    with (obj_susiezilla_player)
    {
        if (!global.sft_take_damage_effect)
            invuln = 1;
    }");
}

if (HasObject("obj_susiezilla_statue"))
{
    specialGml.AppendLine(@"
    with (obj_susiezilla_statue)
    {
        if (maxhp > 0)
            hp = maxhp;
        if (!global.sft_take_damage_effect)
        {
            tv_is_forever = true;
            damage_cooldown = max(damage_cooldown, 2);
        }
    }");
}

if (HasObject("obj_mike_minigame_controller"))
{
    specialGml.AppendLine(@"
    with (obj_mike_minigame_controller)
    {
        if (life < 3)
            life = 3;
        if (!global.sft_take_damage_effect)
            hurt = false;
    }");
}

if (HasObject("obj_plat_player"))
{
    specialGml.AppendLine(@"
    with (obj_plat_player)
    {
        if (max_hp > 0 && hp < max_hp)
            hp = max_hp;
        if (!global.sft_take_damage_effect)
        {
            damage = 0;
            invincible = true;
            invincible_timer = max(invincible_timer, 2);
        }
    }");
}

// Cleanup used when God Mode is disabled or hit effects are re-enabled.
// It prevents special-mode invulnerability flags from remaining stuck after a toggle.
var clearSpecialGml = new StringBuilder();

if (HasObject("o_boxingcontroller"))
{
    clearSpecialGml.AppendLine(@"
    with (o_boxingcontroller)
    {
        invincible = 0;
        invincibility_timer = 0;
    }");
}

if (HasObject("obj_mainchara_board"))
{
    clearSpecialGml.AppendLine(@"
    with (obj_mainchara_board)
    {
        invincible = 0;
        iframes = 0;
    }");
}

if (HasObject("obj_susiezilla_player"))
{
    clearSpecialGml.AppendLine(@"
    with (obj_susiezilla_player)
    {
        invuln = 0;
    }");
}

if (HasObject("obj_susiezilla_statue"))
{
    clearSpecialGml.AppendLine(@"
    with (obj_susiezilla_statue)
    {
        tv_is_forever = false;
        damage_cooldown = 0;
    }");
}

if (HasObject("obj_plat_player"))
{
    clearSpecialGml.AppendLine(@"
    with (obj_plat_player)
    {
        invincible = false;
        invincible_timer = 0;
    }");
}

string createCode = @"
if (instance_number(object_index) > 1)
{
    instance_destroy(id, false);
    exit;
}

persistent = true;
visible = true;

global.sft_god_mode_version = 2;

// Defaults. The INI file overrides these after the first launch.
global.sft_god_mode = true;
global.sft_graze_enabled = true;
global.sft_godmode_overlay = true;
global.sft_take_damage_effect = false;
global.sft_godmode_hotkeys = true;
global.sft_overlay_color_index = 0;
global.sft_overlay_timeout_index = 0;

sft_config_file = ""SFT_GODMODE_CONFIG.ini"";
sft_menu_open = false;
sft_menu_index = 0;
sft_menu_count = 9;
sft_saved_interact = 0;
sft_had_interact = false;
sft_overlay_timer = -1;
sft_status_text = """";
sft_status_timer = 0;
sft_font = font_add(""8bitoperator_jve.ttf"", 16, false, false, 32, 127);

sft_bool_text = function(_value)
{
    return _value ? ""ON"" : ""OFF"";
};

sft_graze_text = function()
{
    return global.sft_graze_enabled ? ""ALLOWED"" : ""BLOCKED"";
};

sft_color_name = function()
{
    switch (global.sft_overlay_color_index)
    {
        case 0: return ""Yellow"";
        case 1: return ""White"";
        case 2: return ""Lime"";
        case 3: return ""Aqua"";
        case 4: return ""Orange"";
        case 5: return ""Red"";
        case 6: return ""Purple"";
    }
    return ""Yellow"";
};

sft_overlay_color = function()
{
    switch (global.sft_overlay_color_index)
    {
        case 0: return c_yellow;
        case 1: return c_white;
        case 2: return c_lime;
        case 3: return c_aqua;
        case 4: return c_orange;
        case 5: return c_red;
        case 6: return make_color_rgb(190, 90, 255);
    }
    return c_yellow;
};

sft_timeout_seconds = function()
{
    switch (global.sft_overlay_timeout_index)
    {
        case 0: return 0;
        case 1: return 1;
        case 2: return 2;
        case 3: return 3;
        case 4: return 5;
        case 5: return 10;
    }
    return 0;
};

sft_timeout_name = function()
{
    var _seconds = sft_timeout_seconds();
    if (_seconds <= 0)
        return ""Always"";
    return string(_seconds) + "" second"" + ((_seconds == 1) ? """" : ""s"");
};

sft_reset_overlay_timer = function()
{
    var _seconds = sft_timeout_seconds();
    if (_seconds <= 0)
        sft_overlay_timer = -1;
    else
        sft_overlay_timer = max(1, round(game_get_speed(gamespeed_fps) * _seconds));
};

sft_show_status = function(_text)
{
    sft_status_text = _text;
    sft_status_timer = max(1, round(game_get_speed(gamespeed_fps) * 2));
};

sft_save_config = function()
{
    ini_open(sft_config_file);
    ini_write_real(""Features"", ""god_mode"", global.sft_god_mode);
    ini_write_real(""Features"", ""grazing"", global.sft_graze_enabled);
    ini_write_real(""Features"", ""take_damage_effect"", global.sft_take_damage_effect);
    ini_write_real(""Features"", ""direct_hotkeys"", global.sft_godmode_hotkeys);
    ini_write_real(""Overlay"", ""enabled"", global.sft_godmode_overlay);
    ini_write_real(""Overlay"", ""color"", global.sft_overlay_color_index);
    ini_write_real(""Overlay"", ""timeout"", global.sft_overlay_timeout_index);
    ini_close();
};

sft_load_config = function()
{
    if (!file_exists(sft_config_file))
    {
        sft_save_config();
        return;
    }

    ini_open(sft_config_file);
    global.sft_god_mode = (ini_read_real(""Features"", ""god_mode"", 1) != 0);
    global.sft_graze_enabled = (ini_read_real(""Features"", ""grazing"", 1) != 0);
    global.sft_take_damage_effect = (ini_read_real(""Features"", ""take_damage_effect"", 0) != 0);
    global.sft_godmode_hotkeys = (ini_read_real(""Features"", ""direct_hotkeys"", 1) != 0);
    global.sft_godmode_overlay = (ini_read_real(""Overlay"", ""enabled"", 1) != 0);
    global.sft_overlay_color_index = clamp(round(ini_read_real(""Overlay"", ""color"", 0)), 0, 6);
    global.sft_overlay_timeout_index = clamp(round(ini_read_real(""Overlay"", ""timeout"", 0)), 0, 5);
    ini_close();
};

sft_clear_forced_invulnerability = function()
{
__SFT_CLEAR_SPECIAL_MODE_CODE__
};

sft_toggle_god_mode = function()
{
    global.sft_god_mode = !global.sft_god_mode;
    if (global.sft_god_mode)
    {
        sft_reset_overlay_timer();
        sft_show_status(""GOD MODE ENABLED"");
    }
    else
    {
        sft_clear_forced_invulnerability();
        sft_overlay_timer = 0;
        sft_show_status(""GOD MODE DISABLED"");
    }
    sft_save_config();
};

sft_toggle_grazing = function()
{
    global.sft_graze_enabled = !global.sft_graze_enabled;
    sft_show_status(global.sft_graze_enabled ? ""GRAZING ALLOWED"" : ""GRAZING BLOCKED"");
    sft_save_config();
};

sft_close_menu = function()
{
    sft_menu_open = false;
    if (sft_had_interact && variable_global_exists(""interact""))
        global.interact = sft_saved_interact;
    sft_had_interact = false;
};

sft_open_menu = function()
{
    sft_menu_open = true;
    sft_menu_index = clamp(sft_menu_index, 0, sft_menu_count - 1);
    if (variable_global_exists(""interact""))
    {
        sft_saved_interact = global.interact;
        sft_had_interact = true;
        global.interact = 1;
    }
};

sft_reset_defaults = function()
{
    global.sft_god_mode = true;
    global.sft_graze_enabled = true;
    global.sft_godmode_overlay = true;
    global.sft_take_damage_effect = false;
    global.sft_godmode_hotkeys = true;
    global.sft_overlay_color_index = 0;
    global.sft_overlay_timeout_index = 0;
    sft_reset_overlay_timer();
    sft_show_status(""GOD MODE SETTINGS RESET"");
    sft_save_config();
};

sft_change_menu_value = function(_direction)
{
    switch (sft_menu_index)
    {
        case 0:
            sft_toggle_god_mode();
            break;

        case 1:
            sft_toggle_grazing();
            break;

        case 2:
            global.sft_godmode_overlay = !global.sft_godmode_overlay;
            if (global.sft_godmode_overlay && global.sft_god_mode)
                sft_reset_overlay_timer();
            sft_show_status(global.sft_godmode_overlay ? ""GODMODE OVERLAY ENABLED"" : ""GODMODE OVERLAY DISABLED"");
            sft_save_config();
            break;

        case 3:
            global.sft_overlay_color_index += _direction;
            if (global.sft_overlay_color_index < 0) global.sft_overlay_color_index = 6;
            if (global.sft_overlay_color_index > 6) global.sft_overlay_color_index = 0;
            sft_show_status(""OVERLAY COLOR: "" + sft_color_name());
            sft_save_config();
            break;

        case 4:
            global.sft_overlay_timeout_index += _direction;
            if (global.sft_overlay_timeout_index < 0) global.sft_overlay_timeout_index = 5;
            if (global.sft_overlay_timeout_index > 5) global.sft_overlay_timeout_index = 0;
            if (global.sft_god_mode)
                sft_reset_overlay_timer();
            sft_show_status(""OVERLAY TIME: "" + sft_timeout_name());
            sft_save_config();
            break;

        case 5:
            global.sft_take_damage_effect = !global.sft_take_damage_effect;
            if (global.sft_take_damage_effect)
                sft_clear_forced_invulnerability();
            sft_show_status(global.sft_take_damage_effect ? ""HIT EFFECTS ENABLED"" : ""HIT EFFECTS DISABLED"");
            sft_save_config();
            break;

        case 6:
            global.sft_godmode_hotkeys = !global.sft_godmode_hotkeys;
            sft_show_status(global.sft_godmode_hotkeys ? ""F9/F10 HOTKEYS ENABLED"" : ""F9/F10 HOTKEYS DISABLED"");
            sft_save_config();
            break;

        case 7:
            sft_reset_defaults();
            break;

        case 8:
            sft_close_menu();
            break;
    }
};

sft_apply_god_mode = function()
{
    if (!global.sft_god_mode)
        return;

    // Active Dark World party HP.
    if (variable_global_exists(""hp"") && variable_global_exists(""maxhp""))
    {
        var _hp_count = min(array_length(global.hp), array_length(global.maxhp));

        if (variable_global_exists(""char""))
        {
            var _party_count = array_length(global.char);
            for (var _slot = 0; _slot < _party_count; _slot++)
            {
                var _member = global.char[_slot];
                if (_member > 0 && _member < _hp_count && global.maxhp[_member] > 0)
                    global.hp[_member] = global.maxhp[_member];
            }
        }
        else
        {
            for (var _hp_i = 1; _hp_i < _hp_count; _hp_i++)
            {
                if (global.maxhp[_hp_i] > 0)
                    global.hp[_hp_i] = global.maxhp[_hp_i];
            }
        }
    }

    // Light World HP.
    if (variable_global_exists(""lhp"") && variable_global_exists(""lmaxhp""))
    {
        if (global.lmaxhp > 0 && global.lhp < global.lmaxhp)
            global.lhp = global.lmaxhp;
    }

    // Chapter 3 board-combat shared meter.
    if (variable_global_exists(""boardhp""))
    {
        if (global.boardhp < 100)
            global.boardhp = 100;
    }

__SFT_SPECIAL_MODE_CODE__
};

sft_load_config();
if (global.sft_god_mode)
    sft_reset_overlay_timer();
sft_apply_god_mode();
";

createCode = createCode.Replace("__SFT_SPECIAL_MODE_CODE__", specialGml.ToString());
createCode = createCode.Replace("__SFT_CLEAR_SPECIAL_MODE_CODE__", clearSpecialGml.ToString());

string beginStepCode = @"
// F8 always opens the config menu, even when direct F9/F10 hotkeys are disabled.
if (keyboard_check_pressed(vk_f8))
{
    if (sft_menu_open)
        sft_close_menu();
    else
        sft_open_menu();
    keyboard_clear(vk_f8);
}

if (!sft_menu_open && global.sft_godmode_hotkeys)
{
    if (keyboard_check_pressed(vk_f9))
    {
        sft_toggle_god_mode();
        keyboard_clear(vk_f9);
    }

    if (keyboard_check_pressed(vk_f10))
    {
        sft_toggle_grazing();
        keyboard_clear(vk_f10);
    }
}

if (sft_menu_open)
{
    if (variable_global_exists(""interact""))
        global.interact = 1;

    if (keyboard_check_pressed(vk_up))
    {
        sft_menu_index--;
        if (sft_menu_index < 0) sft_menu_index = sft_menu_count - 1;
    }

    if (keyboard_check_pressed(vk_down))
    {
        sft_menu_index++;
        if (sft_menu_index >= sft_menu_count) sft_menu_index = 0;
    }

    if (keyboard_check_pressed(vk_left))
        sft_change_menu_value(-1);

    if (keyboard_check_pressed(vk_right))
        sft_change_menu_value(1);

    if (keyboard_check_pressed(vk_enter) || keyboard_check_pressed(ord(""Z"")))
        sft_change_menu_value(1);

    if (keyboard_check_pressed(vk_escape) || keyboard_check_pressed(ord(""X"")))
        sft_close_menu();

    // Prevent menu controls from also moving the SOUL/player or selecting game UI.
    keyboard_clear(vk_up);
    keyboard_clear(vk_down);
    keyboard_clear(vk_left);
    keyboard_clear(vk_right);
    keyboard_clear(vk_enter);
    keyboard_clear(vk_escape);
    keyboard_clear(ord(""Z""));
    keyboard_clear(ord(""X""));
    keyboard_clear(ord(""C""));
    keyboard_clear(vk_f9);
    keyboard_clear(vk_f10);
}

if (sft_overlay_timer > 0)
    sft_overlay_timer--;
if (sft_status_timer > 0)
    sft_status_timer--;

sft_apply_god_mode();
";

string applyCode = "sft_apply_god_mode();";

string drawGuiCode = @"
var _gui_w = display_get_gui_width();
var _gui_h = display_get_gui_height();

if (sft_font >= 0)
    draw_set_font(sft_font);
else
    draw_set_font(-1);
draw_set_halign(fa_left);
draw_set_valign(fa_top);
draw_set_alpha(1);

// Small GODMODE indicator. Timeout 0 means always visible while enabled.
if (global.sft_god_mode && global.sft_godmode_overlay &&
    (sft_timeout_seconds() <= 0 || sft_overlay_timer > 0))
{
    var _overlay_text = ""GODMODE"";
    var _overlay_x = 14;
    var _overlay_y = 12;
    var _overlay_w = string_width(_overlay_text) + 16;
    var _overlay_h = string_height(_overlay_text) + 10;

    draw_set_alpha(0.70);
    draw_set_color(c_black);
    draw_rectangle(_overlay_x - 5, _overlay_y - 4, _overlay_x - 5 + _overlay_w, _overlay_y - 4 + _overlay_h, false);
    draw_set_alpha(1);
    draw_set_color(sft_overlay_color());
    draw_text(_overlay_x, _overlay_y, _overlay_text);
}

// Two-second status toast for toggles and menu changes.
if (sft_status_timer > 0 && sft_status_text != """")
{
    draw_set_halign(fa_center);
    var _status_x = _gui_w * 0.5;
    var _status_y = _gui_h - 42;
    var _status_w = string_width(sft_status_text) + 24;

    draw_set_alpha(0.78);
    draw_set_color(c_black);
    draw_rectangle(_status_x - (_status_w * 0.5), _status_y - 6, _status_x + (_status_w * 0.5), _status_y + 24, false);
    draw_set_alpha(1);
    draw_set_color(c_white);
    draw_text(_status_x, _status_y, sft_status_text);
    draw_set_halign(fa_left);
}

if (sft_menu_open)
{
    var _panel_w = min(500, _gui_w - 32);
    var _panel_h = min(360, _gui_h - 32);
    var _panel_x = (_gui_w - _panel_w) * 0.5;
    var _panel_y = (_gui_h - _panel_h) * 0.5;

    draw_set_alpha(0.88);
    draw_set_color(c_black);
    draw_rectangle(_panel_x, _panel_y, _panel_x + _panel_w, _panel_y + _panel_h, false);

    draw_set_alpha(1);
    draw_set_color(c_white);
    draw_rectangle(_panel_x, _panel_y, _panel_x + _panel_w, _panel_y + _panel_h, true);

    draw_set_color(c_yellow);
    draw_text(_panel_x + 18, _panel_y + 14, ""SFT GOD MODE CONFIG"");

    draw_set_color(c_white);
    draw_text(_panel_x + 18, _panel_y + 42, ""F8: Close   Up/Down: Select   Left/Right/Enter: Change"");

    var _row_y = _panel_y + 78;
    var _row_h = 27;

    for (var _i = 0; _i < sft_menu_count; _i++)
    {
        var _selected = (_i == sft_menu_index);
        var _label = """";
        var _value = """";

        switch (_i)
        {
            case 0:
                _label = ""God Mode"";
                _value = sft_bool_text(global.sft_god_mode);
                break;
            case 1:
                _label = ""Grazing"";
                _value = sft_graze_text();
                break;
            case 2:
                _label = ""GODMODE Overlay"";
                _value = sft_bool_text(global.sft_godmode_overlay);
                break;
            case 3:
                _label = ""Overlay Color"";
                _value = sft_color_name();
                break;
            case 4:
                _label = ""Overlay Timeout"";
                _value = sft_timeout_name();
                break;
            case 5:
                _label = ""Take Damage Effects"";
                _value = sft_bool_text(global.sft_take_damage_effect);
                break;
            case 6:
                _label = ""F9 / F10 Hotkeys"";
                _value = sft_bool_text(global.sft_godmode_hotkeys);
                break;
            case 7:
                _label = ""Reset Defaults"";
                _value = """";
                break;
            case 8:
                _label = ""Close Menu"";
                _value = """";
                break;
        }

        if (_selected)
        {
            draw_set_alpha(0.30);
            draw_set_color(c_white);
            draw_rectangle(_panel_x + 10, _row_y - 3, _panel_x + _panel_w - 10, _row_y + 21, false);
            draw_set_alpha(1);
            draw_set_color(c_yellow);
        }
        else
        {
            draw_set_color(c_white);
        }

        draw_text(_panel_x + 20, _row_y, (_selected ? ""> "" : ""  "") + _label);
        if (_value != """")
        {
            draw_set_halign(fa_right);
            draw_text(_panel_x + _panel_w - 22, _row_y, _value);
            draw_set_halign(fa_left);
        }

        _row_y += _row_h;
    }

    draw_set_color(c_gray);
    draw_text(_panel_x + 18, _panel_y + _panel_h - 30,
        ""Settings are saved to SFT_GODMODE_CONFIG.ini"");
}

draw_set_alpha(1);
draw_set_color(c_white);
draw_set_halign(fa_left);
draw_set_valign(fa_top);
";

string destroyCode = @"
if (sft_menu_open)
    sft_close_menu();
if (sft_font >= 0 && font_exists(sft_font))
    font_delete(sft_font);
";

// Begin Step handles input before normal gameplay input. Refill also runs before,
// during, and after the normal Step phase to cover special controllers.
importGroup.QueueReplace(controller.EventHandlerFor(EventType.Create, Data), createCode);
importGroup.QueueReplace(controller.EventHandlerFor(EventType.Step, (uint)1, Data), beginStepCode);
importGroup.QueueReplace(controller.EventHandlerFor(EventType.Step, Data), applyCode);
importGroup.QueueReplace(controller.EventHandlerFor(EventType.Step, (uint)2, Data), applyCode);
importGroup.QueueReplace(controller.EventHandlerFor(EventType.Draw, (uint)64, Data), drawGuiCode);
importGroup.QueueReplace(controller.EventHandlerFor(EventType.Destroy, Data), destroyCode);

importGroup.Import();

string gameName = Data.GeneralInfo?.Name?.Content ?? "opened DELTARUNE data file";
string patchedSummary = patchedCode.Count > 0 ? string.Join("\n- ", patchedCode) : "(none)";
string skippedSummary = missingCode.Count > 0 ? string.Join("\n- ", missingCode.Distinct()) : "(none)";
string warningSummary = warnings.Count > 0 ? string.Join("\n- ", warnings) : "(none)";

ScriptMessage($@"SFT DELTARUNE God Mode / Infinite HP Mod v2 installed!

Detected profile: {detectedChapter}
Opened game data: {gameName}
Persistent controller: obj_sft_godmode_controller
God Mode default: ON (unless an existing INI setting overrides it)

Controls:
- F8: Open / close God Mode config menu
- F9: Enable / disable God Mode
- F10: Allow / block grazing

Patched code entries:
- {patchedSummary}

Chapter-only entries not present and safely skipped:
- {skippedSummary}

Patch warnings:
- {warningSummary}

v2 notes:
- Original damage functions were preserved so F9 can truly turn God Mode off.
- The stuck take-damage/invincibility effect from v1 is no longer forced globally.
- Take Damage Effects default to OFF and can be changed in the F8 menu.
- Overlay color and timeout can be changed in the F8 menu.
- Settings are saved to SFT_GODMODE_CONFIG.ini.

Important:
- Save the modified data file in UMT.
- Apply this script separately to every Chapter 1-5 data file you want protected.
- Install v2 only on clean chapter data files, never over v1.
- Keep a clean backup of every original data file.");
