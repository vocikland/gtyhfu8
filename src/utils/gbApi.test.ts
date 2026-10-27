/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildGameBananaEndpoint,
  buildModProfileEndpoint,
  parseSubfeedResponse,
  buildGameBananaSearchEndpoint,
  encodeGbSearchQuery,
  filterModsByQuery,
  formatEmptySearchMessage,
} from './gbApi.ts';

test('buildGameBananaEndpoint formats correct API URLs for Smash 3DS (6364)', () => {
  const url1 = buildGameBananaEndpoint(6364, 1, 20, 'new');
  assert.equal(url1, 'https://gamebanana.com/apiv11/Game/6364/Subfeed?_nPage=1&_nPerpage=20&_sSort=new');

  const urlWithCat = buildGameBananaEndpoint(6364, 2, 10, 'likes', 4512);
  assert.equal(
    urlWithCat,
    'https://gamebanana.com/apiv11/Game/6364/Subfeed?_nPage=2&_nPerpage=10&_sSort=likes&_idCategoryRow=4512'
  );

  const profileUrl = buildModProfileEndpoint(384912);
  assert.equal(profileUrl, 'https://gamebanana.com/apiv11/Mod/384912/ProfilePage');
});

test('parseSubfeedResponse extracts mod records and pagination cleanly', () => {
  const mockGbPayload = JSON.stringify({
    _aMetadata: {
      _nRecordCount: 1420,
      _bIsComplete: false,
    },
    _aRecords: [
      {
        _idRow: 384912,
        _sName: 'Shadow over Sonic Skin',
        _aRootCategory: { _sName: 'Fighter Skins' },
        _idCategoryRow: 102,
        _aSubmitter: { _sName: 'ShadowFan' },
        _nLikeCount: 350,
        _nViewCount: 12000,
        _bHasFiles: true,
        _aPreviewMedia: {
          _aImages: [
            {
              _sBaseUrl: 'https://images.gamebanana.com',
              _sFile220: 'preview_220.jpg',
            },
          ],
        },
      },
    ],
  });

  const parsed = parseSubfeedResponse(mockGbPayload);
  assert.equal(parsed.items.length, 1);
  assert.equal(parsed.totalRecords, 1420);
  assert.equal(parsed.hasMore, true);
  assert.equal(parsed.items[0].name, 'Shadow over Sonic Skin');
  assert.equal(parsed.items[0].author, 'ShadowFan');
  assert.equal(parsed.items[0].likes, 350);
  assert.equal(parsed.items[0].thumbnailUrl, 'https://images.gamebanana.com/preview_220.jpg');
});

test('encodeGbSearchQuery handles spaces, symbols, and empty strings safely', () => {
  assert.equal(encodeGbSearchQuery(''), '');
  assert.equal(encodeGbSearchQuery('   '), '');
  assert.equal(encodeGbSearchQuery('mario'), 'mario');
  assert.equal(encodeGbSearchQuery('sonic the hedgehog'), 'sonic%20the%20hedgehog');
  assert.equal(encodeGbSearchQuery('fox & falco'), 'fox%20%26%20falco');
  assert.equal(encodeGbSearchQuery('c00/model+patch!'), 'c00%2Fmodel%2Bpatch%21');
});

test('buildGameBananaSearchEndpoint formats keyword search URLs correctly', () => {
  const url = buildGameBananaSearchEndpoint(6364, 'shadow sonic', 1, 15, 'downloads');
  assert.equal(
    url,
    'https://gamebanana.com/apiv11/Game/6364/Subfeed?_nPage=1&_nPerpage=15&_sSort=downloads&_sSearchString=shadow%20sonic'
  );

  const urlWithCategory = buildGameBananaSearchEndpoint(6364, 'mario', 2, 10, 'likes', 4512);
  assert.equal(
    urlWithCategory,
    'https://gamebanana.com/apiv11/Game/6364/Subfeed?_nPage=2&_nPerpage=10&_sSort=likes&_sSearchString=mario&_idCategoryRow=4512'
  );
});

test('filterModsByQuery filters mods by title, author, and category case-insensitively', () => {
  const mockMods = [
    { title: 'Shadow Sonic', author: 'KTH', category: 'Fighter Skin' },
    { title: 'Melee Fox', author: 'SmashPro', category: 'Audio' },
    { title: 'Brawl Battlefield', author: 'StageMaker', category: 'Stage' },
    { title: 'Mario Wedding Tuxedo', author: 'NintendoModder', category: 'Fighter Skin' },
  ];

  const sonicResults = filterModsByQuery(mockMods, 'sonic');
  assert.equal(sonicResults.length, 1);
  assert.equal(sonicResults[0].title, 'Shadow Sonic');

  const skinResults = filterModsByQuery(mockMods, 'skin');
  assert.equal(skinResults.length, 2);

  const authorResults = filterModsByQuery(mockMods, 'smashpro');
  assert.equal(authorResults.length, 1);
  assert.equal(authorResults[0].title, 'Melee Fox');

  const emptyResults = filterModsByQuery(mockMods, 'nonexistent_character');
  assert.equal(emptyResults.length, 0);

  const allResults = filterModsByQuery(mockMods, '   ');
  assert.equal(allResults.length, 4);
});

test('formatEmptySearchMessage returns informative 3DS UI messages', () => {
  assert.equal(
    formatEmptySearchMessage('xyz123'),
    "No mods found matching 'xyz123'."
  );
  assert.equal(
    formatEmptySearchMessage(''),
    'No search query provided. Press [Y] or tap below to search.'
  );
});
