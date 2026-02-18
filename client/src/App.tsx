import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import UploadPage from './components/UploadPage';
import DownloadPage from './components/DownloadPage';
import NotFoundPage from './components/NotFoundPage';
import { ThemeProvider } from './components/ui/ThemeProvider';
import { ThemeToggle } from './components/ui/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 selection:bg-primary/10">
          <div className="w-full max-w-4xl relative">
            <nav className="absolute top-0 right-0 p-4 z-50">
              <ThemeToggle />
            </nav>

            <Routes>
              <Route path="/" element={<UploadPage />} />
              <Route path="/d/:code" element={<DownloadPage />} />
              <Route path="/d" element={<DownloadPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
