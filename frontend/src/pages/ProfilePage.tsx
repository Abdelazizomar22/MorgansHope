import { useEffect, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analysisApi, authApi } from '../utils/api';
import type { AnalysisResult } from '../types';

interface ProfilePageProps { lang: 'en' | 'ar'; }

const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const IconMail = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const IconPhone = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
const IconCamera = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
const IconEdit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>;
const IconShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const IconLock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const IconUpload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const IconTrash = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>;

const URGENCY_COLORS: Record<string, { bg: string; color: string }> = {
  Normal: { bg: '#f0fdf4', color: '#16a34a' },
  'No Finding': { bg: '#f0fdf4', color: '#16a34a' },
  Benign: { bg: '#fffbeb', color: '#d97706' },
  'Nodule/Mass': { bg: '#fff1f2', color: '#dc2626' },
  Adenocarcinoma: { bg: '#fff1f2', color: '#dc2626' },
  Large_Cell_Carcinoma: { bg: '#fff1f2', color: '#dc2626' },
  Squamous_Cell_Carcinoma: { bg: '#fff1f2', color: '#991b1b' },
  Malignant_General: { bg: '#fff1f2', color: '#dc2626' },
};

function getStyle(cls: string) {
  return URGENCY_COLORS[cls] || { bg: '#eef2ff', color: '#334155' };
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
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [focused, setFocused] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    age: user?.age ? String(user.age) : '',
    gender: user?.gender || '',
    smokingHistory: user?.smokingHistory || '',
    medicalHistory: user?.medicalHistory || '',
  });

  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' });
  const [saveMsg, setSaveMsg] = useState('');
  const [saveErr, setSaveErr] = useState('');

  useEffect(() => {
    analysisApi.getHistory(1, 50).then((r) => setHistory(r.data.data || [])).catch(() => { }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      age: user?.age ? String(user.age) : '',
      gender: user?.gender || '',
      smokingHistory: user?.smokingHistory || '',
      medicalHistory: user?.medicalHistory || '',
    });
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const apiBase = import.meta.env.VITE_API_URL || '/api';
  const uploadsBase = apiBase.replace(/\/api\/?$/, '/api/uploads');
  const avatarSrc = user?.profilePicture ? `${uploadsBase}/${user.profilePicture}` : '';
  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || 'U';

  const fieldStyle = (field: string, extra?: CSSProperties): CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: 14,
    border: `1.5px solid ${focused === field ? 'var(--primary)' : 'var(--card-border)'}`,
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: focused === field ? '0 0 0 4px rgba(var(--primary-rgb),0.08)' : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    ...extra,
  });

  const cardStyle: CSSProperties = {
    background: 'var(--card-bg)',
    borderRadius: 24,
    border: '1px solid var(--card-border)',
    boxShadow: '0 14px 40px var(--shadow-main)',
  };

  const secondaryButton: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    padding: '0 16px',
    borderRadius: 14,
    border: '1px solid var(--card-border)',
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 700,
  };

  const primaryButton: CSSProperties = {
    ...secondaryButton,
    border: 'none',
    background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
    color: '#fff',
    boxShadow: '0 14px 30px rgba(var(--primary-rgb),0.25)',
  };

  const handleSaveProfile = async () => {
    setSaveErr('');
    setSaveMsg('');
    try {
      const payload = {
        ...form,
        age: form.age ? parseInt(form.age, 10) : undefined,
        gender: (form.gender || undefined) as 'male' | 'female' | 'other' | undefined,
        smokingHistory: (form.smokingHistory || undefined) as 'never' | 'former' | 'current' | undefined,
      };
      const response = await authApi.updateProfile(payload);
      if (response.data.data) updateUser(response.data.data);
      setSaveMsg(t('Profile saved successfully.', 'تم حفظ الملف الشخصي بنجاح.'));
      setEditing(false);
    } catch (err: any) {
      setSaveErr(err?.response?.data?.message || t('Could not update profile.', 'تعذر تحديث الملف الشخصي.'));
    }
  };

  const handleAvatarClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        setAvatarUploading(true);
        setSaveErr('');
        const response = await authApi.uploadAvatar(file);
        if (response.data.data) updateUser(response.data.data);
        setSaveMsg(t('Profile photo updated.', 'تم تحديث صورة الملف الشخصي.'));
      } catch (err: any) {
        setSaveErr(err?.response?.data?.message || t('Could not upload photo.', 'تعذر رفع الصورة.'));
      } finally {
        setAvatarUploading(false);
      }
    };
    input.click();
  };

  const handleAvatarPress = () => {
    if (editing) {
      handleAvatarClick();
      return;
    }
    if (avatarSrc) {
      setShowAvatarPreview(true);
    }
  };

  const handleChangePwd = async () => {
    if (pwd.newPwd !== pwd.confirm) {
      setSaveErr(t("Passwords do not match.", 'كلمتا المرور غير متطابقتين.'));
      return;
    }
    setSaveErr('');
    setSaveMsg('');
    try {
      await authApi.updateProfile({ currentPassword: pwd.current, newPassword: pwd.newPwd });
      setSaveMsg(t('Password updated.', 'تم تحديث كلمة المرور.'));
      setChangePwd(false);
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err: any) {
      setSaveErr(err?.response?.data?.message || t('Could not update password.', 'تعذر تحديث كلمة المرور.'));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });

  const getActionBtn = (item: AnalysisResult) => {
    if (item.isMalignant) return { label: t('Recommended hospitals', 'المستشفيات المقترحة'), href: '/hospitals' };
    if (item.imageType === 'xray') return { label: t('Open PDF', 'فتح PDF'), href: `/results?id=${item.id}` };
    return { label: t('Open report', 'فتح التقرير'), href: `/results?id=${item.id}` };
  };

  const infoRow = (label: string, value?: string | null) => (
    <div style={{ padding: '14px 0', borderTop: '1px solid color-mix(in srgb, var(--card-border) 88%, transparent)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: value ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1.6 }}>
        {value || t('Not added yet', 'لم تتم إضافته بعد')}
      </div>
    </div>
  );

  return (
    <div dir={ar ? 'rtl' : 'ltr'} style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif", padding: isMobile ? '20px 14px 36px' : '32px 24px 48px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto' }}>
        <div style={{ ...cardStyle, padding: isMobile ? 20 : 28, marginBottom: 20, background: 'linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 95%, transparent), var(--card-bg))' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1, minWidth: 260 }}>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={handleAvatarPress}
                  disabled={avatarUploading}
                  style={{ width: isMobile ? 88 : 104, height: isMobile ? 88 : 104, borderRadius: '50%', border: '2px solid rgba(var(--primary-rgb),0.32)', background: 'linear-gradient(180deg, rgba(var(--primary-rgb),0.18), rgba(var(--primary-rgb),0.08))', color: 'var(--primary)', display: 'grid', placeItems: 'center', overflow: 'hidden', cursor: avatarUploading ? 'default' : (editing || avatarSrc ? 'pointer' : 'default') }}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: isMobile ? 34 : 40, fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>
                      {userInitial}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={avatarUploading}
                  aria-label={t('Change profile photo', 'تغيير صورة الملف الشخصي')}
                  style={{ position: 'absolute', bottom: 2, [ar ? 'left' : 'right']: 2, width: 32, height: 32, borderRadius: '50%', background: 'var(--card-bg)', border: '1px solid var(--card-border)', display: 'grid', placeItems: 'center', color: 'var(--primary)', cursor: avatarUploading ? 'default' : 'pointer', boxShadow: '0 6px 16px rgba(15,23,42,0.12)' }}
                >
                  <IconCamera />
                </button>
              </div>

              <div style={{ flex: 1, minWidth: 220 }}>
                <h1 style={{ margin: '0 0 8px', fontSize: isMobile ? 28 : 34, lineHeight: 1.05, letterSpacing: -0.7 }}>
                  {user?.firstName} {user?.lastName}
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: 'var(--text-muted)', fontSize: 14 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconMail /> {user?.email}</span>
                  {user?.phone && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><IconPhone /> {user.phone}</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: ar ? 'flex-start' : 'flex-end' }}>
              <button type="button" onClick={() => setEditing((value) => !value)} style={editing ? secondaryButton : primaryButton}>
                <IconEdit />
                {editing ? t('Close editing', 'إغلاق التعديل') : t('Edit profile', 'تعديل الملف الشخصي')}
              </button>
              <a href="/upload" style={{ ...secondaryButton, textDecoration: 'none' }}>
                <IconUpload />
                {t('Upload scan', 'رفع صورة')}
              </a>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))', gap: 12, marginTop: 18 }}>
            {[
              {
                value: history.length,
                label: t('Total analyses', 'إجمالي التحليلات'),
                color: 'var(--primary)',
                bg: 'rgba(var(--primary-rgb),0.08)',
                border: 'rgba(var(--primary-rgb),0.14)',
              },
              {
                value: history.filter((item) => item.isMalignant).length,
                label: t('Cases needing follow-up', 'حالات تحتاج متابعة'),
                color: '#dc2626',
                bg: 'rgba(220,38,38,0.08)',
                border: 'rgba(220,38,38,0.16)',
              },
              {
                value: history.filter((item) => !item.isMalignant && item.hasFindings).length,
                label: t('Detected findings', 'نتائج مكتشفة'),
                color: '#d97706',
                bg: 'rgba(217,119,6,0.08)',
                border: 'rgba(217,119,6,0.16)',
              },
            ].map((item) => (
              <div key={item.label} style={{ padding: '16px 18px', borderRadius: 18, border: `1px solid ${item.border}`, background: item.bg }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: item.color, marginBottom: 4 }}>{item.value}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            ))}
          </div>

          {(saveMsg || saveErr) && (
            <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 14, border: `1px solid ${saveErr ? 'rgba(220,38,38,0.22)' : 'rgba(var(--primary-rgb),0.18)'}`, background: saveErr ? 'rgba(220,38,38,0.06)' : 'rgba(var(--primary-rgb),0.06)', color: saveErr ? '#dc2626' : 'var(--primary)', fontSize: 13, fontWeight: 700 }}>
              {saveErr || saveMsg}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.7fr) minmax(300px, 0.9fr)', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ ...cardStyle, padding: isMobile ? 20 : 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>{t('Personal information', 'المعلومات الشخصية')}</h2>
                  <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
                    {t('Manage your main account details here.', 'يمكنك تعديل بيانات الحساب الأساسية من هنا.')}
                  </p>
                </div>
              </div>

              {editing ? (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                  {[
                    { key: 'firstName', label: t('First name', 'الاسم الأول'), type: 'text' },
                    { key: 'lastName', label: t('Last name', 'اسم العائلة'), type: 'text' },
                    { key: 'phone', label: t('Phone', 'الهاتف'), type: 'tel' },
                    { key: 'age', label: t('Age', 'العمر'), type: 'number' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{field.label}</label>
                      <input
                        type={field.type}
                        value={form[field.key as keyof typeof form] || ''}
                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        onFocus={() => setFocused(field.key)}
                        onBlur={() => setFocused('')}
                        style={fieldStyle(field.key)}
                      />
                    </div>
                  ))}

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{t('Gender', 'النوع')}</label>
                    <select
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      onFocus={() => setFocused('gender')}
                      onBlur={() => setFocused('')}
                      style={fieldStyle('gender', { appearance: 'none' })}
                    >
                      <option value="">{t('Select', 'اختر')}</option>
                      <option value="male">{t('Male', 'ذكر')}</option>
                      <option value="female">{t('Female', 'أنثى')}</option>
                      <option value="other">{t('Other', 'أخرى')}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{t('Smoking history', 'تاريخ التدخين')}</label>
                    <select
                      value={form.smokingHistory}
                      onChange={(e) => setForm({ ...form, smokingHistory: e.target.value })}
                      onFocus={() => setFocused('smokingHistory')}
                      onBlur={() => setFocused('')}
                      style={fieldStyle('smokingHistory', { appearance: 'none' })}
                    >
                      <option value="">{t('Select', 'اختر')}</option>
                      <option value="never">{t('Never smoked', 'لم أدخن')}</option>
                      <option value="former">{t('Former smoker', 'مدخن سابق')}</option>
                      <option value="current">{t('Current smoker', 'مدخن حالي')}</option>
                    </select>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{t('Medical history', 'التاريخ المرضي')}</label>
                    <textarea
                      rows={4}
                      value={form.medicalHistory}
                      onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
                      onFocus={() => setFocused('medicalHistory')}
                      onBlur={() => setFocused('')}
                      style={fieldStyle('medicalHistory', { resize: 'vertical' })}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={handleSaveProfile} style={primaryButton}>{t('Save changes', 'حفظ التغييرات')}</button>
                    <button type="button" onClick={() => { setEditing(false); setSaveErr(''); }} style={secondaryButton}>{t('Cancel', 'إلغاء')}</button>
                  </div>
                </div>
              ) : (
                <div>
                  {infoRow(t('Full name', 'الاسم الكامل'), `${user?.firstName || ''} ${user?.lastName || ''}`.trim())}
                  {infoRow(t('Phone', 'الهاتف'), user?.phone || '')}
                  {infoRow(t('Age', 'العمر'), user?.age ? `${user.age}` : '')}
                  {infoRow(t('Gender', 'النوع'), user?.gender ? (user.gender === 'male' ? t('Male', 'ذكر') : user.gender === 'female' ? t('Female', 'أنثى') : t('Other', 'أخرى')) : '')}
                  {infoRow(t('Smoking history', 'تاريخ التدخين'), user?.smokingHistory ? (user.smokingHistory === 'never' ? t('Never smoked', 'لم أدخن') : user.smokingHistory === 'former' ? t('Former smoker', 'مدخن سابق') : t('Current smoker', 'مدخن حالي')) : '')}
                  {infoRow(t('Medical history', 'التاريخ المرضي'), user?.medicalHistory || '')}
                </div>
              )}
            </div>

            <div style={{ ...cardStyle, padding: isMobile ? 20 : 24 }}>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>{t('Analysis history', 'سجل التحليلات')}</h2>
                <p style={{ margin: '6px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  {t('Review past results and open the related report quickly.', 'راجع النتائج السابقة وافتح التقرير المرتبط بسرعة.')}
                </p>
              </div>

              {loading ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 10px' }}>{t('Loading history...', 'جارٍ تحميل السجل...')}</div>
              ) : history.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 10px' }}>{t('No analyses yet.', 'لا توجد تحليلات بعد.')}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {history.map((item) => {
                    const state = getStyle(item.classification);
                    const action = getActionBtn(item);
                    return (
                      <div key={item.id} style={{ border: '1px solid var(--card-border)', borderRadius: 18, padding: isMobile ? 14 : 16 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ minWidth: 180, flex: 1 }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                              <strong style={{ fontSize: 15 }}>{item.imageType.toUpperCase()}</strong>
                              <span style={{ padding: '5px 10px', borderRadius: 999, background: state.bg, color: state.color, fontSize: 12, fontWeight: 800 }}>
                                {item.classification}
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: 'var(--text-muted)', fontSize: 13 }}>
                              <span>{t('Date', 'التاريخ')}: {formatDate(item.createdAt)}</span>
                              <span>{t('Confidence', 'الثقة')}: {Math.round(item.confidence * 100)}%</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            <a href={action.href} style={{ ...secondaryButton, textDecoration: 'none', minHeight: 40 }}>
                              {action.label}
                            </a>
                            <button
                              type="button"
                              onClick={async () => {
                                await analysisApi.delete(item.id);
                                setHistory((current) => current.filter((entry) => entry.id !== item.id));
                              }}
                              style={{ ...secondaryButton, minHeight: 40, color: '#dc2626', border: '1px solid rgba(220,38,38,0.24)' }}
                            >
                              <IconTrash />
                              {t('Delete', 'حذف')}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ ...cardStyle, padding: isMobile ? 20 : 24 }}>
              <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>{t('Account controls', 'التحكم في الحساب')}</h2>
              <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                {t('Common actions are grouped in one place for quicker access.', 'تم جمع الإجراءات المتكررة في مكان واحد لسهولة الوصول.')}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button type="button" onClick={() => setChangePwd((value) => !value)} style={{ ...secondaryButton, width: '100%', justifyContent: 'center' }}>
                  <IconLock />
                  {changePwd ? t('Hide password form', 'إخفاء نموذج كلمة المرور') : t('Change password', 'تغيير كلمة المرور')}
                </button>
                <button type="button" onClick={handleAvatarClick} disabled={avatarUploading} style={{ ...secondaryButton, width: '100%', justifyContent: 'center' }}>
                  <IconCamera />
                  {avatarUploading ? t('Uploading photo...', 'جارٍ رفع الصورة...') : t('Update profile photo', 'تحديث صورة الملف الشخصي')}
                </button>
                <a href="/upload" style={{ ...primaryButton, width: '100%', justifyContent: 'center', textDecoration: 'none' }}>
                  <IconUpload />
                  {t('Upload a new scan', 'رفع صورة جديدة')}
                </a>
                <button type="button" onClick={handleLogout} style={{ ...secondaryButton, width: '100%', justifyContent: 'center', color: '#dc2626', border: '1px solid rgba(220,38,38,0.24)' }}>
                  {t('Sign out', 'تسجيل الخروج')}
                </button>
              </div>

              {changePwd && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--card-border)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { key: 'current', label: t('Current password', 'كلمة المرور الحالية') },
                      { key: 'newPwd', label: t('New password', 'كلمة المرور الجديدة') },
                      { key: 'confirm', label: t('Confirm new password', 'تأكيد كلمة المرور الجديدة') },
                    ].map((field) => (
                      <div key={field.key}>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{field.label}</label>
                        <input
                          type="password"
                          value={pwd[field.key as keyof typeof pwd]}
                          onChange={(e) => setPwd({ ...pwd, [field.key]: e.target.value })}
                          onFocus={() => setFocused(field.key)}
                          onBlur={() => setFocused('')}
                          style={fieldStyle(field.key, { letterSpacing: '0.18em' })}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                    <button type="button" onClick={handleChangePwd} style={primaryButton}>{t('Save password', 'حفظ كلمة المرور')}</button>
                    <button type="button" onClick={() => { setChangePwd(false); setSaveErr(''); }} style={secondaryButton}>{t('Cancel', 'إلغاء')}</button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ ...cardStyle, padding: isMobile ? 20 : 24 }}>
              <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>{t('Privacy notice', 'ملاحظة الخصوصية')}</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>
                {t('Your account information and uploaded scans stay protected and are only used inside your medical workflow.', 'بيانات حسابك والصور المرفوعة تبقى محمية وتستخدم فقط داخل مسار المتابعة الطبية الخاص بك.')}
              </p>
            </div>

            <div style={{ ...cardStyle, padding: isMobile ? 20 : 24, border: '1px solid rgba(220,38,38,0.18)' }}>
              <h2 style={{ margin: '0 0 6px', fontSize: 20, color: '#dc2626' }}>{t('Danger zone', 'منطقة حساسة')}</h2>
              <p style={{ margin: '0 0 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                {t('Use this only if you really want to remove your account.', 'استخدم هذا الخيار فقط إذا كنت تريد حذف الحساب بالفعل.')}
              </p>

              {!confirmDelete ? (
                <button type="button" onClick={() => setConfirmDelete(true)} style={{ ...secondaryButton, width: '100%', justifyContent: 'center', color: '#dc2626', border: '1px solid rgba(220,38,38,0.24)' }}>
                  <IconTrash />
                  {t('Delete account', 'حذف الحساب')}
                </button>
              ) : (
                <div style={{ padding: 14, borderRadius: 16, background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.18)' }}>
                  <p style={{ margin: '0 0 12px', color: '#dc2626', fontSize: 13, fontWeight: 700 }}>
                    {t('This action cannot be undone.', 'لا يمكن التراجع عن هذا الإجراء.')}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    <button type="button" style={{ ...primaryButton, background: '#dc2626', boxShadow: 'none' }}>
                      {t('Confirm delete', 'تأكيد الحذف')}
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(false)} style={secondaryButton}>
                      {t('Cancel', 'إلغاء')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showAvatarPreview && avatarSrc && (
        <div
          onClick={() => setShowAvatarPreview(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 50 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: 520, width: '100%', padding: 14, borderRadius: 28, background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: '0 24px 70px rgba(15,23,42,0.32)' }}
          >
            <button
              type="button"
              onClick={() => setShowAvatarPreview(false)}
              style={{ position: 'absolute', top: 14, [ar ? 'left' : 'right']: 14, width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--card-border)', background: 'var(--card-bg)', color: 'var(--text-main)', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
            >
              ×
            </button>
            <img src={avatarSrc} alt="Profile preview" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 22, display: 'block' }} />
          </div>
        </div>
      )}

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>
    </div>
  );
}
