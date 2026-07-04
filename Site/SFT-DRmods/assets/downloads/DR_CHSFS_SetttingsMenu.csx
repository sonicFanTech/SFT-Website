// SFT DELTARUNE Save File Select Settings Button Mod v1 - R5 Console Flag Fix + Control Editor
// Targets normal chapter data.win files, not the Chapter Select data.win.
// Keeps the mod version as v1. R5 is only the build/fix label.

using System;
using UndertaleModLib.Util;

EnsureDataLoaded();

if (!Data.IsGameMaker2())
    throw new Exception("This script targets GameMaker Studio 2 data files like DELTARUNE.");

UndertaleGameObject NeedObject(string name)
{
    var obj = Data.GameObjects.ByName(name);
    if (obj is null)
        throw new Exception($"Required object '{name}' was not found. This does not look like a normal DELTARUNE chapter data.win save-file-select build.");
    return obj;
}

var deviceMenu = NeedObject("DEVICE_MENU");
var gameController = NeedObject("obj_gamecontroller");

var controller = Data.GameObjects.ByName("obj_sft_savefile_settings_controller");
if (controller is null)
{
    controller = new UndertaleGameObject()
    {
        Name = Data.Strings.MakeString("obj_sft_savefile_settings_controller"),
        Persistent = true,
        Visible = true
    };
    Data.GameObjects.Add(controller);
}
else
{
    controller.Persistent = true;
    controller.Visible = true;
}

// Add the controller to the first room so it exists on the save-file-select screen.
// It is persistent and applies slot overrides after a save is loaded.
var entryRoom = Data.GeneralInfo.RoomOrder[0].Resource;
bool addToRoom = true;
UndertaleRoom.Layer targetLayer = null;

foreach (var layer in entryRoom.Layers)
{
    if (layer.LayerType != UndertaleRoom.LayerType.Instances)
        continue;

    foreach (var inst in layer.InstancesData.Instances)
    {
        if (inst.ObjectDefinition == controller)
        {
            addToRoom = false;
            break;
        }
    }

    if (targetLayer is null || targetLayer.LayerDepth > layer.LayerDepth)
        targetLayer = layer;

    if (!addToRoom)
        break;
}

if (addToRoom)
{
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
            LayerName = Data.Strings.MakeString("SFT_SaveFile_Settings_Layer"),
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
}

UndertaleModLib.Compiler.CodeImportGroup importGroup = new(Data)
{
    MainThreadAction = MainThreadAction
};

