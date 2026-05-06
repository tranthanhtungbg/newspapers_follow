import { useCallback, useEffect, useRef, useState } from 'react';
import { ttsApi } from '@/lib/api';

interface UseAudioOptions {
  lang?: string;
  voice?: string;
}

export function useAudio({ lang = 'en', voice }: UseAudioOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const play = useCallback(
    async (text: string) => {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        return;
      }

      setError(null);
      const cacheKey = `${text}__${lang}__${voice ?? 'default'}`;

      try {
        let audioUrl = cacheRef.current.get(cacheKey);

        if (!audioUrl) {
          setIsLoading(true);
          const res = await ttsApi.generate(text, lang, voice);
          audioUrl = res.data.data.audioUrl as string;
          cacheRef.current.set(cacheKey, audioUrl);
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => { setIsPlaying(true); setIsLoading(false); };
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => {
          setIsPlaying(false);
          setError('Audio playback failed');
        };

        await audio.play();
      } catch {
        setError('Failed to generate audio');
        setIsLoading(false);
      }
    },
    [isPlaying, lang, voice],
  );

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return { play, stop, isPlaying, isLoading, error };
}
