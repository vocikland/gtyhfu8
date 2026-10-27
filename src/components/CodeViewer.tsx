/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProjectFile } from '../utils/projectStructure.ts';
import { Copy, Check, FileCode, Terminal, Download, FileText, Settings, Layers } from 'lucide-react';

interface CodeViewerProps {
  files: ProjectFile[];
  selectedFile: ProjectFile;
  onSelectFile: (file: ProjectFile) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  files,
  selectedFile,
  onSelectFile,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: ProjectFile['category']) => {
    switch (category) {
      case 'build':
        return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
      case 'config':
        return <Settings className="w-3.5 h-3.5 text-blue-400" />;
      case 'include':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'source':
        return <FileCode className="w-3.5 h-3.5 text-emerald-400" />;
      case 'doc':
      default:
        return <FileText className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  const lineCount = selectedFile.content.split('\n').length;

  return (
    <div className="flex flex-col lg:flex-row bg-[#11131a] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl h-[650px]">
      {/* File Tree Explorer (Left sidebar) */}
      <div className="w-full lg:w-64 bg-[#0d0f14] border-r border-neutral-800 flex flex-col shrink-0">
        <div className="p-3 border-b border-neutral-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Project Files (Step 1)</span>
          </div>
          <span className="text-[10px] bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded font-mono">
            {files.length} files
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {files.map((file) => {
            const isSelected = file.path === selectedFile.path;
            return (
              <button
                key={file.path}
                onClick={() => onSelectFile(file)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                  isSelected
                    ? 'bg-amber-400/10 text-amber-300 font-medium border border-amber-400/30'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 border border-transparent'
                }`}
              >
                {getCategoryIcon(file.category)}
                <span className="truncate font-mono">{file.path}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-neutral-800 text-[11px] text-neutral-500 bg-[#0a0b0f]">
          Target: <span className="text-neutral-300 font-mono">devkitARM / libctru</span>
        </div>
      </div>

      {/* Code Display Area (Right pane) */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0e1017]">
        {/* Code Header Bar */}
        <div className="px-4 py-2.5 bg-[#14161f] border-b border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            {getCategoryIcon(selectedFile.category)}
            <span className="font-mono text-xs font-semibold text-neutral-200 truncate">
              {selectedFile.path}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">
              ({lineCount} lines)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              title="Download file"
              className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* File Description Tag */}
        <div className="px-4 py-1.5 bg-[#10121a] border-b border-neutral-800/60 text-[11px] text-neutral-400">
          {selectedFile.description}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed select-text text-slate-300 bg-[#0a0c12]">
          <pre className="whitespace-pre">
            {selectedFile.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