// DEVICE_MENU Begin Step: block original EN/JA action when we are using that footer slot as Settings.
importGroup.QueueReplace(deviceMenu.EventHandlerFor(EventType.Step, (uint)1, Data), @"if (!variable_global_exists(""sft_file_settings_open""))
    global.sft_file_settings_open = false;

if (global.sft_file_settings_open)
{
    input_enabled = false;
    ONEBUFFER = 3;
    TWOBUFFER = 3;
    exit;
}

if (!input_enabled)
    exit;

// Safety intercept for the old EN/JA footer slot. The persistent SFT controller also catches this,
// but this Begin Step block stops DEVICE_MENU from running scr_change_language() on the same frame.
if (MENU_NO == 0 && MENUCOORD[0] == 6 && button1_p() && ONEBUFFER < 0)
{
    global.sft_file_settings_open = true;
    input_enabled = false;
    ONEBUFFER = 4;
    TWOBUFFER = 4;
    SELNOISE = 1;
    exit;
}
");

// Controller Create.
importGroup.QueueReplace(controller.EventHandlerFor(EventType.Create, Data), @"if (instance_number(object_index) > 1)
{
    instance_destroy();
    exit;
}

persistent = true;
visible = true;
depth = -1000000;

if (!variable_global_exists(""sft_file_settings_open""))
    global.sft_file_settings_open = false;

// DELTARUNE's ossafe_* helpers can read global.is_console.
// On the save-file select screen it may not exist yet, so create a safe PC default before any config file access.
if (!variable_global_exists(""is_console""))
    global.is_console = false;

sft_index = 0;
sft_page = 0;
sft_input_timer = 6;
sft_message = ""Select Settings on the file screen footer."";
sft_message_timer = 90;
sft_items = 10;
sft_last_seen_slot = 0;
sft_target_slot = 0;
sft_last_applied_slot = -1;
sft_master_override = -1;
sft_autorun_override = -1;
sft_simplify_override = -1;
sft_ctrl_index = 0;
sft_ctrl_column = 0;
sft_ctrl_wait = 0;
sft_ctrl_message = """";
sft_ctrl_flash = 0;
sft_shoulderlb_reassign = 0;

sft_func_names[0] = ""DOWN"";
sft_func_names[1] = ""RIGHT"";
sft_func_names[2] = ""UP"";
sft_func_names[3] = ""LEFT"";
sft_func_names[4] = ""CONFIRM"";
sft_func_names[5] = ""CANCEL"";
sft_func_names[6] = ""MENU"";

sft_gamepad_controls = [gp_face1, gp_face2, gp_face3, gp_face4, gp_shoulderl, gp_shoulderlb, gp_shoulderr, gp_shoulderrb, gp_select, gp_start, gp_stickl, gp_stickr, gp_padu, gp_padd, gp_padl, gp_padr];

sft_reset_default_controls = function()
{
    sft_k[0] = vk_down;
    sft_k[1] = vk_right;
    sft_k[2] = vk_up;
    sft_k[3] = vk_left;
    sft_k[4] = ord(""Z"");
    sft_k[5] = ord(""X"");
    sft_k[6] = ord(""C"");
    sft_k[7] = vk_enter;
    sft_k[8] = vk_shift;
    sft_k[9] = vk_control;
    sft_g[0] = gp_padd;
    sft_g[1] = gp_padr;
    sft_g[2] = gp_padu;
    sft_g[3] = gp_padl;
    // Do not read global.button0/button1/button2 here.
    // On the save-file select screen those globals may not exist yet, which crashes on boot.
    // These match DELTARUNE's default Xbox-style mapping: A confirm, B cancel, Y menu.
    sft_g[4] = gp_face1;
    sft_g[5] = gp_face2;
    sft_g[6] = gp_face4;
    sft_g[7] = 999;
    sft_g[8] = 999;
    sft_g[9] = 999;
    sft_shoulderlb_reassign = 0;
};

sft_load_slot_settings = function()
{
    sft_master_override = -1;
    sft_autorun_override = -1;
    sft_simplify_override = -1;

    var _file = ""keyconfig_"" + string(sft_target_slot) + "".ini"";

    if (ossafe_file_exists(_file))
    {
        ossafe_ini_open(_file);
        sft_master_override = ini_read_real(""SFT_SETTINGS"", ""MASTER_VOLUME"", -1);
        sft_autorun_override = ini_read_real(""SFT_SETTINGS"", ""AUTO_RUN"", -1);
        sft_simplify_override = ini_read_real(""SFT_SETTINGS"", ""SIMPLIFY_VFX"", -1);
        ossafe_ini_close();
    }
};

sft_write_slot_settings = function()
{
    var _file = ""keyconfig_"" + string(sft_target_slot) + "".ini"";
    ossafe_ini_open(_file);
    ini_write_real(""SFT_SETTINGS"", ""MASTER_VOLUME"", sft_master_override);
    ini_write_real(""SFT_SETTINGS"", ""AUTO_RUN"", sft_autorun_override);
    ini_write_real(""SFT_SETTINGS"", ""SIMPLIFY_VFX"", sft_simplify_override);
    ossafe_ini_close();
    ossafe_savedata_save();
};

sft_load_controls = function()
{
    sft_reset_default_controls();
    var _file = ""keyconfig_"" + string(sft_target_slot) + "".ini"";

    if (ossafe_file_exists(_file))
    {
        ossafe_ini_open(_file);

        for (var i = 0; i < 10; i += 1)
        {
            var _rv = ini_read_real(""KEYBOARD_CONTROLS"", string(i), -9999);

            if (_rv != -9999)
                sft_k[i] = _rv;
        }

        for (var i = 0; i < 10; i += 1)
        {
            var _gv = ini_read_real(""GAMEPAD_CONTROLS"", string(i), -9999);

            if (_gv != -9999)
                sft_g[i] = _gv;
        }

        sft_shoulderlb_reassign = ini_read_real(""SHOULDERLB_REASSIGN"", ""SHOULDERLB_REASSIGN"", sft_shoulderlb_reassign);
        ossafe_ini_close();
    }
};

sft_write_controls = function()
{
    var _file = ""keyconfig_"" + string(sft_target_slot) + "".ini"";
    ossafe_ini_open(_file);

    for (var i = 0; i < 10; i += 1)
        ini_write_real(""KEYBOARD_CONTROLS"", string(i), sft_k[i]);

    for (var i = 0; i < 10; i += 1)
        ini_write_real(""GAMEPAD_CONTROLS"", string(i), sft_g[i]);

    ini_write_real(""SHOULDERLB_REASSIGN"", ""SHOULDERLB_REASSIGN"", sft_shoulderlb_reassign);
    ossafe_ini_close();
    ossafe_savedata_save();
};

sft_key_name = function(_key)
{
    if (_key < 0)
        return ""---"";

    if (variable_global_exists(""asc_def""))
    {
        if (_key >= 0 && _key < array_length_1d(global.asc_def))
        {
            var _txt = string(global.asc_def[_key]);

            if (_txt != """")
                return _txt;
        }
    }

    return string(_key);
};

