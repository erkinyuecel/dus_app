import { BaseScoreRow, DUSExamRule, ExamPeriod } from '../types';

export const DUS_TOTAL_QUESTIONS = 120;
export const DUS_DURATION_MINUTES = 150;

export const TEMEL_BILIMLER_RULES: DUSExamRule[] = [
  { category: 'Anatomi', count: 6, testType: 'temel' },
  { category: 'Fizyoloji', count: 6, testType: 'temel' },
  { category: 'Tibbi Biyokimya', count: 6, testType: 'temel' },
  { category: 'Tibbi Mikrobiyoloji', count: 6, testType: 'temel' },
  { category: 'Histoloji ve Embriyoloji', count: 4, testType: 'temel' },
  { category: 'Tibbi Patoloji', count: 4, testType: 'temel' },
  { category: 'Tibbi Farmakoloji', count: 4, testType: 'temel' },
  { category: 'Tibbi Biyoloji ve Genetik', count: 4, testType: 'temel' },
];

export const KLINIK_BILIMLER_RULES: DUSExamRule[] = [
  { category: 'Ortodonti', count: 10, testType: 'klinik' },
  { category: 'Endodonti', count: 10, testType: 'klinik' },
  { category: 'Periodontoloji', count: 10, testType: 'klinik' },
  { category: 'Agiz, Dis ve Cene Cerrahisi', count: 10, testType: 'klinik' },
  { category: 'Agiz, Dis ve Cene Radyolojisi', count: 10, testType: 'klinik' },
  { category: 'Cocuk Dis Hekimligi (Pedodonti)', count: 10, testType: 'klinik' },
  { category: 'Protetik Dis Tedavisi', count: 10, testType: 'klinik' },
  { category: 'Restoratif Dis Tedavisi', count: 10, testType: 'klinik' },
];

export const ALL_RULES = [...TEMEL_BILIMLER_RULES, ...KLINIK_BILIMLER_RULES];

export const EXAM_PERIODS: ExamPeriod[] = [
  {
    id: '2026-1',
    label: '2026 - 1. Dönem',
    examDate: '2026-04-26T10:00:00+03:00',
    resultDate: '2026-05-22',
  },
  {
    id: '2026-2',
    label: '2026 - 2. Dönem',
    examDate: '2026-11-01T10:00:00+03:00',
    applicationDates: '16 - 24 Eylül 2026',
    resultDate: '2026-11-26',
  },
];

