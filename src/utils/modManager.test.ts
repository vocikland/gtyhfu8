/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkModConflict,
  getToggledDirectoryPath,
  isModUpdateAvailable,
  serializeManifest,
  parseManifest,
  InstalledModRecord,
} from './modManager.ts';

test('checkModConflict accurately detects overlapping fighter slots', () => {
  const installed: InstalledModRecord[] = [
    {
      id: 101,
      name: 'Mario Sunshine Skin',
      author: 'ModderA',
      region: 'USA',
      category: 'Skins',
      slotPath: 'fighter/mario/model/body/c00/',
      fileCount: 4,
      totalBytes: 2048000,
      installedAt: 1600000000,
      isEnabled: true,
    },
    {
      id: 102,
      name: 'Sonic Movie Skin',
      author: 'ModderB',
      region: 'USA',
      category: 'Skins',
      slotPath: 'fighter/sonic/model/body/c01/',
      fileCount: 5,
      totalBytes: 3100000,
      installedAt: 1600000000,
      isEnabled: false, // Disabled, should NOT conflict!
    },
  ];

  // Conflict: new mod targets same Mario c00 slot
  const conflict1 = checkModConflict('fighter/mario/model/body/c00/', 103, installed);
  assert.equal(conflict1.hasConflict, true);
  assert.equal(conflict1.conflictingMod?.id, 101);

  // No conflict: different slot c01 for Mario
  const conflict2 = checkModConflict('fighter/mario/model/body/c01/', 104, installed);
  assert.equal(conflict2.hasConflict, false);

  // No conflict: Sonic c01 is disabled
  const conflict3 = checkModConflict('fighter/sonic/model/body/c01/', 105, installed);
  assert.equal(conflict3.hasConflict, false);
});

test('getToggledDirectoryPath manages .disabled suffix cleanly', () => {
  const activePath = 'sdmc:/luma/titles/00040000000EDF00/romfs/fighter/sonic/model/body/c01';
  const disabledPath = `${activePath}.disabled`;

  // Disabling active mod
  assert.equal(getToggledDirectoryPath(activePath, false), disabledPath);

  // Enabling disabled mod
  assert.equal(getToggledDirectoryPath(disabledPath, true), activePath);

  // Idempotency
  assert.equal(getToggledDirectoryPath(disabledPath, false), disabledPath);
  assert.equal(getToggledDirectoryPath(activePath, true), activePath);
});

test('isModUpdateAvailable checks timestamp against installed date', () => {
  const mod: InstalledModRecord = {
    id: 201,
    name: 'Fox Melee Voice',
    author: 'FoxFan',
    region: 'USA',
    category: 'Audio',
    slotPath: 'sound/fighter/fox/',
    fileCount: 2,
    totalBytes: 1024000,
    installedAt: 1650000000,
    isEnabled: true,
  };

  assert.equal(isModUpdateAvailable(mod, 1660000000), true);
  assert.equal(isModUpdateAvailable(mod, 1640000000), false);
  assert.equal(isModUpdateAvailable(mod, 1650000000), false);
});

test('serializeManifest and parseManifest roundtrip properly', () => {
  const original: InstalledModRecord[] = [
    {
      id: 301,
      name: 'Battlefield Brawl Remake',
      author: 'StageDev',
      region: 'EUR',
      category: 'Stages',
      slotPath: 'stage/battlefield/',
      fileCount: 8,
      totalBytes: 5400000,
      installedAt: 1670000000,
      isEnabled: true,
    },
  ];

  const jsonStr = serializeManifest(original);
  const parsed = parseManifest(jsonStr);

  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, 301);
  assert.equal(parsed[0].name, 'Battlefield Brawl Remake');
  assert.equal(parsed[0].region, 'EUR');
  assert.equal(parsed[0].isEnabled, true);
});
