import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useStudyData } from '../../hooks/useStudyData';
import { useAuth } from '../../contexts/useAuth';
import { getCategoryDisplayName } from '../../data/dusConfig';

export default function Analytics() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { categoryProgress, userAnswers, loading } = useStudyData();

  const categoryData = useMemo(
    () =>
      categoryProgress.map((cat) => ({
        name: getCategoryDisplayName(cat.category),
        accuracy: cat.accuracy,
      })),
    [categoryProgress]
  );

  const timelineData = useMemo(() => {
    const dailyStats: Record<string, { correct: number; total: number }> = {};

    userAnswers.forEach((answer) => {
      const date = new Date(answer.answered_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { correct: 0, total: 0 };
      }
      dailyStats[date].total += 1;
      if (answer.is_correct) {
        dailyStats[date].correct += 1;
      }
    });

    return Object.entries(dailyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, value]) => ({
        date: new Date(date).toLocaleDateString(),
        accuracy: value.total > 0 ? (value.correct / value.total) * 100 : 0,
      }));
  }, [userAnswers]);

  const strongTopics = categoryProgress
    .filter((cat) => cat.answeredQuestions > 0)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  const weakTopics = categoryProgress
    .filter((cat) => cat.answeredQuestions > 0)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 5);

  const overallAccuracy = useMemo(() => {
    const latest = new Map<string, boolean>();
    userAnswers.forEach((answer) => {
      if (!latest.has(answer.question_id)) {
        latest.set(answer.question_id, answer.is_correct);
      }
    });

    const total = latest.size;
    if (!total) return 0;
    const correct = [...latest.values()].filter(Boolean).length;
    return (correct / total) * 100;
  }, [userAnswers]);

  const proximity = profile?.target_base_score
    ? Math.min(100, (overallAccuracy / profile.target_base_score) * 100)
    : null;

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('analytics.title')}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('analytics.byLesson')}</h2>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" height={100} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, '']} />
            <Bar dataKey="accuracy" fill="#0D9488" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('analytics.timeline')}</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, '']} />
            <Line type="monotone" dataKey="accuracy" stroke="#0D9488" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('analytics.strong')}</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {strongTopics.map((item) => (
              <li key={item.category} className="flex justify-between">
                <span>{getCategoryDisplayName(item.category)}</span>
                <strong>%{item.accuracy.toFixed(1)}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('analytics.weak')}</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {weakTopics.map((item) => (
              <li key={item.category} className="flex justify-between">
                <span>{getCategoryDisplayName(item.category)}</span>
                <strong>%{item.accuracy.toFixed(1)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {proximity !== null && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-teal-900 mb-3">{t('analytics.target')}</h3>
          <div className="h-3 rounded-full bg-white overflow-hidden mb-2">
            <div className="h-full bg-teal-600" style={{ width: `${proximity}%` }} />
          </div>
          <p className="text-sm text-teal-900">%{proximity.toFixed(1)}</p>
        </div>
      )}
    </div>
  );
}
