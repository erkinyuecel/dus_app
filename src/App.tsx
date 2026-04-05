import { useEffect, useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/useAuth';
import { useTranslation } from 'react-i18next';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Navigation from './components/Layout/Navigation';
import Dashboard from './components/Dashboard/Dashboard';
import StudyPathway from './components/Pathway/StudyPathway';
import QuestionPractice from './components/Practice/QuestionPractice';
import Analytics from './components/Analytics/Analytics';
import Profile from './components/Profile/Profile';
import ExamCalendar from './components/ExamCalendar/ExamCalendar';
import BaseScores from './components/BaseScores/BaseScores';
import { PracticeMode } from './types';

type AppView =
  | 'dashboard'
  | 'pathway'
  | 'analytics'
  | 'calendar'
  | 'base-scores'
  | 'profile';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const { i18n } = useTranslation();
  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [practiceMode, setPracticeMode] = useState<PracticeMode | null>(null);
  const [practiceCategory, setPracticeCategory] = useState<string | undefined>();

  useEffect(() => {
    if (!profile?.language) return;
    if (i18n.language.startsWith(profile.language)) return;
    void i18n.changeLanguage(profile.language);
  }, [profile?.language, i18n]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggleMode={() => setShowLogin(false)} />
    ) : (
      <Signup onToggleMode={() => setShowLogin(true)} />
    );
  }

  const handleStartPractice = (mode: PracticeMode, category?: string) => {
    setPracticeMode(mode);
    setPracticeCategory(category);
  };

  const handleBackFromPractice = () => {
    setPracticeMode(null);
    setPracticeCategory(undefined);
  };

  if (practiceMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <QuestionPractice
          mode={practiceMode}
          category={practiceCategory}
          onBack={handleBackFromPractice}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onNavigate={setCurrentView} />
      <div>
        {currentView === 'dashboard' && (
          <Dashboard
            onOpenCalendar={() => setCurrentView('calendar')}
            onOpenBaseScores={() => setCurrentView('base-scores')}
            onStartPractice={(mode) => handleStartPractice(mode)}
          />
        )}
        {currentView === 'pathway' && (
          <StudyPathway onStartCategory={(cat) => handleStartPractice('konu', cat)} />
        )}
        {currentView === 'analytics' && <Analytics />}
        {currentView === 'calendar' && <ExamCalendar />}
        {currentView === 'base-scores' && <BaseScores />}
        {currentView === 'profile' && <Profile />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
