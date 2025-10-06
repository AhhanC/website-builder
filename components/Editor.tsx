import React, { useState } from 'react';
import { CopyIcon } from './icons';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-300">HTML Code</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-semibold disabled:cursor-not-allowed"
          disabled={!value}
        >
          <CopyIcon className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-grow w-full p-4 bg-transparent text-slate-400 font-mono text-xs resize-none focus:outline-none"
        spellCheck="false"
      />
    </div>
  );
};