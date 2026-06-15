import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analysisApi, authApi } from '../utils/api';
import { API_BASE_URL } from '../utils/env';
import type { AnalysisResult } from '../types';
import { HiEnvelope, HiPhone, HiCamera, HiPencilSquare, HiLockClosed, HiCloudArrowUp, HiTrash } from 'react-icons/hi2';
import { Toaster, toast } from 'sonner';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

interface ProfilePageProps { lang: 'en' | 'ar'; }

const URGENCY_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  Normal: { bg: '#f0fdf4', color: '#16a34a', label: 'Normal' },
  'No Finding': { bg: '#f0fdf4', color: '#16a34a', label: 'No Finding' },
  Benign: { bg: '#fffbeb', color: '#d97706', label: 'Benign' },
  'Nodule/Mass': { bg: '#fff1f2', color: '#dc2626', label: 'Nodule/Mass' },
  Adenocarcinoma: { bg: '#fff1f2', color: '#dc2626', label: 'Adenocarcinoma' },
  Large_Cell_Carcinoma: { bg: '#fff1f2', color: '#dc2626', label: 'Large Cell Carcinoma' },
  Squamous_Cell_Carcinoma: { bg: '#fff1f2', color: '#991b1b', label: 'Squamous Cell Carcinoma' },
  Malignant_General: { bg: '#fff1f2', color: '#dc2626', label: 'Malignant' },
};

const IMAGE_TYPE_COLORS: Record<string, string> = {
  ct: '#2563eb',
  xray: 'var(--primary)',
};

