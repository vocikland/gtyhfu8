/**
 * @file common.h
 * @brief Common definitions, colors, screen dimensions, and Smash 3DS Title IDs.
 */

#ifndef COMMON_H
#define COMMON_H

#include <3ds.h>
#include <citro2d.h>
#include <citro3d.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

#define APP_NAME        "SmashBanana 3DS"
#define APP_SUBTITLE    "GameBanana Mod Manager (ID: 6364)"

/* Screen Dimensions */
#define SCREEN_TOP_WIDTH     400
#define SCREEN_TOP_HEIGHT    240
#define SCREEN_BOT_WIDTH     320
#define SCREEN_BOT_HEIGHT    240

/* Super Smash Bros. for Nintendo 3DS Title IDs */
#define SMASH_TITLE_USA      "00040000000EDF00"
#define SMASH_TITLE_EUR      "00040000000EE000"
#define SMASH_TITLE_JPN      "00040000000B8B00"

/* Default Paths */
#define PATH_LUMA_TITLES     "sdmc:/luma/titles/"
#define PATH_APP_DATA        "sdmc:/3ds/SmashBanana/"
#define PATH_CONFIG_FILE     "sdmc:/3ds/SmashBanana/config.json"
#define PATH_MANIFEST_FILE   "sdmc:/3ds/SmashBanana/installed.json"

/* Citro2D Color Palette (RGBA8) */
#define C2D_COLOR_BG_TOP     C2D_Color32(24, 26, 33, 255)
#define C2D_COLOR_BG_BOT     C2D_Color32(18, 19, 24, 255)
#define C2D_COLOR_HEADER     C2D_Color32(32, 35, 46, 255)
#define C2D_COLOR_ACCENT     C2D_Color32(255, 204, 0, 255)   /* Banana Yellow */
#define C2D_COLOR_SMASH_RED  C2D_Color32(230, 40, 50, 255)   /* Smash Emblem Red */
#define C2D_COLOR_TEXT_MAIN  C2D_Color32(240, 242, 245, 255)
#define C2D_COLOR_TEXT_MUTED C2D_Color32(140, 146, 160, 255)
#define C2D_COLOR_CARD_BG    C2D_Color32(30, 33, 44, 255)
#define C2D_COLOR_CARD_SEL   C2D_Color32(45, 52, 72, 255)
#define C2D_COLOR_SUCCESS    C2D_Color32(46, 204, 113, 255)
#define C2D_COLOR_BORDER     C2D_Color32(50, 55, 70, 255)

/* System hardware status */
typedef struct {
    bool isNew3DS;
    u8 batteryPercent;
    bool isCharging;
    u8 wifiLevel;
    u64 sdFreeBytes;
    u64 sdTotalBytes;
    char currentRegion[8]; /* "USA", "EUR", "JPN" */
} SystemState;

#endif /* COMMON_H */
