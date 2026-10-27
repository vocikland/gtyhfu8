/**
 * @file slot_manager.h
 * @brief Smash 3DS Fighter Costume Slot Remapper & Conflict Resolver.
 */

#ifndef SLOT_MANAGER_H
#define SLOT_MANAGER_H

#include <3ds.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

#define MAX_FIGHTER_SLOTS 8

typedef struct {
    char id[32];            /* "mario", "sonic", "cloud", "bayonetta" */
    char displayName[48];   /* "Mario", "Sonic", "Cloud" */
    int activeSlotCount;
    bool slotOccupied[MAX_FIGHTER_SLOTS];
    char slotModNames[MAX_FIGHTER_SLOTS][64];
} FighterSlotProfile;

/* Initializes slot tables and scans installed mods */
void SlotManager_Init(void);

/* Detects fighter and costume slot number from romfs path */
bool SlotManager_DetectSlot(const char* path, char* outFighter, int* outSlot);

/* Remaps a path from oldSlot to newSlot (e.g. c00 -> c03) */
bool SlotManager_RemapPath(const char* inPath, int newSlot, char* outPath, size_t maxLen);

/* Finds the first unoccupied slot for a fighter */
int SlotManager_FindFreeSlot(const char* fighter);

/* Gets slot profile for fighter */
FighterSlotProfile* SlotManager_GetProfile(const char* fighter);

#endif /* SLOT_MANAGER_H */
