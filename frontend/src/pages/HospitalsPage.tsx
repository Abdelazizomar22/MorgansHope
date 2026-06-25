import { useEffect, useMemo, useState } from 'react';
import {
  HiAdjustmentsHorizontal,
  HiArrowPath,
  HiBuildingOffice,
  HiChevronRight,
  HiMapPin,
  HiPhone,
  HiShieldCheck,
} from 'react-icons/hi2';
import { useSearchParams } from 'react-router-dom';
import HospitalCard from '../components/HospitalCard';
import HospitalFilters from '../components/HospitalFilters';
import { REAL_HOSPITALS } from '../data/hospitals';
import type { FilterOption, Hospital } from '../types/hospital';

interface HospitalsPageProps {
  lang: 'en' | 'ar';
}

type FilterGroup = 'city' | 'care' | 'sector' | 'availability';
type SortOption = 'relevance' | 'city' | 'government' | 'private';

const HERO_IMAGE = '/images/hospitals/egypt-hospital-guidance.png';

const CITY_ORDER = ['Cairo', 'Giza / 6th of October', 'Alexandria', 'Mansoura', 'Assiut'];

const CARE_TYPES = [
  {
    value: 'lung-cancer-care',
    label: 'Lung Cancer Care',
    labelAr: 'رعاية سرطان الرئة',
    keywords: ['lung cancer', 'cancer', 'oncology'],
  },
  {
    value: 'chest-medicine',
    label: 'Chest Medicine / Pulmonology',
    labelAr: 'طب الصدر وأمراض الرئة',
    keywords: ['chest', 'pulmonology', 'pulmonary', 'respiratory'],
  },
  {
    value: 'thoracic-surgery',
    label: 'Thoracic Surgery',
    labelAr: 'جراحة الصدر',
    keywords: ['thoracic', 'vats', 'surgery'],
  },
  {
    value: 'medical-oncology',
    label: 'Medical Oncology',
    labelAr: 'الأورام الطبية',
    keywords: ['oncology', 'cancer institute', 'cancer care'],
  },
  {
    value: 'radiation-oncology',
    label: 'Radiation Oncology',
    labelAr: 'العلاج الإشعاعي',
    keywords: ['radiation', 'radiotherapy'],
  },
  {
    value: 'chemotherapy',
    label: 'Chemotherapy',
    labelAr: 'العلاج الكيميائي',
    keywords: ['chemotherapy'],
  },
  {
    value: 'bronchoscopy-biopsy',
    label: 'Bronchoscopy / Biopsy',
    labelAr: 'منظار الشعب والخزعات',
    keywords: ['bronchoscopy', 'biopsy', 'ct biopsy'],
  },
  {
    value: 'imaging-support',
    label: 'CT / Imaging Support',
    labelAr: 'الأشعة والدعم التصويري',
    keywords: ['ct', 'imaging', 'mri'],
  },
  {
    value: 'advanced-imaging',
    label: 'PET-CT / Advanced Imaging',
    labelAr: 'PET-CT والتصوير المتقدم',
    keywords: ['pet-ct', 'advanced imaging', 'nuclear medicine'],
  },
  {
    value: 'supportive-care',
    label: 'Palliative / Supportive Care',
    labelAr: 'الرعاية الداعمة',
    keywords: ['palliative', 'supportive'],
  },
];

const SECTOR_OPTIONS = [
  { value: 'Government', label: 'Government', labelAr: 'حكومي' },
  { value: 'Private', label: 'Private', labelAr: 'خاص' },
  { value: 'University Hospital', label: 'University Hospital', labelAr: 'مستشفى جامعي' },
];

const AVAILABILITY_OPTIONS = [
  { value: 'website', label: 'Has Website', labelAr: 'يوجد موقع إلكتروني' },
  { value: 'phone', label: 'Has Phone Number', labelAr: 'يوجد رقم هاتف' },
  { value: 'map', label: 'Has Map Location', labelAr: 'يوجد موقع على الخريطة' },
  { value: 'booking', label: 'Has Booking Link', labelAr: 'يوجد رابط حجز' },
];

const splitParam = (value: string | null) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const normalize = (value: string) => value.trim().toLowerCase();

const toFilterOption = (label: string, value: string, count: number): FilterOption => ({ label, value, count });

