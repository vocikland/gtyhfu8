/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GBModSummary {
  id: number;
  name: string;
  category: string;
  categoryId: number;
  author: string;
  likes: number;
  views: number;
  thumbnailUrl: string;
  dateAdded: number;
  hasFiles: boolean;
  targetSlotHint?: string;
}

export interface GBFileEntry {
  fileId: number;
  filename: string;
  filesize: number;
  downloadUrl: string;
  md5Checksum: string;
  description: string;
}

export interface GBModDetails extends GBModSummary {
  description: string;
  text: string;
  files: GBFileEntry[];
}

export type GBSortMode = 'new' | 'likes' | 'views' | 'downloads';

export function buildGameBananaEndpoint(
  gameId: number,
  page: number = 1,
  perPage: number = 20,
  sort: GBSortMode = 'new',
  categoryId?: number
): string {
  let url = `https://gamebanana.com/apiv11/Game/${gameId}/Subfeed?_nPage=${page}&_nPerpage=${perPage}&_sSort=${sort}`;
  if (categoryId && categoryId > 0) {
    url += `&_idCategoryRow=${categoryId}`;
  }
  return url;
}

export function buildModProfileEndpoint(modId: number): string {
  return `https://gamebanana.com/apiv11/Mod/${modId}/ProfilePage`;
}

/**
 * Safely URL-encodes a search string following RFC 3986 for GameBanana queries.
 * Characters [a-zA-Z0-9-_.~] remain untouched; space is %20; others percent-encoded.
 */
export function encodeGbSearchQuery(query: string): string {
  if (!query) return '';
  return encodeURIComponent(query.trim())
    .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

/**
 * Formats GameBanana API Search endpoint with keyword filtering (_sSearchString).
 */
export function buildGameBananaSearchEndpoint(
  gameId: number,
  searchQuery: string,
  page: number = 1,
  perPage: number = 15,
  sort: GBSortMode = 'new',
  categoryId?: number
): string {
  const encodedQuery = encodeGbSearchQuery(searchQuery);
  let url = `https://gamebanana.com/apiv11/Game/${gameId}/Subfeed?_nPage=${page}&_nPerpage=${perPage}&_sSort=${sort}`;
  if (encodedQuery) {
    url += `&_sSearchString=${encodedQuery}`;
  }
  if (categoryId && categoryId > 0) {
    url += `&_idCategoryRow=${categoryId}`;
  }
  return url;
}

/**
 * Filters a list of mods locally by query matching title, author, or category.
 */
export function filterModsByQuery<T extends { title?: string; name?: string; author: string; category: string }>(
  mods: T[],
  query: string
): T[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return mods;

  return mods.filter((m) => {
    const titleMatch = (m.title || m.name || '').toLowerCase().includes(trimmed);
    const authorMatch = m.author.toLowerCase().includes(trimmed);
    const categoryMatch = m.category.toLowerCase().includes(trimmed);
    return titleMatch || authorMatch || categoryMatch;
  });
}

/**
 * Formats a clean 3DS UI empty-state status message.
 */
export function formatEmptySearchMessage(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return 'No search query provided. Press [Y] or tap below to search.';
  return `No mods found matching '${trimmed}'.`;
}

export function parseSubfeedResponse(jsonStr: string): {
  items: GBModSummary[];
  totalRecords: number;
  hasMore: boolean;
} {
  try {
    const data = JSON.parse(jsonStr);
    const records = Array.isArray(data._aRecords) ? data._aRecords : [];
    const totalRecords = typeof data._aMetadata?._nRecordCount === 'number' ? data._aMetadata._nRecordCount : records.length;
    const isComplete = data._aMetadata?._bIsComplete ?? false;

    const items: GBModSummary[] = records.map((rec: any) => {
      const media = rec._aPreviewMedia?._aImages?.[0];
      const thumb = media ? `${media._sBaseUrl}/${media._sFile220 || media._sFile}` : '';
      return {
        id: rec._idRow,
        name: rec._sName || 'Untitled Mod',
        category: rec._sModelName || rec._aRootCategory?._sName || 'General',
        categoryId: rec._idCategoryRow || 0,
        author: rec._aSubmitter?._sName || 'Anonymous',
        likes: rec._nLikeCount || 0,
        views: rec._nViewCount || 0,
        thumbnailUrl: thumb,
        dateAdded: rec._tsDateAdded || 0,
        hasFiles: rec._bHasFiles ?? true,
      };
    });

    return {
      items,
      totalRecords,
      hasMore: !isComplete && items.length > 0,
    };
  } catch {
    return { items: [], totalRecords: 0, hasMore: false };
  }
}
