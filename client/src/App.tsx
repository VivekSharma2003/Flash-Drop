import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadPage from './components/UploadPage';
import DownloadPage from './components/DownloadPage';
import NotFoundPage from './components/NotFoundPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white flex items-center justify-center p-4 selection:bg-black/10">

        <div className="w-full max-w-4xl relative">
          <nav className="absolute top-0 right-0 p-4">
            {/* Optional Nav items */}
          </nav>

          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/d/:code" element={<DownloadPage />} />
            <Route path="/d" element={<DownloadPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>


      </div>
    </Router>
  );
}

export default App;
