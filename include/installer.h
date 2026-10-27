/**
 * @file installer.h
 * @brief Mod archive extractor and Luma3DS LayeredFS destination manager.
 * Uses minizip (unzip.h) for streaming .zip decompression directly to SDMC.
 */

#ifndef INSTALLER_H
#define INSTALLER_H

#include <3ds.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

typedef struct {
    bool success;
    u32 filesExtracted;
    u64 totalBytesExtracted;
    char targetRomfsPath[256];
    char errorMessage[128];
} InstallerResult;

/* Extract zip archive to Luma3DS layeredfs directory */
InstallerResult Installer_ExtractModArchive(
    const char* zipFilePath,
    const char* region,
    const char* modName,
    u32 modId
);

/* Resolves base romfs path based on Smash 3DS regional Title ID */
const char* Installer_GetSmashTitleId(const char* region);
void Installer_GetLumaRomfsPath(const char* region, char* outPath, size_t maxLen);

/* Path normalization: strips outer folders and romfs/ prefix */
void Installer_NormalizeZipPath(const char* rawPath, char* outCleanPath, size_t maxLen);

/* Manifest registry: records installed mod in sdmc:/3ds/SmashBanana/installed.json */
bool Installer_RegisterInstalledMod(u32 modId, const char* modName, const char* region, u32 fileCount);

#endif /* INSTALLER_H */
