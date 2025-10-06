import React from 'react';
import { HistoryIcon, RestoreIcon, XIcon } from './icons';

interface HistoryPanelProps {
  history: string[];
  onRestore: (index: number) => void;
  onDelete: (index: number) => void;
  onClear: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRestore, onDelete, onClear }) => {
  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl flex flex-col">
      <div className="px-5 py-4 border-b border-slate-700/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-slate-400"/>
            <h3 className="text-base font-semibold text-slate-300">History</h3>
        </div>
        <button
          onClick={onClear}
          disabled={history.length <= 1}
          className="text-xs font-semibold text-slate-400 hover:text-red-400 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          Clear All
        </button>
      </div>
      <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
        {history.length > 0 ? (
          history.map((html, index) => (
            <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 group relative">
              <div className="flex justify-between items-start">
                  <div className="w-2/3 aspect-[4/3] bg-white rounded overflow-hidden transform scale-100">
                     <iframe
                        srcDoc={html}
                        title={`History Preview ${index}`}
                        className="w-full h-full border-0"
                        style={{ transform: 'scale(0.3)', transformOrigin: '0 0', width: '333.33%', height: '333.33%' }}
                        sandbox="allow-scripts"
                     />
                  </div>
                  <div className="flex flex-col items-end space-y-2 pl-2">
                    <button
                        onClick={() => onRestore(index)}
                        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600/50 hover:bg-emerald-600/80 text-emerald-200 px-2 py-1 rounded transition-colors"
                    >
                        <RestoreIcon className="w-3.5 h-3.5"/>
                        Restore
                    </button>
                    {index !== history.length - 1 && ( // Don't allow deleting the initial entry
                         <button
                            onClick={() => onDelete(index)}
                            className="absolute top-1 right-1 bg-slate-900/50 hover:bg-red-600/80 text-red-300 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete history item"
                        >
                            <XIcon className="w-3 h-3"/>
                        </button>
                    )}
                  </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Version {history.length - index}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">Your generated websites will appear here.</p>
        )}
      </div>
    </div>
  );
};
