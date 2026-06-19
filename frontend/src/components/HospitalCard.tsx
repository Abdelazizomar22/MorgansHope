import { useState } from 'react';
import {
  HiBuildingOffice,
  HiCalendarDays,
  HiGlobeAlt,
  HiInformationCircle,
  HiMapPin,
  HiPhone,
  HiShieldCheck,
  HiStar,
} from 'react-icons/hi2';
import type { Hospital } from '../types/hospital';

interface HospitalCardProps {
  hospital: Hospital;
  lang: 'en' | 'ar';
  open: boolean;
  onToggleAbout: () => void;
}

const mapsKey =
  import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
  '';
const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY || '';

const formatReviews = (value: number) => value.toLocaleString('en-US');

const toMapUrl = (hospital: Hospital) =>
  `https://www.google.com/maps?q=${hospital.coordinates.lat},${hospital.coordinates.lng}`;

const toStaticMapUrl = (hospital: Hospital) => {
  const { lat, lng } = hospital.coordinates;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=200x120&markers=color:green%7C${lat},${lng}&key=${mapsKey}`;
};

const toMapTilerUrl = (hospital: Hospital) => {
  const { lat, lng } = hospital.coordinates;
  return `https://api.maptiler.com/maps/streets-v2/static/${lng},${lat},15/400x240.png?markers=${lng},${lat}&key=${encodeURIComponent(mapTilerKey)}`;
};

const toOsmEmbedUrl = (hospital: Hospital) => {
  const { lat, lng } = hospital.coordinates;
  const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
};

function Stars({ value }: { value: number }) {
  const fullStars = Math.floor(value);
  const hasHalfStar = value - fullStars >= 0.5;

  return (
    <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${value} star rating`}>
      {Array.from({ length: 5 }).map((_, index) => {
        if (index < fullStars) {
          return <HiStar key={index} className="h-3.5 w-3.5" fill="currentColor" />;
        }

        if (index === fullStars && hasHalfStar) {
          return (
            <span key={index} className="relative inline-flex h-3.5 w-3.5">
              <HiStar className="absolute inset-0 h-3.5 w-3.5 text-slate-300" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <HiStar className="h-3.5 w-3.5 text-amber-400" fill="currentColor" />
              </span>
            </span>
          );
        }

        return <HiStar key={index} className="h-3.5 w-3.5 text-slate-300" />;
      })}
    </div>
  );
}

export default function HospitalCard({ hospital, lang, open, onToggleAbout }: HospitalCardProps) {
  const [mapImageFailed, setMapImageFailed] = useState(false);
  const ar = lang === 'ar';
  const t = (en: string, arText: string) => ar ? arText : en;
  const hospitalName = ar ? hospital.hospitalNameAr : hospital.hospitalName;
  const specialization = ar ? hospital.specializationAr : hospital.specialization;
  const city = ar ? hospital.cityAr : hospital.city;
  const about = ar ? hospital.aboutAr : hospital.about;
  const address = ar ? hospital.addressAr : hospital.address;
  const services = ar ? hospital.servicesAr : hospital.services;
  const typeLabel = hospital.type === 'Government' ? (ar ? 'حكومي' : 'Gov.') : (ar ? 'خاص' : 'Private');
  const mapUrl = toMapUrl(hospital);

  return (
    <article className={`flex h-full flex-col justify-between gap-5 rounded-xl bg-white p-4 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="min-w-0">
          <div className="flex items-start gap-3">

            <div className="min-w-0 flex-1">
              <span className="inline-flex max-w-full rounded-full bg-[var(--primary-forest)] px-2.5 py-1 text-[10px] font-black text-white">
                <span className="truncate">{specialization}</span>
							</span>
              
              <h3 className="mt-2 text-base font-black leading-tight text-slate-950">{hospitalName}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <HiMapPin className="h-3 w-3 text-[var(--primary-forest)]" />
                  {city}
                </span>
                <span className="inline-flex items-center gap-1">
                  {typeLabel === 'Gov.' ? <HiShieldCheck className="h-3 w-3 text-[var(--primary-forest)]" /> : <HiBuildingOffice className="h-3 w-3 text-[var(--primary-forest)]" />}
                  {typeLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h4 className="text-xs font-black text-slate-950">{t('Expertise', 'التخصصات')}</h4>
            <div className="mt-2 flex flex-wrap flex-col w-fit gap-1.5">
                {services.map((service) => (
                <span
                  key={service}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
        >
          <div className="h-[120px] w-full overflow-hidden bg-slate-100">
            {(mapTilerKey || mapsKey) && !mapImageFailed ? (
              <img
                src={mapTilerKey ? toMapTilerUrl(hospital) : toStaticMapUrl(hospital)}
                alt={`${hospital.hospitalName} map`}
                className="h-[120px] w-full object-cover transition duration-200 group-hover:scale-105"
                loading="lazy"
                onError={() => setMapImageFailed(true)}
              />
            ) : (
              <iframe
                src={toOsmEmbedUrl(hospital)}
                title={`${hospital.hospitalName} map`}
                className="h-[120px] w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
          <div className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-black text-[var(--primary-forest)]">
            <HiMapPin className="h-3 w-3" />
            {t('View on Map', 'عرض على الخريطة')}
          </div>
        </a>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2">
        <div className="min-w-0">
          <Stars value={hospital.rating} />
          <p className="mt-1 text-[10px] font-black text-slate-700">
            {hospital.rating} ({formatReviews(hospital.totalReviews)} {t('reviews', 'تقييم')})
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700">
          <HiCalendarDays className="h-3.5 w-3.5 shrink-0 text-[var(--primary-forest)]" />
          <span>{t('Est.', 'تأسست')} {hospital.established}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700">
          <svg className="h-3.5 w-3.5 shrink-0 text-[var(--primary-forest)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>
          <span>{hospital.beds} {t('Beds', 'سرير')}</span>
        </div>
      </div>

      {open && (
        <div className="mt-4 rounded-xl border border-[var(--primary-forest)]/15 bg-[var(--primary-forest)]/5 p-3">
          <p className="text-xs font-semibold leading-6 text-slate-700">{about}</p>
          <p className="mt-2 text-xs font-bold text-slate-600">{address}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <a
          href={hospital.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[var(--primary-forest)] px-3 py-2 text-center text-[11px] font-black text-white transition hover:bg-[#12372d]"
        >
          {t('Book Appointment', 'حجز موعد')}
        </a>
        <a
          href={hospital.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[var(--primary-forest)] hover:text-[var(--primary-forest)]"
        >
          <HiGlobeAlt className="h-3 w-3" />
          {t('Website', 'الموقع الإلكتروني')}
        </a>
        <a
          href={`tel:${hospital.phone}`}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[var(--primary-forest)] hover:text-[var(--primary-forest)]"
        >
          <HiPhone className="h-3 w-3" />
          {t('Call', 'اتصال')}
        </a>
        <button
          type="button"
          onClick={onToggleAbout}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[var(--primary-forest)] hover:text-[var(--primary-forest)]"
        >
          <HiInformationCircle className="h-3 w-3" />
          {t('About', 'عن المستشفى')}
        </button>
      </div>
    </article>
  );
}
