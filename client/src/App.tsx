import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ConnectivityBanner } from './components/common/ConnectivityBanner';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateRoomPage } from './pages/CreateRoomPage';
import { LiveRoomPage } from './pages/LiveRoomPage';
import { ReportPage } from './pages/ReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SpeechClarityLabPage } from './pages/SpeechClarityLabPage';
import { ImprovementPlanPage } from './pages/ImprovementPlanPage';
import { CompareSessionsPage } from './pages/CompareSessionsPage';

type ViewTab = 
  | 'landing' 
  | 'auth' 
  | 'dashboard' 
  | 'create' 
  | 'room' 
  | 'report' 
  | 'history' 
  | 'analytics'
  | 'speech-lab'
  | 'drills'
  | 'compare';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<ViewTab>(user ? 'dashboard' : 'landing');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [initialCreateTopic, setInitialCreateTopic] = useState<string>('');

  // Auto-route on login status change
  React.useEffect(() => {
    if (user && (currentTab === 'landing' || currentTab === 'auth')) {
      setCurrentTab('dashboard');
    }
  }, [user]);

  const handleStartPracticeFromLanding = () => {
    if (user) {
      setCurrentTab('create');
    } else {
      setCurrentTab('auth');
    }
  };

  const handleStartNewDiscussionFromDashboard = (topic?: string) => {
    setInitialCreateTopic(topic || '');
    setCurrentTab('create');
  };

  const handleRoomCreated = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentTab('room');
  };

  const handleFinishRoom = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentTab('report');
  };

  const handleViewReport = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentTab('report');
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-900 text-slate-100">
      
      {/* Navigation (Show Navbar on all views; keep streamlined in Room view) */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => setCurrentTab(tab as ViewTab)}
      />

      {/* Backend Connectivity Status Alert */}
      <ConnectivityBanner />

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'landing' && (
          <LandingPage
            onStart={handleStartPracticeFromLanding}
            onLogin={() => setCurrentTab('auth')}
          />
        )}

        {currentTab === 'auth' && (
          <AuthPage
            onSuccess={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            onStartNew={handleStartNewDiscussionFromDashboard}
            onViewHistory={() => setCurrentTab('history')}
            onViewReport={handleViewReport}
            onNavigateTab={(tab) => setCurrentTab(tab as ViewTab)}
          />
        )}

        {currentTab === 'create' && (
          <CreateRoomPage
            initialTopic={initialCreateTopic}
            onRoomCreated={handleRoomCreated}
            onCancel={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'room' && activeSessionId && (
          <LiveRoomPage
            sessionId={activeSessionId}
            onFinishSession={handleFinishRoom}
            onExit={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'report' && activeSessionId && (
          <ReportPage
            sessionId={activeSessionId}
            onBackToDashboard={() => setCurrentTab('dashboard')}
            onStartNewDiscussion={() => setCurrentTab('create')}
          />
        )}

        {currentTab === 'speech-lab' && (
          <SpeechClarityLabPage />
        )}

        {currentTab === 'drills' && (
          <ImprovementPlanPage
            onStartDiscussion={handleStartNewDiscussionFromDashboard}
          />
        )}

        {currentTab === 'compare' && (
          <CompareSessionsPage
            onViewReport={handleViewReport}
            onStartNew={() => setCurrentTab('create')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryPage
            onViewReport={handleViewReport}
            onStartNew={() => setCurrentTab('create')}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsPage
            onStartNewDiscussion={() => setCurrentTab('create')}
          />
        )}
      </main>

      {/* Footer (Hidden during live room to preserve focused UI) */}
      {currentTab !== 'room' && <Footer />}

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