sft_assign_keyboard = function(_new_key)
{
    if (_new_key < 0 || sft_ctrl_index < 0 || sft_ctrl_index > 6)
        return;

    var _dupe = -1;

    for (var i = 0; i < 7; i += 1)
    {
        if (sft_k[i] == _new_key)
            _dupe = i;
    }

    if (_dupe >= 0)
        sft_k[_dupe] = sft_k[sft_ctrl_index];

    sft_k[sft_ctrl_index] = _new_key;

    var _enter_cancel = -1;
    var _shift_cancel = -1;
    var _ctrl_cancel = -1;

    for (var i = 0; i < 7; i += 1)
    {
        if (sft_k[i] == vk_enter)
            _enter_cancel = 1;

        if (sft_k[i] == vk_shift)
            _shift_cancel = 1;

        if (sft_k[i] == vk_control)
            _ctrl_cancel = 1;
    }

    sft_k[7] = (_enter_cancel == -1) ? vk_enter : -1;
    sft_k[8] = (_shift_cancel == -1) ? vk_shift : -1;
    sft_k[9] = (_ctrl_cancel == -1) ? vk_control : -1;
};

sft_assign_gamepad = function(_new_button)
{
    if (_new_button < 0 || sft_ctrl_index < 0 || sft_ctrl_index > 6)
        return;

    if (_new_button == gp_shoulderlb)
        sft_shoulderlb_reassign = 1;

    var _dupe = -1;

    for (var i = 0; i < 7; i += 1)
    {
        if (sft_g[i] == _new_button)
            _dupe = i;
    }

    if (_dupe >= 0)
        sft_g[_dupe] = sft_g[sft_ctrl_index];

    sft_g[sft_ctrl_index] = _new_button;
};

sft_apply_loaded_settings = function()
{
    if (instance_exists(DEVICE_MENU))
        return;

    if (!variable_global_exists(""filechoice""))
        return;

    if (!variable_global_exists(""flag""))
        return;

    var _slot = global.filechoice;

    if (_slot < 0 || _slot > 9)
        return;

    if (sft_last_applied_slot == _slot)
        return;

    var _file = ""keyconfig_"" + string(_slot) + "".ini"";

    if (!ossafe_file_exists(_file))
        return;

    ossafe_ini_open(_file);
    var _mv = ini_read_real(""SFT_SETTINGS"", ""MASTER_VOLUME"", -1);
    var _ar = ini_read_real(""SFT_SETTINGS"", ""AUTO_RUN"", -1);
    var _vfx = ini_read_real(""SFT_SETTINGS"", ""SIMPLIFY_VFX"", -1);
    ossafe_ini_close();

    if (_mv >= 0)
    {
        global.flag[17] = clamp(_mv / 100, 0, 1);
        audio_set_master_gain(0, global.flag[17]);
    }

    if (_ar >= 0)
        global.flag[11] = clamp(round(_ar), 0, 1);

    if (_vfx >= 0)
        global.flag[8] = clamp(round(_vfx), 0, 1);

    sft_last_applied_slot = _slot;
};

sft_reset_default_controls();
sft_load_slot_settings();
sft_load_controls();
sft_init_done = true;
");

