import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EXAM_PERIODS } from '../../data/dusConfig';

function getCountdown(targetDate: string) {
  const diffMs = new Date(targetDate).getTime() - Date.now();
  const safe = Math.max(0, diffMs);

  const days = Math.floor(safe / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safe / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safe / (1000 * 60)) % 60);
  const seconds = Math.floor((safe / 1000) % 60);

  return { days, hours, minutes, seconds, completed: diffMs <= 0 };
}

export default function ExamCalendar() {
  const { t } = useTranslation();
  const [, setNowTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const now = Date.now();
  const upcoming = EXAM_PERIODS
    .map((period) => ({ period, time: new Date(period.examDate).getTime() }))
    .filter((item) => item.time > now)
    .sort((a, b) => a.time - b.time);
  const nearest = upcoming[0]?.period ?? EXAM_PERIODS[EXAM_PERIODS.length - 1];

  const countdown = getCountdown(nearest.examDate);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('calendar.title')}</h1>
        <p className="text-gray-600">{t('calendar.note')}</p>
      </div>

      <div className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-2xl text-white p-6 mb-8 shadow-lg">
        <div className="flex items-center space-x-2 mb-4">
          <CalendarClock className="w-6 h-6" />
          <h2 className="text-xl font-semibold">{t('calendar.countdown')} - {nearest.label}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{countdown.days}</div>
            <div className="text-sm">{t('common.days')}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{countdown.hours}</div>
            <div className="text-sm">{t('common.hours')}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{countdown.minutes}</div>
            <div className="text-sm">{t('common.minutes')}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{countdown.seconds}</div>
            <div className="text-sm">{t('common.seconds')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {EXAM_PERIODS.map((period) => (
          <div key={period.id} className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{period.label}</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-medium">{t('calendar.examDate')}:</span> {new Date(period.examDate).toLocaleDateString()}</p>
              {period.applicationDates ? (
                <p><span className="font-medium">{t('calendar.application')}:</span> {period.applicationDates}</p>
              ) : null}
              <p><span className="font-medium">{t('calendar.resultDate')}:</span> {new Date(period.resultDate).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
