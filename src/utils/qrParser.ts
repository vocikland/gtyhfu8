/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ParsedQrResult {
  isValid: boolean;
  type: 'mod' | 'download' | 'direct_zip' | 'unknown';
  id?: number;
  url?: string;
  errorMessage?: string;
}

/**
 * Parses QR code payload decoded by 3DS camera quirc library.
 * Supported patterns:
 * - https://gamebanana.com/mods/384912
 * - https://gamebanana.com/dl/12345
 * - https://files.gamebanana.com/mods/archive.zip
 * - 384912 (raw mod id)
 */
export function parseGameBananaQr(rawText: string): ParsedQrResult {
  if (!rawText || typeof rawText !== 'string') {
    return { isValid: false, type: 'unknown', errorMessage: 'Empty QR code data' };
  }

  const trimmed = rawText.trim();

  // Pattern 1: Raw numeric ID
  if (/^\d{3,8}$/.test(trimmed)) {
    return {
      isValid: true,
      type: 'mod',
      id: parseInt(trimmed, 10),
      url: `https://gamebanana.com/mods/${trimmed}`,
    };
  }

  // Pattern 2: Mod URL e.g. https://gamebanana.com/mods/384912 or http://gamebanana.com/mods/384912
  const modMatch = trimmed.match(/gamebanana\.com\/mods\/(\d+)/i);
  if (modMatch) {
    return {
      isValid: true,
      type: 'mod',
      id: parseInt(modMatch[1], 10),
      url: trimmed,
    };
  }

  // Pattern 3: Download direct link e.g. https://gamebanana.com/dl/54321
  const dlMatch = trimmed.match(/gamebanana\.com\/dl\/(\d+)/i);
  if (dlMatch) {
    return {
      isValid: true,
      type: 'download',
      id: parseInt(dlMatch[1], 10),
      url: trimmed,
    };
  }

  // Pattern 4: Direct ZIP archive URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    if (trimmed.toLowerCase().endsWith('.zip')) {
      return {
        isValid: true,
        type: 'direct_zip',
        url: trimmed,
      };
    }
  }

  return {
    isValid: false,
    type: 'unknown',
    errorMessage: 'QR code does not contain a valid GameBanana mod link',
  };
}
