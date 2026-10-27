/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InstalledModRecord {
  id: number;
  name: string;
  author: string;
  region: 'USA' | 'EUR' | 'JPN';
  category: string;
  slotPath: string; // e.g. "fighter/mario/model/body/c00/"
  fileCount: number;
  totalBytes: number;
  installedAt: number;
  remoteDateAdded?: number;
  isEnabled: boolean;
}

export interface ModConflict {
  hasConflict: boolean;
  conflictingMod?: InstalledModRecord;
  conflictingSlot?: string;
  message?: string;
}

/**
 * Checks if a candidate mod conflicts with an already installed and enabled mod.
 * In Smash 3DS, two mods replacing the same slot (e.g. fighter/sonic/model/body/c01)
 * will overwrite each other.
 */
export function checkModConflict(
  candidateSlot: string,
  candidateModId: number,
  installedMods: InstalledModRecord[]
): ModConflict {
  if (!candidateSlot || candidateSlot.trim().length === 0) {
    return { hasConflict: false };
  }

  const normalizedCand = candidateSlot.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();

  for (const mod of installedMods) {
    if (mod.id === candidateModId) continue;
    if (!mod.isEnabled) continue; // Disabled mods don't conflict

    const installedNorm = mod.slotPath.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase();

    // Check if slots overlap or are identical
    if (normalizedCand === installedNorm || normalizedCand.startsWith(installedNorm) || installedNorm.startsWith(normalizedCand)) {
      return {
        hasConflict: true,
        conflictingMod: mod,
        conflictingSlot: mod.slotPath,
        message: `Conflicts with "${mod.name}" in slot: ${mod.slotPath}`,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Generates the toggled path for a mod on the 3DS SD card.
 * Disabled mods are renamed with a ".disabled" suffix so LayeredFS skips them.
 */
export function getToggledDirectoryPath(basePath: string, enable: boolean): string {
  const clean = basePath.replace(/\/+$/, '');
  if (enable) {
    // Remove .disabled if present
    return clean.replace(/\.disabled$/i, '');
  } else {
    // Append .disabled if not already present
    return clean.endsWith('.disabled') ? clean : `${clean}.disabled`;
  }
}

/**
 * Checks if an update is available for an installed mod given remote metadata timestamp.
 */
export function isModUpdateAvailable(
  installed: InstalledModRecord,
  remoteDateAdded: number
): boolean {
  if (!remoteDateAdded || remoteDateAdded <= 0) return false;
  return remoteDateAdded > installed.installedAt;
}

/**
 * Serializes and parses the installed mods manifest safely.
 */
export function serializeManifest(mods: InstalledModRecord[]): string {
  return JSON.stringify({ version: 1, mods }, null, 2);
}

export function parseManifest(jsonStr: string): InstalledModRecord[] {
  try {
    const data = JSON.parse(jsonStr);
    return Array.isArray(data.mods) ? data.mods : [];
  } catch {
    return [];
  }
}
