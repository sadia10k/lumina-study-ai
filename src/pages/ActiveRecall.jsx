import React, { useState, useEffect } from 'react';
import { generateActiveRecallQuiz } from '../lib/gemini';

const ActiveRecall = () => {
  const [quizData, setQuizData] = useState(null);

  // Active Quiz State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const cachedQuiz = localStorage.getItem('lumina_cached_quiz');
    if (cachedQuiz) {
      setQuizData(JSON.parse(cachedQuiz));
    }
  }, []);

  const handleOptionSelect = (idx) => {
    if (showExplanation || isFinished) return; // Prevent changing answer
    setSelectedOption(idx);
    setShowExplanation(true);
    
    const correctIdx = quizData[currentQuestionIdx].correctAnswerIndex;
    if (idx === correctIdx) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quizData.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setShowExplanation(false);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleGenerateDifferent = async () => {
    const rawText = localStorage.getItem('lumina_raw_text');
    if (!rawText) return;
    
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const newQuiz = await generateActiveRecallQuiz(rawText, 5, quizData || []);
      localStorage.setItem('lumina_cached_quiz', JSON.stringify(newQuiz));
      setQuizData(newQuiz);
      
      // Reset quiz internal UI
      setCurrentQuestionIdx(0);
      setScore(0);
      setIsFinished(false);
      setShowExplanation(false);
      setSelectedOption(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Active Recall Engine</h1>
        {quizData && (
          <button className="glow-btn" style={{ fontSize: '0.9rem', padding: '8px 16px' }} onClick={handleGenerateDifferent} disabled={isGenerating}>
            {isGenerating ? <span>Synthesizing... <span className="hourglass-spin">⏳</span></span> : 'Generate New Questions'}
          </button>
        )}
      </div>
      
      {errorMsg && <div className="glass-panel" style={{ padding: '1rem', color: '#ff7675', marginBottom: '1rem' }}>{errorMsg}</div>}

      {!quizData && (
        <div className="glass-panel empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have an active quiz session. Go to the Generator Hub to parse a document!</p>
        </div>
      )}

      {quizData && !isFinished && quizData.length > 0 && (
        <div className="glass-panel" style={{ padding: '3rem', margin: '0 auto', maxWidth: '800px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            <span>Question {currentQuestionIdx + 1} of {quizData.length}</span>
            <span>Score: {score}</span>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{quizData[currentQuestionIdx].question}</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {quizData[currentQuestionIdx].options.map((opt, idx) => {
              
              let btnClass = "modern-input quiz-option";
              let btnStyle = { textAlign: 'left', padding: '1rem' };
              
              if (showExplanation) {
                if (idx === quizData[currentQuestionIdx].correctAnswerIndex) {
                  btnClass += " correct";
                } else if (idx === selectedOption) {
                  btnClass += " incorrect";
                }
              }

              return (
                <button 
                  key={idx} 
                  className={btnClass}
                  style={btnStyle}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={showExplanation}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="fade-in" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(108, 92, 231, 0.1)', borderRadius: '8px' }}>
              <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Explanation</h4>
              <p style={{ color: 'var(--text-secondary)' }}>{quizData[currentQuestionIdx].explanation}</p>
              
              <button className="glow-btn" style={{ marginTop: '1.5rem' }} onClick={handleNextQuestion}>
                {currentQuestionIdx < quizData.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          )}
        </div>
      )}

      {isFinished && (
        <div className="glass-panel fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>Quiz Completed!</h2>
          <p style={{ fontSize: '1.2rem', margin: '1rem 0' }}>You scored {score} out of {quizData.length}</p>
          <button className="glow-btn" style={{ marginTop: '1rem' }} onClick={handleGenerateDifferent} disabled={isGenerating}>
            {isGenerating ? <span>Synthesizing... <span className="hourglass-spin">⏳</span></span> : 'Generate New Questions'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveRecall;
