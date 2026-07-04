// SFT DELTARUNE Chapter Select Settings Button Mod v1
// Targets the Chapter Select data.win only.
// Adds a Settings button to the Chapter Select footer and opens a full-screen settings page.
// Test on a backup data.win first.

using System;
using UndertaleModLib.Util;

EnsureDataLoaded();

if (!Data.IsGameMaker2())
    throw new Exception("This script targets GameMaker Studio 2 data files like DELTARUNE Chapter Select.");

var settingsObj = Data.GameObjects.ByName("obj_sft_chapter_settings_screen");
if (settingsObj is null)
{
    settingsObj = new UndertaleGameObject()
    {
        Name = Data.Strings.MakeString("obj_sft_chapter_settings_screen"),
        Persistent = false,
        Visible = true
    };
    Data.GameObjects.Add(settingsObj);
}
else
{
    settingsObj.Persistent = false;
    settingsObj.Visible = true;
}

UndertaleGameObject NeedObject(string name)
{
    var obj = Data.GameObjects.ByName(name);
    if (obj is null)
        throw new Exception($"Required object '{name}' was not found. This does not look like the Chapter Select data.win export this mod was made for.");
    return obj;
}

var objFooter = NeedObject("obj_screen_select_footer");
var objList = NeedObject("obj_screen_select_list");
var objChapter = NeedObject("obj_ui_chapter");
var objChoice = NeedObject("obj_ui_choice");

UndertaleModLib.Compiler.CodeImportGroup importGroup = new(Data)
{
    MainThreadAction = MainThreadAction
};

// New settings screen object.
importGroup.QueueReplace(settingsObj.EventHandlerFor(EventType.Create, Data), @"global.sft_settings_open = true;
sft_page = 0;
sft_index = 0;
sft_scroll = 0;
sft_volume = 100;
sft_fullscreen = window_get_fullscreen() ? 1 : 0;
sft_lang = variable_global_exists(""lang"") ? global.lang : ""en"";
sft_simplify_vfx = 0;
sft_autorun = 0;
sft_message = """";
sft_message_timer = 0;
sft_font = (variable_global_exists(""lang"") && global.lang == ""ja"") ? 1 : 2;
sft_item_count = 8;

sft_key_name = function(arg0)
{
    switch (arg0)
    {
        case vk_down: return ""Down"";
        case vk_right: return ""Right"";
        case vk_up: return ""Up"";
        case vk_left: return ""Left"";
        case vk_enter: return ""Enter"";
        case vk_shift: return ""Shift"";
        case vk_control: return ""Ctrl"";
        case vk_space: return ""Space"";
        case vk_escape: return ""Esc"";
        default:
            if (arg0 >= 32 && arg0 <= 126)
                return chr(arg0);
            return string(arg0);
    }
};

sft_gamepad_name = function(arg0)
{
    switch (arg0)
    {
        case gp_padd: return ""D-pad Down"";
        case gp_padr: return ""D-pad Right"";
        case gp_padu: return ""D-pad Up"";
        case gp_padl: return ""D-pad Left"";
        case gp_face1: return ""A / Face 1"";
        case gp_face2: return ""B / Face 2"";
        case gp_face3: return ""X / Face 3"";
        case gp_face4: return ""Y / Face 4"";
        case gp_shoulderlb: return ""LB"";
        case gp_shoulderrb: return ""RB"";
        case 999: return ""Unbound"";
        default: return string(arg0);
    }
};

sft_load_settings = function()
{
    sft_fullscreen = window_get_fullscreen() ? 1 : 0;
    sft_lang = variable_global_exists(""lang"") ? global.lang : ""en"";
    
    if (ossafe_file_exists(""true_config.ini""))
    {
        ossafe_ini_open(""true_config.ini"");
        sft_fullscreen = ini_read_real(""SCREEN"", ""FULLSCREEN"", sft_fullscreen);
        sft_lang = ini_read_string(""LANG"", ""LANG"", sft_lang);
        sft_volume = ini_read_real(""SFT_SETTINGS"", ""MASTER_VOLUME"", 100);
        sft_simplify_vfx = ini_read_real(""SFT_SETTINGS"", ""SIMPLIFY_VFX"", 0);
        sft_autorun = ini_read_real(""SFT_SETTINGS"", ""AUTO_RUN"", 0);
        ossafe_ini_close();
    }
    
    sft_volume = clamp(sft_volume, 0, 100);
};

sft_save_settings = function()
{
    ossafe_ini_open(""true_config.ini"");
    ini_write_real(""SCREEN"", ""FULLSCREEN"", sft_fullscreen);
    ini_write_string(""LANG"", ""LANG"", sft_lang);
    ini_write_real(""SFT_SETTINGS"", ""MASTER_VOLUME"", sft_volume);
    ini_write_real(""SFT_SETTINGS"", ""SIMPLIFY_VFX"", sft_simplify_vfx);
    ini_write_real(""SFT_SETTINGS"", ""AUTO_RUN"", sft_autorun);
    ossafe_ini_close();
};

sft_apply_volume = function()
{
    audio_master_gain(sft_volume / 100);
};

sft_write_controls = function()
{
    ossafe_ini_open(""keyconfig_0.ini"");
    for (var i = 0; i < 10; i++)
    {
        ini_write_real(""KEYBOARD_CONTROLS"", string(i), global.input_k[i]);
        ini_write_real(""GAMEPAD_CONTROLS"", string(i), global.input_g[i]);
    }
    
    if (instance_exists(obj_gamecontroller))
        ini_write_real(""SHOULDERLB_REASSIGN"", ""SHOULDERLB_REASSIGN"", obj_gamecontroller.gamepad_shoulderlb_reassign);
    else
        ini_write_real(""SHOULDERLB_REASSIGN"", ""SHOULDERLB_REASSIGN"", 0);
    
    ossafe_ini_close();
};

sft_msg = function(arg0)
{
    sft_message = arg0;
    sft_message_timer = 150;
};

sft_item_text = function(arg0)
{
    switch (arg0)
    {
        case 0: return ""Master Volume"";
        case 1: return ""Fullscreen"";
        case 2: return ""Language"";
        case 3: return ""Controls Info"";
        case 4: return ""Reset Controls"";
        case 5: return ""Write Current Controls"";
        case 6: return ""Config File Info"";
        case 7: return ""Back"";
    }
    return """";
};

