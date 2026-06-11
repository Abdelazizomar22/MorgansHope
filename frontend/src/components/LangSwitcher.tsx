import { useState } from 'react';
import { HiGlobeAlt } from 'react-icons/hi2';

interface LangSwitcherProps {
  ar: boolean;
  onLangToggle: () => void;
}

export default function LangSwitcher({ ar, onLangToggle }: LangSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          height: 34,
          minWidth: 58,
          borderRadius: 10,
          border: '1px solid var(--card-border)',
          background: 'var(--card-bg)',
          color: 'var(--text-main)',
          fontWeight: 700,
          fontSize: 12.5,
          padding: '0 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          boxShadow: '0 2px 8px var(--shadow-main)',
        }}
      >
        <HiGlobeAlt className="h-3.5 w-3.5" />
        <span>{ar ? 'AR' : 'EN'}</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 100 }} />
          <div
            style={{
              position: 'absolute',
              top: 40,
              [ar ? 'left' : 'right']: 0,
              minWidth: 120,
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 10,
              boxShadow: '0 8px 24px var(--shadow-main)',
              zIndex: 202,
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => { if (ar) onLangToggle(); setOpen(false); }}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-main)',
                fontSize: 13,
                fontWeight: 700,
                textAlign: ar ? 'right' : 'left',
                padding: '10px 12px',
                cursor: 'pointer',
              }}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => { if (!ar) onLangToggle(); setOpen(false); }}
              style={{
                width: '100%',
                border: 'none',
                borderTop: '1px solid var(--card-border)',
                background: 'transparent',
                color: 'var(--text-main)',
                fontSize: 13,
                fontWeight: 700,
                textAlign: ar ? 'right' : 'left',
                padding: '10px 12px',
                cursor: 'pointer',
              }}
            >
              العربية
            </button>
          </div>
        </>
      )}
    </div>
  );
}
