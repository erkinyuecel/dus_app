export interface UserProfile {
  id: string;
  full_name: string;
  exam_date: string | null;
  language?: AppLanguage;
  target_department?: string | null;
  target_base_score?: number | null;
  created_at: string;
  updated_at: string;
}

export type AppLanguage = 'tr' | 'en';
export type AnswerOption = 'A' | 'B' | 'C' | 'D';
export type QuestionDifficulty = 'Kolay' | 'Orta' | 'Zor';
export type TestType = 'temel' | 'klinik';

export interface LocalizedOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface Question {
  id: string;
  category: string;
  testType: TestType;
  difficulty: QuestionDifficulty;
  question_text_tr: string;
  question_text_en?: string;
  options_tr: LocalizedOptions;
  options_en?: LocalizedOptions;
  correct_answer: AnswerOption;
  explanation_tr: string;
  explanation_en?: string;
  source?: string;
}

export interface UserAnswer {
  id: string;
  user_id: string;
  question_id: string;
  selected_answer: AnswerOption;
  is_correct: boolean;
  answered_at: string;
}

export interface StudyStreak {
  id: string;
  user_id: string;
  study_date: string;
  questions_answered: number;
  created_at: string;
}

export interface CategoryProgress {
  category: string;
  testType: TestType;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export type PracticeMode = 'konu' | 'simulasyon' | 'zayif-konu' | 'temel-bilimler' | 'klinik-bilimler';

export interface DUSExamRule {
  category: string;
  count: number;
  testType: TestType;
}

export interface ExamPeriod {
  id: string;
  label: string;
  examDate: string;
  resultDate: string;
  applicationDates?: string;
}

export interface BaseScoreRow {
  university: string;
  department: string;
  score: number;
}
