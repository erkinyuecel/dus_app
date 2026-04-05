import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Save, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/useAuth';
import { BASE_SCORES_2025_2 } from '../../data/dusConfig';

export default function Profile() {
  const { t, i18n } = useTranslation();
  const { profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [language, setLanguage] = useState<'tr' | 'en'>('en');
  const [targetDepartment, setTargetDepartment] = useState('');
  const [targetBaseScore, setTargetBaseScore] = useState('');

  const departments = useMemo(
    () => [...new Set(BASE_SCORES_2025_2.map((row) => row.department))].sort((a, b) => a.localeCompare(b)),
    []
  );

  useEffect(() => {
    if (!profile) return;

    setFullName(profile.full_name ?? '');
    setExamDate(profile.exam_date ?? '');
    setLanguage((profile.language as 'tr' | 'en') ?? 'en');
    setTargetDepartment(profile.target_department ?? '');
    setTargetBaseScore(
      profile.target_base_score === null || profile.target_base_score === undefined
        ? ''
        : String(profile.target_base_score)
    );
  }, [profile]);

  const daysUntilExam = useMemo(() => {
    if (!examDate) return null;

    const diffMs = new Date(examDate).getTime() - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [examDate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        exam_date: examDate || null,
        language,
        target_department: targetDepartment || null,
        target_base_score: targetBaseScore ? Number(targetBaseScore) : null,
      });
      await i18n.changeLanguage(language);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('profile.title')}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-teal-100 rounded-full p-3">
            <User className="w-6 h-6 text-teal-700" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{fullName || profile?.full_name}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm text-gray-700">
            <div className="mb-1 font-medium">{t('auth.fullName')}</div>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="text-sm text-gray-700">
            <div className="mb-1 font-medium">{t('profile.examDate')}</div>
            <input
              type="date"
              value={examDate}
              onChange={(event) => setExamDate(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>

          <label className="text-sm text-gray-700">
            <div className="mb-1 font-medium">{t('profile.language')}</div>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'tr' | 'en')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="en">{t('lang.en')}</option>
              <option value="tr">{t('lang.tr')}</option>
            </select>
          </label>

          <label className="text-sm text-gray-700">
            <div className="mb-1 font-medium">{t('profile.targetDepartment')}</div>
            <select
              value={targetDepartment}
              onChange={(event) => setTargetDepartment(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">-</option>
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
          </label>

          <label className="text-sm text-gray-700">
            <div className="mb-1 font-medium">{t('profile.targetScore')}</div>
            <input
              type="number"
              step="0.1"
              value={targetBaseScore}
              onChange={(event) => setTargetBaseScore(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </label>
        </div>

        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? t('common.loading') : t('common.save')}
        </button>
      </div>

      {daysUntilExam !== null && (
        <div className="bg-gradient-to-r from-teal-600 to-cyan-700 rounded-xl p-6 text-white">
          <p className="text-sm opacity-90 mb-1">{t('profile.examDate')}</p>
          <p className="text-4xl font-bold">{daysUntilExam}</p>
          <p className="text-sm opacity-90">{t('common.days')}</p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2 text-amber-900">
          <AlertTriangle className="w-4 h-4" />
          <h3 className="font-semibold">{t('profile.scoreRules')}</h3>
        </div>
        <ul className="space-y-1 text-sm text-amber-900">
          <li>{t('profile.rule1')}</li>
          <li>{t('profile.rule2')}</li>
          <li>{t('profile.rule3')}</li>
        </ul>
      </div>
    </div>
  );
}
