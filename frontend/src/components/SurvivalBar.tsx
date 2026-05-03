import { useEffect, useState } from "react";

export default function SurvivalBar({ label, pct, color, delay = 0, trigger }: { label: string; pct: number; color: string; delay?: number; trigger: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const tm = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(tm);
  }, [trigger, pct, delay]);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{pct}%</span>
      </div>
      <div style={{ height: 10, background: 'var(--card-border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${w}%`, background: color, borderRadius: 99, transition: `width 1.3s cubic-bezier(.4,0,.2,1) ${delay}ms` }} />
      </div>
    </div>
  );
}