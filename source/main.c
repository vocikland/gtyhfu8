/**
 * @file main.c
 * @brief SmashBanana 3DS - Main Application Entry Point
 * 
 * Target Hardware: Nintendo 3DS / New Nintendo 3DS
 * Target Game: Super Smash Bros. for Nintendo 3DS (Game ID: 6364)
 */

#include "common.h"
#include "ui.h"
#include "api.h"
#include "downloader.h"
#include "mod_manager.h"

int main(int argc, char* argv[]) {
    /* 1. Initialize 3DS OS Subsystems */
    gfxInitDefault();
    romfsInit();
    cfguInit();
    ptmSysmInit();

    /* 2. Initialize GameBanana API (httpc & mbedTLS) */
    Result apiRes = API_Init();
    if (R_FAILED(apiRes)) {
        printf("Failed to init httpc: 0x%08lX\n", apiRes);
    }

    /* 3. Initialize Background Downloader & Installed Mod Manager */
    Downloader_Init();
    ModManager_Init();

    /* 4. Initialize Citro3D & Citro2D GPU Pipelines */
    C3D_Init(C3D_DEFAULT_CMDBUF_SIZE);
    C2D_Init(C2D_DEFAULT_MAX_OBJECTS);
    C2D_Prepare();

    /* 5. Detect New 3DS & Enable 804MHz CPU Speedup + L2 Cache */
    bool isNew3DS = false;
    APT_CheckNew3DS(&isNew3DS);
    if (isNew3DS) {
        /* Boost CPU from 268MHz to 804MHz for lag-free HTTPS TLS & minizip */
        osSetSpeedupEnable(true);
    }

    /* 6. Initialize Dual-Screen UI Context */
    UIContext uiCtx;
    if (!UI_Init(&uiCtx)) {
        C2D_Fini();
        C3D_Fini();
        ModManager_Exit();
        Downloader_Exit();
        API_Exit();
        ptmSysmExit();
        cfguExit();
        romfsExit();
        gfxExit();
        return 1;
    }

    uiCtx.sysState.isNew3DS = isNew3DS;

    /* 7. Main Application Event Loop (60 FPS) */
    u32 frameCount = 0;
    while (aptMainLoop()) {
        hidScanInput();
        u32 kDown = hidKeysDown();
        u32 kHeld = hidKeysHeld();

        touchPosition touch;
        hidTouchRead(&touch);

        /* Exit cleanly on START button */
        if (kDown & KEY_START) {
            break;
        }

        /* Refresh hardware status and download progress */
        if ((frameCount % 30) == 0) {
            UI_UpdateSystemStatus(&uiCtx);
        }

        /* Handle user touch and button inputs */
        UI_HandleInput(&uiCtx, kDown, kHeld, touch);

        /* Render Top and Bottom displays */
        UI_Render(&uiCtx);

        frameCount++;
    }

    /* 8. Graceful Shutdown & Deallocation */
    UI_Cleanup(&uiCtx);

    C2D_Fini();
    C3D_Fini();

    ModManager_Exit();
    Downloader_Exit();
    API_Exit();

    ptmSysmExit();
    cfguExit();
    romfsExit();
    gfxExit();

    return 0;
}
