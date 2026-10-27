/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PromptConfig {
  gameId: number;
  gameName: string;
  regions: ('USA' | 'EUR' | 'JPN')[];
  modLoader: 'luma_layeredfs' | 'saltysd' | 'both';
  targetHardware: 'new_3ds_preferred' | 'new_3ds_exclusive' | 'all_3ds';
  features: {
    qrScanner: boolean;
    modToggleManager: boolean;
    downloadProgressBar: boolean;
    audioPreview: boolean;
    autoConflictDetection: boolean;
    new3dsClockBoost: boolean;
    embeddedCerts: boolean;
  };
  toolchain: 'libctru_citro2d' | 'libctru_citro3d' | 'cplusplus20';
  language: 'ru' | 'en';
}

export const SMASH_3DS_TITLE_IDS = {
  USA: '00040000000EDF00',
  EUR: '00040000000EE000',
  JPN: '00040000000B8B00',
} as const;

export const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  gameId: 6364,
  gameName: 'Super Smash Bros. for Nintendo 3DS',
  regions: ['USA', 'EUR'],
  modLoader: 'luma_layeredfs',
  targetHardware: 'new_3ds_preferred',
  features: {
    qrScanner: true,
    modToggleManager: true,
    downloadProgressBar: true,
    audioPreview: false,
    autoConflictDetection: true,
    new3dsClockBoost: true,
    embeddedCerts: true,
  },
  toolchain: 'libctru_citro2d',
  language: 'ru',
};

/**
 * Resolves destination SD card path based on loader and region title ID.
 */
export function getModDestinationPath(
  loader: 'luma_layeredfs' | 'saltysd' | 'both',
  region: 'USA' | 'EUR' | 'JPN'
): string {
  const titleId = SMASH_3DS_TITLE_IDS[region];
  if (loader === 'saltysd') {
    return 'sdmc:/saltysd/smash/';
  }
  return `sdmc:/luma/titles/${titleId}/romfs/`;
}

/**
 * Validates GameBanana API URL for game 6364.
 */
export function buildGameBananaApiUrls(gameId: number = 6364) {
  return {
    subfeed: `https://gamebanana.com/apiv11/Game/${gameId}/Subfeed?_nPage=1&_nPerpage=20&_sSort=new`,
    categories: `https://gamebanana.com/apiv11/Game/${gameId}/Categories`,
    modProfile: (modId: number) => `https://gamebanana.com/apiv11/Mod/${modId}/ProfilePage`,
    coreItemData: (modId: number) =>
      `https://api.gamebanana.com/Core/Item/Data?itemtype=Mod&itemid=${modId}&fields=name,description,Files().aFiles()`,
  };
}

/**
 * Generates the full master prompt for Google AI Studio
 */
