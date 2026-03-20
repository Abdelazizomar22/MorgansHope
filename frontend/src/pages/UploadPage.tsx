import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisApi } from '../utils/api';

interface UploadPageProps { lang: 'en' | 'ar'; }
type ScanType = 'xray' | 'ct';

const IconCloudUpload = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);
const IconXray = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" />
    <path d="M8 12h8" /><circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
);
const IconCT = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" />
    <line x1="12" y1="3" x2="12" y2="8" /><line x1="12" y1="16" x2="12" y2="21" />
    <line x1="3" y1="12" x2="8" y2="12" /><line x1="16" y1="12" x2="21" y2="12" />
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconBrain = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="1.5" /><circle cx="5" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /><circle cx="12" cy="12" r="2" />
    <line x1="12" y1="6.5" x2="12" y2="10" /><line x1="6.5" y1="12" x2="10" y2="12" /><line x1="14" y1="12" x2="17.5" y2="12" /><line x1="12" y1="14" x2="12" y2="17.5" />
  </svg>
);
const IconZap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconAlertTriangle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const STAGES = {
  en: ['Uploading secure image...', 'Sending to AI engine...', 'AI is analyzing lung tissues...', 'Generating final report...', 'Done!'],
  ar: ['جاري رفع الصورة بأمان...', 'إرسال لمحرك الذكاء الاصطناعي...', 'جاري معالجة الصورة بالذكاء الاصطناعي...', 'تجهيز التقرير النهائي...', 'اكتمل التحليل!'],
};

