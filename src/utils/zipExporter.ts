/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { ProjectFile } from './projectStructure.ts';

/**
 * Packages all C source code, headers, Makefile, RSF, and README files
 * into a standard ZIP archive ready to build with devkitARM.
 */
export async function exportProjectToZip(
  files: ProjectFile[],
  zipFilename: string = 'SmashBanana_3DS_devkitARM.zip',
  onProgress?: (percent: number, status: string) => void
): Promise<Blob> {
  const zip = new JSZip();

  // Root folder inside the archive
  const root = zip.folder('SmashBanana');
  if (!root) throw new Error('Failed to create archive root');

  const total = files.length;
  files.forEach((file, idx) => {
    root.file(file.path, file.content);
    if (onProgress) {
      const pct = Math.round(((idx + 1) / total) * 50);
      onProgress(pct, `Packing ${file.path}...`);
    }
  });

  // Add dummy placeholder icons in resources if not existing
  root.file('resources/README.txt', 'Place your icon.png (48x48), banner.png (256x128), and banner.wav here for CIA building.\n');
  root.file('romfs/README.txt', 'Place any embedded assets like custom fonts or cacert.pem here.\n');

  if (onProgress) onProgress(60, 'Compressing project archive...');

  const blob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    },
    (metadata) => {
      if (onProgress) {
        const pct = 60 + Math.round(metadata.percent * 0.4);
        onProgress(pct, `Generating ZIP: ${metadata.percent.toFixed(0)}%`);
      }
    }
  );

  return blob;
}

/**
 * Initiates direct browser file download for a generated Blob.
 */
export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