sft_item_value = function(arg0)
{
    switch (arg0)
    {
        case 0: return string(round(sft_volume)) + ""%"";
        case 1: return (sft_fullscreen == 1) ? ""ON"" : ""OFF"";
        case 2: return string_upper(sft_lang);
        case 3: return ""Open"";
        case 4: return ""Defaults"";
        case 5: return ""keyconfig_0.ini"";
        case 6: return ""Open"";
        case 7: return ""Close"";
    }
    return """";
};

sft_change_current = function(arg0)
{
    switch (sft_index)
    {
        case 0:
            sft_volume = clamp(sft_volume + (arg0 * 10), 0, 100);
            sft_apply_volume();
            sft_save_settings();
            break;
        
        case 1:
            sft_fullscreen = 1 - sft_fullscreen;
            window_set_fullscreen(sft_fullscreen == 1);
            sft_save_settings();
            sft_msg(""Fullscreen saved to true_config.ini"");
            break;
        
        case 2:
            sft_lang = (sft_lang == ""en"") ? ""ja"" : ""en"";
            global.lang = sft_lang;
            sft_save_settings();
            global.sft_settings_open = false;
            room_restart();
            break;
        
        case 6:
            sft_page = 2;
            break;
    }
};

sft_accept_current = function()
{
    switch (sft_index)
    {
        case 0:
            sft_volume += 10;
            if (sft_volume > 100)
                sft_volume = 0;
            sft_apply_volume();
            sft_save_settings();
            break;
        
        case 1:
        case 2:
        case 6:
            sft_change_current(1);
            break;
        
        case 3:
            sft_page = 1;
            sft_scroll = 0;
            break;
        
        case 4:
            scr_controls_default();
            sft_write_controls();
            sft_msg(""Controls reset and written to keyconfig_0.ini"");
            break;
        
        case 5:
            sft_write_controls();
            sft_msg(""Current controls written to keyconfig_0.ini"");
            break;
        
        case 7:
            instance_destroy();
            break;
    }
};

sft_load_settings();
sft_apply_volume();
");
importGroup.QueueReplace(settingsObj.EventHandlerFor(EventType.Step, Data), @"if (sft_message_timer > 0)
    sft_message_timer--;

if (keyboard_check_pressed(vk_escape) || button2_p())
{
    if (sft_page == 0)
    {
        instance_destroy();
    }
    else
    {
        sft_page = 0;
        sft_scroll = 0;
    }
    exit;
}

if (sft_page == 0)
{
    if (up_p())
    {
        audio_play_sound(snd_menumove, 50, 0);
        sft_index = scr_wrap(sft_index - 1, 0, sft_item_count - 1);
    }
    else if (down_p())
    {
        audio_play_sound(snd_menumove, 50, 0);
        sft_index = scr_wrap(sft_index + 1, 0, sft_item_count - 1);
    }
    else if (left_p())
    {
        audio_play_sound(snd_menumove, 50, 0);
        sft_change_current(-1);
    }
    else if (right_p())
    {
        audio_play_sound(snd_menumove, 50, 0);
        sft_change_current(1);
    }
    else if (button1_p())
    {
        audio_play_sound(snd_select, 50, 0);
        sft_accept_current();
    }
}
else if (sft_page == 1)
{
    if (up_p())
    {
        audio_play_sound(snd_menumove, 50, 0);
        sft_scroll = max(0, sft_scroll - 1);
    }
    else if (down_p())
    {
        audio_play_sound(snd_menumove, 50, 0);
        sft_scroll = min(5, sft_scroll + 1);
    }
}
else if (sft_page == 2)
{
    if (button1_p())
    {
        audio_play_sound(snd_select, 50, 0);
        sft_page = 0;
    }
}
");
importGroup.QueueReplace(settingsObj.EventHandlerFor(EventType.Draw, (uint)64, Data), @"draw_set_alpha(0.92);
draw_set_color(c_black);
draw_rectangle(0, 0, 640, 480, false);
draw_set_alpha(1);
draw_set_color(c_white);
draw_rectangle(34, 34, 606, 446, true);
draw_rectangle(38, 38, 602, 442, true);

draw_set_font(sft_font);
draw_set_halign(fa_center);
draw_set_valign(fa_top);
draw_set_color(c_white);
draw_text_transformed(320, 54, ""SETTINGS"", 2, 2, 0);

draw_set_halign(fa_left);

if (sft_page == 0)
{
    draw_text(72, 92, ""Chapter Select Settings Mod"");
    draw_text(72, 116, ""Z/Enter/A: select   X/Esc/B: back   Left/Right: change"");
    
    for (var i = 0; i < sft_item_count; i++)
    {
        var yy = 158 + (i * 30);
        
        if (i == sft_index)
        {
            draw_set_color(c_red);
            draw_text(58, yy, ""♥"");
            draw_set_color(c_yellow);
        }
        else
        {
            draw_set_color(c_white);
        }
        
        draw_text(96, yy, sft_item_text(i));
        draw_set_halign(fa_right);
        draw_text(548, yy, sft_item_value(i));
        draw_set_halign(fa_left);
    }
    
    draw_set_color(c_aqua);
    draw_text(72, 410, ""Auto-Run/Simplify VFX are saved as SFT_SETTINGS hooks for a later chapter-side patch."");
}
else if (sft_page == 1)
{
    draw_set_color(c_white);
    draw_text(72, 94, ""Controls Info"");
    draw_text(72, 118, ""This reads the current global.input_k/global.input_g values."");
    draw_text(72, 142, ""Use Reset Controls on the main page to restore defaults."");
    draw_text(84, 182, ""Function"");
    draw_text(270, 182, ""Keyboard"");
    draw_text(420, 182, ""Gamepad"");
    
    var labels = [""DOWN"", ""RIGHT"", ""UP"", ""LEFT"", ""CONFIRM"", ""CANCEL"", ""MENU"", ""ALT CONFIRM"", ""ALT CANCEL"", ""ALT MENU""];
    for (var i = 0; i < 7; i++)
    {
        var k = i + sft_scroll;
        if (k >= 10)
            break;
        var yy = 214 + (i * 26);
        draw_set_color(c_white);
        draw_text(84, yy, labels[k]);
        draw_text(270, yy, sft_key_name(global.input_k[k]));
        draw_text(420, yy, sft_gamepad_name(global.input_g[k]));
    }
    
    draw_set_color(c_aqua);
    draw_text(72, 410, ""Up/Down scroll | X/Esc/B back"");
}
else if (sft_page == 2)
{
    draw_set_color(c_white);
    draw_text(72, 94, ""Config File Info"");
    draw_text(72, 128, ""true_config.ini"");
    draw_text(104, 158, ""[SCREEN] FULLSCREEN = "" + string(sft_fullscreen));
    draw_text(104, 188, ""[LANG] LANG = "" + sft_lang);
    draw_text(104, 218, ""[SFT_SETTINGS] MASTER_VOLUME = "" + string(round(sft_volume)));
    draw_text(104, 248, ""[SFT_SETTINGS] SIMPLIFY_VFX = "" + string(sft_simplify_vfx));
    draw_text(104, 278, ""[SFT_SETTINGS] AUTO_RUN = "" + string(sft_autorun));
    draw_text(72, 326, ""keyconfig_0.ini is used by the Write/Reset Controls tools."");
    draw_set_color(c_aqua);
    draw_text(72, 410, ""Z/Enter/A or X/Esc/B back"");
}

if (sft_message_timer > 0)
{
    draw_set_halign(fa_center);
    draw_set_color(c_lime);
    draw_text(320, 452, sft_message);
    draw_set_halign(fa_left);
}

draw_set_color(c_white);
draw_set_alpha(1);
draw_set_halign(fa_left);
draw_set_valign(fa_top);
");
importGroup.QueueReplace(settingsObj.EventHandlerFor(EventType.Destroy, Data), @"global.sft_settings_open = false;
");

// Patch Chapter Select footer to add Settings beside Quit / Language.
importGroup.QueueReplace(objFooter.EventHandlerFor(EventType.Create, Data), @"_init = false;
_parent = -4;
_input_enabled = false;
_choices = [];
_choice_index = 0;
_grid_display = -4;
_alpha = 0;
_fade_in = false;

init = function(arg0)
{
    _parent = arg0;
    var settings_text = (global.lang == ""en"") ? ""Settings"" : ""設定"";
    var settings_choice = instance_create(x + 320, y + 24, obj_ui_choice);
    settings_choice.init(id, settings_text, 90);
    settings_choice.set_alpha(0);
    settings_choice.y -= 40;
    _choices = [settings_choice];
    
    if (!global.is_console)
    {
        var quit_text = (global.lang == ""en"") ? ""Quit"" : ""終了"";
        var quit_choice = instance_create(x + 185, y + 24, obj_ui_choice);
        quit_choice.init(id, quit_text, UnknownEnum.Value_4);
        quit_choice.set_alpha(0);
        quit_choice.y -= 40;
        settings_choice.x = quit_choice.x + 170;
        _choices = [quit_choice, settings_choice];
    }
    
    var version_display = instance_create(x, y, obj_ui_version);
    version_display.set_screen_state(UnknownEnum.Value_4);
    _grid_display = instance_create(x + 584, y + 26, obj_ui_grid);
    _init = true;
};

fade_in = function()
{
    _fade_in = true;
    
    if (_grid_display != -4)
        _grid_display.fade_in();
};

reset = function()
{
    _choice_index = 0;
    
    for (var i = 0; i < array_length(_choices); i++)
    {
        var choice = _choices[i];
        choice.reset();
    }
};

highlight = function()
{
    for (var i = 0; i < array_length(_choices); i++)
    {
        var choice = _choices[i];
        choice.reset();
        
        if (i == _choice_index)
            choice.highlight();
    }
};

enable_input = function()
{
    _input_enabled = true;
};

disable_input = function()
{
    _input_enabled = false;
    
    for (var i = 0; i < array_length(_choices); i++)
    {
        var choice = _choices[i];
        choice.disable_input();
    }
};

trigger_event = function(arg0, arg1)
{
    switch (arg1)
    {
        case UnknownEnum.Value_4:
            disable_input();
            _parent.trigger_event(arg0, arg1);
            break;
        
        case 90:
            if (!instance_exists(obj_sft_chapter_settings_screen))
                instance_create(0, 0, obj_sft_chapter_settings_screen);
            break;
    }
};

enum UnknownEnum
{
    Value_4 = 4,
    Value_5
}
");
importGroup.QueueReplace(objFooter.EventHandlerFor(EventType.Step, Data), @"if (_fade_in)
{
    _alpha = lerp(_alpha, 1, 0.06);
    
    for (var i = 0; i < array_length(_choices); i++)
    {
        var choice = _choices[i];
        choice.set_alpha(_alpha);
        choice.y = lerp(choice.y, choice.ystart, 0.14);
    }
    
    if (_alpha >= 1)
        _fade_in = false;
}

if (variable_global_exists(""sft_settings_open"") && global.sft_settings_open)
    exit;

if (!_input_enabled)
    exit;

if (up_p())
{
    audio_play_sound(snd_menumove, 50, 0);
    _parent.trigger_event(""scroll_footer_up"");
}
else if (down_p())
{
    audio_play_sound(snd_menumove, 50, 0);
    _parent.trigger_event(""scroll_footer_down"");
}

if (array_length(_choices) == 1)
    exit;

if (left_p())
{
    audio_play_sound(snd_menumove, 50, 0);
    _choice_index = scr_wrap(_choice_index - 1, 0, array_length(_choices) - 1);
    highlight();
}
else if (right_p())
{
    audio_play_sound(snd_menumove, 50, 0);
    _choice_index = scr_wrap(_choice_index + 1, 0, array_length(_choices) - 1);
    highlight();
}
");

// Pause the original Chapter Select controls while the Settings screen is open.
importGroup.QueueReplace(objList.EventHandlerFor(EventType.Step, Data), @"if (variable_global_exists(""sft_settings_open"") && global.sft_settings_open)
    exit;

if (!_input_enabled)
    exit;

_input_time--;

if (_input_time > 0)
    exit;

if (up_p())
{
    _input_time = _input_buffer;
    audio_play_sound(snd_menumove, 50, 0);
    var target_index = _chapter_index - 1;
    
    if (target_index < 0)
    {
        _parent.trigger_event(""scroll_list_up"");
        reset();
    }
    else
    {
        _chapter_index = target_index;
        highlight();
    }
}
else if (down_p())
{
    _input_time = _input_buffer;
    audio_play_sound(snd_menumove, 50, 0);
    var target_index = _chapter_index + 1;
    
    if (target_index >= array_length(_chapters))
    {
        _parent.trigger_event(""scroll_list_down"");
        reset();
    }
    else
    {
        _chapter_index = target_index;
        highlight();
    }
}
");
importGroup.QueueReplace(objChapter.EventHandlerFor(EventType.Step, Data), @"if (_fade_in)
{
    _alpha = lerp(_alpha, 1, 0.06);
    y = lerp(y, ystart, 0.14);
    _chapter_choice.set_alpha(_alpha);
    _chapter_choice.y = lerp(_chapter_choice.y, _chapter_choice.ystart, 0.14);
    
    for (var i = 0; i < array_length(_choices); i++)
    {
        var choice = _choices[i];
        choice.set_alpha(_alpha);
        choice.y = lerp(choice.y, choice.ystart, 0.14);
    }
    
    if (_alpha >= 1)
        _fade_in = false;
}

if (variable_global_exists(""sft_settings_open"") && global.sft_settings_open)
    exit;

if (!_scroll_enabled)
    exit;

if (left_p())
{
    audio_play_sound(snd_menumove, 50, 0);
    _choice_index = scr_wrap(_choice_index - 1, 0, array_length(_choices) - 1);
    highlight_choice();
}
else if (right_p())
{
    audio_play_sound(snd_menumove, 50, 0);
    _choice_index = scr_wrap(_choice_index + 1, 0, array_length(_choices) - 1);
    highlight_choice();
}
else if (button2_p())
{
    audio_play_sound(snd_swing, 50, 0);
    trigger_event(""select"", UnknownEnum.Value_3);
}

enum UnknownEnum
{
    Value_3 = 3
}
");
importGroup.QueueReplace(objChoice.EventHandlerFor(EventType.Step, Data), @"if (!_init)
    exit;

if (variable_global_exists(""sft_settings_open"") && global.sft_settings_open)
    exit;

if (!_input_enabled)
    exit;

_input_time--;

if (_input_time > 0)
    exit;

if (button1_p())
{
    _input_time = _input_buffer;
    select();
}
");

importGroup.Import();

ScriptMessage(@"SFT Chapter Select Settings Button Mod v1 R2 installed!

Added:
- Settings button in the Chapter Select footer
- Removed the original EN/JA footer button because Language now lives in Settings
- Fullscreen toggle writes true_config.ini
- Language toggle writes true_config.ini and restarts the Chapter Select room
- Master Volume writes SFT_SETTINGS/MASTER_VOLUME
- Controls Info page
- Reset/Write Controls to keyconfig_0.ini

This build uses a full-screen Settings overlay instead of a separate GameMaker room because it is safer for Chapter Select input/init objects.");
