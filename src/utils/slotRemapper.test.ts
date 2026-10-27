/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  detectFighterSlot,
  remapSlotInPath,
  findFirstAvailableSlot,
  SMASH_3DS_ROSTER,
} from './slotRemapper.ts';

describe('Smash 3DS Slot Remapper', () => {
  it('detects fighter and slot from standard romfs path', () => {
    const res = detectFighterSlot('fighter/mario/model/body/c00/model.mbn');
    assert.equal(res.fighter, 'mario');
    assert.equal(res.slotNumber, 0);
    assert.equal(res.slotString, 'c00');
  });

  it('detects Sonic c01 slot', () => {
    const res = detectFighterSlot('fighter/sonic/model/body/c01/texture.nut');
    assert.equal(res.fighter, 'sonic');
    assert.equal(res.slotNumber, 1);
    assert.equal(res.slotString, 'c01');
  });

  it('remaps slot c00 to c04 in path', () => {
    const original = 'fighter/mario/model/body/c00/model.mbn';
    const remapped = remapSlotInPath(original, 4);
    assert.equal(remapped, 'fighter/mario/model/body/c04/model.mbn');
  });

  it('remaps slot c01 to c07 in path with CSP portraits', () => {
    const original = 'fighter/cloud/model/body/c01/chr_11_Cloud_01.nut';
    const remapped = remapSlotInPath(original, 7);
    assert.equal(remapped, 'fighter/cloud/model/body/c07/chr_11_Cloud_01.nut');
  });

  it('finds first unoccupied slot correctly', () => {
    const occupied = [0, 1, 2];
    const nextSlot = findFirstAvailableSlot('mario', occupied, 8);
    assert.equal(nextSlot, 3);
  });

  it('returns -1 when all 8 slots are full', () => {
    const occupied = [0, 1, 2, 3, 4, 5, 6, 7];
    const nextSlot = findFirstAvailableSlot('mario', occupied, 8);
    assert.equal(nextSlot, -1);
  });

  it('contains valid Smash 3DS roster entries', () => {
    assert.ok(SMASH_3DS_ROSTER.mario);
    assert.ok(SMASH_3DS_ROSTER.sonic);
    assert.ok(SMASH_3DS_ROSTER.cloud);
    assert.equal(SMASH_3DS_ROSTER.mario.defaultSlotNames.length, 8);
  });
});
