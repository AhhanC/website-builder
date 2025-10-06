import React from 'react';
import { CodeIcon, DownloadIcon, ImportIcon, ShareIcon } from './icons';

interface HeaderProps {
  onDownload: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onShare: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onDownload, onImport, onShare }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-700/50 p-4 flex items-center justify-between shadow-lg shadow-black/20 z-10">
      <div className="flex items-center gap-3">
        <CodeIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-xl font-semibold text-slate-100 tracking-tight">AI Website Builder</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <input type="file" id="import-file" className="hidden" onChange={onImport} accept=".html" />
        <label
            htmlFor="import-file"
            className="flex items-center justify-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 shadow-lg shadow-slate-800/20 hover:shadow-xl hover:shadow-slate-800/30"
        >
            <ImportIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Import</span>
        </label>
        <button
            onClick={onShare}
            className="flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-fuchsia-600/20 hover:shadow-xl hover:shadow-fuchsia-600/30"
        >
            <ShareIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Share</span>
        </button>
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-cyan-600/20 hover:shadow-xl hover:shadow-cyan-600/30"
        >
          <DownloadIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>
    </header>
  );
};
