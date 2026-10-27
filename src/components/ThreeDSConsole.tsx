/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wifi,
  BatteryCharging,
  Cpu,
  HardDrive,
  Camera,
  Volume2,
  VolumeX,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Download,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects.ts';
import { parseGameBananaQr } from '../utils/qrParser.ts';
import {
  detectFighterSlot,
  remapSlotInPath,
  findFirstAvailableSlot,
  SMASH_3DS_ROSTER
} from '../utils/slotRemapper.ts';

interface MockMod {
  id: number;
  title: string;
  author: string;
  category: string;
  downloads: string;
  likes: number;
  thumbnail: string;
  size: string;
  description: string;
  slot: string;
  isInstalled?: boolean;
}

const INITIAL_SMASH_MODS: MockMod[] = [
  {
    id: 384912,
    title: 'Shadow the Hedgehog (c01-c04)',
    author: 'KTH_Modder',
    category: 'Fighter Skin (Sonic)',
    downloads: '14.2k',
    likes: 842,
    thumbnail: '🦔',
    size: '4.8 MB',
    description: 'Custom model with custom textures, sound clips, and CSP portraits for Sonic.',
    slot: 'fighter/sonic/model/body/c01/',
    isInstalled: true,
  },
  {
    id: 295014,
    title: 'Melee Fox Sounds & Shines',
    author: 'SmashPro3DS',
    category: 'Audio / Voice',
    downloads: '9.6k',
    likes: 615,
    thumbnail: '🦊',
    size: '1.2 MB',
    description: 'Brings authentic Super Smash Bros. Melee voice clips and shine SFX to Fox.',
    slot: 'sound/fighter/fox/',
    isInstalled: true,
  },
  {
    id: 412093,
    title: 'Brawl Battlefield HD Remake',
    author: 'StageCrafter',
    category: 'Stage',
    downloads: '7.1k',
    likes: 490,
    thumbnail: '⚔️',
    size: '6.4 MB',
    description: 'Faithful recreation of SSBB Battlefield with custom lighting and dynamic background.',
    slot: 'stage/battlefield/',
    isInstalled: false,
  },
  {
    id: 351982,
    title: 'Persona 5 Last Surprise BGM',
    author: 'AtlusFanatic',
    category: 'Music / BGM',
    downloads: '11.8k',
    likes: 920,
    thumbnail: '🎵',
    size: '3.6 MB',
    description: 'Looping high-quality DSPADPCM audio stream replacing Menu 02 track.',
    slot: 'sound/bgm/snd_bgm_W02_MENU_02.dspadpcm',
    isInstalled: false,
  },
  {
    id: 401823,
    title: 'Cloud Strife - Advent Children (c04)',
    author: 'MidgarSmith',
    category: 'Fighter Skin (Cloud)',
    downloads: '16.5k',
    likes: 1120,
    thumbnail: '🗡️',
    size: '5.2 MB',
    description: 'Advent Children black leather costume with Fenrir emblem and Buster Sword textures.',
    slot: 'fighter/cloud/model/body/c04/',
    isInstalled: false,
  },
  {
    id: 377402,
    title: 'Bayonetta - Jeanne Red Uniform (c05)',
    author: 'UmbraWitch',
    category: 'Fighter Skin (Bayonetta)',
    downloads: '8.4k',
    likes: 730,
    thumbnail: '👠',
    size: '4.1 MB',
    description: 'High-res Jeanne model swap with custom Silver Gun SFX and red feather wings.',
    slot: 'fighter/bayonetta/model/body/c05/',
    isInstalled: false,
  },
  {
    id: 399105,
    title: 'Super Mario Odyssey Tuxedo (c00)',
    author: 'NintendoModder',
    category: 'Fighter Skin (Mario)',
    downloads: '12.9k',
    likes: 955,
    thumbnail: '🎩',
    size: '3.9 MB',
    description: 'White tuxedo and top hat from Mario Odyssey Wedding with Cappy eye decals.',
    slot: 'fighter/mario/model/body/c00/',
    isInstalled: false,
  },
  {
    id: 421008,
    title: 'Project M Wavedash & Fast-Fall Engine',
    author: 'MeleeMeister',
    category: 'Gameplay / Patch',
    downloads: '21.3k',
    likes: 1840,
    thumbnail: '⚡',
    size: '850 KB',
    description: 'Custom code.bin patch introducing directional air dodges, wavelanding, and L-canceling.',
    slot: 'code/patch/',
    isInstalled: false,
  },
];

