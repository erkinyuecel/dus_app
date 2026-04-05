import { Home, BookOpen, BarChart3, User, LogOut, Stethoscope, CalendarDays, GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { useTranslation } from 'react-i18next';

interface NavigationProps {
  currentView: 'dashboard' | 'pathway' | 'analytics' | 'calendar' | 'base-scores' | 'profile';
  onNavigate: (view: 'dashboard' | 'pathway' | 'analytics' | 'calendar' | 'base-scores' | 'profile') => void;
}

export default function Navigation({ currentView, onNavigate }: NavigationProps) {
  const { signOut } = useAuth();
  const { t, i18n } = useTranslation();

  const navItems: Array<{
    id: NavigationProps['currentView'];
    label: string;
    icon: typeof Home;
  }> = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: Home },
    { id: 'pathway', label: t('nav.pathway'), icon: BookOpen },
    { id: 'analytics', label: t('nav.analytics'), icon: BarChart3 },
    { id: 'calendar', label: t('nav.calendar'), icon: CalendarDays },
    { id: 'base-scores', label: t('nav.baseScores'), icon: GraduationCap },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-teal-600 rounded-lg p-2">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{t('appName')}</span>
          </div>

          <div className="hidden md:flex items-center space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentView === item.id
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={i18n.language.startsWith('tr') ? 'tr' : 'en'}
              onChange={(event) => {
                void i18n.changeLanguage(event.target.value);
              }}
              className="hidden md:block px-2 py-1 rounded-lg border border-gray-300 text-sm"
            >
              <option value="tr">{t('lang.tr')}</option>
              <option value="en">{t('lang.en')}</option>
            </select>

          <button
            onClick={() => signOut()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">{t('nav.signOut')}</span>
          </button>
          </div>
        </div>

        <div className="md:hidden">
          <div className="flex items-center justify-between pb-2 px-2">
            <select
              value={i18n.language.startsWith('tr') ? 'tr' : 'en'}
              onChange={(event) => {
                void i18n.changeLanguage(event.target.value);
              }}
              className="px-2 py-1 rounded-lg border border-gray-300 text-xs"
            >
              <option value="tr">{t('lang.tr')}</option>
              <option value="en">{t('lang.en')}</option>
            </select>
          </div>

          <div className="flex items-center justify-around pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'text-teal-600'
                    : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
          </div>
        </div>
      </div>
    </nav>
  );
}
