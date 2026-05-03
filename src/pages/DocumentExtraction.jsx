import React, { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { generateStudyNotes, generateFlashcards, generateActiveRecallQuiz } from '../lib/gemini';
import { useGenState, updateGenStatus } from '../lib/store';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const DocumentExtraction = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);

  // Generation States
  const [genNotes, setGenNotes] = useState(true);
  const [genFlashcards, setGenFlashcards] = useState(true);
  const [genQuiz, setGenQuiz] = useState(true);
  
  const { statusNotes, statusFlashcards, statusQuiz } = useGenState();
  const [errorMsg, setErrorMsg] = useState('');

  const processFile = async (file) => {
    if (!file) return;
    setIsProcessing(true);
    setHasExtracted(false);
    updateGenStatus('statusNotes', 'idle');
    updateGenStatus('statusFlashcards', 'idle');
    updateGenStatus('statusQuiz', 'idle');
    setErrorMsg('');

    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          fullText += strings.join(' ') + '\n';
        }
        
        localStorage.setItem('lumina_raw_text', fullText);
      } else {
        const text = await file.text();
        localStorage.setItem('lumina_raw_text', text);
      }
      setHasExtracted(true);
    } catch (error) {
      console.error("Extraction error details:", error);
      setErrorMsg(`Failed to extract text: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateMaterials = () => {
    const rawText = localStorage.getItem('lumina_raw_text');
    if (!rawText) return;

    setErrorMsg('');
    
    // Asynchronous separate generation to prevent 503 timeouts
    if (genNotes) {
      updateGenStatus('statusNotes', 'loading');
      generateStudyNotes(rawText)
        .then(notes => {
          localStorage.setItem('lumina_structured_notes', JSON.stringify(notes));
          updateGenStatus('statusNotes', 'done');
        })
        .catch(err => {
          console.error(err);
          updateGenStatus('statusNotes', 'error');
        });
    }

    if (genFlashcards) {
      updateGenStatus('statusFlashcards', 'loading');
      generateFlashcards(rawText)
        .then(cards => {
          localStorage.setItem('lumina_flashcards', JSON.stringify(cards.vocabulary));
          updateGenStatus('statusFlashcards', 'done');
        })
        .catch(err => {
          console.error(err);
          updateGenStatus('statusFlashcards', 'error');
        });
    }

    if (genQuiz) {
      updateGenStatus('statusQuiz', 'loading');
      
      generateActiveRecallQuiz(rawText)
        .then(quiz => {
          localStorage.setItem('lumina_cached_quiz', JSON.stringify(quiz));
          updateGenStatus('statusQuiz', 'done');
        })
        .catch(err => {
          console.error(err);
          updateGenStatus('statusQuiz', 'error');
        });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  // Render logic continues below
  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>Generator Hub</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Upload your academic material to synthesize study sets.</p>
      </div>

      <div 
        className={`glass-panel ${isDragging ? 'dragging' : ''}`} 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{ 
          padding: '3rem 2rem', 
          textAlign: 'center', 
          marginBottom: '2rem',
          border: isDragging ? '2px dashed var(--accent)' : '1px solid var(--glass-border)',
          transition: 'all 0.3s ease',
          maxWidth: '600px',
          margin: '0 auto 2rem auto'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{isProcessing ? '⚙️' : '📥'}</div>
        
        <input 
          type="file" id="file-upload" accept=".pdf,.txt,.md" 
          style={{ display: 'none' }} 
          onChange={(e) => processFile(e.target.files[0])} 
        />
        
        <h3 style={{ marginBottom: '0.5rem' }}>
          {isProcessing ? 'Processing Document...' : 'Drag & Drop File Here'}
        </h3>
        
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Supported formats: PDF, TXT, MD
        </p>
        
        <label htmlFor="file-upload" className="glow-btn" style={{ display: 'inline-block' }}>
          Browse Files
        </label>
      </div>

      {errorMsg && <div className="glass-panel" style={{ padding: '1rem', color: '#ff7675', maxWidth: '600px', margin: '0 auto 2rem auto' }}>{errorMsg}</div>}

      {hasExtracted && (
        <div className="glass-panel fade-in" style={{ padding: '1rem', background: 'rgba(46, 204, 113, 0.1)', border: '1px solid #2ecc71', color: '#2ecc71', textAlign: 'center', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          ✅ Document Extracted Successfully! Configure your modules below.
        </div>
      )}

      {(hasExtracted || localStorage.getItem('lumina_raw_text')) && (
        <div className="glass-panel fade-in" style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}>Material Selection</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={genNotes} onChange={(e) => setGenNotes(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '1.1rem' }}>Study Notes</span>
              </label>
              {statusNotes === 'loading' && <span style={{ color: '#f1c40f' }}>Generating <span className="hourglass-spin">⏳</span></span>}
              {statusNotes === 'done' && <span style={{ color: '#2ecc71' }}>Done ✅</span>}
              {statusNotes === 'error' && <span style={{ color: '#e74c3c' }}>Failed ❌</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={genFlashcards} onChange={(e) => setGenFlashcards(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '1.1rem' }}>Vocabulary Flashcards</span>
              </label>
              {statusFlashcards === 'loading' && <span style={{ color: '#f1c40f' }}>Generating <span className="hourglass-spin">⏳</span></span>}
              {statusFlashcards === 'done' && <span style={{ color: '#2ecc71' }}>Done ✅</span>}
              {statusFlashcards === 'error' && <span style={{ color: '#e74c3c' }}>Failed ❌</span>}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={genQuiz} onChange={(e) => setGenQuiz(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                <span style={{ fontSize: '1.1rem' }}>Active Recall Quiz</span>
              </label>
              {statusQuiz === 'loading' && <span style={{ color: '#f1c40f' }}>Generating <span className="hourglass-spin">⏳</span></span>}
              {statusQuiz === 'done' && <span style={{ color: '#2ecc71' }}>Done ✅</span>}
              {statusQuiz === 'error' && <span style={{ color: '#e74c3c' }}>Failed ❌</span>}
            </div>
          </div>

          <button 
            className="glow-btn" 
            style={{ width: '100%' }} 
            onClick={handleGenerateMaterials}
            disabled={(!genNotes && !genFlashcards && !genQuiz) || [statusNotes, statusFlashcards, statusQuiz].includes('loading')}
          >
            {[statusNotes, statusFlashcards, statusQuiz].includes('loading') ? 'Synthesizing Async...' : 'Queue Selected Materials'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentExtraction;
