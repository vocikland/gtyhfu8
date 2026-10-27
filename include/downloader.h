/**
 * @file downloader.h
 * @brief Asynchronous background mod downloader for Nintendo 3DS.
 * Uses 3DS threads (thread.h) on Core 1 to ensure UI renders smoothly at 60 FPS.
 */

#ifndef DOWNLOADER_H
#define DOWNLOADER_H

#include <3ds.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

typedef enum {
    DL_STATE_IDLE = 0,
    DL_STATE_CONNECTING,
    DL_STATE_DOWNLOADING,
    DL_STATE_EXTRACTING,
    DL_STATE_COMPLETED,
    DL_STATE_ERROR,
    DL_STATE_CANCELLED
} DownloadState;

typedef struct {
    DownloadState state;
    u64 downloadedBytes;
    u64 totalBytes;
    u32 speedBps;
    int progressPercent;
    char modTitle[128];
    char currentStatus[128];
    char errorMessage[128];
} DownloadStatusSnapshot;

/* Downloader Lifecycle */
Result Downloader_Init(void);
void Downloader_Exit(void);

/* Start download job in background thread */
Result Downloader_Start(
    const char* url,
    const char* targetRegion,
    const char* modTitle,
    u32 modId
);

/* Non-blocking thread-safe status inquiry for UI HUD */
void Downloader_GetStatus(DownloadStatusSnapshot* outSnapshot);

/* Request immediate cancellation of ongoing download */
void Downloader_Cancel(void);

/* Check if download worker thread is currently busy */
bool Downloader_IsBusy(void);

#endif /* DOWNLOADER_H */
