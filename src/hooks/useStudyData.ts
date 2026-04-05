import { useCallback, useEffect, useState } from 'react';
import {
  CategoryProgress,
  PracticeMode,
  Question,
  TestType,
  UserAnswer,
} from '../types';
import { useAuth } from '../contexts/useAuth';
import { ALL_RULES, KLINIK_BILIMLER_RULES, TEMEL_BILIMLER_RULES } from '../data/dusConfig';
import { getUniqueCategories, QUESTION_BANK } from '../data/questionBank';
import {
  appendAnswer,
  createUserAnswer,
  getAnswersByUser,
  incrementStreakForDate,
} from '../lib/localStore';

type LatestAnswerMap = Map<string, UserAnswer>;

const RULE_ORDER = ALL_RULES.map((rule) => rule.category);

function shuffle<T>(values: T[]) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getLatestAnswerMap(answers: UserAnswer[]): LatestAnswerMap {
  const map: LatestAnswerMap = new Map();
  const sorted = [...answers].sort(
    (a, b) => new Date(b.answered_at).getTime() - new Date(a.answered_at).getTime()
  );

  sorted.forEach((answer) => {
    if (!map.has(answer.question_id)) {
      map.set(answer.question_id, answer);
    }
  });

  return map;
}

function pickByRules(allQuestions: Question[], rules: Array<{ category: string; count: number }>) {
  const picked: Question[] = [];
  const pickedIds = new Set<string>();

  rules.forEach((rule) => {
    const pool = shuffle(
      allQuestions.filter((question) => question.category === rule.category && !pickedIds.has(question.id))
    );
    pool.slice(0, rule.count).forEach((question) => {
      picked.push(question);
      pickedIds.add(question.id);
    });
  });

  const missing = rules.reduce((sum, rule) => sum + rule.count, 0) - picked.length;
  if (missing > 0) {
    const fallback = shuffle(allQuestions.filter((question) => !pickedIds.has(question.id))).slice(0, missing);
    fallback.forEach((question) => {
      picked.push(question);
      pickedIds.add(question.id);
    });
  }

  return shuffle(picked);
}

function getTestTypeForCategory(category: string): TestType {
  return ALL_RULES.find((rule) => rule.category === category)?.testType ?? 'klinik';
}

export function useStudyData() {
  const { user } = useAuth();
  const [questions] = useState<Question[]>(QUESTION_BANK);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [categoryProgress, setCategoryProgress] = useState<CategoryProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateCategoryProgress = useCallback((allQuestions: Question[], answers: UserAnswer[]) => {
    const latestAnswers = getLatestAnswerMap(answers);
    const sortedCategories = getUniqueCategories().sort((a, b) => {
      const ia = RULE_ORDER.indexOf(a);
      const ib = RULE_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

    const progress = sortedCategories.map((category) => {
      const categoryQuestions = allQuestions.filter((q) => q.category === category);
      const latestCategoryAnswers = categoryQuestions
        .map((question) => latestAnswers.get(question.id))
        .filter((answer): answer is UserAnswer => !!answer);

      const answeredQuestions = latestCategoryAnswers.length;
      const correctAnswers = latestCategoryAnswers.filter((a) => a.is_correct).length;
      const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;

      return {
        category,
        testType: getTestTypeForCategory(category),
        totalQuestions: categoryQuestions.length,
        answeredQuestions,
        correctAnswers,
        accuracy,
      };
    });

    setCategoryProgress(progress);
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const answers = getAnswersByUser(user.id);
      setUserAnswers(answers);
      calculateCategoryProgress(QUESTION_BANK, answers);
    } catch (error) {
      console.error('Error fetching study data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, calculateCategoryProgress]);

  useEffect(() => {
    if (user) {
      void fetchData();
      return;
    }

    setUserAnswers([]);
    calculateCategoryProgress(QUESTION_BANK, []);
    setLoading(false);
  }, [user, fetchData, calculateCategoryProgress]);

  const getModeQuestions = useCallback((mode: PracticeMode, category?: string) => {
    const latestAnswers = getLatestAnswerMap(userAnswers);
    const unanswered = questions.filter((question) => !latestAnswers.has(question.id));
    const weakQuestions = questions.filter((question) => !latestAnswers.get(question.id)?.is_correct);

    if (mode === 'konu') {
      if (category) {
        return shuffle(questions.filter((question) => question.category === category));
      }
      return unanswered.length > 0 ? shuffle(unanswered) : shuffle(questions);
    }

    if (mode === 'zayif-konu') {
      return weakQuestions.length > 0 ? shuffle(weakQuestions) : [];
    }

    if (mode === 'temel-bilimler') {
      return pickByRules(questions, TEMEL_BILIMLER_RULES);
    }

    if (mode === 'klinik-bilimler') {
      return pickByRules(questions, KLINIK_BILIMLER_RULES);
    }

    return pickByRules(questions, ALL_RULES);
  }, [questions, userAnswers]);

  const getWeakQuestions = useCallback(() => getModeQuestions('zayif-konu'), [getModeQuestions]);

  const getUnansweredQuestions = useCallback(() => {
    const latestAnswers = getLatestAnswerMap(userAnswers);
    return questions.filter((question) => !latestAnswers.has(question.id));
  }, [questions, userAnswers]);

  const getRawPointStatus = (answers: UserAnswer[]) => {
    const latest = getLatestAnswerMap(answers);
    let basicRaw = 0;
    let clinicalRaw = 0;

    questions.forEach((question) => {
      const answer = latest.get(question.id);
      if (!answer?.is_correct) {
        return;
      }

      if (question.testType === 'temel') {
        basicRaw += 1;
      } else {
        clinicalRaw += 1;
      }
    });

    return {
      basicRaw,
      clinicalRaw,
      thresholdMet: basicRaw >= 1 || clinicalRaw >= 1,
    };
  };

  const updateStreakForToday = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    incrementStreakForDate(user.id, today);
  };

  const submitAnswer = async (
    questionId: string,
    selectedAnswer: 'A' | 'B' | 'C' | 'D',
    isCorrect: boolean
  ) => {
    if (!user) return;

    appendAnswer(
      createUserAnswer({
        userId: user.id,
        questionId,
        selectedAnswer,
        isCorrect,
      })
    );

    await updateStreakForToday();
    await fetchData();
  };

  const refreshData = () => {
    void fetchData();
  };

  return {
    questions,
    userAnswers,
    categoryProgress,
    loading,
    submitAnswer,
    getWeakQuestions,
    getUnansweredQuestions,
    getModeQuestions,
    getRawPointStatus,
    refreshData,
  };
}
