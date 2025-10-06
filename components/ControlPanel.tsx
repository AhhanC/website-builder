import React, { useState } from 'react';
import type { UploadedImage } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { GenerateIcon, RefineIcon, UploadIcon, XIcon } from './icons';

interface ControlPanelProps {
  onGenerate: (prompt: string, image: UploadedImage | null) => void;
  onRefine: (prompt: string, image: UploadedImage | null) => void;
  isDisabled: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ onGenerate, onRefine, isDisabled }) => {
  const [initialPrompt, setInitialPrompt] = useState<string>('');
  const [refinementPrompt, setRefinementPrompt] = useState<string>('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  }

  const handleAction = async (action: 'generate' | 'refine') => {
    let uploadedImage: UploadedImage | null = null;
    if (image) {
      const { base64, type } = await fileToBase64(image);
      uploadedImage = { base64, type };
    }
    
    if (action === 'generate') {
      onGenerate(initialPrompt, uploadedImage);
    } else {
      onRefine(refinementPrompt, uploadedImage);
    }
    setRefinementPrompt('');
    clearImage();
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-5 flex flex-col gap-8">
      {/* Initial Generation */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-cyan-400">1. Create Your Website</h2>
          <p className="text-sm text-slate-400">Describe the website you want to build. Be as specific as possible.</p>
        </div>
        <textarea
          value={initialPrompt}
          onChange={(e) => setInitialPrompt(e.target.value)}
          placeholder="e.g., A modern portfolio for a photographer named Jane Doe, featuring a dark theme and a gallery section."
          className="w-full h-32 p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:outline-none transition-all duration-200 text-slate-200 resize-none text-sm"
          disabled={isDisabled}
        />
        <button
          onClick={() => handleAction('generate')}
          disabled={isDisabled || !initialPrompt}
          className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-cyan-600/20 hover:shadow-xl hover:shadow-cyan-600/30"
        >
          <GenerateIcon className="w-5 h-5" />
          Generate
        </button>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-fuchsia-400">Optional: Add an Image</h2>
        <label htmlFor="file-upload" className="w-full flex items-center justify-center gap-2 cursor-pointer bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200">
          <UploadIcon className="w-5 h-5" />
          {image ? "Change Image" : "Upload Image"}
        </label>
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isDisabled}/>
        {imagePreview && (
          <div className="relative mt-2 group">
            <img src={imagePreview} alt="Preview" className="w-full rounded-lg object-cover max-h-40 border border-slate-700"/>
            <button onClick={clearImage} className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 rounded-full p-1.5 transition-all duration-200 opacity-50 group-hover:opacity-100 transform scale-90 group-hover:scale-100">
              <XIcon className="w-4 h-4 text-white"/>
            </button>
          </div>
        )}
      </div>

      {/* Refinement */}
      <div className="space-y-4">
        <div className="space-y-1">
            <h2 className="text-base font-semibold text-amber-400">2. Refine & Modify</h2>
            <p className="text-sm text-slate-400">Request changes to the current website, or add your image to it.</p>
        </div>
        <textarea
          value={refinementPrompt}
          onChange={(e) => setRefinementPrompt(e.target.value)}
          placeholder="e.g., Change the color scheme to light mode. Add the uploaded photo to the hero section."
          className="w-full h-32 p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-amber-500/50 focus:outline-none transition-all duration-200 text-slate-200 resize-none text-sm"
          disabled={isDisabled}
        />
        <button
          onClick={() => handleAction('refine')}
          disabled={isDisabled || (!refinementPrompt && !image)}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-amber-600/20 hover:shadow-xl hover:shadow-amber-600/30"
        >
          <RefineIcon className="w-5 h-5" />
          Refine
        </button>
      </div>
    </div>
  );
};