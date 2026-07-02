// DELTARUNE Debug Menu v1 for UndertaleModTool
// A more menu-driven expansion of the FancyRoomSelect-style injection.
// Run this script in UMT after opening one DELTARUNE chapter data file, then save a modded copy.
// This patches ONLY the currently opened chapter. Run it once per chapter you want to mod.
//
// In-game controls:
//   F3              Open / close the debug menu
//   Esc             Back / close
//   Backspace       Back, or delete a search character on searchable pages
//   Up / Down       Move through menu rows
//   Enter           Select menu row / run action
//
// v1 public release notes:
// - First public release build.
// - Includes the readable UI font/alignment fix for rooms where DELTARUNE draw state
//   can make debug text appear garbled.
//
// Feature base:
// - No separate feature hotkeys anymore. Features are controlled from categories inside the menu.
// - Adds category menu: Room Select, Player/Movement, Visual/Collision, Sound Test,
//   Sprite Viewer, Battle/Test Rooms, Runtime Info, and Object Browser.
// - Adds more overlay/debug drawing options.
//
// Notes:
// - This is a generic chapter-safe debug mod. True battle launching still needs chapter-specific
//   DELTARUNE battle script names and arguments.
// - Layer/object hiding is name-based and may need tuning for some chapters.

using System;
using System.Linq;
using System.Text;
using System.Collections.Generic;

EnsureDataLoaded();

if (!Data.IsGameMaker2())
{
    throw new Exception("This debug menu targets GameMaker Studio 2 games like DELTARUNE. This opened data file does not look like GMS2.");
}

string GmlString(string value)
{
    value ??= "";
    value = value.Replace("\r", " ").Replace("\n", " ").Replace("\t", " ");
    value = value.Replace("\\", "/").Replace("\"", "'");
    return "\"" + value + "\"";
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

var battleRoomNames = roomNames
    .Where(n => HasAny(n, "battle", "battletest", "testbattle", "fight", "enemy", "encounter", "arena"))
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
var characterObjectNames = objectNames.Where(n => HasAny(n, "npc", "character", "char", "kris", "susie", "ralsei", "noelle", "berdly", "enemy", "monster", "mainchara", "player", "chara")).ToList();

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

var entryRoom = Data.GeneralInfo.RoomOrder[0].Resource;
bool addToRoom = true;
UndertaleRoom.Layer targetLayer = null;

foreach (var layer in entryRoom.Layers)
{
    if (layer.LayerType != UndertaleRoom.LayerType.Instances)
        continue;

    foreach (var inst in layer.InstancesData.Instances)
    {
        if (inst.ObjectDefinition == obj)
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
            LayerName = Data.Strings.MakeString("SFT_DebugMenu_Layer"),
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
        ObjectDefinition = obj,
        X = 0,
        Y = 0
    };
    targetLayer.InstancesData.Instances.Add(newRoomObject);
    entryRoom.GameObjects.Add(newRoomObject);
}

string createCode = @"
if (instance_number(object_index) > 1)
{
    instance_destroy(id, false)
    exit
}

persistent = true
visible = true

// Use the same external TTF name the original UMT FancyRoomSelect script uses.
// Without this, some rooms inherit DELTARUNE's current draw font/align state and menu text can appear as symbols.
drdbg_font = font_add(""8bitoperator_jve.ttf"", 16, 0, 0, 32, 127)

drdbg_active = 0
drdbg_focus = 0
drdbg_category = 0
drdbg_category_count = 8
drdbg_search = """"
drdbg_selection = 0
drdbg_scroll = 0
drdbg_rebuild = 1
drdbg_max_rows = 14
drdbg_valid_chars = ""abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_0123456789 -.,:[]()""

drdbg_show_info = 1
drdbg_noclip = 0
drdbg_hide_backgrounds = 0
drdbg_hide_floors = 0
drdbg_hide_walls = 0
drdbg_hide_collision_objects = 0
drdbg_hide_characters = 0
drdbg_show_collision_boxes = 0
drdbg_show_object_labels = 0
drdbg_show_room_bounds = 0
drdbg_show_player_marker = 1
drdbg_layer_dirty = 1
drdbg_last_room = -1

drdbg_base_speed = game_get_speed(gamespeed_fps)
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

drdbg_results = ds_list_create()
drdbg_rooms = ds_list_create()
drdbg_sounds = ds_list_create()
drdbg_sprites = ds_list_create()
drdbg_battle_rooms = ds_list_create()
drdbg_objects = ds_list_create()
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
AddListItems("drdbg_layers_bg", bgLayerNames) +
AddListItems("drdbg_layers_floor", floorLayerNames) +
AddListItems("drdbg_layers_wall", wallLayerNames) +
AddListItems("drdbg_layers_collision", collisionLayerNames) +
AddListItems("drdbg_objects_collision", collisionObjectNames) +
AddListItems("drdbg_objects_character", characterObjectNames) +
@"
";

string stepCode = @"
// F3 is the only feature key. Everything else is controlled inside the menu.
if (keyboard_check_pressed(vk_f3))
{
    drdbg_active = 1 - drdbg_active
    if (!drdbg_active) global.interact = 0
    drdbg_focus = 0
    drdbg_search = """"
    drdbg_selection = 0
    drdbg_scroll = 0
    drdbg_rebuild = 1
    keyboard_clear(vk_f3)
}

