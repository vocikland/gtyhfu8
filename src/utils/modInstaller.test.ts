/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeZipEntryPath,
  resolveTargetSdPath,
  isSafeZipEntry,
  calculateProgressStats,
} from './modInstaller.ts';

test('normalizeZipEntryPath strips outer folders and romfs prefix correctly', () => {
  // Case 1: direct romfs path
  assert.equal(
    normalizeZipEntryPath('romfs/fighter/sonic/model/body/c01/model.nud'),
    'fighter/sonic/model/body/c01/model.nud'
  );

  // Case 2: wrapped in mod folder
  assert.equal(
    normalizeZipEntryPath('Shadow_Sonic_Pack_v2/romfs/fighter/sonic/model/body/c01/model.nud'),
    'fighter/sonic/model/body/c01/model.nud'
  );

  // Case 3: flat path without romfs
  assert.equal(
    normalizeZipEntryPath('fighter/mario/model/body/c00/model.nud'),
    'fighter/mario/model/body/c00/model.nud'
  );

  // Case 4: Windows backward slashes
  assert.equal(
    normalizeZipEntryPath('ShadowMod\\romfs\\sound\\bgm\\snd_bgm_01.dspadpcm'),
    'sound/bgm/snd_bgm_01.dspadpcm'
  );
});

test('resolveTargetSdPath maps correctly to Smash 3DS regional Title IDs', () => {
  const usaPath = resolveTargetSdPath('USA', 'romfs/fighter/fox/sound/voice.nus3bank');
  assert.equal(usaPath, 'sdmc:/luma/titles/00040000000EDF00/romfs/fighter/fox/sound/voice.nus3bank');

  const eurPath = resolveTargetSdPath('EUR', 'romfs/fighter/fox/sound/voice.nus3bank');
  assert.equal(eurPath, 'sdmc:/luma/titles/00040000000EE000/romfs/fighter/fox/sound/voice.nus3bank');

  const jpnPath = resolveTargetSdPath('JPN', 'romfs/fighter/fox/sound/voice.nus3bank');
  assert.equal(jpnPath, 'sdmc:/luma/titles/00040000000B8B00/romfs/fighter/fox/sound/voice.nus3bank');
});

test('isSafeZipEntry rejects directory traversal and absolute paths', () => {
  assert.equal(isSafeZipEntry('fighter/mario/model.nud'), true);
  assert.equal(isSafeZipEntry('../../../boot.firm'), false);
  assert.equal(isSafeZipEntry('/luma/payloads/godmode9.firm'), false);
  assert.equal(isSafeZipEntry('\\windows\\system32'), false);
  assert.equal(isSafeZipEntry(''), false);
});

test('calculateProgressStats produces correct percentages, ETAs and formatted speeds', () => {
  const stats = calculateProgressStats(5 * 1024 * 1024, 10 * 1024 * 1024, 1024 * 1024);
  assert.equal(stats.percent, 50);
  assert.equal(stats.etaSeconds, 5);
  assert.equal(stats.speedFormatted, '1.0 MB/s');
});
