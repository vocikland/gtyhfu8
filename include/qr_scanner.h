/**
 * @file qr_scanner.h
 * @brief 3DS Camera QR Code Scanner using cam:u and quirc library.
 */

#ifndef QR_SCANNER_H
#define QR_SCANNER_H

#include <3ds.h>
#include <stdbool.h>
#include <stdio.h>

typedef struct {
    bool isCameraActive;
    u16* cameraBuffer;      /* YUV422 / RGB565 frame from 3DS outer/inner camera */
    u32 frameWidth;
    u32 frameHeight;
    char lastDecodedUrl[256];
    u32 lastModId;
    bool hasResult;
} QrScannerContext;

Result QrScanner_Init(QrScannerContext* ctx);
void   QrScanner_Exit(QrScannerContext* ctx);
Result QrScanner_StartCapture(QrScannerContext* ctx);
void   QrScanner_StopCapture(QrScannerContext* ctx);
bool   QrScanner_ScanFrame(QrScannerContext* ctx);

#endif /* QR_SCANNER_H */
