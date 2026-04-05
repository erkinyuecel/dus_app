import { CheckCircle, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStudyData } from '../../hooks/useStudyData';
import { getCategoryDisplayName } from '../../data/dusConfig';

interface StudyPathwayProps {
  onStartCategory: (category: string) => void;
}

export default function StudyPathway({ onStartCategory }: StudyPathwayProps) {
  const { t } = useTranslation();
  const { categoryProgress, loading } = useStudyData();

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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('nav.pathway')}</h1>
        <p className="text-gray-600">{t('pathway.subtitle')}</p>
      </div>

      <div className="space-y-4">
        {categoryProgress.map((category) => {
          const isCompleted = category.accuracy >= 70;
          const progressPercent = category.totalQuestions
            ? (category.answeredQuestions / category.totalQuestions) * 100
            : 0;

          return (
            <div key={category.category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-teal-600" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{getCategoryDisplayName(category.category)}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {t(`test.${category.testType}`)} - {category.answeredQuestions}/{category.totalQuestions}
                    </p>
                    <p className="text-sm text-gray-600">{t('pathway.accuracy')}: %{category.accuracy.toFixed(1)}</p>
                  </div>
                </div>

                <button
                  onClick={() => onStartCategory(category.category)}
                  className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700"
                >
                  {t('dashboard.start.topic')}
                </button>
              </div>

              <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full bg-teal-600" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
