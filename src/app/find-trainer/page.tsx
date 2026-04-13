export default function FindTrainerPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#060612 0%,#0d0820 40%,#140a2e 70%,#0a0a1a 100%)',
      fontFamily: 'Courier New, monospace', color: '#e0d8ff', padding: '24px',
    }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.15em', color: '#d8b4fe', margin: '0 0 12px' }}>
          FIND A TRAINER
        </h1>
        <p style={{ color: 'rgba(255,255,255,.35)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '32px' }}>
          The trainer marketplace is coming soon. You'll be able to browse ISSA-certified trainers, view their specialties, and request enrollment directly from here.
        </p>
        <div style={{
          background: 'rgba(168,85,247,.06)', border: '1px solid rgba(168,85,247,.2)',
          borderRadius: '12px', padding: '20px',
        }}>
          <p style={{ margin: '0 0 8px', color: '#c084fc', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em' }}>
            ALREADY HAVE A TRAINER?
          </p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,.35)', fontSize: '0.78rem' }}>
            Ask them to enroll you directly from their dashboard. You'll receive an email invitation.
          </p>
        </div>
      </div>
    </div>
  );
}