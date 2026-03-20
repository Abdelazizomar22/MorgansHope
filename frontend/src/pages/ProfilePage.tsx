import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analysisApi, authApi } from '../utils/api';
import type { AnalysisResult } from '../types';

interface ProfilePageProps { lang: 'en' | 'ar'; }

const IconUser = () => <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconPhone = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'text-bottom' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const IconSettings = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, verticalAlign: 'text-bottom' }}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 6 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;

const URGENCY_COLORS: Record<string, { bg: string; color: string }> = {
  Normal: { bg: '#f0fdf4', color: '#16a34a' },
  'No Finding': { bg: '#f0fdf4', color: '#16a34a' },
  Benign: { bg: '#fffbeb', color: '#fd7e14' },
  'Nodule/Mass': { bg: '#fff0f0', color: '#dc3545' },
  Adenocarcinoma: { bg: '#fff0f0', color: '#dc3545' },
  Large_Cell_Carcinoma: { bg: '#fff0f0', color: '#dc3545' },
  Squamous_Cell_Carcinoma: { bg: '#fff0f0', color: '#7b0012' },
  Malignant_General: { bg: '#fff0f0', color: '#dc3545' },
};

function getStyle(cls: string) {
  return URGENCY_COLORS[cls] || { bg: '#f0f4f8', color: '#1e2d3d' };
}