export const ThreeDSConsole: React.FC = () => {
  const [mods, setMods] = useState<MockMod[]>(INITIAL_SMASH_MODS);
  const [selectedModIndex, setSelectedModIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'mods' | 'search' | 'installed' | 'scanner' | 'slots' | 'logs'>('mods');
  const [region, setRegion] = useState<'USA' | 'EUR' | 'JPN'>('USA');
  const [isNew3DSSpeedup, setIsNew3DSSpeedup] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  // Background thread downloader state simulation
  const [dlState, setDlState] = useState<'idle' | 'connecting' | 'downloading' | 'extracting' | 'completed'>('idle');
  const [dlProgress, setDlProgress] = useState(0);
  const [dlSpeed, setDlSpeed] = useState('1.8 MB/s');
  const [extractedCount, setExtractedCount] = useState(0);

  // In-console Toast / Notification
  const [consoleNotification, setConsoleNotification] = useState<string | null>(null);

  // QR Code Scanner State
  const [qrInput, setQrInput] = useState('https://gamebanana.com/mods/401823');
  const [isQrScanning, setIsQrScanning] = useState(false);

  // Virtual 3DS Software Keyboard (swkbd) / Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tempKeyboardInput, setTempKeyboardInput] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Custom logs array
  const [systemLogs, setSystemLogs] = useState<string[]>([
    '[OS] CTR Bootloader OK • New 3DS 804MHz Enabled',
    '[FS] SDMC mounted: sdmc:/luma/titles/00040000000EDF00/romfs/',
    '[NET] httpc initialized • TLS 1.2 mbedTLS handshake OK',
    '[API] GameBanana Game ID 6364 Subfeed loaded (8 mods)',
  ]);

  const addLog = (msg: string) => {
    setSystemLogs((prev) => [...prev.slice(-8), msg]);
  };

  const showNotification = (msg: string) => {
    setConsoleNotification(msg);
    setTimeout(() => setConsoleNotification(null), 3500);
  };

  const openSwkbd = (initialQuery?: string) => {
    soundEffects.playClick();
    setTempKeyboardInput(initialQuery !== undefined ? initialQuery : searchQuery);
    setIsKeyboardOpen(true);
    addLog('[SWKBD] libctru swkbdInit() triggered by user.');
  };

  const handleConfirmSearch = (queryToUse?: string) => {
    const finalQuery = (queryToUse !== undefined ? queryToUse : tempKeyboardInput).trim();
    soundEffects.playConfirm();
    setSearchQuery(finalQuery);
    setIsKeyboardOpen(false);
    setActiveTab('search');
    setSelectedModIndex(0);

    if (finalQuery) {
      addLog(`[API] GameBanana subfeed search: "_sSearchString=${encodeURIComponent(finalQuery)}"`);
      showNotification(`Search applied: "${finalQuery}"`);
    } else {
      addLog('[API] Search cleared. Displaying all mods.');
      showNotification('Search filter cleared');
    }
  };

  const handleCancelSearch = () => {
    soundEffects.playCancel();
    setIsKeyboardOpen(false);
    addLog('[SWKBD] Keyboard cancelled by user (SWKBD_BUTTON_NONE).');
  };

  const handleClearSearch = () => {
    soundEffects.playClick();
    setSearchQuery('');
    setTempKeyboardInput('');
    setSelectedModIndex(0);
    addLog('[SEARCH] Filter cleared.');
    showNotification('Search cleared');
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEffects.enabled = next;
    if (next) soundEffects.playConfirm();
  };

  const filteredMods = mods.filter((m) =>
    searchQuery
      ? m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const selectedMod = filteredMods[selectedModIndex] || filteredMods[0] || mods[0];

  // Slot Detection and Conflict Checking
  const slotInfo = detectFighterSlot(selectedMod?.slot || '');
  const fighterProfile = slotInfo.fighter ? SMASH_3DS_ROSTER[slotInfo.fighter] : null;

  // Check if any installed mod conflicts with this slot
  const conflictingMod = mods.find(
    (m) => m.isInstalled && m.id !== selectedMod?.id && m.slot === selectedMod?.slot
  );

  const handleStartDownload = (customMod?: MockMod) => {
    const targetMod = customMod || selectedMod;
    if (!targetMod) return;
    if (dlState !== 'idle' && dlState !== 'completed') return;

    soundEffects.playConfirm();
    setDlState('connecting');
    setDlProgress(0);
    addLog(`[DOWN] Queued: ${targetMod.title} (ID: ${targetMod.id})`);

    setTimeout(() => {
      setDlState('downloading');
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        if (progress >= 100) {
          clearInterval(interval);
          setDlProgress(100);
          setDlState('extracting');
          soundEffects.playClick();
          addLog(`[EXTR] minizip streaming ${targetMod.size} directly to SDMC romfs...`);

          let ext = 0;
          const extInterval = setInterval(() => {
            ext += 4;
            setExtractedCount(ext);
            if (ext >= 16) {
              clearInterval(extInterval);
              setDlState('completed');
              soundEffects.playSuccessChime();
              addLog(`[DONE] ${targetMod.title} active in LayeredFS!`);
              showNotification(`Installed: ${targetMod.title}`);

              // Mark mod as installed
              setMods((prev) =>
                prev.map((m) => (m.id === targetMod.id ? { ...m, isInstalled: true } : m))
              );
            }
          }, 200);
        } else {
          setDlProgress(progress);
        }
      }, 150);
    }, 400);
  };

  const handleRemapAndInstall = (newSlotIndex: number) => {
    soundEffects.playSlotSwitch();
    const newSlotPath = remapSlotInPath(selectedMod.slot, newSlotIndex);
    const updated = {
      ...selectedMod,
      slot: newSlotPath,
      title: `${selectedMod.title} [Slot c0${newSlotIndex}]`,
    };

    setMods((prev) => prev.map((m) => (m.id === selectedMod.id ? updated : m)));
    showNotification(`Remapped to slot c0${newSlotIndex}! Installing...`);
    addLog(`[SLOT] Remapped mod ${selectedMod.id} -> ${newSlotPath}`);
    handleStartDownload(updated);
  };

  const handleUninstall = (modId: number) => {
    soundEffects.playCancel();
    setMods((prev) => prev.map((m) => (m.id === modId ? { ...m, isInstalled: false } : m)));
    showNotification('Mod uninstalled from LayeredFS & manifest updated.');
    addLog(`[UNIN] Mod ${modId} uninstalled and deleted from SDMC.`);
  };

  const handleDpad = (direction: 'up' | 'down') => {
    soundEffects.playClick();
    if (direction === 'up' && selectedModIndex > 0) {
      setSelectedModIndex(selectedModIndex - 1);
    } else if (direction === 'down' && selectedModIndex < filteredMods.length - 1) {
      setSelectedModIndex(selectedModIndex + 1);
    }
  };

  const cycleRegion = () => {
    soundEffects.playSlotSwitch();
    const next = region === 'USA' ? 'EUR' : region === 'EUR' ? 'JPN' : 'USA';
    setRegion(next);
    addLog(`[CFG] Target region switched to ${next}`);
  };

  const handleQrScan = (presetUrl?: string) => {
    const target = presetUrl || qrInput;
    setIsQrScanning(true);
    soundEffects.playClick();

    setTimeout(() => {
      setIsQrScanning(false);
      const parsed = parseGameBananaQr(target);
      if (parsed.isValid && parsed.id) {
        soundEffects.playConfirm();
        const found = mods.findIndex((m) => m.id === parsed.id);
        if (found >= 0) {
          setSelectedModIndex(found);
          setActiveTab('mods');
          showNotification(`Scanned QR: ${mods[found].title}`);
          addLog(`[QR] Recognized Mod ID ${parsed.id}: ${mods[found].title}`);
        } else {
          showNotification(`Scanned Mod ID ${parsed.id} from QR Code!`);
          addLog(`[QR] Scanned custom GameBanana mod URL ID: ${parsed.id}`);
        }
      } else {
        soundEffects.playError();
        showNotification('Invalid QR code format');
        addLog(`[QR] Error: Invalid link format: ${target}`);
      }
    }, 600);
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* 3DS Console Shell (Matte Cosmic Black Chassis) */}
      <div className="w-full max-w-[580px] bg-neutral-900 border-2 border-neutral-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl relative">
        {/* Upper Shell (Top Screen 400x240 Aspect Ratio) */}
        <div className="bg-neutral-950 p-3 sm:p-4 rounded-2xl border border-neutral-800 shadow-inner mb-3 relative">
          {/* Top Screen Stereo Speaker Holes */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700"></span>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-60">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700"></span>
          </div>

          {/* Top Bar Header Indicator */}
          <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1 px-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-neutral-300">TOP SCREEN (400×240)</span>
              <span className="text-amber-400 font-mono text-[9px]">GameBanana ID: 6364</span>
            </div>
            <button
              onClick={toggleSound}
              title={soundOn ? 'Sound Effects Enabled' : 'Sound Muted'}
              className="flex items-center gap-1 text-[9px] text-neutral-400 hover:text-amber-400 transition-colors"
            >
              {soundOn ? <Volume2 className="w-3 h-3 text-emerald-400" /> : <VolumeX className="w-3 h-3 text-red-400" />}
              <span>{soundOn ? 'SFX ON' : 'MUTED'}</span>
            </button>
          </div>

          {/* Top LCD Display Simulation */}
          <div
            className="w-full aspect-[400/240] bg-[#14161f] border border-neutral-700/60 rounded-lg overflow-hidden flex flex-col text-slate-100 font-sans shadow-lg relative"
            data-testid="top-screen"
          >
            {/* Top Status Header */}
            <div className="h-6 sm:h-7 bg-[#1c202d] border-b border-red-600/70 flex items-center justify-between px-2.5 text-[10px] sm:text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="bg-red-600 text-white font-black px-1.5 py-0.5 rounded text-[9px] tracking-wider">
                  SMASH 3DS
                </span>
                <span className="text-neutral-400 hidden sm:inline text-[10px]">SmashBanana Client</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                {isNew3DSSpeedup && (
                  <span className="flex items-center gap-0.5 sm:gap-1 bg-blue-900/70 border border-blue-500/40 text-blue-300 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded">
                    <Cpu className="w-2.5 h-2.5 text-blue-400" />
                    804MHz N3DS
                  </span>
                )}
                <span className="flex items-center gap-1 bg-neutral-800 text-neutral-300 text-[9px] px-1.5 py-0.5 rounded">
                  <Wifi className="w-2.5 h-2.5 text-emerald-400" />
                  Internet
                </span>
                <span className="flex items-center gap-1 bg-neutral-800 text-neutral-300 text-[9px] px-1.5 py-0.5 rounded">
                  <BatteryCharging className="w-2.5 h-2.5 text-emerald-400" />
                  98%
                </span>
              </div>
            </div>

            {/* In-Console Floating Notification Banner */}
            {consoleNotification && (
              <div className="absolute top-8 left-2 right-2 z-30 bg-amber-400 text-neutral-950 px-2 py-1 rounded shadow-lg text-[10px] font-bold flex items-center gap-1.5 animate-bounce">
                <Sparkles className="w-3 h-3 text-neutral-950" />
                <span>{consoleNotification}</span>
              </div>
            )}

            {/* Top Screen Main Showcase Body or Download Progress Overlay */}
            <div className="flex-1 p-2 sm:p-2.5 flex gap-2 sm:gap-2.5 items-stretch bg-gradient-to-b from-[#161824] to-[#10121a] relative overflow-hidden">
              {dlState !== 'idle' && (
                <div className="absolute inset-0 z-20 bg-neutral-950/95 p-3 flex flex-col justify-between backdrop-blur-sm">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      {dlState === 'connecting' && 'Connecting to GameBanana API & CDN...'}
                      {dlState === 'downloading' && `Downloading: ${selectedMod?.title || 'Mod'}`}
                      {dlState === 'extracting' && `minizip Decompressing to LayeredFS...`}
                      {dlState === 'completed' && 'Installation Complete!'}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {dlState === 'extracting' ? `${extractedCount} files` : `${dlProgress}%`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1 my-auto">
                    <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden p-0.5 border border-neutral-700">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-200"
                        style={{ width: `${dlState === 'completed' ? 100 : dlState === 'extracting' ? 90 : dlProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                      <span>Speed: {dlState === 'downloading' ? dlSpeed : 'Writing SDMC...'}</span>
                      <span className="truncate max-w-[200px]">
                        Target: sdmc:/luma/titles/00040000000{region === 'USA' ? 'EDF00' : region === 'EUR' ? 'EE000' : 'B8B00'}/romfs/
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[9px] text-neutral-500 pt-1 border-t border-neutral-900">
                    <span>Background Worker: Core 1 • Citro2D UI: 60 FPS</span>
                    {dlState === 'completed' && (
                      <button
                        onClick={() => {
                          soundEffects.playClick();
                          setDlState('idle');
                        }}
                        className="text-amber-400 font-bold hover:underline"
                      >
                        [Dismiss Overlay]
                      </button>
                    )}
                  </div>
                </div>
              )}

              {filteredMods.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-3 text-center bg-neutral-900/90 rounded border border-neutral-700/60 my-auto">
                  <Search className="w-8 h-8 text-neutral-500 mb-1.5 animate-pulse" />
                  <h3 className="text-xs sm:text-sm font-bold text-amber-400 mb-0.5">
                    No mods found for "{searchQuery}"
                  </h3>
                  <p className="text-[8px] sm:text-[9px] text-neutral-400 max-w-[280px] mb-2 leading-tight">
                    No GameBanana submissions matched this keyword for game ID 6364.
                  </p>
                  <div className="flex items-center gap-2 text-[8px]">
                    <button
                      onClick={() => openSwkbd()}
                      className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1 shadow"
                    >
                      <span>Y:</span> Re-open swkbd
                    </button>
                    <button
                      onClick={handleClearSearch}
                      className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700"
                    >
                      Clear Filter
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Mod Big Thumbnail Card */}
                  <div className="w-[110px] sm:w-[130px] bg-neutral-900 border border-neutral-700/80 rounded-md p-1.5 flex flex-col items-center justify-center text-center shadow-inner relative group shrink-0">
                    <span className="text-3xl sm:text-4xl mb-0.5 filter drop-shadow">{selectedMod?.thumbnail}</span>
                    <span className="text-[9px] sm:text-[10px] font-semibold text-neutral-200 line-clamp-1">{selectedMod?.title}</span>
                    <span className="text-[8px] text-amber-400">{selectedMod?.category}</span>
                    <div className="absolute top-1 left-1 bg-neutral-800/80 text-[7px] text-neutral-400 px-1 rounded">
                      ID: {selectedMod?.id}
                    </div>
                    {selectedMod?.isInstalled && (
                      <span className="absolute bottom-1 bg-emerald-500 text-neutral-950 font-black text-[7px] px-1 py-0.2 rounded">
                        INSTALLED
                      </span>
                    )}
                  </div>

                  {/* Mod Detailed Metadata */}
                  <div className="flex-1 flex flex-col justify-between py-0.5 overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-xs sm:text-sm font-bold text-amber-400 leading-tight truncate">
                          {selectedMod?.title}
                        </h3>
                      </div>

                      <p className="text-[9px] text-neutral-400 mt-0.5">
                        Author: <span className="text-neutral-200 font-medium">{selectedMod?.author}</span> • Likes: {selectedMod?.likes}
                      </p>

                      <p className="text-[9px] text-neutral-300 mt-1 line-clamp-2 leading-relaxed bg-neutral-800/40 p-1 rounded border border-neutral-700/30">
                        {selectedMod?.description}
                      </p>
                    </div>

                    {/* Conflict Alert or Slot Badge */}
                    {conflictingMod && !selectedMod?.isInstalled ? (
                      <div className="bg-red-950/80 border border-red-500/50 p-1 rounded flex items-center justify-between text-[8px] text-red-200">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-red-400 shrink-0" />
                          Conflict: Slot occupied by "{conflictingMod.title}"
                        </span>
                        <button
                          onClick={() => {
                            const free = findFirstAvailableSlot(slotInfo.fighter || 'mario', [0, 1]);
                            handleRemapAndInstall(free >= 0 ? free : 3);
                          }}
                          className="bg-amber-400 text-neutral-950 font-bold px-1.5 py-0.5 rounded hover:bg-amber-300"
                        >
                          Auto-Remap
                        </button>
                      </div>
                    ) : (
                      <div className="text-[8px] sm:text-[9px] bg-neutral-900/90 border border-neutral-700/60 rounded p-1 font-mono text-neutral-300 flex flex-col gap-0.5">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Target Path:</span>
                          <span className="text-amber-300 truncate max-w-[150px]">{selectedMod?.slot}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">LayeredFS:</span>
                          <span className="text-emerald-400 truncate max-w-[170px]">
                            sdmc:/luma/titles/00040000000{region === 'USA' ? 'EDF00' : region === 'EUR' ? 'EE000' : 'B8B00'}/romfs/
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Top Screen Footer HUD */}
            <div className="h-5 sm:h-6 bg-[#181b26] border-t border-neutral-800 flex items-center justify-between px-2 text-[8px] sm:text-[9px] text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                  Region: {region}
                </span>
                <span className="flex items-center gap-1 text-neutral-300">
                  <HardDrive className="w-2.5 h-2.5 text-neutral-400" />
                  SD Free: 23.4 GB
                </span>
              </div>
              <span className="text-neutral-400 hidden sm:inline">Press START to exit | SELECT for region</span>
            </div>
          </div>
        </div>

        {/* Console Hinge */}
        <div className="h-3 bg-neutral-800 rounded-lg mx-6 border-y border-neutral-700 flex items-center justify-center">
          <div className="w-16 h-1 bg-neutral-900 rounded-full"></div>
        </div>

        {/* Lower Shell (Bottom Screen 320x240 Aspect Ratio + Controls) */}
        <div className="mt-3 flex flex-col items-center">
          <div className="w-full flex items-center justify-between gap-2 sm:gap-3">
            {/* Left Controls: Circle Pad & D-Pad */}
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              {/* Circle Pad */}
              <div
                onClick={() => handleDpad('down')}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 border-2 border-neutral-600 shadow-md flex items-center justify-center cursor-pointer hover:border-neutral-500 active:scale-95 transition-all"
                title="Circle Pad (Navigate)"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-600 border border-neutral-500 shadow-inner"></div>
              </div>

              {/* D-Pad */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                <button
                  onClick={() => handleDpad('up')}
                  aria-label="D-Pad Up"
                  className="absolute top-0 w-5 h-5 sm:h-6 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-600 rounded-t flex items-center justify-center text-neutral-300 text-[9px]"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleDpad('down')}
                  aria-label="D-Pad Down"
                  className="absolute bottom-0 w-5 h-5 sm:h-6 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-600 rounded-b flex items-center justify-center text-neutral-300 text-[9px]"
                >
                  ▼
                </button>
                <button
                  onClick={() => handleDpad('up')}
                  aria-label="D-Pad Left"
                  className="absolute left-0 w-5 sm:w-6 h-5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-600 rounded-l flex items-center justify-center text-neutral-300 text-[9px]"
                >
                  ◀
                </button>
                <button
                  onClick={() => handleDpad('down')}
                  aria-label="D-Pad Right"
                  className="absolute right-0 w-5 sm:w-6 h-5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-600 rounded-r flex items-center justify-center text-neutral-300 text-[9px]"
                >
                  ▶
                </button>
                <div className="w-5 h-5 bg-neutral-800 border-x border-y border-neutral-700"></div>
              </div>
            </div>

            {/* Center Touchscreen (320x240 Aspect Ratio) */}
            <div className="flex-1 max-w-[340px] bg-neutral-950 p-2 rounded-xl border border-neutral-800 shadow-inner">
              <div className="text-[9px] text-neutral-400 font-semibold mb-1 flex justify-between items-center px-1">
                <span>TOUCHSCREEN (320×240)</span>
                <span className="text-[8px] text-neutral-500">Stylus Touch Active</span>
              </div>

              {/* Bottom LCD Display */}
              <div
                className="w-full aspect-[320/240] bg-[#121319] border border-neutral-700/60 rounded-md overflow-hidden flex flex-col text-slate-100 select-none shadow-md relative"
                data-testid="bottom-screen"
              >
                {/* Touch Tab Bar */}
                <div className="h-6 sm:h-7 bg-[#1a1c26] border-b border-neutral-700 flex text-[8px] sm:text-[9px] font-semibold">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveTab('mods');
                    }}
                    className={`flex-1 flex items-center justify-center border-b-2 transition-colors ${
                      activeTab === 'mods' ? 'border-amber-400 text-amber-400 bg-neutral-800/60' : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Browse
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveTab('search');
                      if (!searchQuery) {
                        openSwkbd();
                      }
                    }}
                    className={`flex-1 flex items-center justify-center border-b-2 transition-colors ${
                      activeTab === 'search' ? 'border-amber-400 text-amber-400 bg-neutral-800/60' : 'border-transparent text-neutral-400'
                    }`}
                  >
                    🔍 Search{searchQuery ? ` (${filteredMods.length})` : ''}
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveTab('installed');
                    }}
                    className={`flex-1 flex items-center justify-center border-b-2 transition-colors ${
                      activeTab === 'installed' ? 'border-amber-400 text-amber-400 bg-neutral-800/60' : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Installed ({mods.filter((m) => m.isInstalled).length})
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveTab('slots');
                    }}
                    className={`flex-1 flex items-center justify-center border-b-2 transition-colors ${
                      activeTab === 'slots' ? 'border-amber-400 text-amber-400 bg-neutral-800/60' : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Slots
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveTab('scanner');
                    }}
                    className={`flex-1 flex items-center justify-center border-b-2 transition-colors ${
                      activeTab === 'scanner' ? 'border-amber-400 text-amber-400 bg-neutral-800/60' : 'border-transparent text-neutral-400'
                    }`}
                  >
                    📷 QR
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveTab('logs');
                    }}
                    className={`flex-1 flex items-center justify-center border-b-2 transition-colors ${
                      activeTab === 'logs' ? 'border-amber-400 text-amber-400 bg-neutral-800/60' : 'border-transparent text-neutral-400'
                    }`}
                  >
                    Logs
                  </button>
                </div>

                {/* Tab: Search Query & Results */}
                {activeTab === 'search' && (
                  <div className="flex-1 p-1 overflow-y-auto space-y-1 bg-[#0f1015] text-[9px]">
                    <div className="bg-[#181a24] p-1.5 rounded border border-neutral-700/80 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate text-neutral-200">
                          {searchQuery ? (
                            <>
                              Query: <span className="text-amber-400 font-mono font-bold">"{searchQuery}"</span>
                            </>
                          ) : (
                            <span className="text-neutral-400 italic">No search term entered</span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openSwkbd()}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded text-[8px] flex items-center gap-0.5 shadow"
                        >
                          ⌨️ swkbd
                        </button>
                        {searchQuery && (
                          <button
                            onClick={handleClearSearch}
                            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-1 py-0.5 rounded text-[8px]"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Query Presets */}
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5 px-0.5 text-[7px] text-neutral-400 scrollbar-none">
                      <span className="text-neutral-500 font-bold shrink-0">Tags:</span>
                      {['Sonic', 'Mario', 'Cloud', 'Fox', 'Stage', 'Persona'].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleConfirmSearch(tag)}
                          className="bg-neutral-800 hover:bg-neutral-700 hover:text-amber-300 text-neutral-300 px-1.5 py-0.5 rounded border border-neutral-700 shrink-0"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>

                    {/* Search Results List */}
                    {filteredMods.length === 0 ? (
                      <div className="p-3 text-center bg-[#151720] rounded border border-neutral-800/80 my-2">
                        <p className="text-[9px] text-neutral-300 font-bold mb-1">
                          No mods found for "{searchQuery}"
                        </p>
                        <p className="text-[8px] text-neutral-500 mb-2">
                          Try searching for another fighter name, author, or music title.
                        </p>
                        <button
                          onClick={() => openSwkbd()}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-1 rounded text-[8px] inline-flex items-center gap-1 shadow"
                        >
                          <span>⌨️</span> Open 3DS Keyboard
                        </button>
                      </div>
                    ) : (
                      filteredMods.map((mod, idx) => {
                        const isSelected = idx === selectedModIndex;
                        return (
                          <div
                            key={mod.id}
                            onClick={() => {
                              soundEffects.playClick();
                              setSelectedModIndex(idx);
                            }}
                            className={`p-1 sm:p-1.5 rounded border transition-all cursor-pointer flex items-center justify-between text-[9px] ${
                              isSelected
                                ? 'bg-[#212738] border-amber-400 shadow-sm'
                                : 'bg-[#181a24] border-neutral-800 hover:border-neutral-700'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="text-sm">{mod.thumbnail}</span>
                              <div className="truncate">
                                <div className={`font-semibold truncate ${isSelected ? 'text-amber-300' : 'text-neutral-200'}`}>
                                  {mod.title}
                                </div>
                                <div className="text-[7px] text-neutral-400">{mod.category} • {mod.author}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-1 shrink-0">
                              {mod.isInstalled && (
                                <span className="text-[7px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded">
                                  ACTIVE
                                </span>
                              )}
                              <span className="text-[8px] text-neutral-400 font-mono">{mod.size}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Tab 1: Mod Browse List */}
                {activeTab === 'mods' && (
                  <div className="flex-1 p-1 overflow-y-auto space-y-1 bg-[#0f1015]">
                    {filteredMods.map((mod, idx) => {
                      const isSelected = idx === selectedModIndex;
                      return (
                        <div
                          key={mod.id}
                          onClick={() => {
                            soundEffects.playClick();
                            setSelectedModIndex(idx);
                          }}
                          className={`p-1 sm:p-1.5 rounded border transition-all cursor-pointer flex items-center justify-between text-[9px] ${
                            isSelected
                              ? 'bg-[#212738] border-amber-400 shadow-sm'
                              : 'bg-[#181a24] border-neutral-800 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-sm">{mod.thumbnail}</span>
                            <div className="truncate">
                              <div className={`font-semibold truncate ${isSelected ? 'text-amber-300' : 'text-neutral-200'}`}>
                                {mod.title}
                              </div>
                              <div className="text-[7px] text-neutral-400">{mod.category} • {mod.author}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 ml-1 shrink-0">
                            {mod.isInstalled && (
                              <span className="text-[7px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 rounded">
                                ACTIVE
                              </span>
                            )}
                            <span className="text-[8px] text-neutral-400 font-mono">{mod.size}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 2: Installed Mods Manager */}
                {activeTab === 'installed' && (
                  <div className="flex-1 p-1.5 overflow-y-auto bg-[#0f1015] space-y-1.5">
                    <div className="flex items-center justify-between text-[8px] text-neutral-400 border-b border-neutral-800 pb-1">
                      <span>Tracked in installed_mods.json</span>
                      <span className="text-emerald-400 font-mono">
                        {mods.filter((m) => m.isInstalled).length} mods active
                      </span>
                    </div>

                    {mods
                      .filter((m) => m.isInstalled)
                      .map((mod) => (
                        <div
                          key={mod.id}
                          className="bg-[#181a24] border border-neutral-700/60 p-1.5 rounded flex items-center justify-between text-[9px]"
                        >
                          <div className="truncate">
                            <span className="font-bold text-amber-300">{mod.title}</span>
                            <div className="text-[7px] text-neutral-400 font-mono">{mod.slot}</div>
                          </div>
                          <button
                            onClick={() => handleUninstall(mod.id)}
                            className="bg-red-900/60 hover:bg-red-800 text-red-300 border border-red-700/50 px-1.5 py-0.5 rounded text-[8px] flex items-center gap-0.5"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            Delete
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {/* Tab 3: Fighter Costume Slot Remapper */}
                {activeTab === 'slots' && (
                  <div className="flex-1 p-1.5 overflow-y-auto bg-[#0f1015] text-[9px]">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-1 mb-1">
                      <span className="font-bold text-amber-400 flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-amber-400" />
                        Costume Slot Matrix
                      </span>
                      <span className="text-[8px] text-neutral-400">Smash 3DS Roster</span>
                    </div>

                    <div className="space-y-1">
                      {Object.values(SMASH_3DS_ROSTER).map((fighter) => (
                        <div key={fighter.id} className="bg-[#181a24] p-1.5 rounded border border-neutral-800">
                          <div className="font-semibold text-neutral-200 mb-1 flex justify-between text-[8px]">
                            <span>{fighter.name} (8 Slots)</span>
                            <span className="text-neutral-500 font-mono">fighter/{fighter.id}/</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1">
                            {fighter.defaultSlotNames.map((slotName, sIdx) => {
                              const slotTag = `c0${sIdx}`;
                              const hasMod = mods.some(
                                (m) => m.isInstalled && m.slot.includes(`fighter/${fighter.id}/`) && m.slot.includes(slotTag)
                              );
                              return (
                                <button
                                  key={sIdx}
                                  onClick={() => {
                                    if (selectedMod?.slot.includes(`fighter/${fighter.id}/`)) {
                                      handleRemapAndInstall(sIdx);
                                    }
                                  }}
                                  className={`p-1 rounded text-center text-[7px] border transition-all ${
                                    hasMod
                                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                                      : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-amber-400'
                                  }`}
                                >
                                  {slotTag} {hasMod ? '• MOD' : 'Vanilla'}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 4: 3DS Camera QR Scanner Simulation */}
                {activeTab === 'scanner' && (
                  <div className="flex-1 p-2 bg-[#0f1015] flex flex-col justify-between text-[9px]">
                    <div className="border border-neutral-700 rounded p-2 bg-neutral-900/80 text-center relative overflow-hidden">
                      {isQrScanning && (
                        <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                          <div className="w-full h-0.5 bg-emerald-400 animate-pulse"></div>
                        </div>
                      )}
                      <Camera className="w-6 h-6 mx-auto mb-1 text-amber-400" />
                      <span className="font-bold text-neutral-200 block text-[10px]">
                        3DS Outer Camera (cam:u + quirc)
                      </span>
                      <p className="text-[8px] text-neutral-400">
                        Scan any GameBanana mod page QR code to download instantly.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[8px] text-neutral-400 font-semibold">Test Presets:</span>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => handleQrScan('https://gamebanana.com/mods/401823')}
                          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 p-1 rounded text-[8px] text-left border border-neutral-700"
                        >
                          🗡️ Cloud AC (401823)
                        </button>
                        <button
                          onClick={() => handleQrScan('https://gamebanana.com/mods/384912')}
                          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 p-1 rounded text-[8px] text-left border border-neutral-700"
                        >
                          🦔 Shadow Sonic (384912)
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => handleQrScan()}
                      className="w-full py-1 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded text-[9px] flex items-center justify-center gap-1 shadow"
                    >
                      <Camera className="w-3 h-3" />
                      Simulate Camera QR Decode
                    </button>
                  </div>
                )}

                {/* Tab 5: Live Subsystem Log Feed */}
                {activeTab === 'logs' && (
                  <div className="flex-1 p-1.5 overflow-y-auto bg-[#0a0c10] font-mono text-[8px] text-emerald-400 space-y-1">
                    <div className="text-neutral-400 border-b border-neutral-800 pb-0.5 mb-1 flex justify-between">
                      <span>Live 3DS System Console</span>
                      <span>Citro2D / Citro3D</span>
                    </div>
                    {systemLogs.map((log, lIdx) => (
                      <div key={lIdx} className="leading-tight">
                        {log}
                      </div>
                    ))}
                  </div>
                )}

                {/* 3DS Software Keyboard (swkbd) Touch Overlay Modal */}
                {isKeyboardOpen && (
                  <div className="absolute inset-0 z-30 bg-[#161823] p-1.5 flex flex-col justify-between border-2 border-blue-500 rounded-md shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-700/80 pb-0.5">
                      <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[8px] sm:text-[9px]">
                        <span>⌨️</span>
                        <span>libctru swkbd • Nintendo 3DS Keyboard</span>
                      </div>
                      <span className="text-[7px] sm:text-[8px] font-mono text-neutral-400">
                        {tempKeyboardInput.length}/63 chars
                      </span>
                    </div>

                    {/* Input Field Display with cursor */}
                    <div className="bg-[#0b0c10] border border-blue-500/60 rounded px-2 py-1 text-slate-100 font-mono text-[9px] sm:text-[10px] flex items-center justify-between shadow-inner">
                      <div className="flex items-center overflow-x-auto truncate">
                        <span>{tempKeyboardInput || <span className="text-neutral-500 italic">Enter search keywords...</span>}</span>
                        <span className="inline-block w-1.5 h-3 bg-amber-400 ml-0.5 animate-pulse"></span>
                      </div>
                      {tempKeyboardInput && (
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            setTempKeyboardInput('');
                          }}
                          className="text-[8px] text-neutral-400 hover:text-white px-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Quick Suggestions Chips */}
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5 text-[7px] text-neutral-400 scrollbar-none">
                      <span className="text-neutral-500 font-semibold shrink-0">Tags:</span>
                      {['Sonic', 'Mario', 'Cloud', 'Fox', 'Stage', 'Persona'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            soundEffects.playClick();
                            setTempKeyboardInput(suggestion);
                          }}
                          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-1.5 py-0.5 rounded border border-neutral-700 shrink-0"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>

                    {/* Virtual QWERTY Stylus Touch Keys */}
                    <div className="space-y-0.5 text-[8px] font-mono">
                      {/* Row 1 */}
                      <div className="flex justify-center gap-0.5">
                        {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((key) => (
                          <button
                            key={key}
                            onClick={() => {
                              soundEffects.playClick();
                              if (tempKeyboardInput.length < 63) setTempKeyboardInput((p) => p + key);
                            }}
                            className="w-5 h-4.5 sm:h-5 bg-[#252a3b] hover:bg-blue-600 active:bg-blue-700 rounded border border-neutral-700 text-neutral-200 active:scale-95 transition-transform"
                          >
                            {key}
                          </button>
                        ))}
                      </div>

                      {/* Row 2 */}
                      <div className="flex justify-center gap-0.5">
                        {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].map((key) => (
                          <button
                            key={key}
                            onClick={() => {
                              soundEffects.playClick();
                              if (tempKeyboardInput.length < 63) setTempKeyboardInput((p) => p + key);
                            }}
                            className="w-5 h-4.5 sm:h-5 bg-[#252a3b] hover:bg-blue-600 active:bg-blue-700 rounded border border-neutral-700 text-neutral-200 active:scale-95 transition-transform"
                          >
                            {key}
                          </button>
                        ))}
                      </div>

                      {/* Row 3 */}
                      <div className="flex justify-center gap-0.5">
                        {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((key) => (
                          <button
                            key={key}
                            onClick={() => {
                              soundEffects.playClick();
                              if (tempKeyboardInput.length < 63) setTempKeyboardInput((p) => p + key);
                            }}
                            className="w-5 h-4.5 sm:h-5 bg-[#252a3b] hover:bg-blue-600 active:bg-blue-700 rounded border border-neutral-700 text-neutral-200 active:scale-95 transition-transform"
                          >
                            {key}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            setTempKeyboardInput((p) => p.slice(0, -1));
                          }}
                          className="px-1.5 h-4.5 sm:h-5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded border border-neutral-700 font-bold active:scale-95 text-[7px]"
                        >
                          ⌫ Back
                        </button>
                      </div>

                      {/* Row 4: Space Bar */}
                      <div className="flex justify-center gap-1 pt-0.5">
                        <button
                          onClick={() => {
                            soundEffects.playClick();
                            if (tempKeyboardInput.length < 63 && tempKeyboardInput.length > 0) {
                              setTempKeyboardInput((p) => p + ' ');
                            }
                          }}
                          className="flex-1 max-w-[140px] h-4 bg-[#202433] hover:bg-neutral-700 rounded border border-neutral-700 text-neutral-300 text-[7px]"
                        >
                          SPACE
                        </button>
                      </div>
                    </div>

                    {/* Footer Actions: Cancel vs Confirm */}
                    <div className="flex justify-between items-center pt-0.5 border-t border-neutral-800 text-[8px]">
                      <button
                        onClick={handleCancelSearch}
                        className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded border border-neutral-700 flex items-center gap-1 active:scale-95"
                      >
                        <span className="w-3 h-3 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[7px]">
                          B
                        </span>
                        Cancel
                      </button>

                      <button
                        onClick={() => handleConfirmSearch()}
                        className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow flex items-center gap-1 active:scale-95"
                      >
                        <span className="w-3 h-3 rounded-full bg-white text-emerald-800 font-black flex items-center justify-center text-[7px]">
                          A
                        </span>
                        Enter / Search
                      </button>
                    </div>
                  </div>
                )}

                {/* Bottom Touch Bar Actions */}
                <div className="h-6 bg-[#161822] border-t border-neutral-800 flex items-center justify-around px-2 text-[8px] sm:text-[9px] text-neutral-300">
                  <button
                    onClick={() => handleStartDownload()}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[7px]">
                      A
                    </span>
                    Install
                  </button>
                  <button
                    onClick={() => openSwkbd()}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[7px]">
                      Y
                    </span>
                    Search
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playSlotSwitch();
                      if (selectedMod) {
                        setMods((prev) =>
                          prev.map((m) => (m.id === selectedMod.id ? { ...m, isInstalled: !m.isInstalled } : m))
                        );
                        showNotification(`Toggled ${selectedMod.title}`);
                      }
                    }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[7px]">
                      X
                    </span>
                    Toggle
                  </button>
                  <button
                    onClick={() => {
                      soundEffects.playCancel();
                      setActiveTab('mods');
                    }}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[7px]">
                      B
                    </span>
                    Browse
                  </button>
                </div>
              </div>
            </div>

            {/* Right Controls: C-Stick & A/B/X/Y Buttons */}
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              {/* C-Stick (New 3DS exclusive) */}
              <div
                title="New 3DS C-Stick"
                onClick={() => {
                  soundEffects.playClick();
                  handleDpad('down');
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-700 border border-neutral-600 shadow-inner flex items-center justify-center text-[8px] text-neutral-400 font-mono cursor-pointer active:scale-90 transition-transform"
              >
                C
              </div>

              {/* A/B/X/Y Buttons (SNES / New 3DS color scheme) */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                {/* X Button (Top - Blue) */}
                <button
                  onClick={() => {
                    soundEffects.playSlotSwitch();
                    if (selectedMod) {
                      setMods((prev) =>
                        prev.map((m) => (m.id === selectedMod.id ? { ...m, isInstalled: !m.isInstalled } : m))
                      );
                      showNotification(`Toggled ${selectedMod.title}`);
                    }
                  }}
                  className="absolute top-0 w-5 h-5 rounded-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-[9px] shadow flex items-center justify-center active:scale-90"
                >
                  X
                </button>
                {/* A Button (Right - Red) */}
                <button
                  onClick={() => handleStartDownload()}
                  className="absolute right-0 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold text-[9px] shadow flex items-center justify-center active:scale-90"
                >
                  A
                </button>
                {/* B Button (Bottom - Yellow) */}
                <button
                  onClick={() => {
                    soundEffects.playCancel();
                    setActiveTab('mods');
                  }}
                  className="absolute bottom-0 w-5 h-5 rounded-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-neutral-950 font-bold text-[9px] shadow flex items-center justify-center active:scale-90"
                >
                  B
                </button>
                {/* Y Button (Left - Green) */}
                <button
                  onClick={() => {
                    openSwkbd();
                  }}
                  className="absolute left-0 w-5 h-5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-[9px] shadow flex items-center justify-center active:scale-90"
                >
                  Y
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Functional Controls: Select, Home, Start */}
          <div className="w-full flex items-center justify-center gap-4 sm:gap-6 mt-2.5 text-[8px] sm:text-[9px] text-neutral-400 font-semibold">
            <button
              onClick={cycleRegion}
              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded border border-neutral-700 flex items-center gap-1 active:scale-95 transition-transform"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              SELECT ({region})
            </button>
            <div className="w-7 h-2 bg-neutral-800 border border-neutral-700 rounded-sm flex items-center justify-center">
              <span className="text-[7px] text-neutral-500">HOME</span>
            </div>
            <button
              onClick={() => {
                soundEffects.playCancel();
                showNotification('APT loop break: Exiting back to 3DS Home Menu.');
                addLog('[APT] Received exit signal. Cleaning up all 3DS subsystems.');
              }}
              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded border border-neutral-700 active:scale-95 transition-transform"
            >
              START (Exit)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
