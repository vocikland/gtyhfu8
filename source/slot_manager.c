/**
 * @file slot_manager.c
 * @brief Implementation of Smash 3DS Fighter Costume Slot Remapper.
 */

#include "slot_manager.h"
#include <ctype.h>

static FighterSlotProfile s_profiles[] = {
    {"mario", "Mario", 8, {false}, {""}},
    {"sonic", "Sonic", 8, {false}, {""}},
    {"cloud", "Cloud", 8, {false}, {""}},
    {"bayonetta", "Bayonetta", 8, {false}, {""}},
    {"fox", "Fox", 8, {false}, {""}},
    {"link", "Link", 8, {false}, {""}},
    {"marth", "Marth", 8, {false}, {""}},
    {"falcon", "Captain Falcon", 8, {false}, {""}}
};

#define PROFILE_COUNT (sizeof(s_profiles) / sizeof(s_profiles[0]))

void SlotManager_Init(void) {
    for (size_t i = 0; i < PROFILE_COUNT; i++) {
        for (int s = 0; s < MAX_FIGHTER_SLOTS; s++) {
            s_profiles[i].slotOccupied[s] = false;
            s_profiles[i].slotModNames[s][0] = '\0';
        }
    }
}

bool SlotManager_DetectSlot(const char* path, char* outFighter, int* outSlot) {
    if (!path || !outFighter || !outSlot) return false;
    outFighter[0] = '\0';
    *outSlot = -1;

    const char* fPos = strstr(path, "fighter/");
    if (!fPos) return false;

    fPos += 8;
    const char* nextSlash = strchr(fPos, '/');
    if (!nextSlash) return false;

    size_t fLen = nextSlash - fPos;
    if (fLen >= 31) fLen = 31;
    strncpy(outFighter, fPos, fLen);
    outFighter[fLen] = '\0';

    for (size_t i = 0; i < fLen; i++) {
        outFighter[i] = tolower((unsigned char)outFighter[i]);
    }

    const char* cPos = strstr(nextSlash, "/c0");
    if (!cPos) cPos = strstr(nextSlash, "/c1");
    if (cPos && isdigit((unsigned char)cPos[3])) {
        *outSlot = (cPos[2] - '0') * 10 + (cPos[3] - '0');
        return true;
    }

    return true;
}

bool SlotManager_RemapPath(const char* inPath, int newSlot, char* outPath, size_t maxLen) {
    if (!inPath || !outPath || newSlot < 0 || newSlot > 15 || maxLen == 0) return false;
    strncpy(outPath, inPath, maxLen - 1);
    outPath[maxLen - 1] = '\0';

    char target[5];
    snprintf(target, sizeof(target), "c%02d", newSlot);

    char* p = outPath;
    while ((p = strstr(p, "/c")) != NULL) {
        if (isdigit((unsigned char)p[2]) && isdigit((unsigned char)p[3])) {
            p[1] = target[0];
            p[2] = target[1];
            p[3] = target[2];
            return true;
        }
        p += 2;
    }
    return true;
}

int SlotManager_FindFreeSlot(const char* fighter) {
    FighterSlotProfile* prof = SlotManager_GetProfile(fighter);
    if (!prof) return 0;

    for (int s = 0; s < MAX_FIGHTER_SLOTS; s++) {
        if (!prof->slotOccupied[s]) return s;
    }
    return -1;
}

FighterSlotProfile* SlotManager_GetProfile(const char* fighter) {
    if (!fighter) return NULL;
    for (size_t i = 0; i < PROFILE_COUNT; i++) {
        if (strcasecmp(s_profiles[i].id, fighter) == 0) {
            return &s_profiles[i];
        }
    }
    return NULL;
}
