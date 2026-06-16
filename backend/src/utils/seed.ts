import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database';
import User from '../models/User';
import City from '../models/City';
import Hospital from '../models/Hospital';
import '../models/AnalysisResult';
import bcrypt from 'bcryptjs';

const cities = [
  { cityName: 'Cairo',      cityNameAr: 'القاهرة',       state: 'Cairo',          country: 'Egypt' },
  { cityName: 'Giza',       cityNameAr: 'الجيزة',        state: 'Giza',           country: 'Egypt' },
  { cityName: 'Alexandria', cityNameAr: 'الإسكندرية',    state: 'Alexandria',     country: 'Egypt' },
  { cityName: 'Assiut',     cityNameAr: 'أسيوط',         state: 'Assiut',         country: 'Egypt' },
  { cityName: 'Mansoura',   cityNameAr: 'المنصورة',      state: 'Dakahlia',       country: 'Egypt' },
];

const hospitalsData = [
  {
    cityName: 'Cairo',
    cityNameAr: 'القاهرة',
    hospitalName: 'National Cancer Institute (NCI)',
    hospitalNameAr: 'معهد الأورام القومي',
    specialization: 'Oncology & Cancer Surgery',
    specializationAr: 'الأورام وجراحة السرطان',
    address: 'Kasr El Aini St, Cairo University, Giza',
    addressAr: 'شارع قصر العيني، جامعة القاهرة، الجيزة',
    phone: '+20-2-25364300',
    website: 'https://nci.cu.edu.eg',
    rating: 4.2,
    totalReviews: 1840,
    latitude: 30.0626,
    longitude: 31.2497,
    establishedYear: 1969,
    beds: '750+',
    expertise: ['Lung Cancer', 'Chemotherapy', 'Radiation', 'Surgery', 'Bone Marrow'],
    services: ['Lung Cancer', 'Chemotherapy', 'Radiation', 'Surgery', 'Bone Marrow'],
    type: 'Gov' as const,
    bookingUrl: 'https://nci.cu.edu.eg/ar/%D8%B5%D9%81%D8%AD%D8%A9-%D8%A7%D9%84%D8%A7%D8%AA%D8%B5%D8%A7%D9%84/',
    about: 'The largest cancer treatment center in Egypt and the Middle East, affiliated with Cairo University. Provides comprehensive oncology services including lung cancer diagnosis, chemotherapy, radiation therapy, and surgical treatment.',
    aboutAr: 'أكبر مركز لعلاج السرطان في مصر والشرق الأوسط، تابع لجامعة القاهرة. يقدم خدمات شاملة للأورام تشمل تشخيص سرطان الرئة والعلاج الكيميائي والإشعاعي والجراحي.',
    googleMaps: 'https://www.google.com/maps/search/?api=1&query=30.0626,31.2497',
    badge: 'Largest in Egypt',
    badgeColor: '#dc3545',
  },
  {
    cityName: 'Cairo',
    cityNameAr: 'القاهرة',
    hospitalName: 'Ain Shams University Oncology Hospital',
    hospitalNameAr: 'مستشفى أورام عين شمس الجامعي',
    specialization: 'Oncology & Radiology',
    specializationAr: 'الأورام والأشعة التشخيصية',
    address: 'Khalifa El Maamon St, Abbasyia, Cairo',
    addressAr: 'شارع خليفة المأمون، العباسية، القاهرة',
    phone: '+20-2-24823402',
    website: 'https://www.medicine.asu.edu.eg',
    rating: 4.0,
    totalReviews: 920,
    latitude: 30.0776,
    longitude: 31.3187,
    establishedYear: 1948,
    beds: '500+',
    expertise: ['Lung Cancer', 'CT Biopsy', 'Chemotherapy', 'Radiation', 'Palliative Care'],
    services: ['Lung Cancer', 'CT Biopsy', 'Chemotherapy', 'Radiation', 'Palliative Care'],
    type: 'Gov' as const,
    bookingUrl: 'https://www.medicine.asu.edu.eg/contact',
    about: 'Ain Shams University Hospital offers specialized oncology services including lung cancer screening, CT-guided biopsy, and integrated cancer care programs.',
    aboutAr: 'مستشفى عين شمس الجامعي يقدم خدمات أورام متخصصة تشمل فحص سرطان الرئة وخزعة موجهة بالـ CT وبرامج رعاية سرطانية متكاملة.',
    googleMaps: 'https://www.google.com/maps/search/?api=1&query=30.0776,31.3187',
    badge: 'University Hospital',
    badgeColor: '#0056b3',
  },
  {
    cityName: 'Giza',
    cityNameAr: 'الجيزة',
    hospitalName: 'Dar Al Fouad Hospital',
    hospitalNameAr: 'مستشفى دار الفؤاد',
    specialization: 'Oncology, Thoracic Surgery & Lung Cancer',
    specializationAr: 'الأورام وجراحة الصدر وسرطان الرئة',
    address: '26 July Corridor, 6th of October City, Giza',
    addressAr: 'محور 26 يوليو، مدينة 6 أكتوبر، الجيزة',
    phone: '+20-2-38272222',
    website: 'https://www.darelfouad.com',
    rating: 4.6,
    totalReviews: 2310,
    latitude: 30.0589,
    longitude: 31.2248,
    establishedYear: 1999,
    beds: '300+',
    expertise: ['VATS Surgery', 'PET-CT', 'Immunotherapy', 'Targeted Therapy', 'Palliative Care'],
    services: ['VATS Surgery', 'PET-CT', 'Immunotherapy', 'Targeted Therapy', 'Palliative Care'],
    type: 'Private',
    bookingUrl: 'https://www.darelfouad.com/appointment',
    about: 'A leading JCI-accredited private hospital with a dedicated oncology center. Offers advanced lung cancer treatment including VATS (Video-Assisted Thoracic Surgery), PET-CT, targeted therapy, and immunotherapy.',
    aboutAr: 'مستشفى خاص رائد معتمد من JCI مع مركز أورام متخصص. يقدم علاج متقدم لسرطان الرئة يشمل جراحة الصدر بالمنظار وPET-CT والعلاج المستهدف والمناعي.',
    googleMaps: 'https://www.google.com/maps/search/?api=1&query=30.0589,31.2248',
    badge: 'JCI Accredited',
    badgeColor: '#16a34a',
  },
  {
    cityName: 'Assiut',
    cityNameAr: 'أسيوط',
    hospitalName: 'South Egypt Cancer Institute (SECI)',
    hospitalNameAr: 'معهد جنوب مصر للأورام',
    specialization: 'Cancer & Oncology Research',
    specializationAr: 'الأورام وأبحاث السرطان',
    address: 'Assiut University Campus, Assiut',
    addressAr: 'حرم جامعة أسيوط، أسيوط',
    phone: '+20-88-2148088',
    website: 'http://www.aun.edu.eg/seci',
    rating: 4.3,
    totalReviews: 1120,
    latitude: 27.1783,
    longitude: 31.1859,
    establishedYear: 1997,
    beds: '280+',
    expertise: ['Lung Cancer', 'Chemotherapy', 'Radiation', 'Nuclear Medicine', 'Surgery'],
    services: ['Lung Cancer', 'Chemotherapy', 'Radiation', 'Nuclear Medicine', 'Surgery'],
    type: 'Gov' as const,
    bookingUrl: 'http://www.aun.edu.eg/seci/contact_us.php',
    about: 'South Egypt Cancer Institute (SECI) is a specialized cancer research and treatment center affiliated with Assiut University.',
    aboutAr: 'معهد جنوب مصر للأورام مركز متخصص في أبحاث وعلاج السرطان تابع لجامعة أسيوط.',
    googleMaps: 'https://www.google.com/maps/search/?api=1&query=27.1783,31.1859',
    badge: 'Serves Upper Egypt',
    badgeColor: '#6f42c1',
  },
  {
    cityName: 'Mansoura',
    cityNameAr: 'المنصورة',
    hospitalName: 'Mansoura University Oncology Center',
    hospitalNameAr: 'مركز أورام جامعة المنصورة',
    specialization: 'Oncology & Cancer Research',
    specializationAr: 'الأورام وأبحاث السرطان',
    address: 'El Gomhouria St, Mansoura, Dakahlia',
    addressAr: 'شارع الجمهورية، المنصورة، الدقهلية',
    phone: '+20-50-2371025',
    website: 'https://www.mans.edu.eg',
    rating: 4.4,
    totalReviews: 1450,
    latitude: 31.0409,
    longitude: 31.3785,
    establishedYear: 1985,
    beds: '320+',
    expertise: ['Bronchoscopy', 'CT Biopsy', 'Chemotherapy', 'Radiation', 'Surgery'],
    services: ['Bronchoscopy', 'CT Biopsy', 'Chemotherapy', 'Radiation', 'Surgery'],
    type: 'Gov' as const,
    bookingUrl: 'https://www.mans.edu.eg/ar/contact',
    about: "One of the most advanced oncology centers in Egypt's Delta region. Affiliated with Mansoura University.",
    aboutAr: 'من أكثر مراكز الأورام تطوراً في منطقة الدلتا. تابع لجامعة المنصورة.',
    googleMaps: 'https://www.google.com/maps/search/?api=1&query=31.0409,31.3785',
    badge: 'Delta Region Leader',
    badgeColor: '#2c7da0',
  },
  {
    cityName: 'Alexandria',
    cityNameAr: 'الإسكندرية',
    hospitalName: 'Alexandria University Hospital — Chest Dept.',
    hospitalNameAr: 'مستشفى جامعة الإسكندرية — قسم الصدر',
    specialization: 'Chest Medicine & Thoracic Oncology',
    specializationAr: 'أمراض الصدر وأورام الصدر',
    address: 'El Khartoum Square, El Azarita, Alexandria',
    addressAr: 'ميدان الخرطوم، العزاريطة، الإسكندرية',
    phone: '+20-3-4874741',
    website: 'https://www.alexu.edu.eg',
    rating: 4.1,
    totalReviews: 860,
    latitude: 31.1975,
    longitude: 29.8925,
    establishedYear: 1942,
    beds: '400+',
    expertise: ['Thoracic Surgery', 'Pulmonology', 'Chemotherapy', 'Radiation', 'Endoscopy'],
    services: ['Thoracic Surgery', 'Pulmonology', 'Chemotherapy', 'Radiation', 'Endoscopy'],
    type: 'Gov' as const,
    bookingUrl: 'https://www.alexu.edu.eg/index.php/en/contact-us',
    about: "Alexandria University Hospital's chest department is a key referral center for lung cancer in Northern Egypt.",
    aboutAr: 'قسم الصدر في مستشفى جامعة الإسكندرية مركز إحالة رئيسي لسرطان الرئة في شمال مصر.',
    googleMaps: 'https://www.google.com/maps/search/?api=1&query=31.1975,29.8925',
    badge: 'North Egypt',
    badgeColor: '#0d3b2e',
  },
  {
    cityName: 'Cairo',
    cityNameAr: 'القاهرة',
    hospitalName: 'El Salam International Hospital',
    hospitalNameAr: 'مستشفى السلام الدولي',
    specialization: 'Oncology & Multi-Specialty',
    specializationAr: 'الأورام ومتعدد التخصصات',
    address: 'Corniche El Nile, Maadi, Cairo',
    addressAr: 'كورنيش النيل، المعادي، القاهرة',
    phone: '+20-2-25240250',
    website: 'https://www.elsalam.com',
    rating: 4.3,
    totalReviews: 1680,
    latitude: 30.0613,
    longitude: 31.3419,
    establishedYear: 1981,
    beds: '380+',
    expertise: ['PET-CT', 'MRI', 'Tumor Board', 'Chemotherapy', 'Immunotherapy'],
    services: ['PET-CT', 'MRI', 'Tumor Board', 'Chemotherapy', 'Immunotherapy'],
    type: 'Private',
    bookingUrl: 'https://www.elsalam.com/contact-us',
    about: 'El Salam International Hospital is a well-established private hospital in Cairo with a comprehensive oncology department.',
    aboutAr: 'مستشفى السلام الدولي مستشفى خاص راسخ في القاهرة مع قسم أورام شامل.',
    googleMaps: 'https://www.google.com/maps/search/?api=1&query=30.0613,31.3419',
    badge: 'Private Excellence',
    badgeColor: '#fd7e14',
  },
  {
    cityName: 'Cairo',
    cityNameAr: 'القاهرة',
    hospitalName: 'Kasr El Ainy Hospital — Chest Medicine',
    hospitalNameAr: 'مستشفى قصر العيني — طب الصدر',
    specialization: 'Chest Medicine & Pulmonary Oncology',
    specializationAr: 'طب الصدر وأورام الرئة',
    address: 'Kasr El Aini St, Cairo',
    addressAr: 'شارع قصر العيني، القاهرة',
    phone: '+20-2-23628000',
    website: 'https://kasralainy.cu.edu.eg',
    rating: 3.9,
    totalReviews: 2100,
    latitude: 30.0338,
    longitude: 31.2304,
    establishedYear: 1837,
    beds: '1200+',
    expertise: ['Thoracic Surgery', 'Pulmonology', 'CT Scan', 'Biopsy', 'Chemotherapy'],
    services: ['Thoracic Surgery', 'Pulmonology', 'CT Scan', 'Biopsy', 'Chemotherapy'],
    type: 'Gov' as const,
    bookingUrl: 'https://kasralainy.cu.edu.eg/ar/contact',
    about: "Egypt's oldest and most prestigious teaching hospital, part of Cairo University Medical School.",
    aboutAr: 'أقدم وأعرق المستشفيات التعليمية في مصر، جزء من كلية طب جامعة القاهرة.',
    googleMaps: 'https://www.google.com/maps/search/?api=1&query=30.0338,31.2304',
    badge: 'Est. 1837',
    badgeColor: '#343a40',
  },
];

async function seed() {
  try {
    await sequelize.sync({ force: false });
    console.log('Seeding database...');

    const cityMap: Record<string, number> = {};
    for (const c of cities) {
      const { cityNameAr, ...cityDefaults } = c;
      const [city] = await City.findOrCreate({ where: { cityName: c.cityName }, defaults: cityDefaults });
      cityMap[c.cityName] = city.id;
    }
    console.log('Cities seeded');

    for (const h of hospitalsData) {
      const cityId = cityMap[h.cityName];
      const { cityName, cityNameAr, ...hospitalDefaults } = h;
      await Hospital.findOrCreate({
        where: { hospitalName: h.hospitalName },
        defaults: { ...hospitalDefaults, cityId } as any,
      });
    }
    console.log('Hospitals seeded');

    const adminEmail = 'admin@medtech.com';
    const existing = await User.findOne({ where: { email: adminEmail } });
    if (!existing) {
      const hashed = await bcrypt.hash('Admin@123456', 12);
      await User.create({
        firstName: 'Admin',
        lastName: 'MedTech',
        email: adminEmail,
        password: hashed,
        role: 'admin',
      });
      console.log('Admin user created: admin@medtech.com / Admin@123456');
    } else {
      console.log('Admin already exists');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
