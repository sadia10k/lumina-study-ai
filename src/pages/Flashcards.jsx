import React, { useState, useEffect } from 'react';
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

const Flashcards = () => {
  const [vocabData, setVocabData] = useState(null);

  useEffect(() => {
    const cachedCards = localStorage.getItem('lumina_flashcards');
    if (cachedCards) {
      setVocabData(JSON.parse(cachedCards));
    } else {
      // Legacy support for older generations
      const legacyNotes = localStorage.getItem('lumina_structured_notes');
      if (legacyNotes) {
        const parsed = JSON.parse(legacyNotes);
        if (parsed.vocabulary) setVocabData(parsed.vocabulary);
      }
    }
  }, []);

  return (
    <div className="page-container fade-in dashboard-layout">
      <div className="page-header">
        <h1>Flashcards</h1>
      </div>

      {!vocabData ? (
        <div className="glass-panel empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any generated flashcards yet. Go to the Generator Hub to parse a document!</p>
        </div>
      ) : (
        <section>
          <div className="flashcard-grid">
            {vocabData.map((vocab, index) => (
              <Flashcard key={index} term={vocab.term} definition={vocab.definition} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Flashcards;
