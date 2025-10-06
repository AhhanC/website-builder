import React, { useState, useEffect } from 'react';
import { GenerateIcon } from './icons';

const messages = [
  "Warming up the AI architect...",
  "Drafting digital blueprints...",
  "Assembling HTML components...",
  "Applying stylish Tailwind classes...",
  "Polishing the final design...",
  "Almost ready to launch!",
];

export const Spinner: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(messages[0]);

  useEffect(() => {
    let index = 0;
    const intervalId = setInterval(() => {
      index = (index + 1) % messages.length;
      setCurrentMessage(messages[index]);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-opacity duration-300">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-24 w-24 bg-cyan-500/20 rounded-full animate-ping"></div>
        <GenerateIcon className="w-12 h-12 text-cyan-400 animate-spin" style={{ animationDuration: '2s' }}/>
      </div>
      <p className="mt-6 text-lg text-slate-200 transition-all duration-500">{currentMessage}</p>
    </div>
  );
};