const getHospitalSearchText = (hospital: Hospital) =>
  [
    hospital.hospitalName,
    hospital.hospitalNameAr,
    hospital.city,
    hospital.cityAr,
    hospital.specialization,
    hospital.specializationAr,
    hospital.about,
    ...hospital.services,
  ]
    .join(' ')
    .toLowerCase();

const getHospitalCityGroup = (hospital: Hospital) => {
  if (hospital.hospitalName.toLowerCase().includes('dar al fouad')) return 'Giza / 6th of October';
  return hospital.city;
};

const isUniversityHospital = (hospital: Hospital) => {
  const text = `${hospital.hospitalName} ${hospital.about} ${hospital.badge || ''}`.toLowerCase();
  return text.includes('university') || text.includes('institute');
};

const getHospitalSector = (hospital: Hospital) => {
  if (hospital.type === 'Private') return 'Private';
  return isUniversityHospital(hospital) ? 'Government / University' : 'Government';
};

const hasSector = (hospital: Hospital, sector: string) => {
  if (sector === 'University Hospital') return isUniversityHospital(hospital);
  return hospital.type === sector;
};

const hasAvailability = (hospital: Hospital, availability: string) => {
  if (availability === 'website') return Boolean(hospital.website);
  if (availability === 'phone') return Boolean(hospital.phone);
  if (availability === 'map') return Boolean(hospital.coordinates || hospital.googleMaps);
  if (availability === 'booking') return Boolean(hospital.bookingUrl);
  return true;
};

const includesCareType = (hospital: Hospital, selectedCareTypes: string[]) => {
  if (!selectedCareTypes.length) return true;

  const text = getHospitalSearchText(hospital);
  return selectedCareTypes.some((careType) => {
    const care = CARE_TYPES.find((item) => item.value === careType);
    return care ? care.keywords.some((keyword) => text.includes(keyword)) : true;
  });
};

const matchesSearch = (hospital: Hospital, search: string) => {
  const query = normalize(search);
  if (!query) return true;
  return getHospitalSearchText(hospital).includes(query);
};

const filterHospitals = (
  hospitals: Hospital[],
  filters: {
    search: string;
    selectedCities: string[];
    selectedCareTypes: string[];
    selectedSectors: string[];
    selectedAvailability: string[];
  },
) =>
  hospitals.filter(
    (hospital) =>
      matchesSearch(hospital, filters.search) &&
      (!filters.selectedCities.length || filters.selectedCities.includes(getHospitalCityGroup(hospital))) &&
      includesCareType(hospital, filters.selectedCareTypes) &&
      (!filters.selectedSectors.length || filters.selectedSectors.some((sector) => hasSector(hospital, sector))) &&
      (!filters.selectedAvailability.length ||
        filters.selectedAvailability.every((availability) => hasAvailability(hospital, availability))),
  );

