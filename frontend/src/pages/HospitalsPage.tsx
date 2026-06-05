import { useEffect, useMemo, useState } from 'react';
import { HiBuildingOffice, HiAdjustmentsHorizontal } from 'react-icons/hi2';
import { useSearchParams } from 'react-router-dom';
import HospitalCard from '../components/HospitalCard';
import HospitalFilters from '../components/HospitalFilters';
import { hospitalsApi } from '../utils/api';
import type { FilterOption, Hospital, HospitalType } from '../types/hospital';

interface HospitalsPageProps {
  lang: 'en' | 'ar';
}

type FilterGroup = 'city' | 'type' | 'specialization';

const TYPE_OPTIONS: { label: string; value: HospitalType }[] = [
  { label: 'Gov.', value: 'Government' },
  { label: 'Private', value: 'Private' },
];

const normalize = (value: string) => value.trim().toLowerCase();

const splitParam = (value: string | null) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const parseType = (value: string): HospitalType | null => {
  const normalized = normalize(value);

  if (normalized === 'gov' || normalized === 'gov.' || normalized === 'government') {
    return 'Government';
  }

  if (normalized === 'private') {
    return 'Private';
  }

  return null;
};

const includesSpecialization = (hospital: Hospital, selectedSpecializations: string[]) => {
  if (!selectedSpecializations.length) return true;

  const values = [hospital.specialization, ...hospital.services].map(normalize);
  return selectedSpecializations.some((specialization) => values.includes(normalize(specialization)));
};

const matchesSearch = (hospital: Hospital, search: string, ar: boolean) => {
  const query = normalize(search);
  if (!query) return true;

  const searchValues: string[] = [
    ar ? hospital.hospitalNameAr ?? '' : hospital.hospitalName,
    hospital.hospitalName,
    hospital.city,
    hospital.specialization,
    ...hospital.services,
  ];
  return searchValues.map(normalize).some((value) => value.includes(query));
};

const getOptionCount = (
  hospitals: Hospital[],
  filters: {
    search: string;
    selectedCities: string[];
    selectedTypes: HospitalType[];
    selectedSpecializations: string[];
  },
  ar: boolean,
  exclude?: FilterGroup,
) =>
  hospitals.filter((hospital) => {
    const cityOk = exclude === 'city' || !filters.selectedCities.length || filters.selectedCities.includes(hospital.city);
    const typeOk = exclude === 'type' || !filters.selectedTypes.length || filters.selectedTypes.includes(hospital.type as HospitalType);
    const specializationOk =
      exclude === 'specialization' || includesSpecialization(hospital, filters.selectedSpecializations);

    return matchesSearch(hospital, filters.search, ar) && cityOk && typeOk && specializationOk;
  });

const toFilterOption = (label: string, value: string, count: number): FilterOption => ({ label, value, count });

