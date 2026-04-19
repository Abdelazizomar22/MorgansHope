import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { analysisApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/env';
import type { AnalysisResult, UrgencyLevel } from '../types';

interface ResultsPageProps { lang: 'en' | 'ar'; }

// SVG Icons
const IconCheckCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const IconAlertCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>;
const IconAlertTriangle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
const IconXCircle = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
const IconFileText = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
const IconUpload = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></svg>;
const IconHospital = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><line x1="9" y1="22" x2="9" y2="12" /><line x1="15" y1="22" x2="15" y2="12" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="12" y1="9" x2="12" y2="15" /></svg>;
const IconClock = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IconBarChart = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IconPill = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v3" /><circle cx="18" cy="18" r="3" /><line x1="18" y1="15" x2="18" y2="21" /><line x1="15" y1="18" x2="21" y2="18" /></svg>;
const IconInfo = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
const IconTrash = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;
const IconFilter = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
const IconCalendar = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;

const URGENCY_CONFIG: Record<UrgencyLevel, {
  color: string; bg: string; border: string;
  label_en: string; label_ar: string;
  Icon: () => JSX.Element;
}> = {
  none: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', label_en: 'No Findings', label_ar: 'لا توجد نتائج', Icon: IconCheckCircle },
  low: { color: '#5C8374', bg: 'rgba(92,131,116,0.1)', border: 'rgba(92,131,116,0.3)', label_en: 'Low Risk', label_ar: 'خطر منخفض', Icon: IconAlertCircle },
  medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', label_en: 'Medium Risk', label_ar: 'خطر متوسط', Icon: IconAlertTriangle },
  high: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)', label_en: 'High Risk', label_ar: 'خطر مرتفع', Icon: IconAlertTriangle },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', label_en: 'Critical', label_ar: 'حالة حرجة', Icon: IconXCircle },
};

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-GB', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function ResultsPage({ lang }: ResultsPageProps) {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const resultId = params.get('id');
  const initialTab = params.get('tab') as 'result' | 'history' | null;

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'result' | 'history'>(initialTab || 'result');
  const [error, setError] = useState('');
  const [expandedSessions, setExpandedSessions] = useState<Record<string, boolean>>({});
  const [daysFilter, setDaysFilter] = useState<number>(0); // 0 = All Time
  const [deletingId, setDeletingId] = useState<number | string | null>(null);

  // Report form modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTargetSession, setReportTargetSession] = useState<AnalysisResult[] | null>(null);
  const [reportForm, setReportForm] = useState({ patientName: '', phone: '', email: '', scanType: '' });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (resultId) { const r = await analysisApi.getById(Number(resultId)); setResult(r.data.data ?? null); }
        const h = await analysisApi.getHistory(1, 20); setHistory(h.data.data);
      } catch (e: any) { setError(e?.response?.data?.message || t('Failed to load results.', 'فشل تحميل النتائج.')); }
      finally { setLoading(false); }
    })();
  }, [resultId]);

  const groupedHistory = useMemo(() => {
    const groups: Record<string, AnalysisResult[]> = {};
    const ungrouped: AnalysisResult[] = [];
    history.forEach(item => {
      if (item.sessionId) {
        if (!groups[item.sessionId]) groups[item.sessionId] = [];
        groups[item.sessionId].push(item);
      } else {
        ungrouped.push(item);
      }
    });

    const sessions = Object.values(groups).map(items => ({
      isSession: true,
      id: items[0].sessionId as string,
      items: items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      createdAt: items[0].createdAt,
    }));

    const singleItems = ungrouped.map(item => ({
      isSession: false,
      id: item.id.toString(),
      items: [item],
      createdAt: item.createdAt,
    }));

    return [...sessions, ...singleItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (daysFilter === 0) return groupedHistory;
    const now = new Date().getTime();
    const ms = daysFilter * 24 * 60 * 60 * 1000;
    return groupedHistory.filter(group => (now - new Date(group.createdAt).getTime()) <= ms);
  }, [groupedHistory, daysFilter]);

  const handleDelete = async (id: number | string, isSession: boolean) => {
    if (!window.confirm(t('Are you sure you want to delete this record?', 'هل أنت متأكد من مسح هذا السجل؟'))) return;
    try {
      if (isSession) {
        // Find all IDs in session
        const session = groupedHistory.find(g => g.id === id);
        if (session) {
          await Promise.all(session.items.map(item => analysisApi.delete(item.id)));
        }
      } else {
        await analysisApi.delete(Number(id));
      }
      setHistory(prev => isSession ? prev.filter(i => i.sessionId !== id) : prev.filter(i => i.id !== Number(id)));
      if (result?.id === Number(id) || (isSession && result?.sessionId === id)) setResult(null);
    } catch (e) {
      alert(t('Failed to delete.', 'فشل المسح.'));
    }
  };

  const openReportModal = (targets?: AnalysisResult[]) => {
    setReportTargetSession(targets || null);
    setReportForm({
      patientName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
      phone: user?.phone || '',
      email: user?.email || '',
      scanType: '',
    });
    setShowReportModal(true);
  };

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '') || window.location.origin;

  const buildImageURL = (r: AnalysisResult) =>
    r.imagePath
      ? `${apiOrigin}/api/uploads/${r.imagePath.split(/[\\/]/).pop()}`
      : '';

  const imageUrlToDataUrl = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) return null;
      const blob = await response.blob();
      return await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const buildReportImageMap = async (targets: AnalysisResult[]) => {
    const entries = await Promise.all(
      targets.map(async (scan) => {
        const imageUrl = buildImageURL(scan);
        if (!imageUrl) return [scan.id, ''] as const;
        const dataUrl = await imageUrlToDataUrl(imageUrl);
        return [scan.id, dataUrl || imageUrl] as const;
      })
    );
    return Object.fromEntries(entries);
  };

  const buildSingleScanHTML = (r: AnalysisResult, imageMap: Record<number, string>) => {
    const urg = URGENCY_CONFIG[r.urgencyLevel as UrgencyLevel] || URGENCY_CONFIG.none;
    const probs = Object.entries(r.allProbabilities || {});
    const imgURL = imageMap[r.id] || '';
    return `
      <div style="border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:20px;page-break-inside:avoid">
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
          <div style="width:50px;height:50px;border-radius:10px;background:${urg.bg};border:1.5px solid ${urg.border};display:flex;align-items:center;justify-content:center;font-size:22px">${r.isMalignant ? '⚠️' : '✅'}</div>
          <div>
            <div style="font-size:18px;font-weight:800;color:${urg.color}">${r.classification}</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px">${r.imageType.toUpperCase()} · ${Math.round(r.confidence * 100)}% confidence</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1.2fr 0.8fr;gap:16px">
          <div style="background:#f8fafc;border-radius:10px;padding:12px;text-align:center;border:1px solid #e2e8f0">
            ${imgURL ? `<img src="${imgURL}" style="max-width:100%;max-height:200px;border-radius:7px" />` : '<div style="color:#94a3b8;font-size:12px;padding:30px">Image not available</div>'}
            <div style="font-size:10px;color:#94a3b8;font-weight:600;margin-top:6px">${r.imageType.toUpperCase()} · ${r.originalFilename || ''}</div>
          </div>
          <div style="padding:8px 0">
            ${probs.map(([cls, prob]) => {
      const p = Math.round((prob as number) * 100);
      const c = ['Normal', 'No Finding'].includes(cls) ? '#16a34a' : p > 50 ? urg.color : '#94a3b8';
      return `<div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:3px"><span>${cls}</span><span style="color:${c}">${p}%</span></div>
                      <div style="height:5px;background:#e2e8f0;border-radius:99px;margin-bottom:9px;overflow:hidden"><div style="height:100%;width:${p}%;background:${c};border-radius:99px"></div></div>`;
    }).join('')}
          </div>
        </div>
        ${r.nextStep ? `<div style="margin-top:14px;background:#f0fdf4;border-left:3px solid #16a34a;padding:10px 14px;border-radius:6px;font-size:12px;color:#166534">${r.nextStep}</div>` : ''}
      </div>`;
  };

  const buildReportHTML = (
    targets: AnalysisResult[],
    form: typeof reportForm,
    isMulti: boolean,
    imageMap: Record<number, string>
  ) => {
    const patientMedHist = user?.medicalHistory ? `<tr><td style="padding:8px 14px;font-size:11px;color:#94a3b8;font-weight:600;width:140px">Medical History</td><td style="padding:8px 14px;font-size:13px;font-weight:600">${user.medicalHistory}</td></tr>` : '';
    const smokingBadge = { never: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' }, former: { bg: '#fff8f0', border: '#fed7aa', text: '#c2410c' }, current: { bg: '#fff1f2', border: '#fecdd3', text: '#be123c' } }[user?.smokingHistory || 'never'] || { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' };
    const smokingLabel = user?.smokingHistory === 'never' ? 'Never Smoked' : user?.smokingHistory === 'former' ? 'Former Smoker' : user?.smokingHistory === 'current' ? 'Current Smoker' : 'Not Disclosed';
    return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
      <title>Morgan's Hope Report</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}body{font-family:'Sora',sans-serif;color:#0f172a;background:#fff;padding:40px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .header{background:#1a3a38;color:white;padding:24px 32px;border-radius:12px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center}
        .footer{border-top:1px solid #f1f5f9;padding-top:14px;display:flex;justify-content:space-between;align-items:center;margin-top:30px;font-size:10px;color:#94a3b8}
        table{width:100%;border-collapse:collapse;border:0.5px solid #e2e8f0;border-radius:10px;overflow:hidden;margin-bottom:24px}
        tr:nth-child(even){background:#fafafa}tr:not(:last-child){border-bottom:0.5px solid #f1f5f9}
        .disclaimer{background:#fff1f2;border:0.5px solid #fecdd3;border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:11px;color:#9f1239}
        @media print{body{padding:20px}}
      </style></head><body>
      <div class="header">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:44px;height:44px;border:1.5px solid rgba(255,255,255,0.3);border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:white">MH</div>
          <div><div style="font-size:20px;font-weight:700">Morgan's <em>Hope</em></div><div style="font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin-top:3px">AI Lung Detection System</div></div>
        </div>
        <div style="text-align:right">
          <div style="font-size:9px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px">${isMulti ? 'Session Report' : 'Report ID'}</div>
          <div style="font-size:18px;font-weight:700;font-family:'Courier New',monospace">${isMulti ? `${targets.length} SCANS` : `MH-${String(targets[0].id).padStart(6, '0')}`}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:3px">${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: '2-digit' })}</div>
        </div>
      </div>
      <div style="font-size:10px;font-weight:700;color:#64748b;letter-spacing:2px;text-transform:uppercase;padding-bottom:10px;margin-bottom:14px;border-bottom:1px solid #f1f5f9">Patient Information</div>
      <table>
        <tr><td style="padding:8px 14px;font-size:11px;color:#94a3b8;font-weight:600;width:140px">Patient Name</td><td style="padding:8px 14px;font-size:13px;font-weight:700">${form.patientName || 'N/A'}</td></tr>
        <tr><td style="padding:8px 14px;font-size:11px;color:#94a3b8;font-weight:600">Contact Phone</td><td style="padding:8px 14px;font-size:13px;font-weight:700">${form.phone || 'N/A'}</td></tr>
        <tr><td style="padding:8px 14px;font-size:11px;color:#94a3b8;font-weight:600">Contact Email</td><td style="padding:8px 14px;font-size:13px;font-weight:700">${form.email || 'N/A'}</td></tr>
        <tr><td style="padding:8px 14px;font-size:11px;color:#94a3b8;font-weight:600">Scan Type</td><td style="padding:8px 14px;font-size:13px;font-weight:700">${form.scanType || targets[0].imageType.toUpperCase()}</td></tr>
        <tr><td style="padding:8px 14px;font-size:11px;color:#94a3b8;font-weight:600">Age / Gender</td><td style="padding:8px 14px;font-size:13px;font-weight:700">${user?.age ? `${user.age} yo` : 'N/A'} · ${user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'N/A'}</td></tr>
        <tr><td style="padding:8px 14px;font-size:11px;color:#94a3b8;font-weight:600">Smoking Status</td><td style="padding:8px 14px"><span style="background:${smokingBadge.bg};border:0.5px solid ${smokingBadge.border};color:${smokingBadge.text};padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700">${smokingLabel}</span></td></tr>
        ${patientMedHist}
      </table>
      <div style="font-size:10px;font-weight:700;color:#64748b;letter-spacing:2px;text-transform:uppercase;padding-bottom:10px;margin-bottom:14px;border-bottom:1px solid #f1f5f9">Diagnostic Findings</div>
      ${targets.map(r => buildSingleScanHTML(r, imageMap)).join('')}
      <div class="disclaimer"><strong>Medical Disclaimer:</strong> This report is generated by an AI system for preliminary screening only. It must be reviewed by a board-certified radiologist or oncologist before any clinical decisions are made. Morgan's Hope does not provide binding medical diagnoses.</div>
      <div class="footer"><div><strong>Morgan's <em>Hope</em></strong><br/>morgans-hope.vercel.app · AI Lung Detection System</div><div style="text-align:center">MH-SYSTEM-v4 · AI-GENERATED</div><div style="background:#2E5C5A;color:white;font-size:9px;font-weight:700;letter-spacing:1.5px;padding:6px 14px;border-radius:4px;text-transform:uppercase">Verified Report</div></div>
    </body></html>`;
  };

  const printReport = async () => {
    const targets = reportTargetSession || (result ? [result] : []);
    if (targets.length === 0) return;
    const imageMap = await buildReportImageMap(targets);
    const html = buildReportHTML(targets, reportForm, targets.length > 1, imageMap);
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 700);
    setShowReportModal(false);
  };

  const downloadPDF = async () => {
    if (!result) return;
    const urg = URGENCY_CONFIG[result.urgencyLevel as UrgencyLevel] || URGENCY_CONFIG.none;
    const probs = Object.entries(result.allProbabilities || {});
    const imageURL = result.imagePath
      ? `${apiOrigin}/api/uploads/${result.imagePath.split(/[\\/]/).pop()}`
      : '';
    const imageSrc = imageURL ? (await imageUrlToDataUrl(imageURL)) || imageURL : '';

    const patientDetails = [
      user?.age ? `${user.age} ${t('yo', 'سنة')}` : '',
      user?.gender ? (user.gender === 'male' ? t('Male', 'ذكر') : user.gender === 'female' ? t('Female', 'أنثى') : t('Other', 'آخر')) : '',
      user?.smokingHistory ? (user.smokingHistory === 'never' ? t('Never Smoked', 'لم يدخن') : user.smokingHistory === 'former' ? t('Former Smoker', 'مدخن سابق') : t('Current Smoker', 'مدخن حالي')) : ''
    ].filter(Boolean).join(' | ');

    const medicalH = user?.medicalHistory ? `<div style="font-size:12px;color:#64748b;margin-top:6px;font-weight:600"><strong>Medical History:</strong> ${user.medicalHistory}</div>` : '';

    const html = `<!DOCTYPE html><html dir="${ar ? 'rtl' : 'ltr'}" lang="${lang}"><head><meta charset="UTF-8"/>
<title>Morgan's Hope — Report #${result.id}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;800&family=Cairo:wght@400;700;900&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${ar ? "'Cairo', sans-serif" : "'Sora', sans-serif"};color:#0f172a;background:#fff;padding:40px;line-height:1.5}
  .header{background:linear-gradient(135deg,#064e3b,#065f46);color:white;padding:35px 40px;border-radius:16px;margin-bottom:30px;display:flex;align-items:center;justify-content:space-between}
  .logo-area{display:flex;align-items:center;gap:15px}
  .logo-mark{width:48px;height:48px;background:rgba(255,255,255,0.15);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;border:1px solid rgba(255,255,255,0.2)}
  .header-text h1{font-size:24px;font-weight:900;margin:0;letter-spacing:-0.5px}
  .header-text p{font-size:12px;opacity:0.8;margin-top:2px}
  .report-meta{text-align:${ar ? 'left' : 'right'};font-size:11px;opacity:0.9}
  
  .section-title{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#64748b;font-weight:800;margin-bottom:12px;display:flex;align-items:center;gap:8px}
  .section-title::after{content:'';flex:1;height:1px;background:#e2e8f0}
  
  .info-grid{display:grid;grid-template-columns:repeat(3, 1fr);gap:15px;margin-bottom:30px}
  .info-card{background:#f8fafc;border:1px solid #e2e8f0;padding:15px;border-radius:12px}
  .info-label{font-size:10px;color:#94a3b8;font-weight:700;margin-bottom:4px}
  .info-value{font-size:14px;font-weight:800;color:#1e293b}

  .main-diagnosis{background:${urg.bg};border:2px solid ${urg.border};border-radius:16px;padding:30px;margin-bottom:30px;display:flex;gap:30px;align-items:center}
  .diag-badge{background:white;width:80px;height:80px;border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:40px;border:1px solid ${urg.border};box-shadow:0 4px 12px ${urg.bg}}
  .diag-content h2{font-size:28px;font-weight:900;color:${urg.color};margin-bottom:5px}
  .diag-content p{font-size:14px;color:${urg.color};font-weight:700;opacity:0.9}
  .confidence-mini{margin-top:15px;display:flex;align-items:center;gap:10px}
  .conf-track{flex:1;height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden}
  .conf-bar{height:100%;background:${urg.color};border-radius:99px}
  
  .results-container{display:grid;grid-template-columns:1.2fr 0.8fr;gap:30px;margin-bottom:30px}
  .scan-box{background:#f1f5f9;border-radius:16px;padding:15px;text-align:center;border:1px solid #e2e8f0}
  .scan-img{max-width:100%;max-height:300px;border-radius:10px;box-shadow:0 4px 15px rgba(0,0,0,0.1)}
  
  .prob-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:13px;font-weight:700}
  .prob-track{height:6px;background:#f1f5f9;border-radius:99px;margin-bottom:15px;overflow:hidden}
  .prob-bar{height:100%;border-radius:99px}

  .next-steps{background:#fffbeb;border:1px solid #fde68a;padding:25px;border-radius:16px;color:#92400e;margin-bottom:30px}
  .next-steps h3{font-size:14px;font-weight:800;margin-bottom:10px;display:flex;align-items:center;gap:8px}

  .footer{border-top:2px solid #f1f5f9;padding-top:20px;margin-top:40px;font-size:10.5px;color:#64748b;display:flex;justify-content:space-between;align-items:flex-end}
  .disclaimer{max-width:70%;line-height:1.6}
  .qr-placeholder{width:60px;height:60px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#cbd5e1;text-align:center}

  @media print { body{padding:20px} .header{border-radius:0} }
</style></head><body>

<div class="header">
  <div class="logo-area">
    <div class="logo-mark">MH</div>
    <div class="header-text">
      <h1>Morgan's Hope</h1>
      <p>"Legacy of Care, Vision of Hope."</p>
    </div>
  </div>
  <div class="report-meta">
    <strong>REPORT ID:</strong> MH-${result.id}<br/>
    <strong>GENERATED:</strong> ${formatDate(new Date().toISOString())}
  </div>
</div>

<div class="section-title">Patient Demographics & Clinical Profile</div>
<div class="info-grid">
  <div class="info-card">
    <div class="info-label">PATIENT NAME</div>
    <div class="info-value">${user?.firstName} ${user?.lastName}</div>
  </div>
  <div class="info-card">
    <div class="info-label">AGE / GENDER</div>
    <div class="info-value">${[user?.age ? `${user.age} yo` : 'N/A', user?.gender ? user.gender.toUpperCase() : 'N/A'].join(' / ')}</div>
  </div>
  <div class="info-card">
    <div class="info-label">SMOKING STATUS</div>
    <div class="info-value">${user?.smokingHistory?.toUpperCase() || 'NOT DISCLOSED'}</div>
  </div>
</div>

${user?.medicalHistory ? `
<div class="info-card" style="margin-top:-15px;margin-bottom:30px;background:#f0f9ff;border-color:#bae6fd">
  <div class="info-label" style="color:#0369a1">REPORTED CLINICAL HISTORY</div>
  <div class="info-value" style="font-size:13px;font-weight:600;line-height:1.6;color:#0c4a6e">${user.medicalHistory}</div>
</div>` : ''}

<div class="section-title">Diagnostic Findings</div>
<div class="main-diagnosis">
  <div class="diag-badge">${result.isMalignant ? '⚠️' : '✅'}</div>
  <div class="diag-content" style="flex:1">
    <p>PRIMARY CLASSIFICATION</p>
    <h2>${result.classification}</h2>
    <div style="display:flex;justify-content:space-between;align-items:center">
       <p>URGENCY: ${urg.label_en.toUpperCase()}</p>
       <span style="font-weight:900;color:${urg.color}">${Math.round(result.confidence * 100)}% Confidence</span>
    </div>
    <div class="confidence-mini">
      <div class="conf-track"><div class="conf-bar" style="width:${Math.round(result.confidence * 100)}%"></div></div>
    </div>
  </div>
</div>

<div class="results-container">
  <div class="scan-section">
    <div class="section-title">Analyzed Image Data</div>
    <div class="scan-box">
      ${imageSrc ? `<img src="${imageSrc}" class="scan-img"/>` : '<div style="padding:40px;color:#94a3b8">Scan visual not available</div>'}
      <div style="margin-top:10px;font-size:11px;font-weight:700;color:#64748b">${result.imageType.toUpperCase()} SCAN — ${result.originalFilename}</div>
    </div>
  </div>
  
  <div class="probs-section">
    <div class="section-title">Risk Distribution</div>
    <div style="padding:10px 0">
      ${probs.map(([cls, prob]) => {
      const cColor = URGENCY_CONFIG[cls as keyof typeof URGENCY_CONFIG]?.color || (['Normal', 'No Finding'].includes(cls) ? '#16a34a' : '#ef4444');
      const p = Math.round((prob as number) * 100);
      return `
          <div class="prob-row"><span>${cls}</span><span style="color:${cColor}">${p}%</span></div>
          <div class="prob-track"><div class="prob-bar" style="width:${p}%;background:${cColor}"></div></div>
        `;
    }).join('')}
    </div>
  </div>
</div>

${result.nextStep ? `
<div class="next-steps">
  <h3><span>📍</span> RECOMMENDED CLINICAL PATHWAY</h3>
  <p>${result.nextStep}</p>
</div>` : ''}

<div class="footer">
  <div class="disclaimer">
    <strong>MEDICAL DISCLAIMER:</strong> This report is generated by an artificial intelligence system and is intended for preliminary screening and educational assistance only. 
    It MUST be reviewed by a board-certified radiologist or oncologist before any clinical decisions are made. 
    Morgan's Hope does not provide binding medical diagnoses.
  </div>
  <div class="qr-area">
     <div class="qr-placeholder">VALIDATED<br/>REPORT</div>
     <div style="font-size:9px;margin-top:5px;font-weight:700">MH-SYSTEM-v4</div>
  </div>
</div>

</body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html); w.document.close();
    setTimeout(() => { w.print(); }, 500);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', fontFamily: ar ? "'Cairo'" : "'Sora'" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 16, color: 'var(--primary)' }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="9" opacity=".25" /><path d="M3 12a9 9 0 0 1 9-9"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.9s" repeatCount="indefinite" /></path></svg>
        </div>
        <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>{t('Loading results...', 'تحميل النتائج...')}</p>
      </div>
    </div>
  );

  const urg = result ? (URGENCY_CONFIG[result.urgencyLevel as UrgencyLevel] || URGENCY_CONFIG.none) : null;

  return (
    <div dir={ar ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif" }}>

      {/* Page header */}
      <div style={{ background: 'linear-gradient(150deg, var(--primary-dark) 0%, var(--primary) 100%)', padding: isMobile ? '30px 20px' : '36px 40px 44px', color: 'white' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ padding: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
              <IconBarChart />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>{t('Analysis Results', 'نتائج التحليل')}</h1>

            {tab === 'result' && result && (
              <button
                onClick={() => openReportModal([result])}
                style={{ marginLeft: 'auto', padding: '10px 20px', borderRadius: 10, border: 'none', background: 'white', color: 'var(--primary-dark)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                {t('Download PDF', 'تحميل التقرير')}
              </button>
            )}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>
            {t('View your AI-powered diagnostic report and analysis history.', 'اطّلع على تقريرك التشخيصي بالذكاء الاصطناعي وسجل تحليلاتك.')}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '20px' : '32px 40px' }}>

        {/* Tabs */}
        <div style={{ display: 'inline-flex', gap: 0, marginBottom: 28, background: 'var(--card-bg)', borderRadius: 10, padding: 4, boxShadow: '0 1px 6px var(--shadow-main)', border: '1px solid var(--card-border)' }}>
          {(['result', 'history'] as const).map((t_) => (
            <button key={t_} onClick={() => setTab(t_)} style={{ padding: '9px 24px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13.5, fontFamily: 'inherit', transition: 'all 0.2s', background: tab === t_ ? 'var(--primary)' : 'transparent', color: tab === t_ ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 7 }}>
              {t_ === 'result'
                ? <><IconBarChart />{t('Current Result', 'النتيجة الحالية')}</>
                : <><IconClock />{t('My History', 'سجلاتي')}</>}
            </button>
          ))}
        </div>

        {tab === 'result' && (
          <>
            {error && <div style={{ background: 'rgba(239,68,68,0.05)', border: '1.5px solid #fca5a5', borderRadius: 10, padding: '12px 16px', color: '#dc2626', marginBottom: 22, display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}><IconAlertCircle />{error}</div>}

            {!result ? (
              <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '56px 40px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                </div>
                <h2 style={{ color: 'var(--text-main)', fontWeight: 800, marginBottom: 10, fontSize: 20 }}>{t('No result selected', 'لم يتم اختيار نتيجة')}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>{t('Upload a scan to get your AI analysis report.', 'ارفع صورة للحصول على تقرير التحليل.')}</p>
                <Link to="/upload" style={{ padding: '11px 26px', background: 'var(--primary)', color: 'white', borderRadius: 9, textDecoration: 'none', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <IconUpload />{t('Upload Scan', 'رفع صورة')}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 20 }}>
                {/* Main result card */}
                <div>
                  {/* Urgency banner */}
                  <div style={{ background: urg!.bg, border: `2px solid ${urg!.border}`, borderRadius: 14, padding: '22px 24px', marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' as const }}>{t('Diagnosis', 'التشخيص')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ color: urg?.color }}>{urg ? <urg.Icon /> : null}</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: urg?.color, letterSpacing: -0.5 }}>{result.classification}</div>
                    </div>
                    <div style={{ fontSize: 14, color: urg!.color, fontWeight: 700, marginBottom: 14 }}>
                      {t('Urgency:', 'مستوى الخطورة:')} {ar ? urg!.label_ar : urg!.label_en}
                    </div>
                    {/* Confidence bar */}
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
                      <span>{t('Confidence Score', 'نسبة الثقة')}</span>
                      <span style={{ color: urg!.color, fontWeight: 800 }}>{Math.round(result.confidence * 100)}%</span>
                    </div>
                    <div style={{ background: 'var(--card-border)', borderRadius: 99, height: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.round(result.confidence * 100)}%`, height: '100%', background: urg!.color, borderRadius: 99, transition: 'width 0.8s' }} />
                    </div>
                  </div>

                  {/* Probability breakdown */}
                  {Object.keys(result.allProbabilities || {}).length > 0 && (
                    <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: '20px 22px', marginBottom: 18, border: '1px solid var(--card-border)', boxShadow: '0 2px 8px var(--shadow-main)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <div style={{ color: 'var(--primary)' }}><IconBarChart /></div>
                        <h3 style={{ fontWeight: 800, color: 'var(--text-main)', margin: 0, fontSize: 14.5 }}>{t('Probability Breakdown', 'توزيع الاحتمالات')}</h3>
                      </div>
                      {Object.entries(result.allProbabilities).map(([cls, prob]) => (
                        <div key={cls} style={{ marginBottom: 11 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>
                            <span>{cls}</span>
                            <span style={{ color: ['Normal', 'No Finding'].includes(cls) ? '#4ade80' : '#f87171', fontWeight: 800 }}>
                              {Math.round((prob as number) * 100)}%
                            </span>
                          </div>
                          <div style={{ background: 'var(--bg-main)', borderRadius: 99, height: 8, border: '1px solid var(--card-border)', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.round((prob as number) * 100)}%`, height: '100%', background: ['Normal', 'No Finding'].includes(cls) ? '#22c55e' : '#ef4444', borderRadius: 99 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Next step */}
                  {result.nextStep && (
                    <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: '18px 20px', border: '1.5px solid var(--primary)', marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{ color: 'var(--primary)' }}><IconPill /></div>
                        <h3 style={{ fontWeight: 800, color: 'var(--primary)', margin: 0, fontSize: 14.5 }}>{t('Recommended Next Step', 'الخطوة التالية الموصى بها')}</h3>
                      </div>
                      <p style={{ color: 'var(--text-main)', fontSize: 13.5, margin: 0, lineHeight: 1.75 }}>{result.nextStep}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div style={{ background: 'var(--card-bg)', borderRadius: 14, padding: '18px 20px', border: '1px solid var(--card-border)', boxShadow: '0 2px 8px var(--shadow-main)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                      <div style={{ color: 'var(--primary)' }}><IconInfo /></div>
                      <h3 style={{ fontWeight: 800, color: 'var(--text-main)', margin: 0, fontSize: 14.5 }}>{t('Scan Details', 'تفاصيل الفحص')}</h3>
                    </div>
                    {[
                      { label: t('Patient', 'المريض'), val: `${user?.firstName} ${user?.lastName}` },
                      ...(user?.age || user?.gender || user?.smokingHistory || user?.medicalHistory ? [{
                        label: t('Patient Stats', 'بيانات المريض'), val: [
                          user.age ? `${user.age} ${t('yo', 'سنة')}` : '',
                          user.gender ? (user.gender === 'male' ? t('Male', 'ذكر') : user.gender === 'female' ? t('Female', 'أنثى') : t('Other', 'آخر')) : '',
                          user.smokingHistory ? (user.smokingHistory === 'never' ? t('Never Smoked', 'لم يدخن أبداً') : user.smokingHistory === 'former' ? t('Former Smoker', 'مدخن سابق') : t('Current Smoker', 'مدخن حالي')) : '',
                          user.medicalHistory ? `${t('History:', 'التاريخ المرضي:')} ${user.medicalHistory}` : ''
                        ].filter(Boolean).join(' | ')
                      }] : []),
                      { label: t('Scan Type', 'نوع الفحص'), val: result.imageType.toUpperCase() },
                      { label: t('Date', 'التاريخ'), val: formatDate(result.createdAt) },
                      { label: t('File', 'الملف'), val: result.originalFilename },
                      { label: t('Processing', 'وقت المعالجة'), val: result.processingTimeMs ? `${result.processingTimeMs}ms` : 'N/A' },
                    ].map((row, i, arr) => (
                      <div key={i} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--card-border)' : 'none' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, paddingRight: 10 }}>{row.label}</span>
                        <span style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 700, textAlign: ar ? 'left' : 'right', flex: 1, wordBreak: 'break-all' }}>{row.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <button onClick={downloadPDF} style={{ padding: '13px', background: 'var(--primary)', color: 'white', borderRadius: 11, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px var(--shadow-hover)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <IconFileText />{t('Download PDF Report', 'تحميل تقرير PDF')}
                  </button>
                  <Link to="/upload" style={{ padding: '12px', background: 'var(--bg-main)', color: 'var(--primary)', border: '1.5px solid var(--primary)', borderRadius: 11, textDecoration: 'none', fontWeight: 800, fontSize: 13.5, textAlign: 'center', boxShadow: '0 4px 16px var(--shadow-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <IconUpload />{t('Upload New Scan', 'رفع صورة جديدة')}
                  </Link>
                  {result.isMalignant && (
                    <Link to="/hospitals" style={{ padding: '12px', background: '#dc2626', color: 'white', borderRadius: 11, textDecoration: 'none', fontWeight: 700, fontSize: 13.5, textAlign: 'center', boxShadow: '0 4px 16px rgba(220,38,38,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <IconHospital />{t('Find Nearest Hospital', 'أقرب مستشفى')}
                    </Link>
                  )}
                  <div style={{ background: 'rgba(220,38,38,0.09)', borderRadius: 11, padding: '14px', border: '2px solid #ef4444', display: 'flex', gap: 8, alignItems: 'flex-start', boxShadow: '0 6px 16px rgba(239,68,68,0.14)' }}>
                    <div style={{ color: '#b91c1c', flexShrink: 0, marginTop: 1 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg></div>
                    <div>
                      <div style={{ fontWeight: 900, color: '#b91c1c', fontSize: 12, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.35 }}>{t('Medical Warning', 'تحذير طبي')}</div>
                      <div style={{ color: '#7f1d1d', fontSize: 11.8, lineHeight: 1.6, fontWeight: 600 }}>{t('This AI result is not a final diagnosis. Consult a qualified physician before any treatment decision.', 'هذه النتيجة ليست تشخيصًا نهائيًا. راجع طبيبًا مؤهلًا قبل أي قرار علاجي.')}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 800, color: 'var(--text-main)', margin: 0, fontSize: 20, letterSpacing: -0.3 }}>{t('My Analysis History', 'سجل التحليلات')}</h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '6px 12px', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)', boxShadow: '0 1px 4px var(--shadow-main)' }}>
                  <IconFilter />
                  <span style={{ fontWeight: 600 }}>{t('Filter:', 'تصفية:')}</span>
                  <select
                    value={daysFilter}
                    onChange={(e) => setDaysFilter(Number(e.target.value))}
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: 700, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <option value={0}>{t('All Time', 'كل الأوقات')}</option>
                    <option value={7}>{t('Last 7 Days', 'آخر 7 أيام')}</option>
                    <option value={30}>{t('Last 30 Days', 'آخر 30 يوم')}</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div style={{ background: 'var(--card-bg)', borderRadius: 16, padding: '56px', textAlign: 'center', border: '1px solid var(--card-border)' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 14, display: 'flex', justifyContent: 'center' }}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 14, marginBottom: 20 }}>{t('No analyses yet. Upload your first scan!', 'لا توجد تحليلات بعد. ارفع صورتك الأولى!')}</p>
                <Link to="/upload" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 24px', background: 'var(--primary)', color: 'white', borderRadius: 9, textDecoration: 'none', fontWeight: 700, fontSize: 13.5 }}>
                  <IconUpload />{t('Upload Scan', 'رفع صورة')}
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredHistory.map((group) => {
                  if (group.isSession && group.items.length > 1) {
                    const isExpanded = expandedSessions[group.id];
                    const worstItem = group.items.reduce((prev, curr) => (URGENCY_CONFIG[curr.urgencyLevel as UrgencyLevel]?.color === '#ef4444' || curr.confidence > prev.confidence) ? curr : prev, group.items[0]);
                    const wu = URGENCY_CONFIG[worstItem.urgencyLevel as UrgencyLevel] || URGENCY_CONFIG.none;
                    return (
                      <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div onClick={() => setExpandedSessions(p => ({ ...p, [group.id]: !p[group.id] }))}
                          style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '16px 20px', border: `1.5px solid var(--card-border)`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', boxShadow: '0 2px 6px var(--shadow-main)', borderLeft: `4px solid ${wu.color}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid var(--card-border)`, color: 'var(--text-main)' }}>
                              <IconClock />
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 14 }}>{t('Scan Batch Session', 'جلسة فحوصات مجمعة')} — {group.items.length} {t('Scans', 'صور')}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(group.createdAt)}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); openReportModal(group.items); }}
                              title={t('Download Session PDF', 'تحميل تقرير الجلسة')}
                              style={{ padding: '5px 10px', borderRadius: 7, border: '1.5px solid var(--primary)', background: 'transparent', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontWeight: 700, fontSize: 11, transition: 'all 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                              {t('PDF', 'PDF')}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(group.id, true); }}
                              style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                            >
                              <IconTrash />
                            </button>
                            <div style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--text-muted)' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                            </div>
                          </div>
                        </div>
                        {isExpanded && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: ar ? 0 : 32, paddingRight: ar ? 32 : 0, marginTop: 4 }}>
                            {group.items.map((item) => {
                              const u = URGENCY_CONFIG[item.urgencyLevel as UrgencyLevel] || URGENCY_CONFIG.none;
                              return (
                                <div key={item.id} onClick={() => { setResult(item); setTab('result'); }}
                                  style={{ background: 'var(--card-bg)', borderRadius: 10, padding: '12px 16px', border: `1.5px solid ${item.id === result?.id ? 'var(--primary)' : 'var(--card-border)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', opacity: 0.95 }}
                                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                  onMouseLeave={e => e.currentTarget.style.opacity = '0.95'}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 34, height: 34, borderRadius: 8, background: u.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.color }}><u.Icon /></div>
                                    <div>
                                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: 13 }}>{item.classification}</div>
                                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.imageType.toUpperCase()}</div>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: ar ? 'left' : 'right' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: u.color }}>{ar ? u.label_ar : u.label_en}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{Math.round(item.confidence * 100)}%</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Single item
                  const item = group.items[0];
                  const u = URGENCY_CONFIG[item.urgencyLevel as UrgencyLevel] || URGENCY_CONFIG.none;
                  return (
                    <div key={item.id} onClick={() => { setResult(item); setTab('result'); }}
                      style={{ background: 'var(--card-bg)', borderRadius: 12, padding: '16px 20px', border: `1.5px solid ${item.id === result?.id ? 'var(--primary)' : 'var(--card-border)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', boxShadow: '0 2px 6px var(--shadow-main)' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px var(--shadow-hover)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 6px var(--shadow-main)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: u.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${u.border}`, color: u.color }}>
                          <u.Icon />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: 14 }}>{item.classification}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{item.imageType.toUpperCase()} · {formatDate(item.createdAt)}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: ar ? 'left' : 'right' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: u.color }}>{ar ? u.label_ar : u.label_en}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{Math.round(item.confidence * 100)}% {t('confidence', 'ثقة')}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); openReportModal([item]); }}
                          title={t('Download Scan PDF', 'تحميل تقرير الفحص')}
                          style={{ padding: '5px 10px', borderRadius: 7, border: '1.5px solid var(--primary)', background: 'transparent', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', fontWeight: 700, fontSize: 11, transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                          {t('PDF', 'PDF')}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id, false); }}
                          style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* ── Report Form Modal ── */}
      {
        showReportModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowReportModal(false)}>
            <div style={{ background: 'var(--card-bg)', borderRadius: 18, padding: '32px', width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.3)', border: '1px solid var(--card-border)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontWeight: 800, color: 'var(--text-main)', margin: 0, fontSize: 18 }}>{t('Report Details', 'بيانات التقرير')}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: 12.5, margin: '4px 0 0' }}>{t('Please fill in patient info before generating the PDF.', 'يرجى ملء بيانات المريض قبل توليد التقرير.')}</p>
                </div>
                <button onClick={() => setShowReportModal(false)} style={{ width: 34, height: 34, borderRadius: 8, border: 'none', background: 'var(--bg-main)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>×</button>
              </div>
              {([
                { key: 'patientName', label: t('Patient Full Name', 'اسم المريض الكامل'), placeholder: t('e.g. Mohamed Ali', 'مثال: محمد علي') },
                { key: 'phone', label: t('Phone Number', 'رقم الهاتف'), placeholder: '+20 1xx xxx xxxx' },
                { key: 'email', label: t('Email', 'البريد الإلكتروني'), placeholder: 'example@mail.com' },
                { key: 'scanType', label: t('Scan Type', 'نوع الفحص'), placeholder: t('e.g. Chest X-Ray / CT', 'مثال: X-Ray / CT') },
              ] as { key: keyof typeof reportForm; label: string; placeholder: string }[]).map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 6 }}>{label}</label>
                  <input
                    value={reportForm[key]}
                    onChange={e => setReportForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid var(--card-border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowReportModal(false)} style={{ flex: 1, padding: '11px', borderRadius: 9, border: '1.5px solid var(--card-border)', background: 'transparent', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontSize: 13.5 }}>{t('Cancel', 'إلغاء')}</button>
                <button onClick={printReport} style={{ flex: 2, padding: '11px', borderRadius: 9, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  {t('Download PDF', 'تحميل التقرير')}
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
