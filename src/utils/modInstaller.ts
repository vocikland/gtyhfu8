/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SMASH_3DS_TITLE_IDS } from './promptGenerator.ts';

export interface InstallProgress {
  state: 'idle' | 'downloading' | 'extracting' | 'completed' | 'error';
  downloadedBytes: number;
  totalBytes: number;
  extractedFiles: number;
  totalFiles: number;
  speedBytesPerSec: number;
  currentFilename: string;
  errorMessage?: string;
}

/**
 * Normalizes an internal archive zip path to match Luma3DS LayeredFS expectations.
 * Mods on GameBanana often package files as:
 * - "romfs/fighter/sonic/model/body/c01/model.nud"
 * - "Shadow_Skin_v1.0/romfs/fighter/sonic/..."
 * - "fighter/sonic/model/body/c01/model.nud"
 */
export function normalizeZipEntryPath(rawPath: string): string {
  // Normalize Windows slashes
  let clean = rawPath.replace(/\\/g, '/').replace(/^\/+/, '');

  // If path contains "romfs/", strip everything up to and including "romfs/"
  const romfsIdx = clean.toLowerCase().indexOf('romfs/');
  if (romfsIdx !== -1) {
    clean = clean.substring(romfsIdx + 6); // skip "romfs/"
  }

  // Strip leading dot-slashes or empty segments
  clean = clean.replace(/^\.\//, '').replace(/^\/+/, '');
  return clean;
}

/**
 * Resolves destination path on SD card for a given zip entry.
 */
export function resolveTargetSdPath(
  region: 'USA' | 'EUR' | 'JPN',
  zipEntryPath: string,
  customBasePath?: string
): string {
  const normalized = normalizeZipEntryPath(zipEntryPath);
  if (customBasePath) {
    return `${customBasePath.replace(/\/+$/, '')}/${normalized}`;
  }
  const titleId = SMASH_3DS_TITLE_IDS[region];
  return `sdmc:/luma/titles/${titleId}/romfs/${normalized}`;
}

/**
 * Validates whether an archive path is a safe, extractable file (preventing directory traversal)
 */
export function isSafeZipEntry(entryPath: string): boolean {
  if (!entryPath || entryPath.trim().length === 0) return false;
  if (entryPath.includes('..')) return false;
  if (entryPath.startsWith('/') || entryPath.startsWith('\\')) return false;
  return true;
}

/**
 * Calculates download percentage and ETA string
 */
export function calculateProgressStats(downloaded: number, total: number, speedBps: number): {
  percent: number;
  etaSeconds: number;
  speedFormatted: string;
} {
  const percent = total > 0 ? Math.min(100, Math.floor((downloaded / total) * 100)) : 0;
  const remainingBytes = Math.max(0, total - downloaded);
  const etaSeconds = speedBps > 0 ? Math.ceil(remainingBytes / speedBps) : 0;

  let speedFormatted = '0 KB/s';
  if (speedBps >= 1024 * 1024) {
    speedFormatted = `${(speedBps / (1024 * 1024)).toFixed(1)} MB/s`;
  } else if (speedBps >= 1024) {
    speedFormatted = `${Math.round(speedBps / 1024)} KB/s`;
  }

  return { percent, etaSeconds, speedFormatted };
}
