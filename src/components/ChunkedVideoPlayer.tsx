import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface ChunkedVideoPlayerProps {
  videoUrl?: string | null;
  videoChunkUrls?: string[];
  isChunked?: boolean;
  className?: string;
}

export function ChunkedVideoPlayer({ 
  videoUrl, 
  videoChunkUrls = [], 
  isChunked = false,
  className = ""
}: ChunkedVideoPlayerProps) {
  const [combinedBlobUrl, setCombinedBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  // Handle chunked video - combine chunks into a single blob
  useEffect(() => {
    if (!isChunked || !videoChunkUrls || videoChunkUrls.length === 0) {
      return;
    }

    let cancelled = false;

    const combineChunks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Download all chunks in parallel
        const chunkPromises = videoChunkUrls.map(async (url) => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to fetch chunk: ${response.status}`);
          }
          return response.blob();
        });

        const blobs = await Promise.all(chunkPromises);

        if (cancelled) return;

        // Combine all chunks into a single blob
        const combinedBlob = new Blob(blobs, { type: "video/webm" });
        
        // Revoke previous blob URL if exists
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
        }
        
        // Create new blob URL
        const newBlobUrl = URL.createObjectURL(combinedBlob);
        blobUrlRef.current = newBlobUrl;
        setCombinedBlobUrl(newBlobUrl);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to combine video chunks:", err);
          setError("Failed to load video");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    combineChunks();

    return () => {
      cancelled = true;
    };
  }, [isChunked, videoChunkUrls]);

  // For single file videos, just use the URL directly
  if (!isChunked && videoUrl) {
    return (
      <video
        src={videoUrl}
        controls
        className={`w-full rounded-xl bg-slate-900 aspect-video shadow-md ${className}`}
      />
    );
  }

  // For chunked videos
  if (isChunked) {
    if (isLoading) {
      return (
        <div className={`w-full rounded-xl bg-slate-900 aspect-video shadow-md flex items-center justify-center ${className}`}>
          <div className="flex flex-col items-center gap-2 text-white/70">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Loading video...</span>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`w-full rounded-xl bg-slate-900 aspect-video shadow-md flex items-center justify-center ${className}`}>
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      );
    }

    if (combinedBlobUrl) {
      return (
        <video
          src={combinedBlobUrl}
          controls
          className={`w-full rounded-xl bg-slate-900 aspect-video shadow-md ${className}`}
        />
      );
    }
  }

  // No video available
  return (
    <div className={`w-full rounded-xl bg-slate-900 aspect-video shadow-md flex items-center justify-center ${className}`}>
      <span className="text-slate-400 text-sm">No video available</span>
    </div>
  );
}





