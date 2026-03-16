import dotenv from 'dotenv';
dotenv.config();

import sequelize from '../config/database';
import User from '../models/User';
import City from '../models/City';
import Hospital from '../models/Hospital';
import '../models/AnalysisResult';
import bcrypt from 'bcryptjs';

const cities = [
  { cityName: 'Cairo',      state: 'Cairo',          country: 'Egypt' },
  { cityName: 'Giza',       state: 'Giza',           country: 'Egypt' },
  { cityName: 'Alexandria', state: 'Alexandria',     country: 'Egypt' },
  { cityName: 'Assiut',     state: 'Assiut',         country: 'Egypt' },
  { cityName: 'Mansoura',   state: 'Dakahlia',       country: 'Egypt' },
];

const hospitalsData = [
  {
    cityName: 'Cairo',
    hospitalName: 'National Cancer Institute (NCI)',
    specialization: 'Oncology',
    address: 'Fom El-Khalig, Cairo, Egypt',
    phone: '+20-2-25317765',
    website: 'https://nci.cu.edu.eg',
    rating: 4.8,
    totalReviews: 1240,
    imageUrl: 'https://nci.cu.edu.eg/wp-content/uploads/2020/01/NCI-Building.jpg',
  },
  {
    cityName: 'Cairo',
    hospitalName: 'Ain Shams University Hospital',
    specialization: 'Pulmonology & Oncology',
    address: 'Abbassiya, Cairo, Egypt',
    phone: '+20-2-24820740',
    website: 'https://shams.edu.eg',
    rating: 4.5,
    totalReviews: 980,
    imageUrl: '',
  },
  {
    cityName: 'Cairo',
    hospitalName: 'El Salam International Hospital',
    specialization: 'Chest & Oncology',
    address: 'Corniche El Nile, Cairo, Egypt',
    phone: '+20-2-25245050',
    website: 'https://elsalamhospital.com',
    rating: 4.6,
    totalReviews: 870,
    imageUrl: '',
  },
  {
    cityName: 'Cairo',
    hospitalName: 'Kasr El Ainy Hospital',
    specialization: 'Oncology & Radiology',
    address: 'Kasr Al Ainy St., Cairo, Egypt',
    phone: '+20-2-23641100',
    website: 'https://kasralainy.cu.edu.eg',
    rating: 4.4,
    totalReviews: 1100,
    imageUrl: '',
  },
  {
    cityName: 'Giza',
    hospitalName: 'Dar Al Fouad Hospital',
    specialization: 'Oncology & Thoracic Surgery',
    address: '6th of October City, Giza, Egypt',
    phone: '+20-38352000',
    website: 'https://darelfouad.com',
    rating: 4.9,
    totalReviews: 2100,
    imageUrl: '',
  },
  {
    cityName: 'Alexandria',
    hospitalName: 'Alexandria University Hospital',
    specialization: 'Chest Diseases & Oncology',
    address: 'El-Khartoum Square, Alexandria, Egypt',
    phone: '+20-3-4870678',
    website: 'https://alexu.edu.eg',
    rating: 4.5,
    totalReviews: 760,
    imageUrl: '',
  },
  {
    cityName: 'Assiut',
    hospitalName: 'South Egypt Cancer Institute (SECI)',
    specialization: 'Oncology',
    address: 'Assiut University Campus, Assiut, Egypt',
    phone: '+20-88-2414610',
    website: 'https://seci.aun.edu.eg',
    rating: 4.7,
    totalReviews: 930,
    imageUrl: '',
  },
  {
    cityName: 'Mansoura',
    hospitalName: 'Mansoura University Oncology Center',
    specialization: 'Oncology & Nuclear Medicine',
    address: 'El Gomhoria St., Mansoura, Egypt',
    phone: '+20-50-2200900',
    website: 'https://mans.edu.eg',
    rating: 4.6,
    totalReviews: 820,
    imageUrl: '',
  },
];

async function seed() {
  try {
    await sequelize.sync({ force: false });
    console.log('🔄 Seeding database...');

    // Cities
    const cityMap: Record<string, number> = {};
    for (const c of cities) {
      const [city] = await City.findOrCreate({ where: { cityName: c.cityName }, defaults: c });
      cityMap[c.cityName] = city.id;
    }
    console.log('✅ Cities seeded');

    // Hospitals
    for (const h of hospitalsData) {
      const cityId = cityMap[h.cityName];
      await Hospital.findOrCreate({
        where: { hospitalName: h.hospitalName },
        defaults: { ...h, cityId },
      });
    }
    console.log('✅ Hospitals seeded');

    // Admin user
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
      console.log('✅ Admin user created: admin@medtech.com / Admin@123456');
    } else {
      console.log('ℹ️  Admin already exists');
    }

    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
