import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Spinner } from './components/Spinner';
import { HistoryPanel } from './components/HistoryPanel';
import { ShareModal } from './components/ShareModal';
import { generateWebsite, refineWebsite } from './services/geminiService';
import type { UploadedImage } from './types';
import { CodeIcon, ControlsIcon, PreviewIcon, HistoryIcon } from './components/icons';

type MobileView = 'controls' | 'editor' | 'preview' | 'history';

const initialHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { font-family: 'Inter', sans-serif; }
    </style>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-50 flex items-center justify-center min-h-screen">
    <div class="text-center p-8 bg-white rounded-2xl shadow-2xl max-w-lg mx-auto">
        <h1 class="text-5xl font-bold text-slate-800 mb-4">AI Website Builder</h1>
        <p class="text-xl text-slate-600">Describe your desired website in the control panel to begin creating.</p>
    </div>
</body>
</html>
`;

const MAX_HISTORY_LENGTH = 20;

const App: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>(initialHtml);
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<MobileView>('controls');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    // Load state from URL hash if present
    const loadStateFromUrl = () => {
      try {
        const hash = window.location.hash;
        if (hash.startsWith('#project=')) {
          const encodedData = hash.substring('#project='.length);
          const decodedJson = decodeURIComponent(escape(atob(encodedData)));
          const projectData = JSON.parse(decodedJson);
  
          if (projectData.htmlContent && projectData.history) {
            setHtmlContent(projectData.htmlContent);
            setHistory(projectData.history);
          }
          // Clean the URL
          window.history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
            // Initialize history with the starting template if no project in URL
            setHistory([initialHtml]);
        }
      } catch (e) {
        console.error("Failed to load project from URL, initializing with default.", e);
        setHistory([initialHtml]);
         // Clean the URL if data is corrupt
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    };
    
    loadStateFromUrl();
  }, []);

  const addToHistory = (newHtml: string) => {
    setHistory(prev => [newHtml, ...prev].slice(0, MAX_HISTORY_LENGTH));
  };

  const handleGenerate = useCallback(async (prompt: string, image: UploadedImage | null) => {
    if (!prompt) {
      setError('Please enter a description for your website.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const generatedHtml = await generateWebsite(prompt, image);
      setHtmlContent(generatedHtml);
      addToHistory(generatedHtml);
      setActiveView('preview');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefine = useCallback(async (prompt: string, image: UploadedImage | null) => {
    if (!prompt && !image) {
        setError('Please enter a refinement prompt or upload a new image.');
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
        const refinedHtml = await refineWebsite(htmlContent, prompt, image);
        setHtmlContent(refinedHtml);
        addToHistory(refinedHtml);
        setActiveView('preview');
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  }, [htmlContent]);

  const handleDownload = useCallback(() => {
    if (!htmlContent) return;
    
    // Embed the project data into a script tag within the HTML
    const projectFileContent = `${htmlContent}
<!-- Project data for AI Website Builder -->
<script id="ai-website-builder-data" type="application/json">
${JSON.stringify({ htmlContent, history }, null, 2)}
</script>`;

    const blob = new Blob([projectFileContent], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [htmlContent, history]);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const projectDataScript = doc.getElementById('ai-website-builder-data');

      if (projectDataScript && projectDataScript.textContent) {
        try {
          const projectData = JSON.parse(projectDataScript.textContent);
          if (projectData.htmlContent && projectData.history) {
            setHtmlContent(projectData.htmlContent);
            setHistory(projectData.history);
          } else {
            // Fallback for malformed project data
            setHtmlContent(text);
            setHistory([text]);
          }
        } catch (err) {
          console.error("Could not parse project data. Loading as plain HTML.", err);
          setHtmlContent(text);
          setHistory([text]);
        }
      } else {
        // No project data found, import as plain HTML
        setHtmlContent(text);
        setHistory([text]);
      }
      setActiveView('preview');
    };
    reader.onerror = (err) => {
        console.error("Error reading file:", err);
        setError("Could not read the selected file.");
    }
    reader.readAsText(file);
    // Reset file input to allow importing the same file again
    event.target.value = '';
  };


  const handleRestoreHistory = (index: number) => {
    setHtmlContent(history[index]);
  };

  const handleDeleteHistoryItem = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearHistory = () => {
    setHistory(prev => prev.length > 0 ? [prev[prev.length - 1]] : []);
    if (history.length > 0) {
      setHtmlContent(history[history.length - 1]);
    }
  };

  const tabs = [
    { id: 'controls', label: 'Controls', icon: ControlsIcon },
    { id: 'editor', label: 'Code', icon: CodeIcon },
    { id: 'preview', label: 'Preview', icon: PreviewIcon },
    { id: 'history', label: 'History', icon: HistoryIcon },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans">
      <Header 
        onDownload={handleDownload}
        onImport={handleImport}
        onShare={() => setIsShareModalOpen(true)}
      />
      {isShareModalOpen && (
        <ShareModal 
            htmlContent={htmlContent} 
            history={history}
            onClose={() => setIsShareModalOpen(false)} 
        />
      )}
      <main className="flex-grow flex flex-col lg:grid lg:grid-cols-12 gap-4 p-4 lg:overflow-hidden">
        {isLoading && <Spinner />}

        {/* Desktop View: 3-column layout */}
        <div className="hidden lg:col-span-3 lg:flex flex-col gap-4 overflow-y-auto pr-2">
          <ControlPanel onGenerate={handleGenerate} onRefine={handleRefine} isDisabled={isLoading} />
          {error && <div className="bg-red-900/50 border border-red-700/50 text-red-300 p-3 rounded-lg text-sm">{error}</div>}
          <HistoryPanel 
            history={history}
            onRestore={handleRestoreHistory}
            onDelete={handleDeleteHistoryItem}
            onClear={handleClearHistory}
          />
        </div>
        <div className="hidden lg:col-span-4 lg:flex flex-col">
          <Editor value={htmlContent} onChange={setHtmlContent} />
        </div>
        <div className="hidden lg:col-span-5 lg:flex flex-col">
          <Preview content={htmlContent} />
        </div>

        {/* Mobile View: Tabbed interface */}
        <div className="lg:hidden flex flex-col flex-grow min-h-0">
          <div className="flex-shrink-0 border-b border-slate-700/50">
            <nav className="flex -mb-px" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as MobileView)}
                  className={`
                    ${activeView === tab.id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'}
                    flex-1 flex justify-center items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-t-md
                  `}
                  aria-current={activeView === tab.id ? 'page' : undefined}
                >
                  <tab.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex-grow overflow-y-auto">
            {activeView === 'controls' && (
              <div className="p-4">
                 <ControlPanel onGenerate={handleGenerate} onRefine={handleRefine} isDisabled={isLoading} />
                 {error && <div className="bg-red-900/50 border border-red-700/50 text-red-300 p-3 rounded-lg text-sm mt-4">{error}</div>}
              </div>
            )}
            {activeView === 'editor' && <div className="h-full"><Editor value={htmlContent} onChange={setHtmlContent} /></div>}
            {activeView === 'preview' && <div className="h-full"><Preview content={htmlContent} /></div>}
            {activeView === 'history' && (
                <div className="p-4">
                    <HistoryPanel 
                        history={history}
                        onRestore={handleRestoreHistory}
                        onDelete={handleDeleteHistoryItem}
                        onClear={handleClearHistory}
                    />
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
