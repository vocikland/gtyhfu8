/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateMakefileRules,
  validateMainLoop,
  validateApiModule,
  validateDownloaderAndInstaller,
  validateModManagerAndFullUI,
} from './projectStructure.ts';
import { STEP1_FILES } from '../data/projectFiles.ts';

test('Makefile validator detects 3dsx, cia, and required libraries in STEP1_FILES', () => {
  const makefile = STEP1_FILES.find((f) => f.filename === 'Makefile');
  assert.ok(makefile, 'Makefile must exist in STEP1_FILES');

  const result = validateMakefileRules(makefile.content);
  assert.equal(result.has3dsxTarget, true);
  assert.equal(result.hasCiaTarget, true);
  assert.equal(result.hasCitro2D, true);
  assert.equal(result.hasCitro3D, true);
  assert.equal(result.hasLibctru, true);
  assert.equal(result.hasMakerom, true);
  assert.equal(result.hasBannertool, true);
});

test('Main loop validator verifies 3DS lifecycle and New 3DS speedup in STEP1_FILES', () => {
  const mainC = STEP1_FILES.find((f) => f.filename === 'main.c');
  assert.ok(mainC, 'main.c must exist in STEP1_FILES');

  const result = validateMainLoop(mainC.content);
  assert.equal(result.hasGfxInit, true);
  assert.equal(result.hasC2DInit, true);
  assert.equal(result.hasNew3DSSpeedup, true);
  assert.equal(result.hasAptMainLoop, true);
  assert.equal(result.hasCleanExit, true);
});

test('All required Step 1 files exist in project files', () => {
  const filenames = STEP1_FILES.map((f) => f.filename);
  assert.ok(filenames.includes('Makefile'));
  assert.ok(filenames.includes('template.rsf'));
  assert.ok(filenames.includes('common.h'));
  assert.ok(filenames.includes('ui.h'));
  assert.ok(filenames.includes('ui.c'));
  assert.ok(filenames.includes('main.c'));
  assert.ok(filenames.includes('README.md'));
  assert.ok(filenames.includes('api.h'));
  assert.ok(filenames.includes('api.c'));
});

test('API module validator checks GameBanana 6364 and httpc functions', () => {
  const apiH = STEP1_FILES.find((f) => f.filename === 'api.h');
  const apiC = STEP1_FILES.find((f) => f.filename === 'api.c');
  assert.ok(apiH, 'api.h must exist');
  assert.ok(apiC, 'api.c must exist');

  const result = validateApiModule(apiH.content, apiC.content);
  assert.equal(result.hasGameId6364, true);
  assert.equal(result.hasHttpcInit, true);
  assert.equal(result.hasHttpcOpenContext, true);
  assert.equal(result.hasHttpcBeginRequest, true);
  assert.equal(result.hasFetchModList, true);
  assert.equal(result.hasFetchModDetails, true);
  assert.equal(result.hasFetchCategories, true);
  assert.equal(result.hasSafeStructures, true);
});

test('Downloader and Installer validator verifies threading, minizip and Luma path mapping', () => {
  const dlH = STEP1_FILES.find((f) => f.filename === 'downloader.h');
  const dlC = STEP1_FILES.find((f) => f.filename === 'downloader.c');
  const inH = STEP1_FILES.find((f) => f.filename === 'installer.h');
  const inC = STEP1_FILES.find((f) => f.filename === 'installer.c');

  assert.ok(dlH, 'downloader.h must exist');
  assert.ok(dlC, 'downloader.c must exist');
  assert.ok(inH, 'installer.h must exist');
  assert.ok(inC, 'installer.c must exist');

  const result = validateDownloaderAndInstaller(dlH.content, dlC.content, inH.content, inC.content);
  assert.equal(result.hasThreadCreate, true);
  assert.equal(result.hasThreadJoin, true);
  assert.equal(result.hasMinizipUnzip, true);
  assert.equal(result.hasLumaPathMapping, true);
  assert.equal(result.hasStreamingWrite, true);
  assert.equal(result.hasErrorHandling, true);
});

test('Mod Manager and Full UI validator verifies swkbd, touch controls, and conflict checking', () => {
  const mmH = STEP1_FILES.find((f) => f.filename === 'mod_manager.h');
  const mmC = STEP1_FILES.find((f) => f.filename === 'mod_manager.c');
  const uiH = STEP1_FILES.find((f) => f.filename === 'ui.h');
  const uiC = STEP1_FILES.find((f) => f.filename === 'ui.c');

  assert.ok(mmH, 'mod_manager.h must exist');
  assert.ok(mmC, 'mod_manager.c must exist');
  assert.ok(uiH, 'ui.h must exist');
  assert.ok(uiC, 'ui.c must exist');

  const result = validateModManagerAndFullUI(mmH.content, mmC.content, uiH.content, uiC.content);
  assert.equal(result.hasModToggle, true);
  assert.equal(result.hasModUninstall, true);
  assert.equal(result.hasConflictCheck, true);
  assert.equal(result.hasManifestJson, true);
  assert.equal(result.hasSwkbdKeyboard, true);
  assert.equal(result.hasTouchControls, true);
  assert.equal(result.hasDetailedView, true);
});
