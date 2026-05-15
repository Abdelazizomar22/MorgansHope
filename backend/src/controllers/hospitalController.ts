import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

type HospitalType = 'Gov' | 'Private';

interface HospitalDirectoryItem {
  id: number;
  name: string;
  specialty: string;
  city: string;
  coordinates: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  establishedYear: number;
  beds: string;
  expertise: string[];
  type: HospitalType;
  website: string;
  phone: string;
  bookingUrl: string;
  address: string;
}

const hospitals: HospitalDirectoryItem[] = [
  {
    id: 1,
    name: 'National Cancer Institute (NCI)',
    specialty: 'Oncology & Cancer Surgery',
    city: 'Cairo',
    coordinates: { lat: 30.0626, lng: 31.2497 },
    rating: 4.2,
    reviewCount: 1840,
    establishedYear: 1969,
    beds: '750+',
    expertise: ['Lung Cancer', 'Chemotherapy', 'Radiation', 'Surgery', 'Bone Marrow'],
    type: 'Gov',
    website: 'https://nci.cu.edu.eg',
    phone: '+20-2-25364300',
    bookingUrl: 'https://nci.cu.edu.eg/ar/%D8%B5%D9%81%D8%AD%D8%A9-%D8%A7%D9%84%D8%A7%D8%AA%D8%B5%D8%A7%D9%84/',
    address: 'Kasr El Aini St, Cairo University, Giza',
  },
  {
    id: 2,
    name: 'Ain Shams University Oncology Hospital',
    specialty: 'Oncology & Radiology',
    city: 'Cairo',
    coordinates: { lat: 30.0776, lng: 31.3187 },
    rating: 4.0,
    reviewCount: 920,
    establishedYear: 1948,
    beds: '500+',
    expertise: ['Lung Cancer', 'CT Biopsy', 'Chemotherapy', 'Radiation', 'Palliative Care'],
    type: 'Gov',
    website: 'https://www.medicine.asu.edu.eg',
    phone: '+20-2-24823402',
    bookingUrl: 'https://www.medicine.asu.edu.eg/contact',
    address: 'Khalifa El Maamon St, Abbasyia, Cairo',
  },
  {
    id: 3,
    name: 'Dar Al Fouad Hospital',
    specialty: 'Oncology, Thoracic Surgery & Lung Cancer',
    city: 'Cairo',
    coordinates: { lat: 30.0589, lng: 31.2248 },
    rating: 4.6,
    reviewCount: 2310,
    establishedYear: 1999,
    beds: '300+',
    expertise: ['VATS Surgery', 'PET-CT', 'Immunotherapy', 'Targeted Therapy', 'Palliative Care'],
    type: 'Private',
    website: 'https://www.darelfouad.com',
    phone: '+20-2-38272222',
    bookingUrl: 'https://www.darelfouad.com/appointment',
    address: '26 July Corridor, 6th of October City, Giza',
  },
  {
    id: 4,
    name: 'South Egypt Cancer Institute (SECI)',
    specialty: 'Cancer & Oncology Research',
    city: 'Assiut',
    coordinates: { lat: 27.1783, lng: 31.1859 },
    rating: 4.3,
    reviewCount: 1120,
    establishedYear: 1997,
    beds: '280+',
    expertise: ['Lung Cancer', 'Chemotherapy', 'Radiation', 'Nuclear Medicine', 'Surgery'],
    type: 'Gov',
    website: 'http://www.aun.edu.eg/seci',
    phone: '+20-88-2148088',
    bookingUrl: 'http://www.aun.edu.eg/seci/contact_us.php',
    address: 'Assiut University Campus, Assiut',
  },
  {
    id: 5,
    name: 'Mansoura University Oncology Center',
    specialty: 'Oncology & Cancer Research',
    city: 'Mansoura',
    coordinates: { lat: 31.0409, lng: 31.3785 },
    rating: 4.4,
    reviewCount: 1450,
    establishedYear: 1985,
    beds: '320+',
    expertise: ['Bronchoscopy', 'CT Biopsy', 'Chemotherapy', 'Radiation', 'Surgery'],
    type: 'Gov',
    website: 'https://www.mans.edu.eg',
    phone: '+20-50-2371025',
    bookingUrl: 'https://www.mans.edu.eg/ar/contact',
    address: 'El Gomhouria St, Mansoura, Dakahlia',
  },
  {
    id: 6,
    name: 'Alexandria University Hospital - Chest Dept.',
    specialty: 'Chest Medicine & Thoracic Oncology',
    city: 'Alexandria',
    coordinates: { lat: 31.1975, lng: 29.8925 },
    rating: 4.1,
    reviewCount: 860,
    establishedYear: 1942,
    beds: '400+',
    expertise: ['Thoracic Surgery', 'Pulmonology', 'Chemotherapy', 'Radiation', 'Endoscopy'],
    type: 'Gov',
    website: 'https://www.alexu.edu.eg',
    phone: '+20-3-4874741',
    bookingUrl: 'https://www.alexu.edu.eg/index.php/en/contact-us',
    address: 'El Khartoum Square, El Azarita, Alexandria',
  },
  {
    id: 7,
    name: 'El Salam International Hospital',
    specialty: 'Oncology & Multi-Specialty',
    city: 'Cairo',
    coordinates: { lat: 30.0613, lng: 31.3419 },
    rating: 4.3,
    reviewCount: 1680,
    establishedYear: 1981,
    beds: '380+',
    expertise: ['PET-CT', 'MRI', 'Tumor Board', 'Chemotherapy', 'Immunotherapy'],
    type: 'Private',
    website: 'https://www.elsalam.com',
    phone: '+20-2-25240250',
    bookingUrl: 'https://www.elsalam.com/contact-us',
    address: 'Corniche El Nile, Maadi, Cairo',
  },
  {
    id: 8,
    name: 'Kasr El Ainy Hospital - Chest Medicine',
    specialty: 'Chest Medicine & Pulmonary Oncology',
    city: 'Cairo',
    coordinates: { lat: 30.0338, lng: 31.2304 },
    rating: 3.9,
    reviewCount: 2100,
    establishedYear: 1837,
    beds: '1200+',
    expertise: ['Thoracic Surgery', 'Pulmonology', 'CT Scan', 'Biopsy', 'Chemotherapy'],
    type: 'Gov',
    website: 'https://kasralainy.cu.edu.eg',
    phone: '+20-2-23628000',
    bookingUrl: 'https://kasralainy.cu.edu.eg/ar/contact',
    address: 'Kasr El Aini St, Cairo',
  },
];

