import { useEffect, useMemo, useRef, useState } from 'react';

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export default function LoginVideoBackground() {
  // Videos must be served from /public to work in the browser.
  // Your folder is: <project>/Video  => public path: /Video/*
  const videos = useMemo(
    () => [
      '/Video/AI_core_transforms_farmland_202606071226 (1).mp4',
      '/Video/Farmer_examining_infected_leaf_202606071125.mp4',
      '/Video/Leaf_lesion_transforms_into_AI_202606071212.mp4',
    ],
    []
  );


  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [index, setIndex] = useState(0);

  const activeSrc = videos[index] ?? videos[0];

  useEffect(() => {
    const v = videoRef.current;

    if (!v) return;

    let cancelled = false;

    const play = async () => {
      try {
        v.muted = true;
        v.playsInline = true;
        v.loop = false; // we handle back-to-back via onEnded
        await v.play();
      } catch {
        // Autoplay may fail in some browsers; ignore and keep poster/first frame.
      }
    };


    // Ensure correct src is loaded before play
    v.load();
    play();

    return () => {
      cancelled = true;
      if (cancelled) return;
    };
  }, [activeSrc]);

  const onEnded = () => {
    setIndex((i) => {
      const next = i + 1;
      if (next >= videos.length) return 0;
      return clamp(next, 0, videos.length - 1);
    });
  };

  return (
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0" style={{ background: '#071409' }} />

      {/* Dark overlay so UI stays readable */}
      <div className="absolute inset-0" style={{ background: 'rgba(7, 20, 10, 0.35)' }} />

      <div className="absolute inset-0">
        <video
          ref={videoRef}
          key={activeSrc}
          className="absolute inset-0 w-full h-full object-cover"
          src={activeSrc}
          muted
          playsInline
          autoPlay
          preload="auto"
          onEnded={onEnded}
          // Important: ensure the element itself doesn't show any default/grey background
          style={{ backgroundColor: '#071409', display: 'block' }}
        />
      </div>
    </div>
  );
}

