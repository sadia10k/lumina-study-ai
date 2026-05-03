import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DocumentExtraction from './pages/DocumentExtraction';
import StudyNotes from './pages/StudyNotes';
import Flashcards from './pages/Flashcards';
import ActiveRecall from './pages/ActiveRecall';
import ContextualChat from './components/ContextualChat';

import { initLogger } from './lib/logger';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DocumentExtraction />} />
            <Route path="/notes" element={<StudyNotes />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/quiz" element={<ActiveRecall />} />
          </Routes>
        </main>
        
        {/* Persistent Contextual Chat floating on the right side */}
        <ContextualChat />
        

      </div>
    </Router>
  );
}

export default App;
