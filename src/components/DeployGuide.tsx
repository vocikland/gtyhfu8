import React, { useState } from 'react';
import {
  Rocket,
  HardDrive,
  Wifi,
  Play,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  FolderArchive,
  Terminal,
  Settings,
  HelpCircle,
  ExternalLink,
  Download,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects.ts';

interface DeployGuideProps {
  onDownloadZip: () => void;
  isDownloadingZip: boolean;
}

export function DeployGuide({ onDownloadZip, isDownloadingZip }: DeployGuideProps) {
  const [activeMethod, setActiveMethod] = useState<'3dsx' | 'cia' | 'wifi'>('3dsx');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'usa' | 'eur' | 'jpn'>('usa');

  const handleCopy = async (text: string, key: string) => {
    try {
      soundEffects.playConfirm();
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const titleIds = {
    usa: {
      name: 'USA / Северная Америка',
      code: 'CTR-P-AXCE',
      id: '00040000000EDF00',
      path: 'sdmc:/luma/titles/00040000000EDF00/romfs/'
    },
    eur: {
      name: 'EUR / Европа & Россия',
      code: 'CTR-P-AXCP',
      id: '00040000000EE000',
      path: 'sdmc:/luma/titles/00040000000EE000/romfs/'
    },
    jpn: {
      name: 'JPN / Япония',
      code: 'CTR-P-AXCJ',
      id: '00040000000B8B00',
      path: 'sdmc:/luma/titles/00040000000B8B00/romfs/'
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-600/10 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500 text-neutral-950 rounded-xl font-black shadow-lg shadow-amber-500/20">
                <Rocket className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Инструкция по установке на New Nintendo 3DS
              </h2>
            </div>
            <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
              Пошаговый гайд: как скомпилировать проект SmashBanana из исходников и перенести его на реальную консоль
              с кастомной прошивкой Luma3DS (через SD-карту, Homebrew Launcher, FBI или по Wi-Fi).
            </p>
          </div>

          <button
            onClick={() => {
              soundEffects.playConfirm();
              onDownloadZip();
            }}
            disabled={isDownloadingZip}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Скачать исходники проекта (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Mandatory Requirement Warning: Luma3DS Game Patching */}
      <div className="bg-red-950/30 border border-red-500/50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2.5 text-red-400 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>КРИТИЧЕСКИ ВАЖНОЕ ТРЕБОВАНИЕ: Включение патчинга игр в Luma3DS</span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Nintendo 3DS не загружает модификации из папки <code className="text-amber-300 font-mono">sdmc:/luma/titles/</code> по умолчанию.
          Чтобы моды Super Smash Bros. активировались в игре, обязательно включите патчинг:
        </p>
        <div className="bg-black/60 border border-red-500/30 rounded-xl p-3.5 space-y-2 text-xs font-mono">
          <div className="text-neutral-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            <span>Как открыть меню Luma3DS:</span>
          </div>
          <ol className="list-decimal pl-5 space-y-1 text-neutral-300">
            <li>Полностью выключите вашу New 3DS (зажмите кнопку питания).</li>
            <li>Зажмите и удерживайте кнопку <strong className="text-white">SELECT</strong>, затем нажмите кнопку включения.</li>
            <li>В открывшемся меню Luma3DS стрелками крестовины выберите:</li>
            <li className="text-amber-300 font-bold">
              [x] Enable game patching
            </li>
            <li>Нажмите кнопку <strong className="text-emerald-400">START</strong>, чтобы сохранить настройки и загрузить консоль.</li>
          </ol>
        </div>
      </div>

      {/* 4 Main Stages */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Step 1 */}
        <div className="bg-[#11131a] border border-neutral-800 rounded-xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Шаг 1</div>
            <div className="font-bold text-sm text-white mt-1">Скачивание кода</div>
            <p className="text-xs text-neutral-400 mt-1">
              Скачайте полный архив исходников проекта (19 файлов C и devkitARM Makefile) через кнопку выше.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 bg-neutral-900/80 p-2 rounded border border-neutral-800">
            SmashBanana_Source.zip
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[#11131a] border border-neutral-800 rounded-xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Шаг 2</div>
            <div className="font-bold text-sm text-white mt-1">Сборка в devkitPro</div>
            <p className="text-xs text-neutral-400 mt-1">
              Установите тулчейн <code className="text-neutral-300">devkitARM</code> на ПК и выполните команду <code className="text-blue-300">make</code>.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 bg-neutral-900/80 p-2 rounded border border-neutral-800">
            Выход: .3dsx и .cia
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-[#11131a] border border-neutral-800 rounded-xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Шаг 3</div>
            <div className="font-bold text-sm text-white mt-1">Перенос на 3DS</div>
            <p className="text-xs text-neutral-400 mt-1">
              Скопируйте полученный файл на MicroSD карту или установите через FBI / 3dslink по Wi-Fi.
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 bg-neutral-900/80 p-2 rounded border border-neutral-800">
            sdmc:/3ds/SmashBanana/
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-[#11131a] border border-neutral-800 rounded-xl p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Шаг 4</div>
            <div className="font-bold text-sm text-white mt-1">Запуск и моды</div>
            <p className="text-xs text-neutral-400 mt-1">
              Запустите SmashBanana, скачивайте скины и запускайте Super Smash Bros. с активными модами!
            </p>
          </div>
          <div className="text-[11px] font-mono text-neutral-500 bg-neutral-900/80 p-2 rounded border border-neutral-800">
            LayeredFS: c00..c07
          </div>
        </div>
      </div>

      {/* Detailed Compiling Guide */}
      <div className="bg-[#11131a] border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-blue-400 font-bold text-sm">
          <Terminal className="w-5 h-5" />
          <h3>Подробно: Сборка проекта на вашем компьютере (PC / Mac / Linux)</h3>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          Чтобы собрать нативный бинарник для процессора Nintendo 3DS (ARM11), вам потребуется официальный инструмент хоумбрю-сообщества — <strong>devkitPro</strong>.
        </p>

        <div className="space-y-3">
          {/* Step 2.1: Install devkitPro */}
          <div className="bg-[#161822] border border-neutral-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-200">
                1. Установка пакетов devkitPro для 3DS
              </span>
              <a
                href="https://devkitpro.org/wiki/Getting_Started"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
              >
                Официальный сайт devkitPro <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-neutral-400">
              Откройте терминал devkitPro (MSYS2 на Windows) или обычный терминал и установите библиотеки 3DS:
            </p>
            <div className="relative group">
              <pre className="bg-[#0b0c12] p-3 rounded-lg border border-neutral-800 text-xs font-mono text-emerald-300 overflow-x-auto">
                pacman -S 3ds-dev 3ds-citro2d 3ds-citro3d 3ds-curl 3ds-mbedtls 3ds-zlib 3ds-libquirc makerom-git bannertool-git
              </pre>
              <button
                onClick={() =>
                  handleCopy(
                    'pacman -S 3ds-dev 3ds-citro2d 3ds-citro3d 3ds-curl 3ds-mbedtls 3ds-zlib 3ds-libquirc makerom-git bannertool-git',
                    'pacman-cmd'
                  )
                }
                className="absolute right-2 top-2 p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
                title="Копировать команду"
              >
                {copiedKey === 'pacman-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Step 2.2: make */}
          <div className="bg-[#161822] border border-neutral-800 rounded-xl p-4 space-y-2">
            <span className="text-xs font-bold text-neutral-200">
              2. Распаковка и компиляция
            </span>
            <p className="text-xs text-neutral-400">
              Распакуйте скачанный zip-архив, перейдите в папку проекта в терминале и запустите команду сборки:
            </p>
            <div className="relative group">
              <pre className="bg-[#0b0c12] p-3 rounded-lg border border-neutral-800 text-xs font-mono text-amber-300 overflow-x-auto">
                make
              </pre>
              <button
                onClick={() => handleCopy('make', 'make-cmd')}
                className="absolute right-2 top-2 p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs transition"
                title="Копировать команду"
              >
                {copiedKey === 'make-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              В папке автоматически сгенерируются:
              <br />• <span className="font-mono text-emerald-400">SmashBanana.3dsx</span> — исполняемый файл для Homebrew Launcher
              <br />• <span className="font-mono text-emerald-400">SmashBanana.smdh</span> — иконка и описание для меню
              <br />• <span className="font-mono text-emerald-400">SmashBanana.cia</span> — установочный пакет для установки прямо в Home Menu консоли
            </p>
          </div>
        </div>
      </div>

      {/* Transfer Methods Tabs */}
      <div className="bg-[#11131a] border border-neutral-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
            <HardDrive className="w-5 h-5" />
            <h3>Выберите способ переноса на вашу New 3DS</h3>
          </div>

          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs">
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveMethod('3dsx');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeMethod === '3dsx' ? 'bg-emerald-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Способ 1: .3dsx (Homebrew)
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveMethod('cia');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeMethod === 'cia' ? 'bg-emerald-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Способ 2: .cia (FBI)
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setActiveMethod('wifi');
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeMethod === 'wifi' ? 'bg-emerald-500 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Способ 3: Wi-Fi (Без проводов)
            </button>
          </div>
        </div>

        {/* Tab 1: 3dsx */}
        {activeMethod === '3dsx' && (
          <div className="space-y-3 bg-[#151722] border border-neutral-800 rounded-xl p-4 text-xs">
            <div className="font-bold text-sm text-neutral-100 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              Запуск через Homebrew Launcher (.3dsx) — Самый быстрый способ
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Этот способ не требует установки в систему и запускается сразу из стандартного Homebrew Launcher.
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-neutral-300">
              <li>
                Вставьте вашу MicroSD карту в компьютер (через картридер или включив в 3DS меню <em>Системные настройки → Управление данными → Управление данными microSD</em>).
              </li>
              <li>
                Перейдите в папку <code className="text-amber-300 font-mono">3ds</code> на карте памяти.
              </li>
              <li>
                Создайте новую папку с именем <code className="text-emerald-300 font-mono">SmashBanana</code>.
              </li>
              <li>
                Скопируйте туда скомпилированные файлы:
                <div className="mt-1 font-mono text-[11px] bg-black/60 p-2.5 rounded border border-neutral-800 text-emerald-300">
                  sdmc:/3ds/SmashBanana/SmashBanana.3dsx<br />
                  sdmc:/3ds/SmashBanana/SmashBanana.smdh
                </div>
              </li>
              <li>
                Вставьте карту обратно в New 3DS, включите консоль, откройте <strong>Homebrew Launcher</strong> и выберите иконку SmashBanana!
              </li>
            </ol>
          </div>
        )}

        {/* Tab 2: CIA */}
        {activeMethod === 'cia' && (
          <div className="space-y-3 bg-[#151722] border border-neutral-800 rounded-xl p-4 text-xs">
            <div className="font-bold text-sm text-neutral-100 flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-emerald-400" />
              Установка в главное меню HOME Menu (.cia) через FBI
            </div>
            <p className="text-neutral-300 leading-relaxed">
              Устанавливает приложение как полноценную иконку на главном экране вашей 3DS (не нужно заходить в Homebrew Launcher).
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-neutral-300">
              <li>
                Скопируйте файл <code className="text-emerald-300 font-mono">SmashBanana.cia</code> в папку <code className="text-amber-300 font-mono">sdmc:/cias/</code> на вашей карте памяти.
              </li>
              <li>
                Вставьте карту в 3DS и запустите приложение <strong>FBI</strong>.
              </li>
              <li>
                Выберите пункт <strong>SD</strong> → папку <strong>cias</strong>.
              </li>
              <li>
                Наведите курсор на <code className="text-amber-300 font-mono">SmashBanana.cia</code>, нажмите кнопку <strong>A</strong> и выберите пункт:
                <span className="block mt-1 font-mono text-emerald-400 font-bold bg-neutral-900 p-1.5 rounded border border-neutral-800">
                  &gt; Install and delete CIA
                </span>
              </li>
              <li>
                После завершения установки нажмите <strong>HOME</strong> для выхода в главное меню.
              </li>
              <li>
                На экране появится новая подарочная коробка — разверните её, чтобы запустить SmashBanana!
              </li>
            </ol>
          </div>
        )}

        {/* Tab 3: Wi-Fi */}
        {activeMethod === 'wifi' && (
          <div className="space-y-3 bg-[#151722] border border-neutral-800 rounded-xl p-4 text-xs">
            <div className="font-bold text-sm text-neutral-100 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              Беспроводная передача по Wi-Fi (Без извлечения карты памяти)
            </div>
            <p className="text-neutral-300 leading-relaxed">
              На New 3DS откручивать заднюю крышку каждый раз неудобно. Вы можете отправить бинарник прямо по локальной сети:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="bg-black/40 border border-neutral-800 p-3 rounded-lg space-y-2">
                <div className="font-bold text-amber-400">Вариант А: 3dslink (NetLoader)</div>
                <p className="text-neutral-400 text-[11px]">
                  1. Откройте Homebrew Launcher на 3DS.<br />
                  2. Нажмите кнопку <strong>Y</strong> (включится режим ожидания NetLoader).<br />
                  3. На компьютере в терминале devkitPro выполните:
                </p>
                <pre className="font-mono text-emerald-300 bg-neutral-900 p-2 rounded text-[11px]">
                  3dslink SmashBanana.3dsx
                </pre>
                <p className="text-neutral-400 text-[11px]">
                  Файл мгновенно загрузится в оперативную память 3DS и приложение запустится!
                </p>
              </div>

              <div className="bg-black/40 border border-neutral-800 p-3 rounded-lg space-y-2">
                <div className="font-bold text-blue-400">Вариант Б: FTPD / FileZilla</div>
                <p className="text-neutral-400 text-[11px]">
                  1. Запустите хоумбрю <strong>FTPD</strong> на вашей 3DS.<br />
                  2. На верхнем экране 3DS отобразится IP-адрес (например <code className="text-amber-300 font-mono">192.168.1.45:5000</code>).<br />
                  3. Подключитесь через любой FTP-клиент на ПК (FileZilla или Проводник Windows) и скопируйте файлы в папку <code className="text-emerald-300 font-mono">/3ds/SmashBanana/</code>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Regional Title IDs & Folders on SD card */}
      <div className="bg-[#11131a] border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-purple-400 font-bold text-sm">
          <FolderArchive className="w-5 h-5" />
          <h3>Куда приложение сохраняет моды: Региональные Title ID</h3>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          В зависимости от региона вашего картриджа или цифровой версии Super Smash Bros. for Nintendo 3DS,
          моды распаковываются в соответствующую системную директорию Luma3DS LayeredFS:
        </p>

        {/* Region Selector Chips */}
        <div className="flex flex-wrap gap-2">
          {(['usa', 'eur', 'jpn'] as const).map((reg) => (
            <button
              key={reg}
              onClick={() => {
                soundEffects.playClick();
                setSelectedRegion(reg);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                selectedRegion === reg
                  ? 'bg-purple-500 text-white shadow'
                  : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {titleIds[reg].name}
            </button>
          ))}
        </div>

        <div className="bg-[#161822] border border-neutral-800 rounded-xl p-4 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-neutral-400">
            <span>Регион: <strong className="text-white">{titleIds[selectedRegion].name}</strong></span>
            <span>Product Code: <strong className="text-amber-400">{titleIds[selectedRegion].code}</strong></span>
          </div>
          <div>
            Title ID: <strong className="text-purple-300">{titleIds[selectedRegion].id}</strong>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-neutral-400">
            Путь к модам на SD-карте:
            <div className="mt-1 p-2.5 bg-black/60 rounded border border-neutral-800 text-emerald-400 flex items-center justify-between">
              <span>{titleIds[selectedRegion].path}</span>
              <button
                onClick={() => handleCopy(titleIds[selectedRegion].path, 'path-copy')}
                className="p-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300"
              >
                {copiedKey === 'path-copy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <p className="text-[11px] text-neutral-400 font-sans mt-2">
            Внутри этой папки SmashBanana автоматически создаёт подкаталоги костюмов бойцов (например, <code className="text-neutral-300 font-mono">fighter/mario/model/body/c00/</code>), заменяя стандартные скины игры без изменения оригинального картриджа.
          </p>
        </div>
      </div>

      {/* Troubleshooting & FAQ */}
      <div className="bg-[#11131a] border border-neutral-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm">
          <HelpCircle className="w-5 h-5" />
          <h3>Частые вопросы и решение проблем (FAQ)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#161822] border border-neutral-800 rounded-xl p-4 space-y-1.5">
            <div className="font-bold text-neutral-200">Моды не появляются в игре?</div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Проверьте два момента: 1) Включен ли <code className="text-amber-300">Enable game patching</code> в меню Luma3DS (удерживайте Select при включении). 2) Совпадает ли регион вашей игры с папкой (европейская версия использует Title ID <code className="text-neutral-300">00040000000EE000</code>, американская — <code className="text-neutral-300">00040000000EDF00</code>).
            </p>
          </div>

          <div className="bg-[#161822] border border-neutral-800 rounded-xl p-4 space-y-1.5">
            <div className="font-bold text-neutral-200">Ошибка SSL / HTTPS соединения?</div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              GameBanana требует современного протокола TLS. Убедитесь, что системные дата и время на вашей 3DS выставлены точно. При сборке через devkitPro используется библиотека <code className="text-emerald-400">mbedtls</code>, которая проверяет актуальность сертификатов.
            </p>
          </div>

          <div className="bg-[#161822] border border-neutral-800 rounded-xl p-4 space-y-1.5">
            <div className="font-bold text-neutral-200">Работает ли на старой Old 3DS / 2DS?</div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              Приложение спроектировано под <strong>New 3DS / New 2DS XL</strong> с использованием 804 МГц процессора и отдельного ядра Core 1 для распаковки minizip. На старой 3DS Super Smash Bros. перезагружает систему в Extended Memory Mode, поэтому одновременная работа тяжелых модов рекомендуется именно на New 3DS.
            </p>
          </div>

          <div className="bg-[#161822] border border-neutral-800 rounded-xl p-4 space-y-1.5">
            <div className="font-bold text-neutral-200">Конфликт костюмов c00..c07?</div>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              SmashBanana включает автоматический модуль перераспределения слотов (<code className="text-purple-300">slot_manager.c</code>). Если два мода претендуют на скин Марио c00, приложение автоматически предложит переместить второй мод на свободный слот (например c02 или c05).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