// Find a likely player object every step so info/teleport/no-clip can work on most chapters.
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

// No-clip movement only runs while the menu is closed, so the menu does not fight player input.
if (drdbg_noclip && !drdbg_active && instance_exists(drdbg_player))
{
    var move_speed = drdbg_player_speed
    if (keyboard_check(vk_shift)) move_speed *= 3
    var move_x = keyboard_check(vk_right) - keyboard_check(vk_left)
    var move_y = keyboard_check(vk_down) - keyboard_check(vk_up)
    if (keyboard_check(ord(""D""))) move_x += 1
    if (keyboard_check(ord(""A""))) move_x -= 1
    if (keyboard_check(ord(""S""))) move_y += 1
    if (keyboard_check(ord(""W""))) move_y -= 1
    drdbg_player.x += move_x * move_speed
    drdbg_player.y += move_y * move_speed
}

// Re-apply layer/object visibility when entering a new room or changing a toggle.
if (room != drdbg_last_room || drdbg_layer_dirty)
{
    drdbg_last_room = room
    drdbg_layer_dirty = 0

    for (var i = 0; i < ds_list_size(drdbg_layers_bg); i++)
    {
        var lid = layer_get_id(ds_list_find_value(drdbg_layers_bg, i))
        if (lid != -1) layer_set_visible(lid, !drdbg_hide_backgrounds)
    }
    for (var i = 0; i < ds_list_size(drdbg_layers_floor); i++)
    {
        var lid = layer_get_id(ds_list_find_value(drdbg_layers_floor, i))
        if (lid != -1) layer_set_visible(lid, !drdbg_hide_floors)
    }
    for (var i = 0; i < ds_list_size(drdbg_layers_wall); i++)
    {
        var lid = layer_get_id(ds_list_find_value(drdbg_layers_wall, i))
        if (lid != -1) layer_set_visible(lid, !drdbg_hide_walls)
    }
    for (var i = 0; i < ds_list_size(drdbg_layers_collision); i++)
    {
        var lid = layer_get_id(ds_list_find_value(drdbg_layers_collision, i))
        if (lid != -1) layer_set_visible(lid, !drdbg_hide_collision_objects)
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

if (!drdbg_active)
{
    exit
}

global.interact = 1

// Back / close.
if (keyboard_check_pressed(vk_escape))
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
        global.interact = 0
    }
    keyboard_clear(vk_escape)
    exit
}