function SkeletonCards() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-xl border border-gray-100 bg-white p-4 shadow-md">
          <div className="animate-pulse space-y-4">
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
              <div className="hidden h-24 w-32 rounded-xl bg-slate-100 sm:block" />
            </div>
            <div className="h-20 rounded-xl bg-slate-100" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((__, buttonIndex) => (
                <div key={buttonIndex} className="h-9 rounded-lg bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function transformHospital(apiHospital: Record<string, any>): Hospital {
  return {
    id: apiHospital.id,
    hospitalName: apiHospital.hospitalName,
    hospitalNameAr: apiHospital.hospitalNameAr,
    specialization: apiHospital.specialization,
    specializationAr: apiHospital.specializationAr,
    city: apiHospital.cityName || apiHospital.city?.cityName || '',
    cityAr: apiHospital.cityNameAr,
    address: apiHospital.address,
    addressAr: apiHospital.addressAr,
    phone: apiHospital.phone,
    rating: apiHospital.rating,
    totalReviews: apiHospital.totalReviews,
    about: apiHospital.about,
    aboutAr: apiHospital.aboutAr,
    website: apiHospital.website,
    bookingUrl: apiHospital.bookingUrl,
    googleMaps: apiHospital.googleMaps,
    coordinates: { lat: apiHospital.latitude, lng: apiHospital.longitude },
    beds: apiHospital.beds,
    established: apiHospital.establishedYear?.toString(),
    type: (apiHospital.type === 'Gov' ? 'Government' : 'Private') as HospitalType,
    services: apiHospital.services || apiHospital.expertise || [],
    badge: apiHospital.badge,
    badgeColor: apiHospital.badgeColor,
  };
}

export default function HospitalsPage({ lang }: HospitalsPageProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => (ar ? arText : en);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [selectedCities, setSelectedCities] = useState<string[]>(() => splitParam(searchParams.get('city')));
  const [selectedTypes, setSelectedTypes] = useState<HospitalType[]>(() =>
    splitParam(searchParams.get('type')).map(parseType).filter(Boolean) as HospitalType[],
  );
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(() =>
    splitParam(searchParams.get('specialization')),
  );
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState<string | null>(null);

  const filtersState = useMemo(
    () => ({ search, selectedCities, selectedTypes, selectedSpecializations }),
    [search, selectedCities, selectedTypes, selectedSpecializations],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    hospitalsApi.getAll({ limit: 50 })
      .then(({ data }) => {
        if (cancelled) return;
        setHospitals(data.data.map(transformHospital));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError('Failed to load hospitals');
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search.trim()) params.set('search', search.trim());
    if (selectedCities.length) params.set('city', selectedCities.join(','));
    if (selectedTypes.length) {
      params.set('type', selectedTypes.map((type) => (type === 'Government' ? 'Gov' : type)).join(','));
    }
    if (selectedSpecializations.length) params.set('specialization', selectedSpecializations.join(','));

    setSearchParams(params, { replace: true });
  }, [search, selectedCities, selectedTypes, selectedSpecializations, setSearchParams]);

  const allCities = useMemo(() => Array.from(new Set(hospitals.map((hospital) => hospital.city))), [hospitals]);
  const allSpecializations = useMemo(
    () => Array.from(new Set(hospitals.flatMap((hospital) => [hospital.specialization, ...hospital.services]))).sort(),
    [hospitals],
  );

  const filtered = useMemo(
    () =>
      hospitals.filter(
        (hospital) =>
          matchesSearch(hospital, search, ar) &&
          (!selectedCities.length || selectedCities.includes(hospital.city)) &&
          (!selectedTypes.length || selectedTypes.includes(hospital.type as HospitalType)) &&
          includesSpecialization(hospital, selectedSpecializations),
      ),
    [ar, search, selectedCities, selectedTypes, selectedSpecializations, hospitals],
  );

  const cityOptions = useMemo(() => {
    const base = getOptionCount(hospitals, filtersState, ar, 'city');
    const options = allCities
      .map((city) => toFilterOption(city, city, base.filter((hospital) => hospital.city === city).length))
      .filter((option) => option.count > 0);

    return [toFilterOption('All Cities', 'All Cities', base.length), ...options];
  }, [allCities, ar, filtersState, hospitals]);

  const typeOptions = useMemo(() => {
    const base = getOptionCount(hospitals, filtersState, ar, 'type');
    return TYPE_OPTIONS.map((type) =>
      toFilterOption(type.label, type.value, base.filter((hospital) => hospital.type === type.value).length),
    ).filter((option) => option.count > 0);
  }, [ar, filtersState, hospitals]);

  const specializationOptions = useMemo(() => {
    const base = getOptionCount(hospitals, filtersState, ar, 'specialization');
    return allSpecializations
      .map((specialization) =>
        toFilterOption(
          specialization,
          specialization,
          base.filter((hospital) => includesSpecialization(hospital, [specialization])).length,
        ),
      )
      .filter((option) => option.count > 0);
  }, [allSpecializations, ar, filtersState, hospitals]);

  const hasActiveFilters =
    Boolean(search.trim()) || selectedCities.length > 0 || selectedTypes.length > 0 || selectedSpecializations.length > 0;

  const toggleValue = <T extends string,>(value: T, current: T[], update: (next: T[]) => void) => {
    update(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const toggleCity = (value: string) => {
    if (value === 'All Cities') {
      setSelectedCities([]);
      return;
    }

    toggleValue(value, selectedCities, setSelectedCities);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCities([]);
    setSelectedTypes([]);
    setSelectedSpecializations([]);
    setFiltersOpen(false);
  };

  return (
    <div
      dir={ar ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#F4F8F8] text-slate-950 ${ar ? "font-['Cairo',sans-serif]" : "font-['Sora',sans-serif]"}`}
    >
      <section className="bg-[#1B4D3E] bg-[url('/images/common/upper-section.jpeg')] bg-cover bg-center bg-no-repeat">
        <div className="bg-[#0B2F27]/70">
          <div className="mx-auto max-w-[1180px] px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-black text-white">Oncology Centers in Egypt</h1>
            <p className="mt-2 text-sm font-semibold text-white/80">
              8 real hospitals - verified contact info, websites & booking links
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B4D3E] px-4 py-2 text-sm font-black text-white shadow-md"
          >
            <HiAdjustmentsHorizontal className="h-4 w-4" />
            Filters
          </button>
          <p className="text-sm font-black text-slate-700">
            {filtered.length} {t('hospitals found', 'hospitals found')}
          </p>
        </div>

        {filtersOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 md:hidden">
            <button
              type="button"
              className="absolute inset-0 h-full w-full cursor-default"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters overlay"
            />
            <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl">
              <HospitalFilters
                search={search}
                cityOptions={cityOptions}
                typeOptions={typeOptions}
                specializationOptions={specializationOptions}
                selectedCities={selectedCities}
                selectedTypes={selectedTypes}
                selectedSpecializations={selectedSpecializations}
                hasActiveFilters={hasActiveFilters}
                onSearchChange={setSearch}
                onToggleCity={toggleCity}
                onToggleType={(value) => toggleValue(value, selectedTypes, setSelectedTypes)}
                onToggleSpecialization={(value) =>
                  toggleValue(value, selectedSpecializations, setSelectedSpecializations)
                }
                onClear={clearFilters}
                onClose={() => setFiltersOpen(false)}
              />
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
          <div className="hidden lg:block lg:sticky lg:top-24">
            <HospitalFilters
              search={search}
              cityOptions={cityOptions}
              typeOptions={typeOptions}
              specializationOptions={specializationOptions}
              selectedCities={selectedCities}
              selectedTypes={selectedTypes}
              selectedSpecializations={selectedSpecializations}
              hasActiveFilters={hasActiveFilters}
              onSearchChange={setSearch}
              onToggleCity={toggleCity}
              onToggleType={(value) => toggleValue(value, selectedTypes, setSelectedTypes)}
              onToggleSpecialization={(value) => toggleValue(value, selectedSpecializations, setSelectedSpecializations)}
              onClear={clearFilters}
            />
          </div>

          <section>
            <div className="mb-4 hidden items-center justify-between gap-3 md:flex">
              <p className="text-sm font-black text-slate-700">
                {filtered.length} {t('hospitals found', 'hospitals found')}
              </p>
              <span className="rounded-full bg-[#1B4D3E]/10 px-3 py-1 text-xs font-black text-[#1B4D3E]">
                Egypt Oncology Network
              </span>
            </div>

            {loading ? (
              <SkeletonCards />
            ) : error ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <p className="text-sm font-black text-slate-800">{error}</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 items-stretch">
                {filtered.map((hospital) => (
                  <HospitalCard
                    key={hospital.id}
                    hospital={hospital}
                    lang={lang}
                    open={expanded === hospital.id}
                    onToggleAbout={() => setExpanded(expanded === hospital.id ? null : hospital.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1B4D3E]/10 text-[#1B4D3E]">
                  <HiBuildingOffice className="h-7 w-7" />
                </div>
                <p className="mt-4 text-sm font-black text-slate-800">No hospitals found matching your filters</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-[#1B4D3E] px-4 py-2 text-xs font-black text-white transition hover:bg-[#12372d]"
                >
                  Clear all filters
                </button>
              </div>
            )}

            <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs font-semibold leading-6 text-amber-800">
              <strong>Note:</strong> Hospital information is for guidance only. Contact details and booking links may change -
              always verify directly with the hospital before visiting.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