export default function ProfilePage({ lang }: ProfilePageProps) {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;

  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changePwd, setChangePwd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    age: user?.age ? String(user.age) : '',
    gender: user?.gender || '',
    smokingHistory: user?.smokingHistory || '',
    medicalHistory: user?.medicalHistory || ''
  });
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');

  useEffect(() => {
    analysisApi.getHistory(1, 50).then(r => setHistory(r.data.data || [])).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSaveProfile = async () => {
    setSaveErr(''); setSaveMsg('');
    try {
      const payload = {
        ...form,
        age: form.age ? parseInt(form.age, 10) : undefined,
        gender: (form.gender || undefined) as 'male' | 'female' | 'other' | undefined,
        smokingHistory: (form.smokingHistory || undefined) as 'never' | 'former' | 'current' | undefined,
      };
      const r = await authApi.updateProfile(payload);
      if (r.data.data) updateUser(r.data.data);
      setSaveMsg(t('Profile updated!', 'تم تحديث الملف الشخصي!'));
      setEditing(false);
    } catch (e: any) { setSaveErr(e?.response?.data?.message || t('Failed to update.', 'فشل التحديث.')); }
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        try {
          const r = await authApi.uploadAvatar(file);
          if (r.data.data) updateUser(r.data.data);
        } catch (err: any) { alert(err?.response?.data?.message || t('Failed to upload avatar', 'فشل رفع الصورة')); }
      }
    };
    input.click();
  };

  const handleChangePwd = async () => {
    if (pwd.newPwd !== pwd.confirm) { setSaveErr(t("Passwords don't match.", 'كلمتا المرور غير متطابقتين.')); return; }
    setSaveErr(''); setSaveMsg('');
    try {
      await authApi.updateProfile({ currentPassword: pwd.current, newPassword: pwd.newPwd });
      setSaveMsg(t('Password changed!', 'تم تغيير كلمة المرور!'));
      setChangePwd(false);
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (e: any) { setSaveErr(e?.response?.data?.message || t('Failed.', 'فشل.')); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });

  const getActionBtn = (item: AnalysisResult) => {
    if (item.isMalignant) return { label: t('View Recommended Hospitals', 'المستشفيات الموصى بها'), href: '/hospitals', color: '#dc3545', bg: '#fff0f0' };
    if (item.imageType === 'xray') return { label: t('Download PDF', 'تحميل PDF'), href: `/results?id=${item.id}`, color: '#004080', bg: '#e8f4ff' };
    return { label: t('View Report', 'عرض التقرير'), href: `/results?id=${item.id}`, color: '#0a1628', bg: '#f0f9ff' };
  };

  return (
    <div dir={ar ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: ar ? "'Cairo',sans-serif" : "'Sora',sans-serif", padding: isMobile ? '20px 16px' : '32px 24px' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto' }}>

        {/* ─── Profile hero card ─── */}
        <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: '32px 36px', marginBottom: 24, border: '1px solid var(--card-border)', boxShadow: '0 2px 12px var(--shadow-main)', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div onClick={handleAvatarClick} style={{ width: 90, height: 90, borderRadius: '50%', border: '2.5px solid var(--primary)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-light)', flexShrink: 0, cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
            {user?.profilePicture ? <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}/uploads/${user.profilePicture}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" /> : <IconUser />}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', color: 'white', fontSize: 12, fontWeight: 700 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
              {t('Edit', 'تعديل')}
            </div>
          </div>

          <div style={{ flex: 1 }}>
            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, maxWidth: 480 }}>
                {[
                  { key: 'firstName', label: t('First Name', 'الاسم الأول'), type: 'text' },
                  { key: 'lastName', label: t('Last Name', 'اسم العائلة'), type: 'text' },
                  { key: 'phone', label: t('Phone', 'الهاتف'), type: 'tel' },
                  { key: 'age', label: t('Age', 'العمر'), type: 'number' },
                  {
                    key: 'gender', label: t('Gender', 'الجنس'), type: 'select', options: [
                      { value: '', label: t('Select', 'اختر') },
                      { value: 'male', label: t('Male', 'ذكر') },
                      { value: 'female', label: t('Female', 'أنثى') }
                    ]
                  },
                  {
                    key: 'smokingHistory', label: t('Smoking History', 'تاريخ التدخين'), type: 'select', options: [
                      { value: '', label: t('Select History', 'اختر الحالة') },
                      { value: 'never', label: t('Never Smoked', 'لم أدخن أبداً') },
                      { value: 'former', label: t('Former Smoker', 'مدخن سابق') },
                      { value: 'current', label: t('Current Smoker', 'مدخن حالي') }
                    ]
                  },
                  { key: 'medicalHistory', label: t('Medical History', 'التاريخ المرضي'), type: 'textarea' },
                ].map(f => (
                  <div key={f.key} style={{ gridColumn: (f.key === 'phone' || f.key === 'smokingHistory' || f.key === 'medicalHistory') ? '1 / -1' : 'auto' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={form[f.key as keyof typeof form] || ''}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--card-border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 14, fontFamily: 'inherit', outline: 'none', appearance: 'none' }}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--card-border)'}>
                        {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea value={form[f.key as keyof typeof form] || ''}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })} rows={3}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--card-border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--card-border)'} />
                    ) : (
                      <input type={f.type} value={form[f.key as keyof typeof form] || ''}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--card-border)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--card-border)'} />
                    )}
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, marginTop: 4 }}>
                  <button onClick={handleSaveProfile} style={{ padding: '9px 20px', background: 'var(--primary)', color: 'white', borderRadius: 9, border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t('Save', 'حفظ')}
                  </button>
                  <button onClick={() => setEditing(false)} style={{ padding: '9px 16px', background: 'var(--bg-main)', color: 'var(--text-main)', borderRadius: 9, border: '1px solid var(--card-border)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t('Cancel', 'إلغاء')}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-main)', margin: '0 0 6px' }}>
                  {user?.firstName} {user?.lastName}
                </h2>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 2px', fontSize: 14 }}>{user?.email}</p>
                {user?.phone && <p style={{ color: 'var(--text-muted)', margin: '0 0 2px', fontSize: 14 }}><IconPhone /> {user.phone}</p>}
                {(user?.age || user?.gender || user?.smokingHistory) && (
                  <p style={{ color: 'var(--text-muted)', margin: '0 0 16px', fontSize: 13 }}>
                    {[
                      user.age ? `${user.age} ${t('yo', 'سنة')}` : null,
                      user.gender ? (user.gender === 'male' ? t('Male', 'ذكر') : user.gender === 'female' ? t('Female', 'أنثى') : t('Other', 'آخر')) : null,
                      user.smokingHistory ? (user.smokingHistory === 'never' ? t('Never Smoked', 'لم يدخن') : user.smokingHistory === 'former' ? t('Former Smoker', 'مدخن سابق') : t('Current Smoker', 'مدخن حالي')) : null
                    ].filter(Boolean).join(' • ')}
                  </p>
                )}
                {user?.medicalHistory && (
                  <div style={{ marginBottom: 20, padding: 12, background: 'var(--bg-main)', borderRadius: 10, border: '1px solid var(--card-border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 4 }}>{t('Medical History', 'التاريخ المرضي')}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-main)', lineHeight: 1.6 }}>{user.medicalHistory}</div>
                  </div>
                )}
                <div style={{ marginBottom: 16 }}></div>
                <button onClick={() => setEditing(true)}
                  style={{ padding: '10px 22px', background: 'var(--primary)', color: 'white', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {t('Edit Profile', 'تعديل الملف الشخصي')}
                </button>
              </>
            )}
            {saveMsg && <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13, marginTop: 8 }}>{saveMsg}</p>}
            {saveErr && <p style={{ color: '#dc3545', fontWeight: 700, fontSize: 13, marginTop: 8 }}>{saveErr}</p>}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { val: history.length, label: t('Total Scans', 'إجمالي الفحوصات') },
              { val: history.filter(h => h.isMalignant).length, label: t('Malignant', 'خبيثة') },
              { val: history.filter(h => !h.isMalignant && h.hasFindings).length, label: t('Findings', 'نتائج') },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '14px 20px', background: 'var(--bg-main)', borderRadius: 14, border: '1px solid var(--card-border)', minWidth: 80 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--primary)' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontWeight: 700 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Main layout ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 280px', gap: 20 }}>

          {/* Left: History table */}
          <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: '28px 24px', border: '1px solid var(--card-border)', boxShadow: '0 2px 12px var(--shadow-main)' }}>
            <h3 style={{ fontWeight: 900, color: 'var(--text-main)', margin: '0 0 20px', fontSize: 20 }}>
              {t('My Analysis History', 'سجل التحليلات')}
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t('Loading...', 'تحميل...')}</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                  <svg width='44' height='44' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.2' strokeLinecap='round' strokeLinejoin='round'><path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' /><polyline points='14 2 14 8 20 8' /></svg>
                </div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t('No analyses yet.', 'لا توجد تحليلات بعد.')}</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--card-border)' }}>
                      {[
                        t('Image Type', 'نوع الصورة'),
                        t('Result', 'النتيجة'),
                        t('Confidence', 'الثقة'),
                        t('Date', 'التاريخ'),
                        t('Action', 'الإجراء'),
                        '',
                      ].map((h, i) => (
                        <th key={i} style={{ padding: '10px 12px', textAlign: ar ? 'right' : 'left', color: '#94a3b8', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(item => {
                      const sty = getStyle(item.classification);
                      const act = getActionBtn(item);
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f0f4f0', transition: 'background .15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f8fbfc'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          {/* Image type */}
                          <td style={{ padding: '12px 12px', fontWeight: 700, color: 'var(--text-main)' }}>
                            {item.imageType.toUpperCase()}
                          </td>
                          {/* Result badge */}
                          <td style={{ padding: '12px 12px' }}>
                            <span style={{ background: sty.bg, color: sty.color, border: `1px solid ${sty.color}30`, borderRadius: 99, padding: '4px 12px', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap' }}>
                              {item.classification}
                            </span>
                          </td>
                          {/* Confidence bar */}
                          <td style={{ padding: '12px 12px', minWidth: 120 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ flex: 1, height: 8, background: 'var(--bg-main)', border: '1px solid var(--card-border)', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.round(item.confidence * 100)}%`, background: sty.color, borderRadius: 99 }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: sty.color, minWidth: 34 }}>{Math.round(item.confidence * 100)}%</span>
                            </div>
                          </td>
                          {/* Date */}
                          <td style={{ padding: '12px 12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(item.createdAt)}</td>
                          {/* Action button */}
                          <td style={{ padding: '12px 12px' }}>
                            <a href={act.href}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--bg-main)', color: 'var(--text-main)', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 12, border: `1.5px solid var(--card-border)`, whiteSpace: 'nowrap' }}>
                              {act.label}
                            </a>
                          </td>
                          {/* Delete */}
                          <td style={{ padding: '12px 8px' }}>
                            <button onClick={async () => { await analysisApi.delete(item.id); setHistory(h => h.filter(x => x.id !== item.id)); }}
                              style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(220,53,69,0.3)', background: 'rgba(220,53,69,0.05)', color: '#dc3545', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <IconTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right: Account Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: 20, padding: '24px', border: '1px solid var(--card-border)', boxShadow: '0 2px 12px var(--shadow-main)' }}>
              <h3 style={{ fontWeight: 900, color: 'var(--text-main)', margin: '0 0 18px', fontSize: 18, display: 'flex', alignItems: 'center' }}>
                <IconSettings /> {t('Account Settings', 'إعدادات الحساب')}
              </h3>

              {/* Change password */}
              {!changePwd ? (
                <button onClick={() => setChangePwd(true)}
                  style={{ width: '100%', padding: '13px', background: 'var(--primary)', color: 'white', borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {t('Change Password', 'تغيير كلمة المرور')}
                </button>
              ) : (
                <div style={{ background: 'var(--bg-main)', borderRadius: 12, padding: '16px', marginBottom: 10, border: '1px solid var(--card-border)' }}>
                  {[
                    { key: 'current', label: t('Current Password', 'كلمة المرور الحالية') },
                    { key: 'newPwd', label: t('New Password', 'كلمة المرور الجديدة') },
                    { key: 'confirm', label: t('Confirm Password', 'تأكيد كلمة المرور') },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</label>
                      <input type="password" value={pwd[f.key as keyof typeof pwd]}
                        onChange={e => setPwd({ ...pwd, [f.key]: e.target.value })}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-main)', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--card-border)'} />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={handleChangePwd} style={{ flex: 1, padding: '9px', background: 'var(--primary)', color: 'white', borderRadius: 9, border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                      {t('Save', 'حفظ')}
                    </button>
                    <button onClick={() => { setChangePwd(false); setSaveErr(''); }} style={{ padding: '9px 14px', background: 'var(--bg-main)', color: 'var(--text-main)', borderRadius: 9, border: '1px solid var(--card-border)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                      {t('Cancel', 'إلغاء')}
                    </button>
                  </div>
                </div>
              )}

              {/* Delete account */}
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  style={{ width: '100%', padding: '13px', background: 'transparent', color: '#dc3545', borderRadius: 12, border: '1.5px solid #dc3545', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <IconTrash /> {t('Delete Account', 'حذف الحساب')}
                </button>
              ) : (
                <div style={{ background: 'rgba(220,53,69,0.05)', borderRadius: 12, padding: '14px', marginBottom: 10, border: '1.5px solid rgba(220,53,69,0.4)' }}>
                  <p style={{ fontSize: 13, color: '#dc3545', fontWeight: 700, margin: '0 0 12px' }}>
                    {t('This cannot be undone!', 'هذا الإجراء لا يمكن التراجع عنه!')}
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{ flex: 1, padding: '9px', background: '#dc3545', color: 'white', borderRadius: 9, border: 'none', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                      {t('Yes, Delete', 'نعم، احذف')}
                    </button>
                    <button onClick={() => setConfirmDelete(false)} style={{ padding: '9px 14px', background: 'var(--bg-main)', color: 'var(--text-main)', borderRadius: 9, border: '1px solid var(--card-border)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
                      {t('Cancel', 'إلغاء')}
                    </button>
                  </div>
                </div>
              )}

              {/* Logout */}
              <button onClick={handleLogout}
                style={{ width: '100%', padding: '13px', background: 'transparent', color: '#dc3545', borderRadius: 12, border: '1.5px solid #dc3545', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {t('Logout', 'تسجيل الخروج')}
              </button>
            </div>

            {/* Quick upload */}
            <a href="/upload" style={{ display: 'block', background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))', color: 'white', borderRadius: 16, padding: '18px', textAlign: 'center', textDecoration: 'none', fontWeight: 800, fontSize: 15, boxShadow: '0 4px 16px var(--shadow-main)' }}>
              {t('Upload New Scan', 'رفع صورة جديدة')}
            </a>
          </div>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>
    </div>
  );
}
