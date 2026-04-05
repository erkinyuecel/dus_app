import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Check, Clock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PracticeMode, Question } from '../../types';
import { useStudyData } from '../../hooks/useStudyData';
import {
  getLocalizedExplanation,
  getLocalizedOptions,
  getLocalizedQuestionText,
} from '../../data/questionBank';
import { DUS_DURATION_MINUTES, getCategoryDisplayName } from '../../data/dusConfig';

interface QuestionPracticeProps {
  mode: PracticeMode;
  category?: string;
  onBack: () => void;
}

function isExamMode(mode: PracticeMode) {
  return mode === 'simulasyon';
}

export default function QuestionPractice({ mode, category, onBack }: QuestionPracticeProps) {
  const { t, i18n } = useTranslation();
  const {
    submitAnswer,
    getModeQuestions,
    getRawPointStatus,
    userAnswers,
    refreshData,
  } = useStudyData();

  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [examAnswers, setExamAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [examComplete, setExamComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DUS_DURATION_MINUTES * 60);
  const [examResults, setExamResults] = useState<{ correct: number; total: number } | null>(null);

  const handleExamSubmit = useCallback(async () => {
    let correct = 0;

    for (let i = 0; i < currentQuestions.length; i++) {
      const userAnswer = examAnswers[i];
      if (!userAnswer) {
        continue;
      }

      const isCorrect = userAnswer === currentQuestions[i].correct_answer;
      if (isCorrect) {
        correct++;
      }
      await submitAnswer(currentQuestions[i].id, userAnswer, isCorrect);
    }

    setExamResults({
      correct,
      total: currentQuestions.length,
    });
    setExamComplete(true);
    void refreshData();
  }, [currentQuestions, examAnswers, submitAnswer, refreshData]);

  useEffect(() => {
    setCurrentQuestions(getModeQuestions(mode, category));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setExamAnswers({});
    setExamComplete(false);
    setExamResults(null);
    setTimeLeft(DUS_DURATION_MINUTES * 60);
  }, [mode, category, getModeQuestions]);

  useEffect(() => {
    if (!isExamMode(mode) || examComplete) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          void handleExamSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, examComplete, handleExamSubmit]);

  const currentQuestion = currentQuestions[currentIndex];

  const localizedOptions = useMemo(() => {
    if (!currentQuestion) {
      return null;
    }

    return getLocalizedOptions(currentQuestion, i18n.language.startsWith('tr') ? 'tr' : 'en');
  }, [currentQuestion, i18n.language]);

  const questionText = currentQuestion
    ? getLocalizedQuestionText(currentQuestion, i18n.language.startsWith('tr') ? 'tr' : 'en')
    : '';

  const questionExplanation = currentQuestion
    ? getLocalizedExplanation(currentQuestion, i18n.language.startsWith('tr') ? 'tr' : 'en')
    : '';

  const handleAnswerSelect = async (answer: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return;

    if (isExamMode(mode)) {
      setExamAnswers((prev) => ({ ...prev, [currentIndex]: answer }));
      return;
    }

    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correct_answer;
    await submitAnswer(currentQuestion.id, answer, isCorrect);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < currentQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      return;
    }

    void refreshData();
    onBack();
  };

  if (!currentQuestions.length) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={onBack} className="flex items-center gap-2 text-teal-600 mb-4">
          <ArrowLeft className="w-4 h-4" />
          {t('practice.back')}
        </button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <p className="text-gray-700">{t('practice.noQuestions')}</p>
        </div>
      </div>
    );
  }

  if (examComplete && examResults) {
    const percentage = (examResults.correct / examResults.total) * 100;
    const rawStatus = getRawPointStatus(userAnswers);

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('practice.examComplete')}</h2>
          <p className="text-xl text-gray-700 mb-2">
            {examResults.correct} / {examResults.total}
          </p>
          <div className="text-5xl font-bold text-teal-600 mb-6">{percentage.toFixed(1)}%</div>

          {!rawStatus.thresholdMet && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-left text-sm text-red-800 mb-6">
              {t('profile.rule3')}
            </div>
          )}

          <button
            onClick={onBack}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            {t('practice.back')}
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedExamAnswer = examAnswers[currentIndex] ?? null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-teal-600">
          <ArrowLeft className="w-4 h-4" />
          {t('practice.back')}
        </button>

        {isExamMode(mode) && (
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className={`font-semibold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-teal-700 bg-teal-50 px-3 py-1 rounded-full">
              {getCategoryDisplayName(currentQuestion.category)}
            </span>
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {t(`difficulty.${currentQuestion.difficulty}`)}
            </span>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            {t('practice.question')} {currentIndex + 1} {t('practice.of')} {currentQuestions.length}
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-600 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / currentQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">{questionText}</h2>

        {localizedOptions && (
          <div className="space-y-3 mb-8">
            {(['A', 'B', 'C', 'D'] as const).map((key) => {
              const optionText = localizedOptions[key];
              const selected = isExamMode(mode) ? selectedExamAnswer === key : selectedAnswer === key;
              const isCorrect = key === currentQuestion.correct_answer;
              const showCorrect = showExplanation && isCorrect;
              const showIncorrect = showExplanation && selected && !isCorrect;

              return (
                <button
                  key={key}
                  onClick={() => void handleAnswerSelect(key)}
                  disabled={showExplanation}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50'
                      : selected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-semibold bg-gray-200 text-gray-700">
                        {key}
                      </div>
                      <span className="text-gray-900">{optionText}</span>
                    </div>
                    {showCorrect && <Check className="w-5 h-5 text-green-600" />}
                    {showIncorrect && <X className="w-5 h-5 text-red-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {showExplanation && (
          <div className="rounded-xl p-6 mb-6 bg-gray-50 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">
              {selectedAnswer === currentQuestion.correct_answer ? t('practice.correct') : t('practice.incorrect')}
            </h3>
            <p className="text-gray-700 leading-relaxed">{questionExplanation}</p>
          </div>
        )}

        {isExamMode(mode) ? (
          <div className="flex gap-3">
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {t('practice.back')}
              </button>
            )}
            {currentIndex === currentQuestions.length - 1 ? (
              <button
                onClick={() => void handleExamSubmit()}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                {t('practice.submit')}
              </button>
            ) : (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                {t('practice.next')}
              </button>
            )}
          </div>
        ) : showExplanation ? (
          <button
            onClick={handleNext}
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            {t('practice.next')}
          </button>
        ) : null}
      </div>
    </div>
  );
}
