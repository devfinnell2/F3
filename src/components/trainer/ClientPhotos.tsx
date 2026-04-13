// ─────────────────────────────────────────────
//  Trainer — view a client's before/after photos
// ─────────────────────────────────────────────
interface ClientPhotosProps {
  beforePhoto?:     string | null;
  afterPhoto?:      string | null;
  beforePhotoDate?: string | null;
  afterPhotoDate?:  string | null;
  clientName:       string;
}

export default function ClientPhotos({
  beforePhoto, afterPhoto, beforePhotoDate, afterPhotoDate, clientName,
}: ClientPhotosProps) {
  if (!beforePhoto && !afterPhoto) return (
    <div style={{
      background:   'rgba(255,255,255,.03)',
      border:       '1px solid rgba(244,114,182,.12)',
      borderRadius: '10px',
      padding:      '20px',
      textAlign:    'center',
    }}>
      <p style={{ margin: 0, color: 'rgba(244,114,182,.4)', fontSize: '0.78rem', letterSpacing: '0.1em' }}>
        NO PHOTOS UPLOADED YET
      </p>
    </div>
  );

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    }) : null;

  return (
    <div>
      <div style={{
        fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em',
        color: 'rgba(244,114,182,.6)', marginBottom: '10px',
      }}>
        PROGRESS PHOTOS — {clientName.toUpperCase()}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { label: 'BEFORE', url: beforePhoto, date: formatDate(beforePhotoDate), accent: '#a855f7' },
          { label: 'AFTER',  url: afterPhoto,  date: formatDate(afterPhotoDate),  accent: '#00ffc8' },
        ].map(({ label, url, date, accent }) => (
          <div key={label}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '6px',
            }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: accent, letterSpacing: '0.1em' }}>
                {label}
              </span>
              {date && (
                <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,.28)' }}>
                  {date}
                </span>
              )}
            </div>
            <div style={{
              width: '100%', aspectRatio: '3/4',
              borderRadius: '8px',
              border:       `1px solid ${accent}33`,
              background:   `${accent}08`,
              overflow:     'hidden',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
            }}>
              {url ? (
                <img
                  src={url}
                  alt={`${label} photo`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <p style={{ color: `${accent}44`, fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                  NO PHOTO
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}