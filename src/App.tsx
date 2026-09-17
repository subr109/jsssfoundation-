import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SupportChatModal } from './components/common/SupportChatModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LandingPage } from './components/landing/LandingPage';
import { StudentPortal } from './components/student/StudentPortal';
import { PartnerPortal } from './components/partner/PartnerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { CoursesCatalog } from './components/common/CoursesCatalog';
import { PublicVerifyCertificate } from './components/common/PublicVerifyCertificate';
import { LegalDocumentsView } from './components/common/LegalDocumentsView';

const MainView: React.FC = () => {
  const { currentView } = useApp();

  return (
    <main className="flex-1">
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'student-portal' && <StudentPortal />}
      {currentView === 'partner-portal' && <PartnerPortal />}
      {currentView === 'admin-portal' && <AdminPortal />}
      {currentView === 'courses-catalog' && <CoursesCatalog />}
      {currentView === 'verify-certificate' && <PublicVerifyCertificate />}
      {currentView === 'legal-documents' && <LegalDocumentsView />}
    </main>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
          <Header />
          <MainView />
          <Footer />
          <SupportChatModal />
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
