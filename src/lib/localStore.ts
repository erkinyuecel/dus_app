import { StudyStreak, UserAnswer, UserProfile } from '../types';

const STORAGE_KEYS = {
  accounts: 'dus_local_accounts_v1',
  sessionUserId: 'dus_local_session_user_id_v1',
  profiles: 'dus_local_profiles_v1',
  answers: 'dus_local_answers_v1',
  streaks: 'dus_local_streaks_v1',
} as const;

export interface LocalAuthUser {
  id: string;
  email: string;
}

interface LocalAccount extends LocalAuthUser {
  password: string;
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getAccounts() {
  return readJSON<LocalAccount[]>(STORAGE_KEYS.accounts, []);
}

export function saveAccounts(accounts: LocalAccount[]) {
  writeJSON(STORAGE_KEYS.accounts, accounts);
}

export function createLocalAccount(email: string, password: string) {
  const accounts = getAccounts();
  const normalizedEmail = email.trim().toLowerCase();

  if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Bu e-posta ile zaten bir hesap var.');
  }

  const newAccount: LocalAccount = {
    id: generateId(),
    email: normalizedEmail,
    password,
  };

  saveAccounts([...accounts, newAccount]);
  return { id: newAccount.id, email: newAccount.email } satisfies LocalAuthUser;
}

export function signInLocalAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = getAccounts().find(
    (a) => a.email.toLowerCase() === normalizedEmail && a.password === password
  );

  if (!account) {
    throw new Error('E-posta veya şifre hatalı.');
  }

  return { id: account.id, email: account.email } satisfies LocalAuthUser;
}

export function getSessionUserId() {
  return localStorage.getItem(STORAGE_KEYS.sessionUserId);
}

export function setSessionUserId(userId: string | null) {
  if (!userId) {
    localStorage.removeItem(STORAGE_KEYS.sessionUserId);
    return;
  }
  localStorage.setItem(STORAGE_KEYS.sessionUserId, userId);
}

export function getProfiles() {
  return readJSON<UserProfile[]>(STORAGE_KEYS.profiles, []);
}

export function saveProfiles(profiles: UserProfile[]) {
  writeJSON(STORAGE_KEYS.profiles, profiles);
}

export function getProfileById(userId: string) {
  return getProfiles().find((p) => p.id === userId) ?? null;
}

export function upsertProfile(profile: UserProfile) {
  const profiles = getProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index === -1) {
    saveProfiles([...profiles, profile]);
    return;
  }

  const copy = [...profiles];
  copy[index] = profile;
  saveProfiles(copy);
}

export function getAllAnswers() {
  return readJSON<UserAnswer[]>(STORAGE_KEYS.answers, []);
}

export function saveAllAnswers(answers: UserAnswer[]) {
  writeJSON(STORAGE_KEYS.answers, answers);
}

export function getAnswersByUser(userId: string) {
  return getAllAnswers()
    .filter((a) => a.user_id === userId)
    .sort((a, b) => new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime());
}

export function appendAnswer(answer: UserAnswer) {
  saveAllAnswers([...getAllAnswers(), answer]);
}

export function getAllStreaks() {
  return readJSON<StudyStreak[]>(STORAGE_KEYS.streaks, []);
}

export function saveAllStreaks(streaks: StudyStreak[]) {
  writeJSON(STORAGE_KEYS.streaks, streaks);
}

export function getStreaksByUser(userId: string) {
  return getAllStreaks()
    .filter((s) => s.user_id === userId)
    .sort((a, b) => a.study_date.localeCompare(b.study_date));
}

export function incrementStreakForDate(userId: string, date: string) {
  const streaks = getAllStreaks();
  const index = streaks.findIndex((s) => s.user_id === userId && s.study_date === date);

  if (index === -1) {
    const created: StudyStreak = {
      id: generateId(),
      user_id: userId,
      study_date: date,
      questions_answered: 1,
      created_at: new Date().toISOString(),
    };
    saveAllStreaks([...streaks, created]);
    return;
  }

  const copy = [...streaks];
  copy[index] = {
    ...copy[index],
    questions_answered: copy[index].questions_answered + 1,
  };
  saveAllStreaks(copy);
}

export function createLocalUserProfile(user: LocalAuthUser, fullName: string): UserProfile {
  return {
    id: user.id,
    full_name: fullName,
    exam_date: null,
    language: 'en',
    target_department: null,
    target_base_score: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function createUserAnswer(params: {
  userId: string;
  questionId: string;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
}): UserAnswer {
  return {
    id: generateId(),
    user_id: params.userId,
    question_id: params.questionId,
    selected_answer: params.selectedAnswer,
    is_correct: params.isCorrect,
    answered_at: new Date().toISOString(),
  };
}
