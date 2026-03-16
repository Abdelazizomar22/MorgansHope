-- ============================================================
--  Morgan's Hope — Full Database Seed (Real Egyptian Hospitals)
--  Run: mysql -u root -p medtech_db < seed.sql
-- ============================================================

-- Clear existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE analysis_results;
TRUNCATE TABLE hospitals;
TRUNCATE TABLE cities;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ─── Cities ───────────────────────────────────────────────────
INSERT INTO cities (id, city_name, state, country) VALUES
  (1,  'Cairo',     'Cairo Governorate',    'Egypt'),
  (2,  'Giza',      'Giza Governorate',     'Egypt'),
  (3,  'Alexandria','Alexandria Governorate','Egypt'),
  (4,  'Mansoura',  'Dakahlia Governorate', 'Egypt'),
  (5,  'Assiut',    'Assiut Governorate',   'Egypt'),
  (6,  'Tanta',     'Gharbia Governorate',  'Egypt'),
  (7,  'Luxor',     'Luxor Governorate',    'Egypt'),
  (8,  'Suez',      'Suez Governorate',     'Egypt');

-- ─── Hospitals (8 real Egyptian oncology centers) ─────────────
INSERT INTO hospitals (
  id, city_id, hospital_name, specialization, address, phone,
  website, rating, total_reviews, image_url, is_active
) VALUES
(
  1, 1,
  'National Cancer Institute (NCI)',
  'Oncology & Cancer Surgery',
  'Kasr El Aini St, Cairo University, Giza',
  '+20-2-25364300',
  'https://nci.cu.edu.eg',
  4.2, 1840, '', TRUE
),
(
  2, 1,
  'Ain Shams University Oncology Hospital',
  'Oncology & Radiology',
  'Khalifa El Maamon St, Abbasyia, Cairo',
  '+20-2-24823402',
  'https://www.medicine.asu.edu.eg',
  4.0, 920, '', TRUE
),
(
  3, 2,
  'Dar Al Fouad Hospital',
  'Oncology, Thoracic Surgery & Lung Cancer',
  '26 July Corridor, 6th of October City, Giza',
  '+20-2-38272222',
  'https://www.darelfouad.com',
  4.6, 2310, '', TRUE
),
(
  4, 5,
  'South Egypt Cancer Institute (SECI)',
  'Cancer & Oncology Research',
  'Assiut University Campus, Assiut',
  '+20-88-2148088',
  'http://www.aun.edu.eg/seci',
  4.3, 1120, '', TRUE
),
(
  5, 4,
  'Mansoura University Oncology Center',
  'Oncology & Cancer Research',
  'El Gomhouria St, Mansoura, Dakahlia',
  '+20-50-2371025',
  'https://www.mans.edu.eg',
  4.4, 1450, '', TRUE
),
(
  6, 3,
  'Alexandria University Hospital — Chest Dept.',
  'Chest Medicine & Thoracic Oncology',
  'El Khartoum Square, El Azarita, Alexandria',
  '+20-3-4874741',
  'https://www.alexu.edu.eg',
  4.1, 860, '', TRUE
),
(
  7, 1,
  'El Salam International Hospital',
  'Oncology & Multi-Specialty',
  'Corniche El Nile, Maadi, Cairo',
  '+20-2-25240250',
  'https://www.elsalam.com',
  4.3, 1680, '', TRUE
),
(
  8, 1,
  'Kasr El Ainy Hospital — Chest Medicine',
  'Chest Medicine & Pulmonary Oncology',
  'Kasr El Aini St, Cairo',
  '+20-2-23628000',
  'https://kasralainy.cu.edu.eg',
  3.9, 2100, '', TRUE
);

-- ─── Default Admin User ───────────────────────────────────────
-- Password: Admin@123456  (bcrypt hash)
INSERT INTO users (first_name, last_name, email, password, role, is_active) VALUES
(
  'Admin',
  'MedTech',
  'admin@medtech.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeSSVMbJKBuI5frU0LFPPFd0G',
  'admin',
  TRUE
);

SELECT 'Seed completed: 8 cities, 8 hospitals, 1 admin user' AS result;
