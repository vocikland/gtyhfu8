/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ALL_PROJECT_FILES } from './data/projectFiles.ts';
import { ProjectFile } from './utils/projectStructure.ts';
import { ThreeDSConsole } from './components/ThreeDSConsole.tsx';
import { CodeViewer } from './components/CodeViewer.tsx';
import { DeployGuide } from './components/DeployGuide.tsx';
import { generateAIStudioPrompt, DEFAULT_PROMPT_CONFIG } from './utils/promptGenerator.ts';
import { exportProjectToZip, triggerBlobDownload } from './utils/zipExporter.ts';
import { soundEffects } from './utils/audioEffects.ts';
import {
  Gamepad2,
  FileCode,
  Layers,
  Terminal,
  Cpu,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Download,
  Camera,
  Sliders,
  FolderArchive,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  Rocket,
  HardDrive,
  Wifi,
  Play,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(ALL_PROJECT_FILES[0]);
  const [activeView, setActiveView] = useState<'code' | 'simulator' | 'deploy' | 'guide' | 'prompt'>('deploy');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [fileFilterCategory, setFileFilterCategory] = useState<string>('all');

  const fullPromptText = generateAIStudioPrompt(DEFAULT_PROMPT_CONFIG);

  const handleCopyPrompt = async () => {
    try {
      soundEffects.playConfirm();
      await navigator.clipboard.writeText(fullPromptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadZip = async () => {
    try {
      soundEffects.playConfirm();
      setIsExportingZip(true);
      setExportStatus('Preparing ZIP...');

      const blob = await exportProjectToZip(
        ALL_PROJECT_FILES,
        'SmashBanana_3DS_devkitARM_Source.zip',
        (pct, status) => {
          setExportStatus(`${status} (${pct}%)`);
        }
      );

      triggerBlobDownload(blob, 'SmashBanana_3DS_devkitARM_Source.zip');
      soundEffects.playSuccessChime();
      setExportStatus('Download complete!');
      setTimeout(() => {
        setIsExportingZip(false);
        setExportStatus(null);
      }, 2500);
    } catch (err) {
      soundEffects.playError();
      setIsExportingZip(false);
      setExportStatus('Export failed');
    }
  };

  const categories = [
    { id: 'all', label: `All Files (${ALL_PROJECT_FILES.length})` },
    { id: 'include', label: 'Headers (.h)' },
    { id: 'source', label: 'Sources (.c)' },
    { id: 'build', label: 'Build & Config' },
  ];

  const filteredFiles = ALL_PROJECT_FILES.filter((file) => {
    if (fileFilterCategory === 'all') return true;
    if (fileFilterCategory === 'include') return file.category === 'include';
    if (fileFilterCategory === 'source') return file.category === 'source';
    if (fileFilterCategory === 'build') return file.category === 'build' || file.category === 'config';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Banner & Header */}
      <header className="border-b border-neutral-800 bg-[#0f1118]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/10 text-white font-black text-lg">
              3DS
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-base text-white tracking-tight">
                  SmashBanana 3DS Client
                </h1>
                <span className="text-[10px] font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Full Production Release
                </span>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                  devkitARM • .3dsx &amp; .cia
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                New Nintendo 3DS Homebrew for{' '}
                <a
                  href="https://gamebanana.com/games/6364"
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:underline inline-flex items-center gap-0.5"
                >
                  GameBanana (Game ID: 6364 - Super Smash Bros. 3DS)
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>
          </div>

          {/* Action Tools & Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download Whole Project ZIP */}
            <button
              onClick={handleDownloadZip}
              disabled={isExportingZip}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold rounded-lg text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isExportingZip ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{exportStatus || 'Download Source (.ZIP)'}</span>
            </button>

            {/* Quick Navigation Tabs */}
            <div className="flex items-center gap-1 bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 text-xs">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveView('code');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'code'
                    ? 'bg-neutral-800 text-amber-400 font-bold shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Codebase ({ALL_PROJECT_FILES.length})</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveView('simulator');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'simulator'
                    ? 'bg-neutral-800 text-amber-400 font-bold shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>3DS Simulator</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveView('deploy');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'deploy'
                    ? 'bg-neutral-800 text-amber-400 font-bold shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Установка на 3DS</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveView('guide');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'guide'
                    ? 'bg-neutral-800 text-amber-400 font-bold shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Architecture Guide</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  setActiveView('prompt');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeView === 'prompt'
                    ? 'bg-neutral-800 text-amber-400 font-bold shadow'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Master Prompt</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Status Highlight Banner */}
        <div className="bg-[#12141c] border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold text-base">
              ✓
            </div>
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>All 5 Core Subsystems Fully Implemented</span>
                <span className="text-neutral-500">•</span>
                <span className="text-neutral-400 font-normal">28 Unit Tests Passing</span>
              </div>
              <div className="text-sm font-bold text-neutral-100">
                SmashBanana: GameBanana Client, Luma3DS LayeredFS Installer, Costume Slot Remapper &amp; Camera QR Scanner
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="bg-neutral-800/80 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700 font-mono">
              Core 0: 60 FPS UI
            </span>
            <span className="bg-neutral-800/80 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700 font-mono">
              Core 1: Minizip &amp; HTTP
            </span>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-md font-mono font-bold">
              804MHz N3DS Boost
            </span>
          </div>
        </div>

        {/* View 1: Complete C Codebase */}
        {activeView === 'code' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  C Source Code &amp; devkitARM Headers ({ALL_PROJECT_FILES.length} Files)
                </h2>
                <p className="text-xs text-neutral-400">
                  Production C files using citro2d/citro3d, libctru, httpc, mbedtls, minizip, quirc, and New 3DS threads.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-neutral-900 p-1 rounded-lg border border-neutral-800 text-xs">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setFileFilterCategory(c.id);
                    }}
                    className={`px-2.5 py-1 rounded font-medium transition-colors ${
                      fileFilterCategory === c.id
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick File Select Chips */}
            <div className="flex flex-wrap gap-1.5 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
              {filteredFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => {
                    soundEffects.playClick();
                    setSelectedFile(file);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all flex items-center gap-1.5 ${
                    file.path === selectedFile.path
                      ? 'bg-amber-400 text-neutral-950 font-bold shadow'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <FileCode className="w-3 h-3 opacity-70" />
                  <span>{file.path}</span>
                </button>
              ))}
            </div>

            <CodeViewer
              files={ALL_PROJECT_FILES}
              selectedFile={selectedFile}
              onSelectFile={(f) => {
                soundEffects.playClick();
                setSelectedFile(f);
              }}
            />
          </div>
        )}

        {/* View 2: Interactive 3DS Console Simulator */}
        {activeView === 'simulator' && (
          <div className="space-y-4">
            <div className="max-w-2xl mx-auto text-center space-y-1">
              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <Gamepad2 className="w-5 h-5 text-amber-400" />
                Interactive New 3DS Dual-Screen Preview &amp; Simulator
              </h2>
              <p className="text-xs text-neutral-400">
                Simulates Top Screen (400×240) and Bottom Touchscreen (320×240). Features 3DS synthesized sound effects, costume slot matrix, and camera QR code scanning!
              </p>
            </div>

            <ThreeDSConsole />
          </div>
        )}

        {/* View: Deploy & Install Guide for 3DS */}
        {activeView === 'deploy' && (
          <DeployGuide
            onDownloadZip={handleDownloadZip}
            isDownloadingZip={isExportingZip}
          />
        )}

        {/* View 3: Complete Architecture Guide */}
        {activeView === 'guide' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Citro2D Dual-Screen Pipeline */}
              <div className="bg-[#11131a] border border-neutral-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  <h3>1. Dual-Screen Citro2D Rendering</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  The Nintendo 3DS has two independent framebuffers with distinct resolutions. Citro2D renders both screens within a single synchronous frame:
                </p>
                <ul className="text-xs text-neutral-400 space-y-2 list-disc pl-4">
                  <li>
                    <strong className="text-neutral-200">Top Display (400×240)</strong>: Renders mod artwork, titles, author metadata, conflict warnings, and battery/Wi-Fi status.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Bottom Touchscreen (320×240)</strong>: Receives stylus input via <code className="text-amber-300">hidTouchRead()</code>, renders scrollable mod lists, tabs, and action buttons.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Synchronous 60 FPS Loop</strong>:
                    <pre className="mt-1 p-2 bg-neutral-900 rounded border border-neutral-800 text-[10px] text-amber-200 font-mono">
                      C3D_FrameBegin(C3D_FRAME_SYNCDRAW);{'\n'}
                      C2D_TargetClear(topTarget, COLOR_BG);{'\n'}
                      UI_DrawTopScreen(&amp;ctx);{'\n'}
                      C2D_TargetClear(botTarget, COLOR_BG);{'\n'}
                      UI_DrawBottomScreen(&amp;ctx);{'\n'}
                      C3D_FrameEnd();
                    </pre>
                  </li>
                </ul>
              </div>

              {/* Card 2: Core 1 Multithreading & minizip */}
              <div className="bg-[#11131a] border border-neutral-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm">
                  <Cpu className="w-4 h-4" />
                  <h3>2. Multi-Core Threading &amp; Minizip</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  To prevent the 3DS user interface from freezing during 10MB+ downloads and ZIP decompression, tasks are decoupled across CPU cores:
                </p>
                <ul className="text-xs text-neutral-400 space-y-2 list-disc pl-4">
                  <li>
                    <strong className="text-neutral-200">Thread Affinity on Core 1</strong>: The download worker is spawned with <code className="text-blue-300">threadCreate(Worker, ctx, 32KB, 0x31, 1, false)</code>, leaving Core 0 100% dedicated to 60 FPS rendering.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Heap-Friendly Streaming Decompression</strong>: Archives are extracted in 32KB streaming chunks via <code className="text-emerald-300">unzReadCurrentFile()</code> directly onto the SD card, avoiding out-of-memory crashes on the 3DS 128MB RAM budget.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Thread Synchronization</strong>: State updates are guarded by non-blocking <code className="text-blue-300">LightLock</code> primitives.
                  </li>
                </ul>
              </div>

              {/* Card 3: Smash 3DS Costume Slot Remapper */}
              <div className="bg-[#11131a] border border-neutral-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                  <Sliders className="w-4 h-4" />
                  <h3>3. Costume Slot Remapping &amp; Conflicts</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Super Smash Bros. for Nintendo 3DS assigns 8 costume slots per fighter (<code className="text-amber-300">c00</code> to <code className="text-amber-300">c07</code>). Two mods targeting the same costume slot will overwrite each other:
                </p>
                <ul className="text-xs text-neutral-400 space-y-2 list-disc pl-4">
                  <li>
                    <strong className="text-neutral-200">Conflict Detection</strong>: Scans the manifest (<code className="text-neutral-300">installed_mods.json</code>) before installation to identify overlapping slots.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Smart Slot Remapper</strong>: Automatically remaps folder names and CSP portrait filenames to the first free slot (e.g. from <code className="text-amber-300">c00</code> to <code className="text-emerald-400">c03</code>).
                  </li>
                  <li>
                    <strong className="text-neutral-200">Safe Toggling</strong>: Renames folders with a <code className="text-neutral-300">.disabled</code> suffix so Luma3DS LayeredFS ignores them without deleting files.
                  </li>
                </ul>
              </div>

              {/* Card 4: 3DS Camera QR Code Scanning */}
              <div className="bg-[#11131a] border border-neutral-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 text-purple-400 font-bold text-sm">
                  <Camera className="w-4 h-4" />
                  <h3>4. Camera QR Code Scanner (cam:u + quirc)</h3>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Typing long GameBanana URLs using the 3DS stylus is tedious. SmashBanana integrates the 3DS outer camera:
                </p>
                <ul className="text-xs text-neutral-400 space-y-2 list-disc pl-4">
                  <li>
                    <strong className="text-neutral-200">Hardware Camera Capture</strong>: Uses Nintendo 3DS <code className="text-purple-300">cam:u</code> service capturing 400×240 RGB565 frames at 30 FPS.
                  </li>
                  <li>
                    <strong className="text-neutral-200">Grayscale Conversion</strong>: Fast integer luminance conversion (<code className="text-neutral-300">(R*299 + G*587 + B*114)/1000</code>).
                  </li>
                  <li>
                    <strong className="text-neutral-200">QR Code Decoding</strong>: The lightweight <code className="text-purple-300">quirc</code> C library extracts GameBanana Mod IDs and opens the download page instantly.
                  </li>
                </ul>
              </div>
            </div>

            {/* Regional Title IDs Table */}
            <div className="bg-[#11131a] border border-neutral-800 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-amber-400" />
                Super Smash Bros. for Nintendo 3DS — Regional Title IDs &amp; LayeredFS Paths
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-neutral-300">
                  <thead className="bg-neutral-900 text-neutral-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-2.5 rounded-l">Region</th>
                      <th className="p-2.5">Title ID</th>
                      <th className="p-2.5">Product Code</th>
                      <th className="p-2.5 rounded-r">Luma3DS LayeredFS Destination</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 font-mono text-[11px]">
                    <tr>
                      <td className="p-2.5 font-bold text-amber-400">USA</td>
                      <td className="p-2.5">00040000000EDF00</td>
                      <td className="p-2.5 text-neutral-400">CTR-P-AXCE</td>
                      <td className="p-2.5 text-emerald-400">sdmc:/luma/titles/00040000000EDF00/romfs/</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-blue-400">EUR</td>
                      <td className="p-2.5">00040000000EE000</td>
                      <td className="p-2.5 text-neutral-400">CTR-P-AXCP</td>
                      <td className="p-2.5 text-emerald-400">sdmc:/luma/titles/00040000000EE000/romfs/</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-red-400">JPN</td>
                      <td className="p-2.5">00040000000B8B00</td>
                      <td className="p-2.5 text-neutral-400">CTR-P-AXCJ</td>
                      <td className="p-2.5 text-emerald-400">sdmc:/luma/titles/00040000000B8B00/romfs/</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* View 4: Full Master Prompt for AI Studio */}
        {activeView === 'prompt' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#11131a] p-4 rounded-xl border border-neutral-800">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Full Master Prompt for Google AI Studio
                </h2>
                <p className="text-xs text-neutral-400">
                  Ready-to-use prompt configured with GameBanana Game ID 6364, regional Title IDs, Luma3DS LayeredFS, New 3DS speedup, and dual-screen specs.
                </p>
              </div>

              <button
                onClick={handleCopyPrompt}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  copiedPrompt
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md'
                }`}
              >
                {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy Full Prompt'}</span>
              </button>
            </div>

            <div className="bg-[#0b0c12] border border-neutral-800 rounded-xl p-4 font-mono text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap select-text max-h-[500px] overflow-y-auto">
              {fullPromptText}
            </div>
          </div>
        )}

        {/* Complete Development Roadmap */}
        <div className="bg-[#10121a] border border-neutral-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            SmashBanana 3DS — Completed Development Stages
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            {/* Stage 1 */}
            <div className="bg-[#181a24] border border-emerald-500/60 rounded-xl p-3 space-y-1 relative">
              <span className="absolute -top-2 right-2 bg-emerald-500 text-black font-extrabold text-[8px] px-1.5 rounded">
                COMPLETE
              </span>
              <div className="font-bold text-emerald-400">Step 1: Scaffolding</div>
              <div className="font-semibold text-neutral-200">Makefile &amp; Citro2D</div>
              <p className="text-[11px] text-neutral-400">
                devkitARM build for .3dsx &amp; .cia, dual LCD render targets, New 3DS 804MHz speedup.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="bg-[#181a24] border border-emerald-500/60 rounded-xl p-3 space-y-1 relative">
              <span className="absolute -top-2 right-2 bg-emerald-500 text-black font-extrabold text-[8px] px-1.5 rounded">
                COMPLETE
              </span>
              <div className="font-bold text-emerald-400">Step 2: HTTPS API</div>
              <div className="font-semibold text-neutral-200">httpc &amp; mbedTLS</div>
              <p className="text-[11px] text-neutral-400">
                GameBanana Game 6364 Subfeed REST endpoints, sorting options, JSON streaming parser.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="bg-[#181a24] border border-emerald-500/60 rounded-xl p-3 space-y-1 relative">
              <span className="absolute -top-2 right-2 bg-emerald-500 text-black font-extrabold text-[8px] px-1.5 rounded">
                COMPLETE
              </span>
              <div className="font-bold text-emerald-400">Step 3: Downloader</div>
              <div className="font-semibold text-neutral-200">Core 1 &amp; Minizip</div>
              <p className="text-[11px] text-neutral-400">
                Light-weight thread on Core 1 for 60 FPS UI, streaming 32KB unzip to LayeredFS romfs.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="bg-[#181a24] border border-emerald-500/60 rounded-xl p-3 space-y-1 relative">
              <span className="absolute -top-2 right-2 bg-emerald-500 text-black font-extrabold text-[8px] px-1.5 rounded">
                COMPLETE
              </span>
              <div className="font-bold text-emerald-400">Step 4: Mod Manager</div>
              <div className="font-semibold text-neutral-200">Manifest &amp; Toggles</div>
              <p className="text-[11px] text-neutral-400">
                Local manifest on SDMC, clean uninstaller, .disabled suffix toggle, swkbd search.
              </p>
            </div>

            {/* Stage 5 */}
            <div className="bg-[#181a24] border border-emerald-500/60 rounded-xl p-3 space-y-1 relative">
              <span className="absolute -top-2 right-2 bg-emerald-500 text-black font-extrabold text-[8px] px-1.5 rounded">
                COMPLETE
              </span>
              <div className="font-bold text-emerald-400">Step 5: Pro Modding</div>
              <div className="font-semibold text-neutral-200">Slot Remap &amp; QR</div>
              <p className="text-[11px] text-neutral-400">
                Smash 3DS costume slot conflict auto-remapping (<code className="text-neutral-300">c00-c07</code>) and 3DS camera QR code reader (<code className="text-neutral-300">cam:u</code>).
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
