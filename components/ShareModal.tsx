import React, { useState } from 'react';
import { CopyIcon, ExternalLinkIcon, RefineIcon, XIcon } from './icons';

interface ShareModalProps {
  htmlContent: string;
  history: string[];
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ htmlContent, history, onClose }) => {
  const [copiedLink, setCopiedLink] = useState<'view' | 'edit' | null>(null);

  const handleCopy = (type: 'view' | 'edit') => {
    let urlToCopy = '';
    if (type === 'view') {
      urlToCopy = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
    } else {
      const state = { htmlContent, history };
      const jsonState = JSON.stringify(state);
      // Use a robust base64 encoding for unicode characters
      const encodedState = btoa(unescape(encodeURIComponent(jsonState)));
      urlToCopy = `${window.location.origin}${window.location.pathname}#project=${encodedState}`;
    }
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-lg w-full m-4 shadow-2xl shadow-black/30 transform transition-all duration-300 scale-95 animate-in fade-in-0 zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">Share Your Website</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors rounded-full p-1.5">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* View-only Link */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
                <ExternalLinkIcon className="w-5 h-5 text-cyan-400"/>
                <h3 className="text-lg font-semibold text-slate-200">View-only Link</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Share this link for a live preview. The recipient cannot see the code or edit the project. Opens directly in the browser.
            </p>
            <button
              onClick={() => handleCopy('view')}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-cyan-600/20 hover:shadow-xl hover:shadow-cyan-600/30"
            >
              <CopyIcon className="w-5 h-5" />
              {copiedLink === 'view' ? 'Link Copied!' : 'Copy View Link'}
            </button>
          </div>

          {/* Editable Link */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
                <RefineIcon className="w-5 h-5 text-amber-400"/>
                <h3 className="text-lg font-semibold text-slate-200">Editable Project Link</h3>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Share this link to allow others to open a complete, editable copy of your project, including its history.
            </p>
            <button
              onClick={() => handleCopy('edit')}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30"
            >
              <CopyIcon className="w-5 h-5" />
              {copiedLink === 'edit' ? 'Project Link Copied!' : 'Copy Edit Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
