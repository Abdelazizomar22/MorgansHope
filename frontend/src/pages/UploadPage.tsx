import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiExclamationTriangle, HiShieldCheck, HiSparkles, HiBolt, HiCloudArrowUp } from 'react-icons/hi2';
import { REDIRECT_KEY, useAuth } from '../context/AuthContext';
import { WarningGraphic } from '../components/ui/warning-graphic';
import { analysisApi } from '../utils/api';
import { MAX_WIDTH } from '../constants/layouts';

interface UploadPageProps { lang: 'en' | 'ar'; }
type ScanType = 'xray' | 'ct';

const IconCloudUpload = ({ size = 48 }: { size?: number }) => (
  <HiCloudArrowUp size={size} className="opacity-40" style={{ color: 'var(--primary)' }} />
);

const IconAlertTriangle = () => <HiExclamationTriangle size={16} />;

const STAGES = {
  en: ['Uploading secure image...', 'Sending to AI engine...', 'AI is analyzing lung tissues...', 'Generating final report...', 'Done!'],
  ar: ['جاري رفع الصورة بأمان...', 'إرسال لمحرك الذكاء الاصطناعي...', 'جاري معالجة الصورة بالذكاء الاصطناعي...', 'تجهيز التقرير النهائي...', 'اكتمل التحليل!'],
};

