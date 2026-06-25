import { useState } from 'react';
import {
  HiBuildingOffice,
  HiCalendarDays,
  HiChevronDown,
  HiChevronUp,
  HiGlobeAlt,
  HiInformationCircle,
  HiMapPin,
  HiPhone,
  HiShieldCheck,
} from 'react-icons/hi2';
import type { Hospital } from '../types/hospital';

interface HospitalCardProps {
  hospital: Hospital;
  lang: 'en' | 'ar';
  sectorLabel: string;
  open: boolean;
  onToggleAbout: () => void;
}

const googleMapsStaticKey =
  import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  '';

const toMapUrl = (hospital: Hospital) =>
  hospital.googleMaps || `https://www.google.com/maps/search/?api=1&query=${hospital.coordinates.lat},${hospital.coordinates.lng}`;

const toGoogleStaticMapUrl = (hospital: Hospital) => {
  const { lat, lng } = hospital.coordinates;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=520x260&scale=2&markers=color:green%7C${lat},${lng}&key=${googleMapsStaticKey}`;
};

const toOsmEmbedUrl = (hospital: Hospital) => {
  const { lat, lng } = hospital.coordinates;
  const bbox = `${lng - 0.012},${lat - 0.009},${lng + 0.012},${lat + 0.009}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
};

const getCategory = (hospital: Hospital) => {
  const text = `${hospital.hospitalName} ${hospital.specialization} ${hospital.about}`.toLowerCase();

  if (text.includes('chest') || text.includes('pulmonary') || text.includes('pulmonology')) {
    return 'Chest Medicine';
  }

  if (text.includes('thoracic')) return 'Thoracic Care';
  if (text.includes('multi-specialty')) return 'Multi-Specialty Hospital';
  if (text.includes('institute')) return 'Cancer Institute';
  return 'Oncology Center';
};

const getArabicCategory = (category: string) => {
  const labels: Record<string, string> = {
    'Chest Medicine': 'طب الصدر',
    'Thoracic Care': 'رعاية وجراحة الصدر',
    'Multi-Specialty Hospital': 'مستشفى متعدد التخصصات',
    'Cancer Institute': 'معهد أورام',
    'Oncology Center': 'مركز أورام',
  };

  return labels[category] || category;
};

const getReadableSector = (sectorLabel: string, ar: boolean) => {
  if (!ar) return sectorLabel;
  if (sectorLabel === 'Private') return 'خاص';
  if (sectorLabel === 'Government / University') return 'حكومي / جامعي';
  return 'حكومي';
};

export default function HospitalCard({ hospital, lang, sectorLabel, open, onToggleAbout }: HospitalCardProps) {
  const [mapImageFailed, setMapImageFailed] = useState(false);
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => (ar ? arText : en);
  const hospitalName = ar ? hospital.hospitalNameAr : hospital.hospitalName;
  const city = ar ? hospital.cityAr : hospital.city;
  const about = ar ? hospital.aboutAr : hospital.about;
  const address = ar ? hospital.addressAr : hospital.address;
  const services = ar ? hospital.servicesAr : hospital.services;
  const category = getCategory(hospital);
  const categoryLabel = ar ? getArabicCategory(category) : category;
  const visibleServices = services.slice(0, 5);
  const hiddenServices = Math.max(services.length - visibleServices.length, 0);
  const mapUrl = toMapUrl(hospital);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5">
      <div className="grid flex-1 gap-4 sm:grid-cols-[minmax(0,1fr)_210px]">
        <div className="min-w-0">
          <span className="inline-flex max-w-full rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-[#0b5a4c]">
            <span className="truncate">{categoryLabel}</span>
          </span>

          <h3 className="mt-3 text-lg font-black leading-tight text-slate-950">{hospitalName}</h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <HiMapPin className="h-3.5 w-3.5 text-[#0b5a4c]" />
              {city}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              {sectorLabel === 'Private' ? (
                <HiBuildingOffice className="h-3.5 w-3.5 text-[#0b5a4c]" />
              ) : (
                <HiShieldCheck className="h-3.5 w-3.5 text-[#0b5a4c]" />
              )}
              {getReadableSector(sectorLabel, ar)}
            </span>
          </div>

          <p className="mt-3 line-clamp-3 text-xs font-semibold leading-6 text-slate-600">{about}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {visibleServices.map((service) => (
              <span
                key={service}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600"
              >
                {service}
              </span>
            ))}
            {hiddenServices > 0 && (
              <button
                type="button"
                onClick={onToggleAbout}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-[#0b5a4c]"
              >
                +{hiddenServices} {t('more', 'أخرى')}
              </button>
            )}
          </div>
        </div>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block min-h-[160px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
        >
          {googleMapsStaticKey && !mapImageFailed ? (
            <img
              src={toGoogleStaticMapUrl(hospital)}
              alt={`${hospital.hospitalName} map`}
              className="h-full min-h-[160px] w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setMapImageFailed(true)}
            />
          ) : (
            <iframe
              src={toOsmEmbedUrl(hospital)}
              title={`${hospital.hospitalName} map`}
              className="h-full min-h-[160px] w-full border-0 grayscale-[0.15] saturate-[0.85]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
          <span className="absolute inset-x-4 bottom-3 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b5a4c] px-4 py-2 text-xs font-black text-white shadow-lg transition group-hover:bg-[#063c33]">
            <HiMapPin className="h-4 w-4" />
            {t('View on Map', 'عرض على الخريطة')}
          </span>
        </a>
      </div>

      <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[10px] font-black text-slate-600 sm:grid-cols-3">
        <span className="inline-flex items-center gap-1.5">
          <HiGlobeAlt className="h-3.5 w-3.5 text-[#0b5a4c]" />
          {t('Official source available', 'مصدر رسمي متاح')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HiMapPin className="h-3.5 w-3.5 text-[#0b5a4c]" />
          {t('Map location available', 'الموقع على الخريطة متاح')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <HiCalendarDays className="h-3.5 w-3.5 text-[#0b5a4c]" />
          {t('Confirm before visiting', 'أكد قبل الزيارة')}
        </span>
      </div>

      {open && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-xs font-semibold leading-6 text-slate-700">{about}</p>
          <p className="mt-3 text-xs font-bold leading-5 text-slate-600">{address}</p>
          {hiddenServices > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {services.slice(5).map((service) => (
                <span key={service} className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#0b5a4c]">
                  {service}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
          href={hospital.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[#0b5a4c] hover:text-[#0b5a4c]"
        >
          <HiGlobeAlt className="h-3.5 w-3.5" />
          {t('Website', 'الموقع')}
        </a>
        <a
          href={`tel:${hospital.phone}`}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[#0b5a4c] hover:text-[#0b5a4c]"
        >
          <HiPhone className="h-3.5 w-3.5" />
          {t('Call', 'اتصال')}
        </a>
        <a
          href={hospital.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[#0b5a4c] hover:text-[#0b5a4c]"
        >
          <HiCalendarDays className="h-3.5 w-3.5" />
          {t('Booking', 'الحجز')}
        </a>
        <button
          type="button"
          onClick={onToggleAbout}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[#0b5a4c] hover:text-[#0b5a4c]"
        >
          <HiInformationCircle className="h-3.5 w-3.5" />
          {open ? <HiChevronUp className="h-3.5 w-3.5" /> : <HiChevronDown className="h-3.5 w-3.5" />}
          {t('About', 'عن المستشفى')}
        </button>
      </div>
    </article>
  );
}
