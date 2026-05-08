"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PlayIcon, PauseIcon, SquareIcon, Settings2Icon, SkipBackIcon, SkipForwardIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  htmlContent: string;
  lang?: string;
}

// Add TypeScript support for CSS Custom Highlight API
declare global {
  interface CSS {
    highlights?: {
      set(name: string, highlight: any): void;
      delete(name: string): void;
      clear(): void;
    };
  }
  var Highlight: any;
}

export function TtsPlayer({ htmlContent, lang = 'en' }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [rate, setRate] = useState<number>(0.9);
  const [showSettings, setShowSettings] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const chunksRef = useRef<{ text: string; element: HTMLElement; startIndex: number; length: number }[]>([]);
  const chunkIndexRef = useRef(0);
  
  // Refs for dynamic settings without recreating callbacks
  const rateRef = useRef(rate);
  const voiceRef = useRef(selectedVoice);
  const voicesRef = useRef(voices);
  
  useEffect(() => { rateRef.current = rate; }, [rate]);
  useEffect(() => { voiceRef.current = selectedVoice; }, [selectedVoice]);
  useEffect(() => { voicesRef.current = voices; }, [voices]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      let availableVoices = window.speechSynthesis.getVoices();
      // Filter voices by lang if possible, or just keep english
      if (lang.startsWith('en')) {
        availableVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      }
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        // Prefer Google US English or Microsoft Zira/David
        const defaultVoice = availableVoices.find(v => v.name.includes('Google US')) || availableVoices[0];
        setSelectedVoice(defaultVoice.name);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [lang, selectedVoice]);

  const clearHighlight = () => {
    if (typeof CSS !== 'undefined' && CSS.highlights) {
      CSS.highlights.delete('tts-highlight');
    }
    chunksRef.current.forEach(chunk => {
      chunk.element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/40', 'rounded', 'transition-colors', 'duration-300');
    });
  };

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    chunkIndexRef.current = chunksRef.current.length; // Stop chunk loop
    clearHighlight();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const speakNextChunk = useCallback(() => {
    if (chunkIndexRef.current >= chunksRef.current.length) {
      clearHighlight();
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }

    clearHighlight();
    const currentChunk = chunksRef.current[chunkIndexRef.current];
    const { text, element, startIndex, length } = currentChunk;

    // Highlight using CSS Custom Highlight API if available
    if (typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined') {
      const treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
      let charCount = 0;
      let startNode: Node | null = null;
      let startOffset = 0;
      let endNode: Node | null = null;
      let endOffset = 0;

      let node;
      while ((node = treeWalker.nextNode())) {
        const nodeLength = node.textContent?.length || 0;
        if (!startNode && charCount + nodeLength > startIndex) {
          startNode = node;
          startOffset = startIndex - charCount;
        }
        if (startNode && charCount + nodeLength >= startIndex + length) {
          endNode = node;
          endOffset = startIndex + length - charCount;
          break;
        }
        charCount += nodeLength;
      }

      if (startNode && endNode) {
        const range = new Range();
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        const highlight = new Highlight(range);
        CSS.highlights.set('tts-highlight', highlight);
      } else {
        // Fallback if range fails
        element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/40', 'rounded', 'transition-colors', 'duration-300');
      }
    } else {
      // Fallback for unsupported browsers
      element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/40', 'rounded', 'transition-colors', 'duration-300');
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rateRef.current;
    
    if (voiceRef.current) {
      const voice = voicesRef.current.find(v => v.name === voiceRef.current);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utterance.onend = () => {
      chunkIndexRef.current += 1;
      speakNextChunk();
    };
    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      console.error("TTS Error", e);
      clearHighlight();
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [lang]);

  const play = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();
    clearHighlight();

    setTimeout(() => {
      const container = document.getElementById('reader-content');
      if (!container) return;

      // Extract all text-containing nodes
      const elements = Array.from(container.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6')) as HTMLElement[];
      const chunks: typeof chunksRef.current = [];

      elements.forEach(el => {
        const elText = el.textContent || '';
        if (!elText.trim()) return;

        // Split by sentence and phrase punctuation (comma, colon, semicolon)
        const regex = /[^\.!\?,;:\n]+[\.!\?,;:\n]+|\s*[^\.!\?,;:\n]+$/g;
        let match;
        while ((match = regex.exec(elText)) !== null) {
          const sentence = match[0];
          const trimmed = sentence.trim();
          if (trimmed.length > 0) {
            chunks.push({
              text: trimmed,
              element: el,
              startIndex: match.index + sentence.indexOf(trimmed),
              length: trimmed.length
            });
          }
        }
      });

      if (chunks.length === 0) return;

      chunksRef.current = chunks;
      chunkIndexRef.current = 0;
      
      speakNextChunk();
    }, 100);
  }, [isPaused, speakNextChunk]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
  }, []);

  const nextChunk = useCallback(() => {
    if (chunksRef.current.length === 0) return;
    window.speechSynthesis.cancel();
    if (chunkIndexRef.current < chunksRef.current.length - 1) {
      chunkIndexRef.current += 1;
    }
    speakNextChunk();
  }, [speakNextChunk]);

  const prevChunk = useCallback(() => {
    if (chunksRef.current.length === 0) return;
    window.speechSynthesis.cancel();
    if (chunkIndexRef.current > 0) {
      chunkIndexRef.current -= 1;
    }
    speakNextChunk();
  }, [speakNextChunk]);

  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  if (!htmlContent) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        ::highlight(tts-highlight) {
          background-color: rgb(254 240 138);
          color: black;
        }
        @media (prefers-color-scheme: dark) {
          ::highlight(tts-highlight) {
            background-color: rgba(161, 98, 7, 0.5);
            color: white;
          }
        }
      `}} />
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-xl rounded-xl p-4 w-72 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Voice</label>
            <select 
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full text-sm rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2"
            >
              {voices.map(v => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex justify-between">
              <span>Speed</span>
              <span className="text-blue-500 font-bold">{rate.toFixed(1)}x</span>
            </label>
            <input 
              type="range" 
              min="0.5" max="2.0" step="0.1" 
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 shadow-xl border dark:border-gray-800 rounded-full px-4 py-2">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={cn("p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", showSettings && "bg-gray-100 dark:bg-gray-800 text-blue-600")}
          title="TTS Settings"
        >
          <Settings2Icon className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
        <button 
          onClick={prevChunk}
          disabled={!isPlaying && !isPaused}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
          title="Previous Sentence"
        >
          <SkipBackIcon className="w-5 h-5 fill-current" />
        </button>

        {isPlaying ? (
          <button 
            onClick={pause}
            className="p-2 rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
            title="Pause Reading"
          >
            <PauseIcon className="w-5 h-5 fill-current" />
          </button>
        ) : (
          <button 
            onClick={play}
            className="p-2 rounded-full text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors pl-2.5"
            title="Read Aloud"
          >
            <PlayIcon className="w-5 h-5 fill-current" />
          </button>
        )}

        <button 
          onClick={nextChunk}
          disabled={!isPlaying && !isPaused}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors disabled:opacity-30"
          title="Next Sentence"
        >
          <SkipForwardIcon className="w-5 h-5 fill-current" />
        </button>
        <button 
          onClick={stop}
          disabled={!isPlaying && !isPaused}
          className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-30"
          title="Stop"
        >
          <SquareIcon className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
    </>
  );
}
