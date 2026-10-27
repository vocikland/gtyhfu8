/**
 * @file qr_scanner.c
 * @brief Implementation of 3DS camera QR code reader for GameBanana URLs.
 */

#include "qr_scanner.h"
#include <quirc.h>
#include <stdlib.h>
#include <string.h>

#define CAM_WIDTH  400
#define CAM_HEIGHT 240

Result QrScanner_Init(QrScannerContext* ctx) {
    if (!ctx) return -1;
    memset(ctx, 0, sizeof(QrScannerContext));
    ctx->frameWidth = CAM_WIDTH;
    ctx->frameHeight = CAM_HEIGHT;
    ctx->cameraBuffer = (u16*)malloc(CAM_WIDTH * CAM_HEIGHT * sizeof(u16));
    if (!ctx->cameraBuffer) return -2;

    Result ret = camInit();
    return ret;
}

void QrScanner_Exit(QrScannerContext* ctx) {
    if (!ctx) return;
    QrScanner_StopCapture(ctx);
    if (ctx->cameraBuffer) {
        free(ctx->cameraBuffer);
        ctx->cameraBuffer = NULL;
    }
    camExit();
}

Result QrScanner_StartCapture(QrScannerContext* ctx) {
    if (!ctx || ctx->isCameraActive) return 0;

    /* Initialize outer right camera with 400x240 resolution */
    CAMU_Size size = SIZE_CTR_TOP_LCD;
    CAMU_OutputFmt fmt = OUTPUT_RGB_565;
    CAMU_FrameRate rate = FRAME_RATE_30;

    Result ret = CAMU_SetSize(SELECT_OUT1, size, CONTEXT_A);
    if (R_FAILED(ret)) return ret;

    CAMU_SetOutputFormat(SELECT_OUT1, fmt, CONTEXT_A);
    CAMU_SetFrameRate(SELECT_OUT1, rate);

    CAMU_StartCapture(SELECT_OUT1);
    ctx->isCameraActive = true;
    return 0;
}

void QrScanner_StopCapture(QrScannerContext* ctx) {
    if (!ctx || !ctx->isCameraActive) return;
    CAMU_StopCapture(SELECT_OUT1);
    ctx->isCameraActive = false;
}

bool QrScanner_ScanFrame(QrScannerContext* ctx) {
    if (!ctx || !ctx->isCameraActive) return false;

    struct quirc* q = quirc_new();
    if (!q) return false;

    if (quirc_resize(q, CAM_WIDTH, CAM_HEIGHT) < 0) {
        quirc_destroy(q);
        return false;
    }

    int w, h;
    uint8_t* image = quirc_begin(q, &w, &h);

    /* Convert RGB565 / YUV camera frame to 8-bit grayscale for quirc */
    for (int i = 0; i < w * h; i++) {
        u16 pixel = ctx->cameraBuffer[i];
        u8 r = (pixel >> 11) & 0x1F;
        u8 g = (pixel >> 5) & 0x3F;
        u8 b = pixel & 0x1F;
        image[i] = (uint8_t)((r * 8 * 299 + g * 4 * 587 + b * 8 * 114) / 1000);
    }

    quirc_end(q);

    int count = quirc_count(q);
    bool found = false;

    for (int i = 0; i < count; i++) {
        struct quirc_code code;
        struct quirc_data data;

        quirc_extract(q, i, &code);
        if (quirc_decode(&code, &data) == QUIRC_SUCCESS) {
            strncpy(ctx->lastDecodedUrl, (char*)data.payload, sizeof(ctx->lastDecodedUrl) - 1);
            ctx->lastDecodedUrl[sizeof(ctx->lastDecodedUrl) - 1] = '\0';
            ctx->hasResult = true;

            /* Parse mod id if GameBanana link */
            char* modPos = strstr(ctx->lastDecodedUrl, "gamebanana.com/mods/");
            if (modPos) {
                ctx->lastModId = (u32)atoi(modPos + 20);
            }
            found = true;
            break;
        }
    }

    quirc_destroy(q);
    return found;
}
