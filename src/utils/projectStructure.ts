/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProjectFile {
  path: string;
  filename: string;
  language: 'c' | 'makefile' | 'rsf' | 'markdown' | 'text';
  category: 'source' | 'include' | 'build' | 'config' | 'doc';
  description: string;
  content: string;
}

export function validateMakefileRules(makefileContent: string): {
  has3dsxTarget: boolean;
  hasCiaTarget: boolean;
  hasCitro2D: boolean;
  hasCitro3D: boolean;
  hasLibctru: boolean;
  hasMakerom: boolean;
  hasBannertool: boolean;
} {
  return {
    has3dsxTarget: makefileContent.includes('.3dsx') || makefileContent.includes('$(OUTPUT).3dsx'),
    hasCiaTarget: makefileContent.includes('.cia') || makefileContent.includes('$(OUTPUT).cia'),
    hasCitro2D: makefileContent.includes('-lcitro2d'),
    hasCitro3D: makefileContent.includes('-lcitro3d'),
    hasLibctru: makefileContent.includes('-lctru'),
    hasMakerom: makefileContent.includes('makerom'),
    hasBannertool: makefileContent.includes('bannertool'),
  };
}

export function validateMainLoop(mainContent: string): {
  hasGfxInit: boolean;
  hasC2DInit: boolean;
  hasNew3DSSpeedup: boolean;
  hasAptMainLoop: boolean;
  hasDualScreenTargets: boolean;
  hasCleanExit: boolean;
} {
  return {
    hasGfxInit: mainContent.includes('gfxInitDefault()'),
    hasC2DInit: mainContent.includes('C2D_Init('),
    hasNew3DSSpeedup: mainContent.includes('osSetSpeedupEnable') || mainContent.includes('APT_CheckNew3DS'),
    hasAptMainLoop: mainContent.includes('aptMainLoop()'),
    hasDualScreenTargets: mainContent.includes('GFX_TOP') && mainContent.includes('GFX_BOTTOM'),
    hasCleanExit: mainContent.includes('C2D_Fini()') && mainContent.includes('gfxExit()'),
  };
}

export function validateApiModule(apiHeader: string, apiSource: string): {
  hasGameId6364: boolean;
  hasHttpcInit: boolean;
  hasHttpcOpenContext: boolean;
  hasHttpcBeginRequest: boolean;
  hasFetchModList: boolean;
  hasFetchModDetails: boolean;
  hasFetchCategories: boolean;
  hasSafeStructures: boolean;
} {
  return {
    hasGameId6364: apiHeader.includes('6364') || apiSource.includes('6364'),
    hasHttpcInit: apiSource.includes('httpcInit'),
    hasHttpcOpenContext: apiSource.includes('httpcOpenContext'),
    hasHttpcBeginRequest: apiSource.includes('httpcBeginRequest'),
    hasFetchModList: apiHeader.includes('API_FetchModList') && apiSource.includes('API_FetchModList'),
    hasFetchModDetails: apiHeader.includes('API_FetchModDetails') && apiSource.includes('API_FetchModDetails'),
    hasFetchCategories: apiHeader.includes('API_FetchCategories') && apiSource.includes('API_FetchCategories'),
    hasSafeStructures: apiHeader.includes('GBModSummary') && apiHeader.includes('GBModListPage') && apiHeader.includes('GBModDetails'),
  };
}

export function validateDownloaderAndInstaller(
  downloaderH: string,
  downloaderC: string,
  installerH: string,
  installerC: string
): {
  hasThreadCreate: boolean;
  hasThreadJoin: boolean;
  hasMinizipUnzip: boolean;
  hasLumaPathMapping: boolean;
  hasStreamingWrite: boolean;
  hasErrorHandling: boolean;
} {
  return {
    hasThreadCreate: downloaderC.includes('threadCreate') || downloaderC.includes('LightThread'),
    hasThreadJoin: downloaderC.includes('threadJoin') || downloaderC.includes('threadFree'),
    hasMinizipUnzip: installerC.includes('unzOpen') && installerC.includes('unzReadCurrentFile'),
    hasLumaPathMapping:
      installerC.includes('PATH_LUMA_TITLES') ||
      installerC.includes('luma/titles') ||
      installerH.includes('Luma3DS') ||
      installerH.includes('luma/titles'),
    hasStreamingWrite: downloaderC.includes('fwrite') && downloaderC.includes('httpcDownloadData'),
    hasErrorHandling: downloaderC.includes('remove') && installerC.includes('mkdir'),
  };
}

export function validateModManagerAndFullUI(
  modManagerH: string,
  modManagerC: string,
  uiH: string,
  uiC: string
): {
  hasModToggle: boolean;
  hasModUninstall: boolean;
  hasConflictCheck: boolean;
  hasManifestJson: boolean;
  hasSwkbdKeyboard: boolean;
  hasTouchControls: boolean;
  hasDetailedView: boolean;
} {
  return {
    hasModToggle: modManagerH.includes('ModManager_ToggleMod') && modManagerC.includes('ModManager_ToggleMod'),
    hasModUninstall: modManagerH.includes('ModManager_UninstallMod') && modManagerC.includes('ModManager_UninstallMod'),
    hasConflictCheck: modManagerH.includes('ModManager_CheckConflict') && modManagerC.includes('ModManager_CheckConflict'),
    hasManifestJson: modManagerC.includes('installed_mods.json') || modManagerC.includes('installed.json'),
    hasSwkbdKeyboard: uiC.includes('swkbdInit') && uiC.includes('swkbdInputText'),
    hasTouchControls: uiC.includes('touch.px') && uiC.includes('touch.py'),
    hasDetailedView: uiH.includes('VIEW_MOD_DETAILS') || uiC.includes('UI_DrawModDetails'),
  };
}
