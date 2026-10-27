/**
 * @file mod_manager.h
 * @brief Installed Mods Manager, Conflict Detection, and State Toggling for 3DS.
 */

#ifndef MOD_MANAGER_H
#define MOD_MANAGER_H

#include <3ds.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>
#include "common.h"

#define MAX_INSTALLED_MODS 64

typedef struct {
    u32 modId;
    char name[128];
    char author[48];
    char region[8];      /* "USA", "EUR", "JPN" */
    char category[48];
    char slotPath[128];  /* e.g. "fighter/mario/model/body/c00/" */
    u32 fileCount;
    u64 totalBytes;
    u64 installedAt;
    bool isEnabled;      /* Active in Luma3DS romfs or renamed .disabled */
} InstalledMod;

typedef struct {
    u32 count;
    InstalledMod mods[MAX_INSTALLED_MODS];
} InstalledManifest;

/* Manager Lifecycle */
Result ModManager_Init(void);
void ModManager_Exit(void);

/* Manifest read & write */
Result ModManager_LoadManifest(void);
Result ModManager_SaveManifest(void);

/* Query installed mods */
u32 ModManager_GetCount(void);
InstalledMod* ModManager_GetMod(u32 index);
InstalledMod* ModManager_FindById(u32 modId);

/* Actions: Toggle Enabled/Disabled and Clean Uninstall */
Result ModManager_ToggleMod(u32 modId);
Result ModManager_UninstallMod(u32 modId);

/* Conflict detection */
bool ModManager_CheckConflict(
    const char* targetSlot,
    u32 candidateModId,
    char* outConflictModName,
    size_t maxLen
);

#endif /* MOD_MANAGER_H */
