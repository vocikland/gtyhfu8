/**
 * @file ui.h
 * @brief Citro2D Dual-Screen UI Interface and State Management.
 */

#ifndef UI_H
#define UI_H

#include "common.h"
#include "api.h"
#include "downloader.h"

/* Display Mode on Top Screen */
typedef enum {
    VIEW_MODE_BROWSER = 0,
    VIEW_MODE_DETAILS
} UITopViewMode;

/* Active tab on Bottom Screen */
typedef enum {
    VIEW_TAB_EXPLORE = 0,
    VIEW_TAB_SEARCH,
    VIEW_TAB_CATEGORIES,
    VIEW_TAB_INSTALLED,
    VIEW_TAB_SETTINGS
} UIBottomTab;

/* Touch Interactive Button Hitbox */
typedef struct {
    float x, y, w, h;
    const char* label;
    u32 color;
} TouchButton;

/* UI Application Context */
typedef struct {
    C3D_RenderTarget* targetTop;
    C3D_RenderTarget* targetBottom;
    C2D_TextBuf staticTextBuf;
    C2D_TextBuf dynamicTextBuf;
    
    UITopViewMode topMode;
    UIBottomTab currentTab;
    int selectedIndex;
    int scrollOffset;
    
    /* Search subsystem */
    char searchFilter[64];
    char currentSearchQuery[64];
    bool isSearching;
    bool hasSearchQuery;
    char searchEmptyMessage[128];
    GBModListPage searchResults;
    u32 searchPage;
    
    SystemState sysState;
    DownloadStatusSnapshot dlSnapshot;
    
    char consoleLogs[6][64];
    u32 logCount;
    char statusMessage[128];
} UIContext;

/* Core UI Lifecycle */
bool UI_Init(UIContext* ctx);
void UI_Render(UIContext* ctx);
void UI_HandleInput(UIContext* ctx, u32 kDown, u32 kHeld, touchPosition touch);
void UI_UpdateSystemStatus(UIContext* ctx);
void UI_Cleanup(UIContext* ctx);

/* Top & Bottom Screen Drawers */
void UI_DrawTopScreen(UIContext* ctx);
void UI_DrawBottomScreen(UIContext* ctx);
void UI_DrawModDetails(UIContext* ctx);
void UI_DrawSearchScreen(UIContext* ctx);
void UI_DrawLogConsole(UIContext* ctx, float x, float y, float w, float h);

/* Interactive triggers & Search subsystem */
void UI_OpenSearchKeyboard(UIContext* ctx);
bool UI_TriggerSwkbdSearch(UIContext* ctx);
void UI_ExecuteSearch(UIContext* ctx, const char* query);
void UI_ClearSearch(UIContext* ctx);
void UI_NextSearchPage(UIContext* ctx);
void UI_PrevSearchPage(UIContext* ctx);
void UI_AddLog(UIContext* ctx, const char* msg);

#endif /* UI_H */