// Controller Begin Step.
importGroup.QueueReplace(controller.EventHandlerFor(EventType.Step, (uint)1, Data), @"if (!variable_global_exists(""sft_file_settings_open""))
    global.sft_file_settings_open = false;

if (!variable_global_exists(""is_console""))
    global.is_console = false;

sft_trigger_settings = false;

if (!global.sft_file_settings_open && instance_exists(DEVICE_MENU))
{
    with (DEVICE_MENU)
    {
        if (MENU_NO == 0 || MENU_NO == 1)
        {
            if (MENUCOORD[0] >= 0 && MENUCOORD[0] <= 2)
                other.sft_last_seen_slot = MENUCOORD[0];
        }

        // MENUCOORD[0] == 6 is the built-in EN/JA footer slot on the normal chapter save-file screen.
        // We steal that slot and turn it into Settings.
        if ((MENU_NO == 0 || MENU_NO == 1) && MENUCOORD[0] == 6 && button1_p())
        {
            other.sft_trigger_settings = true;
            input_enabled = false;
            ONEBUFFER = 10;
            TWOBUFFER = 10;
            MOVENOISE = 0;
            SELNOISE = 0;
            BACKNOISE = 0;
        }
    }
}

if (sft_trigger_settings)
{
    global.sft_file_settings_open = true;
    sft_page = 0;
    sft_index = 0;
    sft_input_timer = 10;
    sft_target_slot = clamp(sft_last_seen_slot, 0, 2);
    sft_load_slot_settings();
    sft_load_controls();
    sft_message = ""Save-file settings opened. Target slot "" + string(sft_target_slot + 1) + ""."";
    sft_message_timer = 90;
    snd_play(snd_select);
}
");

// Controller Step.
importGroup.QueueReplace(controller.EventHandlerFor(EventType.Step, Data), @"if (!variable_global_exists(""sft_file_settings_open""))
    global.sft_file_settings_open = false;

if (!variable_global_exists(""is_console""))
    global.is_console = false;

sft_apply_loaded_settings();

if (sft_message_timer > 0)
    sft_message_timer -= 1;

if (sft_ctrl_flash > 0)
    sft_ctrl_flash -= 1;

if (!global.sft_file_settings_open)
    exit;

if (sft_input_timer > 0)
    sft_input_timer -= 1;

with (DEVICE_MENU)
{
    input_enabled = false;
    ONEBUFFER = 3;
    TWOBUFFER = 3;
}

var close_menu = false;

// Controls editor capture mode.
if (sft_page == 2 && sft_ctrl_wait > 0)
{
    if (sft_ctrl_wait == 1)
    {
        var _new_key = -1;

        if (keyboard_check_pressed(vk_escape))
        {
            sft_ctrl_wait = 0;
            sft_ctrl_message = ""Keyboard bind cancelled."";
            sft_input_timer = 8;
            snd_play(snd_swing);
            exit;
        }

        if (keyboard_check_pressed(vk_anykey))
        {
            for (var i = 48; i <= 90; i += 1)
            {
                if (keyboard_check_pressed(i))
                    _new_key = i;
            }

            if (keyboard_check_pressed(59))
                _new_key = 59;

            if (keyboard_check_pressed(vk_printscreen))
                _new_key = 44;

            if (keyboard_check_pressed(vk_delete))
                _new_key = 46;

            if (keyboard_check_pressed(47))
                _new_key = 47;

            if (keyboard_check_pressed(92))
                _new_key = 92;

            if (keyboard_check_pressed(93))
                _new_key = 93;

            if (keyboard_check_pressed(91))
                _new_key = 91;

            if (keyboard_check_pressed(vk_numpad0))
                _new_key = 96;

            if (keyboard_check_pressed(vk_insert))
                _new_key = 45;

            if (keyboard_check_pressed(61))
                _new_key = 61;

            if (keyboard_check_pressed(vk_left))
                _new_key = 37;

            if (keyboard_check_pressed(vk_right))
                _new_key = 39;

            if (keyboard_check_pressed(vk_up))
                _new_key = 38;

            if (keyboard_check_pressed(vk_down))
                _new_key = 40;

            if (keyboard_check_pressed(vk_backspace))
                _new_key = 8;

            if (keyboard_check_pressed(vk_alt))
                _new_key = 18;

            if (keyboard_check_pressed(vk_enter) || keyboard_check_pressed(vk_shift) || keyboard_check_pressed(vk_control))
                _new_key = -1;

            if (_new_key != -1)
            {
                sft_assign_keyboard(_new_key);
                sft_write_controls();
                sft_ctrl_wait = 0;
                sft_ctrl_message = ""Keyboard control saved."";
                sft_ctrl_flash = 12;
                sft_input_timer = 8;
                snd_play(snd_select);
                exit;
            }
        }
    }

    if (sft_ctrl_wait == 2)
    {
        var _new_button = -1;

        if (keyboard_check_pressed(vk_escape))
        {
            sft_ctrl_wait = 0;
            sft_ctrl_message = ""Gamepad bind cancelled."";
            sft_input_timer = 8;
            snd_play(snd_swing);
            exit;
        }

        if (obj_gamecontroller.gamepad_active)
        {
            for (var i = 0; i < array_length_1d(sft_gamepad_controls); i += 1)
            {
                if (gamepad_button_check_pressed(obj_gamecontroller.gamepad_id, sft_gamepad_controls[i]))
                    _new_button = sft_gamepad_controls[i];
            }
        }

        if (_new_button != -1)
        {
            sft_assign_gamepad(_new_button);
            sft_write_controls();
            sft_ctrl_wait = 0;
            sft_ctrl_message = ""Gamepad control saved."";
            sft_ctrl_flash = 12;
            sft_input_timer = 8;
            snd_play(snd_select);
            exit;
        }
    }

    exit;
}

if (button2_p() && sft_input_timer <= 0)
{
    if (sft_page == 0)
        close_menu = true;
    else
    {
        sft_page = 0;
        sft_input_timer = 6;
        snd_play(snd_swing);
    }
}

if (sft_page == 2)
{
    if (sft_input_timer <= 0)
    {
        if (up_p())
        {
            sft_ctrl_index -= 1;

            if (sft_ctrl_index < 0)
                sft_ctrl_index = 9;

            sft_input_timer = 6;
            snd_play(snd_menumove);
        }

        if (down_p())
        {
            sft_ctrl_index += 1;

            if (sft_ctrl_index > 9)
                sft_ctrl_index = 0;

            sft_input_timer = 6;
            snd_play(snd_menumove);
        }

        if (left_p() || right_p())
        {
            sft_ctrl_column = 1 - sft_ctrl_column;
            sft_input_timer = 6;
            snd_play(snd_menumove);
        }

        if (button1_p())
        {
            if (sft_ctrl_index <= 6)
            {
                if (sft_ctrl_column == 0)
                {
                    sft_ctrl_wait = 1;
                    sft_ctrl_message = ""Press a keyboard key. ESC cancels."";
                }
                else
                {
                    sft_ctrl_wait = 2;
                    sft_ctrl_message = ""Press a gamepad button. ESC cancels."";
                }

                sft_input_timer = 10;
                snd_play(snd_select);
            }

            if (sft_ctrl_index == 7)
            {
                sft_reset_default_controls();
                sft_write_controls();
                sft_ctrl_message = ""Controls reset to DELTARUNE defaults."";
                sft_ctrl_flash = 12;
                sft_input_timer = 8;
                snd_play(snd_levelup);
            }

            if (sft_ctrl_index == 8)
            {
                sft_write_controls();
                sft_ctrl_message = ""Controls saved to keyconfig_"" + string(sft_target_slot) + "".ini."";
                sft_ctrl_flash = 12;
                sft_input_timer = 8;
                snd_play(snd_select);
            }

            if (sft_ctrl_index == 9)
            {
                sft_page = 0;
                sft_input_timer = 6;
                snd_play(snd_swing);
            }
        }
    }

    if (close_menu)
    {
        global.sft_file_settings_open = false;
        with (DEVICE_MENU)
        {
            input_enabled = true;
            ONEBUFFER = 6;
            TWOBUFFER = 6;
        }
    }

    exit;
}

if (sft_input_timer <= 0)
{
    if (up_p())
    {
        sft_index -= 1;

        if (sft_index < 0)
            sft_index = sft_items - 1;

        sft_input_timer = 6;
        snd_play(snd_menumove);
    }

    if (down_p())
    {
        sft_index += 1;

        if (sft_index >= sft_items)
            sft_index = 0;

        sft_input_timer = 6;
        snd_play(snd_menumove);
    }
}

var change_left = left_p();
var change_right = right_p();
var choose = button1_p();

if (sft_input_timer <= 0 && (change_left || change_right || choose))
{
    if (sft_index == 0)
    {
        if (change_left)
            sft_target_slot -= 1;
        else
            sft_target_slot += 1;

        if (sft_target_slot < 0)
            sft_target_slot = 2;

        if (sft_target_slot > 2)
            sft_target_slot = 0;

        sft_load_slot_settings();
        sft_load_controls();
        sft_message = ""Target save slot set to "" + string(sft_target_slot + 1) + ""."";
        sft_message_timer = 90;
        sft_input_timer = 8;
        snd_play(snd_menumove);
    }

    if (sft_index == 1)
    {
        if (sft_master_override < 0)
        {
            sft_master_override = 100;

            if (variable_global_exists(""flag""))
                sft_master_override = round(global.flag[17] * 100);
        }

        if (change_left)
            sft_master_override -= 5;

        if (change_right || choose)
            sft_master_override += 5;

        sft_master_override = clamp(sft_master_override, 0, 100);
        audio_set_master_gain(0, clamp(sft_master_override / 100, 0, 1));
        sft_write_slot_settings();
        sft_message = ""Master Volume override saved for slot "" + string(sft_target_slot + 1) + ""."";
        sft_message_timer = 90;
        sft_input_timer = 4;
        snd_play(snd_noise);
    }

    if (sft_index == 2)
    {
        if (sft_autorun_override < 0)
            sft_autorun_override = 1;
        else
            sft_autorun_override = 1 - sft_autorun_override;

        sft_write_slot_settings();
        sft_message = ""Auto-Run override saved for slot "" + string(sft_target_slot + 1) + ""."";
        sft_message_timer = 90;
        sft_input_timer = 8;
        snd_play(snd_select);
    }

    if (sft_index == 3)
    {
        if (sft_simplify_override < 0)
            sft_simplify_override = 1;
        else
            sft_simplify_override = 1 - sft_simplify_override;

        sft_write_slot_settings();
        sft_message = ""Simplify VFX override saved for slot "" + string(sft_target_slot + 1) + ""."";
        sft_message_timer = 90;
        sft_input_timer = 8;
        snd_play(snd_select);
    }

    if (sft_index == 4)
    {
        var _fs = !window_get_fullscreen();
        window_set_fullscreen(_fs);
        ossafe_ini_open(""true_config.ini"");
        ini_write_real(""SCREEN"", ""FULLSCREEN"", _fs ? 1 : 0);
        ossafe_ini_close();
        ossafe_savedata_save();
        sft_message = ""Fullscreen saved to true_config.ini."";
        sft_message_timer = 90;
        sft_input_timer = 8;
        snd_play(snd_select);
    }

    if (sft_index == 5)
    {
        global.sft_file_settings_open = false;
        scr_change_language();
        scr_84_load_ini();
        with (DEVICE_MENU)
        {
            input_enabled = true;
            ONEBUFFER = 8;
            TWOBUFFER = 8;
        }
        room_restart();
        exit;
    }

    if (sft_index == 6)
    {
        sft_page = 2;
        sft_ctrl_index = 0;
        sft_ctrl_wait = 0;
        sft_ctrl_message = ""Editing controls for slot "" + string(sft_target_slot + 1) + ""."";
        sft_input_timer = 8;
        snd_play(snd_select);
    }

    if (sft_index == 7)
    {
        sft_reset_default_controls();
        sft_write_controls();
        sft_message = ""Controls reset for slot "" + string(sft_target_slot + 1) + ""."";
        sft_message_timer = 90;
        sft_input_timer = 8;
        snd_play(snd_levelup);
    }

    if (sft_index == 8)
    {
        sft_write_slot_settings();
        sft_write_controls();
        sft_message = ""Slot settings and controls written."";
        sft_message_timer = 120;
        sft_input_timer = 8;
        snd_play(snd_select);
    }

    if (sft_index == 9)
    {
        close_menu = true;
    }
}

if (close_menu)
{
    global.sft_file_settings_open = false;
    with (DEVICE_MENU)
    {
        input_enabled = true;
        ONEBUFFER = 8;
        TWOBUFFER = 8;
    }
    snd_play(snd_swing);
}
");

// Controller Draw.
importGroup.QueueReplace(controller.EventHandlerFor(EventType.Draw, Data), @"if (!instance_exists(DEVICE_MENU))
    exit;

scr_84_set_draw_font(""main"");

// Hide the original EN/JA footer text and draw Settings over it.
sft_show_footer = false;
sft_footer_selected = false;

with (DEVICE_MENU)
{
    if (MENU_NO == 0 || MENU_NO == 1)
    {
        other.sft_show_footer = true;
        other.sft_footer_selected = (MENUCOORD[0] == 6);
    }
}

if (sft_show_footer && !global.sft_file_settings_open)
{
    draw_set_alpha(0.98);
    draw_set_color(c_black);
    draw_rectangle(124, 207, 202, 230, false);
    draw_set_alpha(1);

    if (sft_footer_selected)
        draw_set_color(c_yellow);
    else
        draw_set_color(c_white);

    draw_text_shadow(130, 210, ""Settings"");
}

if (!global.sft_file_settings_open)
{
    draw_set_alpha(1);
    draw_set_color(c_white);
    exit;
}

draw_set_alpha(0.90);
draw_set_color(c_black);
draw_rectangle(18, 13, 302, 229, false);
draw_set_alpha(1);
draw_set_color(c_white);
draw_rectangle(18, 13, 302, 229, true);

draw_set_halign(fa_center);
draw_set_color(c_white);
draw_text_shadow(160, 24, ""SETTINGS"");
draw_set_halign(fa_left);

draw_set_color(c_ltgray);
draw_text_shadow(35, 43, ""Save File Select Settings Mod v1"");

if (sft_page == 2)
{
    draw_set_color(c_white);
    draw_text_shadow(35, 59, ""Up/Down row | Left/Right column | Z/A bind | X/B back"");
    draw_set_color(c_aqua);
    draw_text_shadow(35, 73, ""Target Slot "" + string(sft_target_slot + 1) + "" | Column: "" + ((sft_ctrl_column == 0) ? ""Keyboard"" : ""Gamepad""));

    var _y = 91;
    var _gap = 13;

    for (var i = 0; i <= 6; i += 1)
    {
        if (i == sft_ctrl_index)
        {
            draw_set_color(c_yellow);
            draw_sprite(spr_heartsmall, 0, 32, _y + (i * _gap) + 2);
        }
        else
        {
            draw_set_color(c_white);
        }

        draw_text_shadow(48, _y + (i * _gap), sft_func_names[i]);

        if (sft_ctrl_column == 0 && i == sft_ctrl_index)
            draw_set_color(c_aqua);
        else
            draw_set_color(c_white);

        draw_text_shadow(132, _y + (i * _gap), sft_key_name(sft_k[i]));

        if (sft_ctrl_column == 1 && i == sft_ctrl_index)
            draw_set_color(c_aqua);
        else
            draw_set_color(c_white);

        var _spr = scr_getbuttonsprite(sft_g[i], false);

        if (_spr != noone)
            draw_sprite_ext(_spr, 0, 246, _y + (i * _gap) + 3, 1.5, 1.5, 0, c_white, 1);
        else
            draw_text_shadow(232, _y + (i * _gap), string(sft_g[i]));
    }

    for (var j = 7; j <= 9; j += 1)
    {
        if (j == sft_ctrl_index)
        {
            draw_set_color(c_yellow);
            draw_sprite(spr_heartsmall, 0, 32, _y + (j * _gap) + 2);
        }
        else
        {
            draw_set_color(c_white);
        }

        if (j == 7)
            draw_text_shadow(48, _y + (j * _gap), ""Reset Defaults"");

        if (j == 8)
            draw_text_shadow(48, _y + (j * _gap), ""Save Controls"");

        if (j == 9)
            draw_text_shadow(48, _y + (j * _gap), ""Back"");
    }

    if (sft_ctrl_wait > 0)
    {
        draw_set_alpha(0.92);
        draw_set_color(c_black);
        draw_rectangle(35, 181, 286, 211, false);
        draw_set_alpha(1);
        draw_set_color(c_yellow);
        draw_text_shadow(45, 190, sft_ctrl_message);
    }
    else if (sft_ctrl_message != """")
    {
        draw_set_color(c_aqua);
        draw_text_shadow(35, 214, sft_ctrl_message);
    }

    draw_set_alpha(1);
    draw_set_color(c_white);
    exit;
}

draw_set_color(c_white);
draw_text_shadow(35, 60, ""Up/Down move | Left/Right change | Z/A select | X/B back"");

var _mv = (sft_master_override < 0) ? ""Default"" : (string(sft_master_override) + ""%"");
var _autorun = (sft_autorun_override < 0) ? ""Default"" : ((sft_autorun_override == 1) ? ""ON"" : ""OFF"");
var _vfx = (sft_simplify_override < 0) ? ""Default"" : ((sft_simplify_override == 1) ? ""ON"" : ""OFF"");
var _fullscreen = window_get_fullscreen() ? ""ON"" : ""OFF"";
var _lang = variable_global_exists(""lang"") ? string_upper(global.lang) : ""EN"";

var yy = 80;
var gap = 14;

for (var i = 0; i < sft_items; i += 1)
{
    if (i == sft_index)
    {
        draw_set_color(c_yellow);
        draw_sprite(spr_heartsmall, 0, 35, yy + (i * gap) + 2);
    }
    else
    {
        draw_set_color(c_white);
    }

    if (i == 0)
    {
        draw_text_shadow(52, yy + (i * gap), ""Target Save Slot"");
        draw_set_halign(fa_right);
        draw_text_shadow(278, yy + (i * gap), string(sft_target_slot + 1));
        draw_set_halign(fa_left);
    }

    if (i == 1)
    {
        draw_text_shadow(52, yy + (i * gap), ""Master Volume"");
        draw_set_halign(fa_right);
        draw_text_shadow(278, yy + (i * gap), _mv);
        draw_set_halign(fa_left);
    }

    if (i == 2)
    {
        draw_text_shadow(52, yy + (i * gap), ""Auto-Run"");
        draw_set_halign(fa_right);
        draw_text_shadow(278, yy + (i * gap), _autorun);
        draw_set_halign(fa_left);
    }

    if (i == 3)
    {
        draw_text_shadow(52, yy + (i * gap), ""Simplify VFX"");
        draw_set_halign(fa_right);
        draw_text_shadow(278, yy + (i * gap), _vfx);
        draw_set_halign(fa_left);
    }

    if (i == 4)
    {
        draw_text_shadow(52, yy + (i * gap), ""Fullscreen"");
        draw_set_halign(fa_right);
        draw_text_shadow(278, yy + (i * gap), _fullscreen);
        draw_set_halign(fa_left);
    }

    if (i == 5)
    {
        draw_text_shadow(52, yy + (i * gap), ""Language"");
        draw_set_halign(fa_right);
        draw_text_shadow(278, yy + (i * gap), _lang);
        draw_set_halign(fa_left);
    }

    if (i == 6)
    {
        draw_text_shadow(52, yy + (i * gap), ""Control Editor"");
        draw_set_halign(fa_right);
        draw_text_shadow(278, yy + (i * gap), ""Open"");
        draw_set_halign(fa_left);
    }

    if (i == 7)
    {
        draw_text_shadow(52, yy + (i * gap), ""Reset Controls"");
        draw_set_halign(fa_right);
        draw_text_shadow(278, yy + (i * gap), ""Defaults"");
        draw_set_halign(fa_left);
    }

    if (i == 8)
    {
        draw_text_shadow(52, yy + (i * gap), ""Write Slot Data"");
        draw_set_halign(fa_right);
        draw_text_shadow(278, yy + (i * gap), ""Save"");
        draw_set_halign(fa_left);
    }

    if (i == 9)
    {
        draw_text_shadow(52, yy + (i * gap), ""Back"");
        draw_set_halign(fa_right);
        draw_text_shadow(278, yy + (i * gap), ""Close"");
        draw_set_halign(fa_left);
    }
}

if (sft_message_timer > 0)
{
    draw_set_color(c_aqua);
    draw_text_shadow(30, 215, sft_message);
}

draw_set_alpha(1);
draw_set_color(c_white);
scr_84_set_draw_font(""main"");
");

importGroup.Import();

ScriptMessage(@"SFT Save File Select Settings Button Mod v1 R4 installed!

R4 changes:
- Fixed boot crash caused by reading global.button0/button1/button2 before DELTARUNE creates them
- Default gamepad binds now use safe GameMaker constants instead
- Master Volume has a fallback if global.flag is not ready yet

R3 changes:
- Settings now target a selected save slot instead of writing fake global-only values
- Master Volume / Auto-Run / Simplify VFX are saved into keyconfig_SLOT.ini under [SFT_SETTINGS]
- The persistent SFT controller applies those overrides right after the save file loads, so the real in-game CONFIG menu should show them
- Added a Control Editor for keyboard/gamepad binds on the save-file select version
- Control Editor writes the normal DELTARUNE [KEYBOARD_CONTROLS] and [GAMEPAD_CONTROLS] sections
- The mod version stays v1; R4 is only the build/fix label

Use this on normal chapter data.win files, not the Chapter Select data.win.");