const normalize = (value: unknown) => String(value || '').trim().toLowerCase();

const matchesSpecialization = (hospital: HospitalDirectoryItem, specialization: string) => {
  if (!specialization) return true;
  const pool = [hospital.specialty, ...hospital.expertise].map((item) => item.toLowerCase());
  return pool.some((item) => item.includes(specialization));
};

export async function getAll(req: AuthRequest, res: Response): Promise<void> {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || hospitals.length);
  const offset = (page - 1) * limit;

  const city = normalize(req.query.city);
  const type = normalize(req.query.type).replace('.', '');
  const specialization = normalize(req.query.specialization);
  const search = normalize(req.query.search);

  const filtered = hospitals.filter((hospital) => {
    const typeValue = hospital.type.toLowerCase();
    const searchPool = [hospital.name, hospital.specialty, hospital.city, hospital.address, ...hospital.expertise]
      .join(' ')
      .toLowerCase();

    return (
      (!city || hospital.city.toLowerCase() === city) &&
      (!type || typeValue === type || (type === 'government' && typeValue === 'gov')) &&
      matchesSpecialization(hospital, specialization) &&
      (!search || searchPool.includes(search))
    );
  });

  const rows = filtered.slice(offset, offset + limit);

  res.json({
    success: true,
    message: 'Hospitals retrieved',
    data: rows,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  });
}

export async function getCities(_req: AuthRequest, res: Response): Promise<void> {
  const cities = Array.from(new Set(hospitals.map((hospital) => hospital.city))).sort();
  res.json({
    success: true,
    message: 'Cities retrieved',
    data: cities.map((city, index) => ({ id: index + 1, cityName: city, country: 'Egypt' })),
  });
}

export async function getById(req: AuthRequest, res: Response): Promise<void> {
  const hospital = hospitals.find((item) => item.id === Number(req.params.id));

  if (!hospital) {
    res.status(404).json({ success: false, message: 'Hospital not found' });
    return;
  }

  res.json({ success: true, message: 'Hospital retrieved', data: hospital });
}
