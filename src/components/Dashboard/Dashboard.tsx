import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarClock,
  GraduationCap,
  Target,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStudyData } from '../../hooks/useStudyData';
import { useStudyStreak } from '../../hooks/useStudyStreak';
import { useAuth } from '../../contexts/useAuth';
import { EXAM_PERIODS } from '../../data/dusConfig';
import { PracticeMode } from '../../types';

interface DashboardProps {
  onStartPractice: (mode: PracticeMode) => void;
  onOpenCalendar: () => void;
  onOpenBaseScores: () => void;
}

function getCountdown(targetDate: string) {
  const diffMs = new Date(targetDate).getTime() - Date.now();
  const safe = Math.max(0, diffMs);

  return {
    days: Math.floor(safe / (1000 * 60 * 60 * 24)),
    hours: Math.floor((safe / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((safe / (1000 * 60)) % 60),
  };
}

export default function Dashboard({ onStartPractice, onOpenCalendar, onOpenBaseScores }: DashboardProps) {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { userAnswers, questions, categoryProgress, loading } = useStudyData();
  const { currentStreak } = useStudyStreak();
  const [, setNowTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const motivation = useMemo(() => {
    const pool = [t('dashboard.motivation.1'), t('dashboard.motivation.2'), t('dashboard.motivation.3')];
    return pool[Math.floor(Math.random() * pool.length)];
  }, [t]);

  const nearestExam = useMemo(() => {
    const upcoming = EXAM_PERIODS
      .map((period) => ({ period, time: new Date(period.examDate).getTime() }))
      .filter((item) => item.time > Date.now())
      .sort((a, b) => a.time - b.time);

    return upcoming[0]?.period ?? EXAM_PERIODS[EXAM_PERIODS.length - 1];
  }, []);

  const countdown = getCountdown(nearestExam.examDate);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const latestAnswers = new Map<string, boolean>();
  userAnswers.forEach((answer) => {
    if (!latestAnswers.has(answer.question_id)) {
      latestAnswers.set(answer.question_id, answer.is_correct);
    }
  });

  const totalAnswered = latestAnswers.size;
  const totalCorrect = [...latestAnswers.values()].filter(Boolean).length;
  const accuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

  const dailyGoal = 20;
  const todayAnswered = userAnswers.filter((answer) => {
    const date = new Date(answer.answered_at).toDateString();
    return date === new Date().toDateString();
  }).length;
  const dailyPercent = Math.min((todayAnswered / dailyGoal) * 100, 100);

  const mastered = categoryProgress.filter((item) => item.accuracy >= 70).length;
  const progressToTarget = profile?.target_base_score
    ? Math.min(100, (accuracy / profile.target_base_score) * 100)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          {t('dashboard.greeting')}, {profile?.full_name}
        </h1>
        <p className="text-gray-600 italic">{motivation}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <button
          onClick={onOpenCalendar}
          className="text-left bg-gradient-to-r from-teal-700 to-cyan-700 text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{t('dashboard.closestExam')}</h2>
            <CalendarClock className="w-5 h-5" />
          </div>
          <div className="text-sm opacity-90 mb-2">{nearestExam.label}</div>
          <div className="text-2xl font-bold">{countdown.days}{t('common.daysShort')} {countdown.hours}{t('common.hoursShort')} {countdown.minutes}{t('common.minutesShort')}</div>
        </button>

        <button
          onClick={onOpenBaseScores}
          className="text-left bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">{t('baseScores.title')}</h2>
            <GraduationCap className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2">{profile?.target_department ?? '-'}</p>
          <p className="text-sm text-gray-500">
            {profile?.target_base_score
              ? `${t('profile.targetScore')}: ${profile.target_base_score}`
              : t('dashboard.targetScoreMissing')}
          </p>
        </button>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-gray-900">{t('dashboard.dailyGoalTitle')}</h2>
            <Target className="w-5 h-5 text-teal-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2">{t('dashboard.dailyGoalText')}</p>
          <p className="text-sm font-medium text-gray-800 mb-2">{todayAnswered}/{dailyGoal}</p>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full bg-teal-600" style={{ width: `${dailyPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-teal-700">{currentStreak}</div>
          <div className="text-sm text-gray-600">{t('dashboard.statStreak')}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-teal-700">{totalAnswered}/{questions.length}</div>
          <div className="text-sm text-gray-600">{t('dashboard.statQuestions')}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-teal-700">{accuracy.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">{t('dashboard.statAccuracy')}</div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="text-2xl font-bold text-teal-700">{mastered}</div>
          <div className="text-sm text-gray-600">{t('dashboard.statMastered')}</div>
        </div>
      </div>

      {progressToTarget !== null && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{t('analytics.target')}</h3>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-2">
            <div className="h-full bg-teal-600" style={{ width: `${progressToTarget}%` }} />
          </div>
          <p className="text-sm text-gray-600">%{progressToTarget.toFixed(1)}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button onClick={() => onStartPractice('konu')} className="bg-white border border-gray-100 rounded-xl p-5 text-left shadow-sm hover:border-teal-400">
          <BookOpen className="w-6 h-6 text-teal-600 mb-2" />
          <h3 className="font-semibold text-gray-900">{t('dashboard.start.topic')}</h3>
        </button>
        <button onClick={() => onStartPractice('simulasyon')} className="bg-white border border-gray-100 rounded-xl p-5 text-left shadow-sm hover:border-teal-400">
          <Target className="w-6 h-6 text-teal-600 mb-2" />
          <h3 className="font-semibold text-gray-900">{t('dashboard.start.simulation')}</h3>
        </button>
        <button onClick={() => onStartPractice('zayif-konu')} className="bg-white border border-gray-100 rounded-xl p-5 text-left shadow-sm hover:border-teal-400">
          <TrendingUp className="w-6 h-6 text-teal-600 mb-2" />
          <h3 className="font-semibold text-gray-900">{t('dashboard.start.weak')}</h3>
        </button>
        <button onClick={() => onStartPractice('temel-bilimler')} className="bg-white border border-gray-100 rounded-xl p-5 text-left shadow-sm hover:border-teal-400">
          <BookOpen className="w-6 h-6 text-teal-600 mb-2" />
          <h3 className="font-semibold text-gray-900">{t('dashboard.start.basic')}</h3>
        </button>
        <button onClick={() => onStartPractice('klinik-bilimler')} className="bg-white border border-gray-100 rounded-xl p-5 text-left shadow-sm hover:border-teal-400">
          <BookOpen className="w-6 h-6 text-teal-600 mb-2" />
          <h3 className="font-semibold text-gray-900">{t('dashboard.start.clinical')}</h3>
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm flex items-start space-x-2">
        <AlertTriangle className="w-4 h-4 mt-0.5" />
        <div>
          {t('profile.rule2')}
        </div>
      </div>
    </div>
  );
}
