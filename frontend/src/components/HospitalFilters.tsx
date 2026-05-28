import { HiMagnifyingGlass, HiXMark } from 'react-icons/hi2';
import type { ReactNode } from 'react';
import type { FilterOption, HospitalType } from '../types/hospital';

interface HospitalFiltersProps {
  search: string;
  cityOptions: FilterOption[];
  typeOptions: FilterOption[];
  specializationOptions: FilterOption[];
  selectedCities: string[];
  selectedTypes: HospitalType[];
  selectedSpecializations: string[];
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onToggleCity: (value: string) => void;
  onToggleType: (value: HospitalType) => void;
  onToggleSpecialization: (value: string) => void;
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
}

function FilterSection({ title, children }: FilterSectionProps) {
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function CheckboxRow({ label, count, checked, onChange }: CheckboxRowProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-xs font-semibold text-slate-600">
      <span className="flex min-w-0 items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-3.5 w-3.5 rounded border-gray-300 accent-green-800"
        />
        <span className="truncate">{label}</span>
      </span>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
        {count}
      </span>
    </label>
  );
}

export default function HospitalFilters({
  search,
  cityOptions,
  typeOptions,
  specializationOptions,
  selectedCities,
  selectedTypes,
  selectedSpecializations,
  hasActiveFilters,
  onSearchChange,
  onToggleCity,
  onToggleType,
  onToggleSpecialization,
  onClear,
  onClose,
}: HospitalFiltersProps) {
  return (
    <aside className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-black text-slate-950">Filter Hospitals</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-[#1B4D3E] hover:text-[#1B4D3E]"
            aria-label="Close filters"
          >
            <HiXMark className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative mb-5">
        <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search hospital or city..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#1B4D3E] focus:bg-white focus:ring-2 focus:ring-[#1B4D3E]/10"
        />
      </div>

      <div className="space-y-5">
        <FilterSection title="City">
          {cityOptions.map((option) => (
            <CheckboxRow
              key={option.value}
              label={option.label}
              count={option.count}
              checked={
                option.value === 'All Cities' ? selectedCities.length === 0 : selectedCities.includes(option.value)
              }
              onChange={() => onToggleCity(option.value)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Hospital Type">
          {typeOptions.map((option) => (
            <CheckboxRow
              key={option.value}
              label={option.label}
              count={option.count}
              checked={selectedTypes.includes(option.value as HospitalType)}
              onChange={() => onToggleType(option.value as HospitalType)}
            />
          ))}
        </FilterSection>

        <FilterSection title="Specialization">
          {specializationOptions.map((option) => (
            <CheckboxRow
              key={option.value}
              label={option.label}
              count={option.count}
              checked={selectedSpecializations.includes(option.value)}
              onChange={() => onToggleSpecialization(option.value)}
            />
          ))}
        </FilterSection>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-black text-red-500 transition hover:bg-red-50"
        >
          Clear All Filters
        </button>
      )}
    </aside>
  );
}