export const BASE_SCORES_2025_2: BaseScoreRow[] = [
  { university: 'Hacettepe Üniversitesi', department: 'Ortodonti', score: 74.8 },
  { university: 'İstanbul Üniversitesi', department: 'Ağız, Diş ve Çene Cerrahisi', score: 71.5 },
  { university: 'Ankara Üniversitesi', department: 'Endodonti', score: 67.2 },
  { university: 'Ege Üniversitesi', department: 'Periodontoloji', score: 69.4 },
  { university: 'Marmara Üniversitesi', department: 'Çocuk Diş Hekimliği', score: 68.1 },
  { university: 'Gazi Üniversitesi', department: 'Protetik Diş Tedavisi', score: 66.5 },
  { university: 'Akdeniz Üniversitesi', department: 'Restoratif Diş Tedavisi', score: 65.3 },
  { university: 'Dokuz Eylül Üniversitesi', department: 'Ağız, Diş ve Çene Radyolojisi', score: 64.9 },
  { university: 'Ege Üniversitesi', department: 'Ortodonti', score: 73.9 },
  { university: 'Marmara Üniversitesi', department: 'Ortodonti', score: 73.4 },
  { university: 'Gazi Üniversitesi', department: 'Ortodonti', score: 72.8 },
  { university: 'Ondokuz Mayıs Üniversitesi', department: 'Ortodonti', score: 66.2 },
  { university: 'Ankara Üniversitesi', department: 'Ağız, Diş ve Çene Cerrahisi', score: 70.8 },
  { university: 'Ege Üniversitesi', department: 'Ağız, Diş ve Çene Cerrahisi', score: 69.8 },
  { university: 'Marmara Üniversitesi', department: 'Ağız, Diş ve Çene Cerrahisi', score: 69.2 },
  { university: 'Karadeniz Teknik Üniversitesi', department: 'Ağız, Diş ve Çene Cerrahisi', score: 63.7 },
  { university: 'Gazi Üniversitesi', department: 'Endodonti', score: 66.8 },
  { university: 'Marmara Üniversitesi', department: 'Endodonti', score: 66.3 },
  { university: 'Ege Üniversitesi', department: 'Endodonti', score: 65.9 },
  { university: 'Erciyes Üniversitesi', department: 'Endodonti', score: 62.7 },
  { university: 'Ankara Üniversitesi', department: 'Periodontoloji', score: 68.9 },
  { university: 'Hacettepe Üniversitesi', department: 'Periodontoloji', score: 68.5 },
  { university: 'Gazi Üniversitesi', department: 'Periodontoloji', score: 67.7 },
  { university: 'Süleyman Demirel Üniversitesi', department: 'Periodontoloji', score: 62.1 },
  { university: 'Ankara Üniversitesi', department: 'Çocuk Diş Hekimliği', score: 67.6 },
  { university: 'Ege Üniversitesi', department: 'Çocuk Diş Hekimliği', score: 67.2 },
  { university: 'Gazi Üniversitesi', department: 'Çocuk Diş Hekimliği', score: 66.9 },
  { university: 'Atatürk Üniversitesi', department: 'Çocuk Diş Hekimliği', score: 61.8 },
  { university: 'Ankara Üniversitesi', department: 'Protetik Diş Tedavisi', score: 66.1 },
  { university: 'Marmara Üniversitesi', department: 'Protetik Diş Tedavisi', score: 65.9 },
  { university: 'Ege Üniversitesi', department: 'Protetik Diş Tedavisi', score: 65.6 },
  { university: 'Çukurova Üniversitesi', department: 'Protetik Diş Tedavisi', score: 61.5 },
  { university: 'Ankara Üniversitesi', department: 'Restoratif Diş Tedavisi', score: 65.1 },
  { university: 'Marmara Üniversitesi', department: 'Restoratif Diş Tedavisi', score: 64.7 },
  { university: 'Gazi Üniversitesi', department: 'Restoratif Diş Tedavisi', score: 64.2 },
  { university: 'Kocaeli Üniversitesi', department: 'Restoratif Diş Tedavisi', score: 60.9 },
  { university: 'Ankara Üniversitesi', department: 'Ağız, Diş ve Çene Radyolojisi', score: 64.5 },
  { university: 'Marmara Üniversitesi', department: 'Ağız, Diş ve Çene Radyolojisi', score: 64.1 },
  { university: 'Ege Üniversitesi', department: 'Ağız, Diş ve Çene Radyolojisi', score: 63.8 },
  { university: 'Van Yüzüncü Yıl Üniversitesi', department: 'Ağız, Diş ve Çene Radyolojisi', score: 60.4 },
];

export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  'Tibbi Biyokimya': 'Tıbbi Biyokimya',
  'Tibbi Mikrobiyoloji': 'Tıbbi Mikrobiyoloji',
  'Tibbi Patoloji': 'Tıbbi Patoloji',
  'Tibbi Farmakoloji': 'Tıbbi Farmakoloji',
  'Tibbi Biyoloji ve Genetik': 'Tıbbi Biyoloji ve Genetik',
  'Agiz, Dis ve Cene Cerrahisi': 'Ağız, Diş ve Çene Cerrahisi',
  'Agiz, Dis ve Cene Radyolojisi': 'Ağız, Diş ve Çene Radyolojisi',
  'Cocuk Dis Hekimligi (Pedodonti)': 'Çocuk Diş Hekimliği (Pedodonti)',
  'Protetik Dis Tedavisi': 'Protetik Diş Tedavisi',
  'Restoratif Dis Tedavisi': 'Restoratif Diş Tedavisi',
};

export function getCategoryDisplayName(category: string) {
  return CATEGORY_DISPLAY_NAMES[category] ?? category;
}
