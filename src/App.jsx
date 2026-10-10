import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BlockchainProvider } from './context/BlockchainContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WalletModal } from './components/WalletModal';
import { PurchaseModal } from './components/PurchaseModal';
import { TransferModal } from './components/TransferModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { Toast } from './components/Toast';

import { HomePage } from './pages/HomePage';
import { ExploreEventsPage } from './pages/ExploreEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { VerifyTicketPage } from './pages/VerifyTicketPage';
import { OrganizerPage } from './pages/OrganizerPage';
import { ActivityPage } from './pages/ActivityPage';
import { AboutPage } from './pages/AboutPage';

// Scroll to top helper on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <BlockchainProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-background text-slate-100 selection:bg-brand-blue selection:text-white">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<ExploreEventsPage />} />
              <Route path="/events/:id" element={<EventDetailsPage />} />
              <Route path="/my-tickets" element={<MyTicketsPage />} />
              <Route path="/verify" element={<VerifyTicketPage />} />
              <Route path="/organizer" element={<OrganizerPage />} />
              <Route path="/activity" element={<ActivityPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>

          <Footer />

          {/* Global Interactive Modals */}
          <WalletModal />
          <PurchaseModal />
          <TransferModal />
          <TicketDetailModal />
          <Toast />
        </div>
      </BrowserRouter>
    </BlockchainProvider>
  );
}