export default function UploadPage({ lang }: UploadPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;
  const needsSetup = Boolean(user && (!user.onboardingCompleted || (user.authProvider === 'local' && user.emailVerified !== true)));

  const [scanType, setScanType] = useState<ScanType>('xray');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingFiles, setValidatingFiles] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const ensureServiceAccess = () => {
    if (!user) {
      sessionStorage.setItem(REDIRECT_KEY, '/upload');
      setError(t(
        'Please create an account or sign in to upload and analyze medical scans.',
        'يرجى إنشاء حساب أو تسجيل الدخول لرفع الأشعة وتحليلها.',
      ));
      return false;
    }

    if (needsSetup) {
      sessionStorage.setItem(REDIRECT_KEY, '/upload');
      navigate('/onboarding');
      return false;
    }

    return true;
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
	}, []);
  
  const IconXray = () => {
    const selected = scanType === 'xray';
    return <img src={`/images/icons/x-ray${selected ? '-selected' : ''}.png`} alt="X-Ray" width={isMobile ? 25 : 35} height={isMobile ? 25 : 35} style={{ objectFit: 'contain' }} />;
  };
  const IconCT = () => {
    const selected = scanType === 'ct';
    return <img src={`/images/icons/ct-scan${selected ? '-selected' : ''}.png`} alt="CT Scan" width={isMobile ? 25 : 35} height={isMobile ? 25 : 35} style={{ objectFit: 'contain' }} />;
  };
  
  const handleFiles = async (newFiles: FileList | null) => {
    if (!ensureServiceAccess()) {
      return;
    }

    if (!newFiles) return;
    const acceptedFiles: File[] = [];
    const acceptedPreviews: string[] = [];
    let errorMsg = '';
    const locallyValidFiles: File[] = [];

    Array.from(newFiles).forEach(f => {
      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(f.type)) {
        errorMsg = t('Only JPG, PNG, or WebP files are accepted.', 'الملفات المقبولة: JPG, PNG, WebP فقط.');
      } else if (f.size > 10 * 1024 * 1024) {
        errorMsg = t('File size must not exceed 10MB.', 'حجم الملف يجب أن لا يتجاوز 10MB.');
      } else {
        locallyValidFiles.push(f);
      }
    });

    if (errorMsg && locallyValidFiles.length === 0) {
      setError(errorMsg);
      return;
    }

    if (locallyValidFiles.length === 0) return;

    setValidatingFiles(true);

    for (const file of locallyValidFiles) {
      try {
        await analysisApi.validate(file, scanType);
        acceptedFiles.push(file);
        acceptedPreviews.push(URL.createObjectURL(file));
      } catch (err: any) {
        errorMsg = err?.response?.data?.message
          || t(
            'This image could not be validated. Please upload a chest CT or chest X-ray.',
            'تعذر التحقق من هذه الصورة. يرجى رفع أشعة صدر CT أو X-Ray.'
          );
      }
    }

    setValidatingFiles(false);

    if (acceptedFiles.length > 0) {
      setFiles(prev => [...prev, ...acceptedFiles]);
      setPreviews(prev => [...prev, ...acceptedPreviews]);
    }

    if (errorMsg) setError(errorMsg);
    else setError('');
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
  }, [scanType]);

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
    if (!ensureServiceAccess()) {
      return;
    }
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
    { Icon: HiShieldCheck, title: t('Privacy First', 'خصوصيتك أولاً'), body: t('Your images are processed securely and never shared with third parties.', 'صورك تُعالج بأمان ولا تُشارك مع أطراف خارجية أبداً.'), source: '' },
    { Icon: HiSparkles, title: t('AI Models', 'نماذج الذكاء الاصطناعي'), body: t('Chest CT uses the existing lung-cancer classifier, while Chest X-Ray screens major clinical disease groups.', 'يستخدم CT للصدر موديل سرطان الرئة الحالي، بينما تفحص الأشعة السينية مجموعات أمراض الصدر الرئيسية.'), source: '' },
    { Icon: HiBolt, title: t('Fast Batch Processing', 'معالجة سريعة للدفعات'), body: t('Upload multiple scans at once. Results are processed quickly.', 'ارفع عدة صور دفعة واحدة. تتم المعالجة بسرعة وتظهر النتائج بشكل منظم.'), source: '' },
  ];

  return (
    <div dir={ar ? 'rtl' : 'ltr'} className="overflow-x-hidden" style={{ minHeight: '90vh', background: 'var(--bg-main)', fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif" }}>

      {/* Page header */}
      <div className='section-bg-image page-header-padding'>
	      <div style={{ maxWidth: MAX_WIDTH, margin: '0 auto', color: 'white' }}>
	          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
	            <div style={{ padding: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
	              <HiCloudArrowUp size={20} color="white" />
	            </div>
	            <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>{t('Upload & Analyze', 'رفع وتحليل')}</h1>
	          </div>
	          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>
	            {t('Upload your Chest CT or Chest X-Ray and get AI-supported screening instantly.', 'ارفع CT للصدر أو أشعة سينية للصدر واحصل على فحص مدعوم بالذكاء الاصطناعي فوراً.')}
	          </p>
	      </div>
      </div>

      <div style={{ maxWidth: MAX_WIDTH, margin: '0 auto', padding: isMobile ? '30px 25px' : '50px 0' }}>
        <div className="flex gap-6 items-center md:items-start flex-col md:flex-row">

          {/* LEFT: Upload area */}
          <div className="flex flex-col" style={{ flex: isMobile ? undefined : '1 1 0%' }}>
            {/* Scan type toggle */}
            <div style={{ maxWidth: '100%', height: 52, background: '#ffffff', borderRadius: 12, padding: 6, display: 'inline-flex', gap: 8, marginBottom: 20, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.10)', border: '1px solid #dbe6e4' }}>
              {([
                { type: 'xray' as ScanType, Icon: IconXray, label: t('X-Ray', 'أشعة سينية') },
                { type: 'ct' as ScanType, Icon: IconCT, label: t('CT Scan', 'CT Scan') },
              ]).map(({ type, Icon, label }) => (
                <button key={type} onClick={() => setScanType(type)} style={{ height: 40, flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: 'inherit', transition: 'all 0.2s', background: scanType === type ? '#285f57' : 'transparent', color: scanType === type ? 'white' : '#34495e' }}>
                  <Icon />{label}
                </button>
              ))}
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => {
                if (!ensureServiceAccess()) {
                  return;
                }
                if (!loading && !validatingFiles) inputRef.current?.click();
              }}
              style={{ border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--card-border)'}`, borderRadius: 16, minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: loading || validatingFiles ? 'default' : 'pointer', background: dragging ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--card-bg)', transition: 'all 0.2s', position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}><IconCloudUpload size={52} /></div>
                <p style={{ fontWeight: 700, color: 'var(--text-main)', margin: '0 0 7px', fontSize: 15 }}>
                  {validatingFiles
                    ? t('Validating scan type...', 'جارٍ التحقق من نوع الأشعة...')
                    : t('Drag & Drop or Click to Upload', 'اسحب وأفلت أو اضغط للرفع')}
                </p>
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
            <button onClick={handleSubmit} disabled={loading || validatingFiles || (!!user && files.length === 0)} style={{ width: '100%', padding: '14px 0', borderRadius: 10, border: 'none', background: loading || validatingFiles || (!!user && files.length === 0) ? 'var(--card-border)' : 'var(--primary)', color: loading || validatingFiles || (!!user && files.length === 0) ? 'var(--text-muted)' : 'white', fontWeight: 700, fontSize: 15, cursor: loading || validatingFiles || (!!user && files.length === 0) ? 'default' : 'pointer', boxShadow: loading || validatingFiles || (!!user && files.length === 0) ? 'none' : '0 4px 18px var(--shadow-hover)', fontFamily: 'inherit', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading
                ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 11-6.219-8.56"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" /></path></svg>{t('Analyzing...', 'جاري التحليل...')}</>
                : validatingFiles
                  ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 11-6.219-8.56"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" /></path></svg>{t('Validating...', 'جارٍ التحقق...')}</>
                : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>{t(`Analyze ${files.length > 1 ? files.length + ' Scans' : 'Scan'}`, `تحليل ${files.length > 1 ? files.length + ' صور' : 'الصورة'}`)}</>}
            </button>

            {/* Warning */}
            <section className="mt-4 p-3 mb-5 md:mb-0 border border-border border-dashed rounded-2xl">
              <div className="flex items-center md:items-start gap-3">
                <WarningGraphic width={100} height={50} enableAnimations={true}
                        animationSpeed={1.5} color="#b64235" className="mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-bold text-[#9f3329]">MEDICAL WARNING</div>
                  <div className="mt-2 text-xs leading-relaxed text-[#b64235]">
                    AI screening support only. Do not make treatment decisions without consulting a qualified physician.
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Info sidebar */}
          <aside
            className="relative py-2 md:py-6 h-auto overflow-hidden rounded-2xl border border-border"
            style={{
							width: isMobile ? '100%' : 320,
        			backgroundImage: "url('/images/common/upload-card.png')",
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/5" />
						<div className="relative z-10 p-4">
              <div className="space-y-4">
            {sideCards.map(({ Icon, title, body }, i) => (
              <section key={i} className="border-b border-teal-200/40 pb-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-teal-700 drop-shadow-sm" strokeWidth={2} />
                  <div className="text-sm font-bold text-slate-900">{title}</div>
                </div>
                <div className="mt-2 pl-8 text-xs leading-relaxed text-slate-700">{body}</div>
              </section>
            ))}

            {/* Tips card */}
            <section>
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 shrink-0 text-teal-700 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></svg>
                <div className="text-sm font-bold text-slate-900">{t('Tips for Best Results', 'نصائح لأفضل نتائج')}</div>
              </div>
              <div className="mt-2 space-y-2 pl-8">
              {[
                t('Use high-quality, uncompressed scans', 'استخدم صوراً عالية الجودة وغير مضغوطة'),
                t('Avoid filtered or edited images', 'تجنب الصور المعدّلة أو المفلترة'),
                t('Ensure the scan is well-lit and clear', 'تأكد من وضوح وإضاءة الصورة'),
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" />
                  <span className="text-xs leading-relaxed text-slate-700">{tip}</span>
                </div>
              ))}
              </div>
            </section>

            </div>
            </div>
          </aside>
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
