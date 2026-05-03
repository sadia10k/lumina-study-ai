import React, { useState, useEffect } from 'react';
import { generateStudyNotes } from '../lib/gemini';
import './StudyDashboard.css';

const Flashcard = ({ term, definition }) => {
  const [flipped, setFlipped] = useState(false);
  
  return (
    <div className={`flashcard-container ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
      <div className="flashcard-inner">
        <div className="flashcard-front">
          {term}
        </div>
        <div className="flashcard-back">
          {definition}
        </div>
      </div>
    </div>
  );
};

const StudyDashboard = () => {
  const [notesData, setNotesData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load cached notes if they already exist so we don't spam api
    const cachedNotes = localStorage.getItem('lumina_structured_notes');
    if (cachedNotes) {
      setNotesData(JSON.parse(cachedNotes));
    }
  }, []);

  const handleGenerate = async () => {
    const rawText = localStorage.getItem('lumina_raw_text');
    if (!rawText) {
      setError("No document text found. Please upload a document first in the extraction tab.");
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const data = await generateStudyNotes(rawText);
      setNotesData(data);
      localStorage.setItem('lumina_structured_notes', JSON.stringify(data));
    } catch (err) {
      console.error(err);
      setError("Failed to generate notes: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-container fade-in dashboard-layout">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Study Dashboard</h1>
        <button className="glow-btn" onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Synthesizing...' : 'Generate New Study Set'}
        </button>
      </div>

      {error && <div className="glass-panel" style={{ padding: '1rem', color: '#ff7675' }}>{error}</div>}

      {!notesData && !isGenerating && !error && (
        <div className="glass-panel empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any generated study sets yet. Click generate above to extract structure from your uploaded documents!</p>
        </div>
      )}

      {notesData && (
        <>
          <section className="glass-panel" style={{ padding: '2rem' }}>
            <h2>{notesData.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{notesData.summary}</p>
          </section>

          <section>
            <h2 style={{ marginBottom: '1rem' }}>Vocabulary Flashcards</h2>
            <div className="flashcard-grid">
              {notesData.vocabulary && notesData.vocabulary.map((vocab, index) => (
                <Flashcard key={index} term={vocab.term} definition={vocab.definition} />
              ))}
            </div>
          </section>

          <section className="topics-section" style={{ marginTop: '2rem' }}>
            <h2>Core Topics</h2>
            {notesData.topics && notesData.topics.map((topic, index) => (
              <div key={index} className="glass-panel" style={{ padding: '1.5rem', marginTop: '1rem' }}>
                <h3 style={{ color: 'var(--accent)' }}>{topic.title}</h3>
                {topic.takeaway && <p style={{ fontStyle: 'italic', margin: '0.5rem 0' }}>💡 {topic.takeaway}</p>}
                
                <div style={{ marginTop: '1rem' }}>
                  {topic.details.map((detail, dIdx) => (
                    <div key={dIdx} style={{ marginBottom: '1rem' }}>
                      <strong>{detail.name}</strong>
                      <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                        {detail.description?.map((pt, ptIdx) => (
                          <li key={ptIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
};

export default StudyDashboard;