// Search typing only on searchable categories.
var searchable_page = (drdbg_focus == 1 && (drdbg_category == 0 || drdbg_category == 3 || drdbg_category == 4 || drdbg_category == 5 || drdbg_category == 7))
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

if (keyboard_check_pressed(vk_backspace))
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
    keyboard_clear(vk_backspace)
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

            if (q != """" && string_pos(q, lower_item) <= 0) add_item = 0
            if (add_item) ds_list_add(drdbg_results, item)
        }
    }
    drdbg_rebuild = 0
}

// Count rows for current menu.
var item_count = drdbg_category_count
if (drdbg_focus == 1)
{
    item_count = ds_list_size(drdbg_results)
    if (drdbg_category == 1) item_count = 5
    if (drdbg_category == 2) item_count = 11
    if (drdbg_category == 3) item_count = 3 + ds_list_size(drdbg_results)
    if (drdbg_category == 4) item_count = 4 + ds_list_size(drdbg_results)
    if (drdbg_category == 6) item_count = 6
}

// Navigation.
if (keyboard_check_pressed(vk_down))
{
    drdbg_selection += 1
    keyboard_clear(vk_down)
}
if (keyboard_check_pressed(vk_up))
{
    drdbg_selection -= 1
    keyboard_clear(vk_up)
}
if (drdbg_selection >= item_count) drdbg_selection = item_count - 1
if (drdbg_selection < 0) drdbg_selection = 0
if (drdbg_selection < drdbg_scroll) drdbg_scroll = drdbg_selection
if (drdbg_selection >= drdbg_scroll + drdbg_max_rows) drdbg_scroll = drdbg_selection - drdbg_max_rows + 1
if (drdbg_scroll < 0) drdbg_scroll = 0

// Enter action.
if (keyboard_check_pressed(vk_enter))
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
            if (room_exists(rid))
            {
                audio_stop_all()
                global.interact = 0
                drdbg_active = 0
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

        // Visual / Collision.
        if (drdbg_category == 2)
        {
            if (drdbg_selection == 0) drdbg_show_info = 1 - drdbg_show_info
            if (drdbg_selection == 1) { drdbg_hide_backgrounds = 1 - drdbg_hide_backgrounds; drdbg_layer_dirty = 1 }
            if (drdbg_selection == 2) { drdbg_hide_floors = 1 - drdbg_hide_floors; drdbg_layer_dirty = 1 }
            if (drdbg_selection == 3) { drdbg_hide_walls = 1 - drdbg_hide_walls; drdbg_layer_dirty = 1 }
            if (drdbg_selection == 4) { drdbg_hide_collision_objects = 1 - drdbg_hide_collision_objects; drdbg_layer_dirty = 1 }
            if (drdbg_selection == 5) { drdbg_hide_characters = 1 - drdbg_hide_characters; drdbg_layer_dirty = 1 }
            if (drdbg_selection == 6) drdbg_show_collision_boxes = 1 - drdbg_show_collision_boxes
            if (drdbg_selection == 7) drdbg_show_object_labels = 1 - drdbg_show_object_labels
            if (drdbg_selection == 8) drdbg_show_room_bounds = 1 - drdbg_show_room_bounds
            if (drdbg_selection == 9) drdbg_show_player_marker = 1 - drdbg_show_player_marker
            if (drdbg_selection == 10)
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
                    if (audio_exists(sid))
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
            if (room_exists(rid))
            {
                audio_stop_all()
                global.interact = 0
                drdbg_active = 0
                room_goto(rid)
            }
        }

        // Runtime Info / global quick actions.
        if (drdbg_category == 6)
        {
            if (drdbg_selection == 0) { drdbg_speed_scale = 0.5; game_set_speed(max(5, round(drdbg_base_speed * drdbg_speed_scale)), gamespeed_fps) }
            if (drdbg_selection == 1) { drdbg_speed_scale = 1; game_set_speed(drdbg_base_speed, gamespeed_fps) }
            if (drdbg_selection == 2) { drdbg_speed_scale = 2; game_set_speed(max(5, round(drdbg_base_speed * drdbg_speed_scale)), gamespeed_fps) }
            if (drdbg_selection == 3) { drdbg_speed_scale = 4; game_set_speed(max(5, round(drdbg_base_speed * drdbg_speed_scale)), gamespeed_fps) }
            if (drdbg_selection == 4) { audio_stop_all(); drdbg_playing_sound = -1 }
            if (drdbg_selection == 5)
            {
                drdbg_noclip = 0
                drdbg_speed_scale = 1
                game_set_speed(drdbg_base_speed, gamespeed_fps)
                audio_stop_all()
                drdbg_playing_sound = -1
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
    keyboard_clear(vk_enter)
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
";

string drawCode = @"
if (drdbg_font >= 0) draw_set_font(drdbg_font)
draw_set_halign(fa_left)
draw_set_valign(fa_top)

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
";

string drawGuiCode = @"
var gw = display_get_gui_width()
var gh = display_get_gui_height()

// Do not rely on whatever font/alignment the game was using before this Draw GUI event.
if (drdbg_font >= 0) draw_set_font(drdbg_font)
draw_set_halign(fa_left)
draw_set_valign(fa_top)

if (drdbg_show_info)
{
    draw_set_alpha(0.7)
    draw_set_color(c_black)
    draw_rectangle(8, 8, 405, 82, false)
    draw_set_alpha(1)
    draw_set_color(c_white)
    draw_text(16, 14, ""SFT Debug | room: "" + room_get_name(room) + "" ("" + string(room) + "")"")
    draw_text(16, 34, ""No-clip: "" + string(drdbg_noclip) + "" | noclip speed: "" + string(drdbg_player_speed) + "" | game speed: "" + string(drdbg_speed_scale) + ""x"")
    draw_text(16, 54, ""F3 opens menu. Features are controlled from menu categories."" )
}

if (!drdbg_active)
{
    draw_set_alpha(1)
    exit
}

draw_set_alpha(0.90)
draw_set_color(c_black)
draw_rectangle(24, 24, gw - 24, gh - 24, false)
draw_set_alpha(1)

draw_set_color(c_white)
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
}

draw_text(42, 38, ""SFT DELTARUNE Debug Menu v1 - "" + title)
draw_text(42, 58, ""Up/Down move | Enter select | Backspace/Esc back | F3 close"" )

draw_set_color(c_gray)
draw_rectangle(42, 84, gw - 42, 87, false)

var menu_y = 104
var line_h = 22

if (drdbg_focus == 0)
{
    for (var row = 0; row < drdbg_category_count; row++)
    {
        var label = ""Room Select""
        var desc = ""Warp to any room in this chapter with search.""
        if (row == 1) { label = ""Player / Movement""; desc = ""No-clip, no-clip speed, teleport-to-mouse, reload current room."" }
        if (row == 2) { label = ""Visual / Collision""; desc = ""Hide/show layers, draw hitboxes, labels, room bounds, and player marker."" }
        if (row == 3) { label = ""Sound Test""; desc = ""Search and play music/SFX from this chapter."" }
        if (row == 4) { label = ""Sprite / Animation Viewer""; desc = ""Search sprites and preview their animation frames."" }
        if (row == 5) { label = ""Battle / Test Rooms""; desc = ""Safe generic battle/test room warps."" }
        if (row == 6) { label = ""Runtime Info""; desc = ""Speed presets, audio stop, counts, room/player info."" }
        if (row == 7) { label = ""Object Browser""; desc = ""Search objects and toggle visible instances."" }

        if (row == drdbg_selection)
        {
            draw_set_color(c_yellow)
            draw_rectangle(42, menu_y - 2, gw - 42, menu_y + line_h - 2, true)
        }
        else draw_set_color(c_white)
        draw_text(52, menu_y, label + ""  -  "" + desc)
        menu_y += line_h
    }

    menu_y += 10
    draw_set_color(c_aqua)
    draw_text(52, menu_y, ""Status: no-clip="" + string(drdbg_noclip) + "", game speed="" + string(drdbg_speed_scale) + ""x, room="" + room_get_name(room))
}
else
{
    var searchable_page = (drdbg_category == 0 || drdbg_category == 3 || drdbg_category == 4 || drdbg_category == 5 || drdbg_category == 7)
    if (searchable_page)
    {
        draw_set_color(c_white)
        draw_text(42, menu_y, ""Search: "" + drdbg_search + ""    Results: "" + string(ds_list_size(drdbg_results)))
        menu_y += line_h + 4
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
            if (row == drdbg_selection) { draw_set_color(c_yellow); draw_rectangle(42, menu_y - 2, gw - 42, menu_y + line_h - 2, true) } else draw_set_color(c_white)
            draw_text(52, menu_y, label)
            menu_y += line_h
        }
        menu_y += 8
        draw_set_color(c_aqua)
        if (instance_exists(drdbg_player)) draw_text(52, menu_y, ""Player: "" + object_get_name(drdbg_player.object_index) + "" at "" + string(drdbg_player.x) + "", "" + string(drdbg_player.y))
        else draw_text(52, menu_y, ""Player candidate not found in this room."" )
    }
    else if (drdbg_category == 2)
    {
        for (var row = 0; row < 11; row++)
        {
            var label = ""Toggle info overlay: "" + string(drdbg_show_info)
            if (row == 1) label = ""Hide backgrounds/parallax layers: "" + string(drdbg_hide_backgrounds)
            if (row == 2) label = ""Hide floors/tile/ground layers: "" + string(drdbg_hide_floors)
            if (row == 3) label = ""Hide walls/front layers: "" + string(drdbg_hide_walls)
            if (row == 4) label = ""Hide collision/solid/block objects/layers: "" + string(drdbg_hide_collision_objects)
            if (row == 5) label = ""Hide characters/NPC-like objects: "" + string(drdbg_hide_characters)
            if (row == 6) label = ""Draw collision boxes: "" + string(drdbg_show_collision_boxes)
            if (row == 7) label = ""Draw object labels on collision objects: "" + string(drdbg_show_object_labels)
            if (row == 8) label = ""Draw room bounds: "" + string(drdbg_show_room_bounds)
            if (row == 9) label = ""Draw player marker: "" + string(drdbg_show_player_marker)
            if (row == 10) label = ""Reset all visual toggles""
            if (row == drdbg_selection) { draw_set_color(c_yellow); draw_rectangle(42, menu_y - 2, gw - 42, menu_y + line_h - 2, true) } else draw_set_color(c_white)
            draw_text(52, menu_y, label)
            menu_y += line_h
        }
        draw_set_color(c_aqua)
        draw_text(52, menu_y + 8, ""Detected lists: BG layers "" + string(ds_list_size(drdbg_layers_bg)) + "", floor layers "" + string(ds_list_size(drdbg_layers_floor)) + "", wall layers "" + string(ds_list_size(drdbg_layers_wall)) + "", collision objects "" + string(ds_list_size(drdbg_objects_collision)))
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
            if (row == drdbg_selection) { draw_set_color(c_yellow); draw_rectangle(42, menu_y - 2, gw - 42, menu_y + line_h - 2, true) } else draw_set_color(c_white)
            draw_text(52, menu_y, label)
            menu_y += line_h
        }
        var shown = 0
        for (var i = drdbg_scroll; i < ds_list_size(drdbg_results); i++)
        {
            var row_index = i + 3
            if (row_index < 3) continue
            if (shown >= drdbg_max_rows) break
            var item = ds_list_find_value(drdbg_results, i)
            if (row_index == drdbg_selection) { draw_set_color(c_yellow); draw_rectangle(42, menu_y - 2, gw - 42, menu_y + line_h - 2, true) } else draw_set_color(c_white)
            draw_text(52, menu_y, item)
            menu_y += line_h
            shown += 1
        }
    }
    else if (drdbg_category == 4)
    {
        for (var row = 0; row < 4; row++)
        {
            var label = ""Play/pause preview animation: "" + string(drdbg_sprite_anim)
            if (row == 1) label = ""Previous frame""
            if (row == 2) label = ""Next frame""
            if (row == 3) label = ""Reset frame to 0""
            if (row == drdbg_selection) { draw_set_color(c_yellow); draw_rectangle(42, menu_y - 2, gw - 42, menu_y + line_h - 2, true) } else draw_set_color(c_white)
            draw_text(52, menu_y, label)
            menu_y += line_h
        }
        var shown = 0
        for (var i = drdbg_scroll; i < ds_list_size(drdbg_results); i++)
        {
            var row_index = i + 4
            if (shown >= drdbg_max_rows) break
            var item = ds_list_find_value(drdbg_results, i)
            if (row_index == drdbg_selection) { draw_set_color(c_yellow); draw_rectangle(42, menu_y - 2, gw * 0.58, menu_y + line_h - 2, true) } else draw_set_color(c_white)
            draw_text(52, menu_y, item)
            menu_y += line_h
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
                var sc = min(4, min((gw * 0.32) / max(1, sw), (gh * 0.32) / max(1, sh)))
                draw_set_color(c_white)
                draw_text(gw * 0.62, 112, ""Preview: "" + item)
                draw_text(gw * 0.62, 132, ""Frame "" + string(drdbg_sprite_frame) + "" / "" + string(frames - 1) + "" | size "" + string(sw) + ""x"" + string(sh))
                draw_sprite_ext(sid, drdbg_sprite_frame, gw * 0.76, gh * 0.55, sc, sc, 0, c_white, 1)
            }
        }
    }
    else if (drdbg_category == 6)
    {
        draw_set_color(c_white)
        draw_text(52, menu_y, ""Room: "" + room_get_name(room) + "" / id "" + string(room) + "" | size "" + string(room_width) + ""x"" + string(room_height)); menu_y += line_h
        draw_text(52, menu_y, ""Mouse room pos: "" + string(mouse_x) + "", "" + string(mouse_y)); menu_y += line_h
        draw_text(52, menu_y, ""FPS real/current: "" + string(fps_real) + "" / "" + string(fps)); menu_y += line_h
        draw_text(52, menu_y, ""Asset counts: rooms "" + string(ds_list_size(drdbg_rooms)) + "", sounds "" + string(ds_list_size(drdbg_sounds)) + "", sprites "" + string(ds_list_size(drdbg_sprites)) + "", objects "" + string(ds_list_size(drdbg_objects))); menu_y += line_h
        if (instance_exists(drdbg_player)) draw_text(52, menu_y, ""Player: "" + object_get_name(drdbg_player.object_index) + "" at "" + string(drdbg_player.x) + "", "" + string(drdbg_player.y)); else draw_text(52, menu_y, ""Player: not found"" )
        menu_y += line_h + 10

        for (var row = 0; row < 6; row++)
        {
            var label = ""Set game speed to 0.5x""
            if (row == 1) label = ""Set game speed to 1x / normal""
            if (row == 2) label = ""Set game speed to 2x""
            if (row == 3) label = ""Set game speed to 4x""
            if (row == 4) label = ""Stop all audio""
            if (row == 5) label = ""Panic reset: no-clip OFF, speed normal, stop audio""
            if (row == drdbg_selection) { draw_set_color(c_yellow); draw_rectangle(42, menu_y - 2, gw - 42, menu_y + line_h - 2, true) } else draw_set_color(c_white)
            draw_text(52, menu_y, label)
            menu_y += line_h
        }
    }
    else
    {
        if (drdbg_category == 5)
        {
            draw_set_color(c_yellow)
            draw_text(42, menu_y, ""Safe mode: this only warps to battle/test-like rooms. Real battle launcher needs chapter-specific scripts."" )
            menu_y += line_h
        }

        var shown = 0
        for (var i = drdbg_scroll; i < ds_list_size(drdbg_results); i++)
        {
            if (shown >= drdbg_max_rows) break
            var item = ds_list_find_value(drdbg_results, i)
            if (i == drdbg_selection) { draw_set_color(c_yellow); draw_rectangle(42, menu_y - 2, gw - 42, menu_y + line_h - 2, true) } else draw_set_color(c_white)
            draw_text(52, menu_y, item)
            menu_y += line_h
            shown += 1
        }

        if (drdbg_category == 7 && ds_list_size(drdbg_results) > 0)
        {
            var item = ds_list_find_value(drdbg_results, drdbg_selection)
            var oi = asset_get_index(item)
            draw_set_color(c_aqua)
            if (oi >= 0) draw_text(52, menu_y + 8, ""Selected object live instances: "" + string(instance_number(oi)) + "". Enter toggles visible for live instances."" )
        }
    }
}

draw_set_alpha(1)
draw_set_color(c_white)
draw_set_halign(fa_left)
draw_set_valign(fa_top)
";

string destroyCode = @"
if (drdbg_font >= 0) font_delete(drdbg_font)
if (ds_exists(drdbg_results, ds_type_list)) ds_list_destroy(drdbg_results)
if (ds_exists(drdbg_rooms, ds_type_list)) ds_list_destroy(drdbg_rooms)
if (ds_exists(drdbg_sounds, ds_type_list)) ds_list_destroy(drdbg_sounds)
if (ds_exists(drdbg_sprites, ds_type_list)) ds_list_destroy(drdbg_sprites)
if (ds_exists(drdbg_battle_rooms, ds_type_list)) ds_list_destroy(drdbg_battle_rooms)
if (ds_exists(drdbg_objects, ds_type_list)) ds_list_destroy(drdbg_objects)
if (ds_exists(drdbg_layers_bg, ds_type_list)) ds_list_destroy(drdbg_layers_bg)
if (ds_exists(drdbg_layers_floor, ds_type_list)) ds_list_destroy(drdbg_layers_floor)
if (ds_exists(drdbg_layers_wall, ds_type_list)) ds_list_destroy(drdbg_layers_wall)
if (ds_exists(drdbg_layers_collision, ds_type_list)) ds_list_destroy(drdbg_layers_collision)
if (ds_exists(drdbg_objects_collision, ds_type_list)) ds_list_destroy(drdbg_objects_collision)
if (ds_exists(drdbg_objects_character, ds_type_list)) ds_list_destroy(drdbg_objects_character)
";

importGroup.QueueReplace(obj.EventHandlerFor(EventType.Create, Data), createCode);
importGroup.QueueReplace(obj.EventHandlerFor(EventType.Step, Data), stepCode);
importGroup.QueueReplace(obj.EventHandlerFor(EventType.Draw, Data), drawCode);
importGroup.QueueReplace(obj.EventHandlerFor(EventType.Draw, (uint)64, Data), drawGuiCode);
importGroup.QueueReplace(obj.EventHandlerFor(EventType.Destroy, Data), destroyCode);

importGroup.Import();

ScriptMessage(@$"SFT DELTARUNE Debug Menu v1 installed!

Patched object: obj_sft_debugmenu
Patched chapter/game: {Data.GeneralInfo.Name.Content}

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

Important notes:
- Run this script separately on each DELTARUNE chapter's data file.
- The only external shortcut is F3. Feature toggles now live inside menu categories.
- v1 includes the readable menu font/alignment fix to avoid garbled symbols in rooms that change draw state.
- Battle/Test page is intentionally safe/generic. A true battle launcher needs chapter-specific script names and arguments.
- Layer/object hiding is name-based, so it may need keyword tuning for some chapters.");
