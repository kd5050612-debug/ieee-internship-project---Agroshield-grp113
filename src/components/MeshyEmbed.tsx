import { useEffect, useMemo, useState } from 'react';

type Props = {
  modelId: string;
  className?: string;
};

/**
 * Meshy embeds sometimes fail due to browser iframe restrictions.
 * We render a lightweight fallback overlay that opens the Meshy page directly.
 */
export default function MeshyEmbed({ modelId, className }: Props) {
  const src = useMemo(() => {
    // Keep params minimal; meshy provides the best view for the page itself.
    return `https://www.meshy.ai/s/${encodeURIComponent(modelId)}?embed=1`;
  }, [modelId]);

  const [failed, setFailed] = useState(false);
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    setAttempted(true);
    setFailed(false);
  }, [src]);

  return (
    <div className={className} style={{ position: 'relative' }}>
      <iframe
        title="Meshy 3D model"
        src={src}
        style={{ border: 'none', width: '100%', height: '100%', display: 'block' }}
        allow="fullscreen"
        loading="lazy"
        onLoad={() => {
          // If meshy blocks rendering, some browsers still fire onLoad.
          // We keep fallback only after an explicit error signal.
        }}
        onError={() => setFailed(true)}
      />

      {/* Fallback overlay: user can still open the model directly */}
      {failed || !attempted ? null : null}

      {failed && (
        <div
          className="absolute inset-0 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <div className="card-dark rounded-xl p-4 w-full">
            <p className="text-xs font-mono text-neon-green/80 uppercase tracking-widest">Model blocked</p>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">
              Your browser prevented the 3D embed from loading. Use the button below to open the model in a new tab.
            </p>
            <a
              href={`https://www.meshy.ai/s/${modelId}`}
              target="_blank"
              rel="noreferrer"
              className="neon-btn inline-flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-lg text-sm"
              style={{ width: '100%' }}
            >
              Open Meshy Model
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

