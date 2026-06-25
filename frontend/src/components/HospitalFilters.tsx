import type { ReactNode } from 'react';
import { HiArrowPath, HiChevronDown, HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import type { FilterOption } from '../types/hospital';

interface HospitalFiltersProps {
  lang: 'en' | 'ar';
  search: string;
  cityOptions: FilterOption[];
  careOptions: FilterOption[];
  sectorOptions: FilterOption[];
  availabilityOptions: FilterOption[];
  selectedCities: string[];
  selectedCareTypes: string[];
  selectedSectors: string[];
  selectedAvailability: string[];
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onToggleCity: (value: string) => void;
  onToggleCareType: (value: string) => void;
  onToggleSector: (value: string) => void;
  onToggleAvailability: (value: string) => void;
  onClear: () => void;
  onClose?: () => void;
}

interface FilterSectionProps {
  title: string;
  children: ReactNode;
}

interface CheckboxRowProps {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
  strong?: boolean;
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <section className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-950">{title}</h3>
        <HiChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function CheckboxRow({ label, count, checked, onChange, strong }: CheckboxRowProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-1 py-0.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
      <span className="flex min-w-0 items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-3.5 w-3.5 rounded border-slate-300 accent-[#0b5a4c]"
        />
        <span className={`truncate ${strong ? 'font-black text-slate-800' : ''}`}>{label}</span>
      </span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
        {count}
      </span>
    </label>
  );
}

export default function HospitalFilters({
  lang,
  search,
  cityOptions,
  careOptions,
  sectorOptions,
  availabilityOptions,
  selectedCities,
  selectedCareTypes,
  selectedSectors,
  selectedAvailability,
  hasActiveFilters,
  onSearchChange,
  onToggleCity,
  onToggleCareType,
  onToggleSector,
  onToggleAvailability,
  onClear,
  onClose,
}: HospitalFiltersProps) {
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => (ar ? arText : en);

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-slate-950">{t('Find the Right Hospital', 'ابحث عن المستشفى المناسب')}</h2>
          <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-500">
            {t(
              'Search by hospital, city, or chest and oncology service.',
              'ابحث باسم المستشفى أو المدينة أو خدمة الصدر والأورام.',
            )}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-[#0b5a4c] hover:text-[#0b5a4c]"
            aria-label={t('Close filters', 'إغلاق الفلاتر')}
          >
            <HiXMark className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative mb-5">
        <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('Search hospital, city, or service...', 'ابحث عن مستشفى أو مدينة أو خدمة...')}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0b5a4c] focus:bg-white focus:ring-2 focus:ring-[#0b5a4c]/10"
        />
      </div>

      <div className="space-y-4">
        <FilterSection title={t('City', 'المدينة')}>
          {cityOptions.map((option) => (
            <CheckboxRow
              key={option.value}
              label={option.label}
              count={option.count}
              checked={option.value === 'All Cities' ? selectedCities.length === 0 : selectedCities.includes(option.value)}
              onChange={() => onToggleCity(option.value)}
              strong={option.value === 'All Cities'}
            />
          ))}
        </FilterSection>

        <FilterSection title={t('Care Type', 'نوع الرعاية')}>
          {careOptions.map((option) => (
            <CheckboxRow
              key={option.value}
              label={option.label}
              count={option.count}
              checked={
                option.value === 'All Care Types'
                  ? selectedCareTypes.length === 0
                  : selectedCareTypes.includes(option.value)
              }
              onChange={() => onToggleCareType(option.value)}
              strong={option.value === 'All Care Types'}
            />
          ))}
        </FilterSection>

        <FilterSection title={t('Hospital Sector', 'قطاع المستشفى')}>
          {sectorOptions.map((option) => (
            <CheckboxRow
              key={option.value}
              label={option.label}
              count={option.count}
              checked={option.value === 'All Sectors' ? selectedSectors.length === 0 : selectedSectors.includes(option.value)}
              onChange={() => onToggleSector(option.value)}
              strong={option.value === 'All Sectors'}
            />
          ))}
        </FilterSection>

        <FilterSection title={t('Availability', 'التوفر')}>
          {availabilityOptions.map((option) => (
            <CheckboxRow
              key={option.value}
              label={option.label}
              count={option.count}
              checked={selectedAvailability.includes(option.value)}
              onChange={() => onToggleAvailability(option.value)}
            />
          ))}
        </FilterSection>
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={!hasActiveFilters}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0b5a4c]/30 bg-white px-3 py-2.5 text-xs font-black text-[#0b5a4c] transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 disabled:hover:bg-white"
      >
        <HiArrowPath className="h-4 w-4" />
        {t('Reset Filters', 'إعادة ضبط الفلاتر')}
      </button>
    </aside>
  );
}