export default function UploadPage({ lang }: UploadPageProps) {
  const navigate = useNavigate();
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const [scanType, setScanType] = useState<ScanType>('xray');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const validFiles: File[] = [];
    const validPreviews: string[] = [];
    let errorMsg = '';

    Array.from(newFiles).forEach(f => {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) {
        errorMsg = t('Only JPG, PNG, or WebP files are accepted.', 'الملفات المقبولة: JPG, PNG, WebP فقط.');
      } else if (f.size > 10 * 1024 * 1024) {
        errorMsg = t('File size must not exceed 10MB.', 'حجم الملف يجب أن لا يتجاوز 10MB.');
      } else {
        validFiles.push(f);
        validPreviews.push(URL.createObjectURL(f));
      }
    });

    if (errorMsg && validFiles.length === 0) {
      setError(errorMsg);
    } else {
      if (errorMsg) setError(errorMsg); // Show error for invalid files but still add valid ones
      else setError('');
      setFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...validPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const animateProgress = (from: number, to: number, duration: number) =>
    new Promise<void>((resolve) => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const ratio = Math.min(elapsed / duration, 1);
        setProgress(Math.round(from + (to - from) * ratio));
        if (ratio < 1) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });

  const handleSubmit = async () => {
    if (files.length === 0) { setError(t('Please select an image first.', 'يرجى اختيار صورة أولاً.')); return; }
    setLoading(true); setError(''); setProgress(0); setStage(0); setCurrentIndex(0);
    const sessionId = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentIndex(i);
        setStage(0); await animateProgress(0, 20, 400);
        setStage(1); await animateProgress(20, 40, 300);
        setStage(2);
        await Promise.all([analysisApi.upload(files[i], scanType, sessionId), animateProgress(40, 85, 3000)]);
        setStage(3); await animateProgress(85, 95, 200);
        setStage(4); await animateProgress(95, 100, 200);
      }
      setTimeout(() => navigate('/results?tab=history'), 600);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t('Analysis failed. Check AI services are running.', 'فشل التحليل. تأكد من تشغيل خدمات الذكاء الاصطناعي.');
      setError(msg); setLoading(false); setProgress(0); setStage(0);
    }
  };

  const STAGE_LABELS = ar ? STAGES.ar : STAGES.en;

  const sideCards = [
    { Icon: IconShield, title: t('Privacy First', 'خصوصيتك أولاً'), body: t('Your images are processed securely and never shared with third parties.', 'صورك تُعالج بأمان ولا تُشارك مع أطراف خارجية أبداً.'), source: '' },
    { Icon: IconBrain, title: t('AI Models', 'نماذج الذكاء الاصطناعي'), body: t('Accurate and reliable AI algorithms specialized for Chest CT and X-Ray analysis.', 'خوارزميات ذكاء اصطناعي دقيقة ومخصصة لتحليل صور الصدر.'), source: '' },
    { Icon: IconZap, title: t('Fast Batch Processing', 'معالجة سريعة للدفعات'), body: t('Upload multiple scans at once. Analysis completes in a very short time depending on batch size.', 'ارفع صوراً متعددة دفعة واحدة. التحليل يكتمل في وقت قصير جداً حسب حجم الدفعة.'), source: t('Powered by GPU-accelerated inference', 'مدعوم بمعالجة GPU السريعة') },
  ];

  return (
    <div dir={ar ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-main)', fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif" }}>

      {/* Page header */}
      <div style={{ background: 'var(--header-gradient)', padding: isMobile ? '30px 20px' : '36px 40px 44px', color: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ padding: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>{t('Upload & Analyze', 'رفع وتحليل')}</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>
            {t('Upload your CT scan or X-Ray and get AI-powered analysis instantly.', 'ارفع صورة CT أو أشعة واحصل على تحليل فوري بالذكاء الاصطناعي.')}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '20px' : '32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 24 }}>

          {/* LEFT: Upload area */}
          <div>
            {/* Scan type toggle */}
            <div style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 5, display: 'inline-flex', gap: 0, marginBottom: 20, boxShadow: '0 1px 6px var(--shadow-main)', border: '1px solid var(--card-border)' }}>
              {([
                { type: 'xray' as ScanType, Icon: IconXray, label: t('X-Ray', 'أشعة سينية') },
                { type: 'ct' as ScanType, Icon: IconCT, label: t('CT Scan', 'CT Scan') },
              ]).map(({ type, Icon, label }) => (
                <button key={type} onClick={() => setScanType(type)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 24px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit', transition: 'all 0.2s', background: scanType === type ? 'var(--primary)' : 'transparent', color: scanType === type ? 'white' : 'var(--text-muted)' }}>
                  <Icon />{label}
                </button>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => !loading && inputRef.current?.click()}
              style={{ border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--card-border)'}`, borderRadius: 16, minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: loading ? 'default' : 'pointer', background: dragging ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--card-bg)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><IconCloudUpload size={52} /></div>
                <p style={{ fontWeight: 700, color: 'var(--text-main)', margin: '0 0 7px', fontSize: 15 }}>{t('Drag & Drop or Click to Upload', 'اسحب وأفلت أو اضغط للرفع')}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: 12.5, margin: 0 }}>{t('JPG, PNG, WebP — Max 10MB per file', 'JPG, PNG, WebP — حتى 10MB لكل ملف')}</p>
              </div>
              <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} style={{ display: 'none' }} />
            </div>

            {/* File info (Grid of Previews) */}
            {previews.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12, marginBottom: 16 }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', background: 'var(--card-bg)', borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${loading && i === currentIndex ? 'var(--primary)' : 'var(--card-border)'}`, opacity: loading && i < currentIndex ? 0.5 : 1 }}>
                    <img src={src} alt="preview" style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                    {(!loading) && (
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}>✕</button>
                    )}
                    {loading && i === currentIndex && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(var(--primary-rgb),0.1)' }}>
                        <div style={{ position: 'absolute', left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', animation: 'scanLine 1.0s linear infinite' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.05)', border: '1.5px solid #fca5a5', borderRadius: 9, padding: '11px 14px', color: '#dc2626', fontSize: 13, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                <IconAlertTriangle />{error}
              </div>
            )}

            {/* Progress */}
            {loading && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>
                    {files.length > 1 ? `[${currentIndex + 1}/${files.length}] ` : ''}{STAGE_LABELS[stage]}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{progress}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--card-border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: 99, transition: 'width 0.1s ease-out' }} />
                </div>
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading || files.length === 0} style={{ width: '100%', padding: '14px 0', borderRadius: 10, border: 'none', background: loading || files.length === 0 ? 'var(--card-border)' : 'var(--primary)', color: loading || files.length === 0 ? 'var(--text-muted)' : 'white', fontWeight: 700, fontSize: 15, cursor: loading || files.length === 0 ? 'default' : 'pointer', boxShadow: loading || files.length === 0 ? 'none' : '0 4px 18px var(--shadow-hover)', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading
                ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 11-6.219-8.56"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" /></path></svg>{t('Analyzing...', 'جاري التحليل...')}</>
                : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>{t(`Analyze ${files.length > 1 ? files.length + ' Scans' : 'Scan'}`, `تحليل ${files.length > 1 ? files.length + ' صور' : 'الصورة'}`)}</>}
            </button>
          </div>

          {/* RIGHT: Info sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sideCards.map(({ Icon, title, body, source }, i) => (
              <div key={i} style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '16px', border: '1px solid var(--card-border)', boxShadow: '0 2px 8px var(--shadow-main)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ padding: 8, background: 'rgba(var(--primary-rgb),0.06)', borderRadius: 8, color: 'var(--primary)', flexShrink: 0 }}><Icon /></div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 13.5, marginBottom: 4 }}>{title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.65 }}>{body}</div>
                    {source && <div style={{ fontSize: 10.5, fontStyle: 'italic', color: 'var(--source-color)', marginTop: 6, fontWeight: 300, letterSpacing: 0.1, lineHeight: 1.5 }}>{source}</div>}
                  </div>
                </div>
              </div>
            ))}

            {/* Tips card */}
            <div style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '16px', border: '1px solid var(--card-border)' }}>
              <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><circle cx="12" cy="16" r=".5" fill="var(--primary)" /></svg>
                {t('Tips for Best Results', 'نصائح لأفضل نتائج')}
              </div>
              {[
                t('Use high-quality, uncompressed scans', 'استخدم صوراً عالية الجودة وغير مضغوطة'),
                t('Avoid filtered or edited images', 'تجنب الصور المعدّلة أو المفلترة'),
                t('Ensure the scan is well-lit and clear', 'تأكد من وضوح وإضاءة الصورة'),
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', marginTop: 6, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-main)', lineHeight: 1.6 }}>{tip}</span>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div style={{ background: 'var(--warning-bg)', borderRadius: 12, padding: '14px', border: '1.5px solid var(--warning-border)', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--warning-text)', marginTop: 1, flexShrink: 0 }}><IconAlertTriangle /></div>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--warning-text)', fontSize: 12.5, marginBottom: 4 }}>{t('Medical Notice', 'تنبيه طبي')}</div>
                <div style={{ color: 'var(--warning-body)', fontSize: 11.5, lineHeight: 1.65 }}>
                  {t('This is an AI screening tool. Always consult a qualified physician before making medical decisions.', 'هذه أداة فحص بالذكاء الاصطناعي. استشر دائماً طبيباً متخصصاً قبل أي قرار طبي.')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes scanLine { 0% { top: 0%; } 100% { top: 100%; } }
      `}</style>
    </div>
  );
}
