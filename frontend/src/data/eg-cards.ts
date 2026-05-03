import { Users, Star, Cigarette, TriangleAlert } from 'lucide-react';

export const EGYPT_CARDS = [
  {
    val: 7600,
    en: 'New cases/year in Egypt', ar: 'حالة جديدة سنوياً في مصر',
    subEn: 'GLOBOCAN 2022',        subAr: 'GLOBOCAN 2022',
    prefix: '~', format: true,
    icon: Users,
  },
  {
    val: 1,
    en: 'Global cause of cancer death', ar: 'السبب العالمي لوفيات السرطان',
    subEn: 'In Men',               subAr: 'عند الرجال',
    prefix: '#',
    icon: Star,
  },
  {
    val: 80,
    en: 'Cases linked to smoking', ar: 'الحالات مرتبطة بالتدخين',
    subEn: 'Modifiable Risk',      subAr: 'عامل خطر قابل للتعديل',
    suffix: '%',
    icon: Cigarette,
  },
  {
    val: 75,
    en: 'Diagnosed at late stage', ar: 'تُشخَّص في مراحل متأخرة',
    subEn: 'NCI Egypt Data',       subAr: 'NCI Egypt Data',
    prefix: '70-', suffix: '%',
    icon: TriangleAlert,
  },
];