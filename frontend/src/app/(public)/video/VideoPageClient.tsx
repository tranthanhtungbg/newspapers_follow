"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { readerApi, libraryApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import YouTube, { YouTubeProps, YouTubePlayer } from "react-youtube";

interface SubtitleLine {
  start: number;
  duration: number;
  text: string;
  translation: string;
}

export function VideoPageClient() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [subtitleOffset, setSubtitleOffset] = useState(0); // Offset in seconds
  
  const searchParams = useSearchParams();
  const activeSubRef = useRef<HTMLDivElement>(null);
  const fetchedUrlRef = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: (ytUrl: string) => readerApi.getYoutubeSubtitles(ytUrl),
    onSuccess: (res, ytUrl) => {
      const data = res.data.data;
      setVideoId(data.videoId);
      setVideoTitle(data.title || "YouTube Video");
      setSubtitles(data.subtitles);
      setIsTranslating(false); // Reset translation flag for new video

      // Auto-save YouTube to Library
      libraryApi.create({
        url: ytUrl,
        title: data.title || "YouTube Video",
        type: 'youtube',
      }).catch(() => {});
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) mutation.mutate(url);
  };

  // Auto-load from URL param
  useEffect(() => {
    const urlParam = searchParams.get("url");
    if (urlParam && urlParam !== fetchedUrlRef.current) {
      fetchedUrlRef.current = urlParam;
      setUrl(urlParam);
      mutation.mutate(urlParam);
    }
  }, [searchParams, mutation]);

  // Progressive batch translation
  useEffect(() => {
    if (!subtitles.length || !videoId || isTranslating) return;

    // Find the first untranslated subtitle
    const untranslatedIdx = subtitles.findIndex(s => !s.translation);
    if (untranslatedIdx === -1) {
      // Check if we need to save (only if we actually fetched from fresh, 
      // but to be safe we can always save, backend upserts it)
      readerApi.saveYoutubeSubtitles(videoId, videoTitle, 'vi', subtitles).catch(console.error);
      return;
    }

    // Grab next batch of 20 to translate (smaller batch = faster UI feedback)
    const batchSize = 20;
    const batchIndices: number[] = [];
    for (let i = untranslatedIdx; i < subtitles.length && batchIndices.length < batchSize; i++) {
      if (!subtitles[i].translation) batchIndices.push(i);
    }

    const translateBatch = async () => {
      setIsTranslating(true);
      try {
        const texts = batchIndices.map(i => subtitles[i].text);
        const res = await readerApi.translateYoutubeBatch(texts, 'vi');
        const translatedData = res.data.data as {en: string, vi: string}[];

        setSubtitles(prev => {
          const next = [...prev];
          batchIndices.forEach((idx, i) => {
            const data = translatedData[i];
            next[idx] = { 
              ...next[idx], 
              text: data?.en || texts[i],
              translation: data?.vi || '(Failed to translate)' 
            };
          });
          return next;
        });
      } catch (err) {
        console.error('Batch translation error:', err);
      } finally {
        setIsTranslating(false);
      }
    };

    translateBatch();
  }, [subtitles, videoId, isTranslating, videoTitle]);

  // Sync video time
  useEffect(() => {
    if (!player || !videoId) return;
    let lastSavedSecond = 0;
    const interval = setInterval(async () => {
      const time = await player.getCurrentTime();
      setCurrentTime(time);
      
      // Save progress to local storage once every second
      const currentSecond = Math.floor(time);
      if (currentSecond !== lastSavedSecond && currentSecond > 0) {
        localStorage.setItem(`yt_progress_${videoId}`, time.toString());
        lastSavedSecond = currentSecond;
      }
    }, 100); // 100ms for tighter sync
    return () => clearInterval(interval);
  }, [player, videoId]);

  // Scroll active subtitle into view
  useEffect(() => {
    if (activeSubRef.current) {
      activeSubRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentTime]);

  const onReady: YouTubeProps["onReady"] = (event) => {
    setPlayer(event.target);
    
    // Resume video from saved progress
    if (videoId) {
      const savedProgress = localStorage.getItem(`yt_progress_${videoId}`);
      if (savedProgress) {
        const time = parseFloat(savedProgress);
        if (time > 0) {
          event.target.seekTo(time);
        }
      }
    }
  };

  const seekTo = (seconds: number) => {
    if (player) {
      player.seekTo(seconds);
      player.playVideo();
    }
  };

  const repeatCurrentLine = () => {
    if (!player) return;
    const effectiveTime = currentTime - subtitleOffset;
    const activeSub = subtitles.find((sub, idx) => {
      const nextSub = subtitles[idx + 1];
      const endTime = nextSub ? nextSub.start : sub.start + Math.max(sub.duration, 2);
      return effectiveTime >= sub.start && effectiveTime < endTime;
    });
    if (activeSub) {
      seekTo(activeSub.start + subtitleOffset);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background">
      {/* Top Bar for Input */}
      <div className="p-4 border-b shrink-0 flex gap-2 max-w-3xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <Input 
            placeholder="Paste YouTube URL..." 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Loading..." : "Load Video"}
          </Button>
        </form>
      </div>

      {/* Main Content Area */}
      {videoId ? (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: Video Player Area */}
          <div className="flex-1 flex flex-col bg-black">
            <div className="flex-1 w-full relative">
              <YouTube
                videoId={videoId}
                opts={{ width: "100%", height: "100%", playerVars: { autoplay: 1 } }}
                onReady={onReady}
                className="absolute inset-0 w-full h-full"
                iframeClassName="w-full h-full"
              />
            </div>
            
            {/* Control Bar (like StudyPhim bottom bar) */}
            <div className="h-14 bg-card border-t shrink-0 flex items-center justify-between px-4 overflow-x-auto">
               <Button variant="secondary" onClick={repeatCurrentLine} className="gap-2 shrink-0">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                 </svg>
                 Repeat Line
               </Button>
               
               <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0 ml-4">
                 <span className="hidden sm:inline">Sync Offset:</span>
                 <Button variant="outline" size="sm" onClick={() => setSubtitleOffset(prev => prev - 0.5)}>-0.5s</Button>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="w-12 text-center font-medium px-0" 
                   onClick={() => setSubtitleOffset(0)}
                   title="Click to reset to 0s"
                 >
                   {subtitleOffset > 0 ? `+${subtitleOffset}` : subtitleOffset}s
                 </Button>
                 <Button variant="outline" size="sm" onClick={() => setSubtitleOffset(prev => prev + 0.5)}>+0.5s</Button>
               </div>
            </div>
          </div>

          {/* Right: Subtitles Panel */}
          <div className="w-full md:w-96 border-l flex flex-col overflow-y-auto bg-card">
             {subtitles.map((sub, idx) => {
               const nextSub = subtitles[idx + 1];
               const endTime = nextSub ? nextSub.start : sub.start + Math.max(sub.duration, 2);
               const effectiveTime = currentTime - subtitleOffset;
               const isActive = effectiveTime >= sub.start && effectiveTime < endTime;
               
               return (
                 <div 
                   key={idx}
                   ref={isActive ? activeSubRef : null}
                   onClick={() => seekTo(sub.start + subtitleOffset)}
                   className={cn(
                     "p-4 border-b cursor-pointer transition-colors group",
                     isActive ? "bg-orange-500 text-white" : "hover:bg-muted"
                   )}
                 >
                   <p className={cn("text-[15px] font-medium leading-snug mb-1", isActive ? "text-white" : "text-foreground")}>
                     {sub.text}
                   </p>
                   {sub.translation && (
                     <p className={cn("text-sm", isActive ? "text-orange-100" : "text-muted-foreground italic")}>
                       {sub.translation}
                     </p>
                   )}
                 </div>
               )
             })}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-8 text-center">
          Paste a YouTube link above to start learning with dual subtitles.
        </div>
      )}
    </div>
  );
}