export function generateAIStudioPrompt(config: PromptConfig): string {
  const selectedTitleIds = config.regions
    .map((r) => `- **${r} Title ID**: \`${SMASH_3DS_TITLE_IDS[r]}\` -> \`sdmc:/luma/titles/${SMASH_3DS_TITLE_IDS[r]}/romfs/\``)
    .join('\n');

  const featureList = [
    config.features.new3dsClockBoost
      ? '- **New 3DS Hardware Boost**: Detect New 3DS model via `APT_CheckNew3DS(&isNew3DS)` and enable 804MHz CPU clock speed + L2 cache with `osSetSpeedupEnable(true)` for lag-free HTTPS TLS handshakes and zip decompression.'
      : '',
    config.features.downloadProgressBar
      ? '- **Streaming File Download with Chunking**: Stream mod downloads directly from GameBanana CDN to SD card in 32KB buffer chunks via libcurl (`CURLOPT_WRITEFUNCTION`) to avoid running out of 3DS RAM (~128MB-256MB).'
      : '',
    config.features.embeddedCerts
      ? '- **HTTPS / TLS mbedtls Certificate Bundle**: Include `romfs:/cacert.pem` (Mozilla root CA cert bundle) and set `CURLOPT_CAINFO` so HTTPS requests to `gamebanana.com` succeed without SSL verification errors.'
      : '',
    config.features.modToggleManager
      ? '- **Installed Mod Manager & Toggling**: Ability to inspect installed mods, view disk space on SD card (`sdmc:/`), enable/disable mods by renaming `.disabled`, or uninstall safely.'
      : '',
    config.features.autoConflictDetection
      ? '- **File Conflict & Fighter Slot Detection**: Scan zip archive paths (e.g. `fighter/mario/model/body/c00`) before extracting. Warn if a mod will overwrite an existing skin slot and offer automatic relocation or backup.'
      : '',
    config.features.qrScanner
      ? '- **Camera QR Code Scanner**: Utilize 3DS camera (`cam:u`) and `quirc` library to scan GameBanana mod QR codes directly from a PC monitor or phone screen to jump straight to the mod page.'
      : '',
    config.features.audioPreview
      ? '- **BGM / Audio Previewer**: Support playing audio preview for Smash 3DS music mods using `ndsp` or `csnd` sound streaming before downloading.'
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `You are a Principal Embedded Systems and Nintendo 3DS Homebrew Engineer specializing in devkitARM, libctru, Citro2D/Citro3D, and network programming.

Create a complete, production-ready Nintendo 3DS Homebrew Client application specifically engineered for GameBanana Game ID 6364 (Super Smash Bros. for Nintendo 3DS). The app allows users to browse, search, download, extract, and manage mods directly on their 3DS without requiring a PC.

### 1. TARGET ENVIRONMENT & ARCHITECTURE
- **Target Platform**: Nintendo 3DS / New Nintendo 3DS (with New 3DS optimizations enabled).
- **Output Formats**: \`.3dsx\` (Homebrew Launcher) and \`.cia\` (FBI Installable package).
- **Core Toolchain**: devkitARM (devkitPro r45+), \`libctru\`, \`citro2d\`, \`citro3d\`.
- **Networking & SSL**: \`libcurl\` compiled with \`mbedtls\`. Must use bundled \`romfs:/cacert.pem\` for secure TLS 1.3/1.2 connections to GameBanana API and CDN.
- **Archive Extraction**: \`miniz\` (embedded single-file zip decompressor) with streaming inflate to avoid buffer exhaustion.
- **JSON Parser**: Lightweight C JSON parser (e.g., \`cJSON\` or \`jsmn\`) suitable for 3DS memory constraints.

### 2. GAME SPECIFICATION (GameBanana ID: 6364)
- **Target Game**: Super Smash Bros. for Nintendo 3DS (GameBanana Game ID: 6364).
- **GameBanana API Endpoints**:
  - Subfeed Index: \`https://gamebanana.com/apiv11/Game/6364/Subfeed?_nPage={page}&_nPerpage=20&_sSort=new\`
  - Categories: \`https://gamebanana.com/apiv11/Game/6364/Categories\`
  - Mod Profile & Files: \`https://gamebanana.com/apiv11/Mod/{id}/ProfilePage\`
  - Fallback / Direct API: \`https://api.gamebanana.com/Core/Item/Data?itemtype=Mod&itemid={id}&fields=name,description,Files().aFiles(),likes,views,RootCategory().name\`

### 3. SD CARD MOD PATH MAPPING & REGIONAL TITLE IDS
The application must support automatic game region detection and manual selection:
${selectedTitleIds}
${config.modLoader === 'saltysd' || config.modLoader === 'both' ? '- **SaltySD Fallback**: `sdmc:/saltysd/smash/`\n' : ''}
- **Mod Directory Structure Handling**:
  - Automatically detect whether the zip contains a root \`romfs/\` directory, \`data/\`, or flat files like \`fighter/mario/model/body/c01/\`.
  - Extract files cleanly into the corresponding destination path: \`sdmc:/luma/titles/<TITLE_ID>/romfs/...\`.
  - Maintain a database / manifest (\`sdmc:/3ds/SmashBanana/installed_mods.json\`) tracking installed mod IDs, author, files list, and toggle state.

### 4. KEY CAPABILITIES & FEATURES
${featureList}

### 5. DUAL SCREEN UI/UX SPECIFICATION
- **Top Screen (400x240 px)**:
  - Header: Current category, Wi-Fi signal icon, battery level indicator, SD card free storage space.
  - Mod Showcase: High-res thumbnail preview (scaled to fit), Mod title, Author, Category badge (Fighter Skins, Stages, Music, UI, Param), Like count, Download count, and Date.
  - Status Overlay: Dynamic download progress bar (Current KB / Total KB, Speed in KB/s, ETA, and Extraction percentage).
- **Bottom Screen (320x240 px - Touchscreen & Physical Controls)**:
  - Touch Navigation Tabs: [Explore / New], [Top Rated], [Categories], [Search], [QR Scan], [Installed Mods], [Settings].
  - Mod List: Smooth scrollable list with touch scrolling, Circle Pad / D-Pad navigation, and A/B/X/Y shortcuts.
  - Actions:
    - \`A\` / [Download & Install]: Initiates download, unzips, and registers in manifest.
    - \`Y\` / [Mod Details]: Full description, screenshots list, and file selection modal.
    - \`X\` / [Toggle State]: Enable / disable mod without deleting files.
    - \`SELECT\` / [Change Region]: Cycle between USA, EUR, JPN title IDs.
    - \`START\` / [Exit]: Cleanly closes services and returns to Home Menu.

### 6. MEMORY MANAGEMENT & ROBUSTNESS CONSTRAINTS
- Old 3DS has only ~128MB RAM and New 3DS ~256MB. NEVER load entire .zip files or large 50MB+ mods into heap memory.
- Implement streaming HTTP chunking directly to a temporary file \`sdmc:/3ds/SmashBanana/temp.zip\`, followed by streaming extraction using miniz, then delete the temp file.
- Handle network drops, partial downloads with resume support (\`CURLOPT_RESUME_FROM_LARGE\`), and corrupt zip recovery.
- Cleanly initialize and exit all 3DS OS services (\`cfguInit()\`, \`ptmSysmInit()\`, \`socInit()\`, \`acInit()\`, \`romfsInit()\`, \`ndspInit()\`).

### 7. PROJECT STRUCTURE & CODE IMPLEMENTATION
Provide the complete codebase with:
1. \`Makefile\` configured for devkitARM with rules for \`citro2d\`, \`citro3d\`, \`curl\`, \`mbedtls\`, and generating both \`.3dsx\` and \`.cia\`.
2. \`source/main.c\`: Main event loop, input handling, New 3DS speedup initialization, and cleanup.
3. \`source/network.c\` & \`network.h\`: libcurl HTTP client, SSL cert config, and GameBanana API JSON fetcher.
4. \`source/installer.c\` & \`installer.h\`: Zip streaming decompressor, title ID directory creator, and file installer.
5. \`source/ui.c\` & \`ui.h\`: Citro2D dual screen renderer, text rendering via system font, and touch gestures.
6. \`source/mod_manager.c\` & \`mod_manager.h\`: Installed mods manifest, toggle enable/disable, and conflict resolution.
7. Step-by-step instructions on compiling via devkitPro and testing in the Citra/Azahar 3DS emulator or physical New 3DS console.`;
}
