import { useCallback, useEffect, useState, useRef } from 'react';
import { useUiStore } from '@/stores/ui.store';

interface UseAudioOptions {
  lang?: string;
  voice?: string;
}

export function useAudio({ lang = 'en', voice }: UseAudioOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { flashcardVoice, flashcardRate } = useUiStore();
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const play = useCallback(
    async (text: string) => {
      if (!('speechSynthesis' in window)) {
        setError('Your browser does not support text-to-speech.');
        return;
      }

      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        return;
      }

      setError(null);
      setIsLoading(true);

      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = flashcardRate;
        
        if (flashcardVoice) {
          const voice = voicesRef.current.find(v => v.name === flashcardVoice);
          if (voice) utterance.voice = voice;
        }
        
        utterance.onstart = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };
        
        utterance.onend = () => setIsPlaying(false);
        
        utterance.onerror = (e) => {
          console.error('SpeechSynthesis error:', e);
          setIsPlaying(false);
          setError('Audio playback failed');
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error(err);
        setError('Failed to generate audio');
        setIsLoading(false);
      }
    },
    [isPlaying, lang, flashcardRate, flashcardVoice],
  );

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => () => { stop(); }, [stop]);

  return { play, stop, isPlaying, isLoading, error };
}
