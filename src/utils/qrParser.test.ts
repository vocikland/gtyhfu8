/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseGameBananaQr } from './qrParser.ts';

describe('GameBanana QR Code Parser for 3DS', () => {
  it('parses standard GameBanana mod URL', () => {
    const res = parseGameBananaQr('https://gamebanana.com/mods/384912');
    assert.equal(res.isValid, true);
    assert.equal(res.type, 'mod');
    assert.equal(res.id, 384912);
  });

  it('parses GameBanana download shortlink', () => {
    const res = parseGameBananaQr('https://gamebanana.com/dl/98765');
    assert.equal(res.isValid, true);
    assert.equal(res.type, 'download');
    assert.equal(res.id, 98765);
  });

  it('parses raw numeric mod ID', () => {
    const res = parseGameBananaQr('636401');
    assert.equal(res.isValid, true);
    assert.equal(res.type, 'mod');
    assert.equal(res.id, 636401);
  });

  it('parses direct ZIP download URL', () => {
    const res = parseGameBananaQr('https://files.gamebanana.com/mods/mario_odyssey_skin.zip');
    assert.equal(res.isValid, true);
    assert.equal(res.type, 'direct_zip');
  });

  it('rejects invalid or non-GameBanana URLs', () => {
    const res = parseGameBananaQr('https://example.com/something_else');
    assert.equal(res.isValid, false);
    assert.equal(res.type, 'unknown');
    assert.ok(res.errorMessage);
  });
});
