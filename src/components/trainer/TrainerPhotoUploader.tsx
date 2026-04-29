// ─────────────────────────────────────────────
//  Trainer — upload their own progress photos
//  Reuses /api/photos/upload with no clientId
// ─────────────────────────────────────────────
'use client';

import { useRef, useState } from 'react';
import LiquidGlassButton from '@/components/ui/LiquidGlassButton';

interface Photos {
  before:     string | null;
  after:      string | null;
  beforeDate: string | null;
  afterDate:  string | null;
}

export default function TrainerPhotoUploader({ photos: initial }: { photos: Photos }) {
  const [photos,    setPhotos]    = useState<Photos>(initial);
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null);
  const [error,     setError]     = useState('');
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef  = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File, type: 'before' | 'after') => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('File too large — max 10MB'); return; }
    setUploading(type);
    setError('');

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // No clientId — uploads to trainer's own profile
    const res  = await fetch('/api/photos/upload', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ image: base64, type }),
    });
    const data = await res.json();

    if (data.url) {
      setPhotos(prev => ({
        ...prev,
        [type === 'before' ? 'before' : 'after']:         data.url,
        [type === 'before' ? 'beforeDate' : 'afterDate']: new Date().toISOString(),
      }));
    } else {
      setError(data.error ?? 'Upload failed');
    }
    setUploading(null);
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <div>
      {error && (
        <div style={{
          background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
          borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
          color: '#fca5a5', fontSize: '0.85rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
        {(['before', 'after'] as const).map(type => {
          const url        = photos[type];
          const date       = formatDate(type === 'before' ? photos.beforeDate : photos.afterDate);
          const isUploading = uploading === type;
          const accent     = type === 'before' ? '#a855f7' : '#00ffc8';
          const label      = type === 'before' ? 'BEFORE'  : 'AFTER';

          return (
            <div key={type}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: accent, letterSpacing: '0.12em' }}>
                  {label} PHOTO
                </span>
                {date && <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,.3)' }}>{date}</span>}
              </div>

              <div
                onClick={() => !isUploading && (type === 'before' ? beforeRef : afterRef).current?.click()}
                style={{
                  width: '100%', aspectRatio: '2/3', borderRadius: '12px',
                  border: `2px dashed ${accent}44`, background: url ? 'transparent' : `${accent}08`,
                  overflow: 'hidden', cursor: isUploading ? 'wait' : 'pointer',
                  position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = `${accent}88`)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = `${accent}44`)}
              >
                {url ? (
                  <>
                    <img src={url} alt={`${label} photo`}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.2s',
                      fontSize: '0.8rem', fontWeight: 700, color: '#fff', letterSpacing: '0.1em',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                    >
                      📷 REPLACE PHOTO
                    </div>
                  </>
                ) : isUploading ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '32px', height: '32px', margin: '0 auto 8px',
                      border: `2px solid ${accent}`, borderTopColor: 'transparent',
                      borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    }} />
                    <p style={{ color: accent, fontSize: '0.75rem', letterSpacing: '0.1em' }}>UPLOADING...</p>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ fontSize: '2rem', margin: '0 0 8px' }}>📷</p>
                    <p style={{ color: accent, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', margin: 0 }}>
                      TAP TO UPLOAD
                    </p>
                    <p style={{ color: 'rgba(255,255,255,.25)', fontSize: '0.68rem', margin: '4px 0 0' }}>
                      JPG, PNG, WEBP · Max 10MB
                    </p>
                  </div>
                )}
              </div>

              <input ref={type === 'before' ? beforeRef : afterRef} type="file"
                accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f, type); e.target.value = ''; }}
              />

              <LiquidGlassButton
                onClick={() => !isUploading && (type === 'before' ? beforeRef : afterRef).current?.click()}
                disabled={isUploading}
                variant="primary"
                size="sm"
                fullWidth
                style={{ marginTop: '10px' }}
              >
                {isUploading ? 'UPLOADING...' : url ? `REPLACE ${label}` : `+ UPLOAD ${label}`}
              </LiquidGlassButton>
            </div>
          );
        })}
      </div>

      {photos.before && photos.after && (
        <div style={{
          background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.2)',
          borderRadius: '10px', padding: '14px', textAlign: 'center',
        }}>
          <p style={{ margin: 0, color: '#d8b4fe', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.08em' }}>
            🏆 LEAD BY EXAMPLE — TRANSFORMATION DOCUMENTED
          </p>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}