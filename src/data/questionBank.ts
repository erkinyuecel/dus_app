import rawData from './dus_sorular.json';
import { ALL_RULES } from './dusConfig';
import { AppLanguage, LocalizedOptions, Question, QuestionDifficulty, TestType } from '../types';

type RawQuestion = {
  id: number;
  konu: string;
  zorluk: string;
  soru: string;
  secenekler: LocalizedOptions;
  dogru_cevap: 'A' | 'B' | 'C' | 'D';
  aciklama: string;
};

type RawDataset = {
  meta: {
    toplam_soru: number;
    guncelleme: string;
    sinav: string;
    format: string;
  };
  sorular: RawQuestion[];
};

const dataset = rawData as RawDataset;
const ruleTypeByCategory = new Map(ALL_RULES.map((rule) => [rule.category, rule.testType]));

const categoryAliases: Record<string, string> = {
  'Tibbi Biyokimya': 'Tibbi Biyokimya',
  'Tibbi Mikrobiyoloji': 'Tibbi Mikrobiyoloji',
  'Tibbi Patoloji': 'Tibbi Patoloji',
  'Tibbi Farmakoloji': 'Tibbi Farmakoloji',
  'Tibbi Biyoloji ve Genetik': 'Tibbi Biyoloji ve Genetik',
  'Agiz, Dis ve Cene Cerrahisi': 'Agiz, Dis ve Cene Cerrahisi',
  'Agiz, Dis ve Cene Radyolojisi': 'Agiz, Dis ve Cene Radyolojisi',
  'Cocuk Dis Hekimligi (Pedodonti)': 'Cocuk Dis Hekimligi (Pedodonti)',
  'Protetik Dis Tedavisi': 'Protetik Dis Tedavisi',
  'Restoratif Dis Tedavisi': 'Restoratif Dis Tedavisi',
  Anatomi: 'Anatomi',
  Fizyoloji: 'Fizyoloji',
  Ortodonti: 'Ortodonti',
  Endodonti: 'Endodonti',
  Periodontoloji: 'Periodontoloji',
  'Histoloji ve Embriyoloji': 'Histoloji ve Embriyoloji',
};

function toAscii(value: string) {
  return value
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i');
}

function normalizeCategory(rawCategory: string) {
  const ascii = toAscii(rawCategory.trim());
  if (categoryAliases[ascii]) {
    return categoryAliases[ascii];
  }
  return ascii;
}

function normalizeDifficulty(level: string): QuestionDifficulty {
  const ascii = toAscii(level).toLowerCase();
  if (ascii.includes('kolay')) {
    return 'Kolay';
  }
  if (ascii.includes('zor')) {
    return 'Zor';
  }
  return 'Orta';
}

function getTestType(category: string): TestType {
  return ruleTypeByCategory.get(category) ?? 'klinik';
}

const bank: Question[] = dataset.sorular.map((question) => {
  const category = normalizeCategory(question.konu);
  return {
    id: String(question.id),
    category,
    testType: getTestType(category),
    difficulty: normalizeDifficulty(question.zorluk),
    question_text_tr: question.soru,
    question_text_en: undefined,
    options_tr: question.secenekler,
    options_en: undefined,
    correct_answer: question.dogru_cevap,
    explanation_tr: question.aciklama,
    explanation_en: undefined,
    source: 'json',
  };
});

export const QUESTION_BANK = bank;

export function getLocalizedQuestionText(question: Question, language: AppLanguage) {
  if (language === 'en' && question.question_text_en) {
    return question.question_text_en;
  }
  return question.question_text_tr;
}

export function getLocalizedExplanation(question: Question, language: AppLanguage) {
  if (language === 'en' && question.explanation_en) {
    return question.explanation_en;
  }
  return question.explanation_tr;
}

export function getLocalizedOptions(question: Question, language: AppLanguage): LocalizedOptions {
  if (language === 'en' && question.options_en) {
    return question.options_en;
  }
  return question.options_tr;
}

export function getUniqueCategories() {
  return [...new Set(QUESTION_BANK.map((item) => item.category))];
}
