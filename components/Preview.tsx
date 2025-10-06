import React from 'react';
import { ExternalLinkIcon } from './icons';

interface PreviewProps {
  content: string;
}

export const Preview: React.FC<PreviewProps> = ({ content }) => {

  const handleOpenInNewTab = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700/50 rounded-xl overflow-hidden">
      <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-300">Live Preview</h3>
        <button
          onClick={handleOpenInNewTab}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-semibold disabled:cursor-not-allowed"
          disabled={!content}
        >
          <ExternalLinkIcon className="w-4 h-4" />
          Open in new tab
        </button>
      </div>
      <iframe
        srcDoc={content}
        title="Website Preview"
        className="w-full h-full flex-grow bg-white"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};