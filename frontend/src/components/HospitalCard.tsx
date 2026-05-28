import {
  HiBuildingOffice,
  HiGlobeAlt,
  HiInformationCircle,
  HiMapPin,
  HiPhone,
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

const formatReviews = (value: number) => value.toLocaleString('en-US');

const toMapUrl = (hospital: Hospital) =>
  `https://www.google.com/maps?q=${hospital.coordinates.lat},${hospital.coordinates.lng}`;

const toStaticMapUrl = (hospital: Hospital) => {
  const { lat, lng } = hospital.coordinates;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=200x120&markers=color:green%7C${lat},${lng}&key=${mapsKey}`;
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
  const ar = lang === 'ar';
  const hospitalName = ar ? hospital.hospitalNameAr : hospital.hospitalName;
  const specialization = ar ? hospital.specializationAr : hospital.specialization;
  const city = ar ? hospital.cityAr : hospital.city;
  const about = ar ? hospital.aboutAr : hospital.about;
  const address = ar ? hospital.addressAr : hospital.address;
  const typeLabel = hospital.type === 'Government' ? 'Gov.' : 'Private';
  const typeBadgeClass = hospital.type === 'Government' ? 'bg-blue-600' : 'bg-orange-500';
  const mapUrl = toMapUrl(hospital);

  return (
    <article className="rounded-xl border border-gray-100 bg-white p-4 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1B4D3E] text-white shadow-sm">
              <HiBuildingOffice className="h-6 w-6" />
              <span
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-black text-white ${typeBadgeClass}`}
              >
                {typeLabel}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <span className="inline-flex max-w-full rounded-full bg-[#1B4D3E] px-2.5 py-1 text-[10px] font-black text-white">
                <span className="truncate">{specialization}</span>
              </span>
              <h3 className="mt-2 text-base font-black leading-tight text-slate-950">{hospitalName}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <HiMapPin className="h-3 w-3 text-[#1B4D3E]" />
                  {city}
                </span>
                <span>({formatReviews(hospital.totalReviews)} reviews)</span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <h4 className="text-xs font-black text-slate-950">Expertise</h4>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hospital.services.map((service) => (
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
          {mapsKey ? (
            <img
              src={toStaticMapUrl(hospital)}
              alt={`${hospital.hospitalName} map`}
              className="h-[120px] w-full object-cover transition duration-200 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <iframe
              src={toOsmEmbedUrl(hospital)}
              title={`${hospital.hospitalName} map`}
              className="h-[120px] w-full border-0"
              loading="lazy"
            />
          )}
          <div className="flex items-center justify-center gap-1 py-1.5 text-[10px] font-black text-[#1B4D3E]">
            <HiMapPin className="h-3 w-3" />
            View on Map
          </div>
        </a>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
        <div className="min-w-0">
          <Stars value={hospital.rating} />
          <p className="mt-1 text-[10px] font-black text-slate-700">
            {hospital.rating} ({formatReviews(hospital.totalReviews)} reviews)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700">
          <svg className="h-3.5 w-3.5 shrink-0 text-[#1B4D3E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          <span>Est. {hospital.established}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-700">
          <svg className="h-3.5 w-3.5 shrink-0 text-[#1B4D3E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>
          <span>{hospital.beds} Beds</span>
        </div>
      </div>

      {open && (
        <div className="mt-4 rounded-xl border border-[#1B4D3E]/15 bg-[#1B4D3E]/5 p-3">
          <p className="text-xs font-semibold leading-6 text-slate-700">{about}</p>
          <p className="mt-2 text-xs font-bold text-slate-600">{address}</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <a
          href={hospital.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-[#1B4D3E] px-3 py-2 text-center text-[11px] font-black text-white transition hover:bg-[#12372d]"
        >
          Book Appointment
        </a>
        <a
          href={hospital.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[#1B4D3E] hover:text-[#1B4D3E]"
        >
          <HiGlobeAlt className="h-3 w-3" />
          Website
        </a>
        <a
          href={`tel:${hospital.phone}`}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[#1B4D3E] hover:text-[#1B4D3E]"
        >
          <HiPhone className="h-3 w-3" />
          Call
        </a>
        <button
          type="button"
          onClick={onToggleAbout}
          className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-700 transition hover:border-[#1B4D3E] hover:text-[#1B4D3E]"
        >
          <HiInformationCircle className="h-3 w-3" />
          About
        </button>
      </div>
    </article>
  );
}