function getStyle(cls: string) {
  return URGENCY_COLORS[cls] || { bg: '#eef2ff', color: '#334155', label: cls };
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
  const [imageTypeFilter, setImageTypeFilter] = useState<'all' | 'ct' | 'xray'>('all');
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; loading: boolean }>({ open: false, id: null, loading: false });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showAvatarPreview, setShowAvatarPreview] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
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

  const apiBase = API_BASE_URL;
  const uploadsBase = apiBase.replace(/\/api\/?$/, '/api/uploads');
  const avatarSrc = user?.profilePicture
    ? (/^https?:\/\//i.test(user.profilePicture) || user.profilePicture.startsWith('data:')
      ? user.profilePicture
      : `${uploadsBase}/${user.profilePicture}`)
    : '';
  const userInitial = user?.firstName?.[0]?.toUpperCase() || user?.lastName?.[0]?.toUpperCase() || 'U';

  const fieldStyle = (field: string) => ({
    width: '100%',
    padding: '12px 14px',
    borderRadius: 14,
    border: `1.5px solid ${focused === field ? 'var(--primary)' : 'var(--card-border)'}`,
    background: 'var(--card-bg)',
    color: 'var(--text-main)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
    boxShadow: focused === field ? '0 0 0 4px rgba(var(--primary-rgb),0.08)' : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  });

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
      toast.success(t('Profile saved successfully.', 'تم حفظ الملف الشخصي بنجاح.'));
      setEditing(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || t('Could not update profile.', 'تعذر تحديث الملف الشخصي.');
      toast.error(msg);
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
        toast.success(t('Profile photo updated.', 'تم تحديث صورة الملف الشخصي.'));
      } catch (err: any) {
        toast.error(err?.response?.data?.message || t('Could not upload photo.', 'تعذر رفع الصورة.'));
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
    if (avatarSrc && !avatarFailed) {
      setShowAvatarPreview(true);
    }
  };

  const handleChangePwd = async () => {
    if (pwd.newPwd !== pwd.confirm) {
      toast.error(t("Passwords do not match.", 'كلمتا المرور غير متطابقتين.'));
      return;
    }
    setSaveErr('');
    setSaveMsg('');
    try {
      await authApi.updateProfile({ currentPassword: pwd.current, newPassword: pwd.newPwd });
      toast.success(t('Password updated.', 'تم تحديث كلمة المرور.'));
      setChangePwd(false);
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('Could not update password.', 'تعذر تحديث كلمة المرور.'));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAnalysis = async () => {
    if (deleteModal.id === null) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await analysisApi.delete(deleteModal.id);
      setHistory((current) => current.filter((entry) => entry.id !== deleteModal.id));
      toast.success(t('Analysis deleted.', 'تم حذف التحليل.'));
      setDeleteModal({ open: false, id: null, loading: false });
    } catch {
      toast.error(t('Could not delete analysis.', 'تعذر حذف التحليل.'));
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });

  const formatTime = (date: string) => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const groupByDate = (items: AnalysisResult[]) => {
    const groups: Record<string, AnalysisResult[]> = {};
    for (const item of items) {
      const key = new Date(item.createdAt).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  };

  const groupedHistory = groupByDate(history);

  const filteredHistory = groupedHistory
    .map(([dateKey, items]) => [dateKey, imageTypeFilter === 'all' ? items : items.filter((item) => item.imageType.toLowerCase() === imageTypeFilter)] as [string, AnalysisResult[]])
    .filter(([, items]) => items.length > 0);

  const statCards = [
    {
      value: history.length,
      label: t('Total analyses', 'إجمالي التحليلات'),
      // icon: HiChartBar,
      color: 'var(--primary)',
      bg: 'rgba(var(--primary-rgb),0.08)',
      border: 'rgba(var(--primary-rgb),0.14)',
    },
    {
      value: history.filter((item) => item.isMalignant).length,
      label: t('Cases needing follow-up', 'حالات تحتاج متابعة'),
      // icon: HiExclamationTriangle,
      color: '#dc2626',
      bg: 'rgba(220,38,38,0.08)',
      border: 'rgba(220,38,38,0.16)',
    },
    {
      value: history.filter((item) => !item.isMalignant && item.hasFindings).length,
      label: t('Detected findings', 'نتائج مكتشفة'),
      // icon: HiMagnifyingGlass,
      color: '#d97706',
      bg: 'rgba(217,119,6,0.08)',
      border: 'rgba(217,119,6,0.16)',
    },
  ];

  return (
    <>
      <Toaster
        position={ar ? 'top-left' : 'top-right'}
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            border: '1px solid var(--card-border)',
            fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif",
          },
        }}
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, loading: false })}
        onConfirm={handleDeleteAnalysis}
        loading={deleteModal.loading}
        title={t('Delete analysis?', 'حذف التحليل؟')}
        description={t(
          'This will permanently remove this analysis report from your history. This action cannot be undone.',
          'سيؤدي هذا إلى حذف تقرير التحليل هذا من سجلك بشكل دائم. لا يمكن التراجع عن هذا الإجراء.'
        )}
      />

      <div
        dir={ar ? 'rtl' : 'ltr'}
        className="min-h-screen"
        style={{
          background: 'var(--bg-main)',
          color: 'var(--text-main)',
          fontFamily: ar ? "'Cairo', sans-serif" : "'Sora', sans-serif",
        }}
      >
        {/* Background decorative elements */}
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 10% 30%, rgba(var(--primary-rgb),0.06), transparent 50%),
              radial-gradient(ellipse at 90% 70%, rgba(var(--primary-rgb),0.04), transparent 50%)
            `,
          }}
        />

        <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10 lg:px-8 lg:py-12">
          {/* ── Header / Hero ── */}
          <div
            className="relative mb-6 overflow-hidden rounded-3xl border p-6 md:p-8"
            style={{
              background: 'linear-gradient(160deg, var(--card-bg), color-mix(in srgb, var(--card-bg) 88%, var(--primary)))',
              borderColor: 'color-mix(in srgb, var(--primary) 12%, var(--card-border))',
              boxShadow: '0 12px 40px rgba(var(--primary-rgb),0.08)',
            }}
          >
            <div>
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex flex-1 flex-wrap items-center gap-4 min-w-[260px]">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={handleAvatarPress}
                      disabled={avatarUploading}
                      className="overflow-hidden rounded-full border-2"
                      style={{
                        width: isMobile ? 88 : 104,
                        height: isMobile ? 88 : 104,
                        borderColor: 'rgba(var(--primary-rgb),0.32)',
                        background: 'linear-gradient(180deg, rgba(var(--primary-rgb),0.18), rgba(var(--primary-rgb),0.08))',
                        color: 'var(--primary)',
                        cursor: avatarUploading ? 'default' : (editing || avatarSrc ? 'pointer' : 'default'),
                        display: 'grid',
                        placeItems: 'center',
                      }}
                    >
                      {avatarSrc && !avatarFailed ? (
                        <img
                          src={avatarSrc}
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          onError={() => setAvatarFailed(true)}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className="font-black leading-none"
                          style={{ fontSize: isMobile ? 34 : 40, color: 'var(--primary)' }}
                        >
                          {userInitial}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      disabled={avatarUploading}
                      aria-label={t('Change profile photo', 'تغيير صورة الملف الشخصي')}
                      className="absolute bottom-0.5 grid place-items-center rounded-full border bg-white shadow-md"
                      style={{
                        [ar ? 'left' : 'right']: 2,
                        width: 32,
                        height: 32,
                        borderColor: 'var(--card-border)',
                        color: 'var(--primary)',
                        cursor: avatarUploading ? 'default' : 'pointer',
                      }}
                    >
                      <HiCamera size={16} />
                    </button>
                  </div>

                  {/* Name & Contact */}
                  <div className="min-w-[200px] flex-1">
                    <h1
                      className="m-0 font-black leading-tight tracking-tight"
                      style={{ fontSize: isMobile ? 28 : 34, letterSpacing: '-0.7px' }}
                    >
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <span className="inline-flex items-center gap-1.5">
                        <HiEnvelope size={15} /> {user?.email}
                      </span>
                      {user?.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <HiPhone size={15} /> {user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-2.5" style={{ justifyContent: ar ? 'flex-start' : 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setEditing((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition"
                    style={{
                      border: '1px solid var(--card-border)',
                      background: editing ? 'var(--destructive)' : 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                      color: '#fff',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <HiPencilSquare size={16} />
                    {editing ? t('Close editing', 'إغلاق التعديل') : t('Edit profile', 'تعديل الملف الشخصي')}
                  </button>
                  <a
                    href="/upload"
                    className="inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold no-underline transition"
                    style={{
                      borderColor: 'var(--card-border)',
                      background: 'var(--card-bg)',
                      color: 'var(--text-main)',
                    }}
                  >
                    <HiCloudArrowUp size={16} />
                    {t('Upload scan', 'رفع صورة')}
                  </a>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div
              className="mt-5 grid gap-3"
              style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))' }}
            >
              {statCards.map((item) => {
                // const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl p-4"
                    style={{ border: `1px solid ${item.border}`, background: item.bg }}
                  >
                    <div className="flex items-center gap-3">
                      {/*<Icon size={22} style={{ color: item.color }} />*/}
                      <div>
                        <div className="text-2xl font-black" style={{ color: item.color }}>{item.value}</div>
                        <div className="mt-0.5 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save / Error messages */}
            {(saveMsg || saveErr) && (
              <div
              className="mt-4 rounded-2xl px-4 py-3 text-sm font-bold"
                style={{
                  border: `1px solid ${saveErr ? 'rgba(220,38,38,0.22)' : 'rgba(var(--primary-rgb),0.18)'}`,
                  background: saveErr ? 'rgba(220,38,38,0.06)' : 'rgba(var(--primary-rgb),0.06)',
                  color: saveErr ? '#dc2626' : 'var(--primary)',
                }}
              >
                {saveErr || saveMsg}
              </div>
            )}
          </div>

          {/* ── Main Content Grid ── */}
          <div
            className="grid gap-6"
            style={{ gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.6fr) minmax(300px, 1fr)' }}
          >
            {/* ── Left Column ── */}
            <div className="flex flex-col gap-6">

              {/* Personal Information */}
              <div
                className="rounded-2xl border p-5 md:p-6"
                style={{
                  borderColor: 'color-mix(in srgb, var(--primary) 8%, var(--card-border))',
                  background: 'linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 90%, transparent), var(--card-bg))',
                  boxShadow: '0 6px 24px rgba(var(--primary-rgb),0.05)',
                }}
              >
                <div className="mb-5">
                  <h2 className="m-0 text-xl font-black" style={{ color: 'var(--text-main)' }}>
                    {t('Personal information', 'المعلومات الشخصية')}
                  </h2>
                  <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {t('Manage your main account details here.', 'يمكنك تعديل بيانات الحساب الأساسية من هنا.')}
                  </p>
                </div>

                {editing ? (
                  <div className="grid gap-3" style={{ gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))' }}>
                    {[
                      { key: 'firstName', label: t('First name', 'الاسم الأول'), type: 'text' },
                      { key: 'lastName', label: t('Last name', 'اسم العائلة'), type: 'text' },
                      { key: 'phone', label: t('Phone', 'الهاتف'), type: 'tel' },
                      { key: 'age', label: t('Age', 'العمر'), type: 'number' },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="mb-1.5 block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{field.label}</label>
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
                      <label className="mb-1.5 block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{t('Gender', 'النوع')}</label>
                      <select
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        onFocus={() => setFocused('gender')}
                        onBlur={() => setFocused('')}
                        style={{ ...fieldStyle('gender'), appearance: 'none' }}
                      >
                        <option value="">{t('Select', 'اختر')}</option>
                        <option value="male">{t('Male', 'ذكر')}</option>
                        <option value="female">{t('Female', 'أنثى')}</option>
                        <option value="other">{t('Other', 'أخرى')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{t('Smoking history', 'تاريخ التدخين')}</label>
                      <select
                        value={form.smokingHistory}
                        onChange={(e) => setForm({ ...form, smokingHistory: e.target.value })}
                        onFocus={() => setFocused('smokingHistory')}
                        onBlur={() => setFocused('')}
                        style={{ ...fieldStyle('smokingHistory'), appearance: 'none' }}
                      >
                        <option value="">{t('Select', 'اختر')}</option>
                        <option value="never">{t('Never smoked', 'لم أدخن')}</option>
                        <option value="former">{t('Former smoker', 'مدخن سابق')}</option>
                        <option value="current">{t('Current smoker', 'مدخن حالي')}</option>
                      </select>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{t('Medical history', 'التاريخ المرضي')}</label>
                      <textarea
                        rows={4}
                        value={form.medicalHistory}
                        onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })}
                        onFocus={() => setFocused('medicalHistory')}
                        onBlur={() => setFocused('')}
                        style={{ ...fieldStyle('medicalHistory'), resize: 'vertical' }}
                      />
                    </div>

                    <div className="col-span-1 mt-1 flex flex-wrap gap-2.5 md:col-span-2">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="inline-flex items-center gap-2 rounded-2xl border-none px-5 py-2.5 text-sm font-bold text-white transition"
                        style={{
                          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                          boxShadow: '0 10px 24px rgba(var(--primary-rgb),0.2)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {t('Save changes', 'حفظ التغييرات')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditing(false); setSaveErr(''); }}
                        className="inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-bold transition"
                        style={{
                          borderColor: 'var(--card-border)',
                          background: 'var(--card-bg)',
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {t('Cancel', 'إلغاء')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {([
                      { label: t('Full name', 'الاسم الكامل'), value: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() },
                      { label: t('Phone', 'الهاتف'), value: user?.phone || '' },
                      { label: t('Age', 'العمر'), value: user?.age ? `${user.age}` : '' },
                      { label: t('Gender', 'النوع'), value: user?.gender ? (user.gender === 'male' ? t('Male', 'ذكر') : user.gender === 'female' ? t('Female', 'أنثى') : t('Other', 'أخرى')) : '' },
                      { label: t('Smoking history', 'تاريخ التدخين'), value: user?.smokingHistory ? (user.smokingHistory === 'never' ? t('Never smoked', 'لم أدخن') : user.smokingHistory === 'former' ? t('Former smoker', 'مدخن سابق') : t('Current smoker', 'مدخن حالي')) : '' },
                      { label: t('Medical history', 'التاريخ المرضي'), value: user?.medicalHistory || '' },
                    ] as { label: string; value: string }[]).map((row, i) => (
                      <div
                        key={row.label}
                        className="py-3.5"
                        style={{ borderTop: i === 0 ? 'none' : '1px solid color-mix(in srgb, var(--card-border) 88%, transparent)' }}
                      >
                        <div className="mb-1 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{row.label}</div>
                        <div className="text-sm leading-relaxed" style={{ color: row.value ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {row.value || t('Not added yet', 'لم تتم إضافته بعد')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Analysis History */}
              <div
                className="rounded-2xl border p-5 md:p-6"
                style={{
                  borderColor: 'color-mix(in srgb, var(--primary) 8%, var(--card-border))',
                  background: 'linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 90%, transparent), var(--card-bg))',
                  boxShadow: '0 6px 24px rgba(var(--primary-rgb),0.05)',
                }}
              >
                <div className="mb-5">
                  <h2 className="m-0 text-xl font-black" style={{ color: 'var(--text-main)' }}>
                    {t('Analysis history', 'سجل التحليلات')}
                  </h2>
                  <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                    {t('Review past results and open the related report quickly.', 'راجع النتائج السابقة وافتح التقرير المرتبط بسرعة.')}
                  </p>
                </div>

                {history.length > 0 && (
                  <div className="mb-4 flex gap-2">
                    {(['all', 'ct', 'xray'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setImageTypeFilter(type)}
                        className="rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wide transition"
                        style={{
                          borderColor: imageTypeFilter === type ? 'var(--primary)' : 'var(--card-border)',
                          background: imageTypeFilter === type ? 'var(--primary)' : 'var(--card-bg)',
                          color: imageTypeFilter === type ? '#fff' : 'var(--text-muted)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {type === 'all' ? t('All', 'الكل') : type.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}

                {loading ? (
                  <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    {t('Loading history...', 'جارٍ تحميل السجل...')}
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    {t('No analyses yet.', 'لا توجد تحليلات بعد.')}
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {filteredHistory.map(([dateKey, items]) => (
                      <div key={dateKey}>
                        <div
                          className="mb-2.5 text-xs font-black uppercase tracking-wider"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {formatDate(items[0].createdAt)}
                        </div>
                        <div className="flex flex-col gap-2.5">
                          {items.map((item) => {
                            const state = getStyle(item.classification);
                            const typeColor = IMAGE_TYPE_COLORS[item.imageType.toLowerCase()] || state.color;
                            return (
                              <div
                                key={item.id}
                                className="overflow-hidden rounded-2xl border transition hover:shadow-md"
                                style={{
                                  borderColor: 'var(--card-border)',
                                  borderInlineStart: `4px solid ${typeColor}`,
                                }}
                              >
                                <div className="p-4 md:p-5">
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                      <div className="mb-2 flex flex-wrap items-center gap-2.5">
                                        <span className="font-bold" style={{ fontSize: 15 }}>{item.imageType.toUpperCase()}</span>
                                        <span
                                          className="rounded-full px-2.5 py-1 text-xs font-bold leading-none"
                                          style={{ background: state.bg, color: state.color }}
                                        >
                                          {item.classification}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                                        <span>{t('Time', 'الوقت')}: {formatTime(item.createdAt)}</span>
                                        <span>{t('Confidence', 'الثقة')}: {Math.round(item.confidence * 100)}%</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex flex-wrap items-center gap-2.5" style={{ justifyContent: ar ? 'flex-start' : 'flex-end' }}>
                                    <a
                                      href={`/results?id=${item.id}`}
                                      className="inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2 text-sm font-bold no-underline transition"
                                      style={{
                                        borderColor: 'var(--card-border)',
                                        background: 'var(--card-bg)',
                                        color: 'var(--text-main)',
                                      }}
                                    >
                                      {t('View report', 'عرض التقرير')}
                                    </a>
                                    {item.isMalignant && (
                                      <a
                                        href="/hospitals"
                                        className="inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2 text-sm font-bold no-underline transition"
                                        style={{
                                          borderColor: 'var(--card-border)',
                                          background: 'var(--card-bg)',
                                          color: 'var(--text-main)',
                                        }}
                                      >
                                        {t('Recommended hospitals', 'المستشفيات المقترحة')}
                                      </a>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setDeleteModal({ open: true, id: item.id, loading: false })}
                                      className="inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2 text-sm font-bold transition"
                                      style={{
                                        borderColor: 'rgba(220,38,38,0.24)',
                                        background: 'var(--card-bg)',
                                        color: '#dc2626',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                      }}
                                    >
                                      <HiTrash size={15} />
                                      {t('Delete', 'حذف')}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Column / Sidebar ── */}
            <div className="flex flex-col gap-6">

              {/* Account Controls */}
              <div
                className="rounded-2xl border p-5 md:p-6"
                style={{
                  borderColor: 'color-mix(in srgb, var(--primary) 8%, var(--card-border))',
                  background: 'linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 90%, transparent), var(--card-bg))',
                  boxShadow: '0 6px 24px rgba(var(--primary-rgb),0.05)',
                }}
              >
                <h2 className="m-0 text-xl font-black" style={{ color: 'var(--text-main)' }}>
                  {t('Account controls', 'التحكم في الحساب')}
                </h2>
                <p className="mb-4 mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {t('Common actions are grouped in one place for quicker access.', 'تم جمع الإجراءات المتكررة في مكان واحد لسهولة الوصول.')}
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setChangePwd((v) => !v)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition"
                    style={{
                      borderColor: 'var(--card-border)',
                      background: 'var(--card-bg)',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <HiLockClosed size={16} />
                    {changePwd ? t('Hide password form', 'إخفاء نموذج كلمة المرور') : t('Change password', 'تغيير كلمة المرور')}
                  </button>

                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    disabled={avatarUploading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition"
                    style={{
                      borderColor: 'var(--card-border)',
                      background: 'var(--card-bg)',
                      color: 'var(--text-main)',
                      cursor: avatarUploading ? 'default' : 'pointer',
                      opacity: avatarUploading ? 0.7 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    <HiCamera size={16} />
                    {avatarUploading ? t('Uploading photo...', 'جارٍ رفع الصورة...') : t('Update profile photo', 'تحديث صورة الملف الشخصي')}
                  </button>

                  <a
                    href="/upload"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-none px-4 py-2.5 text-sm font-bold text-white no-underline transition"
                    style={{
                      background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                      boxShadow: '0 10px 24px rgba(var(--primary-rgb),0.2)',
                    }}
                  >
                    <HiCloudArrowUp size={16} />
                    {t('Upload a new scan', 'رفع صورة جديدة')}
                  </a>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition"
                    style={{
                      borderColor: 'rgba(220,38,38,0.24)',
                      background: 'var(--card-bg)',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {t('Sign out', 'تسجيل الخروج')}
                  </button>
                </div>

                {/* Change password form */}
                {changePwd && (
                  <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { key: 'current', label: t('Current password', 'كلمة المرور الحالية') },
                        { key: 'newPwd', label: t('New password', 'كلمة المرور الجديدة') },
                        { key: 'confirm', label: t('Confirm new password', 'تأكيد كلمة المرور الجديدة') },
                      ].map((field) => (
                        <div key={field.key}>
                          <label className="mb-1.5 block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{field.label}</label>
                          <input
                            type="password"
                            value={pwd[field.key as keyof typeof pwd]}
                            onChange={(e) => setPwd({ ...pwd, [field.key]: e.target.value })}
                            onFocus={() => setFocused(field.key)}
                            onBlur={() => setFocused('')}
                            style={{ ...fieldStyle(field.key), letterSpacing: '0.18em' }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={handleChangePwd}
                        className="inline-flex items-center gap-2 rounded-2xl border-none px-5 py-2.5 text-sm font-bold text-white transition"
                        style={{
                          background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                          boxShadow: '0 10px 24px rgba(var(--primary-rgb),0.2)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {t('Save password', 'حفظ كلمة المرور')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setChangePwd(false); setSaveErr(''); }}
                        className="inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-bold transition"
                        style={{
                          borderColor: 'var(--card-border)',
                          background: 'var(--card-bg)',
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {t('Cancel', 'إلغاء')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Privacy Notice */}
              <div
                className="rounded-2xl border p-5 md:p-6"
                style={{
                  borderColor: 'color-mix(in srgb, var(--primary) 8%, var(--card-border))',
                  background: 'linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 90%, transparent), var(--card-bg))',
                }}
              >
                <h2 className="m-0 text-xl font-black" style={{ color: 'var(--text-main)' }}>
                  {t('Privacy notice', 'ملاحظة الخصوصية')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {t('Your account information and uploaded scans stay protected and are only used inside your medical workflow.', 'بيانات حسابك والصور المرفوعة تبقى محمية وتستخدم فقط داخل مسار المتابعة الطبية الخاص بك.')}
                </p>
              </div>

              {/* Danger Zone */}
              <div
                className="rounded-2xl border p-5 md:p-6"
                style={{
                  borderColor: 'rgba(220,38,38,0.18)',
                  background: 'linear-gradient(180deg, color-mix(in srgb, var(--card-bg) 90%, transparent), var(--card-bg))',
                }}
              >
                <h2 className="m-0 text-xl font-black" style={{ color: '#dc2626' }}>
                  {t('Danger zone', 'منطقة حساسة')}
                </h2>
                <p className="mb-4 mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                  {t('Use this only if you really want to remove your account.', 'استخدم هذا الخيار فقط إذا كنت تريد حذف الحساب بالفعل.')}
                </p>

                {!confirmDeleteAccount ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAccount(true)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition"
                    style={{
                      borderColor: 'rgba(220,38,38,0.24)',
                      background: 'var(--card-bg)',
                      color: '#dc2626',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <HiTrash size={16} />
                    {t('Delete account', 'حذف الحساب')}
                  </button>
                ) : (
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: 'rgba(220,38,38,0.06)',
                      border: '1px solid rgba(220,38,38,0.18)',
                    }}
                  >
                    <p className="mb-3 text-sm font-bold" style={{ color: '#dc2626' }}>
                      {t('This action cannot be undone.', 'لا يمكن التراجع عن هذا الإجراء.')}
                    </p>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-2xl border-none px-5 py-2.5 text-sm font-bold text-white"
                        style={{
                          background: '#dc2626',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {t('Confirm delete', 'تأكيد الحذف')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteAccount(false)}
                        className="inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-bold transition"
                        style={{
                          borderColor: 'var(--card-border)',
                          background: 'var(--card-bg)',
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        {t('Cancel', 'إلغاء')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Preview Modal */}
        {showAvatarPreview && avatarSrc && !avatarFailed && (
          <div
            onClick={() => setShowAvatarPreview(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-5"
            style={{ background: 'rgba(15,23,42,0.7)' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border p-4 shadow-2xl"
              style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
              }}
            >
              <button
                type="button"
                onClick={() => setShowAvatarPreview(false)}
                className="absolute grid place-items-center rounded-full border text-lg leading-none"
                style={{
                  top: 14,
                  [ar ? 'left' : 'right']: 14,
                  width: 36,
                  height: 36,
                  borderColor: 'var(--card-border)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
              >
                ×
              </button>
              <img
                src={avatarSrc}
                alt="Profile preview"
                referrerPolicy="no-referrer"
                className="block w-full rounded-2xl"
                style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
              />
            </div>
          </div>
        )}

        <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Cairo:wght@400;600;700;800;900&display=swap');`}</style>
      </div>
    </>
  );
}