function SkeletonCards() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <div className="h-4 w-28 rounded-full bg-emerald-100" />
                <div className="h-5 w-4/5 rounded bg-slate-200" />
                <div className="h-3 w-2/3 rounded bg-slate-100" />
              </div>
              <div className="hidden h-32 w-44 rounded-2xl bg-slate-100 sm:block" />
            </div>
            <div className="h-10 rounded-xl bg-slate-100" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((__, buttonIndex) => (
                <div key={buttonIndex} className="h-9 flex-1 rounded-lg bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HospitalsPage({ lang }: HospitalsPageProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => (ar ? arText : en);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [selectedCities, setSelectedCities] = useState<string[]>(() => splitParam(searchParams.get('city')));
  const [selectedCareTypes, setSelectedCareTypes] = useState<string[]>(() => splitParam(searchParams.get('care')));
  const [selectedSectors, setSelectedSectors] = useState<string[]>(() => splitParam(searchParams.get('sector')));
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(() =>
    splitParam(searchParams.get('availability')),
  );
  const [sortBy, setSortBy] = useState<SortOption>(() => (searchParams.get('sort') as SortOption) || 'relevance');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const filtersState = useMemo(
    () => ({ search, selectedCities, selectedCareTypes, selectedSectors, selectedAvailability }),
    [search, selectedCities, selectedCareTypes, selectedSectors, selectedAvailability],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 220);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search.trim()) params.set('search', search.trim());
    if (selectedCities.length) params.set('city', selectedCities.join(','));
    if (selectedCareTypes.length) params.set('care', selectedCareTypes.join(','));
    if (selectedSectors.length) params.set('sector', selectedSectors.join(','));
    if (selectedAvailability.length) params.set('availability', selectedAvailability.join(','));
    if (sortBy !== 'relevance') params.set('sort', sortBy);

    setSearchParams(params, { replace: true });
  }, [search, selectedCities, selectedCareTypes, selectedSectors, selectedAvailability, sortBy, setSearchParams]);

  const allCityGroups = useMemo(() => {
    const cities = Array.from(new Set(REAL_HOSPITALS.map(getHospitalCityGroup)));
    return cities.sort((a, b) => CITY_ORDER.indexOf(a) - CITY_ORDER.indexOf(b));
  }, []);

  const filtered = useMemo(() => {
    const results = filterHospitals(REAL_HOSPITALS, filtersState);

    return [...results].sort((a, b) => {
      if (sortBy === 'city') return getHospitalCityGroup(a).localeCompare(getHospitalCityGroup(b));
      if (sortBy === 'government') return a.type === b.type ? a.id - b.id : a.type === 'Government' ? -1 : 1;
      if (sortBy === 'private') return a.type === b.type ? a.id - b.id : a.type === 'Private' ? -1 : 1;
      return a.id - b.id;
    });
  }, [filtersState, sortBy]);

  const getOptionCount = (exclude?: FilterGroup) =>
    filterHospitals(REAL_HOSPITALS, {
      search,
      selectedCities: exclude === 'city' ? [] : selectedCities,
      selectedCareTypes: exclude === 'care' ? [] : selectedCareTypes,
      selectedSectors: exclude === 'sector' ? [] : selectedSectors,
      selectedAvailability: exclude === 'availability' ? [] : selectedAvailability,
    });

  const cityOptions = useMemo(() => {
    const base = getOptionCount('city');
    return [
      toFilterOption(t('All Cities', 'كل المدن'), 'All Cities', base.length),
      ...allCityGroups.map((city) =>
        toFilterOption(city, city, base.filter((hospital) => getHospitalCityGroup(hospital) === city).length),
      ),
    ].filter((option) => option.value === 'All Cities' || option.count > 0);
  }, [allCityGroups, filtersState, ar]);

  const careOptions = useMemo(() => {
    const base = getOptionCount('care');
    return [
      toFilterOption(t('All Care Types', 'كل أنواع الرعاية'), 'All Care Types', base.length),
      ...CARE_TYPES.map((care) =>
        toFilterOption(
          ar ? care.labelAr : care.label,
          care.value,
          base.filter((hospital) => includesCareType(hospital, [care.value])).length,
        ),
      ),
    ].filter((option) => option.value === 'All Care Types' || option.count > 0);
  }, [filtersState, ar]);

  const sectorOptions = useMemo(() => {
    const base = getOptionCount('sector');
    return [
      toFilterOption(t('All Sectors', 'كل القطاعات'), 'All Sectors', base.length),
      ...SECTOR_OPTIONS.map((sector) =>
        toFilterOption(
          ar ? sector.labelAr : sector.label,
          sector.value,
          base.filter((hospital) => hasSector(hospital, sector.value)).length,
        ),
      ),
    ].filter((option) => option.value === 'All Sectors' || option.count > 0);
  }, [filtersState, ar]);

  const availabilityOptions = useMemo(() => {
    const base = getOptionCount('availability');
    return AVAILABILITY_OPTIONS.map((availability) =>
      toFilterOption(
        ar ? availability.labelAr : availability.label,
        availability.value,
        base.filter((hospital) => hasAvailability(hospital, availability.value)).length,
      ),
    ).filter((option) => option.count > 0);
  }, [filtersState, ar]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedCities.length > 0 ||
    selectedCareTypes.length > 0 ||
    selectedSectors.length > 0 ||
    selectedAvailability.length > 0;

  const toggleValue = (value: string, current: string[], update: (next: string[]) => void) => {
    update(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const toggleAllAwareValue = (
    value: string,
    allValue: string,
    current: string[],
    update: (next: string[]) => void,
  ) => {
    if (value === allValue) {
      update([]);
      return;
    }

    toggleValue(value, current, update);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCities([]);
    setSelectedCareTypes([]);
    setSelectedSectors([]);
    setSelectedAvailability([]);
    setSortBy('relevance');
    setFiltersOpen(false);
  };

  const guidanceCards = [
    {
      icon: HiMapPin,
      title: t('Choose by City', 'اختار حسب المدينة'),
      text: t(
        'Start with the nearest city to reduce travel time and make follow-up easier.',
        'ابدأ بأقرب مدينة لتقليل وقت السفر وتسهيل المتابعة.',
      ),
    },
    {
      icon: HiBuildingOffice,
      title: t('Match the Care Type', 'طابق نوع الرعاية'),
      text: t(
        'Filter by lung cancer care, chest medicine, thoracic surgery, biopsy, imaging, chemotherapy, or radiation.',
        'فلتر حسب رعاية سرطان الرئة، طب الصدر، الجراحة، الخزعات، الأشعة، العلاج الكيميائي أو الإشعاعي.',
      ),
    },
    {
      icon: HiShieldCheck,
      title: t('Verify Before Visiting', 'تأكد قبل الزيارة'),
      text: t(
        'Contact the hospital directly to confirm appointments, available services, and updated contact details.',
        'تواصل مع المستشفى مباشرة لتأكيد المواعيد والخدمات المتاحة وبيانات التواصل.',
      ),
    },
  ];

  return (
    <div className={`min-h-screen bg-[#F4F8F8] text-slate-950 ${ar ? "font-['Cairo',sans-serif]" : "font-['Sora',sans-serif]"}`}>
      <section className="relative overflow-hidden bg-[#052f2a]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-95"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#062d27] via-[#062d27]/88 to-[#062d27]/20" />
        <div className="relative mx-auto flex min-h-[280px] max-w-[1180px] items-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <span className="inline-flex rounded-full border border-emerald-200/30 bg-white/10 px-3 py-1 text-xs font-black text-emerald-100 backdrop-blur">
              {t('Egypt Hospital Guidance Network', 'شبكة إرشاد المستشفيات في مصر')}
            </span>
            <h1 className="mt-5 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
              {t('Chest & Oncology Hospitals in Egypt', 'مستشفيات الصدر والأورام في مصر')}
            </h1>
            <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-white/88 sm:text-base">
              {t(
                'Find hospitals and medical centers related to lung cancer, chest medicine, thoracic care, oncology treatment, and imaging-based follow-up.',
                'ابحث عن مستشفيات ومراكز طبية مرتبطة بسرطان الرئة، طب الصدر، رعاية الصدر، علاج الأورام، والمتابعة المعتمدة على التصوير الطبي.',
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#hospital-results"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#064237] shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5"
              >
                {t('Explore Hospitals', 'استكشف المستشفيات')}
                <HiChevronRight className="h-4 w-4" />
              </a>
              <a
                href="#hospital-guidance"
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/15"
              >
                {t('How to Choose?', 'كيف تختار؟')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        <section id="hospital-guidance" className="-mt-14 mb-8 grid gap-4 md:grid-cols-3">
          {guidanceCards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="group rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl shadow-slate-950/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-[#0b5a4c] transition group-hover:bg-[#0b5a4c] group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <h2 className="text-base font-black text-slate-950">{card.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{card.text}</p>
              </article>
            );
          })}
        </section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-forest)] px-4 py-2.5 text-sm font-black text-white shadow-md"
          >
            <HiAdjustmentsHorizontal className="h-4 w-4" />
            {t('Filter Hospitals', 'فلترة المستشفيات')}
          </button>
          <label className="flex items-center gap-2 text-xs font-black text-slate-600">
            {t('Sort by:', 'ترتيب حسب:')}
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 outline-none focus:border-[var(--primary-forest)]"
            >
              <option value="relevance">{t('Relevance', 'الأكثر صلة')}</option>
              <option value="city">{t('City', 'المدينة')}</option>
              <option value="government">{t('Government First', 'الحكومي أولا')}</option>
              <option value="private">{t('Private First', 'الخاص أولا')}</option>
            </select>
          </label>
        </div>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/45 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setFiltersOpen(false)}
              aria-label={t('Close filters', 'إغلاق الفلاتر')}
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl">
              <HospitalFilters
                lang={lang}
                search={search}
                cityOptions={cityOptions}
                careOptions={careOptions}
                sectorOptions={sectorOptions}
                availabilityOptions={availabilityOptions}
                selectedCities={selectedCities}
                selectedCareTypes={selectedCareTypes}
                selectedSectors={selectedSectors}
                selectedAvailability={selectedAvailability}
                hasActiveFilters={hasActiveFilters}
                onSearchChange={setSearch}
                onToggleCity={(value) => toggleAllAwareValue(value, 'All Cities', selectedCities, setSelectedCities)}
                onToggleCareType={(value) =>
                  toggleAllAwareValue(value, 'All Care Types', selectedCareTypes, setSelectedCareTypes)
                }
                onToggleSector={(value) => toggleAllAwareValue(value, 'All Sectors', selectedSectors, setSelectedSectors)}
                onToggleAvailability={(value) => toggleValue(value, selectedAvailability, setSelectedAvailability)}
                onClear={clearFilters}
                onClose={() => setFiltersOpen(false)}
              />
            </div>
          </div>
        )}

        <div id="hospital-results" className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <HospitalFilters
              lang={lang}
              search={search}
              cityOptions={cityOptions}
              careOptions={careOptions}
              sectorOptions={sectorOptions}
              availabilityOptions={availabilityOptions}
              selectedCities={selectedCities}
              selectedCareTypes={selectedCareTypes}
              selectedSectors={selectedSectors}
              selectedAvailability={selectedAvailability}
              hasActiveFilters={hasActiveFilters}
              onSearchChange={setSearch}
              onToggleCity={(value) => toggleAllAwareValue(value, 'All Cities', selectedCities, setSelectedCities)}
              onToggleCareType={(value) =>
                toggleAllAwareValue(value, 'All Care Types', selectedCareTypes, setSelectedCareTypes)
              }
              onToggleSector={(value) => toggleAllAwareValue(value, 'All Sectors', selectedSectors, setSelectedSectors)}
              onToggleAvailability={(value) => toggleValue(value, selectedAvailability, setSelectedAvailability)}
              onClear={clearFilters}
            />
          </div>

          <section>
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0b5a4c]">
                    {t('Recommended Hospitals', 'مستشفيات مقترحة')}
                  </p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">
                    {filtered.length} {t('hospitals found', 'مستشفى متاحة')}
                  </h2>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                    {t(
                      'Results are filtered based on city, care type, sector, and available contact information.',
                      'النتائج تتغير حسب المدينة، نوع الرعاية، القطاع، وتوفر بيانات التواصل.',
                    )}
                  </p>
                </div>
                <label className="hidden items-center gap-2 text-xs font-black text-slate-600 lg:flex">
                  {t('Sort by:', 'ترتيب حسب:')}
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 outline-none focus:border-[var(--primary-forest)]"
                  >
                    <option value="relevance">{t('Relevance', 'الأكثر صلة')}</option>
                    <option value="city">{t('City', 'المدينة')}</option>
                    <option value="government">{t('Government First', 'الحكومي أولا')}</option>
                    <option value="private">{t('Private First', 'الخاص أولا')}</option>
                  </select>
                </label>
              </div>
            </div>

            {loading ? (
              <SkeletonCards />
            ) : filtered.length > 0 ? (
              <div className="grid items-stretch gap-4 xl:grid-cols-2">
                {filtered.map((hospital) => (
                  <HospitalCard
                    key={hospital.id}
                    hospital={hospital}
                    lang={lang}
                    sectorLabel={getHospitalSector(hospital)}
                    open={expanded === hospital.id}
                    onToggleAbout={() => setExpanded(expanded === hospital.id ? null : hospital.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-forest)]/10 text-[var(--primary-forest)]">
                  <HiBuildingOffice className="h-7 w-7" />
                </div>
                <p className="mt-4 text-base font-black text-slate-800">{t('No hospitals found', 'لا توجد مستشفيات')}</p>
                <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                  {t(
                    'Try changing the city or care type filters. You can also search by hospital name or service.',
                    'جرّب تغيير المدينة أو نوع الرعاية، أو ابحث باسم المستشفى أو الخدمة.',
                  )}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--primary-forest)] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#12372d]"
                >
                  <HiArrowPath className="h-4 w-4" />
                  {t('Reset Filters', 'إعادة ضبط الفلاتر')}
                </button>
              </div>
            )}

            <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold leading-6 text-amber-900">
              <HiPhone className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p>
                <strong>{t('Important Note:', 'ملاحظة مهمة:')}</strong>{' '}
                {t(
                  'Hospital information is provided for guidance only. Contact details, booking methods, available services, and clinic schedules may change. Always verify directly with the hospital before visiting or making a medical decision.',
                  'معلومات المستشفيات للإرشاد فقط. قد تتغير بيانات التواصل، طرق الحجز، الخدمات المتاحة، ومواعيد العيادات. تأكد دائما مباشرة من المستشفى قبل الزيارة أو اتخاذ قرار طبي.',
                )}
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
