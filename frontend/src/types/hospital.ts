export interface Hospital {
  id: number;
  hospitalName: string;
  hospitalNameAr?: string;
  specialization: string;
  specializationAr?: string;
  city: string;
  cityAr?: string;
  address: string;
  addressAr?: string;
  phone: string;
  rating: number;
  totalReviews: number;
  about?: string;
  aboutAr?: string;
  website?: string;
  bookingUrl?: string;
  googleMaps?: string;
  coordinates: { lat: number; lng: number };
  beds: string;
  established: string;
  type: HospitalType;
  services: string[];
  badge?: string;
  badgeColor?: string;
}

export type HospitalType = 'Government' | 'Private';

export interface FilterOption {
  label: string;
  value: string;
  count: number;
}
