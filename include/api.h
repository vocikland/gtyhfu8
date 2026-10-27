/**
 * @file api.h
 * @brief GameBanana API client for Super Smash Bros. for Nintendo 3DS (Game ID: 6364).
 * Uses libctru's native httpc service with mbedTLS for secure HTTPS connections.
 */

#ifndef API_H
#define API_H

#include <3ds.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

#define GB_GAME_ID              6364
#define GB_BASE_URL             "https://gamebanana.com/apiv11"
#define GB_USER_AGENT           "SmashBanana-3DS/1.0.0 (Nintendo 3DS; devkitARM)"

#define GB_PAGE_SIZE            15
#define GB_MAX_TITLE_LEN        128
#define GB_MAX_AUTHOR_LEN       48
#define GB_MAX_CAT_LEN          48
#define GB_MAX_URL_LEN          256
#define GB_MAX_DESC_LEN         512
#define GB_MAX_FILES            8
#define GB_MAX_CATEGORIES       16

/* Sorting choices supported by GameBanana */
typedef enum {
    GB_SORT_NEWEST = 0,     /* Default: newest submissions */
    GB_SORT_LIKES,          /* Most liked */
    GB_SORT_VIEWS,          /* Most viewed */
    GB_SORT_DOWNLOADS       /* Most downloaded */
} GBSortMode;

/* Mod preview item stored in memory */
typedef struct {
    u32 modId;
    char name[GB_MAX_TITLE_LEN];
    char author[GB_MAX_AUTHOR_LEN];
    char category[GB_MAX_CAT_LEN];
    u32 categoryId;
    u32 likes;
    u32 views;
    u32 dateAdded;
    char thumbnailUrl[GB_MAX_URL_LEN];
    bool hasFiles;
} GBModSummary;

/* Paginated mod list container */
typedef struct {
    u32 count;
    u32 totalRecords;
    u32 currentPage;
    u32 perPage;
    bool hasNextPage;
    GBSortMode currentSort;
    u32 activeCategoryId;
    GBModSummary items[GB_PAGE_SIZE];
} GBModListPage;

/* Downloadable file metadata */
typedef struct {
    u32 fileId;
    char filename[96];
    u64 filesize;
    char downloadUrl[GB_MAX_URL_LEN];
    char md5Checksum[36];
    char description[128];
} GBFileEntry;

/* Complete detailed metadata for a single mod */
typedef struct {
    u32 modId;
    char name[GB_MAX_TITLE_LEN];
    char author[GB_MAX_AUTHOR_LEN];
    char category[GB_MAX_CAT_LEN];
    char description[GB_MAX_DESC_LEN];
    u32 likes;
    u32 views;
    u32 dateAdded;
    u32 fileCount;
    GBFileEntry files[GB_MAX_FILES];
} GBModDetails;

/* Category metadata */
typedef struct {
    u32 categoryId;
    char name[GB_MAX_CAT_LEN];
    u32 itemCount;
} GBCategory;

typedef struct {
    u32 count;
    GBCategory items[GB_MAX_CATEGORIES];
} GBCategoryList;

/* API Lifecycle & Requests */
Result API_Init(void);
void API_Exit(void);

/* Mod listing & navigation */
Result API_FetchModList(u32 page, u32 perPage, GBSortMode sort, u32 categoryId, GBModListPage* outList);
Result API_FetchNextPage(GBModListPage* list);
Result API_FetchPrevPage(GBModListPage* list);

/* Mod details & files */
Result API_FetchModDetails(u32 modId, GBModDetails* outDetails);

/* Category index */
Result API_FetchCategories(GBCategoryList* outCategories);

/* Search endpoint and query functions */
Result API_SearchMods(const char* query, u32 page, u32 perPage, GBSortMode sort, GBModListPage* outList);
void API_UrlEncode(const char* src, char* dest, size_t destSize);

/* Utility helpers */
const char* API_GetSortString(GBSortMode sort);
const char* API_GetSortDisplayName(GBSortMode sort);

#endif /* API_H */
