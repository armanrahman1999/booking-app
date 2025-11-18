import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui-kit/sidebar';
import { LoadingOverlay } from '@/components/core';

import { MainLayout } from '@/layout/main-layout/main-layout';
import { Toaster } from '@/components/ui-kit/toaster';
import { ClientMiddleware } from '@/state/client-middleware';
import { ThemeProvider } from '@/styles/theme/theme-provider';
import './i18n/i18n';
import { AuthRoutes } from './routes/auth.route';
import { useLanguageContext, LanguageProvider } from './i18n/language-context';
import { DeskBookingPage } from './modules/desk-booking/pages/desk-booking';

const queryClient = new QueryClient();

function AppContent() {
  const { isLoading } = useLanguageContext();

  if (isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen bg-background font-sans antialiased relative">
      <ClientMiddleware>
        <ThemeProvider>
          <SidebarProvider>
            <Routes>
              {AuthRoutes}
              <Route element={<MainLayout />}>
                <Route path="/desk-booking" element={<DeskBookingPage />} />
              </Route>

              <Route path="/" element={<Navigate to="/desk-booking" />} />
              <Route path="*" element={<Navigate to="/404" />} />
            </Routes>
          </SidebarProvider>
        </ThemeProvider>
      </ClientMiddleware>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider defaultLanguage="en-US" defaultModules={['common', 'auth']}>
          <AppContent />
        </LanguageProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
