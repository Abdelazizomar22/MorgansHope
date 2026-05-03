import {
  Cpu,
  Zap,
  FileText,
  House,
  Shield,
  Globe,
} from 'lucide-react';

const FEATURE_ICON_SIZE = 28;
export const FEATURES = [
  { Icon: Cpu,      title: { en: 'Dual AI Models',     ar: 'نموذجان AI'          }, desc: { en: 'Specialized algorithms for CT and X-Ray scans',        ar: 'خوارزميات مخصصة لصور CT والأشعة السينية'     } },
  { Icon: Zap,      title: { en: 'Batch Scanning',     ar: 'رفع متعدد'           }, desc: { en: 'Fast deep learning inference on multiple scans at once', ar: 'تحليل سريع لأكثر من صورة في نفس الوقت'       } },
  { Icon: FileText, title: { en: 'PDF Reports',        ar: 'تقارير PDF'          }, desc: { en: 'Detailed printable medical report',                     ar: 'تقرير طبي مفصّل قابل للطباعة'                } },
  { Icon: House,    title: { en: 'Hospital Finder',    ar: 'مُوجِّه المستشفيات' }, desc: { en: 'Nearest oncology centers in Egypt',                     ar: 'أقرب مراكز الأورام في مصر'                   } },
  { Icon: Globe,    title: { en: 'AI Medical Chatbot', ar: 'مساعد طبي ذكي'      }, desc: { en: 'Instant answers to your medical queries',               ar: 'إجابات فورية لاستفساراتك الطبية'             } },
  { Icon: Shield,   title: { en: 'Privacy First',      ar: 'خصوصيتك أولاً'      }, desc: { en: 'Your scans are encrypted and never shared with third parties', ar: 'صورك مشفّرة ولا تُشارك مع أي طرف خارجي' } },
];