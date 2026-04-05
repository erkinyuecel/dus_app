import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BASE_SCORES_2025_2 } from '../../data/dusConfig';

export default function BaseScores() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('ALL');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const departments = useMemo(
    () => [...new Set(BASE_SCORES_2025_2.map((row) => row.department))].sort((a, b) => a.localeCompare(b)),
    []
  );

  const rows = useMemo(() => {
    const filtered = filter === 'ALL'
      ? BASE_SCORES_2025_2
      : BASE_SCORES_2025_2.filter((row) => row.department === filter);

    return [...filtered].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.score - b.score;
      }
      return b.score - a.score;
    });
  }, [filter, sortDirection]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('baseScores.title')} (2025-2)</h1>
      </div>

      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="text-sm text-gray-700">
          <div className="mb-1 font-medium">{t('baseScores.filter')}</div>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="ALL">Tümü</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </label>

        <label className="text-sm text-gray-700">
          <div className="mb-1 font-medium">{t('baseScores.sort')}</div>
          <select
            value={sortDirection}
            onChange={(event) => setSortDirection(event.target.value as 'asc' | 'desc')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="desc">{t('baseScores.desc')}</option>
            <option value="asc">{t('baseScores.asc')}</option>
          </select>
        </label>
      </div>

      <div className="overflow-auto bg-white border border-gray-100 shadow-sm rounded-xl mb-4">
        <table className="min-w-full text-sm">
          <thead className="bg-teal-50 text-teal-900">
            <tr>
              <th className="text-left px-4 py-3">Üniversite</th>
              <th className="text-left px-4 py-3">Bölüm</th>
              <th className="text-right px-4 py-3">Taban Puan</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.university}-${row.department}`} className="border-t border-gray-100">
                <td className="px-4 py-3">{row.university}</td>
                <td className="px-4 py-3">{row.department}</td>
                <td className="px-4 py-3 text-right font-semibold">{row.score.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-2 text-sm text-teal-900">
        <p>{t('baseScores.note1')}</p>
        <p>{t('baseScores.note2')}</p>
        <p>{t('baseScores.note3')}</p>
      </div>
    </div>
  );
}
